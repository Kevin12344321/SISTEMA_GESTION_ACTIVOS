import { useEffect, useRef } from "react";
import * as THREE from "three";

type Logo3DProps = {
  /** URL de la imagen del logo (el PNG con fondo blanco que ya usas en el login) */
  imagen: string;
  className?: string;
};

/* ---------- Ajustes rápidos ---------- */
const GIRO_COMPLETO = false; // false = se balancea de lado a lado; true = da vueltas completas
const PROFUNDIDAD = 0.32;    // grosor del logo (el ancho del logo mide ANCHO_LOGO)
const ANCHO_LOGO = 3;
const OCUPA = 0.62;          // cuánto de la zona ocupa el logo (0.62 = 62 %)
const RESOLUCION = 560;      // detalle del relieve (más alto = más fino, pero más pesado)

const suavizar = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* Desenfoque de caja (rápido, por pasadas horizontal y vertical) */
function desenfocar(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const n = 2 * r + 1;

  for (let y = 0; y < h; y++) {
    const o = y * w;
    let s = 0;
    for (let x = -r; x <= r; x++) s += src[o + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[o + x] = s / n;
      s += src[o + Math.min(w - 1, x + r + 1)] - src[o + Math.max(0, x - r)];
    }
  }

  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = s / n;
      s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }

  return out;
}

/* Lee el logo: el blanco queda en 0 y el logo en 1 */
function leerMascara(img: HTMLImageElement) {
  const recorte = 0.15; // el PNG trae ~15 % de margen por lado (igual que el clip-path del login)

  const sx = img.naturalWidth * recorte;
  const sy = img.naturalHeight * recorte;
  const sw = img.naturalWidth * (1 - 2 * recorte);
  const sh = img.naturalHeight * (1 - 2 * recorte);

  const w = RESOLUCION;
  const h = Math.round((w * sh) / sw);

  const lienzo = document.createElement("canvas");
  lienzo.width = w;
  lienzo.height = h;
  const ctx = lienzo.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  const px = ctx.getImageData(0, 0, w, h).data;
  const alfa = new Float32Array(w * h);

  for (let i = 0; i < w * h; i++) {
    const luz = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
    alfa[i] = Math.min(1, Math.max(0, 1.574 - 1.64 * luz));
  }

  return { alfa, w, h };
}

