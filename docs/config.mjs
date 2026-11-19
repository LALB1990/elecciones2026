// Pega la configuración de la aplicación web de Firebase y cambia demo a false.
export const demo = true;
export const firebaseConfig = {
  projectId: "elecciones2026-lalb",
  appId: "1:375098298897:web:0aea635eda5f092b8197b0",
  apiKey: "AIzaSyAxGIvbZHQVK_vz4aQcZ2LytPp7fRN2esk",
  authDomain: "elecciones2026-lalb.firebaseapp.com",
};

export const election = {
  id: "urdaneta-demo",
  name: "Urdaneta · Los Ríos · Ecuador",
  contests: [
    {
      id: "alcaldia-centro", office: "Alcaldía", scope: "Cantón Urdaneta",
      stations: ["Mesa 001", "Mesa 002", "Mesa 003", "Mesa 004"],
      candidates: { a: "Candidatura A", b: "Candidatura B", c: "Candidatura C" },
    },
    {
      id: "concejo-urbano", office: "Concejalía urbana", scope: "Catarama",
      stations: ["Mesa 001", "Mesa 002"],
      candidates: { a: "Lista A", b: "Lista B" },
      roster: {
        a: [
          { role: "Principal 1", person: "Persona de ejemplo A" },
          { role: "Suplente 1", person: "Persona de ejemplo B" },
        ],
      },
    },
    {
      id: "concejo-rural", office: "Concejalía rural", scope: "Ricaurte",
      stations: ["Mesa 001", "Mesa 002", "Mesa 003"],
      candidates: { a: "Lista A", b: "Lista B" },
    },
    {
      id: "prefectura-norte", office: "Prefectura", scope: "Los Ríos · Solo mesas de Urdaneta",
      stations: ["Mesa 001", "Mesa 002", "Mesa 003", "Mesa 004"],
      candidates: { a: "Candidatura D", b: "Candidatura E", c: "Candidatura F" },
      roster: {
        a: [
          { role: "Prefectura", person: "Persona de ejemplo C" },
          { role: "Viceprefectura", person: "Persona de ejemplo D" },
        ],
      },
    },
    {
      id: "junta-centro", office: "Junta parroquial", scope: "Parroquia rural Ricaurte",
      stations: ["Mesa 001", "Mesa 002", "Mesa 003"],
      candidates: { a: "Lista A", b: "Lista B", c: "Lista C" },
      roster: {
        a: [
          { role: "Vocal principal 1", person: "Persona de ejemplo E" },
          { role: "Vocal suplente 1", person: "Persona de ejemplo F" },
        ],
      },
    },
  ],
};
