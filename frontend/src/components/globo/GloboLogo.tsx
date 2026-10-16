import { useEffect, useRef } from "react";
import * as THREE from "three";

type GloboLogoProps = {
  /** URL de la imagen del logo (el PNG con fondo blanco que ya usas en el login) */
  imagen: string;
  className?: string;
};

/* =========================================================
   Convierte el logo (verde sobre blanco) en una "máscara":
   el blanco queda transparente y el logo en menta claro.
========================================================= */
function crearMascaraLogo(img: HTMLImageElement): HTMLCanvasElement {
  const recorte = 0.15; // el PNG trae ~15 % de margen por lado (igual que el clip-path del login)

  const sx = img.naturalWidth * recorte;
  const sy = img.naturalHeight * recorte;
  const sw = img.naturalWidth * (1 - 2 * recorte);
  const sh = img.naturalHeight * (1 - 2 * recorte);

  const ancho = 512;
  const alto = Math.round((ancho * sh) / sw);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;

  const ctx = lienzo.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, ancho, alto);

  const datos = ctx.getImageData(0, 0, ancho, alto);
  const p = datos.data;

  for (let i = 0; i < p.length; i += 4) {
    const luz = (0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2]) / 255;
    const alfa = Math.min(1, Math.max(0, 1.574 - 1.64 * luz)); // blanco -> 0, verde -> 1

    // Color de los logos sobre la esfera (menta muy claro)
    p[i] = 223;
    p[i + 1] = 247;
    p[i + 2] = 232;
    p[i + 3] = Math.round(alfa * 255);
  }

  ctx.putImageData(datos, 0, 0);
  return lienzo;
}

/* =========================================================
   Textura de la esfera: fondo verde + líneas de globo
   terráqueo + el logo repetido alrededor.
========================================================= */
function crearTextura(
  mascara: HTMLCanvasElement,
  renderer: THREE.WebGLRenderer
): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;

  const lienzo = document.createElement("canvas");
  lienzo.width = W;
  lienzo.height = H;
  const g = lienzo.getContext("2d")!;

  // Fondo verde: más oscuro hacia los polos
  const fondo = g.createLinearGradient(0, 0, 0, H);
  fondo.addColorStop(0, "#0b3d22");
  fondo.addColorStop(0.5, "#15783f");
  fondo.addColorStop(1, "#0b3d22");
  g.fillStyle = fondo;
  g.fillRect(0, 0, W, H);

  // Líneas de meridianos y paralelos
  g.strokeStyle = "rgba(190,245,215,0.16)";
  g.lineWidth = 2;
  for (let lon = 0; lon < 360; lon += 30) {
    const x = (lon / 360) * W;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, H);
    g.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * H;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }

  // Logos repartidos por la esfera
  const proporcion = mascara.width / mascara.height;
  const anchoEcuador = 300; // tamaño de cada logo (en píxeles de la textura)

  const poner = (lonGrados: number, latGrados: number) => {
    // En latitudes altas la textura se estira, así que se ensancha el logo para compensar
    const w = anchoEcuador / Math.max(0.35, Math.cos((latGrados * Math.PI) / 180));
    const h = anchoEcuador / proporcion;
    const x = (lonGrados / 360) * W;
    const y = ((90 - latGrados) / 180) * H;

    [-W, 0, W].forEach((desplazamiento) => {
      const izquierda = x - w / 2 + desplazamiento;
      if (izquierda > -w && izquierda < W) {
        g.drawImage(mascara, izquierda, y - h / 2, w, h);
      }
    });
  };

  [0, 90, 180, 270].forEach((lon) => poner(lon, 0));
  [45, 135, 225, 315].forEach((lon) => {
    poner(lon, 48);
    poner(lon, -48);
  });

  const textura = new THREE.CanvasTexture(lienzo);
  textura.encoding = THREE.sRGBEncoding;
  textura.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return textura;
}

