// 02. Vídeos horizontales — island de React animada con Framer Motion.
// Reemplaza el FLIP manual (Web Animations API) por `layout` animations: al rotar
// la ventana, cada pieza viaja/escala sola de su slot viejo al nuevo (spring suave),
// y `AnimatePresence mode="popLayout"` saca/mete la que se va y la que entra sin
// romper la grilla. Conserva el MISMO bento (Gaming 6 / Dance 3) y estilos (#reel).
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Vid = { id: string; title: string };
type Group = { key: string; label: string; items: Vid[] };

// Sólo cuadrículas 16:9 limpias: 6 o 3. La 1ª área es la principal (2×2).
const AREAS: Record<number, string[]> = {
	6: ['main', 'v2', 'v3', 'v4', 'v5', 'v6'],
	3: ['main', 'v2', 'v3'],
	2: ['main', 'v2'],
	1: ['main'],
};
const tilesFor = (len: number) => (len >= 6 ? 6 : len >= 3 ? 3 : len);
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

const PlayIcon = () => (
	<svg width="46" height="46" viewBox="0 0 46 46" fill="none">
		<circle cx="23" cy="23" r="22" stroke="#f0eee8" strokeWidth="1.5" fill="rgba(0,0,0,.35)" />
		<path d="M19 15.5l12 7.5-12 7.5z" fill="#f0eee8" />
	</svg>
);

// La pieza que sale se desliza apenas hacia el lado contrario al avance.
const tileVariants = {
	enter: { opacity: 0, scale: 0.85 },
	center: { opacity: 1, scale: 1 },
	exit: (dir: number) => ({ opacity: 0, scale: 0.9, x: dir > 0 ? -42 : 42 }),
};

function Mosaic({ group }: { group: Group }) {
	const items = group.items;
	const len = items.length;
	const n = tilesFor(len);
	const areas = AREAS[n];

	const [start, setStart] = useState(0);
	const [dir, setDir] = useState(1);
	const [playing, setPlaying] = useState<string | null>(null);
	const drag = useRef({ down: false, sx: 0, moved: false });

	// Rota la ventana de a uno; el principal pasa al siguiente vídeo en orden.
	const step = (d: number) => {
		setDir(d);
		setStart((s) => (((s + d) % len) + len) % len);
		setPlaying(null); // al rotar, corta la reproducción (como antes)
	};
	const stepRef = useRef(step);
	stepRef.current = step;

	// Arrastre manual = rotar de a uno (umbral 70px, permite varios pasos por gesto).
	useEffect(() => {
		const move = (e: PointerEvent) => {
			const d = drag.current;
			if (!d.down) return;
			const dx = e.clientX - d.sx;
			if (Math.abs(dx) > 8) d.moved = true;
			if (Math.abs(dx) > 70) {
				stepRef.current(dx < 0 ? 1 : -1);
				d.sx = e.clientX;
			}
		};
		const up = () => {
			drag.current.down = false;
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
		return () => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
		};
	}, []);

	const visible = Array.from({ length: n }, (_, k) => {
		const v = items[(start + k) % len];
		return { v, area: areas[k], isMain: k === 0 };
	});

	return (
		<div className="reel-group">
			<div className="reel-group-head">
				<span className={`reel-dot cat-${group.key}`} />
				{group.label}
				<span className="reel-count">{len}</span>
			</div>
			<div className="reel-mosaic-wrap">
				<div
					className="reel-mosaic"
					data-count={n}
					onPointerDown={(e) => {
						drag.current = { down: true, sx: e.clientX, moved: false };
					}}
					onClickCapture={(e) => {
						// si el gesto fue un arrastre, anula el click (no reproducir)
						if (drag.current.moved) {
							e.stopPropagation();
							e.preventDefault();
						}
					}}
				>
					<AnimatePresence mode="popLayout" custom={dir} initial={false}>
						{visible.map(({ v, area, isMain }) => (
							<motion.button
								key={v.id}
								layout
								custom={dir}
								variants={tileVariants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{
									// glide soft y bien visible al reacomodarse a la nueva posición
									layout: { type: 'spring', stiffness: 170, damping: 26, mass: 1.1 },
									opacity: { duration: 0.45 },
									scale: { type: 'spring', stiffness: 300, damping: 22 },
									x: { duration: 0.5 },
								}}
								// El botón sólo sube de capa en hover (zIndex, no es transform → no
								// se ve afectado por el transform-origin top-left que impone `layout`).
								whileHover={playing === v.id ? undefined : { zIndex: 5 }}
								className={`reel-tile${isMain ? ' is-main' : ''}${playing === v.id ? ' playing' : ''}`}
								style={{ gridArea: area }}
								type="button"
								aria-label={`Reproducir: ${v.title}`}
								onClick={() => {
									if (playing !== v.id) setPlaying(v.id);
								}}
							>
								{/* La tarjeta interna ES la que escala en hover: sin `layout`, escala
								    desde su CENTRO → crece simétrico y no pisa a los vecinos. El
								    principal (2×2) usa menos scale (mismo crecimiento en px). */}
								<motion.div
									className="reel-tile-inner"
									whileHover={playing === v.id ? undefined : { scale: isMain ? 1.022 : 1.045 }}
									transition={{ type: 'spring', stiffness: 300, damping: 22 }}
								>
									{playing === v.id ? (
										<iframe
											className="reel-iframe"
											src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
											title={v.title}
											allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
											allowFullScreen
										/>
									) : null}
									<img
										className="reel-timg"
										src={thumb(v.id)}
										alt={v.title}
										loading="lazy"
										decoding="async"
										draggable={false}
										onError={(e) => {
											const img = e.currentTarget;
											img.onerror = null;
											img.src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
										}}
									/>
									<span className="reel-tplay" aria-hidden="true">
										<PlayIcon />
									</span>
									<div className="reel-ttitle">{v.title}</div>
								</motion.div>
							</motion.button>
						))}
					</AnimatePresence>
				</div>

				<button className="reel-nav prev" type="button" aria-label="Anterior" onClick={() => step(-1)}>
					<svg width="12" height="20" viewBox="0 0 22 40" fill="none">
						<polyline points="17,4 5,20 17,36" stroke="currentColor" strokeWidth="1.6" fill="none" />
					</svg>
				</button>
				<button className="reel-nav next" type="button" aria-label="Siguiente" onClick={() => step(1)}>
					<svg width="12" height="20" viewBox="0 0 22 40" fill="none">
						<polyline points="5,4 17,20 5,36" stroke="currentColor" strokeWidth="1.6" fill="none" />
					</svg>
				</button>
			</div>
		</div>
	);
}

export default function ReelGallery({ groups }: { groups: Group[] }) {
	// Sin MotionConfig reducedMotion: Pablo quiere las animaciones SIEMPRE visibles,
	// aunque el SO tenga "reducir movimiento" activado.
	return (
		<>
			{groups.map((g) => (
				<Mosaic key={g.key} group={g} />
			))}
		</>
	);
}
