import { demo, election, firebaseConfig } from "./config.mjs";

const sample = {
  "alcaldia-centro_1": { votes: { a: 125, b: 98, c: 41, blank: 7, null: 5 }, revision: 1 },
  "prefectura-norte_1": { votes: { a: 99, b: 85, c: 54, blank: 12, null: 7 }, revision: 1 },
  "junta-centro_1": { votes: { a: 78, b: 62, c: 16, blank: 4, null: 6 }, revision: 1 },
};

export async function openStore() {
  if (demo) {
    const key = `actas:${election.id}`;
    const read = () => JSON.parse(localStorage.getItem(key)) ?? sample;
    let notify;
    return {
      listen(onData) {
        notify = () => onData(read(), false);
        window.addEventListener("storage", (event) => {
          if (event.key === key || event.key === null) notify();
        });
        notify();
      },
      async save(id, votes, revision) {
        const records = read();
        checkRevision(records[id], revision);
        records[id] = { votes, revision: revision + 1, updatedAt: Date.now() };
        localStorage.setItem(key, JSON.stringify(records));
        notify();
      },
    };
  }

  if (!firebaseConfig.projectId || !firebaseConfig.apiKey || !firebaseConfig.appId) {
    throw new Error("Completa la configuración web de Firebase.");
  }
  const [{ initializeApp }, authApi, dbApi] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js"),
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = authApi.getAuth(app);
  const db = dbApi.getFirestore(app);
  const records = dbApi.collection(db, "elections", election.id, "results");
  const operatorEmails = dbApi.collection(db, "operatorEmails");
  async function access(user) {
    if (!user) return { allowed: false, manager: false, needsVerification: false };
    const role = await dbApi.getDocFromServer(dbApi.doc(db, "operators", user.uid));
    if (role.exists()) return { allowed: true, manager: role.data().manager === true, needsVerification: false };
    const invitation = user.email && await dbApi.getDocFromServer(dbApi.doc(operatorEmails, user.email));
    const invited = invitation?.data()?.enabled === true;
    return { allowed: invited && user.emailVerified, manager: false, needsVerification: invited && !user.emailVerified };
  }
  return {
    listen(onData, onError) {
      dbApi.onSnapshot(records, { includeMetadataChanges: true }, (snapshot) => {
        const data = Object.fromEntries(snapshot.docs.map((item) => {
          const value = item.data();
          return [item.id, { ...value, updatedAt: value.updatedAt?.toMillis() }];
        }));
        onData(data, snapshot.metadata.fromCache);
      }, onError);
    },
    watchUser(callback, onError) {
      authApi.onAuthStateChanged(auth, async (user) => {
        try {
          const permissions = await access(user);
          if (auth.currentUser === user) callback(user, permissions);
        } catch (error) {
          if (auth.currentUser === user) onError(error);
        }
      }, onError);
    },
    login: (email, password) => authApi.signInWithEmailAndPassword(auth, email, password),
    async register(email, password) {
      const { user } = await authApi.createUserWithEmailAndPassword(auth, email, password);
      if ((await access(user)).needsVerification) await authApi.sendEmailVerification(user);
    },
    resendVerification: () => authApi.sendEmailVerification(auth.currentUser),
    async refreshAccess() {
      const user = auth.currentUser;
      await authApi.reload(user);
      await authApi.getIdToken(user, true);
      return access(user);
    },
    async listOperators() {
      const snapshot = await dbApi.getDocsFromServer(operatorEmails);
      return snapshot.docs.map((item) => [item.id, item.data().enabled]);
    },
    setOperator: (email, enabled) => dbApi.setDoc(dbApi.doc(operatorEmails, email), { enabled }),
    resetPassword: (email) => authApi.sendPasswordResetEmail(auth, email),
    logout: () => authApi.signOut(auth),
    save(id, votes, revision) {
      const ref = dbApi.doc(records, id);
      return dbApi.runTransaction(db, async (transaction) => {
        checkRevision((await transaction.get(ref)).data(), revision);
        transaction.set(ref, { votes, revision: revision + 1, updatedAt: dbApi.serverTimestamp() });
      });
    },
  };
}

function checkRevision(record, expected) {
  if ((record?.revision ?? 0) !== expected) {
    const error = new Error("El acta cambió. Carga la última versión y revisa los votos antes de publicar.");
    error.name = "RevisionConflict";
    throw error;
  }
}
