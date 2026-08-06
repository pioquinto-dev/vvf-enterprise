import { Head, createInertiaApp, usePage } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
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
//#region resources/js/Pages/Home.jsx
var Home_exports = /* @__PURE__ */ __exportAll({ default: () => Home });
function Home({ stack, integrations }) {
	const { props } = usePage();
	const status = props.flash?.status;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Project Base" }), /* @__PURE__ */ jsx("main", {
		className: "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_32%),linear-gradient(160deg,_#0c0a09,_#1c1917_55%,_#0f172a)]",
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10",
			children: [/* @__PURE__ */ jsxs("section", {
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
			}), /* @__PURE__ */ jsxs("section", {
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
			})]
		})
	})] });
}
//#endregion
//#region resources/js/ssr.jsx
createServer((page) => createInertiaApp({
	page,
	render: renderToString,
	resolve: (name) => {
		return (/* @__PURE__ */ Object.assign({ "./Pages/Home.jsx": Home_exports }))[`./Pages/${name}.jsx`];
	},
	setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
}));
//#endregion
export {};
