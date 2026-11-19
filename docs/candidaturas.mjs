// Referencias públicas independientes de las actas y del catálogo de demostración.
export const nominations = {
  "alcaldia-centro": {
    source: "Consulta de alcaldía en Ecuavisa",
    url: "https://davidmunoz-create.github.io/listacandidatosalcaldia/",
    verification: "Nombres y listas cotejados con las cinco fichas de Voto Informado compartidas para Urdaneta.",
    entries: [
      ["1-91 · UNIR", "Leyton Moreira Vasquez"],
      ["3-2 · La Fuerza del Pueblo", "Leydi Alava"],
      ["6 · Partido Social Cristiano", "Doris Zambrano"],
      ["7 · Movimiento Acción Democrática Nacional, ADN", "Mayra Macias Fernandez"],
      ["100 · Movimiento Crecer", "Blanca Najera"],
    ],
  },
  "concejo-urbano": {
    verification: "Nómina cotejada con las cinco fichas de concejalía urbana compartidas para Urdaneta.",
    roles: ["Principal", "Suplente"],
    entries: [
      ["1-91 · UNIR", "Alfonso Murillo Ripalda", "Guisell Castro"],
      ["3-2 · La Fuerza del Pueblo", "Leodan Salas", "Anayeli Pacheco"],
      ["6 · Partido Social Cristiano", "Emilia Subia", "Jonathan Miranda"],
      ["7 · Movimiento Acción Democrática Nacional, ADN", "Ketty Leon", "Erick Flores"],
      ["100 · Movimiento Crecer", "Karla Salazar", "Juan Burgos"],
    ],
  },
  "concejo-rural": {
    verification: "Nómina cotejada con las cinco fichas de concejalía rural compartidas para Urdaneta.",
    roles: ["Principal", "Suplente"],
    lists: [
      ["1-91 · UNIR", [
        ["Jacqueline Subia Vera", "Mauricio Peralta"],
        ["Wladimir Cordova", "Johana Ramirez"],
        ["Eliana Poveda", "Felix Orozco"],
        ["Javier Vera", "Samantha Cevallos Montero"],
      ]],
      ["3-2 · La Fuerza del Pueblo", [
        ["Naidely Poma", "Luiggi Luiz"],
        ["Holger Paredes", "Ketty Cevallos"],
        ["Cecia Vera", "Walter Arreaga"],
        ["Daniel Miranda", "Sonia Mera"],
      ]],
      ["6 · Partido Social Cristiano", [
        ["Jimmy Zambrano", "Lourdes Almeida"],
        ["Silvia Arroyo", "Mario Guerrero"],
        ["Geovanny Contreras", "Susana Mosquera"],
        ["Susana Ponce", "Junior Bustamante"],
      ]],
      ["7 · Movimiento Acción Democrática Nacional, ADN", [
        ["Angel Baños Garofalo", "Genesis Paredes"],
        ["Eloisa Calderon", "Denis Beltran"],
        ["Luis Portilla", "Denis Guerrero"],
        ["Viviana Bohorquez", "Joffre Magallon"],
      ]],
      ["100 · Movimiento Crecer", [
        ["Freddy Zapata", "Joselyn Calderon"],
        ["Joice Quiñonez", "Juan Jimenez"],
        ["Elkin Montero Bajaña", "Maria Lozano"],
        ["Rosa Leon", "Ariel Carrera"],
      ]],
    ],
  },
  "junta-centro": {
    verification: "Nómina cotejada con las cinco fichas de la Junta Parroquial Rural de Ricaurte.",
    roles: ["Vocal principal", "Suplente"],
    lists: [
      ["1-91 · UNIR", [
        ["Cristhian Lara Guerrero", "Rosa Rojas"],
        ["Erika Chamorro Bustos", "Eduardo Echeverria"],
        ["Nixon Cabrera", "Diana Quintanilla"],
        ["Marjorie Jaen Bohorquez", "Milton Villacres"],
        ["Jimmy Vera Sanchez", "Niurka Sarela Santillan"],
      ]],
      ["3-2 · La Fuerza del Pueblo", [
        ["Carlos Ube", "Kerly Litardo"],
        ["Eoris Sanchez", "Edwin Uve"],
        ["Edi Perez", "Diana del Rosario"],
        ["Vianca Ube", "Kleber Caballero"],
        ["Jose Suarez", "Liliana Navarrete"],
      ]],
      ["6 · Partido Social Cristiano", [
        ["Betty Solis", "Anthony Guapulema"],
        ["Bryan Barahona", "Mercedes Varas"],
        ["Norma Coello", "Miguel Dumet"],
        ["Carlos Campoamor", "Shirley Jacome"],
        ["Olga Cedeño", "Alder Navarro"],
      ]],
      ["7 · Movimiento Acción Democrática Nacional, ADN", [
        ["Mirian Aguilar", "Jhonny Armijos"],
        ["Jonathan Ramirez", "Narcisa Muñoz"],
        ["Eva Rosero", "Dennys Arias"],
        ["Jostin Aldaz", "Jamileth Montero"],
        ["Marilin Ramirez", "Angello Gavilanes"],
      ]],
      ["100 · Movimiento Crecer", [
        ["Ruben Suarez", "Wendy España"],
        ["Kassandra Pasos Luna", "Jonathan Roche"],
        ["Luis Toapanta", "Geraldine Arevalo"],
        ["Monica Luiz", "Aldahir Cervantes"],
        ["Leyton Villegas", "Mercy Averos"],
      ]],
    ],
  },
  "prefectura-norte": {
    roles: ["Prefectura", "Viceprefectura"],
    source: "Referencia de los binomios publicados para Los Ríos",
    url: "https://es.wikipedia.org/wiki/Elecciones_provinciales_de_Los_R%C3%ADos_de_2026",
    entries: [
      ["1-91 · UNIR", "Rubén Avendaño Iturralde", "María Luisa Coello"],
      ["2 · Unidad Popular", "José Luis Álvarez Yépez", "Andrea Janela Castillo Arboleda"],
      ["6 · Partido Social Cristiano", "Johnny Terán Barragán", "Mayra Díaz Sandoya"],
      ["7 · Acción Democrática Nacional", "Eduardo Mendoza Palma", "Tatiana Donoso Tovar"],
      ["100 · Movimiento Crecer", "Vanessa Freire Vergara", "Mario Mora Carriel"],
    ],
  },
};
