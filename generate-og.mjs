// Genera la imagen de previsualización de enlaces (Open Graph) a partir de los
// mismos assets del hero: fondo texturado + título "EDITOR DE VIDEO" + collage.
// Resultado: public/og.jpg (1200×630, el tamaño estándar para OG/Twitter).
// Regenerar cuando cambien esos assets:  node generate-og.mjs
import sharp from 'sharp';

const W = 1200;
const H = 630;

// Fondo: recorte superior del textura oscura, a tamaño OG.
const bg = await sharp('public/images/background.webp')
	.resize(W, H, { fit: 'cover', position: 'top' })
	.toBuffer();

// Capa de oscurecido para unificar el fondo y que el título/textos resalten.
const overlay = await sharp({
	create: { width: W, height: H, channels: 4, background: { r: 8, g: 8, b: 10, alpha: 0.5 } },
})
	.png()
	.toBuffer();

// Collage (persona) a la derecha.
const collageH = 604;
const collage = await sharp('public/images/hero-collage.webp').resize({ height: collageH }).toBuffer();
const cMeta = await sharp(collage).metadata();
const collageLeft = W - cMeta.width - 34;
const collageTop = Math.round((H - collageH) / 2);

// Título "EDITOR DE VIDEO" a la izquierda.
const titleW = 460;
const title = await sharp('public/images/titulo-editor.png').resize({ width: titleW }).toBuffer();
const titleLeft = 70;
const titleTop = 190;

// Textos (nombre, eyebrow y claim). Arial como fallback seguro para el render.
const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <text x="74" y="82" font-family="Arial, sans-serif" font-size="27" font-weight="700" letter-spacing="2" fill="#e6e4de">PABLO CÁCERES</text>
  <text x="74" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="600" letter-spacing="4" fill="#eceae4">EDITOR &amp; FILMMAKER</text>
  <text x="74" y="500" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="3" fill="#cf2e2e">YOUTUBE · REELS · SHORTS · TIKTOKS</text>
</svg>`;
const svgBuf = Buffer.from(svg);

await sharp(bg)
	.composite([
		{ input: overlay, top: 0, left: 0 },
		{ input: collage, top: collageTop, left: collageLeft },
		{ input: title, top: titleTop, left: titleLeft },
		{ input: svgBuf, top: 0, left: 0 },
	])
	.jpeg({ quality: 84 })
	.toFile('public/og.jpg');

console.log('OK → public/og.jpg', `${W}x${H}`, '| collage', `${cMeta.width}x${cMeta.height}`);
