# Portal informativo · Facción Médica Malibu

link: https://master-balm-464802-r0.web.app/

Sitio web estático de la **Facción Médica Malibu** (Servicios Médicos Malibu Latam) del servidor **OneState Roleplay**. Reúne en un solo lugar lo que el personal médico necesita para trabajar y ascender:

- las macros de rol, que se copian con un toque;
- los requisitos de cada ascenso de bata;
- un mapa interactivo de las zonas donde está prohibido hacer RCP;
- las actividades de cada rango;
- la documentación que hay que presentar para ascender;
- un video tutorial de RCP;
- un chatbot que responde dudas sobre los ascensos;
- un formulario de solicitud de ascenso (página oculta, sin enlaces desde el resto del sitio).

> Este documento está escrito para quien mantenga el código. Explica cómo está armado el sitio, cómo funciona cada pieza, cómo se publica y cómo hacer los cambios más comunes sin romper nada.

---

## Índice

1. [Resumen técnico](#1-resumen-técnico)
2. [Estructura de archivos](#2-estructura-de-archivos)
3. [Mapa del sitio](#3-mapa-del-sitio)
4. [Anatomía de una página](#4-anatomía-de-una-página)
5. [portal.js: comportamiento compartido](#5-portaljs-comportamiento-compartido)
6. [index.html: portada, macros y documentos](#6-indexhtml-portada-macros-y-documentos)
7. [rcp-mapa.html: mapa interactivo de zonas](#7-rcp-mapahtml-mapa-interactivo-de-zonas)
8. [portal.css: estilos y sistema visual](#8-portalcss-estilos-y-sistema-visual)
9. [Catálogo de componentes](#9-catálogo-de-componentes)

11. [Imágenes y archivos multimedia](#11-imágenes-y-archivos-multimedia)
12. [Trabajar en local](#12-trabajar-en-local)
14. [Tareas frecuentes paso a paso](#14-tareas-frecuentes-paso-a-paso)
15. [Compatibilidad y accesibilidad](#15-compatibilidad-y-accesibilidad)
16. [Problemas conocidos y deuda técnica](#16-problemas-conocidos-y-deuda-técnica)

---

## 1. Resumen técnico

| Aspecto | Detalle |
| --- | --- |
| Tipo de sitio | Estático: HTML + CSS + JavaScript sin frameworks |
| Build | **No hay**. No hay bundler, transpilador, `package.json` ni `node_modules`. Los archivos se publican tal cual están. |
| JavaScript | Vanilla (ES2017+: `async/await`, arrow functions, template literals, spread, `Map`). Sin librerías. |
| Estilos | Una única hoja compartida, `portal.css`. El mapa suma un `<style>` propio dentro de la página. |

| Tipografía | `Inter` si está instalada en el equipo; si no, la fuente del sistema. No se descarga ninguna fuente web. |
| Hosting | Firebase Hosting, publicando la raíz del proyecto (`"public": "."`) con `cleanUrls`. |
| Idioma | Español rioplatense (voseo) en toda la interfaz. `lang="es"` en cada página. |
| Tema | Solo oscuro. No hay modo claro. |
| Control de versiones | La carpeta **no** es un repositorio git. Ver [§16](#16-problemas-conocidos-y-deuda-técnica). |

---

## 2. Estructura de archivos

```text
Portal_Alianza_Medica_Malibu/
├── index.html               Portada: macros, información importante, documentos, video
├── bata-azul.html           Ascenso Practicante (blanca) → Asistente de médico (azul)
├── bata-morada.html         Ascenso Asistente (azul) → Residente médico (morada)
├── bata-cafe.html           Ascenso Residente médico (morada) → Médico residente (marrón)
├── bata-general.html        Ascenso Médico residente (marrón) → Médico general (verde)
├── bata-especialista.html   Ascenso Médico general (verde) → Médico especialista (violeta)
├── bata-tareas.html         Actividades a desempeñar, agrupadas por rango
├── rcp-mapa.html            Mapa interactivo de zonas prohibidas (imagen embebida en base64)
├── ascender.html            Formulario de solicitud de ascenso (Airtable). Página oculta: nada enlaza a ella
├── portal.css               Hoja de estilos compartida
├── portal.js                Comportamiento compartido: copiar macros y visor de imágenes
├── assets/                  Imágenes y video (57 archivos, ~66 MB)
├── botpress/                Textos del chatbot. NO se publican.
│   ├── prompt-ascensos.md   Instrucciones del bot y reglas de ascenso
│   └── faq-ascensos.md      Base de conocimiento en formato pregunta/respuesta
├── firebase.json            Configuración de Firebase Hosting
├── .firebaserc              Proyecto de Firebase asociado
├── .firebase/               Caché de la CLI de Firebase (hashes de archivos publicados)
├── LEEME.txt                Nota vieja de una entrega anterior (menciona Netlify). Obsoleta.
├── README.md                Este documento
└── PROMPT-portal.md         Prompt para recrear el sitio completo con una IA. NO se publica.
```

---

## 3. Mapa del sitio

### 3.1 Páginas

Con `cleanUrls` activado, Firebase sirve cada página también sin la extensión: `/bata-azul` equivale a `/bata-azul.html`.

| Archivo | Título | Días de ascenso | Imagen de portada (`--hero-img`) | Secciones (anclas) |
| --- | --- | --- | --- | --- |
| `index.html` | Portal informativo | — | `assets/angel_portada.webp` (clase `.hero.home`) | `#bienvenida`, `#accesos-rapidos`, `#macros`, `#galeria`, `#zonas-y-mapa`, `#zonas-prohibidas`, `#mapa-zonas`, `#requisitos-ascenso`, `#normas-generales`, `#reglas-mostrador`, `#macros-imagen`, `#documentacion`, `#tutorial-rcp` |
| `bata-azul.html` | Ascenso a Asistente de médico | Martes y sábados | `assets/ph-bataazul.jpg` | `#requisitos`, `#req-rcp`, `#req-zonas`, `#req-evidencia`, `#req-rp` |
| `bata-morada.html` | Ascenso a Residente médico | Sábados | `assets/ph-auto.png` | `#requisitos`, `#req-rol`, `#req-md`, `#req-zonas`, `#req-entrenamiento`, `#req-actividades` |
| `bata-cafe.html` | Ascenso a Médico residente | Sábado | `assets/rcp-web.jpg` | `#requisitos`, `#req-pildoras`, `#req-rcp`, `#req-entrenamiento` |
| `bata-general.html` | Ascenso a Médico general | Sábado | `assets/ph-medicos.jpg` | `#requisitos`, `#req-patrullajes`, `#req-entrenador`, `#req-reprimenda`, `#req-pildoras`, `#req-rcp` |
| `bata-especialista.html` | Ascenso a Médico especialista | Sábado | `assets/ph-especialista.jpg` | `#requisitos`, `#req-jefe`, `#req-reuniones`, `#req-eventos`, `#req-capacitacion` |
| `bata-tareas.html` | Actividades por bata | — | por defecto (`assets/zona-lenador.jpeg`) | `#actividades`, `#bata-marron`, `#medico-general`, `#medico-especialista` |
| `rcp-mapa.html` | Mapa de zonas RCP | — | no tiene portada | — |
| `ascender.html` | Solicitud de ascenso | — | por defecto (`assets/zona-lenador.jpeg`) | — |

### 3.2 Escalera de rangos y colores

Cada botón de ascenso de la barra superior muestra dos puntos de color unidos por una flecha: la bata de origen y la de destino.

| Rango | Color de bata | Clase del punto | Clase del botón que lleva a ese rango |
| --- | --- | --- | --- |
| Practicante de enfermería | Blanca | `.coat-dot.white` | — |
| Asistente de médico | Azul | `.coat-dot.blue` | `.ascenso-btn.to-blue` → `bata-azul.html` |
| Residente médico | Morada | `.coat-dot.purple` | `.ascenso-btn.to-purple` → `bata-morada.html` |
| Médico residente | Marrón (café) | `.coat-dot.brown` | `.ascenso-btn.to-brown` → `bata-cafe.html` |
| Médico general | Verde | `.coat-dot.green` | `.ascenso-btn.to-green` → `bata-general.html` |
| Médico especialista | Violeta | `.coat-dot.violet` | `.ascenso-btn.to-violet` → `bata-especialista.html` |

> ⚠️ En el portal el verde corresponde a **Médico general**, pero en los textos del chatbot "bata verde" es **Enfermero**. Ver [§16](#16-problemas-conocidos-y-deuda-técnica).

### 3.3 Navegación

- **Barra superior** (`.topbar`, fija al hacer scroll): logo, "🏠 Inicio" (en todas las páginas menos `index.html`), "📌 Actividades" (en todas) y los 5 botones de ascenso. En la página actual, el botón lleva `aria-current="page"`, que el CSS resalta con un borde blanco.
- **Accesos rápidos** (`.quick-access`): botones debajo de la bienvenida que llevan a anclas de la misma página o a otras páginas.
- **"↑ Volver a los requisitos"** (`.back-top`): al pie de cada bloque de requisito, vuelve a `#requisitos`.
- **Pie** (`footer`): enlaces al Discord de OneState Latam y a la web oficial de OneState.
- **Página oculta `ascender.html`**: tiene la barra superior como las demás, pero **ninguna página enlaza a ella** y no aparece en los accesos rápidos ni en la barra. Se entra solo con la URL directa (`/ascender`). Lleva `<meta name="robots" content="noindex, nofollow">` para que los buscadores no la listen. Si en algún momento se quiere hacer pública, hay que agregar su botón en la barra de todas las páginas (ver [§14.7](#147-cambiar-algo-de-la-barra-superior-en-todas-las-páginas)) y quitar el `noindex`.

---

## 4. Anatomía de una página

No hay sistema de plantillas: **todas las páginas repiten el mismo esqueleto a mano**. Si cambiás algo compartido (la barra superior, el pie, el visor), hay que cambiarlo en cada archivo. Ver [§14.7](#147-cambiar-algo-de-la-barra-superior-en-todas-las-páginas).

```html
<body>
  <div class="topbar"> … logo + <nav class="ascensos"> … </nav> </div>

  <main class="wrap">
    <section class="hero" style="--hero-img:url('assets/…')">   <!-- portada -->
      <span class="eyebrow">…</span>  <h1>…</h1>  <p class="sub">…</p>
      <div class="days">📅 …</div>                               <!-- días de ascenso -->
    </section>

    <section class="welcome-card warn"> … </section>              <!-- aviso "Antes de presentarte" -->
    <section class="quick-access"> <div class="quick-grid"> … </div> </section>

    <h2 id="requisitos" class="section-title">📈 Requisitos</h2>
    <section class="gallery"> … photo-card por requisito … </section>

    <section id="req-…" class="req"> … </section>                <!-- un bloque por requisito -->

    <footer> … </footer>
  </main>

  <div id="toast" class="toast">✓ Copiado al portapapeles</div>  <!-- lo usa portal.js -->
  <div id="lightbox" class="lightbox" aria-hidden="true"> … </div> <!-- lo usa portal.js -->
</body>
```

### 4.1 Elementos obligatorios para `portal.js`

`portal.js` busca estos IDs. Si falta alguno, la función correspondiente no anda:

| ID | Para qué | Qué pasa si falta |
| --- | --- | --- |
| `toast` | Aviso "✓ Copiado al portapapeles" | Se copia igual, pero sin aviso |
| `lightbox` | Contenedor del visor de imágenes | El visor queda desactivado (`portal.js` corta ahí) |
| `lightboxTitle`, `lightboxImage`, `closeLightbox` | Partes del visor | Error de JavaScript al abrir el visor |

`rcp-mapa.html` no incluye `portal.js`, ni el visor ni el chatbot: es una página aparte con su propio script.

`ascender.html` tampoco incluye `portal.js`, el toast, el visor ni el chatbot: solo tiene la barra, la portada, el formulario de Airtable y el pie.

### 4.2 Orden de los scripts

1. **Script en línea de `index.html`** (solo en la portada): arma las tarjetas de macros **antes** de que cargue `portal.js`, que después les agrega el comportamiento de copiar.
2. **`portal.js`**: sin `defer`, al final del `<body>`, cuando el DOM ya está completo.
---

## 5. `portal.js`: comportamiento compartido

Es una IIFE (función autoejecutable) que no expone variables globales. Tiene dos partes.

### 5.1 Copiar al portapapeles

Cualquier elemento con el atributo **`data-copy="texto"`** se vuelve copiable:

- recibe `tabIndex=0` y `role="button"`, así se puede usar con teclado;
- al hacer clic, o al apretar **Enter** o **Espacio**, copia el contenido de `data-copy`.

```js
async function copyText(text){
  try { await navigator.clipboard.writeText(text); }      // API moderna
  catch(e){ /* textarea temporal + document.execCommand("copy") */ }  // respaldo
  // muestra #toast con la clase .show durante 1,5 s
}
```

- **Respaldo**: si la API del portapapeles no está disponible (por ejemplo al abrir el sitio con `file://` o por `http` sin HTTPS), crea un `<textarea>` invisible, lo selecciona y ejecuta `execCommand("copy")`.
- **Saltos de línea**: para incluir un salto de línea dentro de `data-copy`, escribí `&#10;`. Ejemplo real, la plantilla de solicitud de rol en `bata-morada.html`:
  ```html
  <article class="card" data-copy="SOLICITUD DE ROL&#10;NOMBRE:&#10;RANGO:&#10;FACCIÓN: MEDICINA…">
  ```
- Los elementos copiables se buscan **una sola vez**, al cargar la página. Si se agregan tarjetas después, no se vuelven copiables. Por eso la portada arma sus macros antes de cargar `portal.js`.

### 5.2 Visor de imágenes (lightbox)

Hay dos formas de abrir una imagen en el visor:

| Elemento | Qué muestra |
| --- | --- |
| `.photo-card.zoom` con `data-title` y `data-image` | La imagen de `data-image` (puede ser distinta de la miniatura) y `data-title` como título |
| `img.fig` | Su propio `src`, con su `alt` como título |

El visor tiene tres botones:

- **⛶ Pantalla completa**: llama a `requestFullscreen()` sobre la imagen. Si el navegador no lo permite, abre la imagen sola en una pestaña nueva. Es lo que pasa en iPhone: Safari no deja poner imágenes en pantalla completa, y en la pestaña nueva se puede ampliar con los dedos.
- **⬇ Descargar**: un `<a download>` con `href` apuntando a la imagen y el nombre original del archivo (`src.split("/").pop()`). Solo funciona con imágenes del mismo dominio, que es el caso de todas las del portal.
- **Cerrar**.

Los botones "Pantalla completa" y "Descargar" **no están en el HTML**: `portal.js` los crea al cargar y los inserta antes de "Cerrar". Así no hubo que editar el visor en las 7 páginas.

El visor se cierra con el botón "Cerrar", con un clic en el fondo oscuro fuera de la imagen o con la tecla **Esc**. Al cerrar se vacía el `src` de la imagen para liberar memoria.

---

## 6. `index.html`: portada, macros y documentos

### 6.1 Macros: datos y armado

Las 20 macros están en un arreglo dentro del script en línea de la portada:

```js
const macros = [
  { titulo:"Taser para neutralizar", categoria:"/me", icono:"⚡",
    texto:"/me TASER TASER para neutralizar situación de peligro." },
  …
];
```

| Campo | Uso |
| --- | --- |
| `titulo` | Texto de la tarjeta y de su `aria-label` ("Copiar …") |
| `texto` | Comando completo que se copia. **No se muestra** en la tarjeta. |
| `categoria`, `icono` | Hoy **no se usan** al armar las tarjetas. Quedan como datos de referencia. |

El número (`01`, `02`, …) sale de la posición en el arreglo: **el orden del arreglo define la numeración y el orden de copiado**. Antes de ponerlos en el HTML, `titulo` y `texto` pasan por `escapeHtml` (que escapa `& < > "`), así las comillas del comando no rompen el atributo `data-copy`.

### 6.2 Copiado en orden obligatorio

Las macros de la portada **solo se pueden copiar en orden**. El funcionamiento es este:

- **Estado**: una variable `next` guarda el índice de la macro que toca copiar (empieza en `0`).
- **Aspecto**: la grilla lleva la clase `.sequence`, que atenúa todas las tarjetas (`opacity:.32`, cursor `not-allowed`). La que toca lleva `.next`: opacidad completa, borde celeste, halo y un poco elevada.
- **Control del clic**: `guard()` se registra en la grilla **en fase de captura** (`addEventListener(…, true)`), así corre **antes** que el copiado de `portal.js`, que está en cada tarjeta:
  - si el clic es en la tarjeta que toca: deja pasar el evento (`portal.js` copia) y avanza con `highlight(i + 1)`;
  - si es en otra: `stopPropagation()` + `preventDefault()` cortan el evento y no se copia nada. Además `warn()`:
    - cambia el aviso a "✋ Primero copiá la macro NN", en rojo (`.toast.warn`), durante 1,6 s;
    - sacude la tarjeta tocada (`.blocked`, animación `macro-shake`). Para poder repetir la animación, quita la clase y fuerza un reflow con `void card.offsetWidth` antes de volver a ponerla;
    - desplaza la página hasta la macro que toca (`scrollIntoView`).
- **Teclado**: pasa lo mismo con **Enter** o **Espacio** (`keydown` también en captura).
- **Vuelta al principio**: después de la macro 20 vuelve a la 01 (`next = i % cards.length`).
- **Reiniciar**: el botón `#macroReset` ("↺ Reiniciar") solo se ve si `next > 0` y vuelve a `highlight(0)`.
- **Sin memoria**: el progreso **no se guarda**. Al recargar la página vuelve a empezar en la 01.

### 6.3 Desplegables de la portada

Las macros (`#macrosDropdown`) y los documentos (`#docsDropdown`) están en elementos `<details class="dropdown">` que arrancan cerrados. Los accesos rápidos "🧾 Macros" y "📂 Documentos", además de llevar a la sección, **abren su desplegable**:

```js
[["#macros","macrosDropdown"], ["#documentacion","docsDropdown"]].forEach(([href,id]) =>
  document.querySelector(`a[href="${href}"]`).addEventListener("click", () =>
    document.getElementById(id).open = true));
```

### 6.4 Documentación para ascensos

Es una galería de 5 columnas (`.gallery.docs`) con estas tarjetas: inventario, DNI, registro de trabajo, certificado de comunicación social y carnet de la facción. Las capturas de documentos tienen el contenido a la izquierda y espacio vacío a la derecha. Por eso llevan la clase `.doc`, que alinea la imagen arriba a la izquierda (`object-position:left top`) para que el recorte no corte el documento. El carnet es vertical y no lleva `.doc`.

### 6.5 Video tutorial

```html
<video controls playsinline preload="metadata">
  <source src="assets/tutorial-rcp.mov" type="video/mp4">
  <source src="assets/tutorial-rcp.mov" type="video/quicktime">
</video>
```

- El `.mov` usa el códec **H.264**. Declarado como `video/mp4`, lo reproducen Chrome, Edge, Firefox y Safari sin necesidad de convertirlo. Si se reemplaza por un `.mov` en **HEVC/H.265**, que es lo que graban los iPhone por defecto, **dejará de verse en Chrome y Firefox**: en ese caso hay que convertirlo a MP4 H.264.
- `preload="metadata"` hace que al entrar solo se descarguen la duración y el primer cuadro, no los ~26 MB completos.
- `playsinline` evita que en iPhone se abra solo en pantalla completa.

---

## 7. `rcp-mapa.html`: mapa interactivo de zonas

Es una página independiente: no carga `portal.js` ni el chatbot, y tiene CSS y JavaScript propios dentro del archivo.

### 7.1 La imagen del mapa

La imagen está **embebida en base64** dentro de un `<img src="data:image/webp;base64,…">`: una sola línea de ~100.000 caracteres (la línea 88). Por eso el archivo pesa ~115 KB aunque el código sea chico.

- **Ventaja**: la página funciona sin depender de otro archivo.
- **Desventaja**: el editor se pone lento con esa línea, y el navegador no puede guardar la imagen en caché por separado.
- **Tamaño de referencia**: **581 × 1024 px** (`const W=581, H=1024`). Todas las coordenadas de zonas usan ese sistema.

> Si cambiás la imagen por otra de distinto tamaño o encuadre, hay que actualizar `W`/`H` **y** recalcular todas las coordenadas de `Z`.

### 7.2 Datos de las zonas

```js
const T = {                       // tipos de zona: [título, explicación]
  militar:  ["Base militar", "Es una facción, así que no se puede hacer RCP."],
  hospital: [...], comisaria: [...], iglesia: [...],
  ak: [...], ak2: [...], guarida: [...], marcada: [...]
};

// [x, y, radio, tipo]  en píxeles sobre la imagen de 581×1024
const Z = [
  [414, 97, 26, "militar"], [322, 222, 40, "ak"], …   // 15 zonas
];
```

Cada zona es un círculo con centro `(x, y)` y un radio en píxeles de la imagen. Para cada zona se crea un `<div class="ring">` con posición y tamaño en **porcentaje** del escenario, así los círculos siguen al mapa en cualquier tamaño y con cualquier zoom. Los círculos solo se ven con el interruptor "Ver zonas prohibidas" (clase `.show` en `#map`).

### 7.3 Consulta de un punto

Al tocar un punto:

1. Se pasa la posición del toque a coordenadas de la imagen (`px = (clientX − stage.left) / stage.width`, y después `x = px·W`, `y = py·H`). Como se usa `getBoundingClientRect()` del escenario ya transformado, el cálculo sale bien con cualquier zoom o desplazamiento.
2. Se busca la zona más cercana cuyo radio contiene el punto (`Math.hypot`).
3. Se muestra:
   - **Zona prohibida**: punto rojo que late (`.dot.no`) y un cartel con título, "No se puede hacer RCP" y la explicación.
   - **Zona libre**: punto verde (`.dot.yes`) y un cartel chico que solo dice "Zona libre".
4. El cartel (`#sign`) está **fuera** del escenario que se amplía, en coordenadas de lo visible. Así no crece con el zoom. Se ubica debajo del toque si el toque está en el 72 % superior, y arriba si no. Horizontalmente se limita entre el 26 % y el 74 % del ancho para que no se salga.

### 7.4 Zoom y desplazamiento

```text
#map (recuadro visible, overflow:hidden)
└── #stage (escenario: imagen + círculos + punto)   transform: translate(tx,ty) scale(s)
    #sign, .zoom-ctrl (fuera del escenario, no se amplían)
```

- **Encaje**: `apply()` calcula `fit = min(anchoRecuadro/W, altoRecuadro/H)` y le da al escenario ese tamaño. Así la imagen entra entera en el recuadro, que ocupa todo el ancho disponible.
- **Límites**: `clampAxis()` centra la imagen en un eje cuando es más chica que el recuadro. Cuando es más grande, no deja que se aleje del borde.
- **Zoom con punto fijo**: `zoomAt(cx, cy, s')` aplica `tx = cx − (cx − tx)·s'/s` para que el punto bajo el cursor o los dedos no se mueva. El zoom va de **1×** a **6×** (`MIN`/`MAX`).
- **Entradas**:
  - **rueda del mouse**: factor `exp(−deltaY·0.0015)`. El listener va con `passive:false` para poder cancelar el scroll de la página;
  - **botones**: `+` y `−` (×1,5 o ÷1,5 desde el centro) y `⟲` (vuelve a 1×);
  - **Pointer Events** (sirven igual para mouse, dedo y lápiz): un puntero arrastra; dos punteros hacen zoom por pellizco, según la distancia entre dedos, y desplazan según el punto medio.
- **Toque o arrastre**: si el puntero se movió **6 px o menos** en total y no hubo pellizco, cuenta como toque y consulta la zona. Si se movió más, es arrastre y no consulta nada.
- **Punto de tamaño fijo**: el escenario publica `--inv = 1/s`, y el punto aplica `scale(var(--inv))` para mantener su tamaño con cualquier zoom. Los círculos sí se agrandan con el mapa.
- `touch-action:none` en `#map` evita que el navegador haga su propio zoom o scroll mientras se toca el mapa.

### 7.5 Pantalla completa y tecla Esc

- El botón **⛶** aplica la clase `.full`: `position:fixed; inset:0`, una capa que tapa toda la página y sirve de respaldo en iPhone. Además, si el navegador lo permite, llama a `requestFullscreen()` sobre `#map`.
- Al salir por el navegador (evento `fullscreenchange`) se quita `.full`. En pantalla completa, el botón pasa a **✕**.
- **Esc**: si hay un cartel abierto, lo cierra. Si no, sale de la pantalla completa. Con la pantalla completa nativa (Chrome, Edge, Firefox), el primer Esc lo toma el navegador para salir de pantalla completa.

---

## 8. `portal.css`: estilos y sistema visual

### 8.1 Variables (`:root`)

| Variable | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#06111c` | Fondo base |
| `--line` | `rgba(116,205,255,.22)` | Bordes celestes |
| `--text` / `--muted` | `#f5fbff` / `#a9bfd0` | Texto principal y secundario |
| `--cyan` | `#69d3ff` | Acentos, flechas de desplegables, macro resaltada |
| `--red` / `--green` | `#ff4b4b` / `#29d391` | Zona prohibida o error / OK |
| `--shadow` | `0 20px 50px rgba(0,0,0,.28)` | Sombra estándar |
| `--panel-grad`, `--card-grad`, `--card-grad-hover`, `--box-grad` | degradados azul oscuro | Fondos de paneles, tarjetas y cajas |

Variables por componente:

- **Portada**: `--hero-img` y `--hero-pos`. Se definen en el `style` de cada `.hero`.
- **Tarjetas con imagen**: `--img-h`, la altura de la miniatura. Cambia según la galería.
- **Botones de ascenso**: `--from`, `--to`, `--ring` y `--glow` (degradado, borde y brillo de cada `.ascenso-btn.to-*`).

### 8.2 Organización del archivo

El archivo está dividido en bloques con comentarios `/* ---------- … ---------- */`, en este orden:

1. variables
2. base
3. barra superior
4. portada
5. tarjeta de bienvenida y aviso
6. accesos rápidos
7. títulos
8. galería
9. bloque de requisito y desplegable
10. tarjetas de macros y pasos
11. consejos, checklist y datos
12. aviso de copiado y visor
13. pie
14. responsive
15. overrides del chatbot

### 8.3 Puntos de corte (responsive)

| Ancho | Cambios principales |
| --- | --- |
| > 1000 px | Galerías de 4 columnas (`.three`: 3, `.docs`: 5, `.two`: 2) y macros en 5 columnas |
| ≤ 1000 px | La barra superior pasa a dos líneas. Galerías de 2 columnas. Macros en 4. `.two-col` en 1 columna. |
| ≤ 760 px | `.gallery.two` en 1 columna. Macros en 3. `.stats` en 1 columna, incluida la grilla de evidencia de `bata-azul`. |
| ≤ 620 px | Se oculta el texto del logo. Los accesos rápidos pasan a una fila que se desliza hacia el costado. Galerías en 1 columna. Macros en 2. |
| ≤ 420 px | Macros en 1 columna |

`prefers-reduced-motion: reduce` desactiva el scroll suave y el zoom de las miniaturas. En el mapa, desactiva también el latido del punto rojo.

---

## 9. Catálogo de componentes

Fragmentos listos para copiar y pegar.

**Desplegable** (arranca cerrado; agregar `open` para que arranque abierto):
```html
<details class="dropdown">
  <summary>📋 Ver las actividades <span class="dropdown-hint">4 actividades</span></summary>
  <div class="dropdown-body"> … contenido … </div>
</details>
```

**Tarjeta con imagen que se amplía** (miniatura y ampliada pueden ser archivos distintos):
```html
<article class="photo-card zoom" data-title="Título del visor" data-image="assets/grande.png">
  <img src="assets/miniatura.png" alt="Descripción">
  <div class="photo-info"><div class="order-badge">01</div><h3>Título</h3><p>Texto</p></div>
</article>
```
Para que lleve a otra página en lugar de ampliar: `<a class="photo-card" href="…">` sin la clase `zoom`.

**Imagen suelta que se amplía**: `<img class="fig" src="assets/…" alt="Título en el visor">` + `<p class="fig-cap">Tocá la imagen para verla en grande.</p>`

**Tarjeta que copia un texto**:
```html
<article class="card" data-copy="/me Texto a copiar">
  <div class="macro-row"><div class="macro-number">01</div>
    <div class="macro-button-title">Título</div><div class="copy-icon">⧉</div></div>
  <div class="macro">/me Texto a copiar</div>
</article>
```
Variante `.card.action` (borde rojo): un paso que se hace en el juego y no tiene macro.

**Otros bloques**:

| Clase | Qué es |
| --- | --- |
| `.req` + `.req-head` | Bloque de un requisito, con número (`.order-badge`) y título |
| `.stats` / `.stats.two` / `.stats.evidence` + `.stat` | Datos destacados en 3 o 2 columnas. `.evidence`: 2 tarjetas apiladas a la izquierda y la de la foto (`.stat-photo`) a la derecha, ocupando todo el alto |
| `.stat.green`, `.stat.white` | Tarjeta de dato teñida del color de bata |
| `.checklist` / `.checklist.bad` | Lista con ✓ verde o ✗ roja |
| `.tips` + `.tip` | Consejos en amarillo, con ícono (`.ico`) |
| `.info-group-title` | Subtítulo celeste dentro de una sección |
| `.welcome-card.warn` | Aviso con borde amarillo ("Antes de presentarte") |
| `.model` | Bloque monoespaciado para plantillas de texto (ej. solicitud de rol) |
| `.two-col` | Dos columnas: texto y figura |
| `.video-card` | Marco para un `<video>` |
| `.section-lead` | Párrafo introductorio debajo de un `.section-title` |
| `.section-title-row` | Título con un botón a la derecha (usado para "↺ Reiniciar") |


---

## 11. Imágenes y archivos multimedia

### 11.1 Convención de nombres en `assets/`

| Prefijo | Contenido | Ejemplos |
| --- | --- | --- |
| `asc-` | Flyers de requisitos de cada ascenso | `asc-azul-blanco.webp`, `asc-cafe-gral.webp` |
| `doc-` | Capturas de documentos del juego | `doc-dni.png`, `doc-trabajo.png`, `doc-credencial.png` |
| `pre-` | Miniaturas para tarjetas | `pre-macro.png`, `pre-mapa.webp`, `pre-zonas.png` |
| `ph-` | Fotos de portada o ilustrativas | `ph-bataazul.jpg`, `ph-medicos.jpg` |
| `req-` | Infografías de requisitos o reglas | `req-md.png`, `req-rcp-morado-azul.png` |
| `reglas-` | Reglas del hospital | `reglas-normas_generales.webp`, `reglas_piso1.webp` |
| `tarea-`, `evid-`, `hp-` | Tareas semanales, evidencias de ejemplo, hospital | `tarea-curas.png`, `evid-capacitacion1.png` |
| `tutorial-` | Material de tutorial | `tutorial-macro.png`, `tutorial-rcp.mov` |

Excepciones sin prefijo: `logo.png`, `angel_portada.webp`, `zonas.png`, `evento.png`, `rp.webp`, `zona-lenador.jpeg` (portada por defecto).

### 11.2 Rendimiento

La carpeta pesa **~66 MB**. Los archivos en uso más pesados son:

| Archivo | Tamaño | Usado en |
| --- | --- | --- |
| `tutorial-rcp.mov` | ~26 MB | `index.html` (solo se descarga si se le da play) |
| `ph-auto.png` | ~3,0 MB | portada de `bata-morada.html` |
| `asc-verde-blanco.png` | ~2,9 MB | `index.html` |
| `req-rcp-morado-azul.png` | ~2,5 MB | `bata-azul.html`, `bata-cafe.html` |
| `req-md.png` | ~2,4 MB | `bata-morada.html` |
| `zonas.png` | ~2,3 MB | `index.html`, `bata-azul.html`, `bata-morada.html` |
| `tarea-curas.png`, `tutorial-macro.png`, `evento.png` | ~2,0–2,1 MB c/u | varias |

Estas imágenes tienen más resolución de la que se ve en pantalla. Convertirlas a **WebP** y bajarlas a un ancho máximo de ~1600 px reduciría el peso entre 5 y 10 veces sin pérdida visible. Si se convierte una, hay que actualizar su extensión en todos los HTML que la usan.

Recomendaciones para imágenes nuevas:

- fotos → **WebP** o JPG;
- capturas con texto → PNG o WebP sin pérdida;
- nombre en minúsculas, **sin espacios** y con el prefijo que corresponda.

---

## 12. Trabajar en local

Como no hay build, alcanza con abrir los archivos. Aun así, conviene usar **un servidor local** y no abrir los HTML con doble clic (`file://`):

| Con `file://` | Con servidor local |
| --- | --- |
| Copiar macros funciona por el método de respaldo (`execCommand`) | Usa la API moderna del portapapeles (`localhost` cuenta como seguro) |
| El chatbot puede no cargar | Carga normal |
| No hay URLs limpias (`/bata-azul` no existe) | Igual que sin `cleanUrls`: hay que usar `.html` |

Cualquiera de estas opciones sirve:

```bash
# Con Python
python -m http.server 8080
# Con Node (sin instalar nada)
npx serve .
# Con la CLI de Firebase: emula el hosting real, incluido cleanUrls
firebase serve --only hosting        # o: firebase emulators:start --only hosting
```

Después, abrí `http://localhost:8080` (el puerto cambia según la herramienta).

Para verificar el JavaScript en línea sin navegador, se puede extraer el script y chequear la sintaxis con Node:

```bash
awk '/<script>/{f=1;next}/<\/script>/{f=0}f' index.html > /tmp/idx.js && node --check /tmp/idx.js
node --check portal.js
```

## 14. Tareas frecuentes paso a paso

### 14.1 Agregar o cambiar una macro de la portada

1. En `index.html`, editar el arreglo `const macros = [...]`.
2. **La posición define el número y el orden obligatorio de copiado.** Insertar en el medio corre la numeración de todas las siguientes.
3. Actualizar el texto `20 macros` del `<summary>` de `#macrosDropdown` si cambia la cantidad.
4. Si la macro es parte del proceso de RCP, revisar que también esté en `bata-azul.html` y en `botpress/prompt-ascensos.md`.

### 14.2 Cambiar los días de un ascenso

Editar `<div class="days">…<br>Sábado</span></div>` en la página del ascenso y el dato en `botpress/prompt-ascensos.md` y `faq-ascensos.md`.

### 14.3 Cambiar una imagen

1. Copiar la imagen nueva a `assets/` con un nombre sin espacios.
2. Buscar el nombre viejo en todos los HTML y en `portal.css` y reemplazarlo. En una `.photo-card.zoom` hay **dos** referencias: `data-image` (la ampliada) y el `src` del `<img>` (la miniatura). Revisar las dos.
3. Para la portada de una página, cambiar `--hero-img:url('assets/…')` en el `style` de su `.hero`.

### 14.4 Agregar una zona prohibida al mapa

1. Abrir la imagen del mapa en un editor de imágenes a **581 × 1024 px** y anotar el centro `(x, y)` y un radio.
2. Si es un tipo nuevo, agregarlo a `T`: `nuevoTipo:["Título","Explicación"]`.
3. Agregar `[x, y, radio, "tipo"]` al arreglo `Z` en `rcp-mapa.html`.
4. Probar con "Ver zonas prohibidas" activado: el círculo tiene que quedar sobre la zona.
5. Actualizar la lista de zonas en `botpress/`.

### 14.5 Agregar actividades de un rango

En `bata-tareas.html`, copiar un bloque `<section class="req">` completo. Hay que:

- cambiar el `id`;
- cambiar el título;
- cargar los `<li>` de la lista;
- actualizar el contador de `.dropdown-hint`;
- agregar su botón en `.quick-grid` apuntando al nuevo `id`.

### 14.6 Crear una página de ascenso nueva

1. Duplicar la página de ascenso más parecida, por ejemplo `bata-general.html`.
2. Cambiar `<title>`, portada (`--hero-img`), `.eyebrow` (puntos de color), `<h1>`, días y requisitos.
3. En la barra superior, mover `aria-current="page"` al botón de la página nueva.
4. Agregar el botón de la página nueva en la barra superior de **todas** las páginas (ver 14.7), con una clase `.ascenso-btn.to-*`. Si es un color nuevo, crear su `.coat-dot.<color>` y su `.ascenso-btn.to-<color>` en `portal.css`.

### 14.7 Cambiar algo de la barra superior en todas las páginas

La barra está copiada en 9 archivos. Conviene hacer un buscar y reemplazar en toda la carpeta (en VS Code: Ctrl+Shift+H), limitado a `*.html`, y después revisar estas diferencias:

- `index.html` no tiene "🏠 Inicio", y su logo es un `<div>`, no un enlace;
- en `rcp-mapa.html` la barra está más abajo en el archivo, después del `<style>` propio de la página;
- cada página tiene `aria-current="page"` en su propio botón, salvo `ascender.html`, que no tiene botón propio.

### 14.8 Hacer un bloque desplegable

Envolver el contenido en el fragmento de [§9](#9-catálogo-de-componentes). Si un acceso rápido apunta a esa sección, hay que abrir el desplegable por JavaScript al hacer clic (ver [§6.3](#63-desplegables-de-la-portada)). Si no, el enlace lleva a una sección cerrada.

### 14.9 Cambiar el formulario de `ascender.html`

El formulario es un `<iframe class="airtable-embed">` de Airtable. Para cambiarlo, en Airtable abrir el formulario → **Compartir** → **Insertar**, copiar el código y reemplazar el `<iframe>` completo dentro de la `<section class="req">`. Lo único que cambia entre un formulario y otro es el identificador de página en el `src` (`https://airtable.com/embed/appDpxPSQNOeuxuqv/<id de página>/form`); hoy es `pagBq9Xv5j0SuD1St`.

Las respuestas se guardan en la base de Airtable `appDpxPSQNOeuxuqv`, no en este proyecto.

---

## 15. Compatibilidad y accesibilidad

**Navegadores**: versiones actuales de Chrome, Edge, Firefox y Safari (escritorio y móvil). Todo lo que se usa tiene soporte amplio: `aspect-ratio`, `inset`, `:fullscreen`, Pointer Events, `<details>`, Clipboard API y `backdrop-filter`. Las diferencias conocidas son:

- **iPhone (Safari)**: no permite pantalla completa en imágenes ni en elementos que no sean video. El visor abre la imagen en otra pestaña y el mapa usa la capa fija `.full`, con las barras del navegador visibles.
- **Portapapeles**: la API moderna necesita HTTPS o `localhost`. En otro caso se usa el método de respaldo.

**Accesibilidad**:

- Las tarjetas copiables y ampliables reciben `tabIndex=0` y `role="button"`, y responden a Enter y Espacio.
- Los botones de ascenso solo muestran colores. El nombre del rango está en `.ascenso-label`, oculto a la vista pero legible por lectores de pantalla. Además tienen `title`.
- El visor usa `aria-hidden`. Los botones del mapa tienen `aria-label`.
- Se respeta `prefers-reduced-motion`.
- Pendiente: el visor no atrapa el foco del teclado mientras está abierto, y algunos avisos solo usan color (rojo/verde) acompañado de texto.

---

## 16. Problemas conocidos y deuda técnica

Relevados al escribir este documento. Ordenados de más a menos impacto.

| # | Problema | Dónde | Sugerencia |
| --- | --- | --- | --- |

| 1 | **Imágenes muy pesadas**: 66 MB en `assets/`, varias de 2–3 MB. | `assets/` | Ver [§11.2](#112-rendimiento) |
| 2 | **20 archivos de `assets/` sin usar**, entre ellos `Mapa-Malibu.webp`, `asc-azul-morado.webp`, `foto_1.png`, `botiquin-bl.png`, `botiquin-rojo.png`, `verde1.jpg`, `tutorial-zonas.png` y `azul blanco.png` (con espacio). Se publican igual y ocupan espacio. | `assets/` | Revisarlos y borrarlos o moverlos fuera de la carpeta publicada |

| 3 | **Sin plantillas**: la barra superior, el pie, el visor y los scripts del chatbot están repetidos en 7–8 archivos. | todas las páginas | A futuro: un generador estático simple (Eleventy, Astro) o inyectar la barra con JS |
| 4 | El progreso del orden de macros **no se guarda** al recargar. | `index.html` | Si hace falta, guardarlo en `localStorage` dentro de `highlight()` |
| 5 | La imagen del mapa embebida en base64 hace lenta la edición de `rcp-mapa.html`. | `rcp-mapa.html` | Pasarla a `assets/` como archivo aparte, sin cambiar su tamaño de 581×1024 |
