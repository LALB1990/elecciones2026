import { nominations } from "./candidaturas.mjs";

export const demo = new URLSearchParams(globalThis.location?.search).has("demo");
export const firebaseConfig = {
  projectId: "elecciones2026-lalb",
  appId: "1:375098298897:web:0aea635eda5f092b8197b0",
  apiKey: "AIzaSyAxGIvbZHQVK_vz4aQcZ2LytPp7fRN2esk",
  authDomain: "elecciones2026-lalb.firebaseapp.com",
};

function contest(id, office, scope, demoStations) {
  const nomination = nominations[id];
  const rows = nomination.lists ?? nomination.entries;
  const labels = Object.fromEntries(rows.map(([label, principal], index) => {
    const key = label.split(" · ")[0];
    const display = nomination.lists || id === "concejo-urbano" ? label : `${principal} · ${label}`;
    return [demo ? String.fromCharCode(97 + index) : key, demo ? `Opción ${index + 1}` : display];
  }));
  return {
    id, office, scope, candidates: labels,
    stations: demo ? Array.from({ length: demoStations }, (_, index) => `Mesa de prueba ${index + 1}`) : [],
  };
}

export const election = {
  id: demo ? "urdaneta-demo" : "urdaneta-seccionales-2027",
  name: "Urdaneta · Los Ríos, Ecuador",
  contests: [
    contest("alcaldia-centro", "Alcaldía", "Cantón Urdaneta", 4),
    contest("concejo-urbano", "Concejalía urbana", "Catarama", 2),
    contest("concejo-rural", "Concejalía rural", "Ricaurte", 3),
    contest("prefectura-norte", "Prefectura", "Los Ríos · Solo mesas de Urdaneta", 4),
    contest("junta-centro", "Junta parroquial", "Parroquia rural Ricaurte", 3),
  ],
};
