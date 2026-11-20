import { demo, election } from "./config.mjs";
import { openStore } from "./store.mjs";

const $ = (id) => document.getElementById(id);
const number = new Intl.NumberFormat("es-EC");
const percent = new Intl.NumberFormat("es-EC", { style: "percent", maximumFractionDigits: 1 });
const capture = new URLSearchParams(location.search).get("vista") === "captura";
const offices = [...new Set(election.contests.map(({ office }) => office))];
let office = offices[0];
let records = {};
let ready = false;
let loadedRevision = 0;
let dirty = false;
let saving = false;
let allowed = demo;
let store;

function element(tag, content, className) {
  const node = document.createElement(tag);
  node.textContent = content;
  if (className) node.className = className;
  return node;
}

function options(id, entries) {
  $(id).replaceChildren(...entries.map(([value, label]) => new Option(label, value)));
}

function contestsFor(selectedOffice) {
  return election.contests.filter((contest) => contest.office === selectedOffice);
}

function fillScopes(id, selectedOffice) {
  options(id, contestsFor(selectedOffice).map(({ id, scope }) => [id, scope]));
}

function contestFor(select) {
  return election.contests.find(({ id }) => id === $(select).value);
}

function recordId(contest, index) {
  return `${contest.id}_${demo ? Number(index) + 1 : index.toUpperCase()}`;
}

function countsFor(contest) {
  return [...contest.candidates, ["blank", "Votos blancos"], ["null", "Votos nulos"]];
}

function renderTabs() {
  $("tabs").replaceChildren(...offices.map((name) => {
    const button = element("button", name);
    button.setAttribute("aria-pressed", String(office === name));
    button.onclick = () => {
      office = name;
      fillScopes("scope", office);
      renderTabs();
      renderDashboard();
      $("tabs").querySelector("[aria-pressed=true]").focus();
    };
    return button;
  }));
}

function renderComposition(valid, blank, invalid) {
  const total = valid + blank + invalid;
  const validEnd = total ? valid / total * 100 : 0;
  const blankEnd = total ? (valid + blank) / total * 100 : 0;
  const donut = $("vote-donut");
  donut.classList.toggle("has-votes", total > 0);
  donut.style.setProperty("--valid-end", `${validEnd}%`);
  donut.style.setProperty("--blank-end", `${blankEnd}%`);
  $("vote-total").textContent = number.format(total);
  const groups = [
    ["valid", "Válidos", valid],
    ["blank", "Blancos", blank],
    ["invalid", "Nulos", invalid],
  ];
  $("vote-breakdown").replaceChildren(...groups.map(([kind, label, count]) => {
    const row = element("li", "", `vote-${kind}`);
    row.append(
      element("span", label, "vote-label"),
      element("strong", number.format(count)),
      element("span", total ? percent.format(count / total) : "—", "vote-share"),
    );
    return row;
  }));
}

function renderDashboard() {
  if (!ready) return;
  const contest = contestFor("scope");
  const report = demo
    ? contest.stations.map((_, index) => records[recordId(contest, index)]).filter(Boolean)
    : Object.entries(records).filter(([id]) => id.startsWith(`${contest.id}_`)).map(([, record]) => record);
  const candidates = contest.candidates;
  const totals = Object.fromEntries(countsFor(contest).map(([id]) => [
    id,
    report.reduce((sum, record) => {
      const value = record.votes[id];
      return sum + (Number.isInteger(value) && value >= 0 && value <= 1000000 ? value : 0);
    }, 0),
  ]));
  const valid = candidates.reduce((sum, [id]) => sum + totals[id], 0);
  renderComposition(valid, totals.blank, totals.null);
  const metrics = [
    ["Actas registradas", number.format(report.length)],
    ...(demo ? [["Avance de carga", percent.format(report.length / contest.stations.length)]] : []),
    ["Votos válidos", number.format(valid)],
    ["Votos blancos", number.format(totals.blank)],
    ["Votos nulos", number.format(totals.null)],
  ];
  $("stats").replaceChildren(...metrics.map(([label, value]) => {
    const card = element("div", "", "stat");
    card.append(element("span", label), element("strong", value));
    return card;
  }));
  const updated = report.reduce((latest, item) => Math.max(latest, item.updatedAt ?? 0), 0);
  $("updated").textContent = updated ? `Última carga: ${new Date(updated).toLocaleString("es-EC")}` : "";
  const ranking = candidates
    .map(([id, name]) => {
      const share = valid ? totals[id] / valid : 0;
      const item = element("div", "", "rank");
      const line = element("div", "", "rank-line");
      const details = contest.members[id];
      const label = details?.label ?? name;
      const inline = details?.groups.length === 1 ? details.groups[0] : "";
      const value = valid ? `${number.format(totals[id])} votos · ${percent.format(share)}` : report.length ? "0 votos" : "—";
      const heading = element("div", "", "rank-heading");
      heading.append(element("strong", label));
      if (inline) heading.append(element("span", ` · ${inline}`, "rank-inline"));
      line.append(heading, element("span", value));
      const bar = document.createElement("progress");
      bar.setAttribute("aria-label", `Porcentaje de votos válidos para ${name}`);
      bar.max = 1;
      bar.value = share;
      item.append(line);
      if (details?.groups.length > 1) {
        const members = element("ol", "", "rank-members");
        members.append(...details.groups.map((group) => element("li", group)));
        item.append(members);
      }
      item.append(bar);
      return item;
    });
  if (!report.length) {
    ranking.unshift(element("p", "Aún no hay actas para esta circunscripción.", "chart-empty"));
  }
  $("ranking").replaceChildren(...ranking);
}

