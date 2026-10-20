/* =========================================================
   JAVASCRIPT DE LA PÁGINA DE CUMPLEAÑOS 🌻
   Aquí están todas las animaciones que necesitan "pensar".
   ========================================================= */

/* ---------- Frases que caen en la sección final (CAMBIA AQUÍ) ---------- */
const FRASES = [
  'Gracias por ser mi hogar, incluso cuando el mundo se siente difícil.',
  'Que la vida te regale tanta felicidad como la que tú nos has dado.',
  'Si volviera a empezar mi historia, volvería a elegirte como mi mamá.',
  'Que nunca te falten motivos para sonreír y sueños por cumplir.',
  'Así como el girasol busca el sol, mi corazón siempre encuentra su camino hacia ti.'
];

/* Dibujo pequeño de un girasol (SVG) que usamos en la lluvia */
function dibujoGirasol(tamano) {
  let petalos = '';
  for (let i = 0; i < 12; i++) {
    petalos += `<ellipse cx="50" cy="22" rx="9" ry="20" fill="#e0ba50" transform="rotate(${i * 30} 50 50)"/>`;
  }
  return `<svg width="${tamano}" height="${tamano}" viewBox="0 0 100 100">${petalos}
            <circle cx="50" cy="50" r="17" fill="#5a3b22"/>
            <circle cx="50" cy="50" r="10" fill="#75553a"/></svg>`;
}

/* Número al azar entre min y max */
function azar(min, max) {
  return Math.random() * (max - min) + min;
}

/* =========================================================
   1. INICIO: lluvia de girasoles + chispas doradas
   ========================================================= */
const lluvia = document.getElementById('lluvia');
let inicioVisible = true;

function crearGirasolQueCae() {
  if (!inicioVisible || document.hidden) return;   // ahorra batería si no se ve

  const flor = document.createElement('div');
  flor.className = 'flor-cae';
  const tamano = azar(22, 55);
  flor.innerHTML = dibujoGirasol(tamano);
  flor.style.left = azar(0, 100) + '%';
  flor.style.opacity = azar(0.6, 1);
  flor.style.animationDuration = azar(9, 17) + 's';          // lento = suave
  flor.style.setProperty('--deriva', azar(-80, 80) + 'px');  // se mueve un poco de lado
  flor.style.setProperty('--giro', azar(-360, 360) + 'deg'); // gira mientras cae

  lluvia.appendChild(flor);
  // cuando termina de caer, la borramos para no llenar la memoria
  flor.addEventListener('animationend', () => flor.remove());
}

// Al entrar, caen varias de golpe y luego una cada 0.7 segundos (lluvia continua)
for (let i = 0; i < 8; i++) setTimeout(crearGirasolQueCae, i * 250);
setInterval(crearGirasolQueCae, 700);

// Chispas doradas alrededor del título
const chispas = document.getElementById('chispas');
for (let i = 0; i < 28; i++) {
  const c = document.createElement('span');
  c.className = 'chispa';
  c.style.left = azar(0, 100) + '%';
  c.style.top = azar(0, 100) + '%';
  c.style.animationDelay = azar(0, 3) + 's';
  c.style.animationDuration = azar(2, 4) + 's';
  const t = azar(3, 7);
  c.style.width = c.style.height = t + 'px';
  chispas.appendChild(c);
}

// Botón "Descubre tu regalo": baja suavemente a Memorias
document.getElementById('btnRegalo').addEventListener('click', () => {
  document.getElementById('memorias').scrollIntoView({ behavior: 'smooth' });
});

/* =========================================================
   Animación de aparición al hacer scroll
   (IntersectionObserver avisa cuando algo entra en pantalla)
   ========================================================= */
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visible');
      observador.unobserve(entrada.target);   // solo una vez
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.aparecer').forEach((el, i) => {
  // pequeño retraso escalonado para las polaroids
  if (el.classList.contains('polaroid')) el.style.transitionDelay = (i % 3) * 0.15 + 's';
  observador.observe(el);
});

