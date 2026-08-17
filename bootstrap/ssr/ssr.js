import { Head, Link, createInertiaApp, router, useForm, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { createPortal } from "react-dom";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region resources/js/components/admin/AdminTrendChart.jsx
/**
* Hand-rolled SVG line chart. The admin bundle has no charting dependency and
* a handful of series over a year of points does not justify adding one.
*/
var SERIES = [
	{
		key: "signups",
		label: "Sign ups",
		color: "#ff2d78"
	},
	{
		key: "trialing",
		label: "Trialing",
		color: "#f5c518"
	},
	{
		key: "paid",
		label: "Active paid",
		color: "#6d8bff"
	}
];
var WIDTH = 960;
var HEIGHT = 300;
var PAD = {
	top: 16,
	right: 12,
	bottom: 26,
	left: 30
};
function niceMax(value) {
	if (value <= 4) return 4;
	const magnitude = 10 ** Math.floor(Math.log10(value));
	return Math.ceil(value / magnitude) * magnitude;
}
/**
* Catmull-Rom through the points, converted to cubic beziers. This is what
* gives the reference look its soft peaks instead of hard polyline corners.
*/
function smoothPath(coords) {
	if (coords.length === 0) return "";
	if (coords.length < 3) return coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ");
	let path = `M${coords[0][0]},${coords[0][1]}`;
	for (let i = 0; i < coords.length - 1; i += 1) {
		const p0 = coords[i - 1] ?? coords[i];
		const p1 = coords[i];
		const p2 = coords[i + 1];
		const p3 = coords[i + 2] ?? p2;
		const c1x = p1[0] + (p2[0] - p0[0]) / 6;
		const c1y = p1[1] + (p2[1] - p0[1]) / 6;
		const c2x = p2[0] - (p3[0] - p1[0]) / 6;
		const c2y = p2[1] - (p3[1] - p1[1]) / 6;
		path += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
	}
	return path;
}
function AdminTrendChart({ points = [] }) {
	const [hidden, setHidden] = useState({});
	const [hoverIndex, setHoverIndex] = useState(null);
	const visible = SERIES.filter((series) => !hidden[series.key]);
	const { max, xFor, yFor, plotWidth, baseline } = useMemo(() => {
		const ceiling = niceMax(points.reduce((peak, point) => visible.reduce((inner, series) => Math.max(inner, point[series.key] ?? 0), peak), 0));
		const innerWidth = WIDTH - PAD.left - PAD.right;
		const innerHeight = HEIGHT - PAD.top - PAD.bottom;
		const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;
		return {
			max: ceiling,
			plotWidth: innerWidth,
			baseline: PAD.top + innerHeight,
			xFor: (index) => PAD.left + index * step,
			yFor: (value) => PAD.top + innerHeight - (ceiling === 0 ? 0 : value / ceiling * innerHeight)
		};
	}, [points, visible]);
	if (points.length === 0) return /* @__PURE__ */ jsx("p", {
		className: "px-4 py-16 text-center text-[13px] text-white/45",
		children: "No snapshots captured yet."
	});
	const gridLines = [
		0,
		.25,
		.5,
		.75,
		1
	];
	const active = hoverIndex === null ? null : points[hoverIndex];
	const labelEvery = Math.max(1, Math.ceil(points.length / 14));
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("div", {
			className: "mb-4 flex flex-wrap items-center gap-2",
			children: SERIES.map((series) => {
				const off = hidden[series.key];
				return /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setHidden((current) => ({
						...current,
						[series.key]: !current[series.key]
					})),
					className: "rounded-full border px-2.5 py-1 text-[10.5px] font-semibold tracking-[.1em] uppercase transition",
					style: {
						borderColor: off ? "rgba(255,255,255,.1)" : `${series.color}66`,
						color: off ? "rgba(255,255,255,.28)" : series.color,
						backgroundColor: off ? "transparent" : `${series.color}14`
					},
					children: series.label
				}, series.key);
			})
		}),
		/* @__PURE__ */ jsxs("svg", {
			viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
			className: "h-[300px] w-full",
			onMouseLeave: () => setHoverIndex(null),
			onMouseMove: (event) => {
				const bounds = event.currentTarget.getBoundingClientRect();
				const ratio = (event.clientX - bounds.left) / bounds.width * WIDTH;
				const index = Math.round((ratio - PAD.left) / plotWidth * (points.length - 1));
				setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
			},
			children: [
				/* @__PURE__ */ jsx("defs", { children: SERIES.map((series) => /* @__PURE__ */ jsxs("linearGradient", {
					id: `fill-${series.key}`,
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ jsx("stop", {
						offset: "0%",
						stopColor: series.color,
						stopOpacity: "0.22"
					}), /* @__PURE__ */ jsx("stop", {
						offset: "100%",
						stopColor: series.color,
						stopOpacity: "0"
					})]
				}, series.key)) }),
				gridLines.map((ratio) => {
					const y = PAD.top + (HEIGHT - PAD.top - PAD.bottom) * ratio;
					return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
						x1: PAD.left,
						x2: WIDTH - PAD.right,
						y1: y,
						y2: y,
						stroke: "rgba(255,255,255,.05)"
					}), /* @__PURE__ */ jsx("text", {
						x: 0,
						y: y + 3,
						fill: "rgba(255,255,255,.3)",
						fontSize: "10",
						children: Math.round(max * (1 - ratio))
					})] }, ratio);
				}),
				visible.map((series) => {
					const coords = points.map((point, index) => [xFor(index), yFor(point[series.key] ?? 0)]);
					const line = smoothPath(coords);
					return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("path", {
						d: `${line} L${coords[coords.length - 1][0]},${baseline} L${coords[0][0]},${baseline} Z`,
						fill: `url(#fill-${series.key})`
					}), /* @__PURE__ */ jsx("path", {
						d: line,
						fill: "none",
						stroke: series.color,
						strokeWidth: "2.25",
						strokeLinecap: "round"
					})] }, series.key);
				}),
				hoverIndex !== null && /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
					x1: xFor(hoverIndex),
					x2: xFor(hoverIndex),
					y1: PAD.top,
					y2: baseline,
					stroke: "rgba(255,255,255,.2)"
				}), visible.map((series) => /* @__PURE__ */ jsx("circle", {
					cx: xFor(hoverIndex),
					cy: yFor(points[hoverIndex][series.key] ?? 0),
					r: "3.5",
					fill: "#0b0e1c",
					stroke: series.color,
					strokeWidth: "2"
				}, series.key))] }),
				points.map((point, index) => index % labelEvery === 0 ? /* @__PURE__ */ jsx("text", {
					x: xFor(index),
					y: 292,
					fill: "rgba(255,255,255,.3)",
					fontSize: "9.5",
					textAnchor: "middle",
					children: point.label
				}, point.date) : null)
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-2 flex min-h-[18px] flex-wrap items-center gap-4 text-[12px] text-white/55",
			children: active && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
				className: "font-medium text-white/80",
				children: active.label
			}), visible.map((series) => /* @__PURE__ */ jsxs("span", { children: [
				/* @__PURE__ */ jsx("span", {
					style: { color: series.color },
					children: series.label
				}),
				" ",
				/* @__PURE__ */ jsx("span", {
					className: "text-white",
					children: active[series.key]
				})
			] }, series.key))] })
		})
	] });
}
//#endregion
//#region resources/js/landing/components/Icons.jsx
var Logo = ({ className = "h-7 w-7" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 32 32",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [
		/* @__PURE__ */ jsx("rect", {
			width: "32",
			height: "32",
			rx: "10",
			fill: "#FFC629"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "16",
			cy: "16",
			r: "3.1",
			fill: "#1A1400"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M21 11.6a6.2 6.2 0 0 1 0 8.8M11 11.6a6.2 6.2 0 0 0 0 8.8",
			stroke: "#1A1400",
			strokeWidth: "2.5",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M25.2 7.6a11.9 11.9 0 0 1 0 16.8M6.8 7.6a11.9 11.9 0 0 0 0 16.8",
			stroke: "#1A1400",
			strokeWidth: "2.5",
			strokeLinecap: "round"
		})
	]
});
var Sun = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 24 24",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [/* @__PURE__ */ jsx("circle", {
		cx: "12",
		cy: "12",
		r: "4.2",
		stroke: "currentColor",
		strokeWidth: "1.8"
	}), /* @__PURE__ */ jsx("path", {
		d: "M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round"
	})]
});
var Check = ({ className = "h-3 w-3" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 12 12",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M2 6.5 L5 9 L10 3",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	})
});
var Arrow = ({ className = "h-3.5 w-3.5" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M3 8h9M8.5 4l4 4-4 4",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	})
});
var Trend = ({ className = "h-3 w-3" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 12 12",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [/* @__PURE__ */ jsx("path", {
		d: "M2 9 L5 5 L7.5 7 L10.5 2.5",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	}), /* @__PURE__ */ jsx("path", {
		d: "M7.6 2.5h3v3",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	})]
});
var Heart = ({ className = "h-3.5 w-3.5" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M8 13.5S2 10 2 6.2A3.2 3.2 0 0 1 8 4.6a3.2 3.2 0 0 1 6 1.6C14 10 8 13.5 8 13.5Z",
		stroke: "currentColor",
		strokeWidth: "1.5",
		strokeLinejoin: "round"
	})
});
var Comment = ({ className = "h-3.5 w-3.5" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M13.5 9.5a2 2 0 0 1-2 2H6l-3 2.5v-2.5H4.5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2Z",
		stroke: "currentColor",
		strokeWidth: "1.4",
		strokeLinejoin: "round"
	})
});
var Share = ({ className = "h-3.5 w-3.5" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [
		/* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "3.5",
			r: "2",
			stroke: "currentColor",
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "4",
			cy: "8",
			r: "2",
			stroke: "currentColor",
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "12.5",
			r: "2",
			stroke: "currentColor",
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M10.2 4.6 L5.8 7 M5.8 9 L10.2 11.4",
			stroke: "currentColor",
			strokeWidth: "1.4"
		})
	]
});
var Bookmark = ({ className = "h-3.5 w-3.5", filled = false }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 16 16",
	fill: filled ? "currentColor" : "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M4 2.5h8a1 1 0 0 1 1 1v10l-5-2.8L3 13.5v-10a1 1 0 0 1 1-1Z",
		stroke: "currentColor",
		strokeWidth: "1.4",
		strokeLinejoin: "round"
	})
});
var Play = ({ className = "h-3.5 w-3.5" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 16 16",
	fill: "currentColor",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", { d: "M5 3.2 12.5 8 5 12.8Z" })
});
var Chevron = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M4 6l4 4 4-4",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	})
});
var Menu = ({ className = "h-5 w-5" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 24 24",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M4 7h16M4 12h16M4 17h16",
		stroke: "currentColor",
		strokeWidth: "1.9",
		strokeLinecap: "round"
	})
});
var Close = ({ className = "h-5 w-5" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 24 24",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M6 6l12 12M18 6L6 18",
		stroke: "currentColor",
		strokeWidth: "1.9",
		strokeLinecap: "round"
	})
});
var Plus = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M8 3v10M3 8h10",
		stroke: "currentColor",
		strokeWidth: "1.9",
		strokeLinecap: "round"
	})
});
var Search = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [/* @__PURE__ */ jsx("circle", {
		cx: "7",
		cy: "7",
		r: "4.4",
		stroke: "currentColor",
		strokeWidth: "1.5"
	}), /* @__PURE__ */ jsx("path", {
		d: "M10.3 10.3 13.5 13.5",
		stroke: "currentColor",
		strokeWidth: "1.5",
		strokeLinecap: "round"
	})]
});
var Library = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [
		/* @__PURE__ */ jsx("rect", {
			x: "2.2",
			y: "2.5",
			width: "4",
			height: "11",
			rx: "1.3",
			stroke: "currentColor",
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "7.6",
			y: "2.5",
			width: "3.2",
			height: "11",
			rx: "1.3",
			stroke: "currentColor",
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M12.3 3.6 14.3 12.4",
			stroke: "currentColor",
			strokeWidth: "1.4",
			strokeLinecap: "round"
		})
	]
});
var Store = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [/* @__PURE__ */ jsx("path", {
		d: "M2.6 6.2 3.6 2.8h8.8l1 3.4a2 2 0 0 1-3.8.9 2 2 0 0 1-3.6 0 2 2 0 0 1-3.4-.9Z",
		stroke: "currentColor",
		strokeWidth: "1.3",
		strokeLinejoin: "round"
	}), /* @__PURE__ */ jsx("path", {
		d: "M3.4 8.2v4.4a.8.8 0 0 0 .8.8h7.6a.8.8 0 0 0 .8-.8V8.2",
		stroke: "currentColor",
		strokeWidth: "1.3",
		strokeLinecap: "round"
	})]
});
var Target = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [
		/* @__PURE__ */ jsx("circle", {
			cx: "8",
			cy: "8",
			r: "5.6",
			stroke: "currentColor",
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "8",
			cy: "8",
			r: "2.6",
			stroke: "currentColor",
			strokeWidth: "1.4"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "8",
			cy: "8",
			r: ".9",
			fill: "currentColor"
		})
	]
});
var User = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [/* @__PURE__ */ jsx("circle", {
		cx: "8",
		cy: "5.6",
		r: "2.7",
		stroke: "currentColor",
		strokeWidth: "1.4"
	}), /* @__PURE__ */ jsx("path", {
		d: "M2.9 13.4a5.1 5.1 0 0 1 10.2 0",
		stroke: "currentColor",
		strokeWidth: "1.4",
		strokeLinecap: "round"
	})]
});
var Exit = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [/* @__PURE__ */ jsx("path", {
		d: "M6.4 2.6H3.6a1 1 0 0 0-1 1v8.8a1 1 0 0 0 1 1h2.8",
		stroke: "currentColor",
		strokeWidth: "1.4",
		strokeLinecap: "round"
	}), /* @__PURE__ */ jsx("path", {
		d: "M10 5.2 12.8 8l-2.8 2.8M12.4 8H6.2",
		stroke: "currentColor",
		strokeWidth: "1.4",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	})]
});
var Spark = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M8 1.8 9.5 6.1 13.8 7.6 9.5 9.1 8 13.4 6.5 9.1 2.2 7.6 6.5 6.1Z",
		stroke: "currentColor",
		strokeWidth: "1.3",
		strokeLinejoin: "round"
	})
});
var Google = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 24 24",
	className,
	"aria-hidden": "true",
	children: [
		/* @__PURE__ */ jsx("path", {
			fill: "#4285F4",
			d: "M23 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.16a5.27 5.27 0 0 1-2.29 3.46v2.87h3.7C21.73 18.8 23 15.8 23 12.27Z"
		}),
		/* @__PURE__ */ jsx("path", {
			fill: "#34A853",
			d: "M12 23.5c3.1 0 5.7-1.03 7.6-2.79l-3.71-2.87c-1.03.69-2.35 1.1-3.89 1.1-2.99 0-5.52-2.02-6.43-4.73H1.74v2.96A11.5 11.5 0 0 0 12 23.5Z"
		}),
		/* @__PURE__ */ jsx("path", {
			fill: "#FBBC05",
			d: "M5.57 14.21a6.9 6.9 0 0 1 0-4.42V6.83H1.74a11.5 11.5 0 0 0 0 10.34l3.83-2.96Z"
		}),
		/* @__PURE__ */ jsx("path", {
			fill: "#EA4335",
			d: "M12 5.06c1.69 0 3.2.58 4.4 1.72l3.28-3.28C17.7 1.63 15.1.5 12 .5A11.5 11.5 0 0 0 1.74 6.83l3.83 2.96C6.48 7.08 9.01 5.06 12 5.06Z"
		})
	]
});
var Lock = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 16 16",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [/* @__PURE__ */ jsx("rect", {
		x: "3",
		y: "7",
		width: "10",
		height: "6.5",
		rx: "1.6",
		stroke: "currentColor",
		strokeWidth: "1.4"
	}), /* @__PURE__ */ jsx("path", {
		d: "M5.2 7V5.8a2.8 2.8 0 1 1 5.6 0V7",
		stroke: "currentColor",
		strokeWidth: "1.4",
		strokeLinecap: "round"
	})]
});
var Refresh = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 24 24",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [/* @__PURE__ */ jsx("path", {
		d: "M21 12a9 9 0 1 1-2.6-6.4",
		stroke: "currentColor",
		strokeWidth: "2.2",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	}), /* @__PURE__ */ jsx("path", {
		d: "M21 3v6h-6",
		stroke: "currentColor",
		strokeWidth: "2.2",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	})]
});
var Dots = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 16 16",
	fill: "currentColor",
	className,
	"aria-hidden": "true",
	children: [
		/* @__PURE__ */ jsx("circle", {
			cx: "3",
			cy: "8",
			r: "1.2"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "8",
			cy: "8",
			r: "1.2"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "13",
			cy: "8",
			r: "1.2"
		})
	]
});
//#endregion
//#region resources/js/Pages/Admin/components/AdminLayout.jsx
var AdminLayout_exports = /* @__PURE__ */ __exportAll({ default: () => AdminLayout });
var NAV_GROUPS = [
	{
		label: null,
		items: [{
			key: "dashboard",
			label: "Dashboard",
			href: "/x/admin",
			description: "Growth and usage",
			icon: "DA"
		}]
	},
	{
		label: "Content",
		items: [
			{
				key: "viral-videos",
				label: "Viral Videos",
				href: "/x/admin/viral-videos",
				description: "Video library",
				icon: "VI"
			},
			{
				key: "searches",
				label: "Searches",
				href: "/x/admin/searches",
				description: "Search runs",
				icon: "SE"
			},
			{
				key: "inquiries",
				label: "Inquiries",
				href: "/x/admin/inquiries",
				description: "Contact inbox",
				icon: "IN"
			},
			{
				key: "plans",
				label: "Plans",
				href: "/x/admin/plans",
				description: "Pricing setup",
				icon: "PL"
			}
		]
	},
	{
		label: "Subscription Management",
		items: [{
			key: "subscription",
			label: "Subscription",
			href: "/x/admin/subscription",
			description: "Billing control",
			icon: "SU"
		}]
	},
	{
		label: "User Management",
		items: [{
			key: "users",
			label: "Users",
			href: "/x/admin/users",
			description: "Customer accounts",
			icon: "US"
		}, {
			key: "admin-users",
			label: "Admin Users",
			href: "/x/admin/users/admin-users",
			description: "Staff access",
			icon: "AD"
		}]
	}
];
function defaultExpandedState(currentPath, section) {
	return NAV_GROUPS.reduce((state, group) => {
		if (!group.label) return state;
		state[group.label] = group.items.some((item) => section === item.key || currentPath === item.href);
		return state;
	}, {});
}
function NavItem({ item, active, onNavigate }) {
	return /* @__PURE__ */ jsxs(Link, {
		href: item.href,
		onClick: onNavigate,
		className: `group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition ${active ? "bg-[var(--wash)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-white hover:text-[var(--ink)]"}`,
		children: [/* @__PURE__ */ jsx("span", {
			className: `flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tracking-[.06em] ${active ? "bg-[var(--yellow)] text-[#1a1400]" : "bg-[var(--canvas)] text-[var(--faint)]"}`,
			children: item.icon
		}), /* @__PURE__ */ jsx("span", {
			className: "min-w-0 truncate text-[13px] font-medium",
			children: item.label
		})]
	});
}
function SidebarAccount({ adminUser, onSignOut }) {
	return /* @__PURE__ */ jsx("div", {
		className: "mt-4 shrink-0 border-t border-[var(--line)] pt-3",
		children: /* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: onSignOut,
			className: "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)]",
			children: [/* @__PURE__ */ jsx("span", {
				className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--canvas)]",
				children: /* @__PURE__ */ jsx(Exit, { className: "h-3.5 w-3.5 text-[var(--warn)]" })
			}), /* @__PURE__ */ jsxs("span", {
				className: "min-w-0",
				children: [/* @__PURE__ */ jsx("span", {
					className: "block text-[13px] font-medium",
					children: "Log out"
				}), /* @__PURE__ */ jsx("span", {
					className: "block truncate text-[11px] text-[var(--faint)]",
					children: adminUser?.email ?? "Admin session"
				})]
			})]
		})
	});
}
function Sidebar({ currentPath, section, onNavigate, closable = false, adminUser, onSignOut }) {
	const [expandedGroups, setExpandedGroups] = useState(() => defaultExpandedState(currentPath, section));
	useEffect(() => {
		setExpandedGroups((current) => {
			const next = { ...current };
			NAV_GROUPS.forEach((group) => {
				if (!group.label) return;
				if (group.items.some((item) => section === item.key || currentPath === item.href)) next[group.label] = true;
				else if (!(group.label in next)) next[group.label] = false;
			});
			return next;
		});
	}, [currentPath, section]);
	const toggleGroup = (label) => {
		setExpandedGroups((current) => ({
			...current,
			[label]: !current[label]
		}));
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-start justify-between gap-3 px-1",
			children: [/* @__PURE__ */ jsxs(Link, {
				href: "/x/admin",
				onClick: onNavigate,
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ jsx(Logo, { className: "h-8 w-8" }), /* @__PURE__ */ jsxs("span", {
					className: "leading-none",
					children: [/* @__PURE__ */ jsx("span", {
						className: "block text-[13px] font-bold tracking-[.22em] text-[var(--ink)] uppercase",
						children: "Admin"
					}), /* @__PURE__ */ jsx("span", {
						className: "mt-0.5 block text-[10px] text-[var(--faint)]",
						children: "Operations cockpit"
					})]
				})]
			}), closable ? /* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Close menu",
				onClick: onNavigate,
				className: "flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line)] text-[var(--faint)] transition hover:bg-white hover:text-[var(--ink)]",
				children: /* @__PURE__ */ jsx(Close, { className: "h-4 w-4" })
			}) : null]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-6 flex min-h-0 flex-1 flex-col",
			children: [/* @__PURE__ */ jsx("div", {
				className: "min-h-0 flex-1 space-y-4 overflow-y-auto pr-1",
				children: NAV_GROUPS.map((group) => /* @__PURE__ */ jsx("section", {
					className: "space-y-1",
					children: group.label ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: () => toggleGroup(group.label),
						className: "flex w-full items-center justify-between gap-3 px-2 text-left px-2.5 py-1 text-[10px] font-semibold tracking-[.14em] text-[var(--faint)] uppercase transition hover:text-[var(--ink)]",
						"aria-expanded": expandedGroups[group.label] === true,
						children: [/* @__PURE__ */ jsx("span", { children: group.label }), /* @__PURE__ */ jsx(Chevron, { className: `h-3.5 w-3.5 transition ${expandedGroups[group.label] ? "rotate-180 text-[var(--muted)]" : "text-[var(--faint)]"}` })]
					}), expandedGroups[group.label] && /* @__PURE__ */ jsx("div", {
						className: "space-y-0.5",
						children: group.items.map((item) => /* @__PURE__ */ jsx(NavItem, {
							item,
							active: section === item.key || currentPath === item.href,
							onNavigate
						}, item.key))
					})] }) : /* @__PURE__ */ jsx("div", {
						className: "space-y-0.5",
						children: group.items.map((item) => /* @__PURE__ */ jsx(NavItem, {
							item,
							active: section === item.key || currentPath === item.href,
							onNavigate
						}, item.key))
					})
				}, group.label ?? "top"))
			}), /* @__PURE__ */ jsx(SidebarAccount, {
				adminUser,
				onSignOut
			})]
		})]
	});
}
function AdminLayout({ title, section, children, toolbar = null, actions = null, showHeader = true }) {
	const { props, url } = usePage();
	const logout = useForm({});
	const [drawerOpen, setDrawerOpen] = useState(false);
	const adminUser = props.admin?.user ?? props.adminUser ?? null;
	useEffect(() => {
		if (typeof document === "undefined") return;
		document.documentElement.classList.remove("dark");
	}, []);
	useEffect(() => {
		if (typeof document === "undefined") return;
		document.body.style.overflow = drawerOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [drawerOpen]);
	const currentPath = useMemo(() => (url || "").split("?")[0], [url]);
	const signOut = () => {
		setDrawerOpen(false);
		logout.post("/x/admin/logout");
	};
	const breadcrumbGroup = useMemo(() => NAV_GROUPS.find((group) => group.items.some((item) => section === item.key || currentPath === item.href))?.label ?? null, [currentPath, section]);
	return /* @__PURE__ */ jsxs("div", {
		className: "admin-shell min-h-screen bg-[var(--canvas)] text-[var(--ink)]",
		children: [
			/* @__PURE__ */ jsx(Head, { title: `${title} - Admin - Outlier Vault` }),
			/* @__PURE__ */ jsx("div", {
				"aria-hidden": true,
				className: "pointer-events-none fixed inset-0 overflow-hidden",
				children: /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,198,41,.22),_transparent_42%)]" })
			}),
			/* @__PURE__ */ jsx("aside", {
				className: "fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[var(--line)] bg-[var(--paper)] px-3 py-4 backdrop-blur-xl lg:block",
				children: /* @__PURE__ */ jsx(Sidebar, {
					currentPath,
					section,
					adminUser,
					onSignOut: signOut
				})
			}),
			/* @__PURE__ */ jsx("header", {
				className: "sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(250,249,246,.92)] backdrop-blur-xl lg:hidden",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between px-4 py-4",
					children: [/* @__PURE__ */ jsxs(Link, {
						href: "/x/admin",
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx(Logo, { className: "h-9 w-9" }), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
							className: "block text-[14px] font-bold tracking-[.2em] uppercase",
							children: "Admin"
						}), /* @__PURE__ */ jsx("span", {
							className: "block text-[10px] text-[var(--faint)]",
							children: "Operations cockpit"
						})] })]
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setDrawerOpen((open) => !open),
						className: "flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--ink)]",
						children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
					})]
				})
			}),
			drawerOpen && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 lg:hidden",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "Close menu",
					onClick: () => setDrawerOpen(false),
					className: "absolute inset-0 bg-[rgba(11,11,11,.38)] backdrop-blur-sm"
				}), /* @__PURE__ */ jsx("div", {
					className: "absolute top-0 left-0 h-full w-[min(290px,88vw)] border-r border-[var(--line)] bg-[var(--paper)] px-4 py-5",
					children: /* @__PURE__ */ jsx(Sidebar, {
						currentPath,
						section,
						onNavigate: () => setDrawerOpen(false),
						closable: true,
						adminUser,
						onSignOut: signOut
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative lg:pl-[248px]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "sticky top-0 z-30 hidden h-11 items-center justify-between border-b border-[var(--line)] bg-[rgba(245,244,240,.88)] px-7 backdrop-blur-xl lg:flex",
					children: [/* @__PURE__ */ jsxs("nav", {
						"aria-label": "Breadcrumb",
						className: "flex items-center gap-1.5 text-[12px] text-[var(--faint)]",
						children: [
							/* @__PURE__ */ jsx(Link, {
								href: "/x/admin",
								className: "transition hover:text-[var(--ink)]",
								children: "Admin"
							}),
							breadcrumbGroup && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
								className: "text-[var(--line-2)]",
								children: "/"
							}), /* @__PURE__ */ jsx("span", { children: breadcrumbGroup })] }),
							/* @__PURE__ */ jsx("span", {
								className: "text-[var(--line-2)]",
								children: "/"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "font-medium text-[var(--ink)]",
								children: title
							})
						]
					}), /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-2 text-[11.5px] text-[var(--faint)]",
						children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-[var(--yellow)]" }), adminUser?.email ?? "Admin session"]
					})]
				}), /* @__PURE__ */ jsx("main", {
					className: "px-4 py-5 sm:px-6 lg:px-7 lg:py-6",
					children: /* @__PURE__ */ jsxs("div", {
						className: "mx-auto max-w-7xl",
						children: [
							showHeader && /* @__PURE__ */ jsxs("div", {
								className: "mb-4 flex flex-wrap items-center justify-between gap-3 px-1 sm:px-0",
								children: [/* @__PURE__ */ jsx("h1", {
									className: "text-[20px] font-semibold tracking-[-.02em] text-[var(--ink)] sm:text-[22px]",
									children: title
								}), actions]
							}),
							toolbar && /* @__PURE__ */ jsx("div", {
								className: "mb-3",
								children: toolbar
							}),
							children
						]
					})
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Admin/Dashboard.jsx
var Dashboard_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Dashboard$1 });
function formatDay(value) {
	if (!value) return "-";
	return (/* @__PURE__ */ new Date(`${value}T00:00:00Z`)).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC"
	});
}
function StatCard({ card }) {
	const delta = card.delta;
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-[var(--line)] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(20,15,0,.04),0_12px_28px_-22px_rgba(20,15,0,.18)]",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-[10px] font-semibold tracking-[.16em] text-[var(--faint)] uppercase",
				children: card.label
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-[26px] leading-none font-bold tracking-[-.02em] text-[var(--ink)]",
				children: card.value.toLocaleString()
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-[11px] text-[var(--faint)]",
				children: typeof delta === "number" && delta !== 0 ? /* @__PURE__ */ jsxs("span", {
					className: delta > 0 ? "text-[var(--ok)]" : "text-[var(--warn)]",
					children: [
						delta > 0 ? "↑" : "↓",
						" ",
						Math.abs(delta).toLocaleString(),
						" vs prev"
					]
				}) : card.caption
			})
		]
	});
}
function Dashboard$1({ trend = [], stats = [], snapshot = {}, range = "30D", ranges = [] }) {
	const refresh = useForm({});
	const selectRange = (next) => {
		router.get("/x/admin", { range: next }, {
			preserveScroll: true,
			preserveState: true,
			replace: true
		});
	};
	return /* @__PURE__ */ jsxs(AdminLayout, {
		title: "Dashboard",
		section: "dashboard",
		showHeader: false,
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "rounded-2xl border border-[var(--line)] bg-[linear-gradient(135deg,_#fffaf0_0%,_#fff4cf_42%,_#faf9f6_100%)] px-5 py-5 shadow-[0_1px_2px_rgba(20,15,0,.04),0_24px_48px_-34px_rgba(255,198,41,.7)]",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-semibold tracking-[.22em] text-[var(--amber-ink)] uppercase",
						children: "Admin dashboard"
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-1.5 text-[26px] font-bold tracking-[-.03em] text-[var(--ink)]",
						children: "Admin Dashboard"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex flex-wrap items-center gap-3",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "inline-flex items-center rounded-md border border-[var(--yellow)] bg-[var(--wash)] px-2 py-1 text-[10px] font-semibold tracking-[.16em] text-[var(--amber-ink)] uppercase",
								children: snapshot.capturedAt ? "Snapshot loaded" : "No snapshot"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-[12px] text-[var(--muted)]",
								children: [
									formatDay(snapshot.rangeStart),
									" - ",
									formatDay(snapshot.rangeEnd),
									" · ",
									snapshot.rangeStart,
									" to ",
									snapshot.rangeEnd
								]
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: refresh.processing,
								onClick: () => refresh.post("/x/admin/dashboard/refresh", { preserveScroll: true }),
								className: "ml-auto h-8 rounded-md border border-[var(--line)] bg-white px-3 text-[12.5px] font-medium text-[var(--ink)] transition hover:border-[var(--yellow)] hover:bg-[var(--wash)] disabled:opacity-50",
								children: refresh.processing ? "Refreshing..." : "Refresh data"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "mt-3 rounded-2xl border border-[var(--line)] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(20,15,0,.04),0_16px_32px_-26px_rgba(20,15,0,.18)]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-4 flex flex-wrap items-start justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-semibold tracking-[.22em] text-[var(--amber-ink)] uppercase",
						children: "Growth"
					}), /* @__PURE__ */ jsx("h3", {
						className: "mt-1 text-[17px] font-semibold text-[var(--ink)]",
						children: "Daily momentum"
					})] }), /* @__PURE__ */ jsx("div", {
						className: "flex items-center gap-1",
						children: ranges.map((option) => /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => selectRange(option),
							className: `h-7 rounded-md px-2.5 text-[11.5px] font-semibold transition ${option === range ? "bg-[var(--yellow)] text-[#1a1400]" : "text-[var(--muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]"}`,
							children: option
						}, option))
					})]
				}), /* @__PURE__ */ jsx(AdminTrendChart, { points: trend })]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
				children: stats.map((card) => /* @__PURE__ */ jsx(StatCard, { card }, card.key))
			})
		]
	});
}
//#endregion
//#region resources/js/components/admin/AdminRowMenu.jsx
function AdminRowMenu({ resource, row, capabilities = {}, onEdit, onPreview }) {
	const [open, setOpen] = useState(false);
	const container = useRef(null);
	useEffect(() => {
		if (!open) return;
		const close = (event) => {
			if (!container.current?.contains(event.target)) setOpen(false);
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, [open]);
	const act = (method, url, data = {}) => {
		setOpen(false);
		router[method](url, data, {
			preserveScroll: true,
			preserveState: false
		});
	};
	const base = `/x/admin/records/${resource}/${row.id}`;
	const items = [];
	const canPreview = capabilities.preview === true;
	const canEdit = capabilities.edit && !row.trashed;
	if (capabilities.archive && !row.trashed) items.push({
		label: row.archived ? "Unarchive" : "Archive",
		onClick: () => act("patch", `${base}/archive`, { archived: !row.archived })
	});
	if (capabilities.delete) items.push(row.trashed ? {
		label: "Restore",
		onClick: () => act("patch", `${base}/restore`)
	} : {
		label: "Delete",
		danger: true,
		onClick: () => {
			if (window.confirm("Delete this record? It is soft deleted and can be restored.")) act("delete", base);
		}
	});
	if (items.length === 0 && !canEdit && !canPreview) return null;
	return /* @__PURE__ */ jsxs("div", {
		ref: container,
		className: "relative flex items-center justify-end gap-1",
		children: [
			canPreview && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => onPreview(row),
				className: "inline-flex h-6 items-center rounded-md border border-[var(--line)] bg-white px-2 text-[11.5px] font-medium text-[var(--ink)] transition hover:border-[var(--yellow)] hover:bg-[var(--wash)]",
				children: "View"
			}),
			canEdit && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => onEdit(row),
				className: "inline-flex h-6 items-center rounded-md border border-[var(--yellow)] bg-[var(--wash)] px-2 text-[11.5px] font-medium text-[var(--amber-ink)] transition hover:bg-[var(--yellow)] hover:text-[#1a1400]",
				children: "Edit"
			}),
			items.length > 0 && /* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "More actions",
				onClick: () => setOpen((current) => !current),
				className: `inline-flex h-6 w-6 items-center justify-center rounded-md border transition ${open ? "border-[var(--yellow)] bg-[var(--wash)] text-[var(--ink)]" : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-2)] hover:text-[var(--ink)]"}`,
				children: /* @__PURE__ */ jsx(Dots, { className: "h-3.5 w-3.5" })
			}),
			open && /* @__PURE__ */ jsx("div", {
				className: "absolute top-7 right-0 z-30 w-40 overflow-hidden rounded-lg border border-[var(--line)] bg-white py-1 shadow-[0_18px_40px_-18px_rgba(20,15,0,.3)]",
				children: items.map((item) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: item.onClick,
					className: `block w-full px-3 py-1.5 text-left text-[12.5px] transition hover:bg-[var(--wash)] ${item.danger ? "text-[var(--warn)]" : "text-[var(--ink)]"}`,
					children: item.label
				}, item.label))
			})
		]
	});
}
//#endregion
//#region resources/js/components/admin/AdminDataTable.jsx
function statusTone(value) {
	switch ((value || "").toLowerCase()) {
		case "active":
		case "published":
		case "complete": return {
			dot: "bg-[var(--ok)]",
			text: "text-[var(--ok)]"
		};
		case "running":
		case "trial":
		case "trialing":
		case "queued":
		case "scheduled":
		case "invited": return {
			dot: "bg-[var(--yellow)]",
			text: "text-[var(--amber-ink)]"
		};
		case "past_due":
		case "inactive":
		case "archived":
		case "suspended": return {
			dot: "bg-[var(--warn)]",
			text: "text-[var(--warn)]"
		};
		default: return {
			dot: "bg-[var(--line-2)]",
			text: "text-[var(--muted)]"
		};
	}
}
function initials$2(value) {
	return String(value).split(/\s+/).slice(0, 2).map((word) => word.charAt(0)).join("").toUpperCase();
}
function renderCell(column, row, index) {
	const value = row[column.key] ?? "-";
	const text = String(value);
	if (column.key === "status") {
		const tone = statusTone(text);
		return /* @__PURE__ */ jsxs("span", {
			className: `inline-flex items-center gap-1.5 text-[12.5px] font-medium capitalize ${tone.text}`,
			children: [/* @__PURE__ */ jsx("span", { className: `h-1.5 w-1.5 rounded-full ${tone.dot}` }), text.replaceAll("_", " ")]
		});
	}
	if ([
		"role",
		"type",
		"plan"
	].includes(column.key)) return /* @__PURE__ */ jsx("span", {
		className: "inline-flex rounded border border-[var(--line)] bg-[var(--wash)] px-1.5 py-0.5 text-[11.5px] font-medium text-[var(--amber-ink)] capitalize",
		children: text.replaceAll("_", " ")
	});
	if (index === 0) return /* @__PURE__ */ jsxs("span", {
		className: "flex items-center gap-2.5",
		children: [/* @__PURE__ */ jsx("span", {
			className: "flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[var(--wash)] text-[10px] font-semibold text-[var(--amber-ink)]",
			children: initials$2(text)
		}), /* @__PURE__ */ jsx("span", {
			className: "truncate text-[13px] font-medium text-[var(--ink)]",
			children: text
		})]
	});
	return /* @__PURE__ */ jsx("span", {
		className: "text-[13px] text-[var(--muted)]",
		children: text
	});
}
function AdminDataTable({ columns = [], rows = [], resource, capabilities = {}, onEdit = () => {}, onPreview = () => {} }) {
	const hasActions = Boolean(capabilities.preview || capabilities.edit || capabilities.archive || capabilities.delete);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
		className: "hidden overflow-x-auto md:block",
		children: /* @__PURE__ */ jsxs("table", {
			className: "min-w-full border-separate border-spacing-0",
			children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [columns.map((column) => /* @__PURE__ */ jsx("th", {
				className: "sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-left text-[11px] font-semibold tracking-[.06em] whitespace-nowrap text-[var(--faint)] uppercase",
				children: column.label
			}, column.key)), hasActions && /* @__PURE__ */ jsx("th", {
				className: "sticky top-0 z-10 w-[104px] border-b border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-right text-[11px] font-semibold tracking-[.06em] whitespace-nowrap text-[var(--faint)] uppercase",
				children: "Actions"
			})] }) }), /* @__PURE__ */ jsx("tbody", { children: rows.map((row, rowIndex) => /* @__PURE__ */ jsxs("tr", {
				className: "group transition-colors hover:bg-[rgba(255,248,230,.65)]",
				children: [columns.map((column, columnIndex) => /* @__PURE__ */ jsx("td", {
					className: "max-w-[280px] truncate border-b border-[var(--line)] px-4 py-2.5 align-middle whitespace-nowrap",
					children: renderCell(column, row, columnIndex)
				}, column.key)), hasActions && /* @__PURE__ */ jsx("td", {
					className: "border-b border-[var(--line)] px-4 py-2.5 text-right",
					children: /* @__PURE__ */ jsx(AdminRowMenu, {
						resource,
						row,
						capabilities,
						onEdit,
						onPreview
					})
				})]
			}, row.id ?? rowIndex)) })]
		})
	}), /* @__PURE__ */ jsx("div", {
		className: "divide-y divide-[var(--line)] md:hidden",
		children: rows.map((row, rowIndex) => /* @__PURE__ */ jsxs("article", {
			className: "group grid gap-2 px-4 py-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ jsx("div", {
					className: "min-w-0",
					children: renderCell(columns[0], row, 0)
				}), hasActions && /* @__PURE__ */ jsx(AdminRowMenu, {
					resource,
					row,
					capabilities,
					onEdit,
					onPreview
				})]
			}), columns.slice(1).map((column) => /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-[11px] text-[var(--faint)]",
					children: column.label
				}), /* @__PURE__ */ jsx("span", {
					className: "min-w-0 text-right",
					children: renderCell(column, row, 1)
				})]
			}, column.key))]
		}, row.id ?? rowIndex))
	})] });
}
//#endregion
//#region resources/js/components/admin/AdminEditDrawer.jsx
function AdminEditDrawer({ open, resource, title, fields = [], row, onClose }) {
	const form = useForm({});
	useEffect(() => {
		if (!open || !row) return;
		const initial = {};
		fields.forEach((field) => {
			const value = row.values?.[field.name];
			initial[field.name] = field.type === "toggle" ? Boolean(value) : value ?? "";
		});
		form.setDefaults(initial);
		form.setData(initial);
	}, [open, row?.id]);
	if (!open) return null;
	const submit = (event) => {
		event.preventDefault();
		form.transform((data) => ({
			...data,
			...Object.fromEntries(fields.filter((field) => field.type === "toggle").map((field) => [field.name, Boolean(data[field.name])]))
		})).patch(`/x/admin/records/${resource}/${row.id}`, {
			preserveScroll: true,
			onSuccess: onClose
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 flex justify-end",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "Close",
			onClick: onClose,
			className: "absolute inset-0 bg-[rgba(11,11,11,.38)] backdrop-blur-[2px]"
		}), /* @__PURE__ */ jsxs("aside", {
			className: "relative flex h-full w-[min(420px,92vw)] flex-col border-l border-[var(--line)] bg-[var(--paper)] shadow-[0_0_60px_-10px_rgba(20,15,0,.24)]",
			children: [/* @__PURE__ */ jsxs("header", {
				className: "flex items-center justify-between border-b border-[var(--line)] px-4 py-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold tracking-[.18em] text-[var(--faint)] uppercase",
					children: "Edit"
				}), /* @__PURE__ */ jsx("h2", {
					className: "mt-0.5 truncate text-[14px] font-semibold text-[var(--ink)]",
					children: title
				})] }), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					className: "flex h-7 w-7 items-center justify-center rounded-md text-[var(--faint)] transition hover:bg-white hover:text-[var(--ink)]",
					children: /* @__PURE__ */ jsx(Close, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ jsxs("form", {
				onSubmit: submit,
				className: "flex min-h-0 flex-1 flex-col",
				children: [/* @__PURE__ */ jsx("div", {
					className: "min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4",
					children: fields.map((field) => /* @__PURE__ */ jsxs("div", { children: [field.type === "toggle" ? /* @__PURE__ */ jsxs("label", {
						className: "flex cursor-pointer items-start gap-2.5",
						children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: Boolean(form.data[field.name]),
							onChange: (event) => form.setData(field.name, event.target.checked),
							className: "mt-0.5 h-4 w-4 rounded border-[var(--line)] bg-white accent-[#ffc629]"
						}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
							className: "block text-[13px] text-[var(--ink)]",
							children: field.label
						}), field.help && /* @__PURE__ */ jsx("span", {
							className: "mt-0.5 block text-[11.5px] text-[var(--faint)]",
							children: field.help
						})] })]
					}) : /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("label", {
							className: "mb-1.5 block text-[11.5px] font-medium text-[var(--muted)]",
							children: field.label
						}),
						field.type === "select" ? /* @__PURE__ */ jsx("select", {
							value: form.data[field.name] ?? "",
							onChange: (event) => form.setData(field.name, event.target.value),
							className: "h-9 w-full rounded-lg border border-[var(--line)] bg-white px-2.5 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--yellow)]",
							children: (field.options ?? []).map((option) => typeof option === "string" ? {
								value: option,
								label: option
							} : option).map((option) => /* @__PURE__ */ jsx("option", {
								value: option.value,
								className: "bg-white",
								children: option.label
							}, option.value))
						}) : /* @__PURE__ */ jsx("input", {
							type: field.type === "number" ? "number" : field.type === "password" ? "password" : "text",
							autoComplete: field.type === "password" ? "new-password" : void 0,
							step: field.step,
							min: field.type === "number" ? 0 : void 0,
							value: form.data[field.name] ?? "",
							onChange: (event) => form.setData(field.name, event.target.value),
							className: "h-9 w-full rounded-lg border border-[var(--line)] bg-white px-2.5 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--yellow)]"
						}),
						field.help && /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11.5px] text-[var(--faint)]",
							children: field.help
						})
					] }), form.errors[field.name] && /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-[11.5px] text-[var(--warn)]",
						children: form.errors[field.name]
					})] }, field.name))
				}), /* @__PURE__ */ jsxs("footer", {
					className: "flex items-center justify-end gap-2 border-t border-[var(--line)] px-4 py-3",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						className: "h-8 rounded-md px-3 text-[12.5px] text-[var(--muted)] transition hover:text-[var(--ink)]",
						children: "Cancel"
					}), /* @__PURE__ */ jsx("button", {
						type: "submit",
						disabled: form.processing,
						className: "h-8 rounded-md bg-[var(--yellow)] px-3.5 text-[12.5px] font-semibold text-[#1a1400] transition hover:brightness-105 disabled:opacity-50",
						children: form.processing ? "Saving..." : "Save changes"
					})]
				})]
			})]
		})]
	});
}
//#endregion
//#region resources/js/components/admin/AdminEmptyState.jsx
function AdminEmptyState({ title, message }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "px-5 py-14 text-center",
		children: [/* @__PURE__ */ jsx("h3", {
			className: "text-[15px] font-semibold text-[var(--ink)]",
			children: title
		}), /* @__PURE__ */ jsx("p", {
			className: "mx-auto mt-1.5 max-w-md text-[13px] leading-5 text-[var(--muted)]",
			children: message
		})]
	});
}
//#endregion
//#region resources/js/components/admin/AdminFiltersBar.jsx
function buildQuery(filters, search) {
	const query = {};
	if (search.trim() !== "") query.search = search.trim();
	filters.forEach((filter) => {
		if ((filter.value ?? "") !== "") query[filter.name] = filter.value;
	});
	return query;
}
function normalizeOptions(options = []) {
	return options.map((option) => typeof option === "string" ? {
		value: option,
		label: option.replace(/_/g, " ").replace(/^./, (char) => char.toUpperCase())
	} : option);
}
function FilterChip({ filter, onChange }) {
	const options = normalizeOptions(filter.options);
	const value = filter.value ?? "";
	const active = value !== "";
	const selected = options.find((option) => option.value === value);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsxs("span", {
			className: `inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] transition ${active ? "border-[var(--yellow)] bg-[var(--wash)] font-medium text-[var(--ink)]" : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-2)] hover:text-[var(--ink)]"}`,
			children: [
				/* @__PURE__ */ jsx("span", {
					className: `text-[10px] font-semibold ${active ? "text-[var(--amber-ink)]" : "text-[var(--faint)]"}`,
					children: filter.label.charAt(0).toUpperCase()
				}),
				/* @__PURE__ */ jsx("span", {
					className: "whitespace-nowrap",
					children: active ? `${filter.label}: ${selected?.label ?? value}` : filter.label
				}),
				/* @__PURE__ */ jsx(Chevron, { className: `h-2.5 w-2.5 shrink-0 ${active ? "text-[var(--amber-ink)]" : "text-[var(--faint)]"}` })
			]
		}), /* @__PURE__ */ jsxs("select", {
			"aria-label": filter.label,
			value,
			onChange: (event) => onChange(event.target.value),
			className: "absolute inset-0 h-full w-full cursor-pointer opacity-0",
			children: [/* @__PURE__ */ jsxs("option", {
				value: "",
				className: "bg-white text-[var(--ink)]",
				children: ["All ", filter.label]
			}), options.map((option) => /* @__PURE__ */ jsx("option", {
				value: option.value,
				className: "bg-white text-[var(--ink)]",
				children: option.label
			}, option.value))]
		})]
	});
}
function AdminFiltersBar({ title, searchPlaceholder, search = "", filters = [] }) {
	const [searchValue, setSearchValue] = useState(search);
	const dirty = useRef(false);
	const submit = (nextFilters = filters, nextSearch = searchValue) => {
		router.get(window.location.pathname, buildQuery(nextFilters, nextSearch), {
			preserveState: true,
			replace: true,
			preserveScroll: true
		});
	};
	useEffect(() => {
		if (!dirty.current) return;
		const timer = setTimeout(() => submit(filters, searchValue), 350);
		return () => clearTimeout(timer);
	}, [searchValue]);
	const activeCount = filters.filter((filter) => (filter.value ?? "") !== "").length + (searchValue !== "" ? 1 : 0);
	return /* @__PURE__ */ jsxs("div", {
		className: "w-full",
		children: [/* @__PURE__ */ jsxs("label", {
			className: "group relative flex h-9 items-center",
			children: [/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute left-3 h-4 w-4 text-[var(--faint)] transition group-focus-within:text-[var(--amber-ink)]" }), /* @__PURE__ */ jsx("input", {
				type: "search",
				value: searchValue,
				onChange: (event) => {
					dirty.current = true;
					setSearchValue(event.target.value);
				},
				onKeyDown: (event) => {
					if (event.key === "Enter") submit();
				},
				className: "h-full w-full rounded-lg border border-[var(--line)] bg-white pr-3 pl-9 text-[13px] text-[var(--ink)] outline-none transition placeholder:text-[var(--faint)] hover:border-[var(--line-2)] focus:border-[var(--yellow)] focus:ring-2 focus:ring-[rgba(255,198,41,.18)] [&::-webkit-search-cancel-button]:hidden",
				placeholder: searchPlaceholder || `Search ${title.toLowerCase()}...`
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-2 flex flex-wrap items-center gap-1.5",
			children: [filters.map((filter) => /* @__PURE__ */ jsx(FilterChip, {
				filter,
				onChange: (value) => submit(filters.map((item) => item.name === filter.name ? {
					...item,
					value
				} : item), searchValue)
			}, filter.name)), activeCount > 0 && /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => {
					dirty.current = false;
					setSearchValue("");
					submit(filters.map((filter) => ({
						...filter,
						value: ""
					})), "");
				},
				className: "inline-flex h-7 items-center gap-1 rounded-full px-2 text-[12px] text-[var(--faint)] transition hover:bg-[var(--wash)] hover:text-[var(--ink)]",
				children: [/* @__PURE__ */ jsx(Close, { className: "h-3 w-3" }), "Clear all"]
			})]
		})]
	});
}
//#endregion
//#region resources/js/components/admin/AdminPagination.jsx
function pageUrl(page, query) {
	const next = new URLSearchParams();
	Object.entries(query).forEach(([key, value]) => {
		if (value !== "" && value !== null && value !== void 0) next.set(key, value);
	});
	next.set("page", String(page));
	return `${window.location.pathname}?${next.toString()}`;
}
function AdminPagination({ pagination, query = {} }) {
	if (!pagination || pagination.lastPage <= 1) return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-2 border-t border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[12px] text-[var(--faint)]",
		children: [/* @__PURE__ */ jsxs("span", { children: [
			"Showing ",
			/* @__PURE__ */ jsx("span", {
				className: "text-[var(--ink)]",
				children: pagination?.from ?? 0
			}),
			"-",
			/* @__PURE__ */ jsx("span", {
				className: "text-[var(--ink)]",
				children: pagination?.to ?? 0
			}),
			" of",
			" ",
			/* @__PURE__ */ jsx("span", {
				className: "text-[var(--ink)]",
				children: pagination?.total ?? 0
			})
		] }), /* @__PURE__ */ jsx("span", { children: "25 per page" })]
	});
	const goTo = (page) => {
		router.get(pageUrl(page, query), {}, {
			preserveState: true,
			replace: true,
			preserveScroll: true
		});
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2 border-t border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[12px] text-[var(--faint)] sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ jsxs("span", { children: [
			"Showing ",
			/* @__PURE__ */ jsx("span", {
				className: "text-[var(--ink)]",
				children: pagination.from
			}),
			"-",
			/* @__PURE__ */ jsx("span", {
				className: "text-[var(--ink)]",
				children: pagination.to
			}),
			" of",
			" ",
			/* @__PURE__ */ jsx("span", {
				className: "text-[var(--ink)]",
				children: pagination.total
			})
		] }), /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-1.5",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					disabled: pagination.page <= 1,
					onClick: () => goTo(pagination.page - 1),
					className: "h-7 rounded-md border border-[var(--line)] px-2.5 text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)] disabled:opacity-35 disabled:hover:bg-transparent",
					children: "Previous"
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "px-1 text-[var(--muted)]",
					children: [
						"Page ",
						pagination.page,
						" of ",
						pagination.lastPage
					]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					disabled: pagination.page >= pagination.lastPage,
					onClick: () => goTo(pagination.page + 1),
					className: "h-7 rounded-md border border-[var(--line)] px-2.5 text-[var(--muted)] transition hover:bg-white hover:text-[var(--ink)] disabled:opacity-35 disabled:hover:bg-transparent",
					children: "Next"
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/components/admin/AdminPreviewDrawer.jsx
function PreviewField({ label, value, multiline = false }) {
	return /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
		className: "mb-1.5 text-[11.5px] font-medium text-[var(--muted)]",
		children: label
	}), multiline ? /* @__PURE__ */ jsx("div", {
		className: "min-h-[120px] rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] leading-6 whitespace-pre-wrap text-[var(--body)]",
		children: value || "-"
	}) : /* @__PURE__ */ jsx("div", {
		className: "rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] text-[var(--body)]",
		children: value || "-"
	})] });
}
function AdminPreviewDrawer({ open, title, row, onClose }) {
	if (!open || !row) return null;
	const preview = row.preview ?? {};
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 flex justify-end",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "Close",
			onClick: onClose,
			className: "absolute inset-0 bg-[rgba(11,11,11,.38)] backdrop-blur-[2px]"
		}), /* @__PURE__ */ jsxs("aside", {
			className: "relative flex h-full w-[min(460px,92vw)] flex-col border-l border-[var(--line)] bg-[var(--paper)] shadow-[0_0_60px_-10px_rgba(20,15,0,.24)]",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "flex items-center justify-between border-b border-[var(--line)] px-4 py-3",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-semibold tracking-[.18em] text-[var(--faint)] uppercase",
						children: "Preview"
					}), /* @__PURE__ */ jsx("h2", {
						className: "mt-0.5 truncate text-[14px] font-semibold text-[var(--ink)]",
						children: title
					})] }), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						className: "flex h-7 w-7 items-center justify-center rounded-md text-[var(--faint)] transition hover:bg-white hover:text-[var(--ink)]",
						children: /* @__PURE__ */ jsx(Close, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4",
					children: [
						/* @__PURE__ */ jsx(PreviewField, {
							label: "Name",
							value: preview.name
						}),
						/* @__PURE__ */ jsx(PreviewField, {
							label: "Email",
							value: preview.email
						}),
						/* @__PURE__ */ jsx(PreviewField, {
							label: "Category",
							value: preview.category
						}),
						/* @__PURE__ */ jsx(PreviewField, {
							label: "Subject",
							value: preview.subject
						}),
						/* @__PURE__ */ jsx(PreviewField, {
							label: "Received",
							value: preview.received_at
						}),
						/* @__PURE__ */ jsx(PreviewField, {
							label: "Message",
							value: preview.message,
							multiline: true
						})
					]
				}),
				/* @__PURE__ */ jsx("footer", {
					className: "flex items-center justify-end border-t border-[var(--line)] px-4 py-3",
					children: /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						className: "h-8 rounded-md px-3 text-[12.5px] text-[var(--muted)] transition hover:text-[var(--ink)]",
						children: "Close"
					})
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Admin/Listing.jsx
var Listing_exports = /* @__PURE__ */ __exportAll({ default: () => Listing });
function Listing({ resource, title, search, searchPlaceholder, filters = [], columns = [], rows = [], capabilities = {}, editableFields = [], emptyMessage, pagination, query }) {
	const [editing, setEditing] = useState(null);
	const [previewing, setPreviewing] = useState(null);
	const toolbar = /* @__PURE__ */ jsx(AdminFiltersBar, {
		title,
		search,
		searchPlaceholder,
		filters
	});
	const total = pagination?.total ?? rows.length;
	return /* @__PURE__ */ jsxs(AdminLayout, {
		title,
		section: resource,
		toolbar,
		actions: /* @__PURE__ */ jsxs("span", {
			className: "inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-white px-2 py-1 text-[11.5px] text-[var(--muted)]",
			children: [/* @__PURE__ */ jsx("span", {
				className: "font-semibold text-[var(--ink)]",
				children: total.toLocaleString()
			}), total === 1 ? "record" : "records"]
		}),
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(20,15,0,.04),0_16px_36px_-28px_rgba(20,15,0,.18)]",
				children: [rows.length > 0 ? /* @__PURE__ */ jsx(AdminDataTable, {
					columns,
					rows,
					resource,
					capabilities,
					onEdit: setEditing,
					onPreview: setPreviewing
				}) : /* @__PURE__ */ jsx(AdminEmptyState, {
					title: `No ${title.toLowerCase()} found`,
					message: emptyMessage || "Nothing matches the current search and filters."
				}), /* @__PURE__ */ jsx(AdminPagination, {
					pagination,
					query
				})]
			}),
			/* @__PURE__ */ jsx(AdminEditDrawer, {
				open: editing !== null,
				resource,
				title: editing ? String(editing[columns[0]?.key] ?? title) : title,
				fields: editableFields,
				row: editing,
				onClose: () => setEditing(null)
			}),
			/* @__PURE__ */ jsx(AdminPreviewDrawer, {
				open: previewing !== null,
				title: previewing ? String(previewing[columns[0]?.key] ?? title) : title,
				row: previewing,
				onClose: () => setPreviewing(null)
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Admin/Login.jsx
var Login_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Login$1 });
function PasswordField({ value, onChange }) {
	const [visible, setVisible] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsx("input", {
			type: visible ? "text" : "password",
			value,
			onChange,
			className: "field h-12 rounded-2xl border-[var(--line)] bg-white pr-12 text-[14px] text-[var(--ink)] placeholder:text-[var(--faint)]",
			placeholder: "Enter root password",
			autoComplete: "current-password"
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setVisible((current) => !current),
			className: "absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--wash)] hover:text-[var(--ink)]",
			children: /* @__PURE__ */ jsxs("svg", {
				viewBox: "0 0 24 24",
				className: "h-4 w-4",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.8",
				children: [/* @__PURE__ */ jsx("path", { d: "M1.5 12s3.8-6 10.5-6 10.5 6 10.5 6-3.8 6-10.5 6S1.5 12 1.5 12Z" }), /* @__PURE__ */ jsx("circle", {
					cx: "12",
					cy: "12",
					r: "3.2"
				})]
			})
		})]
	});
}
function Login$1({ adminRootEmail = "" }) {
	const form = useForm({
		email: adminRootEmail,
		password: ""
	});
	useEffect(() => {
		if (typeof document === "undefined") return;
		document.documentElement.classList.remove("dark");
	}, []);
	const submit = (event) => {
		event.preventDefault();
		form.post("/x/admin/login");
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Admin Login - Outlier Vault" }), /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)] sm:px-6",
		children: [/* @__PURE__ */ jsxs("div", {
			"aria-hidden": true,
			className: "pointer-events-none fixed inset-0 overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,198,41,.22),_transparent_28%),linear-gradient(180deg,_#faf9f6,_#f5f4f0)]" }), /* @__PURE__ */ jsx("div", { className: "absolute inset-0 opacity-45 [background-image:linear-gradient(to_right,rgba(92,90,84,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(92,90,84,.06)_1px,transparent_1px)] [background-size:44px_44px]" })]
		}), /* @__PURE__ */ jsx("div", {
			className: "relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center",
			children: /* @__PURE__ */ jsxs("section", {
				className: "w-full max-w-[560px] rounded-[32px] border border-[var(--line)] bg-[rgba(250,249,246,.94)] p-7 shadow-[0_32px_120px_-52px_rgba(20,15,0,.28)] backdrop-blur-xl sm:p-8",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-[11px] font-semibold tracking-[.18em] text-[var(--amber-ink)] uppercase",
					children: [/* @__PURE__ */ jsx(Logo, { className: "h-7 w-7" }), "VVF Admin"]
				}), /* @__PURE__ */ jsxs("section", {
					className: "rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_1px_2px_rgba(20,15,0,.04),0_20px_40px_-28px_rgba(20,15,0,.18)] sm:p-7",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--yellow)] shadow-[0_16px_40px_-20px_rgba(255,198,41,.85)]",
							children: /* @__PURE__ */ jsx(Lock, { className: "h-6 w-6 text-[#1a1400]" })
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-6 text-[34px] font-bold tracking-[-.05em] text-[var(--ink)]",
							children: "Admin login"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[14px] leading-6 text-[var(--muted)]",
							children: "Sign in with the root credentials from the environment configuration."
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: submit,
							className: "mt-8 space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[13px] font-semibold text-[var(--body)]",
										children: "Email"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "email",
										value: form.data.email,
										onChange: (event) => form.setData("email", event.target.value),
										className: "field h-12 rounded-2xl border-[var(--line)] bg-white text-[14px] text-[var(--ink)] placeholder:text-[var(--faint)]",
										placeholder: "admin@example.com",
										autoComplete: "email"
									}),
									form.errors.email && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-[var(--warn)]",
										children: form.errors.email
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[13px] font-semibold text-[var(--body)]",
										children: "Password"
									}),
									/* @__PURE__ */ jsx(PasswordField, {
										value: form.data.password,
										onChange: (event) => form.setData("password", event.target.value)
									}),
									form.errors.password && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-[var(--warn)]",
										children: form.errors.password
									})
								] }),
								/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: form.processing,
									className: "inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--yellow)] text-[14px] font-semibold text-[#1a1400] shadow-[0_22px_46px_-26px_rgba(255,198,41,.9)] transition hover:brightness-105 disabled:opacity-50",
									children: form.processing ? "Signing in..." : "Sign in to admin"
								})
							]
						})
					]
				})]
			})
		})]
	})] });
}
//#endregion
//#region resources/js/Pages/Auth/Login.jsx
var Login_exports = /* @__PURE__ */ __exportAll({ default: () => Login });
function Login() {
	const { flash = {} } = usePage().props;
	const form = useForm({
		email: "",
		password: "",
		remember: true
	});
	const submit = (event) => {
		event.preventDefault();
		form.post("/login");
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Sign in · Brand Beacon" }), /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsx("div", {
			className: "auth",
			children: /* @__PURE__ */ jsxs("div", {
				className: "auth__c",
				children: [
					/* @__PURE__ */ jsxs(Link, {
						href: "/",
						className: "auth__k",
						children: [/* @__PURE__ */ jsx(Logo, { className: "h-[34px] w-[34px]" }), /* @__PURE__ */ jsx("span", { children: "Brand Beacon" })]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "card",
						children: /* @__PURE__ */ jsxs("form", {
							className: "card__p",
							onSubmit: submit,
							children: [
								/* @__PURE__ */ jsx("h2", {
									style: { textAlign: "center" },
									children: "Welcome back"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "muted",
									style: {
										textAlign: "center",
										fontSize: ".86rem",
										marginTop: 6
									},
									children: "Sign in to pick up your saved searches."
								}),
								flash.status && /* @__PURE__ */ jsx("div", {
									style: {
										marginTop: 18,
										padding: "12px 16px",
										borderRadius: "var(--r)",
										background: "var(--ok-bg)",
										color: "var(--ok)",
										fontWeight: 600,
										fontSize: ".85rem"
									},
									children: flash.status
								}),
								/* @__PURE__ */ jsxs("a", {
									href: "/auth/google",
									className: "btn btn--k btn--w",
									style: {
										marginTop: 24,
										height: 48
									},
									children: [/* @__PURE__ */ jsx("span", {
										className: "gic",
										children: /* @__PURE__ */ jsx(Google, {})
									}), "Continue with Google"]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "divid",
									children: "or"
								}),
								/* @__PURE__ */ jsxs("div", {
									style: {
										display: "flex",
										flexDirection: "column",
										gap: 14
									},
									children: [/* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsx("label", {
											className: "lbl",
											children: "Email"
										}),
										/* @__PURE__ */ jsx("input", {
											className: "fld",
											type: "email",
											autoComplete: "email",
											placeholder: "you@brand.com",
											value: form.data.email,
											onChange: (e) => form.setData("email", e.target.value)
										}),
										form.errors.email && /* @__PURE__ */ jsx("p", {
											className: "hint",
											style: { color: "var(--warn)" },
											children: form.errors.email
										})
									] }), /* @__PURE__ */ jsxs("div", { children: [
										/* @__PURE__ */ jsx("label", {
											className: "lbl",
											children: "Password"
										}),
										/* @__PURE__ */ jsx("input", {
											className: "fld",
											type: "password",
											autoComplete: "current-password",
											placeholder: "••••••••",
											value: form.data.password,
											onChange: (e) => form.setData("password", e.target.value)
										}),
										form.errors.password && /* @__PURE__ */ jsx("p", {
											className: "hint",
											style: { color: "var(--warn)" },
											children: form.errors.password
										})
									] })]
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "submit",
									className: "btn btn--y btn--w",
									style: {
										marginTop: 20,
										height: 48
									},
									disabled: form.processing,
									children: [
										form.processing ? "Signing in…" : "Sign in",
										" ",
										/* @__PURE__ */ jsx(Arrow, {})
									]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "muted",
									style: {
										textAlign: "center",
										fontSize: ".83rem",
										marginTop: 18
									},
									children: [
										"No account?",
										" ",
										/* @__PURE__ */ jsx(Link, {
											href: "/register",
											style: {
												fontWeight: 700,
												color: "var(--amber-ink)"
											},
											children: "Create one free"
										})
									]
								})
							]
						})
					}),
					/* @__PURE__ */ jsx("p", {
						className: "faint",
						style: {
							textAlign: "center",
							fontSize: ".78rem",
							marginTop: 18
						},
						children: "1 free search · no credit card"
					})
				]
			})
		})
	})] });
}
//#endregion
//#region resources/js/Pages/Auth/Register.jsx
var Register_exports = /* @__PURE__ */ __exportAll({ default: () => Register });
var FIELDS = [
	{
		key: "name",
		label: "Name",
		type: "text",
		placeholder: "Your name",
		autoComplete: "name"
	},
	{
		key: "email",
		label: "Email",
		type: "email",
		placeholder: "you@brand.com",
		autoComplete: "email"
	},
	{
		key: "password",
		label: "Password",
		type: "password",
		placeholder: "••••••••",
		autoComplete: "new-password"
	},
	{
		key: "password_confirmation",
		label: "Confirm password",
		type: "password",
		placeholder: "••••••••",
		autoComplete: "new-password"
	}
];
function Register() {
	const form = useForm({
		name: "",
		email: "",
		password: "",
		password_confirmation: ""
	});
	const submit = (event) => {
		event.preventDefault();
		form.post("/register");
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Create your account · Brand Beacon" }), /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsx("div", {
			className: "auth",
			children: /* @__PURE__ */ jsxs("div", {
				className: "auth__c",
				children: [/* @__PURE__ */ jsxs(Link, {
					href: "/",
					className: "auth__k",
					children: [/* @__PURE__ */ jsx(Logo, { className: "h-[34px] w-[34px]" }), /* @__PURE__ */ jsx("span", { children: "Brand Beacon" })]
				}), /* @__PURE__ */ jsx("div", {
					className: "card",
					children: /* @__PURE__ */ jsxs("form", {
						className: "card__p",
						onSubmit: submit,
						children: [
							/* @__PURE__ */ jsx("h2", {
								style: { textAlign: "center" },
								children: "Create your account"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "muted",
								style: {
									textAlign: "center",
									fontSize: ".86rem",
									marginTop: 6
								},
								children: "Your first search is free — no credit card."
							}),
							/* @__PURE__ */ jsxs("a", {
								href: "/auth/google",
								className: "btn btn--k btn--w",
								style: {
									marginTop: 24,
									height: 48
								},
								children: [/* @__PURE__ */ jsx("span", {
									className: "gic",
									children: /* @__PURE__ */ jsx(Google, {})
								}), "Continue with Google"]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "divid",
								children: "or"
							}),
							/* @__PURE__ */ jsx("div", {
								style: {
									display: "flex",
									flexDirection: "column",
									gap: 14
								},
								children: FIELDS.map((f) => /* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "lbl",
										children: f.label
									}),
									/* @__PURE__ */ jsx("input", {
										className: "fld",
										type: f.type,
										autoComplete: f.autoComplete,
										placeholder: f.placeholder,
										value: form.data[f.key],
										onChange: (e) => form.setData(f.key, e.target.value)
									}),
									form.errors[f.key] && /* @__PURE__ */ jsx("p", {
										className: "hint",
										style: { color: "var(--warn)" },
										children: form.errors[f.key]
									})
								] }, f.key))
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "submit",
								className: "btn btn--y btn--w",
								style: {
									marginTop: 20,
									height: 48
								},
								disabled: form.processing,
								children: [
									form.processing ? "Creating…" : "Create account",
									" ",
									/* @__PURE__ */ jsx(Arrow, {})
								]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "muted",
								style: {
									textAlign: "center",
									fontSize: ".83rem",
									marginTop: 18
								},
								children: [
									"Already have an account?",
									" ",
									/* @__PURE__ */ jsx(Link, {
										href: "/login",
										style: {
											fontWeight: 700,
											color: "var(--amber-ink)"
										},
										children: "Sign in"
									})
								]
							})
						]
					})
				})]
			})
		})
	})] });
}
//#endregion
//#region resources/js/Pages/components/AppFooter.jsx
var AppFooter_exports = /* @__PURE__ */ __exportAll({ default: () => AppFooter });
var FOOT_NAV = [
	{
		label: "Home",
		href: "/"
	},
	{
		label: "Library",
		href: "/bookmark"
	},
	{
		label: "Contact",
		href: "/contact"
	},
	{
		label: "Pricing",
		href: "/trial"
	}
];
/**
* Shared footer that sits under the content column in AppLayout. Light only,
* styled with the Brand Beacon `.bb-foot` rules.
*/
function AppFooter({ width = "max-w-6xl", label = "© 2026 Brand Beacon · TikTok viral intelligence for brands" }) {
	const { billing = {} } = usePage().props;
	const navItems = FOOT_NAV.filter((item) => item.href !== "/trial" || (billing.trialEligible ?? true));
	return /* @__PURE__ */ jsx("div", {
		className: `mx-auto w-full ${width}`,
		children: /* @__PURE__ */ jsxs("footer", {
			className: "bb-foot",
			children: [/* @__PURE__ */ jsx("nav", { children: navItems.map((item) => /* @__PURE__ */ jsx(Link, {
				href: item.href,
				children: item.label
			}, item.href)) }), /* @__PURE__ */ jsx("p", { children: label })]
		})
	});
}
//#endregion
//#region resources/js/Pages/components/AppLayout.jsx
var AppLayout_exports = /* @__PURE__ */ __exportAll({ default: () => AppLayout });
var PILL_CLASS = {
	ok: "pill--ok",
	accent: "pill--run",
	run: "pill--run",
	off: "pill--off",
	bad: "pill--bad",
	warn: "pill--bad"
};
/**
* Primary sidebar navigation, mirroring the handoff mockup. Hrefs point at
* routes that exist today; the dedicated Brand/Product search screens land in
* a later batch and will repoint the last two entries.
*/
var NAV$1 = [
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: Spark,
		match: "/dashboard"
	},
	{
		label: "Library",
		href: "/bookmark",
		icon: Library,
		match: "/bookmark"
	},
	{
		label: "Brand searches",
		href: "/brands",
		icon: Store,
		match: "/brands"
	},
	{
		label: "Product searches",
		href: "/products",
		icon: Search,
		match: "/products"
	}
];
function isActive(currentUrl, item) {
	const path = (currentUrl || "/").split("?")[0];
	if (item.exact) return currentUrl === item.exact;
	return path.startsWith(item.match);
}
function initials$1(name, email) {
	return (name || email || "?").trim().slice(0, 1).toUpperCase();
}
function Brand({ onNavigate }) {
	return /* @__PURE__ */ jsxs(Link, {
		href: "/",
		onClick: onNavigate,
		className: "side__brand",
		children: [/* @__PURE__ */ jsx(Logo, { className: "h-[30px] w-[30px]" }), /* @__PURE__ */ jsx("span", { children: "Brand Beacon" })]
	});
}
function NavList({ currentUrl, onNavigate }) {
	return /* @__PURE__ */ jsx("div", {
		className: "side__nav",
		children: NAV$1.map((item) => {
			const Icon = item.icon;
			if (item.locked) return /* @__PURE__ */ jsxs("div", {
				className: "nav__i is-lock",
				title: "Locked for now",
				children: [
					/* @__PURE__ */ jsx(Icon, {}),
					item.label,
					/* @__PURE__ */ jsx("span", {
						className: "lk",
						children: /* @__PURE__ */ jsx(Lock, { className: "h-[13px] w-[13px]" })
					})
				]
			}, item.label);
			return /* @__PURE__ */ jsxs(Link, {
				href: item.href,
				onClick: onNavigate,
				className: `nav__i${isActive(currentUrl, item) ? " is-on" : ""}`,
				children: [/* @__PURE__ */ jsx(Icon, {}), item.label]
			}, item.label);
		})
	});
}
function AffiliateCard() {
	return /* @__PURE__ */ jsxs("div", {
		className: "aff",
		title: "Affiliate program coming soon",
		children: [/* @__PURE__ */ jsxs("b", { children: [/* @__PURE__ */ jsx(Spark, { className: "h-3.5 w-3.5" }), "Be an affiliate"] }), /* @__PURE__ */ jsx("span", { children: "Soon" })]
	});
}
function AccountBlock({ signedIn, name, email, onSignOut, signingOut, onNavigate }) {
	if (!signedIn) return /* @__PURE__ */ jsxs("div", {
		className: "acct",
		style: { flexDirection: "column" },
		children: [/* @__PURE__ */ jsx(Link, {
			href: "/login",
			onClick: onNavigate,
			className: "btn btn--g btn--w",
			children: "Log in"
		}), /* @__PURE__ */ jsxs(Link, {
			href: "/register",
			onClick: onNavigate,
			className: "btn btn--y btn--w",
			children: ["Sign up ", /* @__PURE__ */ jsx(Arrow, {})]
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "acct",
		children: [/* @__PURE__ */ jsxs(Link, {
			href: "/settings/account",
			onClick: onNavigate,
			className: "acct__l",
			children: [/* @__PURE__ */ jsx("span", {
				className: "avat",
				children: initials$1(name, email)
			}), /* @__PURE__ */ jsxs("span", {
				style: {
					minWidth: 0,
					display: "block",
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ jsx("span", {
					className: "acct__n",
					children: name || "Account"
				}), email && /* @__PURE__ */ jsx("span", {
					className: "acct__e",
					children: email
				})]
			})]
		}), /* @__PURE__ */ jsx("button", {
			className: "acct__x",
			title: "Sign out",
			"aria-label": "Sign out",
			onClick: onSignOut,
			disabled: signingOut,
			children: /* @__PURE__ */ jsx(Exit, { className: "h-4 w-4" })
		})]
	});
}
/**
* Brand Beacon app shell: a fixed 252px sidebar on desktop, a top bar + slide
* drawer on small screens, and a shared footer under the content.
*
* Props are unchanged from the previous shell so every screen keeps working:
*   pill     — { text, tone } status chip shown beside the title
*   step     — accepted for backwards-compat; the wizard now draws its own
*              stepper inside its card, so this is a no-op here
*   title    — page heading
*   subtitle — one line of context under the title
*   actions  — right side of the header row (entitlements bar or buttons)
*   toolbar  — full-width row under the header (search / filters / sort)
*   width    — Tailwind max-width class for the content column
*/
function AppLayout({ pill, step, title, subtitle, actions, toolbar, width = "max-w-6xl", children }) {
	const { props, url: currentUrl } = usePage();
	const { auth = {} } = props;
	const logout = useForm({});
	const [drawerOpen, setDrawerOpen] = useState(false);
	const signedIn = auth.signedIn ?? Boolean(auth.user);
	const signOut = () => {
		setDrawerOpen(false);
		logout.post("/logout");
	};
	const closeDrawer = () => setDrawerOpen(false);
	useEffect(() => {
		if (typeof document === "undefined") return void 0;
		document.body.style.overflow = drawerOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [drawerOpen]);
	const account = /* @__PURE__ */ jsx(AccountBlock, {
		signedIn,
		name: auth.user?.name,
		email: auth.user?.email,
		onSignOut: signOut,
		signingOut: logout.processing
	});
	const header = (title || pill || actions || subtitle) && /* @__PURE__ */ jsxs("div", {
		className: "top",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h1", { children: [title, pill && /* @__PURE__ */ jsxs("span", {
			className: `pill ${PILL_CLASS[pill.tone] ?? PILL_CLASS.accent}`,
			children: [/* @__PURE__ */ jsx("i", {}), pill.text]
		})] }), subtitle && /* @__PURE__ */ jsx("p", { children: subtitle })] }), actions && /* @__PURE__ */ jsx("div", {
			className: "top__actions",
			children: actions
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "bb",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "bb-top",
				children: [/* @__PURE__ */ jsx(Brand, {}), /* @__PURE__ */ jsx("button", {
					className: "bb-burger",
					"aria-label": "Open menu",
					"aria-expanded": drawerOpen,
					onClick: () => setDrawerOpen(true),
					children: /* @__PURE__ */ jsx(Menu, {})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: `bb-drawer${drawerOpen ? " is-open" : ""}`,
				children: [/* @__PURE__ */ jsx("button", {
					className: "bb-drawer__bg",
					"aria-label": "Close menu",
					onClick: closeDrawer
				}), /* @__PURE__ */ jsxs("div", {
					className: "bb-drawer__panel",
					children: [
						/* @__PURE__ */ jsxs("div", {
							style: {
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between"
							},
							children: [/* @__PURE__ */ jsx(Brand, { onNavigate: closeDrawer }), /* @__PURE__ */ jsx("button", {
								className: "bb-burger",
								"aria-label": "Close menu",
								onClick: closeDrawer,
								children: /* @__PURE__ */ jsx(Close, {})
							})]
						}),
						/* @__PURE__ */ jsx(NavList, {
							currentUrl,
							onNavigate: closeDrawer
						}),
						/* @__PURE__ */ jsx("div", { className: "side__sp" }),
						/* @__PURE__ */ jsx(AffiliateCard, {}),
						/* @__PURE__ */ jsx(AccountBlock, {
							signedIn,
							name: auth.user?.name,
							email: auth.user?.email,
							onSignOut: signOut,
							signingOut: logout.processing,
							onNavigate: closeDrawer
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "app",
				children: [/* @__PURE__ */ jsxs("aside", {
					className: "side",
					children: [
						/* @__PURE__ */ jsx(Brand, {}),
						/* @__PURE__ */ jsx(NavList, { currentUrl }),
						/* @__PURE__ */ jsx("div", { className: "side__sp" }),
						/* @__PURE__ */ jsx(AffiliateCard, {}),
						account
					]
				}), /* @__PURE__ */ jsxs("main", {
					className: "main",
					children: [/* @__PURE__ */ jsx("div", {
						className: "bb-content",
						children: /* @__PURE__ */ jsxs("div", {
							className: `mx-auto w-full ${width}`,
							children: [
								header,
								toolbar && /* @__PURE__ */ jsx("div", { children: toolbar }),
								children
							]
						})
					}), /* @__PURE__ */ jsx(AppFooter, { width })]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/components/EntitlementsBar.jsx
var EntitlementsBar_exports = /* @__PURE__ */ __exportAll({ default: () => EntitlementsBar });
/**
* Plan and allowance at a glance — the handoff mockup's `.ent` pill, wired to
* real billing props. One quiet line, not a dashboard.
*/
function titleCase$1(slug) {
	return String(slug || "free").split(/[-_\s]+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
function EntitlementsBar() {
	const { auth = {}, billing = {} } = usePage().props;
	if (!(auth.signedIn ?? Boolean(auth.user))) return null;
	const searchLimit = billing.searchCreditsLimit ?? 0;
	const searchLeft = billing.searchCreditsRemaining ?? 0;
	const searchUsed = billing.searchCreditsUsed ?? 0;
	const bookmarkLimit = billing.searchBookmarkLimit ?? billing.bookmarkLimit ?? 0;
	const bookmarksUsed = billing.searchBookmarkCount ?? billing.bookmarksUsed ?? billing.bookmarkCount ?? 0;
	const searchesLow = searchLimit > 0 && searchLeft <= Math.max(1, Math.round(searchLimit * .1));
	return /* @__PURE__ */ jsxs("div", {
		className: "ent",
		children: [
			/* @__PURE__ */ jsx("b", { children: titleCase$1(billing.currentPlan) }),
			/* @__PURE__ */ jsx("i", {}),
			/* @__PURE__ */ jsxs("span", {
				className: searchesLow ? "low" : void 0,
				children: [
					/* @__PURE__ */ jsx("b", { children: searchUsed }),
					searchLimit > 0 && `/${searchLimit}`,
					" searches"
				]
			}),
			/* @__PURE__ */ jsx("i", {}),
			/* @__PURE__ */ jsxs("span", { children: [
				/* @__PURE__ */ jsx("b", { children: bookmarksUsed }),
				bookmarkLimit > 0 && `/${bookmarkLimit}`,
				" search bookmarks"
			] }),
			!billing.hasPaidPlan && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("i", {}), /* @__PURE__ */ jsx(Link, {
				href: "/plans",
				children: "Upgrade"
			})] })
		]
	});
}
//#endregion
//#region resources/js/Pages/components/VideoCard.jsx
var VideoCard_exports = /* @__PURE__ */ __exportAll({
	compact: () => compact,
	default: () => VideoCard
});
function compact(n) {
	const value = Number(n) || 0;
	if (value >= 1e6) return `${(value / 1e6).toFixed(value >= 1e7 ? 0 : 1)}M`;
	if (value >= 1e3) return `${(value / 1e3).toFixed(value >= 1e4 ? 0 : 1)}K`;
	return String(value);
}
function formatDuration$2(duration) {
	if (duration == null || duration === "") return null;
	if (typeof duration === "string") return duration;
	const total = Number(duration);
	if (!Number.isFinite(total)) return null;
	const mins = Math.floor(total / 60);
	const secs = Math.round(total % 60);
	return `${mins}:${String(secs).padStart(2, "0")}`;
}
/**
* One video card (the mockup's `.vc`), wired to a `ViralVideo::toCardArray`
* payload. The play glyph opens the TikTok post rather than advertising a
* control that does nothing — the signed CDN `video_url` 403s from a browser.
*/
function VideoCard({ video, rank }) {
	const multiplier = Number(video.virality_score) > 0 ? `${Math.round(video.virality_score)}x` : null;
	const duration = formatDuration$2(video.duration);
	const cover = video.thumbnail_url;
	const link = video.post_url || video.embed_url;
	return /* @__PURE__ */ jsxs("article", {
		className: "vc",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "vt",
			children: [
				cover && /* @__PURE__ */ jsx("img", {
					src: cover,
					alt: "",
					loading: "lazy"
				}),
				rank != null && /* @__PURE__ */ jsx("span", {
					className: "vt__r",
					children: rank
				}),
				multiplier && /* @__PURE__ */ jsx("span", {
					className: "vt__m",
					children: multiplier
				}),
				duration && /* @__PURE__ */ jsx("span", {
					className: "vt__d",
					children: duration
				}),
				link ? /* @__PURE__ */ jsx("a", {
					className: "vt__p",
					href: link,
					target: "_blank",
					rel: "noreferrer",
					"aria-label": "Open on TikTok",
					children: /* @__PURE__ */ jsx(Play, {})
				}) : /* @__PURE__ */ jsx("span", {
					className: "vt__p",
					children: /* @__PURE__ */ jsx(Play, {})
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "vb",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "vb__h",
					children: video.handle
				}),
				/* @__PURE__ */ jsx("p", {
					className: "vb__c",
					children: video.title || video.content_hook
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "vb__s",
					children: [
						/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Trend, {}), compact(video.views)] }),
						/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Heart, {}), compact(video.likes)] }),
						/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx(Comment, {}), compact(video.comments)] })
					]
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/components/SavedSearchRow.jsx
var SavedSearchRow_exports = /* @__PURE__ */ __exportAll({
	STATUS: () => STATUS,
	TYPE_LABEL: () => TYPE_LABEL,
	default: () => SavedSearchRow,
	formatDate: () => formatDate$2,
	titleCase: () => titleCase
});
var STATUS = {
	done: {
		label: "Ready",
		cls: "pill--ok"
	},
	complete: {
		label: "Ready",
		cls: "pill--ok"
	},
	running: {
		label: "Refreshing",
		cls: "pill--run"
	},
	scraping: {
		label: "Refreshing",
		cls: "pill--run"
	},
	queued: {
		label: "Refreshing",
		cls: "pill--run"
	},
	pending: {
		label: "Refreshing",
		cls: "pill--run"
	},
	paused: {
		label: "Paused",
		cls: "pill--off"
	},
	failed: {
		label: "Failed",
		cls: "pill--bad"
	}
};
var TYPE_LABEL = {
	brand: "Brand",
	competitor: "Competitor",
	product: "Product"
};
function titleCase(value) {
	return String(value || "").split(/[-_\s]+/).filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
function formatDate$2(iso) {
	if (!iso) return "not yet";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "not yet";
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
/**
* One saved-search row (the mockup's `.row`), wired to a presenter summary.
*
* - Dashboard "Recent" uses it as a plain Link with static bookmark/dots.
* - Library passes `onNavigate` (making the row a div button so buttons can
*   nest cleanly) and an `actions` node with the live bookmark toggle + menu.
*/
function SavedSearchRow({ search, onNavigate, actions }) {
	const status = STATUS[search.status] ?? {
		label: titleCase(search.status) || "Ready",
		cls: "pill--off"
	};
	const type = TYPE_LABEL[search.search_type] ?? titleCase(search.search_type);
	const freq = titleCase(search.frequency) || "Weekly";
	const initials = (search.name || search.phrase || "?").slice(0, 2).toUpperCase();
	const inner = /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("span", {
			className: "row__i",
			children: initials
		}),
		/* @__PURE__ */ jsxs("span", {
			style: { minWidth: 0 },
			children: [/* @__PURE__ */ jsx("span", {
				className: "row__n",
				children: search.name
			}), /* @__PURE__ */ jsxs("span", {
				className: "row__m",
				children: [
					type,
					" · ",
					freq,
					" · updated ",
					formatDate$2(search.last_run_at)
				]
			})]
		}),
		/* @__PURE__ */ jsxs("span", {
			className: `pill ${status.cls}`,
			children: [/* @__PURE__ */ jsx("i", {}), status.label]
		}),
		/* @__PURE__ */ jsxs("span", {
			className: "row__k",
			children: [/* @__PURE__ */ jsx("span", {
				className: "row__kv",
				children: search.result_count ?? 0
			}), /* @__PURE__ */ jsx("span", {
				className: "row__kl",
				children: "videos"
			})]
		}),
		actions ?? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
			className: "row__x",
			title: search.is_watchlisted ? "Bookmarked" : "Bookmark",
			"aria-hidden": true,
			children: /* @__PURE__ */ jsx(Bookmark, {
				className: "h-4 w-4",
				filled: Boolean(search.is_watchlisted)
			})
		}), /* @__PURE__ */ jsx("span", {
			className: "row__x",
			title: "More",
			"aria-hidden": true,
			children: /* @__PURE__ */ jsx(Dots, { className: "h-4 w-4" })
		})] })
	] });
	if (onNavigate) return /* @__PURE__ */ jsx("div", {
		className: "row",
		role: "button",
		tabIndex: 0,
		onClick: onNavigate,
		onKeyDown: (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onNavigate();
			}
		},
		style: { cursor: "pointer" },
		children: inner
	});
	return /* @__PURE__ */ jsx(Link, {
		className: "row",
		href: search.url ?? `/bookmark/${search.id}`,
		children: inner
	});
}
//#endregion
//#region resources/js/Pages/components/SearchListScreen.jsx
var SearchListScreen_exports = /* @__PURE__ */ __exportAll({ default: () => SearchListScreen });
var COPY = {
	brand: {
		title: "Brand searches",
		subtitle: "Research any brand on TikTok, then keep the good ones on a schedule.",
		heroEyebrow: "Start a brand search",
		placeholder: "Which brand do you want to research?",
		sample: "rhode skin",
		heroHint: "One brand per search — we widen it with keywords next.",
		moversNote: "Best outlier across every brand you track.",
		allHeading: "All brand searches",
		filterPlaceholder: "Filter brands"
	},
	product: {
		title: "Product searches",
		subtitle: "Track a product category across every brand selling it, not just one label.",
		heroEyebrow: "Start a product search",
		placeholder: "Which product do you want to track?",
		sample: "lip oil",
		heroHint: "One product per search — we widen it with keywords next.",
		moversNote: "Best outlier across every product you track.",
		allHeading: "All product searches",
		filterPlaceholder: "Filter products"
	}
};
var SORT = {
	outliers: "Most outliers",
	top_score: "Top score",
	recent: "Recently updated",
	az: "Name A-Z"
};
function Sel$1({ value, onChange, ariaLabel, children }) {
	return /* @__PURE__ */ jsxs("span", {
		className: "sel",
		children: [/* @__PURE__ */ jsx("select", {
			"aria-label": ariaLabel,
			value,
			onChange,
			children
		}), /* @__PURE__ */ jsx(Chevron, {})]
	});
}
function BrandCard({ search }) {
	const status = STATUS[search.status] ?? {
		label: "Ready",
		cls: "pill--off"
	};
	const initials = (search.name || search.phrase || "?").slice(0, 2).toUpperCase();
	const topScore = Number(search.top_score) > 0 ? `${Math.round(search.top_score)}x` : "—";
	return /* @__PURE__ */ jsxs(Link, {
		className: "bcard",
		href: search.url ?? `/bookmark/${search.id}`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "bcard__top",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "bcard__av",
						children: initials
					}),
					/* @__PURE__ */ jsxs("span", {
						style: { minWidth: 0 },
						children: [/* @__PURE__ */ jsx("span", {
							className: "bcard__n",
							children: search.name
						}), /* @__PURE__ */ jsx("span", {
							className: "bcard__h",
							children: search.phrase
						})]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: `pill ${status.cls}`,
						children: [/* @__PURE__ */ jsx("i", {}), status.label]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bcard__mid",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "bcard__v",
						children: search.outlier_count ?? 0
					}), /* @__PURE__ */ jsx("span", {
						className: "bcard__l",
						children: "outliers/wk"
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "bcard__v",
						children: topScore
					}), /* @__PURE__ */ jsx("span", {
						className: "bcard__l",
						children: "top score"
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "bcard__v",
						children: search.result_count ?? 0
					}), /* @__PURE__ */ jsx("span", {
						className: "bcard__l",
						children: "videos"
					})] }),
					/* @__PURE__ */ jsx("div", {
						className: "bcard__sp",
						children: (search.result_count ?? 0) === 0 && /* @__PURE__ */ jsx("span", {
							className: "bcard__flat",
							children: "no runs yet"
						})
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bcard__foot",
				children: [/* @__PURE__ */ jsxs("span", { children: ["Updated ", formatDate$2(search.last_run_at)] }), /* @__PURE__ */ jsxs("span", {
					className: "bcard__go",
					children: ["Open ", /* @__PURE__ */ jsx(Arrow, {})]
				})]
			})
		]
	});
}
function SearchListScreen({ kind = "brand", searches = [], moving = [], suggestions = [] }) {
	const copy = COPY[kind] ?? COPY.brand;
	const { billing = {} } = usePage().props;
	const [subject, setSubject] = useState("");
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortBy, setSortBy] = useState("outliers");
	const searchLeft = billing.searchCreditsRemaining;
	const searchLimit = billing.searchCreditsLimit;
	const recent = useMemo(() => searches.slice(0, 4), [searches]);
	const runSearch = (e) => {
		e.preventDefault();
		const q = subject.trim().replace(/\s+/g, " ");
		router.visit(`/search?type=${kind}${q ? `&q=${encodeURIComponent(q)}` : ""}`);
	};
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		const next = searches.filter((s) => {
			const matchesQuery = q === "" || s.name?.toLowerCase().includes(q) || s.phrase?.toLowerCase().includes(q);
			const matchesStatus = statusFilter === "all" || s.status === statusFilter;
			return matchesQuery && matchesStatus;
		});
		next.sort((l, r) => {
			switch (sortBy) {
				case "top_score": return (r.top_score ?? 0) - (l.top_score ?? 0);
				case "recent": return (r.last_run_at ? new Date(r.last_run_at).getTime() : 0) - (l.last_run_at ? new Date(l.last_run_at).getTime() : 0);
				case "az": return (l.name ?? "").localeCompare(r.name ?? "");
				default: return (r.outlier_count ?? 0) - (l.outlier_count ?? 0);
			}
		});
		return next;
	}, [
		searches,
		query,
		statusFilter,
		sortBy
	]);
	return /* @__PURE__ */ jsxs(AppLayout, {
		width: "max-w-[1240px]",
		title: copy.title,
		subtitle: copy.subtitle,
		actions: /* @__PURE__ */ jsx(EntitlementsBar, {}),
		children: [
			/* @__PURE__ */ jsxs("section", {
				className: "bhero",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "bhero__k",
						children: copy.heroEyebrow
					}),
					/* @__PURE__ */ jsxs("form", {
						className: "sbox",
						onSubmit: runSearch,
						children: [/* @__PURE__ */ jsx("textarea", {
							rows: 2,
							maxLength: 80,
							value: subject,
							onChange: (e) => setSubject(e.target.value),
							placeholder: copy.placeholder,
							"aria-label": copy.heroEyebrow
						}), /* @__PURE__ */ jsxs("div", {
							className: "sbox__f",
							children: [/* @__PURE__ */ jsxs("p", {
								className: "sbox__t",
								children: [
									"Try ",
									/* @__PURE__ */ jsxs("b", { children: [
										"“",
										copy.sample,
										"”"
									] }),
									/* @__PURE__ */ jsx("br", {}),
									copy.heroHint
								]
							}), /* @__PURE__ */ jsxs("button", {
								type: "submit",
								className: "btn btn--y btn--lg",
								children: [/* @__PURE__ */ jsx(Search, { className: "h-[15px] w-[15px]" }), " Find outliers"]
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bhero__r",
						children: [
							recent.length > 0 && /* @__PURE__ */ jsx("span", {
								className: "bhero__rl",
								children: "Recent"
							}),
							recent.map((s) => /* @__PURE__ */ jsxs("button", {
								type: "button",
								className: "rchip",
								onClick: () => setSubject(s.phrase || s.name),
								children: [
									/* @__PURE__ */ jsx(Refresh, { className: "h-[13px] w-[13px]" }),
									" ",
									s.name
								]
							}, s.id)),
							searchLimit > 0 && /* @__PURE__ */ jsxs("span", {
								className: "bhero__q",
								children: [
									searchLeft,
									" of ",
									searchLimit,
									" searches left this cycle"
								]
							})
						]
					})
				]
			}),
			moving.length > 0 && /* @__PURE__ */ jsxs("section", {
				className: "movers",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "movers__h",
					children: [/* @__PURE__ */ jsx("h2", { children: "Moving this week" }), /* @__PURE__ */ jsx("span", {
						className: "note",
						children: copy.moversNote
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "movers__g",
					children: moving.map((v, i) => /* @__PURE__ */ jsxs(Link, {
						className: "mv",
						href: v.url ?? "#",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "mv__t",
							children: [v.thumbnail_url && /* @__PURE__ */ jsx("img", {
								src: v.thumbnail_url,
								alt: "",
								loading: "lazy"
							}), v.multiplier && /* @__PURE__ */ jsx("span", {
								className: "mv__x",
								children: v.multiplier
							})]
						}), /* @__PURE__ */ jsxs("span", {
							style: { minWidth: 0 },
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "mv__b",
									children: v.subject
								}),
								/* @__PURE__ */ jsx("span", {
									className: "mv__c",
									children: v.caption
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "mv__m",
									children: [v.views != null ? `${compact(v.views)} views` : "", v.handle ? ` · ${v.handle}` : ""]
								})
							]
						})]
					}, i))
				})]
			}),
			suggestions.length > 0 && /* @__PURE__ */ jsxs("section", {
				className: "sugg",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "movers__h",
					children: [/* @__PURE__ */ jsx("h2", { children: "Suggested to track" }), /* @__PURE__ */ jsx("span", {
						className: "note",
						children: kind === "product" ? "Products rising in the categories you already watch." : "Based on creator overlap with brands you already watch."
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "sugg__g",
					children: suggestions.map((s) => /* @__PURE__ */ jsxs("div", {
						className: "sg",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "sg__av",
								children: s.name.slice(0, 2).toUpperCase()
							}),
							/* @__PURE__ */ jsxs("span", {
								style: { minWidth: 0 },
								children: [/* @__PURE__ */ jsx("span", {
									className: "sg__n",
									children: s.name
								}), /* @__PURE__ */ jsx("span", {
									className: "sg__w",
									children: s.why
								})]
							}),
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								className: "btn btn--g btn--sm",
								onClick: () => router.visit(`/search?type=${kind}&q=${encodeURIComponent(s.name)}`),
								children: [/* @__PURE__ */ jsx(Plus, { className: "h-[15px] w-[15px]" }), " Track"]
							})
						]
					}, s.name))
				})]
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "section-gap",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "movers__h",
						children: [/* @__PURE__ */ jsx("h2", { children: copy.allHeading }), /* @__PURE__ */ jsxs("span", {
							className: "note",
							children: [searches.length, " tracked"]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "tools",
						style: { marginTop: 14 },
						children: [
							/* @__PURE__ */ jsxs("label", {
								className: "srch",
								children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("input", {
									value: query,
									onChange: (e) => setQuery(e.target.value),
									placeholder: copy.filterPlaceholder,
									"aria-label": copy.filterPlaceholder
								})]
							}),
							/* @__PURE__ */ jsxs(Sel$1, {
								value: statusFilter,
								onChange: (e) => setStatusFilter(e.target.value),
								ariaLabel: "Status",
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "all",
										children: "All statuses"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "done",
										children: "Ready"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "scraping",
										children: "Refreshing"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "paused",
										children: "Paused"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "failed",
										children: "Failed"
									})
								]
							}),
							/* @__PURE__ */ jsx(Sel$1, {
								value: sortBy,
								onChange: (e) => setSortBy(e.target.value),
								ariaLabel: "Sort by",
								children: Object.entries(SORT).map(([value, label]) => /* @__PURE__ */ jsx("option", {
									value,
									children: label
								}, value))
							})
						]
					}),
					filtered.length === 0 ? /* @__PURE__ */ jsxs("div", {
						className: "empty",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "empty__i",
								children: /* @__PURE__ */ jsx(Search, { className: "h-6 w-6" })
							}),
							/* @__PURE__ */ jsx("h2", { children: searches.length === 0 ? `No ${kind} searches yet` : "Nothing matched" }),
							/* @__PURE__ */ jsx("p", {
								className: "muted",
								style: {
									maxWidth: 360,
									margin: "10px auto 0"
								},
								children: searches.length === 0 ? `Start one above and it will track on its own schedule.` : "Try a different filter or sort."
							})
						]
					}) : /* @__PURE__ */ jsx("div", {
						className: "bgrid",
						children: filtered.map((s) => /* @__PURE__ */ jsx(BrandCard, { search: s }, s.id))
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Brands.jsx
var Brands_exports = /* @__PURE__ */ __exportAll({ default: () => Brands });
function Brands({ searches = [], moving = [], suggestions = [] }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Brand searches · Brand Beacon" }), /* @__PURE__ */ jsx(SearchListScreen, {
		kind: "brand",
		searches,
		moving,
		suggestions
	})] });
}
//#endregion
//#region resources/js/Pages/ComingSoon.jsx
var ComingSoon_exports = /* @__PURE__ */ __exportAll({ default: () => ComingSoon });
function ComingSoon() {
	const { flash = {} } = usePage().props;
	const form = useForm({ email: "" });
	const submit = (event) => {
		event.preventDefault();
		form.post("/coming-soon-interest", {
			preserveScroll: true,
			onSuccess: () => form.reset("email")
		});
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Coming Soon - Outlier Vault" }), /* @__PURE__ */ jsxs("div", {
		className: "vvf-landing relative min-h-screen overflow-hidden",
		children: [/* @__PURE__ */ jsxs("div", {
			"aria-hidden": true,
			className: "pointer-events-none absolute inset-0",
			children: [
				/* @__PURE__ */ jsx("div", { className: "bg-grid absolute inset-0 opacity-70" }),
				/* @__PURE__ */ jsx("div", { className: "absolute top-[-12%] left-1/2 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-accent/18 blur-[160px]" }),
				/* @__PURE__ */ jsx("div", { className: "absolute right-[-8%] bottom-[-12%] h-[360px] w-[360px] rounded-full bg-hot/12 blur-[140px]" })
			]
		}), /* @__PURE__ */ jsx("main", {
			className: "relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-12 sm:px-8 lg:px-10",
			children: /* @__PURE__ */ jsxs("div", {
				className: "grid w-full gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center",
				children: [/* @__PURE__ */ jsxs("section", { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "eyebrow",
						children: [/* @__PURE__ */ jsx("span", { className: "inline-flex h-2 w-2 rounded-full bg-hot shadow-[0_0_0_6px_rgba(255,61,113,.14)]" }), "Launching Soon"]
					}),
					/* @__PURE__ */ jsxs("h1", {
						className: "mt-6 max-w-3xl font-display text-[44px] leading-[0.95] font-bold tracking-[-0.05em] text-ink sm:text-[58px] lg:text-[76px] dark:text-white",
						children: [
							"Viral intelligence for brands is almost ",
							/* @__PURE__ */ jsx("span", {
								className: "text-gradient",
								children: "ready"
							}),
							"."
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-6 max-w-2xl text-[17px] leading-8 text-ink/72 dark:text-white/68",
						children: "Outlier Vault is getting its final polish. Leave your email and we'll notify you when the site is live so you can get early access."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-8 flex flex-wrap gap-3 text-sm text-ink/62 dark:text-white/62",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "surface px-4 py-2",
								children: "Track breakout TikTok content"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "surface px-4 py-2",
								children: "Spot brand and competitor momentum"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "surface px-4 py-2",
								children: "Join the launch list"
							})
						]
					})
				] }), /* @__PURE__ */ jsxs("section", {
					className: "surface ring-gradient rounded-[28px] p-6 sm:p-8",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "inline-flex rounded-full border border-accent/15 bg-accent-soft px-3 py-1 text-[11px] font-semibold tracking-[.16em] text-accent uppercase",
							children: "Notify Me"
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-5 font-display text-[30px] leading-tight font-bold tracking-[-0.04em] text-ink dark:text-white",
							children: "Be first in line when we open the doors."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-3 text-[15px] leading-7 text-ink/65 dark:text-white/62",
							children: "We're collecting early interest now and will use this list to send launch updates once the app goes live."
						}),
						flash.status && /* @__PURE__ */ jsx("div", {
							className: "mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300",
							children: flash.status
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: submit,
							className: "mt-6 space-y-4",
							children: [/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("label", {
									htmlFor: "coming-soon-email",
									className: "mb-2 block text-sm font-semibold text-ink dark:text-white",
									children: "Email address"
								}),
								/* @__PURE__ */ jsx("input", {
									id: "coming-soon-email",
									type: "email",
									value: form.data.email,
									onChange: (event) => form.setData("email", event.target.value),
									className: "field h-13",
									placeholder: "you@example.com",
									autoComplete: "email"
								}),
								form.errors.email && /* @__PURE__ */ jsx("p", {
									className: "mt-2 text-sm text-hot",
									children: form.errors.email
								})
							] }), /* @__PURE__ */ jsx("button", {
								type: "submit",
								disabled: form.processing,
								className: "btn-accent h-13 w-full px-5 text-sm",
								children: form.processing ? "Saving your interest..." : "Notify me at launch"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 text-xs leading-6 text-ink/48 dark:text-white/45",
							children: "One email per address is enough. We'll keep it for launch notification reference later on."
						})
					]
				})]
			})
		})]
	})] });
}
//#endregion
//#region resources/js/components/ContactFormCard.jsx
function FieldLabel({ children, optional = false }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "mb-2 block text-[12px] font-semibold text-[#111827] dark:text-white/92",
		children: [children, optional ? /* @__PURE__ */ jsx("span", {
			className: "ml-1 text-slate-400 dark:text-white/35",
			children: "(Optional)"
		}) : null]
	});
}
function FieldError({ message }) {
	if (!message) return null;
	return /* @__PURE__ */ jsx("p", {
		className: "mt-2 text-[12px] text-rose-500 dark:text-rose-300",
		children: message
	});
}
function ContactFormCard({ categories = [], defaults = {}, className = "" }) {
	const { flash = {} } = usePage().props;
	const form = useForm({
		name: defaults.name ?? "",
		email: defaults.email ?? "",
		category: categories[0]?.value ?? "general",
		subject: "",
		message: ""
	});
	const submit = (event) => {
		event.preventDefault();
		form.post("/contact", {
			preserveScroll: true,
			onSuccess: () => form.reset("subject", "message")
		});
	};
	return /* @__PURE__ */ jsxs("section", {
		className: `rounded-[30px] border border-black/[.06] bg-white px-5 py-6 text-[#111827] shadow-[0_24px_90px_-45px_rgba(15,23,42,.24)] sm:px-7 sm:py-8 lg:px-10 dark:border-white/[.09] dark:bg-[#0d1324] dark:text-white dark:shadow-[0_24px_90px_-45px_rgba(0,0,0,.95)] ${className}`.trim(),
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "max-w-3xl",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-[11px] font-semibold tracking-[.32em] text-[#ff4d9d] uppercase",
						children: "Contact"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-2 font-display text-[36px] font-bold tracking-[-.04em] text-[#111827] sm:text-[44px] dark:text-white",
						children: "Contact Us"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-4 max-w-2xl text-[14px] leading-7 text-slate-600 dark:text-white/70",
						children: "Send a quick note and we'll follow up by email. If you're asking about AI analysis, billing, or an account issue, add as much context as you can."
					})
				]
			}),
			flash.status ? /* @__PURE__ */ jsx("div", {
				className: "mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
				children: flash.status
			}) : null,
			/* @__PURE__ */ jsxs("form", {
				onSubmit: submit,
				className: "mt-8 space-y-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-5 md:grid-cols-2",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(FieldLabel, { children: "Name" }),
							/* @__PURE__ */ jsx("input", {
								type: "text",
								value: form.data.name,
								onChange: (event) => form.setData("name", event.target.value),
								className: "h-12 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[14px] text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-[#ff4d9d]/60 dark:border-white/[.1] dark:bg-[#151b2d] dark:text-white dark:placeholder:text-white/25",
								placeholder: "Your name"
							}),
							/* @__PURE__ */ jsx(FieldError, { message: form.errors.name })
						] }), /* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx(FieldLabel, { children: "Email" }),
							/* @__PURE__ */ jsx("input", {
								type: "email",
								value: form.data.email,
								onChange: (event) => form.setData("email", event.target.value),
								className: "h-12 w-full rounded-2xl border border-[#ff4d9d]/35 bg-[#f8fafc] px-4 text-[14px] text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-[#ff4d9d] dark:bg-[#151b2d] dark:text-white dark:placeholder:text-white/25",
								placeholder: "you@example.com"
							}),
							/* @__PURE__ */ jsx(FieldError, { message: form.errors.email })
						] })]
					}),
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(FieldLabel, { children: "Category" }),
						/* @__PURE__ */ jsx("select", {
							value: form.data.category,
							onChange: (event) => form.setData("category", event.target.value),
							className: "h-12 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[14px] text-[#111827] outline-none transition focus:border-slate-300 dark:border-white/[.1] dark:bg-[#151b2d] dark:text-white dark:focus:border-white/30",
							children: categories.map((category) => /* @__PURE__ */ jsx("option", {
								value: category.value,
								children: category.label
							}, category.value))
						}),
						/* @__PURE__ */ jsx(FieldError, { message: form.errors.category })
					] }),
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(FieldLabel, {
							optional: true,
							children: "Subject"
						}),
						/* @__PURE__ */ jsx("input", {
							type: "text",
							value: form.data.subject,
							onChange: (event) => form.setData("subject", event.target.value),
							className: "h-12 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] px-4 text-[14px] text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-slate-300 dark:border-white/[.1] dark:bg-[#151b2d] dark:text-white dark:placeholder:text-white/25 dark:focus:border-white/30",
							placeholder: "Example: Quick question about my account"
						}),
						/* @__PURE__ */ jsx(FieldError, { message: form.errors.subject })
					] }),
					/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx(FieldLabel, { children: "Message" }),
						/* @__PURE__ */ jsx("textarea", {
							value: form.data.message,
							onChange: (event) => form.setData("message", event.target.value),
							className: "min-h-[190px] w-full rounded-3xl border border-slate-200 bg-[#f8fafc] px-4 py-3 text-[14px] text-[#111827] outline-none transition placeholder:text-slate-400 focus:border-slate-300 dark:border-white/[.1] dark:bg-[#151b2d] dark:text-white dark:placeholder:text-white/25 dark:focus:border-white/30",
							placeholder: "Tell us how we can help..."
						}),
						/* @__PURE__ */ jsx(FieldError, { message: form.errors.message })
					] }),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-4 border-t border-slate-200 pt-5 text-[12px] text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-white/[.08] dark:text-white/40",
						children: [/* @__PURE__ */ jsx("p", { children: "We'll use this message to follow up directly by email." }), /* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: form.processing,
							className: "inline-flex h-12 items-center justify-center rounded-2xl bg-[#ff2f86] px-6 text-[13px] font-semibold text-white transition hover:bg-[#ff4d9d] disabled:cursor-not-allowed disabled:opacity-60",
							children: form.processing ? "Sending..." : "Send Inquiry"
						})]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Contact.jsx
var Contact_exports = /* @__PURE__ */ __exportAll({ default: () => Contact });
function Contact({ categories = [], defaults = {} }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Contact Us - Outlier Vault" }), /* @__PURE__ */ jsx(AppLayout, {
		width: "max-w-5xl",
		children: /* @__PURE__ */ jsx(ContactFormCard, {
			categories,
			defaults
		})
	})] });
}
//#endregion
//#region resources/js/Pages/components/SearchLauncher.jsx
var SearchLauncher_exports = /* @__PURE__ */ __exportAll({ default: () => SearchLauncher });
/**
* Step one of the search flow — pick a subject. A mode toggle, one input, and
* suggestions that *fill* the box rather than firing a search: a search costs a
* credit, so a stray tap on a suggestion must never spend one.
*/
var TYPES = [
	{
		key: "brand",
		label: "Your brand",
		icon: Store,
		placeholder: "Which brand do you want to research?",
		sample: "rhode skin",
		suggestions: [
			"rhode skin",
			"glossier",
			"drunk elephant",
			"cerave",
			"stanley"
		]
	},
	{
		key: "competitor",
		label: "A competitor",
		icon: Target,
		placeholder: "Which competitor do you want to watch?",
		sample: "skims",
		suggestions: [
			"skims",
			"fenty beauty",
			"gymshark",
			"alo yoga",
			"summer fridays"
		]
	},
	{
		key: "product",
		label: "A product",
		icon: Search,
		placeholder: "Which product do you want to track?",
		sample: "lip oil",
		suggestions: [
			"lip oil",
			"hair oil",
			"sunscreen stick",
			"liquid blush"
		]
	}
];
function SearchLauncher({ initialType = "brand", initialQuery = "", onSubmit }) {
	const [type, setType] = useState(initialType);
	const [value, setValue] = useState(initialQuery);
	const inputRef = useRef(null);
	const config = TYPES.find((t) => t.key === type) ?? TYPES[0];
	const query = value.trim().replace(/\s+/g, " ");
	const submit = (event) => {
		event.preventDefault();
		if (!query) return;
		if (onSubmit) {
			onSubmit({
				type,
				phrase: query
			});
			return;
		}
		router.visit(`/search?type=${type}&q=${encodeURIComponent(query)}`);
	};
	const useSample = () => {
		setValue(config.sample);
		inputRef.current?.focus();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "card__p",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "modes",
				role: "radiogroup",
				"aria-label": "What to research",
				children: TYPES.map((option) => {
					const Icon = option.icon;
					const active = option.key === type;
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						role: "radio",
						"aria-checked": active,
						onClick: () => setType(option.key),
						className: `mode${active ? " is-on" : ""}`,
						children: [/* @__PURE__ */ jsx(Icon, { className: "h-[15px] w-[15px]" }), option.label]
					}, option.key);
				})
			}),
			/* @__PURE__ */ jsxs("form", {
				className: "sbox",
				onSubmit: submit,
				children: [/* @__PURE__ */ jsx("textarea", {
					ref: inputRef,
					rows: 2,
					maxLength: 80,
					value,
					onChange: (e) => setValue(e.target.value),
					placeholder: config.placeholder,
					"aria-label": "Search subject",
					style: {
						border: "0",
						outline: "none",
						boxShadow: "none",
						borderRadius: 0,
						background: "transparent",
						appearance: "none",
						WebkitAppearance: "none"
					}
				}), /* @__PURE__ */ jsxs("div", {
					className: "sbox__f",
					children: [/* @__PURE__ */ jsxs("p", {
						className: "sbox__t",
						children: [
							"Try",
							" ",
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								className: "sbox__try",
								onClick: useSample,
								children: [
									"“",
									config.sample,
									"”"
								]
							}),
							/* @__PURE__ */ jsx("br", {}),
							"One subject per search keeps each result tight."
						]
					}), /* @__PURE__ */ jsxs("button", {
						type: "submit",
						disabled: !query,
						className: "btn btn--y",
						children: ["Continue ", /* @__PURE__ */ jsx(Arrow, {})]
					})]
				})]
			}),
			config.suggestions.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "subj-sugg",
				children: config.suggestions.map((s) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "rchip",
					onClick: () => setValue(s),
					children: [/* @__PURE__ */ jsx(Refresh, { className: "h-[13px] w-[13px]" }), s]
				}, s))
			})
		]
	});
}
//#endregion
//#region resources/js/landing/flow/api.js
/**
* Small fetch wrapper for the saved-search endpoints. Inertia handles page
* navigation; these calls are the in-page ones that should not re-render the
* whole document.
*/
function csrfToken() {
	return document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content") ?? "";
}
var API_V1 = "/api/v1";
async function request(url, { method = "GET", body } = {}) {
	const response = await fetch(url, {
		method,
		credentials: "same-origin",
		headers: {
			Accept: "application/json",
			"X-Requested-With": "XMLHttpRequest",
			...body ? { "Content-Type": "application/json" } : {},
			...method === "GET" ? {} : { "X-CSRF-TOKEN": csrfToken() }
		},
		...body ? { body: JSON.stringify(body) } : {}
	});
	const payload = await response.json().catch(() => null);
	if (!response.ok) {
		const error = new Error(payload?.message || `Request failed (${response.status})`);
		error.status = response.status;
		error.payload = payload;
		throw error;
	}
	return payload;
}
function expandKeywords(phrase, { signal } = {}) {
	return fetch(`${API_V1}/saved-searches/expand`, {
		method: "POST",
		credentials: "same-origin",
		signal,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"X-Requested-With": "XMLHttpRequest",
			"X-CSRF-TOKEN": csrfToken()
		},
		body: JSON.stringify({ phrase })
	}).then(async (response) => {
		const payload = await response.json().catch(() => null);
		if (!response.ok) throw new Error(payload?.message || "Could not suggest keywords.");
		return payload;
	});
}
function createSavedSearch({ type, phrase, name, keywords, frequency, sources }) {
	return request(`${API_V1}/saved-searches`, {
		method: "POST",
		body: {
			type,
			phrase,
			name,
			keywords,
			frequency,
			...sources ? { sources } : {}
		}
	});
}
function fetchNotifications(ids) {
	return request(`${API_V1}/saved-searches/notifications?${ids.map((id) => `ids[]=${encodeURIComponent(id)}`).join("&")}`);
}
var savedSearch = {
	get: (id) => request(`${API_V1}/saved-searches/${id}/json`),
	bookmark: (id, bookmarked) => request(`${API_V1}/saved-searches/${id}/bookmark`, {
		method: "PATCH",
		body: { bookmarked }
	}),
	pause: (id) => request(`${API_V1}/saved-searches/${id}/pause`, { method: "PATCH" }),
	resume: (id) => request(`${API_V1}/saved-searches/${id}/resume`, { method: "PATCH" }),
	update: (id, body) => request(`${API_V1}/saved-searches/${id}/frequency`, {
		method: "PATCH",
		body
	}),
	refresh: (id) => request(`${API_V1}/saved-searches/${id}/refresh`, { method: "POST" }),
	destroy: (id) => request(`${API_V1}/saved-searches/${id}`, { method: "DELETE" })
};
var billing = {
	checkout: (slug) => {
		window.location.assign(`/billing/checkout/${encodeURIComponent(slug)}`);
	},
	trialCheckout: (slug) => {
		window.location.assign(`/billing/checkout/${encodeURIComponent(slug)}?trial=1`);
	}
};
var bookmarks = {
	save: (id) => request(`${API_V1}/videos/${id}/bookmark`, { method: "POST" }),
	remove: (id) => request(`${API_V1}/videos/${id}/bookmark`, { method: "DELETE" })
};
var videoAnalysis = {
	request: (id, body = {}) => request(`${API_V1}/videos/${id}/analysis`, {
		method: "POST",
		body
	}),
	get: (id) => request(`${API_V1}/videos/${id}/analysis`)
};
var TRACKED_KEY = "vvf-tracked-searches";
function readTracked() {
	try {
		const raw = window.sessionStorage.getItem(TRACKED_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function writeTracked(entries) {
	try {
		window.sessionStorage.setItem(TRACKED_KEY, JSON.stringify(entries.slice(0, 10)));
	} catch {}
}
function trackSearch(entry) {
	const existing = readTracked().filter((t) => String(t.id) !== String(entry.id));
	writeTracked([{
		runningPromptShown: false,
		completedPromptShown: false,
		...entry
	}, ...existing]);
}
function updateTracked(id, patch) {
	writeTracked(readTracked().map((t) => String(t.id) === String(id) ? {
		...t,
		...patch
	} : t));
}
//#endregion
//#region resources/js/landing/flow/screens/KeywordsScreen.jsx
var KEYWORD_CAP = 12;
var FREQUENCIES = [{
	value: "weekly",
	label: "Weekly",
	hint: "Fresh viral videos every week. Best for fast-moving categories."
}, {
	value: "monthly",
	label: "Monthly",
	hint: "A monthly pull. Lighter cadence for slower niches."
}];
function SkeletonChips() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", {
		className: "hint",
		style: {
			display: "inline-flex",
			alignItems: "center",
			gap: 8,
			marginBottom: 12,
			color: "var(--amber-ink)",
			fontWeight: 600
		},
		children: [/* @__PURE__ */ jsx("span", {
			className: "chip-spin",
			"aria-hidden": true
		}), "Suggesting keywords…"]
	}), /* @__PURE__ */ jsx("div", {
		className: "chips",
		"aria-hidden": true,
		children: [
			132,
			108,
			156,
			96,
			140,
			118
		].map((width, i) => /* @__PURE__ */ jsx("span", {
			className: "chip-skel",
			style: { width }
		}, i))
	})] });
}
/**
* Step two — widen the single scrape with keywords and set the cadence.
*
* The scrape is sent only the primary phrase; every ticked keyword filters the
* results locally, so "1 search covers everything you select" is literally true.
* The subject itself is changed by stepping Back, so there is no edit control here.
*/
function KeywordsScreen({ phrase, noun = "brand", nextLabel = "Run search", onBack, onSubmit, submitting = false, error = null }) {
	const [terms, setTerms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [regenerating, setRegenerating] = useState(false);
	const [expansionSource, setExpansionSource] = useState(null);
	const [adding, setAdding] = useState(false);
	const [draft, setDraft] = useState("");
	const [frequency, setFrequency] = useState("weekly");
	const requested = useRef(false);
	/**
	* Build a term list from an expansion payload, keeping anything the user
	* typed themselves — regenerating suggestions must never quietly delete work.
	*/
	const applyExpansion = (keywords, forPhrase, previous = []) => {
		const custom = previous.filter((t) => t.custom && t.value.toLowerCase() !== forPhrase.toLowerCase());
		const seen = /* @__PURE__ */ new Set([forPhrase.toLowerCase()]);
		const suggested = keywords.filter((value) => {
			const key = value.toLowerCase();
			if (key === forPhrase.toLowerCase() || seen.has(key)) return false;
			seen.add(key);
			return true;
		}).map((value, i) => ({
			value,
			selected: i <= 3,
			custom: false
		}));
		return [
			{
				value: forPhrase,
				selected: true,
				locked: true
			},
			...suggested,
			...custom.filter((t) => !seen.has(t.value.toLowerCase()))
		].slice(0, KEYWORD_CAP);
	};
	useEffect(() => {
		if (requested.current) return void 0;
		requested.current = true;
		const controller = new AbortController();
		expandKeywords(phrase, { signal: controller.signal }).then((payload) => {
			const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [phrase];
			setExpansionSource(payload?.source ?? null);
			setTerms(applyExpansion(keywords, phrase));
		}).catch(() => {
			setTerms([{
				value: phrase,
				selected: true,
				locked: true
			}]);
		}).finally(() => setLoading(false));
		return () => controller.abort();
	}, [phrase]);
	const regenerate = () => {
		setRegenerating(true);
		expandKeywords(phrase).then((payload) => {
			const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [phrase];
			setExpansionSource(payload?.source ?? null);
			setTerms((prev) => applyExpansion(keywords, phrase, prev));
		}).catch(() => {}).finally(() => setRegenerating(false));
	};
	const selected = terms.filter((t) => t.selected).map((t) => t.value);
	const busy = loading || regenerating;
	const atKeywordCap = terms.length >= KEYWORD_CAP;
	const toggle = (value) => setTerms((prev) => prev.map((t) => t.value === value && !t.locked ? {
		...t,
		selected: !t.selected
	} : t));
	const remove = (value) => setTerms((prev) => prev.filter((t) => t.value !== value || t.locked));
	const commitAdd = () => {
		const value = draft.trim().replace(/\s+/g, " ");
		setDraft("");
		setAdding(false);
		if (!value) return;
		const match = terms.find((t) => t.value.toLowerCase() === value.toLowerCase());
		if (match) setTerms((prev) => prev.map((t) => t.value === match.value ? {
			...t,
			selected: true
		} : t));
		else if (terms.length < KEYWORD_CAP) setTerms((prev) => [...prev, {
			value,
			selected: true,
			custom: true
		}]);
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "sect",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "sect__h",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("p", {
						className: "sect__n",
						children: "Expand"
					}),
					/* @__PURE__ */ jsx("h2", { children: "Widen the pull" }),
					/* @__PURE__ */ jsxs("p", {
						className: "faint",
						style: {
							fontSize: ".85rem",
							marginTop: 6
						},
						children: [
							"We suggest the terms people actually pair with your ",
							noun,
							" on TikTok."
						]
					})
				] }), /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "btn btn--g btn--sm",
					onClick: regenerate,
					disabled: busy,
					children: [/* @__PURE__ */ jsx(Refresh, { className: regenerating ? "h-[15px] w-[15px] animate-spin" : "h-[15px] w-[15px]" }), regenerating ? "Regenerating…" : "Regenerate"]
				})]
			}), busy ? /* @__PURE__ */ jsx(SkeletonChips, {}) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("div", {
					className: "chips",
					children: [terms.map(({ value, selected: on, locked, custom }) => locked ? /* @__PURE__ */ jsxs("span", {
						className: "chip on",
						title: "The main keyword is always included",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "chip__b",
								children: /* @__PURE__ */ jsx(Check, {})
							}),
							value,
							/* @__PURE__ */ jsx("span", {
								className: "chip__y",
								children: "main"
							})
						]
					}, value) : /* @__PURE__ */ jsxs("span", {
						role: "button",
						tabIndex: 0,
						"aria-pressed": on,
						onClick: () => toggle(value),
						onKeyDown: (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								toggle(value);
							}
						},
						className: `chip${on ? " on" : ""}`,
						style: { cursor: "pointer" },
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "chip__b",
								children: /* @__PURE__ */ jsx(Check, {})
							}),
							value,
							custom && /* @__PURE__ */ jsx("span", {
								className: "chip__y",
								children: "yours"
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "chip__x",
								"aria-label": `Remove ${value}`,
								onClick: (e) => {
									e.stopPropagation();
									remove(value);
								},
								children: /* @__PURE__ */ jsx(Close, { className: "h-[13px] w-[13px]" })
							})
						]
					}, value)), adding ? /* @__PURE__ */ jsx("input", {
						autoFocus: true,
						className: "chip__add",
						value: draft,
						maxLength: 40,
						placeholder: "Add a keyword…",
						onChange: (e) => setDraft(e.target.value),
						onBlur: commitAdd,
						onKeyDown: (e) => {
							if (e.key === "Enter") commitAdd();
							if (e.key === "Escape") {
								setDraft("");
								setAdding(false);
							}
						}
					}) : /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "chip",
						style: {
							color: "var(--amber-ink)",
							borderStyle: "dashed",
							cursor: atKeywordCap ? "not-allowed" : "pointer"
						},
						disabled: atKeywordCap,
						onClick: () => setAdding(true),
						children: [/* @__PURE__ */ jsx(Plus, { className: "h-[13px] w-[13px]" }), " Add your own"]
					})]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "hint",
					children: [
						selected.length,
						" of ",
						terms.length,
						" selected · each keyword widens the same single search."
					]
				}),
				expansionSource === "fallback" && /* @__PURE__ */ jsx("p", {
					className: "hint",
					children: "Suggestions came from templates this time — edit them freely."
				})
			] })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "sect",
			children: [/* @__PURE__ */ jsx("div", {
				className: "sect__h",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "sect__n",
					children: "Schedule"
				}), /* @__PURE__ */ jsx("h2", { children: "How often should we re-run it?" })] })
			}), /* @__PURE__ */ jsx("div", {
				className: "freq",
				children: FREQUENCIES.map((f) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: `fq${frequency === f.value ? " on" : ""}`,
					"aria-pressed": frequency === f.value,
					onClick: () => setFrequency(f.value),
					children: [/* @__PURE__ */ jsxs("span", {
						className: "fq__t",
						children: [/* @__PURE__ */ jsx("span", { className: "fq__r" }), f.label]
					}), /* @__PURE__ */ jsx("p", { children: f.hint })]
				}, f.value))
			})]
		}),
		error && /* @__PURE__ */ jsx("div", {
			className: "sect",
			children: /* @__PURE__ */ jsx("p", {
				className: "pill pill--bad",
				style: {
					height: "auto",
					padding: "8px 12px"
				},
				children: error
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "sect actrow",
			children: [/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "btn btn--g",
				onClick: onBack,
				children: "Back"
			}), /* @__PURE__ */ jsxs("button", {
				type: "button",
				className: "btn btn--y",
				disabled: busy || submitting || selected.length === 0,
				onClick: () => onSubmit({
					phrase,
					keywords: selected,
					frequency,
					name: phrase
				}),
				children: [
					submitting ? "Starting…" : nextLabel,
					" ",
					/* @__PURE__ */ jsx(Arrow, {})
				]
			})]
		})
	] });
}
//#endregion
//#region resources/js/landing/flow/screens/SourcesScreen.jsx
/**
* Step three of the brand/competitor flow — optional. Connect the subject's
* TikTok handle and/or website so results match more tightly. There is nothing
* to connect for a product search, so the wizard skips this step entirely for
* products (see SearchWizard's FLOW.kind branching).
*
* Both are skippable: "Skip" and "Run the search" both start the scrape; the
* handle/website ride along in the payload for the backend to use when it can.
*/
function SourcesScreen({ onBack, onSkip, onRun, submitting = false }) {
	const [handle, setHandle] = useState("");
	const [website, setWebsite] = useState("");
	const sources = () => ({
		tiktokHandle: handle.trim().replace(/^@/, ""),
		website: website.trim()
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "sect",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "sect__h",
				children: /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("p", {
						className: "sect__n",
						children: "Optional"
					}),
					/* @__PURE__ */ jsx("h2", { children: "Add the brand’s handle or website" }),
					/* @__PURE__ */ jsx("p", {
						className: "faint",
						style: {
							fontSize: ".88rem",
							marginTop: 8,
							maxWidth: "60ch"
						},
						children: "Helps us match videos more accurately and unlock better insights."
					})
				] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "srcs",
				children: [/* @__PURE__ */ jsxs("div", {
					className: `src${handle.trim() ? " is-on" : ""}`,
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "src__h",
							children: [/* @__PURE__ */ jsx("span", {
								className: "src__i",
								children: /* @__PURE__ */ jsx(Play, { className: "h-[15px] w-[15px]" })
							}), /* @__PURE__ */ jsx("div", {
								style: { minWidth: 0 },
								children: /* @__PURE__ */ jsx("p", {
									className: "src__t",
									children: "TikTok handle"
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "src__f",
							children: [/* @__PURE__ */ jsx("span", {
								className: "src__pre",
								children: "@"
							}), /* @__PURE__ */ jsx("input", {
								value: handle.replace(/^@/, ""),
								onChange: (e) => setHandle(e.target.value),
								placeholder: "rhode",
								"aria-label": "TikTok handle"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "src__m faint",
							children: "Optional, but it sharpens every number on the report."
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: `src${website.trim() ? " is-on" : ""}`,
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "src__h",
							children: [/* @__PURE__ */ jsx("span", {
								className: "src__i",
								children: /* @__PURE__ */ jsx(Store, { className: "h-[15px] w-[15px]" })
							}), /* @__PURE__ */ jsx("div", {
								style: { minWidth: 0 },
								children: /* @__PURE__ */ jsx("p", {
									className: "src__t",
									children: "Website"
								})
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "src__f",
							children: [/* @__PURE__ */ jsx("span", {
								className: "src__pre",
								children: "https://"
							}), /* @__PURE__ */ jsx("input", {
								value: website,
								onChange: (e) => setWebsite(e.target.value),
								placeholder: "rhodeskin.com",
								"aria-label": "Website"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "src__m faint",
							children: "Optional"
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "actrow",
				style: { marginTop: 24 },
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "btn btn--g",
					onClick: onBack,
					disabled: submitting,
					children: "Back"
				}), /* @__PURE__ */ jsxs("span", {
					className: "actrow__r",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn--g",
						onClick: onSkip,
						disabled: submitting,
						children: "Skip"
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "btn btn--y",
						onClick: () => onRun(sources()),
						disabled: submitting,
						children: [
							submitting ? "Starting…" : "Run the search",
							" ",
							/* @__PURE__ */ jsx(Arrow, {})
						]
					})]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/landing/flow/screens/RunningScreen.jsx
var POLL_MS = 1e4;
var STAGES = [
	"Starting the scrape",
	"Pulling videos from TikTok",
	"Filtering against your keywords",
	"Ranking by outlier score"
];
/**
* The transitional loading state after a run is dispatched. Not a wizard step —
* it has no stepper — just a live view of a scrape already running server-side.
*/
function RunningScreen({ searchId, onBack, onDone }) {
	const { auth = {} } = usePage().props;
	const signedIn = auth.signedIn ?? Boolean(auth.user);
	const [search, setSearch] = useState(null);
	const [failed, setFailed] = useState(null);
	const [email, setEmail] = useState("");
	const [emailSaved, setEmailSaved] = useState(false);
	const [stage, setStage] = useState(0);
	const finished = useRef(false);
	useEffect(() => {
		if (!searchId) return void 0;
		let timer;
		let cancelled = false;
		const poll = async () => {
			if (cancelled || finished.current) return;
			try {
				const found = (await fetchNotifications([searchId]))?.searches?.[0];
				if (found) {
					setSearch(found);
					if (found.status === "done") {
						finished.current = true;
						updateTracked(searchId, {
							completedPromptShown: true,
							name: found.name
						});
						onDone?.(found);
						return;
					}
					if (found.status === "failed") {
						finished.current = true;
						setFailed(found.latest_run_error || "The scrape did not finish. Try running the search again.");
						return;
					}
				}
			} catch {}
			timer = window.setTimeout(poll, POLL_MS);
		};
		const onVisibility = () => {
			if (document.visibilityState === "visible" && !finished.current) {
				window.clearTimeout(timer);
				poll();
			}
		};
		poll();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [searchId, onDone]);
	useEffect(() => {
		if (failed) return void 0;
		const timer = window.setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 12e3);
		return () => window.clearInterval(timer);
	}, [failed]);
	if (failed) return /* @__PURE__ */ jsx("div", {
		className: "card",
		children: /* @__PURE__ */ jsxs("div", {
			className: "run",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "pill pill--bad",
					style: { margin: "0 auto" },
					children: [/* @__PURE__ */ jsx("i", {}), "Search failed"]
				}),
				/* @__PURE__ */ jsx("h1", {
					style: { marginTop: 20 },
					children: "That run didn’t finish"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "muted",
					style: {
						maxWidth: 420,
						margin: "12px auto 0"
					},
					children: failed
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: onBack,
					className: "btn btn--g",
					style: { margin: "24px auto 0" },
					children: "Edit keywords and retry"
				})
			]
		})
	});
	const progress = (stage + 1) / STAGES.length * 100;
	return /* @__PURE__ */ jsx("div", {
		className: "card",
		children: /* @__PURE__ */ jsxs("div", {
			className: "run",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "run__d",
					children: /* @__PURE__ */ jsx(Search, { className: "h-[26px] w-[26px]" })
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "pill pill--run",
					style: { margin: "0 auto" },
					children: [/* @__PURE__ */ jsx("i", {}), "Search running · 1 to 20 min"]
				}),
				/* @__PURE__ */ jsx("h1", {
					style: { marginTop: 18 },
					children: search?.name ? `Scouting “${search.name}”` : "Scouting your niche"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "muted",
					style: {
						maxWidth: 420,
						margin: "12px auto 0"
					},
					children: "We’ll show the results right here the moment they’re ready."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "run__s",
					children: STAGES.map((label, i) => {
						const state = i < stage ? "done" : i === stage ? "now" : "";
						return /* @__PURE__ */ jsxs("div", {
							className: `stg ${state}`.trim(),
							children: [/* @__PURE__ */ jsx("span", {
								className: "stg__d",
								children: state === "done" && /* @__PURE__ */ jsx(Check, {})
							}), label]
						}, label);
					})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "runbar",
					children: /* @__PURE__ */ jsx("span", { style: { width: `${progress}%` } })
				}),
				!signedIn && /* @__PURE__ */ jsxs("div", {
					className: "capture",
					children: [
						/* @__PURE__ */ jsx("p", {
							style: {
								textAlign: "center",
								fontWeight: 700,
								fontSize: ".9rem",
								color: "var(--ink)"
							},
							children: "Or have them emailed when they’re done"
						}),
						/* @__PURE__ */ jsxs("a", {
							href: "/auth/google",
							className: "btn btn--k btn--w",
							style: {
								marginTop: 14,
								height: 48
							},
							children: [/* @__PURE__ */ jsx("span", {
								className: "gic",
								children: /* @__PURE__ */ jsx(Google, {})
							}), "Continue with Google"]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "divid",
							children: "or"
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: (e) => {
								e.preventDefault();
								setEmailSaved(true);
							},
							style: {
								display: "flex",
								gap: 8,
								flexWrap: "wrap"
							},
							children: [/* @__PURE__ */ jsx("input", {
								type: "email",
								required: true,
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "you@brand.com",
								className: "fld",
								style: {
									flex: 1,
									minWidth: 180
								}
							}), /* @__PURE__ */ jsxs("button", {
								type: "submit",
								className: "btn btn--y",
								children: [
									emailSaved ? "Saved" : "Email me",
									" ",
									!emailSaved && /* @__PURE__ */ jsx(Arrow, {})
								]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "faint",
					style: {
						fontSize: ".8rem",
						marginTop: signedIn ? 24 : 18
					},
					children: "Safe to close this tab — the search keeps running and stays in Library."
				})
			]
		})
	});
}
//#endregion
//#region resources/js/Pages/components/SearchWizard.jsx
var SearchWizard_exports = /* @__PURE__ */ __exportAll({ default: () => SearchWizard });
/**
* The whole in-app search flow on one page (Dashboard and /search share it).
*
* The wizard branches by search kind, exactly as the handoff spec requires:
*   - product  → Subject → Keywords → run          (2 steps, no Sources)
*   - brand /  → Subject → Keywords → Sources → run (3 steps; Sources is last,
*     competitor    optional, and asks for the account's handle/website)
* The run/loading screen is *not* a wizard step and has no stepper.
*
* Steps advance in local state so keyword work survives a step back, and a
* failed run drops straight back onto the tuned keywords. The only thing
* written to the URL is `?run=<id>` once a run exists, as a resume handle.
*/
var kindOf = (type) => type === "product" ? "product" : "brand";
var nounOf = (type) => type === "product" ? "product" : "brand";
function readRunParam() {
	if (typeof window === "undefined") return null;
	const id = new URLSearchParams(window.location.search).get("run");
	return id && /^\d+$/.test(id) ? Number(id) : null;
}
/**
* The card-header stepper. Sources is brand-only and last; there is no
* "Results" step — the visitor is already signed in by the time they run.
*/
function Stepper({ kind, current }) {
	const steps = kind === "product" ? [{
		k: "subject",
		l: "Subject"
	}, {
		k: "keywords",
		l: "Keywords"
	}] : [
		{
			k: "subject",
			l: "Subject"
		},
		{
			k: "keywords",
			l: "Keywords"
		},
		{
			k: "sources",
			l: "Sources"
		}
	];
	const idx = steps.findIndex((s) => s.k === current);
	return /* @__PURE__ */ jsx("div", {
		className: "step",
		children: steps.map((s, i) => {
			const state = i < idx ? "done" : i === idx ? "now" : "todo";
			return /* @__PURE__ */ jsxs("span", {
				className: "step__i",
				children: [
					i > 0 && /* @__PURE__ */ jsx("span", { className: "step__r" }),
					/* @__PURE__ */ jsx("span", {
						className: `step__n ${state}`,
						children: state === "done" ? /* @__PURE__ */ jsx(Check, {}) : i + 1
					}),
					/* @__PURE__ */ jsx("span", {
						className: `step__l ${state}`,
						children: s.l
					})
				]
			}, s.k);
		})
	});
}
function SearchWizard({ initialType = "brand", initialQuery = "", heading = "Start a search", subheading = "Pick one brand, competitor, or product — we widen it with smarter keywords on the next step.", subjectExtra = null }) {
	const resumeId = readRunParam();
	const [step, setStep] = useState(resumeId ? "running" : initialQuery ? "keywords" : "subject");
	const [type, setType] = useState(initialType);
	const [phrase, setPhrase] = useState(initialQuery);
	const [pending, setPending] = useState(null);
	const [searchId, setSearchId] = useState(resumeId);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const kind = kindOf(type);
	const stampUrl = (id) => {
		if (typeof window === "undefined") return;
		const url = new URL(window.location.href);
		if (id) url.searchParams.set("run", String(id));
		else url.searchParams.delete("run");
		window.history.replaceState(window.history.state, "", url.toString());
	};
	const pickSubject = ({ type: nextType, phrase: nextPhrase }) => {
		setType(nextType);
		setPhrase(nextPhrase);
		setStep("keywords");
	};
	const doCreate = async (payload, sources) => {
		setSubmitting(true);
		setError(null);
		try {
			const created = await createSavedSearch({
				type,
				phrase: payload.phrase || phrase,
				name: payload.name,
				keywords: payload.keywords,
				frequency: payload.frequency,
				sources
			});
			trackSearch({
				id: created.id,
				name: created.name,
				url: created.url
			});
			setSearchId(created.id);
			stampUrl(created.id);
			setStep("running");
		} catch (e) {
			setError(e.message || "Could not start the search. Try again.");
			setStep("keywords");
		} finally {
			setSubmitting(false);
		}
	};
	const afterKeywords = (payload) => {
		setPending(payload);
		if (kind === "brand") setStep("sources");
		else doCreate(payload);
	};
	const backToKeywords = () => {
		stampUrl(null);
		setSearchId(null);
		setStep(phrase ? "keywords" : "subject");
	};
	const onDone = useCallback((found) => router.visit(found?.url ?? `/bookmark/${found?.id ?? searchId}`), [searchId]);
	const topTitle = step === "subject" ? heading : phrase;
	const topSub = step === "subject" ? subheading : step === "sources" ? "Step 3 of 3 — optional." : `Step 2 of ${kind === "product" ? 2 : 3} — add terms to expand on your ${nounOf(type)}. Ticking six terms still spends one search.`;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		step !== "running" && /* @__PURE__ */ jsxs("div", {
			className: "top",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", { children: topTitle }), /* @__PURE__ */ jsx("p", { children: topSub })] }), /* @__PURE__ */ jsx(EntitlementsBar, {})]
		}),
		step === "running" && searchId ? /* @__PURE__ */ jsx(RunningScreen, {
			searchId,
			onBack: backToKeywords,
			onDone
		}) : /* @__PURE__ */ jsxs("div", {
			className: "card",
			children: [
				/* @__PURE__ */ jsx(Stepper, {
					kind,
					current: step
				}),
				step === "subject" && /* @__PURE__ */ jsx(SearchLauncher, {
					initialType: type,
					initialQuery: phrase,
					onSubmit: pickSubject
				}),
				step === "keywords" && phrase && /* @__PURE__ */ jsx(KeywordsScreen, {
					phrase,
					noun: nounOf(type),
					nextLabel: kind === "brand" ? "Continue" : "Run the search",
					submitting,
					error,
					onBack: () => setStep("subject"),
					onSubmit: afterKeywords
				}, `${type}:${phrase}`),
				step === "sources" && /* @__PURE__ */ jsx(SourcesScreen, {
					submitting,
					onBack: () => setStep("keywords"),
					onSkip: () => doCreate(pending),
					onRun: (sources) => doCreate(pending, sources)
				})
			]
		}),
		step === "subject" && subjectExtra
	] });
}
//#endregion
//#region resources/js/Pages/Dashboard.jsx
var Dashboard_exports = /* @__PURE__ */ __exportAll({ default: () => Dashboard });
/** "Pick up where you left off" — the three most recent saved searches. */
function RecentCard({ searches }) {
	if (!searches?.length) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "card",
		style: { marginTop: 22 },
		children: /* @__PURE__ */ jsxs("div", {
			className: "sect",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "sect__h",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "sect__n",
					children: "Recent"
				}), /* @__PURE__ */ jsx("h2", { children: "Pick up where you left off" })] }), /* @__PURE__ */ jsxs(Link, {
					href: "/bookmark",
					className: "btn btn--g btn--sm",
					children: ["View all ", /* @__PURE__ */ jsx(Arrow, {})]
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "rows",
				children: searches.map((search) => /* @__PURE__ */ jsx(SavedSearchRow, { search }, search.id))
			})]
		})
	});
}
function Dashboard() {
	const { flash = {}, recent = [] } = usePage().props;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Dashboard · Brand Beacon" }), /* @__PURE__ */ jsxs(AppLayout, {
		width: "max-w-4xl",
		children: [flash.status && /* @__PURE__ */ jsx("div", {
			style: {
				marginBottom: 18,
				padding: "12px 16px",
				borderRadius: "var(--r)",
				background: "var(--ok-bg)",
				color: "var(--ok)",
				fontWeight: 600,
				fontSize: ".85rem"
			},
			children: flash.status
		}), /* @__PURE__ */ jsx(SearchWizard, { subjectExtra: /* @__PURE__ */ jsx(RecentCard, { searches: recent }) })]
	})] });
}
//#endregion
//#region resources/js/Pages/Home.jsx
var Home_exports = /* @__PURE__ */ __exportAll({ default: () => Home });
function Home({ stack, integrations }) {
	const { props } = usePage();
	const status = props.flash?.status;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Project Base" }), /* @__PURE__ */ jsx("main", {
		className: "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_32%),linear-gradient(160deg,_#0c0a09,_#1c1917_55%,_#0f172a)]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10",
			children: [
				/* @__PURE__ */ jsxs("section", {
					className: "rounded-3xl border border-white/10 bg-white/6 p-8 shadow-2xl shadow-orange-950/20 backdrop-blur",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-sm uppercase tracking-[0.35em] text-orange-300",
							children: "Laravel + React Starter"
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "mt-4 max-w-3xl font-serif text-4xl leading-tight text-white md:text-6xl",
							children: "A base app for content ops, scraping workflows, and paid access."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-5 max-w-2xl text-base text-stone-300 md:text-lg",
							children: "This starter is wired for Inertia React on the frontend, Laravel on the backend, PostgreSQL for persistence, and Redis for cache, queues, and sessions."
						}),
						status ? /* @__PURE__ */ jsx("div", {
							className: "mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200",
							children: status
						}) : null
					]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "grid gap-6 lg:grid-cols-[1.2fr,0.8fr]",
					children: [/* @__PURE__ */ jsxs("article", {
						className: "rounded-3xl border border-white/10 bg-black/20 p-6",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-semibold text-white",
							children: "Stack"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-5 grid gap-4 sm:grid-cols-2",
							children: Object.entries(stack).map(([label, value]) => /* @__PURE__ */ jsxs("div", {
								className: "rounded-2xl border border-white/10 bg-white/5 p-4",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-xs uppercase tracking-[0.25em] text-stone-400",
									children: label
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-2 text-lg text-stone-100",
									children: value
								})]
							}, label))
						})]
					}), /* @__PURE__ */ jsxs("article", {
						className: "rounded-3xl border border-white/10 bg-black/20 p-6",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "text-xl font-semibold text-white",
								children: "Integrations"
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-5 space-y-3",
								children: integrations.map((integration) => /* @__PURE__ */ jsx("div", {
									className: "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-stone-200",
									children: integration
								}, integration))
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-6 rounded-2xl border border-orange-300/20 bg-orange-400/10 p-4 text-sm text-orange-100",
								children: [
									"Google auth routes and service env keys are stubbed. Stripe and Apify credentials are ready to drop into ",
									/* @__PURE__ */ jsx("code", { children: ".env" }),
									"."
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ jsx(AppFooter, {
					label: "Outlier Vault starter shell",
					className: "mt-auto border-white/10 bg-white/5 dark:border-white/10 dark:bg-white/5"
				})
			]
		})
	})] });
}
//#endregion
//#region resources/js/landing/sections/Nav.jsx
function Nav() {
	const [stuck, setStuck] = useState(false);
	useEffect(() => {
		const onScroll = () => setStuck(window.scrollY > 8);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return /* @__PURE__ */ jsx("header", {
		className: `nav${stuck ? " is-stuck" : ""}`,
		id: "nav",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap nav__in",
			children: [/* @__PURE__ */ jsxs("a", {
				href: "#top",
				className: "brand",
				children: [/* @__PURE__ */ jsx(Logo, { className: "h-8 w-8" }), /* @__PURE__ */ jsx("span", { children: "Brand Beacon" })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "nav__end",
				children: [/* @__PURE__ */ jsx(Link, {
					href: "/login",
					className: "nav__signin",
					children: "Sign In"
				}), /* @__PURE__ */ jsxs("a", {
					href: "/auth/google",
					className: "btn btn--primary",
					style: {
						height: 44,
						padding: "0 20px"
					},
					children: [/* @__PURE__ */ jsx("span", {
						className: "gicon gicon--sm",
						children: /* @__PURE__ */ jsx(Google, {})
					}), "Try for Free"]
				})]
			})]
		})
	});
}
//#endregion
//#region resources/js/landing/components/CountUp.jsx
/**
* Animates a numeric stat when it first scrolls into view. Values like "62B+"
* or "<20min" are split into prefix / number / suffix so the units survive.
*/
var PARTS = /^(\D*?)([\d.]+)(.*)$/;
function CountUp({ value, duration = 1400, className = "" }) {
	const ref = useRef(null);
	const hasAnimated = useRef(false);
	const parts = useMemo(() => {
		const match = String(value).match(PARTS);
		if (!match) return {
			prefix: "",
			numeric: null,
			suffix: "",
			decimals: 0
		};
		return {
			prefix: match[1],
			numeric: parseFloat(match[2]),
			suffix: match[3],
			decimals: match[2].includes(".") ? match[2].split(".")[1].length : 0
		};
	}, [value]);
	const [shown, setShown] = useState(() => parts.numeric === null ? value : null);
	const [settled, setSettled] = useState(parts.numeric === null);
	useEffect(() => {
		if (parts.numeric === null) {
			setShown(value);
			return;
		}
		const el = ref.current;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const settle = () => {
			setShown(value);
			setSettled(true);
		};
		if (!el || reduced || typeof IntersectionObserver === "undefined") {
			hasAnimated.current = true;
			settle();
			return;
		}
		let frame;
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting || hasAnimated.current) return;
			hasAnimated.current = true;
			observer.disconnect();
			const start = performance.now();
			const tick = (now) => {
				const t = Math.min((now - start) / duration, 1);
				const eased = 1 - Math.pow(1 - t, 3);
				const current = (parts.numeric * eased).toFixed(parts.decimals);
				setSettled(false);
				setShown(`${parts.prefix}${current}${parts.suffix}`);
				if (t < 1) frame = requestAnimationFrame(tick);
				else settle();
			};
			frame = requestAnimationFrame(tick);
		}, { threshold: .4 });
		observer.observe(el);
		return () => {
			observer.disconnect();
			if (frame) cancelAnimationFrame(frame);
		};
	}, [
		value,
		duration,
		parts
	]);
	return /* @__PURE__ */ jsx("span", {
		ref,
		className: `${className} ${settled ? "" : "inline-block min-w-[3ch] animate-pulse rounded-[0.2em] bg-[linear-gradient(90deg,rgba(255,198,41,.15),rgba(255,198,41,.45),rgba(255,198,41,.15))] px-[0.12em] text-transparent bg-[length:220%_100%] animate-shimmer"}`.trim(),
		children: shown ?? `${parts.prefix}0${parts.suffix}`
	});
}
//#endregion
//#region resources/js/landing/data/dummy.js
var BRANDS = [
	{
		name: "Glossier",
		category: "Beauty",
		reach: "4.2M"
	},
	{
		name: "GoPure",
		category: "Skincare",
		reach: "1.8M"
	},
	{
		name: "Ridge",
		category: "Accessories",
		reach: "3.1M"
	},
	{
		name: "Olipop",
		category: "Beverage",
		reach: "6.7M"
	},
	{
		name: "Caraway",
		category: "Home",
		reach: "2.4M"
	},
	{
		name: "Loops",
		category: "Skincare",
		reach: "980K"
	},
	{
		name: "Hexclad",
		category: "Kitchen",
		reach: "5.3M"
	},
	{
		name: "Vessi",
		category: "Footwear",
		reach: "1.2M"
	},
	{
		name: "Bala",
		category: "Fitness",
		reach: "2.9M"
	},
	{
		name: "Mud\\Wtr",
		category: "Beverage",
		reach: "3.8M"
	},
	{
		name: "Solawave",
		category: "Beauty Tech",
		reach: "4.6M"
	},
	{
		name: "Jones Road",
		category: "Beauty",
		reach: "7.1M"
	}
];
var FEATURES = [
	{
		id: "outliers",
		tag: "Discovery",
		title: "Outlier Vault",
		body: "Surface the TikToks in your category that broke out this week — the ones running 10x above the creator’s own baseline, not just the ones with big follower counts.",
		bullets: [
			"Outlier scoring vs creator baseline",
			"Last 7 / 30 / 90 day windows",
			"Sound, hashtag and format tags"
		],
		accent: "from-[#3a2b6b] to-[#8b3df0]"
	},
	{
		id: "competitors",
		tag: "Monitoring",
		title: "Competitor Tracking",
		body: "Point Brand Beacon at a competitor and get a running feed of every video mentioning them - organic creator posts, affiliate content, and paid spark ads alike.",
		bullets: [
			"Unlimited competitor bookmarks",
			"Weekly change digest",
			"Share-of-voice trendline"
		],
		accent: "from-[#0f3d5c] to-[#2aa7c4]"
	},
	{
		id: "creators",
		tag: "Sourcing",
		title: "Creator Shortlists",
		body: "Every viral video comes attached to a creator. Filter by engagement, posting cadence, and category fit, then export a shortlist your team can actually reach out to.",
		bullets: [
			"Engagement + consistency scores",
			"CSV export",
			"Dedupe against past outreach"
		],
		accent: "from-[#5c1030] to-[#ff3d71]"
	},
	{
		id: "alerts",
		tag: "Automation",
		title: "Virality Alerts",
		body: "Get pinged the moment a video mentioning your brand crosses a threshold you set. Catch the good ones early, and the bad ones earlier.",
		bullets: [
			"Threshold + velocity triggers",
			"Slack and email delivery",
			"Per-search mute rules"
		],
		accent: "from-[#173a2a] to-[#3fbf7a]"
	}
];
var STEPS = [
	{
		n: "01",
		title: "Name one subject",
		body: "Your brand, one competitor, or one product. One subject per search keeps every result readable."
	},
	{
		n: "02",
		title: "Widen with keywords",
		body: "We suggest the terms people actually pair with your subject on TikTok. Tick the ones that fit."
	},
	{
		n: "03",
		title: "Get the viral cut",
		body: "We scan hundreds of videos and hand back the top performers, ranked by views and outlier score."
	},
	{
		n: "04",
		title: "Track it weekly",
		body: "Save the search and Brand Beacon re-runs it on a schedule, emailing you only what is new."
	}
];
var STATS = [
	{
		value: "62B+",
		label: "Views analyzed"
	},
	{
		value: "4.1M",
		label: "Videos indexed"
	},
	{
		value: "11K",
		label: "Brands tracked"
	},
	{
		value: "<20min",
		label: "Median search time"
	}
];
var TESTIMONIALS = [
	{
		quote: "We found the creator driving 40% of our category’s TikTok volume in the first search. She was not on any agency list we had been sent.",
		name: "Dana Whitfield",
		role: "Head of Growth",
		company: "Loops Beauty",
		initials: "DW"
	},
	{
		quote: "Our competitive readout used to be a Friday afternoon of scrolling. Now it lands in Slack on Monday morning and it is more complete.",
		name: "Marcus Idowu",
		role: "Brand Marketing Lead",
		company: "Caraway",
		initials: "MI"
	},
	{
		quote: "The outlier scoring is the part that matters. Big accounts posting mediocre videos are noise. Brand Beacon filters those out by default.",
		name: "Priya Raman",
		role: "Social Director",
		company: "Olipop",
		initials: "PR"
	},
	{
		quote: "We caught a product complaint trending at 200K views before it hit 2M. That alert alone paid for the year.",
		name: "Tom Bexley",
		role: "VP Communications",
		company: "Hexclad",
		initials: "TB"
	},
	{
		quote: "I ran one free search to test it and forwarded the results to my CMO the same afternoon. We were on Premium by the end of the week.",
		name: "Sofia Marchetti",
		role: "Performance Manager",
		company: "Vessi",
		initials: "SM"
	},
	{
		quote: "It works for our niche, which is the thing every other tool failed at. Small category, still found 300 relevant videos.",
		name: "Alex Kerrigan",
		role: "Founder",
		company: "Bala",
		initials: "AK"
	}
];
var PRICING = { monthly: [
	{
		slug: "free",
		name: "Free",
		price: 0,
		tagline: "One search, no card.",
		cta: "Run a free search",
		features: [
			"1 free search",
			"0 video bookmarks",
			"0 search bookmarks",
			"0 video analysis"
		],
		searchCreditsLimit: 1,
		searchCreditsUsed: 0,
		bookmarkLimit: 0,
		bookmarksUsed: 0,
		videoBookmarkLimit: 0,
		videoBookmarkUsed: 0,
		searchBookmarkLimit: 0,
		searchBookmarkUsed: 0,
		videoAnalysisLimit: 0,
		videoAnalysisUsed: 0,
		trialEnabled: true
	},
	{
		slug: "basic",
		name: "Basic",
		price: 79,
		tagline: "For a single brand.",
		cta: "Choose Basic",
		popular: true,
		features: [
			"150 searches",
			"50 video bookmarks",
			"50 search bookmarks",
			"50 video analysis",
			"Weekly + monthly scheduling",
			"CSV export for reports",
			"Virality alerts"
		],
		searchCreditsLimit: 150,
		searchCreditsUsed: 0,
		bookmarkLimit: 50,
		bookmarksUsed: 0,
		videoBookmarkLimit: 50,
		videoBookmarkUsed: 0,
		searchBookmarkLimit: 50,
		searchBookmarkUsed: 0,
		videoAnalysisLimit: 50,
		videoAnalysisUsed: 0,
		trialEnabled: true
	},
	{
		slug: "premium",
		name: "Premium",
		price: 199,
		tagline: "For brand and agency teams.",
		cta: "Choose Premium",
		features: [
			"400 searches",
			"Unlimited bookmarks",
			"Weekly + monthly scheduling",
			"Virality alerts",
			"CSV export for reports"
		],
		searchCreditsLimit: 400,
		searchCreditsUsed: 0,
		bookmarkLimit: -1,
		bookmarksUsed: 0,
		videoBookmarkLimit: -1,
		videoBookmarkUsed: 0,
		searchBookmarkLimit: -1,
		searchBookmarkUsed: 0,
		videoAnalysisLimit: -1,
		videoAnalysisUsed: 0,
		trialEnabled: true
	}
] };
var PRICING_PLAN_ORDER = PRICING.monthly.map((plan) => plan.slug ?? plan.name.toLowerCase());
var FAQS = [
	{
		q: "What counts as one search?",
		a: "One subject — your brand, a single competitor, or a single product — plus any keywords you attach to widen it. All of those keywords are covered by that one search, so ticking six terms still only spends one."
	},
	{
		q: "How long does a search take?",
		a: "Most finish in under 20 minutes. You can stay on the results page and watch it fill in, or close the tab and we will email you the moment it is ready."
	},
	{
		q: "Why focus on outliers instead of follower count?",
		a: "A 500K-follower account posting a 40K-view video tells you nothing. A 12K-follower account posting a 3M-view video tells you the format works. We rank by performance relative to the creator’s own baseline, so breakout content surfaces regardless of account size."
	},
	{
		q: "Do you cover niche categories?",
		a: "Yes. The index is built from broad TikTok crawls rather than a curated brand list, so small categories still return meaningful volume. If a search comes back thin, we tell you rather than padding it with irrelevant results."
	},
	{
		q: "Can I track competitors I do not name upfront?",
		a: "On Basic and above, each tracked search can watch a competitor continuously. Add it to Library and Brand Beacon re-runs on your schedule, sending only what changed since last time."
	},
	{
		q: "What happens after the 10 day trial?",
		a: "The trial converts to Basic at $79/mo unless you cancel before day 10. Cancelling takes two clicks in account settings — no call, no form."
	},
	{
		q: "Is the data real-time?",
		a: "Close to it. Videos enter the index within a few hours of posting, and view counts on tracked videos refresh on every scheduled check."
	},
	{
		q: "Do you offer an annual plan?",
		a: "Yes — annual billing takes about 20% off every paid tier. Toggle billing at the top of the pricing table to see the yearly rate."
	}
];
//#endregion
//#region resources/js/landing/sections/Hero.jsx
var MODES = [
	{
		key: "brand",
		label: "Your brand",
		icon: Store,
		prompt: "Which brand do you want to research?",
		sample: "rhode skin"
	},
	{
		key: "competitor",
		label: "A competitor",
		icon: Target,
		prompt: "Which competitor should we watch?",
		sample: "skims"
	},
	{
		key: "product",
		label: "A product",
		icon: Search,
		prompt: "Which product do you want to track?",
		sample: "lip oil"
	}
];
function Hero({ onStart }) {
	const [type, setType] = useState("brand");
	const [value, setValue] = useState("");
	const [ghost, setGhost] = useState("");
	const inputRef = useRef(null);
	const mode = MODES.find((m) => m.key === type) ?? MODES[0];
	const query = value.trim().replace(/\s+/g, " ");
	const showGhost = value === "";
	useEffect(() => {
		if (!showGhost) return void 0;
		const sample = mode.sample;
		let i = 0;
		let dir = 1;
		let timer;
		const tick = () => {
			setGhost(sample.slice(0, i));
			if (dir === 1) {
				i += 1;
				if (i > sample.length) {
					dir = -1;
					timer = window.setTimeout(tick, 1600);
					return;
				}
			} else {
				i -= 1;
				if (i < 0) {
					i = 0;
					dir = 1;
				}
			}
			timer = window.setTimeout(tick, dir === 1 ? 95 : 45);
		};
		tick();
		return () => window.clearTimeout(timer);
	}, [mode.sample, showGhost]);
	const submit = (e) => {
		e?.preventDefault();
		if (!query) {
			inputRef.current?.focus();
			return;
		}
		onStart(type, query);
	};
	return /* @__PURE__ */ jsx("section", {
		className: "hero",
		id: "top",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap",
			children: [
				/* @__PURE__ */ jsxs("h1", { children: ["TikTok Brand and Social Media ", /* @__PURE__ */ jsx("span", {
					className: "hl",
					children: "Intelligence Tool"
				})] }),
				/* @__PURE__ */ jsx("p", {
					className: "hero__sub",
					children: "Enter your brand, a competitor or single product; then we will scan TikTok and return the most viral outlier videos, the creators behind them and the reason they went viral"
				}),
				/* @__PURE__ */ jsx("div", {
					className: "modes",
					role: "tablist",
					"aria-label": "What to research",
					children: MODES.map(({ key, label, icon: Icon }) => /* @__PURE__ */ jsxs("button", {
						className: `mode${key === type ? " is-on" : ""}`,
						role: "tab",
						"aria-selected": key === type,
						onClick: () => setType(key),
						children: [/* @__PURE__ */ jsx(Icon, { className: "h-[15px] w-[15px]" }), label]
					}, key))
				}),
				/* @__PURE__ */ jsx("label", {
					className: "box__label",
					htmlFor: "search-subject",
					children: mode.prompt
				}),
				/* @__PURE__ */ jsxs("form", {
					className: "box",
					onSubmit: submit,
					children: [/* @__PURE__ */ jsxs("div", {
						className: "box__field",
						children: [/* @__PURE__ */ jsxs("div", {
							className: `box__ghost${showGhost ? "" : " is-off"}`,
							"aria-hidden": true,
							children: [/* @__PURE__ */ jsx("span", { children: ghost }), /* @__PURE__ */ jsx("span", { className: "caret" })]
						}), /* @__PURE__ */ jsx("textarea", {
							ref: inputRef,
							id: "search-subject",
							rows: 2,
							maxLength: 80,
							value,
							onChange: (e) => setValue(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter" && !e.shiftKey) submit(e);
							},
							"aria-label": mode.prompt
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "box__foot",
						children: [/* @__PURE__ */ jsxs("p", {
							className: "box__try",
							children: [
								"Try",
								" ",
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: () => {
										setValue(mode.sample);
										inputRef.current?.focus();
									},
									children: [
										"“",
										mode.sample,
										"”"
									]
								}),
								/* @__PURE__ */ jsx("span", { children: "One subject per search keeps each result tight." })
							]
						}), /* @__PURE__ */ jsxs("button", {
							type: "submit",
							className: "btn btn--primary btn--lg btn--pulse",
							children: ["Find outliers", /* @__PURE__ */ jsx(Arrow, { className: "btn__arrow h-[15px] w-[15px]" })]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "hero__ctas",
					children: [/* @__PURE__ */ jsxs("a", {
						href: "/auth/google",
						className: "btn btn--ghost btn--lg",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "gicon",
								children: /* @__PURE__ */ jsx(Google, {})
							}),
							"Get started free",
							/* @__PURE__ */ jsx(Arrow, { className: "btn__arrow h-[15px] w-[15px]" })
						]
					}), /* @__PURE__ */ jsx("a", {
						href: "#how",
						className: "btn btn--ghost btn--lg",
						children: "See how it works"
					})]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "hero__note",
					children: "1 free search · no credit card"
				}),
				/* @__PURE__ */ jsx("dl", {
					className: "stats",
					children: STATS.map((s) => /* @__PURE__ */ jsxs("div", {
						className: "stat",
						children: [/* @__PURE__ */ jsx("dt", {
							className: "stat__v",
							children: /* @__PURE__ */ jsx(CountUp, { value: s.value })
						}), /* @__PURE__ */ jsxs("dd", {
							className: "stat__l",
							children: [/* @__PURE__ */ jsx(Trend, { className: "h-[11px] w-[11px]" }), s.label]
						})]
					}, s.label))
				})
			]
		})
	});
}
//#endregion
//#region resources/js/landing/sections/BrandMarquee.jsx
function initials(name) {
	return name.replace(/[^a-zA-Z0-9 ]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}
function Chip({ brand }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "chip",
		children: [/* @__PURE__ */ jsx("span", {
			className: "chip__i",
			children: initials(brand.name)
		}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
			className: "chip__n",
			children: brand.name
		}), /* @__PURE__ */ jsxs("span", {
			className: "chip__m",
			children: [
				brand.category,
				" · ",
				brand.reach
			]
		})] })]
	});
}
function Row({ brands, variant }) {
	const loop = [...brands, ...brands];
	return /* @__PURE__ */ jsx("div", {
		className: `mq__row mq__row--${variant}`,
		children: loop.map((brand, i) => /* @__PURE__ */ jsx(Chip, { brand }, `${brand.name}-${i}`))
	});
}
function BrandMarquee() {
	const half = Math.ceil(BRANDS.length / 2);
	return /* @__PURE__ */ jsxs("section", {
		className: "mq",
		children: [/* @__PURE__ */ jsx("p", {
			className: "mq__t",
			children: "Tracking the TikTok footprint of 11,000+ brands"
		}), /* @__PURE__ */ jsxs("div", {
			className: "mq__mask",
			children: [/* @__PURE__ */ jsx(Row, {
				brands: BRANDS.slice(0, half),
				variant: "a"
			}), /* @__PURE__ */ jsx(Row, {
				brands: BRANDS.slice(half),
				variant: "b"
			})]
		})]
	});
}
//#endregion
//#region resources/js/landing/sections/Features.jsx
var PREVIEW_VIDS = [
	{
		handle: "@glossier",
		mult: "18x",
		views: "4.2M",
		image: "/images/landing/discovery-coco-shimmy.png"
	},
	{
		handle: "@glowwithtay",
		mult: "12x",
		views: "3.1M",
		image: "/images/landing/discovery-buyer-beware.png"
	},
	{
		handle: "@cleangirl.ari",
		mult: "22x",
		views: "2.8M",
		image: "/images/landing/discovery-brow-grooming.png"
	}
];
var PREVIEW_BARS = [
	{
		label: "Outlier 20x+",
		fill: 92,
		n: 11
	},
	{
		label: "10–20x",
		fill: 68,
		n: 21
	},
	{
		label: "5–10x",
		fill: 44,
		n: 34
	},
	{
		label: "3–5x",
		fill: 26,
		n: 52
	}
];
function Features() {
	const [active, setActive] = useState(FEATURES[0].id);
	const current = FEATURES.find((f) => f.id === active) ?? FEATURES[0];
	return /* @__PURE__ */ jsxs("section", {
		className: "sec wrap",
		id: "features",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "head",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "eyebrow",
					children: "Research & monitor"
				}),
				/* @__PURE__ */ jsx("h2", { children: "Everything you need to read TikTok" }),
				/* @__PURE__ */ jsx("p", { children: "Four tools built on one index. Find what broke out, watch who is moving, and get told when something about you starts climbing." })
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "feat__grid",
			children: [/* @__PURE__ */ jsx("div", {
				className: "feat__list",
				children: FEATURES.map((feature) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: `fbtn${feature.id === active ? " is-on" : ""}`,
					onClick: () => setActive(feature.id),
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "fbtn__top",
							children: [/* @__PURE__ */ jsx("span", { className: "fdot" }), /* @__PURE__ */ jsx("span", {
								className: "fbtn__t",
								children: feature.title
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "fbtn__b",
							children: feature.body
						}),
						/* @__PURE__ */ jsx("ul", {
							className: "fbtn__ul",
							children: feature.bullets.map((bullet) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx(Check, { className: "h-[13px] w-[13px]" }), bullet] }, bullet))
						})
					]
				}, feature.id))
			}), /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", {
				className: "prev",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "prev__top",
						children: [/* @__PURE__ */ jsx("span", {
							className: "prev__tag",
							children: current.tag
						}), /* @__PURE__ */ jsxs("span", {
							className: "prev__live",
							children: [/* @__PURE__ */ jsx("i", {}), "Live preview"]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "prev__vids",
						children: PREVIEW_VIDS.map((v) => /* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsxs("div", {
								className: "vid__t",
								children: [
									/* @__PURE__ */ jsx("img", {
										className: "vid__img",
										src: v.image,
										alt: v.handle
									}),
									/* @__PURE__ */ jsx("span", {
										className: "vid__x",
										children: v.mult
									}),
									/* @__PURE__ */ jsx("span", {
										className: "vid__p",
										children: /* @__PURE__ */ jsx(Play, { className: "h-[11px] w-[11px]" })
									})
								]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "vid__v",
								children: v.views
							}),
							/* @__PURE__ */ jsx("p", {
								className: "vid__h",
								children: v.handle
							})
						] }, v.handle))
					}),
					/* @__PURE__ */ jsx("div", {
						className: "bars",
						children: PREVIEW_BARS.map((bar) => /* @__PURE__ */ jsxs("div", {
							className: "bar",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "bar__l",
									children: bar.label
								}),
								/* @__PURE__ */ jsx("span", {
									className: "bar__t",
									children: /* @__PURE__ */ jsx("span", {
										className: "bar__f",
										style: { width: `${bar.fill}%` }
									})
								}),
								/* @__PURE__ */ jsx("span", {
									className: "bar__n",
									children: bar.n
								})
							]
						}, bar.label))
					})
				]
			}) })]
		})]
	});
}
//#endregion
//#region resources/js/landing/sections/HowItWorks.jsx
function HowItWorks({ onStart }) {
	return /* @__PURE__ */ jsx("section", {
		className: "sec--pad",
		id: "how",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "head head--c",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "eyebrow",
							children: "How it works"
						}),
						/* @__PURE__ */ jsx("h2", { children: "One subject in, a viral cut out" }),
						/* @__PURE__ */ jsx("p", { children: "No dashboards to configure and no keyword research to do first. Four steps, most of them optional." })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "steps",
					children: STEPS.map((step) => /* @__PURE__ */ jsxs("div", {
						className: "step",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "step__n",
								children: step.n
							}),
							/* @__PURE__ */ jsx("h3", { children: step.title }),
							/* @__PURE__ */ jsx("p", { children: step.body })
						]
					}, step.n))
				}),
				/* @__PURE__ */ jsx("div", {
					className: "steps__cta",
					children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "btn btn--primary btn--lg",
						onClick: () => onStart(),
						children: ["Run your free search", /* @__PURE__ */ jsx(Arrow, { className: "btn__arrow h-[15px] w-[15px]" })]
					})
				})
			]
		})
	});
}
//#endregion
//#region resources/js/landing/sections/Testimonials.jsx
function Card({ t }) {
	return /* @__PURE__ */ jsxs("figure", {
		className: "tcard",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "tcard__q",
				children: "“"
			}),
			/* @__PURE__ */ jsx("blockquote", { children: t.quote }),
			/* @__PURE__ */ jsxs("figcaption", { children: [/* @__PURE__ */ jsx("span", {
				className: "tav",
				children: t.initials
			}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
				className: "tn",
				children: t.name
			}), /* @__PURE__ */ jsxs("span", {
				className: "tr",
				children: [
					t.role,
					" · ",
					t.company
				]
			})] })] })
		]
	});
}
function Testimonials() {
	const loop = [...TESTIMONIALS, ...TESTIMONIALS];
	return /* @__PURE__ */ jsxs("section", {
		className: "sec",
		id: "customers",
		children: [/* @__PURE__ */ jsx("div", {
			className: "wrap",
			children: /* @__PURE__ */ jsxs("div", {
				className: "head head--c",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "eyebrow",
						children: "Customers"
					}),
					/* @__PURE__ */ jsx("h2", { children: "Why brand teams switch to Brand Beacon" }),
					/* @__PURE__ */ jsx("p", { children: "Placeholder quotes for the MVP — swap these for real ones before launch." })
				]
			})
		}), /* @__PURE__ */ jsx("div", {
			className: "trail",
			children: /* @__PURE__ */ jsx("div", {
				className: "trow",
				children: loop.map((t, i) => /* @__PURE__ */ jsx(Card, { t }, `${t.name}-${i}`))
			})
		})]
	});
}
//#endregion
//#region resources/js/landing/sections/Pricing.jsx
function Pricing({ plans = [], onStart, onTrial }) {
	const visiblePlans = plans.length > 0 ? plans : PRICING.monthly;
	return /* @__PURE__ */ jsx("section", {
		className: "sec--pad",
		id: "pricing",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "head head--c",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "eyebrow",
							children: "Pricing"
						}),
						/* @__PURE__ */ jsx("h2", { children: "Simple, per-search pricing" }),
						/* @__PURE__ */ jsx("p", { children: "Start with one free search. Upgrade when you want tracking on a schedule." }),
						/* @__PURE__ */ jsxs("div", {
							className: "toggle",
							children: [/* @__PURE__ */ jsx("button", {
								className: "is-on",
								type: "button",
								children: "Monthly"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: true,
								children: "Annual · save 20%"
							})]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "plans",
					children: visiblePlans.map((plan) => {
						const free = plan.slug === "free";
						return /* @__PURE__ */ jsxs("div", {
							className: `plan${plan.popular ? " plan--pop" : ""}`,
							children: [
								plan.popular && /* @__PURE__ */ jsx("span", {
									className: "plan__pop",
									children: "Most popular"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "plan__n",
									children: plan.name
								}),
								/* @__PURE__ */ jsx("p", {
									className: "plan__t",
									children: plan.tagline
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "plan__p",
									children: ["$0", free && /* @__PURE__ */ jsx("span", { children: "/mo" })]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "plan__s",
									children: free ? "" : `then $${plan.price} after 7 days`
								}),
								/* @__PURE__ */ jsx("ul", { children: plan.features.map((feature) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx(Check, { className: "h-[15px] w-[15px]" }), feature] }, feature)) }),
								free ? /* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--ghost btn--wide",
									onClick: () => onStart(),
									children: "Run a free search"
								}) : /* @__PURE__ */ jsx("button", {
									type: "button",
									className: `btn btn--wide ${plan.popular ? "btn--primary" : "btn--ghost"}`,
									onClick: () => onTrial(plan),
									children: plan.cta
								})
							]
						}, plan.slug);
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "trial",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", { children: "Start a 7-day Basic trial" }), /* @__PURE__ */ jsx("p", { children: "Try the full Basic plan for 7 days. Card details are collected up front, and billing starts only after the trial ends unless you cancel." })] }), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn--ink",
						style: { flex: "none" },
						onClick: () => onTrial(visiblePlans.find((p) => p.slug === "basic")),
						children: "Start 7-day trial"
					})]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/landing/sections/Faq.jsx
function Faq() {
	return /* @__PURE__ */ jsx("section", {
		className: "sec wrap",
		id: "faq",
		children: /* @__PURE__ */ jsxs("div", {
			className: "faq__grid",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "faq__aside",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "eyebrow",
						children: "FAQ"
					}),
					/* @__PURE__ */ jsx("h2", {
						style: { marginTop: 16 },
						children: "Questions? Answers."
					}),
					/* @__PURE__ */ jsxs("p", { children: [
						"Still stuck? Email ",
						/* @__PURE__ */ jsx("a", {
							href: "mailto:hello@brandbeacon.com",
							children: "hello@brandbeacon.com"
						}),
						" and a human replies same day."
					] })
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "faq__list",
				children: FAQS.map((item) => /* @__PURE__ */ jsxs("details", {
					className: "qa",
					children: [/* @__PURE__ */ jsxs("summary", { children: [item.q, /* @__PURE__ */ jsx("span", {
						className: "qa__c",
						children: /* @__PURE__ */ jsx(Chevron, { className: "h-3 w-3" })
					})] }), /* @__PURE__ */ jsx("p", { children: item.a })]
				}, item.q))
			})]
		})
	});
}
//#endregion
//#region resources/js/landing/sections/FinalCta.jsx
function FinalCta({ onStart }) {
	return /* @__PURE__ */ jsx("section", {
		className: "final",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "final__b",
					children: [/* @__PURE__ */ jsx("i", {}), "Your first search is free"]
				}),
				/* @__PURE__ */ jsx("h2", { children: "See what TikTok is saying about you" }),
				/* @__PURE__ */ jsx("p", { children: "One free search, no card. Most brands get their first surprise within the top ten results." }),
				/* @__PURE__ */ jsxs("div", {
					className: "final__ctas",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "btn btn--ink btn--lg",
						onClick: () => onStart(),
						children: ["Start free", /* @__PURE__ */ jsx(Arrow, { className: "btn__arrow h-[15px] w-[15px]" })]
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "btn btn--ghost btn--lg",
						children: [/* @__PURE__ */ jsx(Play, { className: "h-[15px] w-[15px]" }), "Watch demo · 2 min"]
					})]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "final__n",
					children: "No credit card required · cancel any trial in two clicks"
				})
			]
		})
	});
}
//#endregion
//#region resources/js/landing/sections/Footer.jsx
var COLS = [
	{
		h: "Product",
		links: [
			"Outlier Vault",
			"Competitor Tracking",
			"Creator Shortlists",
			"Virality Alerts",
			"Changelog"
		]
	},
	{
		h: "Company",
		links: [
			"About",
			"Careers",
			"Blog",
			"Press kit",
			"Contact"
		]
	},
	{
		h: "Resources",
		links: [
			"TikTok benchmarks",
			"Category reports",
			"Help center",
			"API docs",
			"Status"
		]
	},
	{
		h: "Legal",
		links: [
			"Terms",
			"Privacy",
			"DPA",
			"Security"
		]
	}
];
function Footer() {
	const [subscribed, setSubscribed] = useState(false);
	return /* @__PURE__ */ jsx("footer", {
		className: "ftr",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "ftr__top",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("a", {
						href: "#top",
						className: "brand",
						children: [/* @__PURE__ */ jsx(Logo, { className: "h-8 w-8" }), /* @__PURE__ */ jsx("span", { children: "Brand Beacon" })]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "ftr__blurb",
						children: "TikTok social intelligence for brands. Find the viral videos moving your category, and the creators behind them."
					}),
					/* @__PURE__ */ jsxs("form", {
						className: "ftr__form",
						onSubmit: (e) => {
							e.preventDefault();
							setSubscribed(true);
						},
						children: [
							/* @__PURE__ */ jsx("label", {
								htmlFor: "nl",
								children: "Weekly viral digest"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "ftr__row",
								children: [/* @__PURE__ */ jsx("input", {
									id: "nl",
									type: "email",
									required: true,
									placeholder: "you@brand.com"
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "btn btn--primary",
									children: subscribed ? "Subscribed" : "Subscribe"
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "ftr__fine",
								children: "One email a week. Unsubscribe anytime."
							})
						]
					})
				] }), /* @__PURE__ */ jsx("div", {
					className: "ftr__cols",
					children: COLS.map((col) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", { children: col.h }), /* @__PURE__ */ jsx("ul", { children: col.links.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
						href: "#top",
						children: link
					}) }, link)) })] }, col.h))
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "ftr__btm",
				children: [/* @__PURE__ */ jsx("p", { children: "© 2026 Brand Beacon. TikTok viral intelligence for brands." }), /* @__PURE__ */ jsxs("nav", { children: [
					/* @__PURE__ */ jsx("a", {
						href: "#top",
						children: "Terms"
					}),
					/* @__PURE__ */ jsx("a", {
						href: "#top",
						children: "Privacy"
					}),
					/* @__PURE__ */ jsx("a", {
						href: "/contact",
						children: "Contact"
					})
				] })]
			})]
		})
	});
}
//#endregion
//#region resources/js/Pages/Landing.jsx
var Landing_exports = /* @__PURE__ */ __exportAll({ default: () => Landing });
function Landing() {
	const { pricingPlans = [] } = usePage().props;
	/**
	* Called with a type + subject from the hero form. The secondary CTAs call it
	* with nothing, which just sends the visitor back to the hero input.
	*/
	const startSearch = (type, subject) => {
		const phrase = String(subject || "").trim();
		if (!type || phrase === "") {
			document.getElementById("search-subject")?.focus();
			return;
		}
		router.get("/search", {
			type,
			q: phrase
		});
	};
	const startTrial = (plan) => window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(plan?.slug ?? "basic")}&trial=1`);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Brand Beacon — TikTok viral intelligence for brands" }), /* @__PURE__ */ jsxs("div", {
		className: "bbh",
		children: [
			/* @__PURE__ */ jsx(Nav, {}),
			/* @__PURE__ */ jsxs("main", { children: [
				/* @__PURE__ */ jsx(Hero, { onStart: startSearch }),
				/* @__PURE__ */ jsx(BrandMarquee, {}),
				/* @__PURE__ */ jsx(Features, {}),
				/* @__PURE__ */ jsx(HowItWorks, { onStart: startSearch }),
				/* @__PURE__ */ jsx(Testimonials, {}),
				/* @__PURE__ */ jsx(Pricing, {
					plans: pricingPlans,
					onStart: startSearch,
					onTrial: startTrial
				}),
				/* @__PURE__ */ jsx(Faq, {}),
				/* @__PURE__ */ jsx(FinalCta, { onStart: startSearch })
			] }),
			/* @__PURE__ */ jsx(Footer, {})
		]
	})] });
}
//#endregion
//#region resources/js/landing/components/useTheme.js
var STORAGE_KEY = "vvf-theme";
function readInitial() {
	if (typeof window === "undefined") return "dark";
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored === "dark" || stored === "light") return stored;
	} catch (e) {}
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function useTheme() {
	const [theme, setTheme] = useState(readInitial);
	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		try {
			window.localStorage.setItem(STORAGE_KEY, theme);
		} catch (e) {}
	}, [theme]);
	return {
		theme,
		toggle: useCallback(() => setTheme((t) => t === "dark" ? "light" : "dark"), []),
		setTheme
	};
}
//#endregion
//#region resources/js/landing/components/Reveal.jsx
/**
* Releases `[data-reveal]` elements as they scroll into view. The hidden state
* lives in CSS, so anything server-rendered still reads fine without JS, and
* prefers-reduced-motion short-circuits the whole thing.
*/
function useReveal() {
	const ref = useRef(null);
	useEffect(() => {
		const root = ref.current;
		if (!root) return void 0;
		const targets = root.querySelectorAll("[data-reveal]");
		if (!targets.length) return void 0;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
			targets.forEach((el) => el.setAttribute("data-reveal", "shown"));
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				entry.target.setAttribute("data-reveal", "shown");
				observer.unobserve(entry.target);
			});
		}, {
			rootMargin: "0px 0px -12% 0px",
			threshold: .08
		});
		targets.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);
	return ref;
}
//#endregion
//#region resources/js/Pages/LandingContact.jsx
var LandingContact_exports = /* @__PURE__ */ __exportAll({ default: () => LandingContact });
function LandingContact({ categories = [], defaults = {} }) {
	const { theme, toggle } = useTheme();
	const revealRoot = useReveal();
	const startSearch = (type, subject) => {
		const phrase = String(subject || "").trim();
		if (!type || phrase === "") {
			window.location.assign("/#search-subject");
			return;
		}
		router.get("/search", {
			type,
			q: phrase
		});
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Contact Us - Outlier Vault" }), /* @__PURE__ */ jsxs("div", {
		ref: revealRoot,
		className: "vvf-landing min-h-screen font-body",
		children: [
			/* @__PURE__ */ jsx(Nav, {
				theme,
				onToggleTheme: toggle,
				onStart: startSearch
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 lg:py-16",
				children: [/* @__PURE__ */ jsxs("div", {
					"aria-hidden": true,
					className: "pointer-events-none absolute inset-0 overflow-hidden",
					children: [/* @__PURE__ */ jsx("div", { className: "bg-grid mask-radial-fade absolute inset-0" }), /* @__PURE__ */ jsx("div", { className: "absolute top-[-8%] left-1/2 h-[340px] w-[760px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/12 blur-[140px] dark:bg-accent/18" })]
				}), /* @__PURE__ */ jsx("div", {
					className: "relative mx-auto max-w-5xl",
					children: /* @__PURE__ */ jsx(ContactFormCard, {
						categories,
						defaults
					})
				})]
			}),
			/* @__PURE__ */ jsx(Footer, {})
		]
	})] });
}
//#endregion
//#region resources/js/Pages/Settings/SettingsShell.jsx
var SettingsShell_exports = /* @__PURE__ */ __exportAll({ default: () => SettingsShell });
var NAV = [
	{
		key: "account",
		label: "Account",
		href: "/settings/account",
		icon: User
	},
	{
		key: "appearance",
		label: "Appearance",
		href: "/settings/appearance",
		icon: Sun
	},
	{
		key: "subscription",
		label: "Subscription",
		href: "/settings/subscription",
		icon: Store
	},
	{
		key: "plans",
		label: "Plans",
		href: "/plans",
		icon: Spark
	}
];
/**
* The settings shell — the mockup's `.st` two-column layout (account card +
* nav on the left, section content on the right) under the app shell.
*/
function SettingsShell({ section, children }) {
	const { auth = {} } = usePage().props;
	const initial = (auth.user?.name ?? auth.user?.email ?? "A").slice(0, 1).toUpperCase();
	return /* @__PURE__ */ jsx(AppLayout, {
		width: "max-w-[1240px]",
		title: "Settings",
		subtitle: "Manage your account, preferences and billing.",
		children: /* @__PURE__ */ jsxs("div", {
			className: "st",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "st__u",
				children: [/* @__PURE__ */ jsx("span", {
					className: "avat",
					children: initial
				}), /* @__PURE__ */ jsxs("span", {
					style: {
						minWidth: 0,
						display: "block",
						overflow: "hidden"
					},
					children: [/* @__PURE__ */ jsx("span", {
						className: "acct__n",
						style: { fontSize: ".88rem" },
						children: auth.user?.name ?? "Account"
					}), /* @__PURE__ */ jsx("span", {
						className: "acct__e",
						children: auth.user?.email ?? "No email found"
					})]
				})]
			}), /* @__PURE__ */ jsx("nav", {
				className: "st__nav",
				children: NAV.map((item) => {
					const Icon = item.icon;
					return /* @__PURE__ */ jsxs(Link, {
						href: item.href,
						className: `st__i${item.key === section ? " is-on" : ""}`,
						children: [/* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }), item.label]
					}, item.key);
				})
			})] }), /* @__PURE__ */ jsx("div", { children })]
		})
	});
}
//#endregion
//#region resources/js/Pages/Plans.jsx
var Plans_exports = /* @__PURE__ */ __exportAll({ default: () => Plans });
function Plans() {
	const { billing: billingState = {}, pricingPlans = [] } = usePage().props;
	const current = String(billingState.currentPlan ?? "free").toLowerCase();
	const upgrade = (slug) => billing.checkout(slug);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Plans · Brand Beacon" }), /* @__PURE__ */ jsxs(SettingsShell, {
		section: "plans",
		children: [/* @__PURE__ */ jsxs("div", {
			style: { marginBottom: 18 },
			children: [/* @__PURE__ */ jsx("h2", { children: "Plans" }), /* @__PURE__ */ jsx("p", {
				className: "muted",
				style: {
					fontSize: ".86rem",
					marginTop: 6
				},
				children: "Start with one free search. Upgrade when you want tracking on a schedule."
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "plans",
			children: pricingPlans.map((plan) => {
				const isCurrent = plan.slug === current;
				const isFree = plan.slug === "free";
				return /* @__PURE__ */ jsxs("div", {
					className: `plan${isCurrent ? " plan--on" : ""}`,
					children: [
						isCurrent && /* @__PURE__ */ jsx("span", {
							className: "plan__tag",
							children: "Current plan"
						}),
						/* @__PURE__ */ jsx("div", {
							className: "plan__n",
							children: plan.name
						}),
						/* @__PURE__ */ jsx("p", {
							className: "plan__t",
							children: plan.tagline
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "plan__p",
							children: [
								"$",
								plan.price,
								/* @__PURE__ */ jsx("span", { children: "/mo" })
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "plan__s",
							children: isCurrent ? "Your current plan" : plan.price > 0 ? "Billed monthly" : ""
						}),
						/* @__PURE__ */ jsx("ul", { children: plan.features.map((feature) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }), feature] }, feature)) }),
						isCurrent ? /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g btn--w",
							disabled: true,
							children: "Current plan"
						}) : isFree ? /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g btn--w",
							disabled: true,
							children: "Free plan unavailable"
						}) : /* @__PURE__ */ jsxs("button", {
							type: "button",
							className: "btn btn--y btn--w",
							onClick: () => upgrade(plan.slug),
							children: [
								"Upgrade to ",
								plan.name,
								" ",
								/* @__PURE__ */ jsx(Arrow, {})
							]
						})
					]
				}, plan.slug);
			})
		})]
	})] });
}
//#endregion
//#region resources/js/Pages/Products.jsx
var Products_exports = /* @__PURE__ */ __exportAll({ default: () => Products });
function Products({ searches = [], moving = [], suggestions = [] }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Product searches · Brand Beacon" }), /* @__PURE__ */ jsx(SearchListScreen, {
		kind: "product",
		searches,
		moving,
		suggestions
	})] });
}
//#endregion
//#region resources/js/Pages/SavedSearches/Index.jsx
var Index_exports = /* @__PURE__ */ __exportAll({ default: () => Index });
var FILTER_LABELS = {
	"brand-group": "Brand searches",
	brand: "Brand searches",
	competitor: "Competitor searches",
	product: "Product searches"
};
var SORT_OPTIONS = {
	recent_refresh: "Most recent refresh",
	video_count: "Video count",
	az: "Name A-Z",
	za: "Name Z-A"
};
var VIDEO_SORT = {
	score: "Outlier score",
	views: "Views",
	recent: "Most recent"
};
function compareDates(a, b) {
	return (b ? new Date(b).getTime() : 0) - (a ? new Date(a).getTime() : 0);
}
function Sel({ value, onChange, ariaLabel, children }) {
	return /* @__PURE__ */ jsxs("span", {
		className: "sel",
		children: [/* @__PURE__ */ jsx("select", {
			"aria-label": ariaLabel,
			value,
			onChange,
			children
		}), /* @__PURE__ */ jsx(Chevron, {})]
	});
}
function Index({ searches: initialSearches, bookmarkedVideos = [], filterType = null, watchlistedOnly: bookmarkedOnly = true }) {
	const isBrandCategoryView = filterType === "brand-group";
	const showTabs = bookmarkedOnly && !filterType;
	const [searches, setSearches] = useState(initialSearches);
	const [tab, setTab] = useState("searches");
	const [openMenuId, setOpenMenuId] = useState(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchTypeFilter, setSearchTypeFilter] = useState(isBrandCategoryView ? "all" : filterType ?? "all");
	const [sortBy, setSortBy] = useState("recent_refresh");
	const [videoQuery, setVideoQuery] = useState("");
	const [videoSort, setVideoSort] = useState("score");
	const [modalState, setModalState] = useState({
		type: null,
		search: null
	});
	const [formState, setFormState] = useState({
		name: "",
		frequency: "weekly"
	});
	const [submitting, setSubmitting] = useState(false);
	const menuRef = useRef(null);
	const title = filterType ? FILTER_LABELS[filterType] ?? "Library" : "Library";
	const searchHref = `/search?type=${filterType === "competitor" ? "competitor" : "brand"}`;
	useEffect(() => {
		if (openMenuId === null) return void 0;
		const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpenMenuId(null);
		const onEsc = (e) => e.key === "Escape" && setOpenMenuId(null);
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onEsc);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onEsc);
		};
	}, [openMenuId]);
	useEffect(() => {
		if (modalState.type === null) return void 0;
		const onEsc = (e) => e.key === "Escape" && closeModal();
		document.addEventListener("keydown", onEsc);
		return () => document.removeEventListener("keydown", onEsc);
	}, [modalState.type, submitting]);
	const filteredSearches = useMemo(() => {
		const q = query.trim().toLowerCase();
		const next = searches.filter((s) => {
			const matchesQuery = q === "" || s.name?.toLowerCase().includes(q) || s.keywords?.some((k) => k.toLowerCase().includes(q));
			const matchesStatus = statusFilter === "all" || s.status === statusFilter;
			const matchesType = !(bookmarkedOnly || isBrandCategoryView) || searchTypeFilter === "all" || s.search_type === searchTypeFilter;
			return matchesQuery && matchesStatus && matchesType;
		});
		next.sort((l, r) => {
			switch (sortBy) {
				case "video_count": return (r.result_count ?? 0) - (l.result_count ?? 0);
				case "az": return (l.name ?? "").localeCompare(r.name ?? "");
				case "za": return (r.name ?? "").localeCompare(l.name ?? "");
				default: return compareDates(l.last_run_at, r.last_run_at);
			}
		});
		return next;
	}, [
		bookmarkedOnly,
		isBrandCategoryView,
		query,
		searches,
		searchTypeFilter,
		sortBy,
		statusFilter
	]);
	const filteredVideos = useMemo(() => {
		const q = videoQuery.trim().toLowerCase();
		const next = bookmarkedVideos.filter((v) => q === "" || v.handle?.toLowerCase().includes(q) || v.title?.toLowerCase().includes(q));
		next.sort((l, r) => {
			switch (videoSort) {
				case "views": return (r.views ?? 0) - (l.views ?? 0);
				case "recent": return compareDates(l.uploaded_at, r.uploaded_at);
				default: return (r.virality_score ?? 0) - (l.virality_score ?? 0);
			}
		});
		return next;
	}, [
		bookmarkedVideos,
		videoQuery,
		videoSort
	]);
	const openModal = (type, search) => {
		setOpenMenuId(null);
		setModalState({
			type,
			search
		});
		if (type === "edit") setFormState({
			name: search.name ?? "",
			frequency: search.frequency ?? "weekly"
		});
	};
	const closeModal = () => {
		if (submitting) return;
		setModalState({
			type: null,
			search: null
		});
	};
	const patchSearch = (id, patch) => setSearches((c) => c.map((s) => s.id === id ? {
		...s,
		...patch
	} : s));
	const removeSearch = (id) => setSearches((c) => c.filter((s) => s.id !== id));
	const toggleBookmark = async (event, search) => {
		event.preventDefault();
		event.stopPropagation();
		try {
			const payload = await savedSearch.bookmark(search.id, !search.is_watchlisted);
			setSearches((c) => c.map((s) => s.id === search.id ? {
				...s,
				...payload.search
			} : s).filter((s) => bookmarkedOnly ? s.is_watchlisted : true));
		} catch {}
	};
	const submitEdit = async () => {
		if (!modalState.search) return;
		setSubmitting(true);
		try {
			const { search: updated } = await savedSearch.update(modalState.search.id, {
				name: formState.name.trim(),
				frequency: formState.frequency
			});
			patchSearch(modalState.search.id, updated);
			closeModal();
		} finally {
			setSubmitting(false);
		}
	};
	const confirmPause = async () => {
		if (!modalState.search) return;
		setSubmitting(true);
		try {
			const { search: updated } = await savedSearch.pause(modalState.search.id);
			patchSearch(modalState.search.id, updated);
			closeModal();
		} finally {
			setSubmitting(false);
		}
	};
	const confirmDelete = async () => {
		if (!modalState.search) return;
		setSubmitting(true);
		try {
			await savedSearch.destroy(modalState.search.id);
			removeSearch(modalState.search.id);
			closeModal();
		} finally {
			setSubmitting(false);
		}
	};
	const rowActions = (s) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("button", {
		type: "button",
		className: `row__x${s.is_watchlisted ? " is-on" : ""}`,
		onClick: (e) => toggleBookmark(e, s),
		title: s.is_watchlisted ? "Remove bookmark" : "Add bookmark",
		children: /* @__PURE__ */ jsx(Bookmark, {
			className: "h-4 w-4",
			filled: Boolean(s.is_watchlisted)
		})
	}), /* @__PURE__ */ jsxs("span", {
		className: "row__menu",
		ref: openMenuId === s.id ? menuRef : null,
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			className: "row__x",
			title: "More",
			onClick: (e) => {
				e.preventDefault();
				e.stopPropagation();
				setOpenMenuId((c) => c === s.id ? null : s.id);
			},
			children: /* @__PURE__ */ jsx(Dots, { className: "h-4 w-4" })
		}), openMenuId === s.id && /* @__PURE__ */ jsxs("div", {
			className: "menu",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => openModal("edit", s),
					children: "Edit keyword details"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => openModal("pause", s),
					disabled: s.status === "paused",
					children: "Pause search"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "danger",
					onClick: () => openModal("delete", s),
					children: "Delete search"
				})
			]
		})]
	})] });
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${title} · Brand Beacon` }),
		/* @__PURE__ */ jsxs(AppLayout, {
			width: "max-w-[1240px]",
			title,
			subtitle: "Everything you have saved — tracked searches and the individual videos you kept.",
			actions: /* @__PURE__ */ jsx(EntitlementsBar, {}),
			children: [showTabs && /* @__PURE__ */ jsxs("div", {
				className: "tabs",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					className: `tab${tab === "searches" ? " is-on" : ""}`,
					onClick: () => setTab("searches"),
					children: [
						/* @__PURE__ */ jsx(Bookmark, { className: "h-[15px] w-[15px]" }),
						" Bookmarked searches ",
						/* @__PURE__ */ jsx("span", {
							className: "tab__c",
							children: searches.length
						})
					]
				}), /* @__PURE__ */ jsxs("button", {
					type: "button",
					className: `tab${tab === "videos" ? " is-on" : ""}`,
					onClick: () => setTab("videos"),
					children: [
						/* @__PURE__ */ jsx(Play, { className: "h-[15px] w-[15px]" }),
						" Bookmarked videos ",
						/* @__PURE__ */ jsx("span", {
							className: "tab__c",
							children: bookmarkedVideos.length
						})
					]
				})]
			}), tab === "searches" || !showTabs ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
				className: "tools",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "srch",
						children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("input", {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Search your saved searches",
							"aria-label": "Search your saved searches"
						})]
					}),
					/* @__PURE__ */ jsxs(Sel, {
						value: statusFilter,
						onChange: (e) => setStatusFilter(e.target.value),
						ariaLabel: "Status",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "all",
								children: "All statuses"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "done",
								children: "Ready"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "scraping",
								children: "Refreshing"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "paused",
								children: "Paused"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "failed",
								children: "Failed"
							})
						]
					}),
					(bookmarkedOnly || isBrandCategoryView) && /* @__PURE__ */ jsxs(Sel, {
						value: searchTypeFilter,
						onChange: (e) => setSearchTypeFilter(e.target.value),
						ariaLabel: isBrandCategoryView ? "Brand category" : "Search type",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "all",
								children: isBrandCategoryView ? "All categories" : "All types"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "brand",
								children: isBrandCategoryView ? "Own" : "Brand searches"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "competitor",
								children: "Competitor searches"
							}),
							!isBrandCategoryView && /* @__PURE__ */ jsx("option", {
								value: "product",
								children: "Product searches"
							})
						]
					}),
					/* @__PURE__ */ jsx(Sel, {
						value: sortBy,
						onChange: (e) => setSortBy(e.target.value),
						ariaLabel: "Sort by",
						children: Object.entries(SORT_OPTIONS).map(([value, label]) => /* @__PURE__ */ jsx("option", {
							value,
							children: label
						}, value))
					}),
					/* @__PURE__ */ jsxs(Link, {
						href: searchHref,
						className: "btn btn--y btn--sm",
						children: [/* @__PURE__ */ jsx(Plus, { className: "h-[15px] w-[15px]" }), " New search"]
					})
				]
			}), filteredSearches.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "empty",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "empty__i",
						children: /* @__PURE__ */ jsx(Search, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ jsx("h2", { children: searches.length === 0 ? "Nothing saved yet" : "No searches matched" }),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							maxWidth: 360,
							margin: "10px auto 0"
						},
						children: searches.length === 0 ? "Run a search, then bookmark it to keep it here." : "Try a different keyword, status, type, or sort combination."
					}),
					/* @__PURE__ */ jsxs(Link, {
						href: searchHref,
						className: "btn btn--y",
						style: { margin: "22px auto 0" },
						children: ["Run a search ", /* @__PURE__ */ jsx(Arrow, {})]
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "rows",
				children: filteredSearches.map((s) => /* @__PURE__ */ jsx(SavedSearchRow, {
					search: s,
					onNavigate: () => router.visit(s.url),
					actions: rowActions(s)
				}, s.id))
			})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
				className: "tools",
				children: [/* @__PURE__ */ jsxs("label", {
					className: "srch",
					children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("input", {
						value: videoQuery,
						onChange: (e) => setVideoQuery(e.target.value),
						placeholder: "Search your bookmarked videos",
						"aria-label": "Search your bookmarked videos"
					})]
				}), /* @__PURE__ */ jsx(Sel, {
					value: videoSort,
					onChange: (e) => setVideoSort(e.target.value),
					ariaLabel: "Sort videos",
					children: Object.entries(VIDEO_SORT).map(([value, label]) => /* @__PURE__ */ jsx("option", {
						value,
						children: label
					}, value))
				})]
			}), filteredVideos.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "empty",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "empty__i",
						children: /* @__PURE__ */ jsx(Play, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ jsx("h2", { children: "No bookmarked videos yet" }),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							maxWidth: 360,
							margin: "10px auto 0"
						},
						children: "Open a search and bookmark the videos worth keeping — they collect here."
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "vgrid",
				children: filteredVideos.map((v) => /* @__PURE__ */ jsx(VideoCard, { video: v }, v.id))
			})] })]
		}),
		modalState.type && modalState.search && /* @__PURE__ */ jsx("div", {
			className: "bb",
			children: /* @__PURE__ */ jsxs("div", {
				className: "bb-modal",
				children: [/* @__PURE__ */ jsx("button", {
					className: "bb-modal__bg",
					"aria-label": "Close",
					onClick: closeModal
				}), /* @__PURE__ */ jsxs("div", {
					className: "bb-modal__box",
					children: [
						modalState.type === "edit" && /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("h2", { children: "Edit keyword details" }),
							/* @__PURE__ */ jsx("p", {
								className: "sub",
								children: "Update the label and refresh schedule. The keyword set is fixed for this search."
							}),
							/* @__PURE__ */ jsxs("div", {
								style: { marginTop: 20 },
								children: [/* @__PURE__ */ jsx("p", {
									className: "sect__n",
									children: "Keyword set"
								}), /* @__PURE__ */ jsx("div", {
									className: "chips",
									children: modalState.search.keywords.map((k) => /* @__PURE__ */ jsx("span", {
										className: "chip",
										children: k
									}, k))
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								style: { marginTop: 20 },
								children: [/* @__PURE__ */ jsx("label", {
									className: "lbl",
									children: "Label"
								}), /* @__PURE__ */ jsx("input", {
									className: "fld",
									value: formState.name,
									onChange: (e) => setFormState((c) => ({
										...c,
										name: e.target.value
									}))
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								style: { marginTop: 20 },
								children: [/* @__PURE__ */ jsx("label", {
									className: "lbl",
									children: "Schedule"
								}), /* @__PURE__ */ jsx("div", {
									style: {
										display: "flex",
										gap: 8
									},
									children: ["weekly", "monthly"].map((f) => /* @__PURE__ */ jsx("button", {
										type: "button",
										className: `btn ${formState.frequency === f ? "btn--y" : "btn--g"} btn--w`,
										onClick: () => setFormState((c) => ({
											...c,
											frequency: f
										})),
										children: f === "weekly" ? "Weekly" : "Monthly"
									}, f))
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "actrow__r",
								style: {
									marginTop: 24,
									justifyContent: "flex-end"
								},
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--g",
									onClick: closeModal,
									disabled: submitting,
									children: "Cancel"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--y",
									onClick: submitEdit,
									disabled: submitting,
									children: submitting ? "Saving…" : "Save changes"
								})]
							})
						] }),
						modalState.type === "pause" && /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("h2", { children: "Pause search" }),
							/* @__PURE__ */ jsx("p", {
								className: "sub",
								children: "Keeps the record and its results, but stops future refreshes until you resume it."
							}),
							/* @__PURE__ */ jsx("p", {
								style: {
									marginTop: 16,
									fontWeight: 700,
									color: "var(--ink)"
								},
								children: modalState.search.name
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "actrow__r",
								style: {
									marginTop: 24,
									justifyContent: "flex-end"
								},
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--g",
									onClick: closeModal,
									disabled: submitting,
									children: "Cancel"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--y",
									onClick: confirmPause,
									disabled: submitting,
									children: submitting ? "Pausing…" : "Pause search"
								})]
							})
						] }),
						modalState.type === "delete" && /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("h2", {
								style: { color: "var(--warn)" },
								children: "Delete search"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "sub",
								children: "Removes the saved keyword record and stops future runs. The underlying video records are kept."
							}),
							/* @__PURE__ */ jsx("p", {
								style: {
									marginTop: 16,
									fontWeight: 700,
									color: "var(--ink)"
								},
								children: modalState.search.name
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "actrow__r",
								style: {
									marginTop: 24,
									justifyContent: "flex-end"
								},
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--g",
									onClick: closeModal,
									disabled: submitting,
									children: "Cancel"
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--g",
									style: {
										color: "var(--warn)",
										borderColor: "#F0D6C8"
									},
									onClick: confirmDelete,
									disabled: submitting,
									children: submitting ? "Deleting…" : "Delete search"
								})]
							})
						] })
					]
				})]
			})
		})
	] });
}
//#endregion
//#region resources/js/landing/flow/format.js
/** 4_200_000 → "4.2M". Keeps one decimal only when it adds information. */
function compactNumber$1(value) {
	const n = Number(value) || 0;
	if (n >= 1e9) return trim(n / 1e9) + "B";
	if (n >= 1e6) return trim(n / 1e6) + "M";
	if (n >= 1e3) return trim(n / 1e3) + "K";
	return String(Math.round(n));
}
function trim(value) {
	return value >= 100 ? String(Math.round(value)) : String(Math.round(value * 10) / 10).replace(/\.0$/, "");
}
/** ISO date → "6 days ago" */
function relativeTime(iso) {
	if (!iso) return "";
	const then = new Date(iso).getTime();
	if (Number.isNaN(then)) return "";
	const seconds = Math.max(0, (Date.now() - then) / 1e3);
	for (const [unit, size] of [
		["year", 31536e3],
		["month", 2592e3],
		["week", 604800],
		["day", 86400],
		["hour", 3600],
		["minute", 60]
	]) {
		const amount = Math.floor(seconds / size);
		if (amount >= 1) return `${amount} ${unit}${amount === 1 ? "" : "s"} ago`;
	}
	return "just now";
}
/**
* Outlier multiple → "11.4x". This is views over the median of the search the
* video appears in, not the creator's own account baseline — label it as such
* wherever it renders.
*/
function outlierLabel(value) {
	const n = Number(value);
	if (!Number.isFinite(n) || n <= 0) return null;
	return `${n >= 10 ? Math.round(n) : Math.round(n * 10) / 10}x`;
}
/** 8.24 → "8.2%". Returns null for missing rates so the UI can show a dash. */
function percent(value, digits = 1) {
	const n = Number(value);
	if (!Number.isFinite(n)) return null;
	return `${n.toFixed(digits)}%`;
}
//#endregion
//#region resources/js/Pages/SavedSearches/detail/OutlierVideos.jsx
var OutlierVideos_exports = /* @__PURE__ */ __exportAll({
	OutlierCard: () => OutlierCard,
	WinnerVideo: () => WinnerVideo
});
var GRADIENTS = [
	"linear-gradient(150deg,#ffd27a,#ff9a5a 55%,#c0607a)",
	"linear-gradient(150deg,#ffe08a,#f0a24a 55%,#b5654a)",
	"linear-gradient(150deg,#ffcf7a,#e88f5a 55%,#a8607a)",
	"linear-gradient(150deg,#ffdd9a,#f5a05a 55%,#c07a5a)",
	"linear-gradient(150deg,#ffd06a,#ee954a 55%,#b06a5a)",
	"linear-gradient(150deg,#ffe4a6,#f2ab63 55%,#bd7059)"
];
function gradientStyle(video) {
	const key = String(video?.video_id ?? video?.id ?? "");
	let hash = 0;
	for (let i = 0; i < key.length; i++) hash = hash * 31 + key.charCodeAt(i) >>> 0;
	return GRADIENTS[hash % GRADIENTS.length];
}
function formatDuration$1(duration) {
	if (duration == null || duration === "") return null;
	if (typeof duration === "string") return duration;
	const total = Number(duration);
	if (!Number.isFinite(total)) return null;
	return `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`;
}
/** Tags shown under the winner — the inferred creative signals, as chips. */
function creativeTags(video) {
	return [
		video.content_format,
		video.sound_label,
		video.content_hook ? `hook: ${video.content_hook}` : null,
		video.content_angle
	].filter(Boolean);
}
var PlayIcon = ({ w = 14, h = 16 }) => /* @__PURE__ */ jsx("svg", {
	width: w,
	height: h,
	viewBox: "0 0 14 16",
	fill: "#1B1834",
	"aria-hidden": true,
	children: /* @__PURE__ */ jsx("path", { d: "M0 0l14 8-14 8z" })
});
function embedFor(video) {
	if (video?.embed_url) return video.embed_url;
	const id = video?.video_id;
	return id ? `https://www.tiktok.com/player/v1/${id}?autoplay=1&description=0&rel=0` : null;
}
function playerIdOf(video) {
	return String(video?.id ?? video?.video_id ?? "");
}
function Cover({ video }) {
	const [broken, setBroken] = useState(false);
	const src = video?.thumbnail_url;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
		className: "grad",
		style: { background: gradientStyle(video) }
	}), src && !broken && /* @__PURE__ */ jsx("img", {
		className: "cov",
		src,
		alt: "",
		loading: "lazy",
		referrerPolicy: "no-referrer",
		onError: () => setBroken(true)
	})] });
}
function Avatar({ video, className }) {
	const [broken, setBroken] = useState(false);
	if (!video?.avatar || broken) return /* @__PURE__ */ jsx("span", {
		className,
		style: { background: gradientStyle(video) }
	});
	return /* @__PURE__ */ jsx("img", {
		className,
		src: video.avatar,
		alt: "",
		referrerPolicy: "no-referrer",
		onError: () => setBroken(true)
	});
}
/**
* The play button that swaps the cover for the TikTok embed in place. Uses the
* signed `embed_url` (or a player URL built from the id); the raw `video_url`
* 403s from a browser origin, so it is never used here.
*/
function InlinePlayer({ video, className, buttonClassName = "play", iconProps = {}, activePlayerId, onPlay, onClose }) {
	const embed = embedFor(video);
	const playerId = playerIdOf(video);
	if (playerId !== "" && activePlayerId === playerId && embed) return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("iframe", {
		src: embed,
		title: video?.title || "TikTok video",
		loading: "lazy",
		allow: "autoplay; fullscreen; encrypted-media; picture-in-picture",
		allowFullScreen: true,
		className: `${className} tracker-embed-frame`
	}), /* @__PURE__ */ jsx("button", {
		type: "button",
		onClick: () => onClose?.(),
		"aria-label": "Close player",
		className: "absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80",
		children: /* @__PURE__ */ jsx("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2.5",
			strokeLinecap: "round",
			children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
		})
	})] });
	if (!embed) return /* @__PURE__ */ jsx("div", {
		className: buttonClassName,
		"aria-hidden": true,
		children: /* @__PURE__ */ jsx(PlayIcon, { ...iconProps })
	});
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		onClick: () => onPlay?.(playerId),
		"aria-label": video?.title ? `Play: ${video.title}` : "Play video",
		className: buttonClassName,
		children: /* @__PURE__ */ jsx(PlayIcon, { ...iconProps })
	});
}
function AnalyzeButton({ status = "idle", small = false, onClick }) {
	const isProcessing = status === "processing";
	const label = isProcessing ? "Analyzing Video....." : status === "complete" ? "View Analysis" : "Analyze video";
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		className: `bb-analyze${small ? " bb-analyze--sm" : ""}${isProcessing ? " opacity-90" : ""}`,
		onClick,
		"aria-busy": isProcessing,
		children: isProcessing ? /* @__PURE__ */ jsxs("span", {
			className: "inline-flex items-center gap-2",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "relative flex h-3.5 w-3.5 items-center justify-center",
				children: [/* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-3.5 w-3.5 animate-ping rounded-full bg-current/35" }), /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-2.5 w-2.5 rounded-full bg-current" })]
			}), label]
		}) : /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx(Search, { className: small ? "h-[13px] w-[13px]" : "h-[15px] w-[15px]" }),
			" ",
			label
		] })
	});
}
function WinnerVideo({ video, onToggleBookmark, onAnalyze, bookmarking = false, activePlayerId = null, onPlay = null, onClose = null, analysisStatus = "idle" }) {
	if (!video) return null;
	const playing = activePlayerId === playerIdOf(video);
	const rate = percent(video.engagement_rate);
	const duration = formatDuration$1(video.duration);
	const tags = creativeTags(video);
	const hasCreative = video.content_format || video.content_hook || video.content_angle;
	return /* @__PURE__ */ jsxs("div", {
		className: "winner",
		children: [/* @__PURE__ */ jsxs("div", {
			className: `vid${playing ? " playing" : ""}`,
			children: [
				/* @__PURE__ */ jsx(Cover, { video }),
				/* @__PURE__ */ jsx("span", {
					className: "flag",
					children: "★ winner"
				}),
				/* @__PURE__ */ jsx("span", {
					className: "ovscrim",
					"aria-hidden": true
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ovstats",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "ovchip ovchip--score",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "lab",
							children: [/* @__PURE__ */ jsx("i", {}), "Outlier score"]
						}), /* @__PURE__ */ jsx("span", {
							className: "num",
							children: outlierLabel(video.outlier_multiple) ?? "—"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "ovchip ovchip--views",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "lab",
							children: [/* @__PURE__ */ jsx("i", {}), "Views"]
						}), /* @__PURE__ */ jsx("span", {
							className: "num",
							children: compactNumber$1(video.views)
						})]
					})]
				}),
				/* @__PURE__ */ jsx(InlinePlayer, {
					video,
					className: "absolute inset-0 h-full w-full border-0",
					iconProps: {
						w: 16,
						h: 18
					},
					activePlayerId,
					onPlay,
					onClose
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "detail",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "creator",
					children: [
						/* @__PURE__ */ jsx(Avatar, {
							video,
							className: "av"
						}),
						/* @__PURE__ */ jsxs("div", {
							style: { minWidth: 0 },
							children: [/* @__PURE__ */ jsx("div", {
								className: "cn",
								children: video.handle ?? video.creator_name
							}), /* @__PURE__ */ jsxs("div", {
								className: "cs",
								children: [video.uploaded_at ? relativeTime(video.uploaded_at) : "date unknown", " · TikTok"]
							})]
						}),
						duration && /* @__PURE__ */ jsx("span", {
							className: "durbadge",
							children: duration
						})
					]
				}),
				video.title && /* @__PURE__ */ jsx("h3", {
					style: { marginTop: "12px" },
					children: video.title
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "engrow",
					children: [
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Heart, {}),
							" ",
							compactNumber$1(video.likes)
						] }),
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Comment, {}),
							" ",
							compactNumber$1(video.comments)
						] }),
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Share, {}),
							" ",
							compactNumber$1(video.shares)
						] }),
						rate && /* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Trend, {}),
							" ",
							rate,
							" eng"
						] })
					]
				}),
				tags.length > 0 && /* @__PURE__ */ jsx("div", {
					className: "tagrow",
					children: tags.map((tag) => /* @__PURE__ */ jsx("span", {
						className: "tag",
						children: tag
					}, tag))
				}),
				hasCreative && /* @__PURE__ */ jsx("p", {
					className: "provnote",
					style: { marginTop: "10px" },
					children: "Format, hook and angle are inferred from the caption, not the footage."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "cta",
					children: [
						/* @__PURE__ */ jsx(AnalyzeButton, {
							status: analysisStatus,
							onClick: () => onAnalyze?.(video, analysisStatus)
						}),
						video.post_url && /* @__PURE__ */ jsx("a", {
							href: video.post_url,
							target: "_blank",
							rel: "noreferrer noopener",
							className: "tbtn",
							children: "open in TikTok ↗"
						}),
						onToggleBookmark && /* @__PURE__ */ jsx("button", {
							type: "button",
							className: `tbtn tbtn-ic${video.bookmarked ? " is-saved" : ""}`,
							onClick: () => onToggleBookmark(video),
							disabled: bookmarking,
							title: video.bookmarked ? "Saved to board" : "Save to board",
							"aria-label": video.bookmarked ? "Saved to board" : "Save to board",
							children: /* @__PURE__ */ jsx(Bookmark, {
								className: "h-4 w-4",
								filled: Boolean(video.bookmarked)
							})
						})
					]
				})
			]
		})]
	});
}
function OutlierCard({ video, rank, onToggleBookmark, onAnalyze, bookmarking = false, activePlayerId = null, onPlay = null, onClose = null, analysisStatus = "idle" }) {
	const rate = percent(video.engagement_rate);
	const duration = formatDuration$1(video.duration);
	return /* @__PURE__ */ jsxs("article", {
		className: "bbcard",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "bbthumb",
			children: [
				/* @__PURE__ */ jsx(Cover, { video }),
				rank != null && /* @__PURE__ */ jsx("span", {
					className: "bbrank",
					children: String(rank).padStart(2, "0")
				}),
				/* @__PURE__ */ jsx(InlinePlayer, {
					video,
					className: "absolute inset-0 z-10 h-full w-full border-0",
					activePlayerId,
					onPlay,
					onClose
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "bbbody",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "bbstats",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "bbchip bbchip--score",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "lab",
							children: [/* @__PURE__ */ jsx("i", {}), "Outlier score"]
						}), /* @__PURE__ */ jsx("span", {
							className: "num",
							children: outlierLabel(video.outlier_multiple) ?? "—"
						})]
					}), /* @__PURE__ */ jsxs("div", {
						className: "bbchip bbchip--views",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "lab",
							children: [/* @__PURE__ */ jsx("i", {}), "Views"]
						}), /* @__PURE__ */ jsx("span", {
							className: "num",
							children: compactNumber$1(video.views)
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bbwho",
					children: [
						/* @__PURE__ */ jsx(Avatar, {
							video,
							className: "av"
						}),
						/* @__PURE__ */ jsxs("div", {
							style: { minWidth: 0 },
							children: [/* @__PURE__ */ jsx("div", {
								className: "h2n",
								children: video.handle ?? video.creator_name
							}), /* @__PURE__ */ jsx("div", {
								className: "sub",
								children: video.uploaded_at ? relativeTime(video.uploaded_at) : "date unknown"
							})]
						}),
						video.post_url && /* @__PURE__ */ jsx("a", {
							href: video.post_url,
							target: "_blank",
							rel: "noreferrer noopener",
							className: "bbopen",
							title: "Open in TikTok",
							"aria-label": "Open in TikTok",
							children: /* @__PURE__ */ jsx(Arrow, {})
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bbcap",
					children: [/* @__PURE__ */ jsx("p", { children: video.title || video.content_hook }), duration && /* @__PURE__ */ jsx("span", {
						className: "bbdur",
						children: duration
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bbeng",
					children: [
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Heart, {}),
							" ",
							compactNumber$1(video.likes)
						] }),
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Comment, {}),
							" ",
							compactNumber$1(video.comments)
						] }),
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Share, {}),
							" ",
							compactNumber$1(video.shares)
						] }),
						rate && /* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Trend, {}),
							" ",
							rate
						] })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "bbact",
					children: [/* @__PURE__ */ jsx(AnalyzeButton, {
						small: true,
						status: analysisStatus,
						onClick: () => onAnalyze?.(video, analysisStatus)
					}), onToggleBookmark && /* @__PURE__ */ jsx("button", {
						type: "button",
						className: `tbtn tbtn-ic${video.bookmarked ? " is-saved" : ""}`,
						onClick: () => onToggleBookmark(video),
						disabled: bookmarking,
						title: video.bookmarked ? "Saved to board" : "Save to board",
						"aria-label": video.bookmarked ? "Saved to board" : "Save to board",
						children: /* @__PURE__ */ jsx(Bookmark, {
							className: "h-3.5 w-3.5",
							filled: Boolean(video.bookmarked)
						})
					})]
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/VideoAnalysis/AnalysisModal.jsx
var AnalysisModal_exports = /* @__PURE__ */ __exportAll({ default: () => AnalysisModal });
function compactNumber(value) {
	const number = Number(value || 0);
	if (!Number.isFinite(number)) return "0";
	return new Intl.NumberFormat(void 0, {
		notation: "compact",
		maximumFractionDigits: 1
	}).format(number);
}
function formatMetric(value) {
	const number = Number(value || 0);
	if (!Number.isFinite(number)) return "0";
	return new Intl.NumberFormat(void 0, { maximumFractionDigits: number >= 100 ? 0 : 1 }).format(number);
}
function formatTimestamp(ms) {
	if (!Number.isFinite(Number(ms))) return null;
	const total = Math.max(0, Math.floor(Number(ms) / 1e3));
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
function formatDuration(seconds) {
	const total = Number(seconds || 0);
	if (!Number.isFinite(total) || total <= 0) return "0:14";
	return `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`;
}
function usePolling(videoId, initial, open) {
	const [analysis, setAnalysis] = useState(initial);
	useEffect(() => {
		setAnalysis(initial);
	}, [initial, videoId]);
	useEffect(() => {
		if (!open || analysis?.status === "complete" || analysis?.status === "failed") return void 0;
		let cancelled = false;
		const timer = window.setInterval(async () => {
			try {
				const payload = await videoAnalysis.get(videoId);
				if (!cancelled) setAnalysis(payload.analysis);
			} catch {}
		}, 3e3);
		return () => {
			cancelled = true;
			window.clearInterval(timer);
		};
	}, [
		analysis?.status,
		open,
		videoId
	]);
	return [analysis, setAnalysis];
}
var STAT_CHIP = {
	score: "border-[#d8c9a6] bg-[#FFF3CF]",
	views: "border-[#e0c5b6] bg-[#FEF0E7]",
	mut: "border-[#E7E5DF] bg-[#FAF9F6]"
};
var STAT_LABEL = {
	score: "text-[#9A6B00]",
	views: "text-[#C2410C]",
	mut: "text-[#5C5A54]"
};
function statCards(video) {
	return [
		{
			label: "Outlier",
			value: `${formatMetric(video.virality_score || 18)}x`,
			variant: "score"
		},
		{
			label: "Views",
			value: compactNumber(video.views),
			variant: "views"
		},
		{
			label: "Eng rate",
			value: video.engagement_rate ? `${formatMetric(video.engagement_rate)}%` : "12.2%",
			variant: "mut"
		},
		{
			label: "Shares",
			value: compactNumber(video.shares),
			variant: "mut"
		}
	];
}
function transcriptRows(analysis) {
	const segments = Array.isArray(analysis?.transcript_segments) ? analysis.transcript_segments : [];
	if (segments.length > 0) return segments.map((segment, index) => ({
		id: `segment-${index}`,
		time: formatTimestamp(segment.start_ms) ?? "0:00",
		text: segment.text
	}));
	const transcript = String(analysis?.transcript || "").trim();
	if (transcript === "") return [];
	return transcript.split("\n").map((line) => line.trim()).filter(Boolean).map((line, index) => ({
		id: `line-${index}`,
		time: formatTimestamp(index * 3e3) ?? "0:00",
		text: line
	}));
}
function hookVariations(result) {
	if (Array.isArray(result?.hooks) && result.hooks.length > 0) return result.hooks.map((hook, index) => ({
		id: index,
		label: String.fromCharCode(65 + index),
		text: typeof hook === "string" ? hook : hook?.text || hook?.variation || JSON.stringify(hook)
	}));
	return [];
}
function whyDrivers(result) {
	if (Array.isArray(result?.content_breakdown) && result.content_breakdown.length > 0) return result.content_breakdown.map((item, index) => ({
		id: index,
		rank: String(index + 1).padStart(2, "0"),
		title: item?.title || item?.driver || item?.label || "Outlier signal",
		body: item?.explanation || item?.reason || String(item),
		uplift: item?.uplift || item?.delta || item?.impact || null
	}));
	const evidence = String(result?.evidence_summary || "").trim();
	return evidence === "" ? [] : evidence.split(/(?<=\.)\s+/).filter(Boolean).map((line, index) => ({
		id: index,
		rank: String(index + 1).padStart(2, "0"),
		title: `Driver ${index + 1}`,
		body: line,
		uplift: null
	}));
}
function strategistRecommendations(result) {
	const recommendations = result?.creative_strategy?.recommendations;
	if (Array.isArray(recommendations) && recommendations.length > 0) return recommendations.map((item, index) => ({
		id: index,
		rank: String(index + 1).padStart(2, "0"),
		title: typeof item === "string" ? item : item?.title || item?.headline || `Recommendation ${index + 1}`,
		body: typeof item === "string" ? null : item?.text || item?.body || item?.reason || null
	}));
	const summary = result?.creative_strategy?.summary;
	return summary ? [{
		id: 0,
		rank: "01",
		title: String(summary),
		body: null
	}] : [];
}
function blueprintText(result) {
	const blueprint = result?.creative_strategy?.blueprint;
	if (typeof blueprint === "string") return blueprint;
	if (blueprint && typeof blueprint === "object") return Object.entries(blueprint).map(([key, value]) => `${String(key).toUpperCase()} - ${typeof value === "string" ? value : JSON.stringify(value)}`).join("\n");
	const ctas = Array.isArray(result?.ctas) ? result.ctas : [];
	const delivery = Array.isArray(result?.delivery_instructions) ? result.delivery_instructions : [];
	return [...ctas.map((item) => `CTA - ${typeof item === "string" ? item : item?.text || JSON.stringify(item)}`), ...delivery.map((item) => `DELIVERY - ${typeof item === "string" ? item : item?.text || JSON.stringify(item)}`)].join("\n");
}
function blueprintRows(blueprint) {
	return String(blueprint || "").split("\n").map((line) => line.trim()).filter(Boolean).map((line, index) => {
		const matched = line.match(/^([^:-]+)\s*[:|-]\s*(.+)$/);
		if (!matched) return {
			id: `blueprint-${index}`,
			label: null,
			body: line
		};
		return {
			id: `blueprint-${index}`,
			label: matched[1].trim().replace(/_/g, " "),
			body: matched[2].trim()
		};
	});
}
function videoEmbedUrl(video) {
	const id = video?.video_id;
	if (id) return `https://www.tiktok.com/player/v1/${id}?autoplay=1&description=0&rel=0&music_info=0`;
	return video?.embed_url ?? null;
}
function RegenerateButton({ regenerating, disabled, onClick, fullWidth = false }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick,
		disabled,
		className: `${fullWidth ? "flex w-full justify-center" : "inline-flex"} items-center gap-1.5 rounded-full border border-[#e5ddd1] bg-[#fbfaf7] px-3 py-2 text-[11px] font-semibold text-[#8c6b10] transition hover:bg-[#fff0bf] disabled:cursor-not-allowed disabled:opacity-60`,
		children: [/* @__PURE__ */ jsxs("svg", {
			viewBox: "0 0 24 24",
			className: `h-3.5 w-3.5 stroke-current ${regenerating ? "animate-spin" : ""}`,
			fill: "none",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: [/* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-2.64-6.36" }), /* @__PURE__ */ jsx("path", { d: "M21 3v6h-6" })]
		}), regenerating ? "Regenerating…" : "Regenerate"]
	});
}
function LeftSidebar({ video, canRegenerate = false, regenerating = false, disabledRegenerate = false, onRegenerate }) {
	const metrics = statCards(video);
	const [playing, setPlaying] = useState(false);
	const [thumbBroken, setThumbBroken] = useState(false);
	const embed = videoEmbedUrl(video);
	const hasThumb = Boolean(video.thumbnail_url) && !thumbBroken;
	const postedAt = video?.uploaded_at ? new Date(video.uploaded_at).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric"
	}) : null;
	return /* @__PURE__ */ jsxs("aside", {
		className: "self-start rounded-[18px] border border-[#E7E5DF] bg-white p-[13px] min-[980px]:sticky min-[980px]:top-0",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto w-full max-w-[260px] overflow-hidden rounded-[13px] bg-[#FAF9F6] min-[980px]:max-w-none",
				children: playing && embed ? /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [/* @__PURE__ */ jsx("iframe", {
						src: embed,
						title: video?.title || "TikTok video",
						loading: "lazy",
						allow: "autoplay; fullscreen; encrypted-media; picture-in-picture",
						allowFullScreen: true,
						className: "aspect-[9/13] w-full border-0"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setPlaying(false),
						"aria-label": "Close player",
						className: "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80",
						children: /* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							className: "h-3.5 w-3.5",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2.5",
							strokeLinecap: "round",
							children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
						})
					})]
				}) : /* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [hasThumb ? /* @__PURE__ */ jsx("img", {
						src: video.thumbnail_url,
						alt: "",
						referrerPolicy: "no-referrer",
						onError: () => setThumbBroken(true),
						className: "aspect-[9/13] w-full object-cover"
					}) : /* @__PURE__ */ jsx("div", { className: "aspect-[9/13] w-full bg-[linear-gradient(165deg,#cfb396,#a98069)]" }), embed && /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setPlaying(true),
						className: "absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-[#343434] shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition hover:bg-white",
						"aria-label": video?.title ? `Play: ${video.title}` : "Play video",
						children: /* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							className: "ml-0.5 h-4 w-4 fill-current",
							children: /* @__PURE__ */ jsx("path", { d: "M8 6.5v11l9-5.5-9-5.5z" })
						})
					})]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-3 flex items-center gap-[9px]",
				children: [/* @__PURE__ */ jsx("span", { className: "h-[30px] w-[30px] flex-shrink-0 rounded-full bg-[linear-gradient(150deg,#ffd27a,#ff9a5a_55%,#c0607a)]" }), /* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("div", {
						className: "truncate text-[13px] font-bold text-[#0B0B0B]",
						children: video.handle ?? video.creator_name ?? "@creator"
					}), /* @__PURE__ */ jsxs("div", {
						className: "text-[11.5px] text-[#5C5A54]",
						children: [compactNumber(video.followers ?? video.views), " followers"]
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-[11px] flex flex-wrap items-center gap-2 text-[11.5px] text-[#5C5A54]",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "rounded-[7px] bg-[#FFF3CF] px-[9px] py-1 text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#9A6B00]",
						children: "Skincare & Beauty"
					}),
					postedAt && /* @__PURE__ */ jsx("span", { children: postedAt }),
					/* @__PURE__ */ jsx("span", { children: formatDuration(video.duration) })
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: metrics.map((item) => /* @__PURE__ */ jsxs("div", {
					className: `rounded-[11px] border px-[11px] py-[9px] ${STAT_CHIP[item.variant]}`,
					children: [/* @__PURE__ */ jsxs("span", {
						className: `inline-flex items-center gap-[5px] whitespace-nowrap text-[9px] font-extrabold uppercase tracking-[0.06em] ${STAT_LABEL[item.variant]}`,
						children: [/* @__PURE__ */ jsx("i", { className: "h-[5px] w-[5px] rounded-full bg-current" }), item.label]
					}), /* @__PURE__ */ jsx("span", {
						className: "mt-1 block text-[17px] font-extrabold leading-none tracking-[-0.02em] text-[#0B0B0B] [font-variant-numeric:tabular-nums]",
						children: item.value
					})]
				}, item.label))
			}),
			canRegenerate && /* @__PURE__ */ jsx("div", {
				className: "mt-3",
				children: /* @__PURE__ */ jsx(RegenerateButton, {
					regenerating,
					disabled: disabledRegenerate,
					onClick: onRegenerate,
					fullWidth: true
				})
			})
		]
	});
}
function SummaryCard({ summary }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-[14px] border border-[#ddd6ca] bg-[#fbfaf7] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[13px] font-semibold text-[#1f1f1f]",
			children: "Summary"
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-1 text-[13px] leading-6 text-[#696257]",
			children: summary
		})]
	});
}
function TabRow({ tabs, activeTab, onChange }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex rounded-[14px] border border-[#ddd6ca] bg-[#fbfaf7] p-1",
		children: tabs.map((tab) => /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => onChange(tab.key),
			className: `flex-1 rounded-[10px] px-3 py-2.5 text-[12px] font-semibold transition ${activeTab === tab.key ? "bg-[#ffeeb8] text-[#6c5715]" : "text-[#5f584d] hover:text-[#1f1f1f]"}`,
			children: tab.label
		}, tab.key))
	});
}
function PanelShell({ icon, title, subtitle, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-[16px] border border-[#ddd6ca] bg-[#fffdf9] p-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex h-8 w-8 items-center justify-center rounded-full bg-[#fff0bf] text-[#8c6b10]",
				children: icon
			}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
				className: "text-[20px] font-semibold leading-none text-[#1a1a1a]",
				children: title
			}), subtitle && /* @__PURE__ */ jsx("div", {
				className: "mt-1 text-[11px] text-[#8c8579]",
				children: subtitle
			})] })]
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-4",
			children
		})]
	});
}
function ProcessingState({ status, error }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-[16px] border border-[#ddd6ca] bg-[#fffdf9] p-5",
		children: [/* @__PURE__ */ jsx("div", {
			className: "text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8c6b10]",
			children: status || "idle"
		}), /* @__PURE__ */ jsx("p", {
			className: "mt-2 text-[14px] leading-6 text-[#696257]",
			children: status === "failed" ? error || "This analysis could not be completed." : status === "processing" ? "We are preparing the transcript, shared diagnostics, and creator-facing guidance." : "Analysis has not started yet."
		})]
	});
}
function ErrorStateModal({ message, retrying, onRetry, onDismiss }) {
	return /* @__PURE__ */ jsx("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center rounded-[22px] bg-[rgba(42,33,20,0.28)] px-4 backdrop-blur-[2px]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-[430px] rounded-[20px] border border-[#ddd6ca] bg-[#fffdf9] p-5 shadow-[0_24px_60px_rgba(42,33,20,0.18)]",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0bf] text-[#8c6b10]",
					children: /* @__PURE__ */ jsxs("svg", {
						viewBox: "0 0 24 24",
						className: "h-5 w-5 stroke-current",
						fill: "none",
						strokeWidth: "2",
						strokeLinecap: "round",
						strokeLinejoin: "round",
						children: [
							/* @__PURE__ */ jsx("path", { d: "M12 8v5" }),
							/* @__PURE__ */ jsx("path", { d: "M12 16h.01" }),
							/* @__PURE__ */ jsx("path", { d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" })
						]
					})
				}),
				/* @__PURE__ */ jsx("h3", {
					className: "mt-4 text-[20px] font-semibold text-[#1a1a1a]",
					children: "Something went wrong"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-[14px] leading-6 text-[#696257]",
					children: message || "We could not finish this analysis right now. Please try again later."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 flex gap-3",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onRetry,
						disabled: retrying,
						className: "inline-flex flex-1 items-center justify-center rounded-full bg-[#f2c44f] px-4 py-2.5 text-[12px] font-semibold text-[#4f3d08] transition hover:bg-[#e8bb48] disabled:cursor-not-allowed disabled:opacity-60",
						children: retrying ? "Retrying…" : "Try again"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onDismiss,
						className: "inline-flex flex-1 items-center justify-center rounded-full border border-[#ddd6ca] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#5f584d] transition hover:bg-[#faf7f1]",
						children: "Close"
					})]
				})
			]
		})
	});
}
function WhyTab({ result, video }) {
	const drivers = whyDrivers(result);
	const baseline = Number(video?.virality_score);
	const subtitle = Number.isFinite(baseline) && baseline > 0 ? `${Math.round(baseline)}x baseline` : "Outlier drivers";
	return /* @__PURE__ */ jsxs(PanelShell, {
		title: "Why It Went Viral",
		subtitle,
		icon: /* @__PURE__ */ jsxs("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4 stroke-current",
			fill: "none",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: [/* @__PURE__ */ jsx("path", { d: "M8 16l8-8" }), /* @__PURE__ */ jsx("path", { d: "M9 8h7v7" })]
		}),
		children: [/* @__PURE__ */ jsx("div", {
			className: "mb-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]",
			children: "Top outlier drivers"
		}), /* @__PURE__ */ jsx("div", {
			className: "space-y-3",
			children: drivers.map((item) => /* @__PURE__ */ jsx("article", {
				className: "rounded-[12px] border border-[#ddd6ca] bg-white px-4 py-3",
				children: /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("span", {
						className: "flex h-6 w-6 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]",
						children: item.rank
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "text-[14px] font-semibold text-[#1a1a1a]",
								children: item.title
							}), item.uplift && /* @__PURE__ */ jsx("span", {
								className: "rounded-full bg-[#dff4df] px-2 py-0.5 text-[10px] font-semibold text-[#2c8a4d]",
								children: item.uplift
							})]
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[13px] leading-5 text-[#696257]",
							children: item.body
						})]
					})]
				})
			}, item.id))
		})]
	});
}
function hookReasons(result) {
	const reasons = Array.isArray(result?.hook_reasons) ? result.hook_reasons : [];
	if (reasons.length > 0) return reasons.map((item, index) => ({
		id: index,
		title: item?.title || item?.tactic || item?.label || `Hook tactic ${index + 1}`,
		body: item?.explanation || item?.reason || (typeof item === "string" ? item : "")
	}));
	return whyDrivers({ content_breakdown: Array.isArray(result?.content_breakdown) ? result.content_breakdown.slice(0, 3) : [] }).map((item) => ({
		id: item.id,
		title: item.title,
		body: item.body
	}));
}
function HookTab({ result }) {
	const variations = hookVariations(result);
	const reasons = hookReasons(result);
	return /* @__PURE__ */ jsxs(PanelShell, {
		title: "Hook",
		subtitle: "first 2 seconds",
		icon: /* @__PURE__ */ jsx("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4 stroke-current",
			fill: "none",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: /* @__PURE__ */ jsx("path", { d: "M12 3l2.3 4.7L19 8.4l-3.5 3.4.8 4.8L12 14.9 7.7 16.6l.8-4.8L5 8.4l4.7-.7L12 3z" })
		}),
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "border-l-2 border-[#f0c24b] pl-3 text-[24px] font-semibold leading-8 text-[#1a1a1a]",
				children: typeof result?.hook_analysis === "string" ? result.hook_analysis : "The core hook is still being assembled."
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]",
				children: "Why it works"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3 space-y-3",
				children: reasons.map((item) => /* @__PURE__ */ jsx("article", {
					className: "rounded-[12px] border border-[#ddd6ca] bg-white px-4 py-3",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ jsx("span", {
							className: "mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]",
							children: "-"
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-[14px] font-semibold text-[#1a1a1a]",
							children: item.title
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[13px] leading-5 text-[#696257]",
							children: item.body
						})] })]
					})
				}, item.id))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]",
				children: "Variations to test"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3 space-y-3",
				children: variations.map((item) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3 rounded-[12px] border border-[#ddd6ca] bg-white px-4 py-3 text-[13px] text-[#5f584d]",
					children: [/* @__PURE__ */ jsx("span", {
						className: "flex h-5 w-5 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]",
						children: item.label
					}), /* @__PURE__ */ jsx("span", { children: item.text })]
				}, item.id))
			})
		]
	});
}
function TranscriptTab({ analysis }) {
	const rows = transcriptRows(analysis);
	const segments = Array.isArray(analysis?.transcript_segments) ? analysis.transcript_segments : [];
	const duration = segments.length > 0 ? formatDuration((segments.at(-1)?.end_ms || 14e3) / 1e3) : "0:14";
	return /* @__PURE__ */ jsx(PanelShell, {
		title: "Transcript",
		subtitle: `auto-generated - ${duration}`,
		icon: /* @__PURE__ */ jsx("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4 stroke-current",
			fill: "none",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: /* @__PURE__ */ jsx("path", { d: "M7 4h10a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2h2" })
		}),
		children: /* @__PURE__ */ jsx("div", {
			className: "space-y-1",
			children: rows.map((row) => /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-[44px_minmax(0,1fr)] gap-4 border-b border-dashed border-[#e7dfd1] py-3 last:border-b-0",
				children: [/* @__PURE__ */ jsx("div", {
					className: "text-[12px] font-bold text-[#a07512]",
					children: row.time
				}), /* @__PURE__ */ jsx("div", {
					className: "text-[14px] leading-6 text-[#4f4a42]",
					children: row.text
				})]
			}, row.id))
		})
	});
}
function StrategistTab({ result }) {
	const recommendations = strategistRecommendations(result);
	const blueprint = blueprintText(result);
	const blueprintLines = blueprintRows(blueprint);
	return /* @__PURE__ */ jsxs(PanelShell, {
		title: "Creative Strategist",
		subtitle: "how to replicate this for your brand",
		icon: /* @__PURE__ */ jsxs("svg", {
			viewBox: "0 0 24 24",
			className: "h-4 w-4 stroke-current",
			fill: "none",
			strokeWidth: "2",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: [/* @__PURE__ */ jsx("circle", {
				cx: "11",
				cy: "11",
				r: "6"
			}), /* @__PURE__ */ jsx("path", { d: "M20 20l-3.5-3.5" })]
		}),
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]",
				children: "Recommendations"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3 space-y-3",
				children: recommendations.map((item) => /* @__PURE__ */ jsx("article", {
					className: "rounded-[12px] border border-[#ddd6ca] bg-white px-4 py-3",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ jsx("span", {
							className: "flex h-6 w-6 items-center justify-center rounded-full bg-[#fff0bf] text-[10px] font-bold text-[#916e16]",
							children: item.rank
						}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "text-[14px] font-semibold text-[#1a1a1a]",
							children: item.title
						}), item.body && /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[13px] leading-5 text-[#696257]",
							children: item.body
						})] })]
					})
				}, item.id))
			}),
			blueprint && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
				className: "mt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c8579]",
				children: "Script to replicate"
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-3 rounded-[14px] border border-dashed border-[#ddc79d] bg-[#fffaf0] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
				children: /* @__PURE__ */ jsx("div", {
					className: "space-y-3 font-mono text-[12.5px] leading-6 text-[#5f584d]",
					children: blueprintLines.map((line) => /* @__PURE__ */ jsx("div", { children: line.label ? /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("span", {
							className: "font-semibold uppercase tracking-[0.02em] text-[#4a4338]",
							children: line.label
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-[#8f8678]",
							children: " - "
						}),
						/* @__PURE__ */ jsx("span", { children: line.body })
					] }) : /* @__PURE__ */ jsx("span", { children: line.body }) }, line.id))
				})
			})] })
		]
	});
}
function ActivePanel({ activeTab, analysis, result, video }) {
	if (activeTab === "hook") return /* @__PURE__ */ jsx(HookTab, { result });
	if (activeTab === "transcript") return /* @__PURE__ */ jsx(TranscriptTab, { analysis });
	if (activeTab === "strategist") return /* @__PURE__ */ jsx(StrategistTab, { result });
	return /* @__PURE__ */ jsx(WhyTab, {
		result,
		video
	});
}
var DEFAULT_TABS = [
	{
		key: "why",
		label: "Why It Went Viral"
	},
	{
		key: "hook",
		label: "Hook"
	},
	{
		key: "transcript",
		label: "Transcript"
	},
	{
		key: "strategist",
		label: "Creative Strategist"
	}
];
function AnalysisModal({ video, initialAnalysis, tabs = DEFAULT_TABS, open = true, onClose, onAnalysisChange }) {
	const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "why");
	const [analysis, setAnalysis] = usePolling(video.id, initialAnalysis, open);
	const [regenerating, setRegenerating] = useState(false);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const canRegenerate = Boolean(usePage().props?.features?.videoAnalysisRefresh);
	const onAnalysisChangeRef = useRef(onAnalysisChange);
	onAnalysisChangeRef.current = onAnalysisChange;
	useEffect(() => {
		if (analysis) onAnalysisChangeRef.current?.(video.id, analysis);
	}, [analysis, video.id]);
	useEffect(() => {
		if (!open) return;
		setShowErrorModal(analysis?.status === "failed");
	}, [
		analysis?.status,
		open,
		video?.id
	]);
	const requestAnalysis = async (forceRefresh = false) => {
		const payload = await videoAnalysis.request(video.id, forceRefresh ? { force_refresh: true } : {});
		setShowErrorModal(false);
		setAnalysis(payload.analysis);
	};
	const regenerate = async () => {
		if (regenerating) return;
		setRegenerating(true);
		try {
			await requestAnalysis(true);
		} catch (error) {
			window.alert(error?.message || "Could not regenerate this analysis.");
		} finally {
			setRegenerating(false);
		}
	};
	const retryAnalysis = async () => {
		if (regenerating) return;
		setRegenerating(true);
		try {
			await requestAnalysis(false);
		} catch (error) {
			window.alert(error?.message || "Could not restart this analysis.");
		} finally {
			setRegenerating(false);
		}
	};
	useEffect(() => {
		if (!open) return void 0;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const handleKeyDown = (event) => {
			if (event.key === "Escape") onClose?.();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, onClose]);
	useEffect(() => {
		setActiveTab(tabs[0]?.key ?? "why");
	}, [tabs, video?.id]);
	if (!open || !video) return null;
	const result = analysis?.result ?? {};
	const summary = result.why_it_went_viral || result.evidence_summary || "We are still assembling the summary for this video.";
	const regenerateDisabled = regenerating || analysis?.status === "processing";
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(38,33,28,0.42)] px-4 py-6 backdrop-blur-[2px]",
		onClick: onClose,
		children: /* @__PURE__ */ jsx("div", {
			className: "max-h-[calc(100vh-3rem)] w-full max-w-[1150px] overflow-y-auto rounded-[26px] border border-[#d9d1c4] bg-[radial-gradient(circle_at_top,#f7f2e9_0%,#f3efe8_32%,#f1ede6_100%)] p-3 shadow-[0_28px_90px_rgba(42,33,20,0.22)]",
			onClick: (event) => event.stopPropagation(),
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Video analysis",
			children: /* @__PURE__ */ jsxs("div", {
				className: "relative rounded-[22px] border border-[#d9d1c4] bg-[#f6f3ec] p-4 md:p-5",
				children: [
					showErrorModal && /* @__PURE__ */ jsx(ErrorStateModal, {
						message: analysis?.error_message,
						retrying: regenerating,
						onRetry: retryAnalysis,
						onDismiss: onClose
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						className: "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#e5ddd1] bg-[#fbfaf7] text-[#8a8479] transition hover:text-[#2a2a2a]",
						"aria-label": "Close analysis",
						children: /* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							className: "h-4 w-4 stroke-current",
							fill: "none",
							strokeWidth: "2",
							strokeLinecap: "round",
							children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid items-start gap-4 min-[980px]:grid-cols-[292px_minmax(0,1fr)]",
						children: [/* @__PURE__ */ jsx(LeftSidebar, {
							video,
							canRegenerate,
							regenerating,
							disabledRegenerate: regenerateDisabled,
							onRegenerate: regenerate
						}), /* @__PURE__ */ jsxs("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ jsx(SummaryCard, { summary }),
								/* @__PURE__ */ jsx(TabRow, {
									tabs,
									activeTab,
									onChange: setActiveTab
								}),
								analysis?.status !== "complete" ? /* @__PURE__ */ jsx(ProcessingState, {
									status: analysis?.status ?? "idle",
									error: analysis?.error_message
								}) : /* @__PURE__ */ jsx(ActivePanel, {
									activeTab,
									analysis,
									result,
									video
								})
							]
						})]
					})
				]
			})
		})
	});
}
//#endregion
//#region resources/js/Pages/SavedSearches/detail/Badges.jsx
var Badges_exports = /* @__PURE__ */ __exportAll({
	DeltaLine: () => DeltaLine,
	RebuiltBadge: () => RebuiltBadge,
	SampleBadge: () => SampleBadge
});
/**
* Two different kinds of "this is not a normal measurement", kept visually
* distinct because they mean genuinely different things.
*
*  - SampleBadge:        invented. Needs the TikTok profile actor, which is not
*                        built. Comes from PlaceholderProfileData on the server.
*  - RebuiltBadge:       derived from real videos, but describing when posts
*                        went up rather than what the metric read at the time.
*
* Never use one for the other. Amber says "do not trust this number", violet
* says "trust it, but know what it measures".
*/
function SampleBadge({ className = "" }) {
	return /* @__PURE__ */ jsx("span", {
		className: `prov sample ${className}`,
		title: "Sample data — needs the TikTok profile scrape, which isn't built yet",
		children: "sample"
	});
}
function RebuiltBadge({ className = "" }) {
	return /* @__PURE__ */ jsx("span", {
		className: `prov rebuilt ${className}`,
		title: "Rebuilt from upload dates — shows when posts went up and what they're worth now, not what the metric read at the time",
		children: "rebuilt"
	});
}
/**
* The `.d` line under a signal tile. Renders nothing when the change is
* unknown — a missing line is honest, a "0%" line is not.
*/
function DeltaLine({ delta }) {
	if (!delta || delta.value === null || delta.value === void 0) return /* @__PURE__ */ jsx("div", { className: "d" });
	const { value, unit, direction, reconstructed } = delta;
	const arrow = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
	const suffix = unit === "percent" ? "%" : unit === "points" ? "pt" : unit === "multiple" ? "x" : "";
	const magnitude = Math.abs(value);
	const rounded = magnitude >= 10 ? Math.round(magnitude) : Math.round(magnitude * 10) / 10;
	return /* @__PURE__ */ jsxs("div", {
		className: `d ${direction === "up" ? "up" : direction === "down" ? "down" : "flat"}`,
		title: reconstructed ? "vs a week rebuilt from upload dates" : "vs the previous week",
		children: [
			arrow,
			" ",
			rounded,
			suffix
		]
	});
}
//#endregion
//#region resources/js/Pages/SavedSearches/detail/InsightPanels.jsx
var InsightPanels_exports = /* @__PURE__ */ __exportAll({
	HashtagPanel: () => HashtagPanel,
	OutliersPerWeek: () => OutliersPerWeek,
	PostingHeatmap: () => PostingHeatmap,
	ScoreDistribution: () => ScoreDistribution,
	SignalTiles: () => SignalTiles,
	SoundPanel: () => SoundPanel
});
var PST_OFFSET_HOURS = -8;
var HOUR_LABELS = {
	0: "4 PM",
	6: "10 PM",
	12: "4 AM",
	18: "10 AM"
};
var PANEL_STEP = 5;
function pstHourFromUtc(hour) {
	return (hour + PST_OFFSET_HOURS + 24) % 24;
}
function formatPstHour(hour) {
	const normalized = pstHourFromUtc(hour);
	const suffix = normalized >= 12 ? "PM" : "AM";
	return `${normalized % 12 === 0 ? 12 : normalized % 12}:00 ${suffix} PST`;
}
/**
* Splits a formatted figure into the big number and its trailing unit, so the
* unit renders in the mockup's smaller muted `small`.
*/
function splitUnit(text) {
	const match = String(text).match(/^([\d.,]+)(.*)$/);
	return match ? [match[1], match[2]] : [text, ""];
}
function tileValue(tile) {
	if (tile.value === null || tile.value === void 0) return ["-", ""];
	switch (tile.format) {
		case "multiple": return splitUnit(outlierLabel(tile.value) ?? "-");
		case "percent": return splitUnit(percent(tile.value) ?? "-");
		case "compact": return splitUnit(compactNumber$1(tile.value));
		default: return [String(tile.value), ""];
	}
}
/**
* The five signal tiles, each with a week-over-week line where one can be
* sourced. `deltas` is keyed by tile key; a missing entry renders an empty
* line rather than a zero. A tile may instead carry its own `deltaNode`
* (e.g. the sample-data follower growth), which wins over the computed line.
*/
function SignalTiles({ tiles = [], deltas = {} }) {
	if (tiles.length === 0) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "stats",
		children: tiles.map((tile) => {
			const [value, unit] = tileValue(tile);
			return /* @__PURE__ */ jsxs("div", {
				className: `stat ${tile.hero ? "hero" : ""}`,
				title: tile.hint ?? void 0,
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "k",
						children: tile.label
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "v",
						children: [value, unit && /* @__PURE__ */ jsx("small", { children: unit })]
					}),
					tile.deltaNode ?? /* @__PURE__ */ jsx(DeltaLine, { delta: deltas[tile.key] })
				]
			}, tile.key);
		})
	});
}
/** Run-over-run movement for a hashtag or sound. */
function Growth({ growth }) {
	if (!growth) return /* @__PURE__ */ jsx("span", {
		className: "gro flat",
		children: "-"
	});
	if (growth.is_new) return /* @__PURE__ */ jsx("span", {
		className: "gro",
		children: "new"
	});
	if (growth.change_pct === null || growth.change_pct === 0) return /* @__PURE__ */ jsx("span", {
		className: "gro flat",
		children: "flat"
	});
	const up = growth.change_pct > 0;
	return /* @__PURE__ */ jsxs("span", {
		className: `gro ${up ? "" : "down"}`,
		children: [
			up ? "+" : "-",
			" ",
			Math.abs(growth.change_pct),
			"%"
		]
	});
}
function HashtagPanel({ hashtags = [] }) {
	const [visible, setVisible] = useState(PANEL_STEP);
	const shown = hashtags.slice(0, visible);
	const remaining = Math.max(0, hashtags.length - shown.length);
	return /* @__PURE__ */ jsxs("div", {
		className: "hspanel",
		children: [/* @__PURE__ */ jsx("h3", { children: "# hashtags" }), hashtags.length === 0 ? /* @__PURE__ */ jsx("p", {
			className: "empty",
			children: "No hashtags on the matched videos."
		}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
			className: "hlist",
			role: "list",
			"aria-label": "Top hashtags",
			children: shown.map((row, index) => /* @__PURE__ */ jsxs("div", {
				className: "hrow",
				role: "listitem",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "idx",
						children: index + 1
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "nm",
						children: ["#", row.tag]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "cnt",
						children: [
							"on ",
							row.posts,
							" posts"
						]
					}),
					/* @__PURE__ */ jsx(Growth, { growth: row.growth })
				]
			}, row.tag))
		}), remaining > 0 && /* @__PURE__ */ jsx("div", {
			className: "hmore",
			children: /* @__PURE__ */ jsxs("button", {
				className: "tbtn",
				type: "button",
				onClick: () => setVisible((count) => count + PANEL_STEP),
				children: [
					"show ",
					Math.min(PANEL_STEP, remaining),
					" more"
				]
			})
		})] })]
	});
}
function SoundPanel({ sounds = [] }) {
	const [visible, setVisible] = useState(PANEL_STEP);
	const shown = sounds.slice(0, visible);
	const remaining = Math.max(0, sounds.length - shown.length);
	return /* @__PURE__ */ jsxs("div", {
		className: "hspanel",
		children: [/* @__PURE__ */ jsx("h3", { children: "sounds" }), sounds.length === 0 ? /* @__PURE__ */ jsx("p", {
			className: "empty",
			children: "No sound credited on the matched videos."
		}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
			className: "hlist",
			role: "list",
			"aria-label": "Top sounds",
			children: shown.map((row, index) => /* @__PURE__ */ jsxs("div", {
				className: "hrow",
				role: "listitem",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "idx",
						children: index + 1
					}),
					/* @__PURE__ */ jsx("span", {
						className: "splay",
						children: /* @__PURE__ */ jsx("svg", {
							width: "11",
							height: "12",
							viewBox: "0 0 14 16",
							fill: "var(--violet)",
							"aria-hidden": true,
							children: /* @__PURE__ */ jsx("path", { d: "M0 0l14 8-14 8z" })
						})
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "nm",
						children: [row.label, row.on_top_video && /* @__PURE__ */ jsx("span", {
							className: "u",
							children: "used on the winner"
						})]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "cnt",
						children: [row.posts, " posts"]
					}),
					/* @__PURE__ */ jsx(Growth, { growth: row.growth })
				]
			}, row.label))
		}), remaining > 0 && /* @__PURE__ */ jsx("div", {
			className: "hmore",
			children: /* @__PURE__ */ jsxs("button", {
				className: "tbtn",
				type: "button",
				onClick: () => setVisible((count) => count + PANEL_STEP),
				children: [
					"show ",
					Math.min(PANEL_STEP, remaining),
					" more"
				]
			})
		})] })]
	});
}
function PostingHeatmap({ heatmap }) {
	const [tip, setTip] = useState(null);
	if (!heatmap || heatmap.counted === 0) return /* @__PURE__ */ jsx("div", {
		className: "panel",
		children: /* @__PURE__ */ jsx("p", {
			className: "empty",
			children: "No upload timestamps on the matched videos yet."
		})
	});
	const { days = [], cells = [], max = 0, peak } = heatmap;
	return /* @__PURE__ */ jsxs("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "heat",
				children: /* @__PURE__ */ jsxs("div", {
					className: "heatgrid",
					children: [
						/* @__PURE__ */ jsx("div", {}),
						Array.from({ length: 24 }).map((_, hour) => /* @__PURE__ */ jsx("div", {
							className: "hh",
							children: HOUR_LABELS[hour] ?? ""
						}, hour)),
						days.map((day, dayIndex) => /* @__PURE__ */ jsxs("div", {
							className: "contents",
							style: { display: "contents" },
							children: [/* @__PURE__ */ jsx("div", {
								className: "dl",
								children: day
							}), (cells[dayIndex] ?? []).map((count, hour) => {
								const t = max > 0 ? count / max : 0;
								const isPeak = peak && peak.day === day && peak.hour === hour && count > 0;
								const label = `${day} ${formatPstHour(hour)} · ${count} ${count === 1 ? "post" : "posts"}`;
								return /* @__PURE__ */ jsx("div", {
									className: "cell",
									onMouseMove: (event) => setTip({
										x: event.clientX,
										y: event.clientY,
										label
									}),
									onMouseLeave: () => setTip(null),
									style: count > 0 ? { background: isPeak ? "var(--coral)" : `color-mix(in srgb, var(--violet) ${Math.round(18 + t * 82)}%, var(--paper-2))` } : void 0
								}, hour);
							})]
						}, day))
					]
				})
			}),
			tip && /* @__PURE__ */ jsx("div", {
				className: "heat-tip",
				style: {
					left: tip.x,
					top: tip.y
				},
				children: tip.label
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "heatlegend",
				children: [
					"less",
					/* @__PURE__ */ jsxs("span", {
						className: "scale",
						children: [[
							10,
							30,
							50,
							70,
							100
						].map((step) => /* @__PURE__ */ jsx("i", { style: { background: `color-mix(in srgb, var(--violet) ${step}%, var(--paper-2))` } }, step)), /* @__PURE__ */ jsx("i", { style: { background: "var(--coral)" } })]
					}),
					"more"
				]
			}),
			peak && /* @__PURE__ */ jsxs("div", {
				className: "heat-note",
				children: [
					/* @__PURE__ */ jsx("b", { children: "Their rhythm:" }),
					" busiest slot is ",
					peak.day,
					" around ",
					formatPstHour(peak.hour),
					", with ",
					peak.count,
					" ",
					peak.count === 1 ? "post" : "posts",
					". Times are shown in PST using the UTC scrape timestamps."
				]
			})
		]
	});
}
/** Faint placeholder bars that keep the panel's shape while it has no story. */
var GHOST_HEIGHTS = [
	34,
	58,
	42,
	66,
	50,
	82
];
/**
* Six-week outlier bars. An all-zero week set renders as ghost bars with an
* explanation instead of six zeros; on a first run that chart looks broken,
* and the two reasons it can be empty deserve different sentences: either no
* post has cleared the threshold at all, or the outliers exist but were
* posted before the 12-week window this chart covers.
*/
function OutliersPerWeek({ bars = [], threshold = 3, totalOutliers = 0, nextRunLabel = null }) {
	const max = Math.max(...bars.map((b) => b.value), 1);
	if (bars.length === 0 || bars.every((b) => !b.value)) return /* @__PURE__ */ jsxs("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ jsx("h3", { children: "outliers per week" }),
			/* @__PURE__ */ jsxs("div", {
				className: "psub",
				children: [
					"their posts scoring ",
					outlierLabel(threshold) ?? "3x",
					" or higher"
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "spark ghost",
				"aria-hidden": true,
				children: GHOST_HEIGHTS.map((height, index) => /* @__PURE__ */ jsxs("div", {
					className: "col",
					children: [/* @__PURE__ */ jsx("div", {
						className: "bar2",
						style: { height: `${height}%` }
					}), /* @__PURE__ */ jsx("span", {
						className: "wl",
						children: index === GHOST_HEIGHTS.length - 1 ? "now" : `wk ${index + 1}`
					})]
				}, index))
			}),
			/* @__PURE__ */ jsx("p", {
				className: "ghostnote",
				children: totalOutliers > 0 ? `All ${totalOutliers} of their outliers were posted more than 12 weeks ago; this chart covers recent weeks only. It fills in as refreshes land.` : `Nothing has beaten ${outlierLabel(threshold) ?? "3x"} the search median yet. A bar appears the week a post breaks out${nextRunLabel ? ` - next check ${nextRunLabel}` : ""}.`
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ jsx("h3", { children: "outliers per week" }),
			/* @__PURE__ */ jsxs("div", {
				className: "psub",
				children: [
					"their posts scoring ",
					outlierLabel(threshold) ?? "3x",
					" or higher"
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "spark",
				children: bars.map((bar, index) => /* @__PURE__ */ jsxs("div", {
					className: "col",
					children: [/* @__PURE__ */ jsx("div", {
						className: `bar2 ${index === bars.length - 1 ? "now" : ""}`,
						style: { height: `${Math.max(bar.value / max * 100, 4)}%` },
						children: /* @__PURE__ */ jsx("em", { children: bar.value })
					}), /* @__PURE__ */ jsx("span", {
						className: "wl",
						children: index === bars.length - 1 ? "now" : `wk ${index + 1}`
					})]
				}, `${bar.label}-${index}`))
			})
		]
	});
}
/** Mockup bar colours by bucket floor: violet-soft, violet, then coral. */
function bucketColor(min) {
	if (min >= 8) return "var(--coral)";
	if (min >= 5) return "var(--violet)";
	return "var(--violet-soft)";
}
function ScoreDistribution({ distribution = [] }) {
	const top = Math.max(...distribution.map((row) => row.count), 1);
	const outliers = distribution.reduce((sum, row) => sum + row.count, 0);
	return /* @__PURE__ */ jsxs("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ jsx("h3", { children: "score distribution" }),
			/* @__PURE__ */ jsxs("div", {
				className: "psub",
				children: [
					"this search's ",
					outliers,
					" ",
					outliers === 1 ? "outlier" : "outliers"
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "dist",
				children: distribution.map((row) => /* @__PURE__ */ jsxs("div", {
					className: "dline",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "rng",
							children: row.label
						}),
						/* @__PURE__ */ jsx("span", {
							className: "dbar",
							children: /* @__PURE__ */ jsx("span", { style: {
								width: `${row.count / top * 100}%`,
								background: bucketColor(row.min)
							} })
						}),
						/* @__PURE__ */ jsx("span", {
							className: "cnt",
							children: row.count
						})
					]
				}, row.label))
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/SavedSearches/detail/TrendPanels.jsx
var TrendPanels_exports = /* @__PURE__ */ __exportAll({
	AiSummary: () => AiSummary,
	PerformanceChart: () => PerformanceChart,
	TrackerHead: () => TrackerHead
});
var W = 560;
var H = 180;
function formatValue(value, format) {
	if (value === null || value === void 0) return "—";
	if (format === "compact") return compactNumber$1(value);
	if (format === "percent") return percent(value) ?? "—";
	return String(value);
}
/** Maps a series onto the viewBox. A flat series sits mid-height, not on the floor. */
function toPoints(values) {
	if (!values || values.length < 2) return [];
	const max = Math.max(...values);
	const min = Math.min(...values);
	const range = max - min;
	return values.map((v, i) => {
		return [i / (values.length - 1) * W, range === 0 ? H / 2 : 170 - (v - min) / range * 160];
	});
}
/**
* The 12-week performance chart. Weeks rebuilt from upload dates are drawn
* dashed and the measured tail solid, so the eye can tell reconstructed
* history from real history without reading the caption.
*/
function PerformanceChart({ trend }) {
	const [metric, setMetric] = useState("views");
	const series = trend?.metrics?.[metric];
	const points = trend?.points ?? [];
	const geometry = useMemo(() => {
		const coords = toPoints(series?.values ?? []);
		if (coords.length === 0) return null;
		const asPoly = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
		const line = asPoly(coords);
		const firstRecorded = points.findIndex((p) => !p.reconstructed);
		return {
			line,
			recorded: firstRecorded >= 0 && firstRecorded < coords.length - 1 ? asPoly(coords.slice(firstRecorded)) : null,
			area: `${line} ${W},${H} 0,${H}`,
			last: coords[coords.length - 1]
		};
	}, [series, points]);
	if (!series || !geometry) return /* @__PURE__ */ jsx("div", {
		className: "panel",
		children: /* @__PURE__ */ jsx("p", {
			className: "empty",
			children: "Not enough history to plot yet."
		})
	});
	const delta = series.delta;
	const deltaTone = !delta ? "flat" : delta.direction === "up" ? "up" : delta.direction === "down" ? "down" : "flat";
	const deltaSuffix = delta?.unit === "points" ? " pts" : "%";
	return /* @__PURE__ */ jsxs("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "ts-tabs",
				children: Object.entries(trend.metrics).map(([key, definition]) => /* @__PURE__ */ jsx("button", {
					className: metric === key ? "on" : "",
					onClick: () => setMetric(key),
					children: definition.label
				}, key))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ts-head",
				children: [/* @__PURE__ */ jsx("span", {
					className: "ts-val",
					children: formatValue(series.current, series.format)
				}), delta && /* @__PURE__ */ jsxs("span", {
					className: `ts-delta ${deltaTone}`,
					children: [
						delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→",
						" ",
						Math.abs(delta.value),
						deltaSuffix,
						" vs 12 wk ago"
					]
				})]
			}),
			/* @__PURE__ */ jsxs("svg", {
				className: "ts-svg",
				viewBox: `0 0 ${W} ${H}`,
				preserveAspectRatio: "none",
				children: [
					/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
						id: "tsfill",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ jsx("stop", {
							offset: "0",
							stopColor: "var(--violet)",
							stopOpacity: ".2"
						}), /* @__PURE__ */ jsx("stop", {
							offset: "1",
							stopColor: "var(--violet)",
							stopOpacity: "0"
						})]
					}) }),
					/* @__PURE__ */ jsx("polygon", {
						points: geometry.area,
						fill: "url(#tsfill)"
					}),
					/* @__PURE__ */ jsx("polyline", {
						points: geometry.line,
						fill: "none",
						stroke: "var(--violet)",
						strokeWidth: "2.5",
						strokeLinejoin: "round",
						strokeLinecap: "round",
						strokeDasharray: trend.has_reconstructed ? "5 4" : void 0,
						opacity: trend.has_reconstructed ? .55 : 1
					}),
					geometry.recorded && /* @__PURE__ */ jsx("polyline", {
						points: geometry.recorded,
						fill: "none",
						stroke: "var(--violet)",
						strokeWidth: "2.5",
						strokeLinejoin: "round",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ jsx("circle", {
						cx: geometry.last[0],
						cy: geometry.last[1],
						r: "4.5",
						fill: "var(--violet)",
						stroke: "#fff",
						strokeWidth: "2"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ts-x",
				children: [
					/* @__PURE__ */ jsx("span", { children: "12 wk ago" }),
					/* @__PURE__ */ jsx("span", { children: "8 wk" }),
					/* @__PURE__ */ jsx("span", { children: "4 wk" }),
					/* @__PURE__ */ jsx("span", { children: "now" })
				]
			})
		]
	});
}
/**
* Page head: logo, title, handles row, actions. The handle can come from a
* brand-level OpenAI lookup, while avatar and follower count only render when
* the matched videos happened to include that same account.
*/
function TrackerHead({ search, account, lastRun, nextRun, onToggleWatchlist, onShare, onTogglePause, onDelete, copied, watchlistUpdating }) {
	const initial = (search?.name ?? "?").slice(0, 1).toUpperCase();
	const paused = search?.status === "paused";
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);
	useEffect(() => {
		if (!menuOpen) return void 0;
		const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
		const onEsc = (e) => e.key === "Escape" && setMenuOpen(false);
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onEsc);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onEsc);
		};
	}, [menuOpen]);
	const [confirm, setConfirm] = useState(null);
	const openPause = () => {
		setMenuOpen(false);
		if (paused) onTogglePause?.();
		else setConfirm("pause");
	};
	const openDelete = () => {
		setMenuOpen(false);
		setConfirm("delete");
	};
	const runConfirm = () => {
		const action = confirm;
		setConfirm(null);
		if (action === "pause") onTogglePause?.();
		else if (action === "delete") onDelete?.();
	};
	const meta = [
		`checked ${search?.frequency ?? "weekly"}`,
		lastRun && `last run ${lastRun}`,
		search?.status === "paused" ? "paused" : nextRun && `next refresh ${nextRun}`
	].filter(Boolean).join(" · ");
	const confirmCopy = confirm === "pause" ? {
		title: "Pause Tracking?",
		body: `We’ll stop refreshing “${search?.name}” until you resume it. The results you’ve already collected stay available.`,
		cta: "Pause Tracking",
		danger: false
	} : {
		title: "Delete Tracking?",
		body: `This removes “${search?.name}” and stops all future runs. This can’t be undone.`,
		cta: "Delete Tracking",
		danger: true
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("header", { children: /* @__PURE__ */ jsxs("div", {
		className: "brandrow",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "logo",
				title: "brand logo",
				children: account?.avatar ? /* @__PURE__ */ jsx("img", {
					src: account.avatar,
					alt: "",
					referrerPolicy: "no-referrer"
				}) : initial
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "titlewrap",
				children: [/* @__PURE__ */ jsx("h1", { children: search?.name ?? "Tracker" }), /* @__PURE__ */ jsxs("div", {
					className: "handles",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "badge",
							children: search?.search_type ?? "brand"
						}),
						account?.handle && /* @__PURE__ */ jsx("span", {
							className: "h",
							children: account.handle
						}),
						account?.followers > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { className: "sep" }), /* @__PURE__ */ jsxs("span", { children: [compactNumber$1(account.followers), " followers"] })] }),
						/* @__PURE__ */ jsx("span", { className: "sep" }),
						/* @__PURE__ */ jsx("span", { children: meta })
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "head-actions",
				children: [
					onToggleWatchlist && /* @__PURE__ */ jsx("button", {
						className: `tbtn tbtn-ic${search?.is_watchlisted ? " is-saved" : ""}`,
						onClick: onToggleWatchlist,
						disabled: watchlistUpdating,
						"aria-pressed": Boolean(search?.is_watchlisted),
						title: search?.is_watchlisted ? "Bookmarked" : "Add bookmark",
						"aria-label": search?.is_watchlisted ? "Bookmarked" : "Add bookmark",
						children: /* @__PURE__ */ jsx(Bookmark, {
							className: "h-4 w-4",
							filled: Boolean(search?.is_watchlisted)
						})
					}),
					/* @__PURE__ */ jsx("button", {
						className: "tbtn tbtn-ic",
						onClick: onShare,
						title: copied ? "Link copied" : "Share",
						"aria-label": copied ? "Link copied" : "Share",
						children: copied ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Share, { className: "h-4 w-4" })
					}),
					(onTogglePause || onDelete) && /* @__PURE__ */ jsxs("span", {
						className: "tk-menu",
						ref: menuRef,
						children: [/* @__PURE__ */ jsx("button", {
							className: "tbtn tbtn-ic",
							onClick: () => setMenuOpen((open) => !open),
							"aria-haspopup": "menu",
							"aria-expanded": menuOpen,
							title: "More actions",
							"aria-label": "More actions",
							children: /* @__PURE__ */ jsx(Dots, { className: "h-4 w-4" })
						}), menuOpen && /* @__PURE__ */ jsxs("div", {
							className: "menu",
							role: "menu",
							children: [onTogglePause && /* @__PURE__ */ jsx("button", {
								type: "button",
								role: "menuitem",
								onClick: openPause,
								children: paused ? "Resume Tracking" : "Pause Tracking"
							}), onDelete && /* @__PURE__ */ jsx("button", {
								type: "button",
								role: "menuitem",
								className: "danger",
								onClick: openDelete,
								children: "Delete Tracking"
							})]
						})]
					})
				]
			})
		]
	}) }), confirm && typeof document !== "undefined" && createPortal(/* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Cancel",
				onClick: () => setConfirm(null)
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box",
				children: [
					/* @__PURE__ */ jsx("h2", {
						style: confirmCopy.danger ? { color: "var(--warn)" } : void 0,
						children: confirmCopy.title
					}),
					/* @__PURE__ */ jsx("p", {
						className: "sub",
						children: confirmCopy.body
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "actrow__r",
						style: {
							marginTop: 24,
							justifyContent: "flex-end"
						},
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g",
							onClick: () => setConfirm(null),
							children: "Cancel"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--y",
							style: confirmCopy.danger ? {
								color: "var(--warn)",
								borderColor: "#F0D6C8",
								background: "var(--warn-bg)",
								boxShadow: "none"
							} : void 0,
							onClick: runConfirm,
							children: confirmCopy.cta
						})]
					})
				]
			})]
		})
	}), document.body)] });
}
/**
* The one-line read. Absent until the enrichment job has run, which is correct
* on a brand new search — it never renders a placeholder sentence.
*/
function AiSummary({ summary, generatedAt }) {
	if (!summary) return null;
	const when = generatedAt ? new Date(generatedAt) : null;
	const breakAt = summary.search(/[.!?](\s|$)/);
	const lead = breakAt >= 0 ? summary.slice(0, breakAt + 1) : summary;
	const tail = breakAt >= 0 ? summary.slice(breakAt + 1) : "";
	return /* @__PURE__ */ jsxs("div", {
		className: "ai",
		children: [
			/* @__PURE__ */ jsx("svg", {
				className: "spark",
				viewBox: "0 0 24 24",
				"aria-hidden": true,
				children: /* @__PURE__ */ jsx("path", { d: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "txt",
				children: [/* @__PURE__ */ jsx("b", { children: lead }), tail]
			}),
			when && !Number.isNaN(when.getTime()) && /* @__PURE__ */ jsx("span", {
				className: "when",
				children: when.toLocaleDateString(void 0, {
					month: "short",
					day: "numeric"
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/SavedSearches/detail/DetailScreen.jsx
var DetailScreen_exports = /* @__PURE__ */ __exportAll({ default: () => DetailScreen });
var PAGE_STEP = 4;
function SectionHead({ title, note, small = false }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "sect-head",
		children: [/* @__PURE__ */ jsx("h2", {
			style: small ? { fontSize: "19px" } : void 0,
			children: title
		}), note && /* @__PURE__ */ jsx("span", {
			className: "note",
			children: note
		})]
	});
}
function formatDate$1(iso) {
	if (!iso) return null;
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function formatInsightDate(iso) {
	if (!iso) return null;
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(void 0, {
		month: "long",
		day: "numeric"
	});
}
function numericUsageValue(value, fallback = 0) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (value && typeof value === "object") {
		if (typeof value.used === "number" && Number.isFinite(value.used)) return value.used;
		if (typeof value.limit === "number" && Number.isFinite(value.limit)) return value.limit;
	}
	const coerced = Number(value);
	return Number.isFinite(coerced) ? coerced : fallback;
}
function buildAnalysisStates(results = []) {
	return Object.fromEntries(results.filter((video) => video?.id && video?.analysis).map((video) => [video.id, {
		status: video.analysis.status ?? "idle",
		error: video.analysis.error_message ?? null,
		analysis: video.analysis
	}]));
}
function mergeAnalysisIntoItems(items = [], videoId, payload) {
	return items.map((item) => item.id === videoId ? {
		...item,
		analysis: payload ? {
			...item.analysis ?? {},
			...payload
		} : item.analysis ?? null
	} : item);
}
function AnalyzeConfirmModal({ video, creditsRemainingAfterUse = 0, busy = false, onConfirm, onCancel }) {
	if (!video) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[130] flex items-center justify-center bg-[rgba(38,33,28,0.42)] px-4 py-6 backdrop-blur-[2px]",
		onClick: onCancel,
		children: /* @__PURE__ */ jsx("div", {
			className: "w-full max-w-[430px] rounded-[24px] border border-[#d9d1c4] bg-[radial-gradient(circle_at_top,#f7f2e9_0%,#f3efe8_40%,#f1ede6_100%)] p-3 shadow-[0_28px_90px_rgba(42,33,20,0.22)]",
			onClick: (event) => event.stopPropagation(),
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Confirm video analysis",
			children: /* @__PURE__ */ jsxs("div", {
				className: "rounded-[20px] border border-[#ddd6ca] bg-[#fffdf9] p-5",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0bf] text-[#8c6b10]",
						children: /* @__PURE__ */ jsxs("svg", {
							viewBox: "0 0 24 24",
							className: "h-5 w-5 stroke-current",
							fill: "none",
							strokeWidth: "2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							children: [
								/* @__PURE__ */ jsx("circle", {
									cx: "12",
									cy: "12",
									r: "9"
								}),
								/* @__PURE__ */ jsx("path", { d: "M12 8v5" }),
								/* @__PURE__ */ jsx("path", { d: "M12 16h.01" })
							]
						})
					}),
					/* @__PURE__ */ jsx("h3", {
						className: "mt-4 text-[20px] font-semibold text-[#1a1a1a]",
						children: "Analyze this video?"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-2 text-[14px] leading-6 text-[#696257]",
						children: [
							"Successful analysis will use 1 credit. You will have ",
							creditsRemainingAfterUse,
							" credits remaining after deduction."
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 truncate text-[12px] font-medium text-[#8c8579]",
						children: video.handle ?? video.creator_name ?? video.title ?? "Selected video"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-5 flex gap-3",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onConfirm,
							disabled: busy,
							className: "inline-flex flex-1 items-center justify-center rounded-full bg-[#f2c44f] px-4 py-2.5 text-[12px] font-semibold text-[#4f3d08] transition hover:bg-[#e8bb48] disabled:cursor-not-allowed disabled:opacity-60",
							children: busy ? "Starting…" : "Start analysis"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onCancel,
							className: "inline-flex flex-1 items-center justify-center rounded-full border border-[#ddd6ca] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#5f584d] transition hover:bg-[#faf7f1]",
							children: "Cancel"
						})]
					})
				]
			})
		})
	});
}
function DetailScreen({ search, isAuthenticated = false, billing = null, onToggleBookmark, onRefresh, onTogglePause, onDelete, refreshing = false, bookmarkUpdating = false }) {
	const [visible, setVisible] = useState(PAGE_STEP);
	const [copied, setCopied] = useState(false);
	const [bookmarkingId, setBookmarkingId] = useState(null);
	const [items, setItems] = useState(search?.results ?? []);
	const [activePlayerId, setActivePlayerId] = useState(null);
	const [analysisStates, setAnalysisStates] = useState(() => buildAnalysisStates(search?.results ?? []));
	const [analysisModal, setAnalysisModal] = useState(null);
	const [pendingAnalysisVideo, setPendingAnalysisVideo] = useState(null);
	const sharedBilling = usePage().props?.billing ?? {};
	const billingState = billing ?? sharedBilling;
	const insights = search?.insights ?? {};
	insights.baseline?.median_views;
	const threshold = insights.baseline?.outlier_threshold ?? 3;
	const account = insights.account ?? null;
	const trend = insights.trend ?? null;
	const profile = account?.profile ?? {};
	const lastPulledLabel = formatInsightDate(search?.last_run_at);
	const videoAnalysisLimit = numericUsageValue(billingState?.videoAnalysisLimit, 0);
	const videoAnalysisUsed = numericUsageValue(billingState?.videoAnalysisUsed, 0);
	const creditsRemainingAfterUse = videoAnalysisLimit === -1 ? "unlimited" : Math.max(0, videoAnalysisLimit - videoAnalysisUsed - 1);
	const feedItems = items;
	const [winner, ...rest] = feedItems;
	const shown = rest.slice(0, visible);
	Math.max(...feedItems.map((v) => Number(v.outlier_multiple) || 0), 1);
	const serverTile = (key) => (insights.tiles ?? []).find((t) => t.key === key) ?? {};
	const multiples = items.map((v) => Number(v.outlier_multiple) || 0).filter((m) => m > 0);
	const avgScore = multiples.length ? multiples.reduce((a, b) => a + b, 0) / multiples.length : null;
	const nowPoint = trend?.points?.[trend.points.length - 1] ?? null;
	const tiles = [
		account?.followers > 0 ? {
			key: "followers",
			label: "followers",
			value: account.followers,
			format: "compact",
			deltaNode: profile.follower_growth_pct != null ? /* @__PURE__ */ jsxs("div", {
				className: `d ${profile.follower_growth_pct >= 0 ? "up" : "down"}`,
				children: [
					profile.follower_growth_pct >= 0 ? "↑" : "↓",
					" ",
					Math.abs(profile.follower_growth_pct),
					"% mo"
				]
			}) : /* @__PURE__ */ jsx("div", { className: "d" })
		} : {
			key: "videos",
			label: "videos matched",
			value: items.length,
			format: "count"
		},
		{
			key: "outliers",
			label: "outliers this week",
			value: nowPoint ? nowPoint.outliers : serverTile("outliers").value ?? null,
			format: "count"
		},
		{
			...serverTile("top_multiple"),
			label: "top outlier score"
		},
		{
			key: "avg_score",
			label: "avg score",
			value: avgScore,
			format: "multiple"
		},
		{
			...serverTile("avg_engagement"),
			label: "avg eng rate"
		}
	];
	const share = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2e3);
		} catch {}
	};
	useEffect(() => {
		setItems(search?.results ?? []);
		setAnalysisStates(buildAnalysisStates(search?.results ?? []));
	}, [search]);
	const applyAnalysisUpdate = (videoId, payload) => {
		if (!videoId) return;
		setAnalysisStates((current) => ({
			...current,
			[videoId]: {
				status: payload?.status ?? current[videoId]?.status ?? "idle",
				error: payload?.error_message ?? payload?.error ?? null,
				analysis: payload ?? current[videoId]?.analysis ?? null
			}
		}));
		setItems((current) => mergeAnalysisIntoItems(current, videoId, payload));
	};
	const toggleBookmark = async (video) => {
		if (!isAuthenticated) {
			window.location.assign("/auth/google");
			return;
		}
		try {
			setBookmarkingId(video.id);
			const payload = video.bookmarked ? await bookmarks.remove(video.id) : await bookmarks.save(video.id);
			setItems((current) => current.map((item) => item.id === video.id ? {
				...item,
				bookmarked: payload.bookmarked
			} : item));
		} catch (error) {
			if (error?.status === 422 || error?.status === 401) window.alert(error.payload?.errors?.billing?.[0] || error.payload?.errors?.auth?.[0] || error.message);
		} finally {
			setBookmarkingId(null);
		}
	};
	const startAnalysis = async (video) => {
		if (!isAuthenticated) {
			window.location.assign("/auth/google");
			return;
		}
		const currentStatus = analysisStates[video.id]?.status ?? "idle";
		if (currentStatus === "complete") {
			setAnalysisModal({
				video,
				analysis: analysisStates[video.id]?.analysis ?? null
			});
			return;
		}
		if (currentStatus === "processing") return;
		try {
			applyAnalysisUpdate(video.id, {
				status: "processing",
				error_message: null
			});
			const payload = await videoAnalysis.request(video.id);
			const nextStatus = payload?.analysis?.status ?? "processing";
			applyAnalysisUpdate(video.id, {
				...payload?.analysis ?? {},
				status: nextStatus
			});
		} catch (error) {
			applyAnalysisUpdate(video.id, {
				status: "failed",
				error_message: error?.message ?? "Could not start video analysis."
			});
			if (error?.status === 422 || error?.status === 401) {
				window.alert(error.payload?.errors?.billing?.[0] || error.payload?.errors?.auth?.[0] || error.message);
				return;
			}
			window.alert(error?.message || "Could not start video analysis.");
		}
	};
	const analyze = async (video) => {
		if (!isAuthenticated) {
			window.location.assign("/auth/google");
			return;
		}
		const currentStatus = analysisStates[video.id]?.status ?? "idle";
		if (currentStatus === "complete") {
			setAnalysisModal({
				video,
				analysis: analysisStates[video.id]?.analysis ?? null
			});
			return;
		}
		if (currentStatus === "processing") return;
		setPendingAnalysisVideo(video);
	};
	const confirmAnalyze = async () => {
		if (!pendingAnalysisVideo) return;
		const video = pendingAnalysisVideo;
		applyAnalysisUpdate(video.id, {
			status: "processing",
			error_message: null
		});
		setPendingAnalysisVideo(null);
		await startAnalysis(video);
	};
	useEffect(() => {
		const pendingIds = Object.entries(analysisStates).filter(([, state]) => state?.status === "processing").map(([id]) => id);
		if (pendingIds.length === 0) return;
		let cancelled = false;
		const timer = window.setInterval(async () => {
			const results = await Promise.all(pendingIds.map(async (id) => {
				try {
					return [id, (await videoAnalysis.get(id))?.analysis ?? null];
				} catch {
					return [id, null];
				}
			}));
			if (cancelled) return;
			results.forEach(([id, analysis]) => {
				if (!analysis) return;
				applyAnalysisUpdate(id, analysis);
			});
		}, 2500);
		return () => {
			cancelled = true;
			window.clearInterval(timer);
		};
	}, [analysisStates]);
	const closeAnalysisModal = () => setAnalysisModal(null);
	const handleModalAnalysisChange = (videoId, analysis) => {
		if (!videoId || !analysis) return;
		applyAnalysisUpdate(videoId, analysis);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "tracker",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "viewbar",
				children: /* @__PURE__ */ jsx("a", {
					href: "/bookmark",
					className: "tbtn",
					children: "← Back to library"
				})
			}),
			/* @__PURE__ */ jsx(TrackerHead, {
				search,
				account,
				lastRun: formatDate$1(search?.last_run_at),
				nextRun: formatDate$1(search?.next_run_at),
				onToggleWatchlist: onToggleBookmark,
				onShare: share,
				onTogglePause,
				onDelete,
				copied,
				watchlistUpdating: bookmarkUpdating
			}),
			/* @__PURE__ */ jsx(AiSummary, {
				summary: search?.ai_summary,
				generatedAt: search?.ai_summary_generated_at
			}),
			/* @__PURE__ */ jsx(SignalTiles, {
				tiles,
				deltas: insights.tile_deltas ?? {}
			}),
			items.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "gate",
				children: [
					/* @__PURE__ */ jsx("h2", { children: "No videos cleared the bar" }),
					/* @__PURE__ */ jsxs("p", { children: [
						"We scanned TikTok for ",
						/* @__PURE__ */ jsx("b", { children: search?.phrase }),
						" but nothing matched the phrase with a real creator behind it. Narrower phrases and brand names often do this - try a broader one, or run it again."
					] }),
					/* @__PURE__ */ jsx("div", {
						className: "acts",
						children: /* @__PURE__ */ jsx("button", {
							className: "tbtn primary",
							onClick: onRefresh,
							disabled: refreshing,
							children: refreshing ? "refreshing..." : "run it again"
						})
					})
				]
			}) : !isAuthenticated ? /* @__PURE__ */ jsxs("div", {
				className: "gate",
				children: [
					/* @__PURE__ */ jsx("h2", { children: "Sign in to view the matched videos" }),
					/* @__PURE__ */ jsxs("p", { children: [
						"We found ",
						items.length,
						" videos for this search. Continue with Google to unlock the winner, the ranked list, and outbound TikTok links."
					] }),
					/* @__PURE__ */ jsxs("div", {
						className: "acts",
						children: [/* @__PURE__ */ jsx("a", {
							href: "/auth/google",
							className: "tbtn primary",
							children: "continue with Google"
						}), billing?.trialEligible ?? true ? /* @__PURE__ */ jsx("a", {
							href: "/trial",
							className: "tbtn",
							children: "start free trial"
						}) : /* @__PURE__ */ jsx("button", {
							className: "tbtn",
							disabled: true,
							children: "trial unavailable"
						})]
					})
				]
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx(SectionHead, {
					title: "outlier videos",
					note: "their posts that beat the search median. ranked by outlier score."
				}),
				/* @__PURE__ */ jsx(WinnerVideo, {
					video: winner,
					onToggleBookmark: toggleBookmark,
					onAnalyze: analyze,
					bookmarking: bookmarkingId === winner?.id,
					analysisStatus: winner ? analysisStates[winner.id]?.status ?? "idle" : "idle",
					activePlayerId,
					onPlay: setActivePlayerId,
					onClose: () => setActivePlayerId(null)
				}),
				rest.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "sect-head",
						style: { marginTop: "34px" },
						children: [/* @__PURE__ */ jsx("h2", {
							style: { fontSize: "19px" },
							children: "more outliers"
						}), /* @__PURE__ */ jsxs("span", {
							className: "note",
							children: [rest.length, " more."]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "feed",
						children: shown.map((video, index) => /* @__PURE__ */ jsx(OutlierCard, {
							video,
							rank: index + 2,
							onToggleBookmark: toggleBookmark,
							onAnalyze: analyze,
							bookmarking: bookmarkingId === video.id,
							analysisStatus: analysisStates[video.id]?.status ?? "idle",
							activePlayerId,
							onPlay: setActivePlayerId,
							onClose: () => setActivePlayerId(null)
						}, video.id))
					}),
					/* @__PURE__ */ jsx("div", {
						className: "loadmore",
						children: /* @__PURE__ */ jsx("button", {
							className: "tbtn",
							disabled: visible >= rest.length,
							onClick: () => setVisible((v) => v + PAGE_STEP),
							children: visible >= rest.length ? "no more this week" : `load ${Math.min(PAGE_STEP, rest.length - visible)} more ↓`
						})
					})
				] }),
				/* @__PURE__ */ jsx(SectionHead, {
					title: "hashtags & sounds they use",
					note: "from the videos matched by this search."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "hs",
					children: [/* @__PURE__ */ jsx(HashtagPanel, { hashtags: insights.hashtags }), /* @__PURE__ */ jsx(SoundPanel, { sounds: insights.sounds })]
				}),
				/* @__PURE__ */ jsx(SectionHead, {
					title: lastPulledLabel ? `based on the data from videos pulled last ${lastPulledLabel}` : "based on the latest pulled videos",
					note: "this tracker, past 12 weeks."
				}),
				/* @__PURE__ */ jsx(PerformanceChart, { trend }),
				/* @__PURE__ */ jsx(SectionHead, {
					title: "When they post",
					note: "posting schedule by day and hour."
				}),
				/* @__PURE__ */ jsx(PostingHeatmap, { heatmap: insights.heatmap }),
				/* @__PURE__ */ jsx(SectionHead, {
					title: "More data",
					note: "how the tracker is moving."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "datagrid",
					children: [/* @__PURE__ */ jsx(OutliersPerWeek, {
						bars: trend?.outliers_per_week ?? [],
						threshold,
						totalOutliers: (insights.distribution ?? []).reduce((sum, row) => sum + row.count, 0),
						nextRunLabel: formatDate$1(search?.next_run_at)
					}), /* @__PURE__ */ jsx(ScoreDistribution, { distribution: insights.distribution ?? [] })]
				})
			] }),
			analysisModal && /* @__PURE__ */ jsx(AnalysisModal, {
				open: true,
				video: analysisModal.video,
				initialAnalysis: analysisModal.analysis,
				onClose: closeAnalysisModal,
				onAnalysisChange: handleModalAnalysisChange
			}),
			pendingAnalysisVideo && /* @__PURE__ */ jsx(AnalyzeConfirmModal, {
				video: pendingAnalysisVideo,
				creditsRemainingAfterUse,
				busy: false,
				onConfirm: confirmAnalyze,
				onCancel: () => setPendingAnalysisVideo(null)
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/SavedSearches/Show.jsx
var Show_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Show$1 });
/**
* The single detail view for every saved search — brand, competitor, and
* product all render the same analytics tracker (the one design identity).
*/
function Show$1({ search: initial, isAuthenticated = false, billing }) {
	const [search, setSearch] = useState(initial);
	const [refreshing, setRefreshing] = useState(false);
	const [bookmarkingSearch, setBookmarkingSearch] = useState(false);
	const refresh = async () => {
		setRefreshing(true);
		try {
			await savedSearch.refresh(search.id);
			router.visit(`/search/running?id=${search.id}`);
		} catch {
			setRefreshing(false);
		}
	};
	const remove = async () => {
		await savedSearch.destroy(search.id);
		router.visit("/bookmark");
	};
	const togglePause = async () => {
		const { search: updated } = search.status === "paused" ? await savedSearch.resume(search.id) : await savedSearch.pause(search.id);
		setSearch((prev) => ({
			...prev,
			...updated
		}));
	};
	const toggleBookmark = async () => {
		setBookmarkingSearch(true);
		try {
			const { search: updated } = await savedSearch.bookmark(search.id, !search.is_watchlisted);
			setSearch((prev) => ({
				...prev,
				...updated
			}));
		} finally {
			setBookmarkingSearch(false);
		}
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: `${search.name} · Brand Beacon` }), /* @__PURE__ */ jsx(AppLayout, {
		width: "max-w-[1240px]",
		children: /* @__PURE__ */ jsx(DetailScreen, {
			search,
			isAuthenticated,
			billing,
			refreshing,
			bookmarkUpdating: bookmarkingSearch,
			onRefresh: refresh,
			onToggleBookmark: toggleBookmark,
			onTogglePause: togglePause,
			onDelete: remove
		})
	})] });
}
//#endregion
//#region resources/js/Pages/Search/Keywords.jsx
var Keywords_exports = /* @__PURE__ */ __exportAll({ default: () => Keywords });
/**
* /search is the same wizard the dashboard hosts — it exists so a link with
* `?q=` can drop someone straight onto the keyword step, and so the sidebar
* search box has somewhere to point. Steps themselves never change the URL.
*/
function Keywords({ phrase = "", type = "brand" }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: phrase ? "Add keywords · Brand Beacon" : "Search · Brand Beacon" }), /* @__PURE__ */ jsx(AppLayout, {
		width: "max-w-4xl",
		children: /* @__PURE__ */ jsx(SearchWizard, {
			initialType: type,
			initialQuery: phrase
		})
	})] });
}
//#endregion
//#region resources/js/Pages/Search/Running.jsx
var Running_exports = /* @__PURE__ */ __exportAll({ default: () => Running });
function Running({ searchId }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Search running · Brand Beacon" }), /* @__PURE__ */ jsx(AppLayout, {
		width: "max-w-4xl",
		children: /* @__PURE__ */ jsx(RunningScreen, {
			searchId,
			onBack: () => router.visit("/bookmark"),
			onDone: () => router.visit(`/bookmark/${searchId}`)
		})
	})] });
}
//#endregion
//#region resources/js/Pages/Settings/Account.jsx
var Account_exports = /* @__PURE__ */ __exportAll({ default: () => Account });
var NOTIFICATIONS = [
	{
		key: "search_finished",
		title: "Search finished",
		desc: "Email me the moment a scrape is ready.",
		on: true
	},
	{
		key: "virality_alerts",
		title: "Virality alerts",
		desc: "Ping me when a tracked video crosses my threshold.",
		on: true
	},
	{
		key: "weekly_viral_digest",
		title: "Weekly viral digest",
		desc: "One email a week with what moved in my categories.",
		on: false
	}
];
function Account() {
	const { auth = {}, flash = {}, preferences = {}, accountDeletion = {} } = usePage().props;
	const initialNotifications = {
		...Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, n.on])),
		...preferences.notifications ?? {}
	};
	const scheduledDeletionDate = accountDeletion.scheduledFor ? new Date(accountDeletion.scheduledFor).toLocaleDateString(void 0, {
		year: "numeric",
		month: "long",
		day: "numeric"
	}) : null;
	const [prefs, setPrefs] = useState(() => initialNotifications);
	const form = useForm({ name: auth.user?.name ?? "" });
	const [savingPreferences, setSavingPreferences] = useState(false);
	const deletionForm = useForm({});
	const submit = (event) => {
		event.preventDefault();
		form.patch("/settings/account");
	};
	const togglePreference = (key) => {
		const next = !prefs[key];
		const nextNotifications = {
			...prefs,
			[key]: next
		};
		setPrefs(nextNotifications);
		setSavingPreferences(true);
		router.patch("/settings/account", {
			preferences: { notifications: nextNotifications },
			name: form.data.name
		}, {
			preserveScroll: true,
			preserveState: true,
			only: [
				"auth",
				"flash",
				"preferences",
				"subscription",
				"accountDeletion"
			],
			onFinish: () => setSavingPreferences(false)
		});
	};
	const requestDeletion = () => {
		if (!window.confirm("Schedule your account for deletion in 30 days? You can cancel the request any time before then.")) return;
		deletionForm.post("/settings/account/delete-request", { preserveScroll: true });
	};
	const cancelDeletion = () => {
		deletionForm.delete("/settings/account/delete-request", { preserveScroll: true });
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Account · Brand Beacon" }), /* @__PURE__ */ jsxs(SettingsShell, {
		section: "account",
		children: [
			flash.status && /* @__PURE__ */ jsx("div", {
				style: {
					marginBottom: 16,
					padding: "12px 16px",
					borderRadius: "var(--r)",
					background: "var(--ok-bg)",
					color: "var(--ok)",
					fontWeight: 600,
					fontSize: ".85rem"
				},
				children: flash.status
			}),
			/* @__PURE__ */ jsx("form", {
				className: "card",
				onSubmit: submit,
				children: /* @__PURE__ */ jsxs("div", {
					className: "card__p",
					children: [
						/* @__PURE__ */ jsx("h2", { children: "Account" }),
						/* @__PURE__ */ jsx("p", {
							className: "muted",
							style: {
								fontSize: ".86rem",
								marginTop: 6
							},
							children: "Your details and how we reach you."
						}),
						/* @__PURE__ */ jsxs("div", {
							style: { marginTop: 22 },
							className: "grid2",
							children: [/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("label", {
									className: "lbl",
									children: "Name"
								}),
								/* @__PURE__ */ jsx("input", {
									className: "fld",
									value: form.data.name,
									onChange: (e) => form.setData("name", e.target.value)
								}),
								form.errors.name && /* @__PURE__ */ jsx("p", {
									className: "hint",
									style: { color: "var(--warn)" },
									children: form.errors.name
								})
							] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
								className: "lbl",
								children: "Email"
							}), /* @__PURE__ */ jsx("input", {
								className: "fld",
								value: auth.user?.email ?? "",
								readOnly: true,
								style: { opacity: .7 }
							})] })]
						}),
						/* @__PURE__ */ jsx("div", {
							style: { marginTop: 22 },
							children: /* @__PURE__ */ jsx("button", {
								type: "submit",
								className: "btn btn--y",
								disabled: form.processing,
								children: form.processing ? "Saving…" : "Save changes"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "card",
				style: { marginTop: 16 },
				children: /* @__PURE__ */ jsxs("div", {
					className: "card__p",
					children: [/* @__PURE__ */ jsx("h2", { children: "Notifications" }), /* @__PURE__ */ jsx("div", {
						style: { marginTop: 8 },
						children: NOTIFICATIONS.map((n) => /* @__PURE__ */ jsxs("div", {
							className: "rowf",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "rowf__t",
								children: n.title
							}), /* @__PURE__ */ jsx("p", {
								className: "rowf__d",
								children: n.desc
							})] }), /* @__PURE__ */ jsx("button", {
								type: "button",
								role: "switch",
								"aria-checked": prefs[n.key],
								"aria-label": n.title,
								className: `sw${prefs[n.key] ? " on" : ""}`,
								onClick: () => togglePreference(n.key),
								disabled: savingPreferences
							})]
						}, n.key))
					})]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "card",
				style: {
					marginTop: 16,
					borderColor: "#F0D6C8"
				},
				children: /* @__PURE__ */ jsxs("div", {
					className: "card__p",
					children: [
						/* @__PURE__ */ jsx("h2", {
							style: { color: "var(--warn)" },
							children: "Delete account"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "muted",
							style: {
								fontSize: ".86rem",
								marginTop: 6
							},
							children: accountDeletion.hasActiveSubscription ? "Active subscriptions cannot be deleted yet. Cancel your subscription first, then come back here." : accountDeletion.scheduledFor ? `Your account is scheduled for deletion on ${scheduledDeletionDate}. You can still sign in and access your data until then.` : "This schedules your account for deletion in 30 days. Your searches, results, subscriptions, and account records stay intact during the grace period."
						}),
						/* @__PURE__ */ jsx("div", {
							style: { marginTop: 18 },
							children: accountDeletion.scheduledFor ? /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "btn btn--g",
								style: {
									color: "var(--warn)",
									borderColor: "#F0D6C8"
								},
								onClick: cancelDeletion,
								disabled: deletionForm.processing,
								children: deletionForm.processing ? "Saving…" : "Cancel account deletion"
							}) : /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "btn btn--g",
								style: {
									color: "var(--warn)",
									borderColor: "#F0D6C8"
								},
								onClick: requestDeletion,
								disabled: deletionForm.processing || accountDeletion.hasActiveSubscription,
								children: deletionForm.processing ? "Saving…" : "Delete my account"
							})
						})
					]
				})
			})
		]
	})] });
}
//#endregion
//#region resources/js/Pages/Settings/Appearance.jsx
var Appearance_exports = /* @__PURE__ */ __exportAll({ default: () => Appearance });
var TOGGLES = [
	{
		key: "disable_animations",
		title: "Reduce motion",
		desc: "Stop marquees and looping animations across the app.",
		on: false
	},
	{
		key: "compact_rows",
		title: "Compact rows",
		desc: "Tighter spacing in Library and results lists.",
		on: false
	},
	{
		key: "autoplay_previews",
		title: "Autoplay previews",
		desc: "Play video previews on hover in the results grid.",
		on: true
	}
];
function Appearance() {
	const { flash = {}, preferences = {} } = usePage().props;
	const initialAppearance = {
		...Object.fromEntries(TOGGLES.map((toggle) => [toggle.key, toggle.on])),
		...preferences.appearance ?? {}
	};
	const [prefs, setPrefs] = useState(() => initialAppearance);
	const [saving, setSaving] = useState(false);
	const togglePreference = (key) => {
		const next = !prefs[key];
		const nextAppearance = {
			...prefs,
			[key]: next
		};
		setPrefs(nextAppearance);
		setSaving(true);
		router.patch("/settings/appearance", { preferences: { appearance: nextAppearance } }, {
			preserveScroll: true,
			preserveState: true,
			only: ["flash", "preferences"],
			onFinish: () => setSaving(false)
		});
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Appearance · Brand Beacon" }), /* @__PURE__ */ jsxs(SettingsShell, {
		section: "appearance",
		children: [flash.status && /* @__PURE__ */ jsx("div", {
			style: {
				marginBottom: 16,
				padding: "12px 16px",
				borderRadius: "var(--r)",
				background: "var(--ok-bg)",
				color: "var(--ok)",
				fontWeight: 600,
				fontSize: ".85rem"
			},
			children: flash.status
		}), /* @__PURE__ */ jsx("div", {
			className: "card",
			children: /* @__PURE__ */ jsxs("div", {
				className: "card__p",
				children: [
					/* @__PURE__ */ jsx("h2", { children: "Appearance" }),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							fontSize: ".86rem",
							marginTop: 6
						},
						children: "Brand Beacon is light only — the dark theme was retired with the rebrand."
					}),
					/* @__PURE__ */ jsx("div", {
						style: { marginTop: 8 },
						children: TOGGLES.map((toggle) => /* @__PURE__ */ jsxs("div", {
							className: "rowf",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "rowf__t",
								children: toggle.title
							}), /* @__PURE__ */ jsx("p", {
								className: "rowf__d",
								children: toggle.desc
							})] }), /* @__PURE__ */ jsx("button", {
								type: "button",
								role: "switch",
								"aria-checked": prefs[toggle.key],
								"aria-label": toggle.title,
								className: `sw${prefs[toggle.key] ? " on" : ""}`,
								onClick: () => togglePreference(toggle.key),
								disabled: saving
							})]
						}, toggle.key))
					})
				]
			})
		})]
	})] });
}
//#endregion
//#region resources/js/Pages/Settings/Subscription.jsx
var Subscription_exports = /* @__PURE__ */ __exportAll({ default: () => Subscription });
function formatDate(iso) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
function ratio(used, limit) {
	if (!limit || limit < 0) return 0;
	return Math.min(100, Math.max(0, used / limit * 100));
}
function Subscription({ subscription }) {
	const limits = subscription?.limits ?? {};
	const searchLimit = limits.searchCreditsLimit ?? 0;
	const searchUsed = limits.searchCreditsUsed ?? 0;
	const videoBookmarkLimit = limits.videoBookmarkLimit ?? 0;
	const videoBookmarkUsed = limits.videoBookmarkUsed ?? 0;
	const searchBookmarkLimit = limits.searchBookmarkLimit ?? 0;
	const searchBookmarkUsed = limits.searchBookmarkUsed ?? 0;
	const videoAnalysisLimit = limits.videoAnalysisLimit ?? 0;
	const videoAnalysisUsed = limits.videoAnalysisUsed ?? 0;
	const planName = subscription?.planName ?? "Free";
	const status = subscription?.status ?? "free";
	const active = status === "active";
	const price = subscription?.price ?? 0;
	const interval = subscription?.interval ?? "month";
	const renews = formatDate(subscription?.renewsAt);
	const invoices = subscription?.invoices ?? [];
	const searchesLeft = searchLimit > 0 ? Math.max(0, searchLimit - searchUsed) : 0;
	const videoBookmarksUnlimited = videoBookmarkLimit === -1;
	const searchBookmarksUnlimited = searchBookmarkLimit === -1;
	const analysisUnlimited = videoAnalysisLimit === -1;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Subscription · Brand Beacon" }), /* @__PURE__ */ jsxs(SettingsShell, {
		section: "subscription",
		children: [/* @__PURE__ */ jsx("div", {
			className: "card",
			children: /* @__PURE__ */ jsxs("div", {
				className: "card__p",
				children: [
					/* @__PURE__ */ jsxs("div", {
						style: {
							display: "flex",
							alignItems: "flex-start",
							justifyContent: "space-between",
							gap: 18,
							flexWrap: "wrap"
						},
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", { children: planName }), /* @__PURE__ */ jsxs("p", {
							className: "muted",
							style: {
								fontSize: ".86rem",
								marginTop: 6
							},
							children: [price > 0 ? `$${price}/${interval}` : "Free plan", renews ? ` · renews ${renews}` : ""]
						})] }), /* @__PURE__ */ jsxs("span", {
							className: `pill ${active ? "pill--ok" : "pill--off"}`,
							children: [/* @__PURE__ */ jsx("i", {}), active ? "Active" : status]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							marginTop: 26,
							display: "flex",
							flexDirection: "column",
							gap: 20
						},
						children: [
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsxs("div", {
									style: {
										display: "flex",
										justifyContent: "space-between",
										fontSize: ".84rem",
										marginBottom: 8
									},
									children: [/* @__PURE__ */ jsx("span", {
										className: "muted",
										children: "Searches used"
									}), /* @__PURE__ */ jsxs("span", {
										style: {
											fontWeight: 700,
											color: "var(--ink)"
										},
										children: [
											searchUsed,
											" / ",
											searchLimit || 0
										]
									})]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "meter",
									children: /* @__PURE__ */ jsx("span", { style: { width: `${ratio(searchUsed, searchLimit)}%` } })
								}),
								searchLimit > 0 && /* @__PURE__ */ jsxs("p", {
									className: "hint",
									children: [
										searchesLeft,
										" search",
										searchesLeft === 1 ? "" : "es",
										" left this cycle",
										renews ? `. Resets ${renews}.` : "."
									]
								})
							] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									fontSize: ".84rem",
									marginBottom: 8
								},
								children: [/* @__PURE__ */ jsx("span", {
									className: "muted",
									children: "Video bookmarks used"
								}), /* @__PURE__ */ jsxs("span", {
									style: {
										fontWeight: 700,
										color: "var(--ink)"
									},
									children: [
										videoBookmarkUsed,
										" ",
										videoBookmarksUnlimited ? "" : `/ ${videoBookmarkLimit || 0}`
									]
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "meter",
								children: /* @__PURE__ */ jsx("span", { style: { width: videoBookmarksUnlimited ? "100%" : `${ratio(videoBookmarkUsed, videoBookmarkLimit)}%` } })
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									fontSize: ".84rem",
									marginBottom: 8
								},
								children: [/* @__PURE__ */ jsx("span", {
									className: "muted",
									children: "Search bookmarks used"
								}), /* @__PURE__ */ jsxs("span", {
									style: {
										fontWeight: 700,
										color: "var(--ink)"
									},
									children: [
										searchBookmarkUsed,
										" ",
										searchBookmarksUnlimited ? "" : `/ ${searchBookmarkLimit || 0}`
									]
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "meter",
								children: /* @__PURE__ */ jsx("span", { style: { width: searchBookmarksUnlimited ? "100%" : `${ratio(searchBookmarkUsed, searchBookmarkLimit)}%` } })
							})] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									fontSize: ".84rem",
									marginBottom: 8
								},
								children: [/* @__PURE__ */ jsx("span", {
									className: "muted",
									children: "Video analysis used"
								}), /* @__PURE__ */ jsxs("span", {
									style: {
										fontWeight: 700,
										color: "var(--ink)"
									},
									children: [
										videoAnalysisUsed,
										" ",
										analysisUnlimited ? "" : `/ ${videoAnalysisLimit || 0}`
									]
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "meter",
								children: /* @__PURE__ */ jsx("span", { style: { width: analysisUnlimited ? "100%" : `${ratio(videoAnalysisUsed, videoAnalysisLimit)}%` } })
							})] })
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						style: {
							marginTop: 26,
							display: "flex",
							gap: 9,
							flexWrap: "wrap"
						},
						children: [/* @__PURE__ */ jsx(Link, {
							href: "/plans",
							className: "btn btn--y",
							children: active ? "Change plan" : "Upgrade"
						}), /* @__PURE__ */ jsx(Link, {
							href: "/plans",
							className: "btn btn--g",
							children: "Manage billing"
						})]
					})
				]
			})
		}), invoices.length > 0 && /* @__PURE__ */ jsx("div", {
			className: "card",
			style: { marginTop: 16 },
			children: /* @__PURE__ */ jsxs("div", {
				className: "card__p",
				children: [/* @__PURE__ */ jsx("h2", { children: "Invoices" }), /* @__PURE__ */ jsx("div", {
					style: { marginTop: 8 },
					children: invoices.map((inv, i) => /* @__PURE__ */ jsxs("div", {
						className: "rowf",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "rowf__t",
							children: formatDate(inv.date) ?? inv.date
						}), /* @__PURE__ */ jsxs("p", {
							className: "rowf__d",
							children: [
								planName,
								" · ",
								interval,
								"ly"
							]
						})] }), /* @__PURE__ */ jsxs("span", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: 14
							},
							children: [/* @__PURE__ */ jsx("b", {
								style: {
									fontSize: ".88rem",
									color: "var(--ink)"
								},
								children: inv.amount
							}), inv.url && /* @__PURE__ */ jsx("a", {
								href: inv.url,
								className: "btn btn--g btn--sm",
								children: "Receipt"
							})]
						})]
					}, i))
				})]
			})
		})]
	})] });
}
//#endregion
//#region resources/js/landing/flow/screens/TrialScreen.jsx
function TrialScreen({ onBack, backLabel = "Back to results" }) {
	const { pricingPlans = [], auth = {} } = usePage().props;
	const tiers = (pricingPlans.length > 0 ? [...pricingPlans] : [...PRICING.monthly]).sort((a, b) => {
		const aKey = a.slug ?? a.name?.toLowerCase();
		const bKey = b.slug ?? b.name?.toLowerCase();
		const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
		const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);
		return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
	}).filter((t) => t.price > 0);
	const trialTier = tiers.find((t) => t.popular) || tiers[0];
	const startCheckout = (slug) => {
		if (!auth.signedIn) {
			window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(slug)}&trial=1`);
			return;
		}
		billing.trialCheckout(slug);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "animate-fade-up",
		children: [/* @__PURE__ */ jsxs("button", {
			onClick: onBack,
			className: "text-[13px] font-semibold muted transition hover:text-accent",
			children: [
				"<- ",
				" ",
				backLabel
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mx-auto mt-8 max-w-3xl text-center",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "eyebrow justify-center",
					children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " Subscription plans"]
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-4 font-display text-[30px] leading-tight font-bold tracking-[-.025em] sm:text-[40px]",
					children: "Unlock paid tracking"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-[14.5px] muted",
					children: "Start on a 7-day trial. Basic includes 150 searches, 50 video bookmarks, 50 search bookmarks, and 50 video analysis runs. Premium includes 400 searches and unlimited limits across those extras."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mx-auto mt-9 grid max-w-2xl gap-5 text-left sm:grid-cols-2",
					children: tiers.map((t) => /* @__PURE__ */ jsxs("div", {
						className: `relative rounded-3xl p-6 transition-all duration-300 ${t.popular ? "ring-gradient bg-white shadow-[0_40px_90px_-45px_rgba(109,75,255,.7)] dark:bg-white/[.06]" : "border border-black/[.06] bg-white hover:-translate-y-1 hover:border-accent/25 dark:border-white/[.08] dark:bg-white/[.03]"}`,
						children: [
							t.popular && /* @__PURE__ */ jsx("span", {
								className: "absolute -top-3 left-6 rounded-full bg-linear-to-r from-accent-glow to-accent px-3 py-1 text-[10.5px] font-bold tracking-wider text-white uppercase shadow-[0_8px_20px_-8px_rgba(109,75,255,1)]",
								children: "Most popular"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "font-display text-[16px] font-bold",
								children: t.name
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1 text-[12.5px] faint",
								children: t.tagline
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-3 font-display text-[32px] leading-none font-bold tracking-[-.03em]",
								children: "$0"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-2 min-h-[32px] text-[11.5px] leading-[1.35] faint",
								children: [
									"then $",
									t.price,
									" after 7 days"
								]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-4 text-[12px] faint",
								children: [
									t.searchCreditsLimit,
									" searches · ",
									t.searchBookmarkLimit === -1 ? "Unlimited" : t.searchBookmarkLimit,
									" search bookmarks"
								]
							}),
							/* @__PURE__ */ jsx("ul", {
								className: "mt-5 space-y-2.5 border-t border-black/[.05] pt-5 text-[13.5px] muted dark:border-white/[.07]",
								children: t.features.slice(0, 4).map((f) => /* @__PURE__ */ jsxs("li", {
									className: "flex gap-2.5",
									children: [/* @__PURE__ */ jsx("span", {
										className: "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent dark:text-accent-glow",
										children: /* @__PURE__ */ jsx(Check, { className: "h-2.5 w-2.5" })
									}), f]
								}, f))
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => startCheckout(t.slug),
								className: `mt-6 h-11 w-full text-sm ${t.popular ? "btn-accent" : "btn-ghost"}`,
								children: [
									"Start ",
									t.name,
									" trial ",
									/* @__PURE__ */ jsx(Arrow, {})
								]
							})
						]
					}, t.name))
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => startCheckout(trialTier.slug),
					className: "btn-accent mx-auto mt-9 h-[52px] px-8 text-[15px]",
					children: [
						"Start ",
						trialTier.name,
						" trial ",
						/* @__PURE__ */ jsx(Arrow, {})
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-4 text-xs faint",
					children: "Card details are collected up front, and billing starts after 7 days unless you cancel."
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Trial.jsx
var Trial_exports = /* @__PURE__ */ __exportAll({ default: () => Trial });
function Trial() {
	const { billing = {} } = usePage().props;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Start your trial - Outlier Vault" }), /* @__PURE__ */ jsx(AppLayout, {
		pill: {
			text: "Trial",
			tone: "accent"
		},
		width: "max-w-4xl",
		children: billing.trialEligible ?? true ? /* @__PURE__ */ jsx(TrialScreen, {
			backLabel: "Back to home",
			onBack: () => router.visit("/")
		}) : /* @__PURE__ */ jsxs("div", {
			className: "surface p-8 text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "font-display text-[28px] font-bold tracking-[-.03em]",
					children: "Trial unavailable"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-[14px] muted",
					children: "This account is already on a paid plan without trial access, so trial offers are hidden."
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: () => router.visit("/plans"),
					className: "btn-accent mx-auto mt-6 h-11 px-5 text-[13px]",
					children: "Back to plans"
				})
			]
		})
	})] });
}
//#endregion
//#region resources/js/Pages/VideoAnalysis/Show.jsx
var Show_exports = /* @__PURE__ */ __exportAll({ default: () => Show });
function closeModal() {
	if (window.history.length > 1) {
		window.history.back();
		return;
	}
	window.location.assign("/bookmark");
}
function Show({ video, analysis: initialAnalysis, tabs }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: `Video Analysis · ${video.handle ?? video.creator_name ?? "TikTok"}` }), /* @__PURE__ */ jsx(AppLayout, {
		width: "max-w-[1400px]",
		children: /* @__PURE__ */ jsx(AnalysisModal, {
			video,
			initialAnalysis,
			tabs,
			onClose: closeModal
		})
	})] });
}
//#endregion
//#region resources/js/ssr.jsx
createServer((page) => createInertiaApp({
	page,
	render: renderToString,
	resolve: (name) => {
		return (/* @__PURE__ */ Object.assign({
			"./Pages/Admin/Dashboard.jsx": Dashboard_exports$1,
			"./Pages/Admin/Listing.jsx": Listing_exports,
			"./Pages/Admin/Login.jsx": Login_exports$1,
			"./Pages/Admin/components/AdminLayout.jsx": AdminLayout_exports,
			"./Pages/Auth/Login.jsx": Login_exports,
			"./Pages/Auth/Register.jsx": Register_exports,
			"./Pages/Brands.jsx": Brands_exports,
			"./Pages/ComingSoon.jsx": ComingSoon_exports,
			"./Pages/Contact.jsx": Contact_exports,
			"./Pages/Dashboard.jsx": Dashboard_exports,
			"./Pages/Home.jsx": Home_exports,
			"./Pages/Landing.jsx": Landing_exports,
			"./Pages/LandingContact.jsx": LandingContact_exports,
			"./Pages/Plans.jsx": Plans_exports,
			"./Pages/Products.jsx": Products_exports,
			"./Pages/SavedSearches/Index.jsx": Index_exports,
			"./Pages/SavedSearches/Show.jsx": Show_exports$1,
			"./Pages/SavedSearches/detail/Badges.jsx": Badges_exports,
			"./Pages/SavedSearches/detail/DetailScreen.jsx": DetailScreen_exports,
			"./Pages/SavedSearches/detail/InsightPanels.jsx": InsightPanels_exports,
			"./Pages/SavedSearches/detail/OutlierVideos.jsx": OutlierVideos_exports,
			"./Pages/SavedSearches/detail/TrendPanels.jsx": TrendPanels_exports,
			"./Pages/Search/Keywords.jsx": Keywords_exports,
			"./Pages/Search/Running.jsx": Running_exports,
			"./Pages/Settings/Account.jsx": Account_exports,
			"./Pages/Settings/Appearance.jsx": Appearance_exports,
			"./Pages/Settings/SettingsShell.jsx": SettingsShell_exports,
			"./Pages/Settings/Subscription.jsx": Subscription_exports,
			"./Pages/Trial.jsx": Trial_exports,
			"./Pages/VideoAnalysis/AnalysisModal.jsx": AnalysisModal_exports,
			"./Pages/VideoAnalysis/Show.jsx": Show_exports,
			"./Pages/components/AppFooter.jsx": AppFooter_exports,
			"./Pages/components/AppLayout.jsx": AppLayout_exports,
			"./Pages/components/EntitlementsBar.jsx": EntitlementsBar_exports,
			"./Pages/components/SavedSearchRow.jsx": SavedSearchRow_exports,
			"./Pages/components/SearchLauncher.jsx": SearchLauncher_exports,
			"./Pages/components/SearchListScreen.jsx": SearchListScreen_exports,
			"./Pages/components/SearchWizard.jsx": SearchWizard_exports,
			"./Pages/components/VideoCard.jsx": VideoCard_exports
		}))[`./Pages/${name}.jsx`];
	},
	setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
}));
//#endregion
export {};