function fillStations() {
  const contest = contestFor("capture-scope");
  options("station", contest.stations.map((name, index) => [String(index), name]));
  loadEntry();
}

function currentRecord() {
  return records[recordId(contestFor("capture-scope"), stationCode())];
}

function stationCode() {
  return demo ? $("station").value : $("station-code").value;
}

function loadEntry() {
  const contest = contestFor("capture-scope");
  const record = currentRecord();
  loadedRevision = record?.revision ?? 0;
  dirty = false;
  $("reload-entry").hidden = true;
  $("record-state").textContent = record ? `Acta publicada · revisión ${loadedRevision}`
    : stationCode() ? "Acta pendiente" : "Ingresa el identificador de la junta.";
  $("publish").textContent = record ? "Publicar corrección" : "Publicar acta";
  $("counts").replaceChildren(...countsFor(contest).map(([id, name]) => {
    const label = element("label", name);
    const input = document.createElement("input");
    Object.assign(input, {
      type: "number", min: "0", max: "1000000", step: "1", required: true,
      name: id, inputMode: "numeric", value: record?.votes[id] ?? "",
    });
    label.append(input);
    return label;
  }));
  updateTotal();
}

function updateTotal() {
  const sum = [...$("counts").querySelectorAll("input")].reduce((total, input) => total + (input.valueAsNumber || 0), 0);
  $("entry-total").textContent = `Total de votos del acta: ${number.format(sum)}`;
}

function updateAccess() {
  $("entry").hidden = !allowed || !ready;
}

function feedback(message) {
  $("feedback").textContent = message;
}

function setupOperatorManager() {
  const form = $("invite-operator");
  const message = $("operator-feedback");
  async function setPermission(email, enabled) {
    try {
      await store.setOperator(email, enabled);
      message.textContent = enabled
        ? "Correo autorizado. La persona ya puede crear su cuenta en Captura."
        : "Se retiró el permiso para registrar actas.";
      await renderOperators();
    } catch {
      message.textContent = "No se pudo actualizar el acceso.";
    }
  }
  async function renderOperators() {
    try {
      const operators = await store.listOperators();
      $("operator-list").replaceChildren(...operators.map(([email, enabled]) => {
        const row = element("li", "");
        const button = element("button", enabled ? "Revocar acceso" : "Volver a autorizar", "secondary");
        button.type = "button";
        button.setAttribute("aria-label", `${button.textContent} de ${email}`);
        button.onclick = async () => {
          button.disabled = true;
          await setPermission(email, !enabled);
          button.disabled = false;
        };
        row.append(element("span", `${email} · ${enabled ? "Autorizado" : "Revocado"}`), button);
        return row;
      }));
    } catch {
      message.textContent = "No se pudo cargar la lista de operadores.";
    }
  }
  form.onsubmit = async (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim().toLowerCase();
    if (email.includes("/")) {
      message.textContent = "El correo contiene un carácter incompatible.";
      return;
    }
    const button = form.querySelector("button");
    button.disabled = true;
    await setPermission(email, true);
    button.disabled = false;
  };
  return renderOperators;
}

function setSaving(value) {
  saving = value;
  for (const control of $("entry").querySelectorAll("select, input, button")) control.disabled = value;
  $("logout").disabled = value;
}

async function publish(event) {
  event.preventDefault();
  if (saving || !allowed || !ready) return;
  const id = recordId(contestFor("capture-scope"), stationCode());
  const votes = Object.fromEntries([...$("counts").querySelectorAll("input")].map((input) => [input.name, input.valueAsNumber]));
  const station = demo ? $("station").selectedOptions[0].textContent : stationCode().toUpperCase();
  if (!confirm(`¿${$("publish").textContent} para ${station}?`)) return;
  setSaving(true);
  feedback("Publicando…");
  try {
    await store.save(id, votes, loadedRevision);
    dirty = false;
    if (currentRecord()?.revision !== loadedRevision) loadEntry();
    feedback("Acta publicada correctamente.");
  } catch (error) {
    if (error.name === "RevisionConflict") $("reload-entry").hidden = false;
    feedback(error.code ? "No se pudo publicar. Revisa la conexión y los permisos." : error.message);
  } finally {
    setSaving(false);
  }
}