/* Logo en 3D decorativo: las letras DL y "Corporativo" con grosor y reflejos. */
function Logo3D({ imagen, className }: Logo3DProps) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = contenedor.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // sin WebGL no se muestra el logo 3D (es solo decorativo)
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    const lienzo = renderer.domElement;
    lienzo.style.cssText = "width:100%;height:100%;display:block";
    host.appendChild(lienzo);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 6;

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
    mancha(620, 140, 140, "170,250,200", 1);

    e.fillStyle = "rgba(210,250,225,.9)"; // franjas: se ven como destellos que se mueven al balancearse
    e.fillRect(300, 90, 160, 14);
    e.fillRect(700, 230, 12, 140);
    e.fillRect(520, 330, 130, 10);
    e.fillRect(110, 250, 10, 110);

    const envTex = new THREE.CanvasTexture(ec);
    envTex.encoding = THREE.sRGBEncoding;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromEquirectangular(envTex).texture;

    /* ---------- Luces ---------- */
    scene.add(new THREE.AmbientLight(0x1f6a3e, 0.7));

    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 1.1);
    luzPrincipal.position.set(-3, 4, 5);
    scene.add(luzPrincipal);

    const luzBorde = new THREE.DirectionalLight(0x3aa86a, 0.9);
    luzBorde.position.set(4, -1, -3);
    scene.add(luzBorde);

    const luzRelleno = new THREE.DirectionalLight(0x9fe0b8, 0.4);
    luzRelleno.position.set(2, -2, 5);
    scene.add(luzRelleno);

    /* ---------- El logo (se crea cuando carga la imagen) ---------- */
    const grupo = new THREE.Group();
    scene.add(grupo);

    let proporcion = 1.4; // alto/ancho del logo, se actualiza al cargar
    let cancelado = false;
    let geo: THREE.PlaneGeometry | null = null;
    let mat: THREE.MeshPhysicalMaterial | null = null;
    let mapaAlfa: THREE.CanvasTexture | null = null;

    const ajustar = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;

      renderer.setSize(w, h, false);
      camera.aspect = w / h;

      // Aleja la cámara lo necesario para que el logo ocupe OCUPA de la zona
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const zAncho = ANCHO_LOGO / OCUPA / (2 * tan * camera.aspect);
      const zAlto = (ANCHO_LOGO * proporcion) / OCUPA / (2 * tan);
      camera.position.z = Math.max(zAncho, zAlto, 3);
      camera.updateProjectionMatrix();
    };

    const img = new Image();
    img.onload = () => {
      if (cancelado) return;

      const { alfa, w, h } = leerMascara(img);
      proporcion = h / w;

      // Bordes suaves (para el biselado) y una "cúpula" suave (para que los reflejos varíen)
      const borde = desenfocar(desenfocar(alfa, w, h, 1), w, h, 1);
      const cupula = desenfocar(alfa, w, h, 14);

      // Geometría: un plano con muchos puntos, levantado según la forma del logo
      const anchoU = ANCHO_LOGO;
      const altoU = ANCHO_LOGO * proporcion;
      geo = new THREE.PlaneGeometry(anchoU, altoU, w - 1, h - 1);

      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const rampa = suavizar(0.3, 0.7, borde[i]);
        const domo = Math.min(1, cupula[i] * 1.7);
        pos.setZ(i, PROFUNDIDAD * rampa * (0.8 + 0.2 * domo));
      }
      geo.computeVertexNormals();

      // Mapa de transparencia: oculta todo lo que no es logo
      const lienzoAlfa = document.createElement("canvas");
      lienzoAlfa.width = w;
      lienzoAlfa.height = h;
      const ctxA = lienzoAlfa.getContext("2d")!;
      const datos = ctxA.createImageData(w, h);
      for (let i = 0; i < w * h; i++) {
        const v = Math.round(borde[i] * 255);
        datos.data[i * 4] = v;
        datos.data[i * 4 + 1] = v;
        datos.data[i * 4 + 2] = v;
        datos.data[i * 4 + 3] = 255;
      }
      ctxA.putImageData(datos, 0, 0);

      mapaAlfa = new THREE.CanvasTexture(lienzoAlfa);
      mapaAlfa.generateMipmaps = false;
      mapaAlfa.minFilter = THREE.LinearFilter;

      mat = new THREE.MeshPhysicalMaterial({
        color: 0x1c9650,
        metalness: 0.65,
        roughness: 0.26,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
        envMap,
        envMapIntensity: 1.4,
        side: THREE.DoubleSide,
        alphaMap: mapaAlfa,
        alphaTest: 0.3
      });

      const logo = new THREE.Mesh(geo, mat);
      logo.position.z = -PROFUNDIDAD / 2; // centra el grosor para que gire sobre su eje
      grupo.add(logo);

      ajustar();
    };
    img.src = imagen;

    const observador = new ResizeObserver(ajustar);
    observador.observe(host);
    ajustar();

    /* ---------- Animación ---------- */
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inicio = performance.now();
    let cuadro = 0;

    const animar = () => {
      cuadro = requestAnimationFrame(animar);

      const t = reducir ? 0 : (performance.now() - inicio) / 1000;
      const entrada = reducir ? 1 : 1 - Math.exp(-t * 1.1);

      grupo.scale.setScalar(0.9 + 0.1 * entrada);

      if (GIRO_COMPLETO) {
        grupo.rotation.y = t * 0.4;
      } else {
        grupo.rotation.y = -0.2 + Math.sin(t * 0.6) * 0.6; // se balancea de lado a lado
      }
      grupo.rotation.x = Math.sin(t * 0.4 + 1) * 0.1;
      grupo.position.y = Math.sin(t * 0.9) * 0.04;

      renderer.render(scene, camera);
    };

    animar();

    /* ---------- Limpieza (importante con StrictMode y al cambiar de página) ---------- */
    return () => {
      cancelado = true;
      cancelAnimationFrame(cuadro);
      observador.disconnect();

      geo?.dispose();
      mat?.dispose();
      mapaAlfa?.dispose();
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

export default Logo3D;