// Saber si el inicio se ve (para pausar la lluvia cuando no)
new IntersectionObserver(([e]) => { inicioVisible = e.isIntersecting; })
  .observe(document.getElementById('inicio'));

/* =========================================================
   2. MEMORIAS: abrir foto en grande
   ========================================================= */
const visor = document.getElementById('visor');
const visorImg = document.getElementById('visorImg');
const visorFrase = document.getElementById('visorFrase');

document.querySelectorAll('.polaroid').forEach((foto) => {
  foto.addEventListener('click', () => {
    visorImg.src = foto.querySelector('img').src;
    visorFrase.textContent = foto.dataset.frase;
    visor.classList.add('abierto');
  });
});

// Se cierra tocando fuera de la foto, la X o la tecla Escape
visor.addEventListener('click', (e) => {
  if (e.target === visor || e.target.classList.contains('visor-cerrar')) visor.classList.remove('abierto');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') visor.classList.remove('abierto');
});

/* =========================================================
   4. LA CARTA: abrir sobre + efecto de escritura
   ========================================================= */
const sobre = document.getElementById('sobre');
const btnCarta = document.getElementById('btnCarta');
const btnSaltar = document.getElementById('btnSaltar');
const textoMostrado = document.getElementById('textoCartaMostrado');
const firma = document.getElementById('firma');
// tomamos los párrafos escritos en el HTML
const parrafos = [...document.querySelectorAll('#textoCarta p')].map(p => p.textContent.trim());
let saltar = false;

const esperar = (ms) => new Promise(r => setTimeout(r, ms));

btnCarta.addEventListener('click', async () => {
  btnCarta.classList.add('oculto');
  document.getElementById('cartaPregunta').classList.add('oculto');

  sobre.classList.add('abierto');   // 1. se abre la solapa
  await esperar(1100);
  sobre.classList.add('fuera');     // 2. la carta sale
  await esperar(1300);
  sobre.classList.add('leyendo');   // 3. se despliega
  await esperar(900);

  btnSaltar.style.display = 'inline-block';
  await escribirCarta();            // 4. aparece el texto letra por letra
  btnSaltar.style.display = 'none';
  firma.classList.add('visible');   // 5. firma + girasol
});

async function escribirCarta() {
  for (const texto of parrafos) {
    const p = document.createElement('p');
    p.classList.add('cursor');
    textoMostrado.appendChild(p);

    for (let i = 0; i < texto.length; i++) {
      if (saltar) break;
      p.textContent += texto[i];
      // pausa un poquito más en comas y puntos, como alguien que escribe
      const letra = texto[i];
      await esperar(letra === '.' || letra === ',' ? 250 : 32);
    }
    p.textContent = texto;
    p.classList.remove('cursor');
    if (!saltar) await esperar(400);
  }
}

btnSaltar.addEventListener('click', () => { saltar = true; });

/* =========================================================
   5. EL GIRASOL QUE CRECE + frases que caen
   ========================================================= */
const final = document.getElementById('final');
const petalos = document.getElementById('petalos');
const frasesCaja = document.getElementById('frases');
const mensajeFinal = document.getElementById('mensajeFinal');
const btnRepetir = document.getElementById('btnRepetir');

// Creamos 22 pétalos alrededor del centro (150, 140)
const TOTAL_PETALOS = 22;
for (let i = 0; i < TOTAL_PETALOS; i++) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('transform', `rotate(${i * (360 / TOTAL_PETALOS)} 150 140)`);
  const petalo = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  petalo.setAttribute('class', 'petalo');
  petalo.setAttribute('cx', 150);
  petalo.setAttribute('cy', 88);
  petalo.setAttribute('rx', 12);
  petalo.setAttribute('ry', 30);
  petalo.style.animationDelay = (3.9 + i * 0.13) + 's';   // se abren uno por uno
  g.appendChild(petalo);
  petalos.appendChild(g);
}

let indiceFrase = 0;
let intervaloFrases = null;
let temporizadorFinal = null;