function setupCapture() {
  $("demo-station").hidden = !demo;
  $("live-station").hidden = demo;
  $("station-code").required = !demo;
  $("station-code").oninput = loadEntry;
  options("capture-office", offices.map((name) => [name, name]));
  fillScopes("capture-scope", offices[0]);
  fillStations();
  $("capture-office").onchange = () => {
    fillScopes("capture-scope", $("capture-office").value);
    fillStations();
  };
  $("capture-scope").onchange = fillStations;
  $("station").onchange = loadEntry;
  $("reload-entry").onclick = () => {
    if (!dirty || confirm("¿Descartar los cambios sin publicar y cargar la versión más reciente?")) {
      loadEntry();
      feedback("");
    }
  };
  $("counts").oninput = () => {
    dirty = true;
    updateTotal();
  };
  $("entry").onsubmit = publish;
  if (demo) return;
  const renderOperators = setupOperatorManager();
  function showAccess(user, permissions) {
    allowed = permissions.allowed;
    if (ready) loadEntry();
    updateAccess();
    $("login").hidden = Boolean(user);
    $("logout").hidden = !user;
    $("verify-operator").hidden = !permissions.needsVerification;
    $("manage-operators").hidden = !permissions.manager;
    if (permissions.manager) renderOperators();
    else $("operator-list").replaceChildren();
    feedback(user && !allowed && !permissions.needsVerification
      ? "Esta cuenta no está habilitada para publicar actas." : "");
  }
  store.watchUser(showAccess, () => {
    allowed = false;
    updateAccess();
    feedback("No se pudieron verificar los permisos del operador.");
  });
  $("register-operator").onclick = async () => {
    const form = $("login");
    if (!form.reportValidity()) return;
    const { email, password } = Object.fromEntries(new FormData(form));
    if (password.length < 6) {
      feedback("Elige una contraseña de al menos seis caracteres.");
      return;
    }
    $("register-operator").disabled = true;
    try {
      await store.register(email.trim().toLowerCase(), password);
      form.reset();
    } catch {
      feedback("No se pudo completar el registro. Si ya tienes cuenta, prueba a ingresar o restablecer la contraseña.");
    } finally {
      $("register-operator").disabled = false;
    }
  };
  $("resend-verification").onclick = async () => {
    try {
      await store.resendVerification();
      feedback("Enlace de verificación enviado.");
    } catch {
      feedback("No se pudo reenviar el enlace. Intenta nuevamente en unos minutos.");
    }
  };
  $("check-verification").onclick = async () => {
    try {
      const permissions = await store.refreshAccess();
      showAccess(true, permissions);
      if (permissions.needsVerification) feedback("Firebase todavía no confirma la verificación del correo.");
    } catch {
      feedback("No se pudo comprobar la verificación del correo.");
    }
  };
  $("login").onsubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    const { email, password } = Object.fromEntries(new FormData(form));
    button.disabled = true;
    feedback("Ingresando…");
    try {
      await store.login(email, password);
      form.reset();
    } catch {
      feedback("No se pudo ingresar. Verifica el correo, la contraseña y la conexión.");
    } finally {
      button.disabled = false;
    }
  };
  $("reset-password").onclick = async () => {
    const email = $("login").elements.email;
    if (!email.reportValidity()) return;
    try {
      await store.resetPassword(email.value);
      feedback("Si la cuenta está habilitada, recibirás un enlace para restablecer tu contraseña.");
    } catch {
      feedback("No se pudo solicitar el enlace. Inténtalo de nuevo.");
    }
  };
  $("logout").onclick = async () => {
    try {
      await store.logout();
    } catch {
      feedback("No se pudo cerrar la sesión.");
    }
  };
}

async function start() {
  $("election").textContent = election.name;
  $(capture ? "capture-link" : "public-link").setAttribute("aria-current", "page");
  if (demo) {
    $("public-link").href = "?demo";
    $("capture-link").href = "?vista=captura&demo";
    $("notice").textContent = "Demostración con datos ficticios. Las actas se guardan en este navegador y se comparten entre sus pestañas.";
    $("notice").hidden = false;
  }
  if (capture) {
    $("title").textContent = "Captura de actas";
    $("subtitle").textContent = "Registra o corrige los votos de una mesa.";
    $("capture").hidden = false;
  }
  try {
    store = await openStore();
    if (capture) setupCapture();
    else {
      renderTabs();
      fillScopes("scope", office);
      $("scope").onchange = renderDashboard;
    }
    store.listen((data, cached) => {
      records = data;
      ready = true;
      $("connection").textContent = demo ? "Modo demostración" : cached ? "Datos locales · esperando conexión" : "En vivo";
      if (capture) {
        if (!dirty && !saving) loadEntry();
        if (dirty && !saving && (currentRecord()?.revision ?? 0) !== loadedRevision) {
          $("reload-entry").hidden = false;
          feedback("El acta cambió en otra sesión. Carga la última versión antes de publicar.");
        }
        updateAccess();
      } else {
        $("dashboard").hidden = false;
        renderDashboard();
      }
    }, () => {
      ready = false;
      $("connection").textContent = "No se pudieron sincronizar los resultados. Recarga la página.";
      if (capture) updateAccess();
    });
  } catch (error) {
    $("connection").textContent = `No se pudo iniciar el sistema. ${error.message}`;
  }
}

start();
