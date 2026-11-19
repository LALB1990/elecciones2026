// Pega la configuración de la aplicación web de Firebase y cambia demo a false.
export const demo = true;
export const firebaseConfig = {};

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
      id: "prefectura-norte", office: "Prefectura", scope: "Los Ríos · Solo mesas de Urdaneta",
      stations: ["Mesa 001", "Mesa 002", "Mesa 003", "Mesa 004"],
      candidates: { a: "Candidatura D", b: "Candidatura E", c: "Candidatura F" },
    },
    {
      id: "junta-centro", office: "Junta parroquial", scope: "Parroquia rural Ricaurte",
      stations: ["Mesa 001", "Mesa 002", "Mesa 003"],
      candidates: { a: "Lista A", b: "Lista B", c: "Lista C" },
    },
  ],
};
