// Typewriter — island de React (Framer Motion `useInView`).
// Cuando el elemento entra en pantalla, "escribe" el texto carácter a carácter con
// un cursor parpadeante. Reserva el ancho final (texto oculto) para que el layout
// de al lado (p. ej. la línea divisoria del encabezado) no salte mientras tipea.
import { createElement, useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

type Props = {
	text: string;
	as?: React.ElementType;
	className?: string;
	style?: React.CSSProperties;
	speed?: number; // ms por carácter
};

export default function TypeIn({ text, as = 'h2', className, style, speed = 42 }: Props) {
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, amount: 0.6 });
	const [n, setN] = useState(0);

	useEffect(() => {
		if (!inView) return;
		let i = 0;
		const id = setInterval(() => {
			i += 1;
			setN(i);
			if (i >= text.length) clearInterval(id);
		}, speed);
		return () => clearInterval(id);
	}, [inView, text, speed]);

	const done = n >= text.length;

	return createElement(
		as,
		{ ref, className, style: { ...style, position: 'relative' }, 'aria-label': text },
		createElement('span', { 'aria-hidden': true, style: { visibility: 'hidden' } }, text),
		createElement(
			'span',
			{ 'aria-hidden': true, style: { position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap' } },
			text.slice(0, n),
			!done && inView ? createElement('span', { className: 'type-caret' }) : null
		)
	);
}
