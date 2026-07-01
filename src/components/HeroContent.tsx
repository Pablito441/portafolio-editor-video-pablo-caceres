// Hero — island de React animada con Framer Motion.
// Entrada inmersiva al cargar/recargar: cada pieza aparece desde una dirección
// distinta (arriba / izquierda / derecha / abajo / escala) en cascada con delays.
// Se monta con client:load para que la animación corra en cada recarga.
import { motion } from "framer-motion";

const tools = [
  { name: "Premiere Pro", src: "/images/logos/premiere.webp" },
  { name: "Photoshop", src: "/images/logos/photoshop.webp" },
  { name: "CapCut", src: "/images/logos/capcut.webp" },
  { name: "After Effects", src: "/images/logos/aftereffects.webp" },
];

const EASE = [0.22, 0.61, 0.36, 1] as const;

// Helper: props de entrada desde una dirección (`from`) con un retardo (cascada).
type From = { x?: number; y?: number; scale?: number };
const appear = (from: From, delay: number) => ({
  initial: { opacity: 0, x: 0, y: 0, scale: 1, ...from },
  animate: { opacity: 1, x: 0, y: 0, scale: 1 },
  transition: { duration: 0.7, ease: EASE, delay },
});

export default function HeroContent() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: 470,
        padding: "18px 104px 36px 96px",
        boxSizing: "border-box",
      }}
    >
      {/* columna izquierda */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 470 }}>
        {/* eyebrow — desde ARRIBA */}
        <motion.div
          {...appear({ y: -40 }, 0.1)}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 6,
            fontWeight: 500,
            fontSize: 17,
            letterSpacing: 4,
            color: "#eceae4",
            marginBottom: 8,
          }}
        >
          EDITOR &amp; FILMMAKER
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            style={{ marginTop: 1, opacity: 0.8 }}
          >
            <circle
              cx="6"
              cy="6"
              r="4.5"
              stroke="#cf2e2e"
              strokeWidth="1"
              fill="none"
            />
            <line
              x1="6"
              y1="1.5"
              x2="6"
              y2="10.5"
              stroke="#cf2e2e"
              strokeWidth="1"
            />
            <line
              x1="1.5"
              y1="6"
              x2="10.5"
              y2="6"
              stroke="#cf2e2e"
              strokeWidth="1"
            />
          </svg>
        </motion.div>

        {/* título animado — desde la IZQUIERDA */}
        <motion.video
          {...appear({ x: -70 }, 0.22)}
          src="/videos/titulo.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/titulo-editor.png"
          aria-label="EDITOR DE VIDEO"
          style={{
            width: 452,
            maxWidth: "none",
            display: "block",
            margin: "2px 0px 6px -17px",
            mixBlendMode: "screen",
          }}
        />

        {/* claim — desde la IZQUIERDA */}
        <motion.div
          {...appear({ x: -50 }, 0.34)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            margin: "10px 0 18px",
          }}
        >
          <span
            style={{
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "7px 0 7px 11px",
              borderColor: "transparent transparent transparent #cf2e2e",
            }}
          />
          <span
            style={{
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 3,
              color: "#eceae4",
            }}
          >
            DOY RITMO A TUS IDEAS
          </span>
        </motion.div>

        {/* párrafo — desde ABAJO */}
        <motion.p
          {...appear({ y: 40 }, 0.44)}
          style={{
            fontWeight: 300,
            fontSize: 15,
            lineHeight: 1.55,
            color: "#b6b4ae",
            maxWidth: 255,
            margin: "0 0 26px",
          }}
        >
          Transformo ideas en contenido visual que conecta, impacta y deja
          huella. Edición con intención. Narrativa con estilo.
        </motion.p>

        {/* CTA + chips — desde ABAJO; los chips entran uno a uno (escala) */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <motion.a
            {...appear({ y: 40 }, 0.54)}
            href="#vertical"
            className="dc-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 34,
              padding: "15px 22px",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: 2,
            }}
          >
            VER TRABAJOS
            <svg width="30" height="10" viewBox="0 0 30 10" fill="none">
              <line
                x1="0"
                y1="5"
                x2="26"
                y2="5"
                stroke="#f0eee8"
                strokeWidth="1"
              />
              <polyline
                points="21,1 26,5 21,9"
                stroke="#f0eee8"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </motion.a>
          {/* contenedor con stagger: el delay de entrada lo orquesta el padre,
              así el `transition` de cada chip queda libre para un hover snappy */}
          <motion.div
            style={{ display: "flex", gap: 10 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.62 } },
            }}
            initial="hidden"
            animate="show"
          >
            {tools.map((tool) => (
              <motion.span
                key={tool.name}
                variants={{
                  hidden: { opacity: 0, scale: 0.4, y: 14 },
                  show: { opacity: 1, scale: 1, y: 0 },
                }}
                whileHover={{ scale: 1.16, y: -4 }}
                transition={{ type: "spring", stiffness: 460, damping: 24 }}
                className="tool-chip"
                title={tool.name}
              >
                <img
                  src={tool.src}
                  alt={tool.name}
                  width="36"
                  height="36"
                  loading="lazy"
                  decoding="async"
                />
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* garabato junto al título — aparece con escala/fade */}
      <motion.svg
        {...appear({ scale: 0.6 }, 0.5)}
        width="80"
        height="46"
        viewBox="0 0 80 46"
        style={{
          position: "absolute",
          left: 392,
          top: 58,
          zIndex: 1,
          opacity: 0.85,
        }}
      >
        <path
          d="M3 30 C25 8, 40 6, 70 16 M10 38 C30 18, 48 16, 74 24 M20 44 C36 30, 52 26, 66 30"
          stroke="#d8d6d0"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* collage derecha — entra desde la DERECHA; hover: escala suave.
          Transición por-valor: opacity/x llevan el delay de entrada, scale usa el
          default (snappy) → el hover no arrastra ese delay al entrar/salir. */}
      <motion.img
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.03 }}
        transition={{
          duration: 0.35,
          ease: EASE,
          opacity: { duration: 0.7, ease: EASE, delay: 0.3 },
          x: { duration: 0.7, ease: EASE, delay: 0.3 },
        }}
        src="/images/hero-collage.webp"
        alt=""
        style={{
          position: "absolute",
          top: 8,
          right: 106,
          width: 360,
          zIndex: 1,
          cursor: "pointer",
        }}
      />

      {/* insignia rotatoria — entra con escala (pop), luego gira (CSS) */}
      <motion.div
        {...appear({ scale: 0.5 }, 0.72)}
        style={{
          position: "absolute",
          top: 212,
          right: 84,
          width: 78,
          height: 78,
          zIndex: 3,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="78"
          height="78"
          style={{ animation: "spin 20s linear infinite" }}
        >
          <defs>
            <path
              id="badgepath"
              d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
              fill="none"
            />
          </defs>
          <text
            fontFamily="'Space Mono',monospace"
            fontSize="9.5"
            letterSpacing="1.5"
            fill="rgba(235,233,227,.6)"
          >
            <textPath href="#badgepath" startOffset="0%">
              EDITOR · FILMMAKER · VIDEÓGRAFO ·{" "}
            </textPath>
          </text>
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: 1,
            color: "#eceae4",
            fontStyle: "italic",
          }}
        >
          PC
        </span>
      </motion.div>
    </div>
  );
}
