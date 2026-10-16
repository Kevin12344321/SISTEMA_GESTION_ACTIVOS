import { useEffect, useRef } from "react";
import * as THREE from "three";
import { obtenerGeometria } from "./geometriaGota";

type GotaCanvasProps = {
  className?: string;
};

/* Figura 3D decorativa: una gota/plástico líquido verde que solo gira. */
function GotaCanvas({ className }: GotaCanvasProps) {
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = contenedor.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // sin WebGL no se muestra la figura (es solo decorativa)
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    const lienzo = renderer.domElement;
    lienzo.style.cssText = "width:100%;height:100%;display:block";
    host.appendChild(lienzo);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.z = 5.8;

    /* ---------- Entorno que se refleja en la superficie ---------- */
    const ec = document.createElement("canvas");
    ec.width = 1024;
    ec.height = 512;
    const g = ec.getContext("2d")!;

    g.fillStyle = "rgb(1,5,3)";
    g.fillRect(0, 0, 1024, 512);

    const mancha = (x: number, y: number, r: number, rgb: string, a: number) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      [[0, 1], [0.25, 0.708], [0.5, 0.435], [0.75, 0.19], [1, 0]].forEach(([s, k]) =>
        gr.addColorStop(s, `rgba(${rgb},${a * k})`)
      );
      g.fillStyle = gr;
      g.fillRect(0, 0, 1024, 512);
    };

    mancha(220, 200, 260, "40,170,90", 0.95);
    mancha(820, 330, 280, "19,110,51", 1);
    mancha(620, 140, 120, "150,245,185", 1);
    mancha(430, 400, 200, "10,60,35", 0.9);
    mancha(950, 150, 150, "25,100,70", 0.8);

    g.fillStyle = "rgba(190,245,215,.8)";
    g.fillRect(300, 90, 150, 12);
    g.fillRect(700, 230, 10, 130);
    g.fillRect(520, 330, 120, 9);
    g.fillRect(120, 260, 9, 100);
    g.fillRect(900, 120, 90, 9);

    const envTex = new THREE.CanvasTexture(ec);
    envTex.encoding = THREE.sRGBEncoding;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromEquirectangular(envTex).texture;

    /* ---------- Material ---------- */
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x26944f,
      metalness: 0.9,
      roughness: 0.1,
      envMap,
      envMapIntensity: 1.6,
      transparent: true
    });

    mat.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
      vec3 nn = normalize(normal);
      float facing = clamp(dot(nn, normalize(vViewPosition)), 0.0, 1.0);
      float luz = clamp(dot(nn, normalize(vec3(-0.2, 0.3, 0.93))), 0.0, 1.0);
      float pliegue = clamp(length(fwidth(nn)) * 7.0, 0.0, 1.0);
      totalEmissiveRadiance += vec3(0.006, 0.30, 0.07) * pow(luz, 28.0);
      totalEmissiveRadiance += vec3(0.002, 0.02, 0.008) * facing;
      totalEmissiveRadiance += vec3(0.14, 0.60, 0.34) * pow(1.0 - facing, 6.0) * 0.6;
      totalEmissiveRadiance += vec3(0.10, 0.45, 0.25) * pliegue * 0.15;
      diffuseColor.a = 0.8 + 0.2 * pow(facing, 0.6);`
      );
    };

    const mesh = new THREE.Mesh(obtenerGeometria(), mat);
    mesh.rotation.x = 0.2;
    scene.add(mesh);

    scene.add(new THREE.AmbientLight(0x136e33, 0.2));

    const l1 = new THREE.PointLight(0x3a9a62, 0.5, 30);
    l1.position.set(-4, 3, 4);
    const l2 = new THREE.PointLight(0x23784a, 0.35, 30);
    l2.position.set(4, -3, 3);
    const l3 = new THREE.PointLight(0x9fd8b6, 0.25, 30);
    l3.position.set(0, 5, 5);
    scene.add(l1, l2, l3);

    /* ---------- Tamaño ---------- */
    const ajustar = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Posición de la figura: más negativo = más a la derecha
      camera.setViewOffset(w, h, w > 820 ? -w * 0.05 : 0, 0, w, h);
      camera.updateProjectionMatrix();
    };

    const observador = new ResizeObserver(ajustar);
    observador.observe(host);
    ajustar();

    /* ---------- Animación: solo gira ---------- */
    const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inicio = performance.now();
    let cuadro = 0;

    const animar = () => {
      cuadro = requestAnimationFrame(animar);

      const t = reducir ? 0 : (performance.now() - inicio) / 1000;
      const entrada = reducir ? 1 : 1 - Math.exp(-t * 1.1);

      mesh.scale.setScalar(0.88 + 0.12 * entrada);
      mesh.rotation.y = t * 0.3;

      renderer.render(scene, camera);
    };

    animar();

    /* ---------- Limpieza (importante con StrictMode y al cambiar de página) ---------- */
    return () => {
      cancelAnimationFrame(cuadro);
      observador.disconnect();

      mat.dispose();
      envMap.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();

      if (lienzo.parentNode === host) {
        host.removeChild(lienzo);
      }
    };
  }, []);

  return <div ref={contenedor} className={className} aria-hidden="true" />;
}

export default GotaCanvas;
