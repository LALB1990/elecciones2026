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
  return `${contest.id}_${Number(index) + 1}`;
}

function countsFor(contest) {
  return [...Object.entries(contest.candidates), ["blank", "Votos blancos"], ["null", "Votos nulos"]];
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

function renderDashboard() {
  if (!ready) return;
  const contest = contestFor("scope");
  const report = contest.stations.map((_, index) => records[recordId(contest, index)]).filter(Boolean);
  const candidates = Object.entries(contest.candidates);
  const totals = Object.fromEntries(countsFor(contest).map(([id]) => [
    id,
    report.reduce((sum, record) => {
      const value = record.votes[id];
      return sum + (Number.isInteger(value) && value >= 0 && value <= 1000000 ? value : 0);
    }, 0),
  ]));
  const valid = candidates.reduce((sum, [id]) => sum + totals[id], 0);
  const metrics = [
    ["Actas registradas", `${number.format(report.length)} / ${number.format(contest.stations.length)}`],
    ["Avance de carga", percent.format(report.length / contest.stations.length)],
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
  $("ranking").replaceChildren(...(report.length ? candidates
    .sort(([a], [b]) => totals[b] - totals[a])
    .map(([id, name]) => {
      const share = valid ? totals[id] / valid : 0;
      const item = element("div", "", "rank");
      const line = element("div", "", "rank-line");
      line.append(element("strong", name), element("span", `${number.format(totals[id])} votos · ${percent.format(share)}`));
      const bar = document.createElement("progress");
      bar.setAttribute("aria-label", `Porcentaje de votos válidos para ${name}`);
      bar.max = 1;
      bar.value = share;
      item.append(line, bar);
      return item;
    }) : [element("p", "Aún no hay actas registradas para esta circunscripción.", "empty")]));
}

function fillStations() {
  const contest = contestFor("capture-scope");
  options("station", contest.stations.map((name, index) => [String(index), name]));
  loadEntry();
}

function currentRecord() {
  return records[recordId(contestFor("capture-scope"), $("station").value)];
}

function loadEntry() {
  const contest = contestFor("capture-scope");
  const record = currentRecord();
  loadedRevision = record?.revision ?? 0;
  dirty = false;
  $("reload-entry").hidden = true;
  $("record-state").textContent = record ? `Acta publicada · revisión ${loadedRevision}` : "Acta pendiente";
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

function setSaving(value) {
  saving = value;
  for (const control of $("entry").querySelectorAll("select, input, button")) control.disabled = value;
  $("logout").disabled = value;
}

async function publish(event) {
  event.preventDefault();
  if (saving || !allowed || !ready) return;
  const id = recordId(contestFor("capture-scope"), $("station").value);
  const votes = Object.fromEntries([...$("counts").querySelectorAll("input")].map((input) => [input.name, input.valueAsNumber]));
  if (!confirm(`¿${$("publish").textContent} para ${$("station").selectedOptions[0].textContent}?`)) return;
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
  store.watchUser((user, canEdit) => {
    allowed = Boolean(canEdit);
    if (ready) loadEntry();
    updateAccess();
    $("login").hidden = Boolean(user);
    $("logout").hidden = !user;
    feedback(user && !canEdit ? "Esta cuenta no está habilitada para publicar actas." : "");
  }, () => feedback("No se pudieron verificar los permisos del operador."));
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