function soltarFrase() {
  const f = document.createElement('p');
  f.className = 'frase';
  f.textContent = FRASES[indiceFrase % FRASES.length];
  indiceFrase++;
  // en computadora caen a los lados para no tapar el girasol
  if (window.innerWidth > 700) {
    f.style.left = (Math.random() < 0.5 ? azar(2, 22) : azar(64, 76)) + '%';
  } else {
    f.style.left = azar(2, 30) + '%';
  }
  f.style.setProperty('--deriva', azar(-40, 40) + 'px');
  frasesCaja.appendChild(f);
  f.addEventListener('animationend', () => f.remove());
}

function empezarGirasol() {
  final.classList.add('crecer');
  // las frases empiezan a caer mientras crece
  setTimeout(soltarFrase, 1500);
  intervaloFrases = setInterval(soltarFrase, 3200);

  // cuando termina de abrirse el último pétalo (~7 s), queda florecido
  temporizadorFinal = setTimeout(() => {
    final.classList.add('florecido');
    mensajeFinal.classList.add('visible');
    btnRepetir.style.display = 'inline-block';
  }, 7500);
}

// Empieza cuando la sección se ve en pantalla
const observadorFinal = new IntersectionObserver(([e]) => {
  if (e.isIntersecting) {
    empezarGirasol();
    observadorFinal.disconnect();
  }
}, { threshold: 0.4 });
observadorFinal.observe(final);

// Botón para ver crecer el girasol otra vez (útil para probar)
btnRepetir.addEventListener('click', () => {
  clearInterval(intervaloFrases);
  clearTimeout(temporizadorFinal);
  final.classList.remove('crecer', 'florecido');
  mensajeFinal.classList.remove('visible');
  btnRepetir.style.display = 'none';
  void final.offsetWidth;       // truco para reiniciar las animaciones CSS
  empezarGirasol();
});

/* =========================================================
   MÚSICA (solo suena cuando ella pulsa el botón)
   ========================================================= */
const musica = document.getElementById('musica');
const btnMusica = document.getElementById('btnMusica');

btnMusica.addEventListener('click', async () => {
  if (musica.paused) {
    try {
      musica.volume = 0.5;
      await musica.play();
      btnMusica.classList.add('sonando');
      btnMusica.textContent = '❚❚';
    } catch (error) {
      mostrarAviso('Pon tu canción en la carpeta "musica" con el nombre cancion.mp3 🎵');
    }
  } else {
    musica.pause();
    btnMusica.classList.remove('sonando');
    btnMusica.textContent = '♪';
  }
});

function mostrarAviso(texto) {
  const aviso = document.createElement('div');
  aviso.className = 'aviso';
  aviso.textContent = texto;
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 4000);
}

/* =========================================================
   6. 
COLLAGE: girasol si falta una foto + tamaño automático
   
========================================================= */
const collageFotos = document.getElementById('collageFotos');
collageFotos.querySelectorAll('img').forEach((foto) => {
  
const ponerGirasol = () => {
    
const celda = document.createElement('div');
    
celda.className = 'celda-girasol';
    
foto.replaceWith(celda);
    
ajustarCollage();
  
};
  
foto.addEventListener('error', ponerGirasol);
  
if (foto.complete && foto.naturalWidth === 0) ponerGirasol();
});
// Busca el tamaño de foto más grande que entra en la pantalla sin sobrar espacio
function ajustarCollage() {
  
if (window.innerWidth <= 700) {            // en celular se usa el tamaño del CSS
    
collageFotos.style.removeProperty('--alto');
    
return;
  
}
  
let min = 60, max = 600;
  
for (let i = 0; i < 15; i++) {
    
const medio = (min + max) / 2;
    
collageFotos.style.setProperty('--alto', medio + 'px');
    
if (collageFotos.scrollHeight <= collageFotos.clientHeight) min = medio;
    
else max = medio;
  
}
  
collageFotos.style.setProperty('--alto', min + 'px');
}
window.addEventListener('load', ajustarCollage);
window.addEventListener('resize', ajustarCollage);
