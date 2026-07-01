// 01. Vídeos verticales — island de React animada con Framer Motion.
// Reemplaza el coverflow vanilla por uno con springs suaves:
//  · cada tarjeta se eleva/agranda un poco al hover (whileHover),
//  · el carril se arrastra de forma continua manteniendo el clic y hace
//    "snap" suave al soltar (motion value `center` + animate spring).
// Mantiene los MISMOS nombres de clase y estilos (ahora globales) que la
// versión anterior, además del modal de reproducción con sus enlaces.
import { useEffect, useRef, useState } from 'react';
import {
	motion,
	AnimatePresence,
	useMotionValue,
	useTransform,
	useMotionValueEvent,
	animate,
	type AnimationPlaybackControls,
} from 'framer-motion';

type Cat = 'gaming' | 'dance';
type Tier = 'compleja' | 'intermedia' | 'basica';
type Platform = 'youtube' | 'tiktok' | 'instagram';
interface Link {
	platform: Platform;
	url: string;
	views?: string;
}
interface Vid {
	slug: string;
	title: string;
	cat: Cat;
	views?: string;
	tier?: Tier;
	summary?: string;
	details?: string[];
	links: Link[];
}
interface Group {
	key: Cat;
	label: string;
	items: Vid[];
}

const STEP = 204; // separación horizontal entre piezas en foco
const platName: Record<Platform, string> = {
	youtube: 'YouTube',
	tiktok: 'TikTok',
	instagram: 'Instagram',
};
const tierLabel: Record<Tier, string> = {
	compleja: 'Compleja',
	intermedia: 'Intermedia',
	basica: 'Básica',
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Distancia (con signo) más corta de la pieza `i` al centro, admitiendo
// un `center` fraccionario para que el arrastre sea totalmente continuo.
function relDist(i: number, center: number, len: number) {
	let r = (((i - center) % len) + len) % len;
	if (r > len / 2) r -= len;
	return r;
}

// Mapas continuos de la distancia → posición/escala/opacidad/z. Son curvas
// suaves (no escalones) para que al deslizar las piezas se reacomoden fluido.
function bandX(r: number) {
	const a = Math.abs(r);
	const sign = r < 0 ? -1 : 1;
	let x: number;
	if (a <= 1) x = a * STEP;
	else if (a <= 2) x = lerp(STEP, STEP * 1.5, a - 1);
	else if (a <= 3) x = lerp(STEP * 1.5, STEP * 1.92, a - 2);
	else x = lerp(STEP * 1.92, STEP * 2.3, Math.min(a - 3, 1));
	return sign * x;
}
function bandScale(r: number) {
	const a = Math.abs(r);
	if (a <= 1) return 1;
	if (a <= 2) return lerp(1, 0.85, a - 1);
	if (a <= 3) return lerp(0.85, 0.72, a - 2);
	return Math.max(0.6, lerp(0.72, 0.6, Math.min(a - 3, 1)));
}
function bandOpacity(r: number) {
	const a = Math.abs(r);
	if (a <= 1) return 1;
	if (a <= 2) return lerp(1, 0.6, a - 1);
	if (a <= 3) return lerp(0.6, 0.32, a - 2);
	if (a <= 4) return lerp(0.32, 0, a - 3);
	return 0;
}
function bandZ(r: number) {
	const a = Math.abs(r);
	if (a <= 1) return 40;
	if (a <= 2) return 24;
	if (a <= 3) return 12;
	return 1;
}

const PlayIcon = () => (
	<svg width="42" height="42" viewBox="0 0 46 46" fill="none">
		<circle cx="23" cy="23" r="22" stroke="#f0eee8" strokeWidth="1.5" fill="rgba(0,0,0,.35)" />
		<path d="M19 15.5l12 7.5-12 7.5z" fill="#f0eee8" />
	</svg>
);

function Card({
	item,
	index,
	len,
	center,
	onOpen,
	onCenter,
}: {
	item: Vid;
	index: number;
	len: number;
	center: ReturnType<typeof useMotionValue<number>>;
	onOpen: (v: Vid) => void;
	onCenter: (i: number) => void;
}) {
	const transform = useTransform(center, (c) => {
		const r = relDist(index, c, len);
		return `translate(calc(-50% + ${bandX(r)}px), -50%) scale(${bandScale(r)})`;
	});
	const opacity = useTransform(center, (c) => bandOpacity(relDist(index, c, len)));
	const zIndex = useTransform(center, (c) => bandZ(relDist(index, c, len)));
	const visible = useTransform(center, (c) => (bandOpacity(relDist(index, c, len)) > 0 ? 'auto' : 'none'));

	const isFocus = (c: number) => Math.abs(relDist(index, c, len)) <= 1.0001;
	const [focus, setFocus] = useState(() => isFocus(center.get()));
	useMotionValueEvent(center, 'change', (c) => {
		const f = isFocus(c);
		setFocus((prev) => (prev === f ? prev : f));
	});

	return (
		<motion.button
			type="button"
			className={`vt-card${focus ? ' is-focus' : ''}`}
			data-index={index}
			aria-label={`Ver: ${item.title}`}
			style={{ transform, opacity, zIndex, pointerEvents: visible }}
			onClick={() => {
				if (focus) onOpen(item);
				else onCenter(index);
			}}
		>
			<motion.div
				className={`vt-thumb cat-${item.cat}`}
				whileHover={focus ? { y: -10, scale: 1.05 } : {}}
				transition={{ type: 'spring', stiffness: 320, damping: 22 }}
			>
				<img
					src={`/images/posters/${item.slug}.webp`}
					alt={item.title}
					loading="lazy"
					decoding="async"
					draggable={false}
				/>
				{item.tier ? (
					<span className={`vt-tier-tag tier-${item.tier}`} aria-hidden="true">
						{tierLabel[item.tier]}
					</span>
				) : null}
				<span className="vt-play" aria-hidden="true">
					<PlayIcon />
				</span>
				<div className="vt-meta">
					<div className="vt-title">{item.title}</div>
					{item.views ? <div className="vt-views">▶ {item.views} views</div> : null}
				</div>
			</motion.div>
		</motion.button>
	);
}

function Coverflow({ group, onOpen }: { group: Group; onOpen: (v: Vid) => void }) {
	const len = group.items.length;
	const center = useMotionValue(0);
	const drag = useRef({ down: false, dragging: false, startX: 0, startCenter: 0, moved: 0 });
	const anim = useRef<AnimationPlaybackControls | null>(null);

	const stop = () => {
		anim.current?.stop();
		anim.current = null;
	};

	// Snap suave (spring) hacia `target`; al terminar normaliza el centro al
	// rango [0,len) sin salto visible (el layout es cíclico).
	const snapTo = (target: number) => {
		stop();
		anim.current = animate(center, target, {
			type: 'spring',
			stiffness: 260,
			damping: 30,
			restDelta: 0.0005,
			onComplete: () => {
				const norm = ((target % len) + len) % len;
				center.set(norm);
			},
		});
	};

	const onCenter = (i: number) => {
		const r = relDist(i, center.get(), len);
		snapTo(center.get() + r);
	};

	useEffect(() => {
		const onMove = (e: PointerEvent) => {
			const d = drag.current;
			if (!d.down) return;
			const dx = e.clientX - d.startX;
			d.moved = Math.max(d.moved, Math.abs(dx));
			if (Math.abs(dx) > 4) d.dragging = true;
			// arrastre 1:1 (sin spring) para que siga al mouse de inmediato
			center.set(d.startCenter - dx / STEP);
		};
		const onUp = () => {
			const d = drag.current;
			if (!d.down) return;
			d.down = false;
			if (d.dragging) snapTo(Math.round(center.get()));
		};
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		return () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		};
	}, [center, len]);

	return (
		<div
			className="vt-coverflow"
			onPointerDown={(e) => {
				stop();
				drag.current = {
					down: true,
					dragging: false,
					startX: e.clientX,
					startCenter: center.get(),
					moved: 0,
				};
			}}
			onClickCapture={(e) => {
				// si hubo arrastre real, anula el click para no abrir el modal
				if (drag.current.moved > 6) {
					e.stopPropagation();
					e.preventDefault();
				}
			}}
		>
			{group.items.map((item, i) => (
				<Card
					key={item.slug}
					item={item}
					index={i}
					len={len}
					center={center}
					onOpen={onOpen}
					onCenter={onCenter}
				/>
			))}

			<button
				className="vt-nav prev"
				type="button"
				aria-label="Anterior"
				onClick={(e) => {
					e.stopPropagation();
					snapTo(Math.round(center.get()) - 1);
				}}
			>
				<svg width="12" height="20" viewBox="0 0 22 40" fill="none">
					<polyline points="17,4 5,20 17,36" stroke="currentColor" strokeWidth="1.6" fill="none" />
				</svg>
			</button>
			<button
				className="vt-nav next"
				type="button"
				aria-label="Siguiente"
				onClick={(e) => {
					e.stopPropagation();
					snapTo(Math.round(center.get()) + 1);
				}}
			>
				<svg width="12" height="20" viewBox="0 0 22 40" fill="none">
					<polyline points="5,4 17,20 5,36" stroke="currentColor" strokeWidth="1.6" fill="none" />
				</svg>
			</button>
		</div>
	);
}

