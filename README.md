# Resultados seccionales

Aplicación estática en HTML, CSS y JavaScript. El tablero público se actualiza con Cloud Firestore al publicar o corregir un acta de alcaldía, prefectura o junta parroquial. Cada acta corresponde a una mesa y una dignidad. El porcentaje de cada candidatura se calcula sobre los votos válidos de las actas registradas.

La cobertura es el cantón Urdaneta, provincia de Los Ríos, Ecuador. La alcaldía abarca las mesas del cantón, la junta parroquial abarca Ricaurte y la prefectura muestra el subtotal de las actas de Urdaneta. Catarama es la parroquia urbana y se incluye en los resultados del cantón. [División parroquial del GAD de Urdaneta](https://urdaneta.gob.ec/limites/).

Las concejalías urbana y rural se capturan por separado. Para cada lista o binomio, `roster` admite una nómina ordenada de pares `{ role, person }` bajo la misma clave que en `candidates`. La captura registra los votos que constan en el acta para la lista o candidatura. El tablero muestra los principales y suplentes como parte de la nómina, incluso antes de cargar el primer resultado.

## Demostración

Sirve la carpeta `docs` por HTTP. Con WampServer, abre `http://localhost/elecciones2026/docs/`. Otra opción es ejecutar `python -m http.server 8000 --directory docs` y abrir `http://localhost:8000/`.

Abre el sitio con `?demo` y entra en **Captura** desde el menú en otra pestaña del mismo navegador. Selecciona una mesa pendiente, llena todos los campos (incluye los ceros) y publica. Corrige la misma mesa para comprobar que se actualizan los totales y se conserva el número de actas registradas. Los votos de demostración se guardan en el navegador, con opciones genéricas.

## Activar Firebase

1. En un proyecto dedicado a este sistema, crea una aplicación web y la base de datos predeterminada de **Cloud Firestore** en modo producción.
2. Habilita **Correo electrónico/contraseña** en Authentication. Crea una cuenta por operador y copia su UID. En Firestore, crea el documento `operators/<UID>` para cada cuenta autorizada, con un campo como `enabled: true`. La existencia del documento habilita a la cuenta. Elimínalo para revocar el permiso.
3. Publica `firestore.rules` en la pestaña **Reglas** de Firestore o ejecuta `firebase deploy --only firestore:rules --project ID_DEL_PROYECTO`. Este comando reemplaza las reglas del proyecto indicado.
4. La configuración web del proyecto `elecciones2026-lalb` está en `docs/config.mjs`. La nómina en `docs/candidaturas.mjs` alimenta la captura y el tablero. Para corregir un acta, usa el mismo identificador de JRV y la misma dignidad. Si se repiten números de junta, incluye el recinto y el tipo de junta en el identificador. El tablero informa cuántas actas se han registrado. El avance porcentual requiere el total oficial de actas esperadas.
5. Comprueba con una sesión de operador y una ventana anónima que el tablero recibe el acta en vivo y que el acceso de escritura exige una cuenta autorizada. Usa un ID temporal para la prueba.

La configuración web del SDK puede estar en GitHub. Las contraseñas y las claves de cuentas de servicio se administran fuera del repositorio. El tablero y las actas de resultados son públicos. Las reglas verifican el operador, la revisión, la marca de tiempo y los votos blancos y nulos. La aplicación valida los votos por candidatura antes de enviar el acta. Al guardar, la transacción rechaza una corrección si otro operador modificó el acta desde que se abrió.

## Administrar operadores

En **Captura → Administrar recintos**, la cuenta administradora registra el nombre del recinto y un alias único, por ejemplo `UE-RICAURTE`. En el formulario de actas, el operador selecciona el recinto y escribe la junta y su tipo, por ejemplo `005-M`. La clave resultante es `UE-RICAURTE-005-M`.

En **Captura → Administrar operadores**, la cuenta administradora puede autorizar un correo o retirarle el permiso. La persona autorizada abre Captura, escribe su correo, elige una contraseña y pulsa **Crear mi cuenta**. Después de abrir el enlace de Firebase, debe pulsar **Ya verifiqué mi correo**. Retirar el permiso bloquea nuevas publicaciones y correcciones de esa cuenta. Para habilitar a un administrador inicial, asigna `manager: true` al documento `operators/<UID>` desde Firebase.

## GitHub Pages

Sube el repositorio a GitHub, abre **Settings → Pages**, elige **Deploy from a branch** y selecciona la rama `main` y la carpeta `/docs`. El enlace de captura es la URL publicada con `?vista=captura`.

- [Suscripciones en tiempo real de Firestore](https://firebase.google.com/docs/firestore/query-data/listen)
- [Reglas de seguridad de Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Fuente de publicación de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
