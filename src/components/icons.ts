const SVG_NS = "http://www.w3.org/2000/svg";

function svg(width: number, height: number): SVGSVGElement {
  const el = document.createElementNS(SVG_NS, "svg");
  el.setAttribute("focusable", "false");
  el.setAttribute("width", String(width));
  el.setAttribute("height", String(height));
  el.setAttribute("viewBox", "0 0 24 24");
  return el;
}

function path(d: string): SVGPathElement {
  const el = document.createElementNS(SVG_NS, "path");
  el.setAttribute("d", d);
  return el;
}

export function createSpeakerIcon(): SVGSVGElement {
  const s = svg(20, 20);
  s.appendChild(
    path(
      "M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
    )
  );
  s.appendChild(
    path(
      "M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"
    )
  );
  return s;
}

export function createStopIcon(): SVGSVGElement {
  const s = svg(20, 20);
  s.appendChild(path("M6,6h12v12H6V6z"));
  return s;
}

export function createCopyIcon(): SVGSVGElement {
  const s = svg(20, 20);
  const g1 = document.createElementNS(SVG_NS, "g");
  g1.appendChild(rect("none", 24, 24));
  s.appendChild(g1);
  const g2 = document.createElementNS(SVG_NS, "g");
  g2.appendChild(
    path(
      "M16,20H5V6H3v14c0,1.1,0.9,2,2,2h11V20z M20,16V4c0-1.1-0.9-2-2-2H9C7.9,2,7,2.9,7,4v12c0,1.1,0.9,2,2,2h9 C19.1,18,20,17.1,20,16z M18,16H9V4h9V16z"
    )
  );
  s.appendChild(g2);
  return s;
}

function rect(
  fill: string,
  width: number,
  height: number
): SVGRectElement {
  const el = document.createElementNS(SVG_NS, "rect");
  el.setAttribute("fill", fill);
  el.setAttribute("width", String(width));
  el.setAttribute("height", String(height));
  return el;
}