function Modal({
	vid,
	onClose,
	onPrev,
	onNext,
}: {
	vid: Vid;
	onClose: () => void;
	onPrev: () => void;
	onNext: () => void;
}) {
	const vRef = useRef<HTMLVideoElement>(null);
	const sideRef = useRef<HTMLDivElement>(null);
	const scrollTO = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Al cambiar de vídeo (también al navegar con las flechas) recargamos el clip,
	// lo reproducimos desde el inicio y devolvemos el panel de info al tope.
	useEffect(() => {
		const v = vRef.current;
		if (v) {
			v.load();
			v.play().catch(() => {});
		}
		sideRef.current?.scrollTo({ top: 0 });
	}, [vid]);
	useEffect(() => () => {
		if (scrollTO.current) clearTimeout(scrollTO.current);
	}, []);

	// El scrollbar del panel está oculto por defecto y sólo asoma mientras se
	// scrollea: marcamos `is-scrolling` y la retiramos tras una pausa.
	const onSideScroll = () => {
		const el = sideRef.current;
		if (!el) return;
		el.classList.add('is-scrolling');
		if (scrollTO.current) clearTimeout(scrollTO.current);
		scrollTO.current = setTimeout(() => el.classList.remove('is-scrolling'), 700);
	};

	return (
		<div className="vt-modal">
			<motion.div
				className="vt-modal-backdrop"
				onClick={onClose}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2 }}
			/>
			<button className="vt-modal-nav prev" type="button" onClick={onPrev} aria-label="Vídeo anterior">
				<svg width="13" height="22" viewBox="0 0 22 40" fill="none">
					<polyline points="17,4 5,20 17,36" stroke="currentColor" strokeWidth="1.6" fill="none" />
				</svg>
			</button>
			<button className="vt-modal-nav next" type="button" onClick={onNext} aria-label="Vídeo siguiente">
				<svg width="13" height="22" viewBox="0 0 22 40" fill="none">
					<polyline points="5,4 17,20 5,36" stroke="currentColor" strokeWidth="1.6" fill="none" />
				</svg>
			</button>
			<motion.div
				className="vt-modal-dialog"
				role="dialog"
				aria-modal="true"
				aria-label="Reproductor de vídeo"
				initial={{ opacity: 0, y: 14, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: 14, scale: 0.98 }}
				transition={{ type: 'spring', stiffness: 320, damping: 30 }}
			>
				<button className="vt-modal-x" type="button" onClick={onClose} aria-label="Cerrar">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
						<line x1="5" y1="5" x2="19" y2="19" />
						<line x1="19" y1="5" x2="5" y2="19" />
					</svg>
				</button>
				<div className="vt-modal-player">
					<video ref={vRef} src={`/videos/${vid.slug}.mp4`} controls playsInline preload="auto" />
				</div>
				<div className="vt-modal-side" ref={sideRef} onScroll={onSideScroll}>
					<div className="vt-modal-tags">
						<div className={`vt-modal-cat cat-${vid.cat}`}>{vid.cat === 'gaming' ? 'GAMING' : 'DANCE'}</div>
						{vid.tier ? <div className={`vt-modal-tier tier-${vid.tier}`}>{tierLabel[vid.tier]}</div> : null}
					</div>
					<h3 className="vt-modal-title">{vid.title}</h3>
					{vid.views ? <div className="vt-modal-views">▶ {vid.views} views</div> : null}
					{vid.summary ? <div className="vt-modal-summary">{vid.summary}</div> : null}
					{vid.details && vid.details.length > 0 ? (
						<>
							<div className="vt-modal-links-label">QUÉ INCLUYE ESTA EDICIÓN</div>
							<ul className={`vt-modal-details cat-${vid.cat}`}>
								{vid.details.map((d, i) => (
									<li key={i}>{d}</li>
								))}
							</ul>
						</>
					) : null}
					<div className="vt-modal-links-label">MIRALO EN SU PLATAFORMA</div>
					<div className="vt-modal-links" id="vt-modal-links">
						{vid.links.map((l, i) => (
							<a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className={`vt-link plat-${l.platform}`}>
								<span className="vt-link-name">{platName[l.platform] ?? l.platform}</span>
								<span className="vt-link-sub">
									{l.views ? `${l.views} views` : 'Ver original'}
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
										<path d="M7 17 17 7" />
										<path d="M9 7h8v8" />
									</svg>
								</span>
							</a>
						))}
					</div>
				</div>
			</motion.div>
		</div>
	);
}