/* Globo 3D decorativo: una esfera verde con el logo de DL que gira como un mundo. */
function GloboLogo({ imagen, className }: GloboLogoProps) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = contenedor.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // sin WebGL no se muestra el globo (es solo decorativo)
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    const lienzo = renderer.domElement;
    lienzo.style.cssText = "width:100%;height:100%;display:block";
    host.appendChild(lienzo);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    const DISTANCIA = 4.6; // más grande = el globo se ve más pequeño

    /* ---------- Entorno para los reflejos ---------- */
    const ec = document.createElement("canvas");
    ec.width = 1024;
    ec.height = 512;
    const e = ec.getContext("2d")!;
    e.fillStyle = "rgb(2,8,5)";
    e.fillRect(0, 0, 1024, 512);

    const mancha = (x: number, y: number, r: number, rgb: string, a: number) => {
      const gr = e.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, `rgba(${rgb},${a})`);
      gr.addColorStop(1, `rgba(${rgb},0)`);
      e.fillStyle = gr;
      e.fillRect(0, 0, 1024, 512);
    };

    mancha(220, 200, 260, "40,170,90", 0.9);
    mancha(820, 330, 280, "19,110,51", 1);
    mancha(620, 140, 120, "170,250,200", 1);

    e.fillStyle = "rgba(210,250,225,.85)";
    e.fillRect(300, 90, 150, 12);
    e.fillRect(700, 230, 10, 130);
    e.fillRect(520, 330, 120, 9);

    const envTex = new THREE.CanvasTexture(ec);
    envTex.encoding = THREE.sRGBEncoding;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromEquirectangular(envTex).texture;

    /* ---------- Esfera ---------- */
    const geoEsfera = new THREE.SphereGeometry(1, 96, 64);
    const matEsfera = new THREE.MeshPhysicalMaterial({
      color: 0x1a7a40,
      roughness: 0.32,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      envMap,
      envMapIntensity: 0.9
    });
    const esfera = new THREE.Mesh(geoEsfera, matEsfera);

    // Inclinación del eje, como un globo terráqueo
    const globo = new THREE.Group();
    globo.rotation.z = -0.3;
    globo.add(esfera);
    scene.add(globo);

    /* ---------- Halo de luz alrededor ---------- */
    const geoHalo = new THREE.SphereGeometry(1.14, 64, 48);
    const matHalo = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vN;
        void main() {
          vN = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vN;
        void main() {
          float i = pow(max(0.0, 0.62 - dot(vN, vec3(0.0, 0.0, 1.0))), 3.0);
          gl_FragColor = vec4(0.25, 0.85, 0.5, 1.0) * i * 1.6;
        }`,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    scene.add(new THREE.Mesh(geoHalo, matHalo));

    /* ---------- Luces ---------- */
    scene.add(new THREE.AmbientLight(0x2a8a50, 0.6));

    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 1.0);
    luzPrincipal.position.set(-3, 3, 4);
    scene.add(luzPrincipal);

    const luzBorde = new THREE.DirectionalLight(0x3aa86a, 0.8);
    luzBorde.position.set(3, 0, -3);
    scene.add(luzBorde);

    /* ---------- Textura con el logo (cuando carga la imagen) ---------- */
    let cancelado = false;
    let textura: THREE.CanvasTexture | null = null;

    const img = new Image();
    img.onload = () => {
      if (cancelado) return;

      textura = crearTextura(crearMascaraLogo(img), renderer);
      matEsfera.map = textura;
      matEsfera.color.set(0xffffff);
      matEsfera.needsUpdate = true;
    };
    img.src = imagen;

    /* ---------- Tamaño ---------- */
    const ajustar = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // En zonas angostas (celular) se aleja la cámara para que el globo no se corte
      camera.position.z = DISTANCIA / Math.min(1, (w / h) * 1.15);
      camera.updateProjectionMatrix();
    };

    const observador = new ResizeObserver(ajustar);
    observador.observe(host);
    ajustar();

    /* ---------- Animación: gira como un mundo ---------- */
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inicio = performance.now();
    let cuadro = 0;

    const animar = () => {
      cuadro = requestAnimationFrame(animar);

      const t = reducir ? 0 : (performance.now() - inicio) / 1000;
      const entrada = reducir ? 1 : 1 - Math.exp(-t * 1.1);

      globo.scale.setScalar(0.9 + 0.1 * entrada);
      esfera.rotation.y = t * 0.25; // vueltas al globo (más grande = más rápido)

      renderer.render(scene, camera);
    };

    animar();

    /* ---------- Limpieza (importante con StrictMode y al cambiar de página) ---------- */
    return () => {
      cancelado = true;
      cancelAnimationFrame(cuadro);
      observador.disconnect();

      geoEsfera.dispose();
      geoHalo.dispose();
      matEsfera.dispose();
      matHalo.dispose();
      textura?.dispose();
      envMap.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();

      if (lienzo.parentNode === host) {
        host.removeChild(lienzo);
      }
    };
  }, [imagen]);

  return <div ref={contenedor} className={className} aria-hidden="true" />;
}

export default GloboLogo;