export default function VerticalGallery({ groups }: { groups: Group[] }) {
	const [active, setActive] = useState<Vid | null>(null);

	// Vecino cíclico dentro del mismo grupo (misma categoría del carrusel).
	const neighbor = (cur: Vid, dir: 1 | -1): Vid => {
		const g = groups.find((gr) => gr.items.some((it) => it.slug === cur.slug));
		if (!g) return cur;
		const i = g.items.findIndex((it) => it.slug === cur.slug);
		return g.items[(i + dir + g.items.length) % g.items.length];
	};

	useEffect(() => {
		if (!active) return;
		document.body.style.overflow = 'hidden';
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setActive(null);
				return;
			}
			// Si el foco está en el <video>, dejamos que las flechas hagan seek nativo.
			if (e.target instanceof HTMLMediaElement) return;
			if (e.key === 'ArrowRight') setActive((cur) => (cur ? neighbor(cur, 1) : cur));
			else if (e.key === 'ArrowLeft') setActive((cur) => (cur ? neighbor(cur, -1) : cur));
		};
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [active]);

	return (
		<>
			{groups.map((g) => (
				<div className="vt-group" key={g.key}>
					<div className="vt-group-head">
						<span className={`vt-dot cat-${g.key}`} />
						{g.label}
						<span className="vt-count">{g.items.length}</span>
					</div>
					<Coverflow group={g} onOpen={setActive} />
				</div>
			))}

			<AnimatePresence>
				{active ? (
					<Modal
						vid={active}
						onClose={() => setActive(null)}
						onPrev={() => setActive(neighbor(active, -1))}
						onNext={() => setActive(neighbor(active, 1))}
					/>
				) : null}
			</AnimatePresence>
		</>
	);
}
