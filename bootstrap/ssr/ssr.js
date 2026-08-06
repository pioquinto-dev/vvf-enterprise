import { Head, Link, createInertiaApp, router, useForm, usePage } from "@inertiajs/react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Log in — VVF" }), /* @__PURE__ */ jsxs("div", {
		className: "vvf-landing relative min-h-screen overflow-hidden px-4 py-10 sm:px-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 -z-10",
				children: [/* @__PURE__ */ jsx("div", { className: "bg-grid mask-radial-fade absolute inset-0" }), /* @__PURE__ */ jsx("div", { className: "absolute top-[-10%] left-1/2 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-accent/18 blur-[140px]" })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto flex max-w-5xl items-center justify-between",
				children: [/* @__PURE__ */ jsx(Link, {
					href: "/",
					className: "font-display text-[20px] font-bold tracking-[-.02em]",
					children: "VVF"
				}), /* @__PURE__ */ jsx(Link, {
					href: "/register",
					className: "btn-ghost h-10 px-4 text-sm",
					children: "Create account"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("p", {
						className: "eyebrow",
						children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " Account access"]
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-4 font-display text-[36px] font-bold tracking-[-.03em] sm:text-[52px]",
						children: "Log in to your VVF workspace"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-5 max-w-xl text-[15px] leading-relaxed muted sm:text-[16px]",
						children: "Access saved searches, plan limits, bookmarks, and billing. Google sign-in can still be added later, but your email and password flow works independently."
					})
				] }), /* @__PURE__ */ jsxs("div", {
					className: "rounded-[28px] border border-black/[.06] bg-white/78 p-7 shadow-[0_30px_90px_-50px_rgba(16,18,32,.45)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-8",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display text-[24px] font-bold",
							children: "Welcome back"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[13.5px] muted",
							children: "Use your email and password to continue."
						}),
						flash.status && /* @__PURE__ */ jsx("div", {
							className: "mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300",
							children: flash.status
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: submit,
							className: "mt-6 space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint",
										children: "Email"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "email",
										value: form.data.email,
										onChange: (event) => form.setData("email", event.target.value),
										className: "w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]",
										placeholder: "you@company.com",
										autoComplete: "email"
									}),
									form.errors.email && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-hot",
										children: form.errors.email
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint",
										children: "Password"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "password",
										value: form.data.password,
										onChange: (event) => form.setData("password", event.target.value),
										className: "w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]",
										placeholder: "Your password",
										autoComplete: "current-password"
									}),
									form.errors.password && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-hot",
										children: form.errors.password
									})
								] }),
								/* @__PURE__ */ jsxs("label", {
									className: "flex items-center gap-3 text-[13px] muted",
									children: [/* @__PURE__ */ jsx("input", {
										type: "checkbox",
										checked: form.data.remember,
										onChange: (event) => form.setData("remember", event.target.checked),
										className: "h-4 w-4 rounded border-black/[.15]"
									}), "Keep me signed in"]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: form.processing,
									className: "btn-accent h-12 w-full text-sm",
									children: form.processing ? "Logging in…" : "Log in"
								})
							]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-5 text-center text-[13px] muted",
							children: [
								"Need an account?",
								" ",
								/* @__PURE__ */ jsx(Link, {
									href: "/register",
									className: "font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow",
									children: "Sign up"
								})
							]
						})
					]
				})]
			})
		]
	})] });
}
//#endregion
//#region resources/js/Pages/Auth/Register.jsx
var Register_exports = /* @__PURE__ */ __exportAll({ default: () => Register });
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Create account — VVF" }), /* @__PURE__ */ jsxs("div", {
		className: "vvf-landing relative min-h-screen overflow-hidden px-4 py-10 sm:px-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 -z-10",
				children: [/* @__PURE__ */ jsx("div", { className: "bg-grid mask-radial-fade absolute inset-0" }), /* @__PURE__ */ jsx("div", { className: "absolute top-[-10%] left-1/2 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-hot/12 blur-[150px]" })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto flex max-w-5xl items-center justify-between",
				children: [/* @__PURE__ */ jsx(Link, {
					href: "/",
					className: "font-display text-[20px] font-bold tracking-[-.02em]",
					children: "VVF"
				}), /* @__PURE__ */ jsx(Link, {
					href: "/login",
					className: "btn-ghost h-10 px-4 text-sm",
					children: "Log in"
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto mt-14 grid max-w-5xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("p", {
						className: "eyebrow",
						children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " New account"]
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-4 font-display text-[36px] font-bold tracking-[-.03em] sm:text-[52px]",
						children: "Create your VVF account"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-5 max-w-xl text-[15px] leading-relaxed muted sm:text-[16px]",
						children: "Start with email and password, then choose a plan when you’re ready. Any guest searches you ran in this session will be attached to your account after sign-in."
					})
				] }), /* @__PURE__ */ jsxs("div", {
					className: "rounded-[28px] border border-black/[.06] bg-white/78 p-7 shadow-[0_30px_90px_-50px_rgba(16,18,32,.45)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-8",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display text-[24px] font-bold",
							children: "Create account"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[13.5px] muted",
							children: "Use a normal email/password login or add Google later."
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: submit,
							className: "mt-6 space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint",
										children: "Name"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "text",
										value: form.data.name,
										onChange: (event) => form.setData("name", event.target.value),
										className: "w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]",
										placeholder: "Your name",
										autoComplete: "name"
									}),
									form.errors.name && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-hot",
										children: form.errors.name
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint",
										children: "Email"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "email",
										value: form.data.email,
										onChange: (event) => form.setData("email", event.target.value),
										className: "w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]",
										placeholder: "you@company.com",
										autoComplete: "email"
									}),
									form.errors.email && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-hot",
										children: form.errors.email
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint",
										children: "Password"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "password",
										value: form.data.password,
										onChange: (event) => form.setData("password", event.target.value),
										className: "w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]",
										placeholder: "Choose a password",
										autoComplete: "new-password"
									}),
									form.errors.password && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-hot",
										children: form.errors.password
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint",
									children: "Confirm password"
								}), /* @__PURE__ */ jsx("input", {
									type: "password",
									value: form.data.password_confirmation,
									onChange: (event) => form.setData("password_confirmation", event.target.value),
									className: "w-full rounded-2xl border border-black/[.08] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-accent/45 dark:border-white/[.12] dark:bg-white/[.04]",
									placeholder: "Repeat your password",
									autoComplete: "new-password"
								})] }),
								/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: form.processing,
									className: "btn-accent h-12 w-full text-sm",
									children: form.processing ? "Creating account…" : "Create account"
								})
							]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-5 text-center text-[13px] muted",
							children: [
								"Already have an account?",
								" ",
								/* @__PURE__ */ jsx(Link, {
									href: "/login",
									className: "font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow",
									children: "Log in"
								})
							]
						})
					]
				})]
			})
		]
	})] });
}
//#endregion
//#region resources/js/Pages/Dashboard.jsx
var Dashboard_exports = /* @__PURE__ */ __exportAll({ default: () => Dashboard });
var TOP_NAV = [
	{
		label: "Dashboard",
		href: "/dashboard"
	},
	{
		label: "Saved searches",
		href: "/saved-searches"
	},
	{
		label: "Pricing",
		href: "/trial"
	}
];
var FOOT_NAV = [
	{
		label: "Home",
		href: "/"
	},
	{
		label: "Saved searches",
		href: "/saved-searches"
	},
	{
		label: "Trial",
		href: "/trial"
	}
];
function Dashboard() {
	const { auth = {}, billing = {}, flash = {} } = usePage().props;
	const logout = useForm({});
	const signOut = () => {
		logout.post("/logout");
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Dashboard — VVF" }), /* @__PURE__ */ jsxs("div", {
		className: "vvf-landing relative min-h-screen overflow-hidden",
		children: [
			/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 -z-10",
				children: [/* @__PURE__ */ jsx("div", { className: "bg-grid mask-radial-fade absolute inset-0" }), /* @__PURE__ */ jsx("div", { className: "absolute top-[-12%] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent/14 blur-[150px]" })]
			}),
			/* @__PURE__ */ jsx("header", {
				className: "border-b border-black/[.06] bg-canvas/80 backdrop-blur-xl dark:border-white/[.08] dark:bg-canvas-dark/80",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8",
					children: [
						/* @__PURE__ */ jsx(Link, {
							href: "/dashboard",
							className: "font-display text-[20px] font-bold tracking-[-.025em]",
							children: "VVF"
						}),
						/* @__PURE__ */ jsx("nav", {
							className: "hidden items-center gap-2 md:flex",
							children: TOP_NAV.map((item) => /* @__PURE__ */ jsx(Link, {
								href: item.href,
								className: `rounded-xl px-4 py-2 text-[13px] font-semibold transition ${item.href === "/dashboard" ? "bg-black/[.06] text-ink dark:bg-white/[.08] dark:text-white" : "muted hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.05] dark:hover:text-white"}`,
								children: item.label
							}, item.href))
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: signOut,
							className: "btn-ghost h-10 px-4 text-sm",
							disabled: logout.processing,
							children: logout.processing ? "Signing out…" : "Log out"
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("main", {
				className: "mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8",
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid gap-6 lg:grid-cols-[1.3fr_.7fr]",
					children: [/* @__PURE__ */ jsxs("section", {
						className: "rounded-[28px] border border-black/[.06] bg-white/78 p-7 shadow-[0_30px_90px_-55px_rgba(16,18,32,.45)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-8",
						children: [
							/* @__PURE__ */ jsxs("p", {
								className: "eyebrow",
								children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " Dashboard"]
							}),
							/* @__PURE__ */ jsxs("h1", {
								className: "mt-4 font-display text-[32px] font-bold tracking-[-.03em] sm:text-[42px]",
								children: [
									"Welcome back",
									auth.user?.name ? `, ${auth.user.name}` : "",
									"."
								]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-4 max-w-2xl text-[15px] leading-relaxed muted",
								children: "This is your account home. From here you can head to saved searches, review your plan state, and later plug in billing, bookmarks, and account settings without changing the overall shell."
							}),
							flash.status && /* @__PURE__ */ jsx("div", {
								className: "mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300",
								children: flash.status
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "rounded-2xl border border-black/[.06] bg-black/[.02] p-4 dark:border-white/[.08] dark:bg-white/[.04]",
										children: [/* @__PURE__ */ jsx("p", {
											className: "text-[12px] font-semibold uppercase tracking-[.14em] faint",
											children: "Current plan"
										}), /* @__PURE__ */ jsx("p", {
											className: "mt-3 font-display text-[24px] font-bold capitalize",
											children: billing.currentPlan ?? "free"
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "rounded-2xl border border-black/[.06] bg-black/[.02] p-4 dark:border-white/[.08] dark:bg-white/[.04]",
										children: [/* @__PURE__ */ jsx("p", {
											className: "text-[12px] font-semibold uppercase tracking-[.14em] faint",
											children: "Credits remaining"
										}), /* @__PURE__ */ jsxs("p", {
											className: "mt-3 font-display text-[24px] font-bold",
											children: [billing.searchCreditsRemaining ?? 0, typeof billing.searchCreditsLimit === "number" ? ` / ${billing.searchCreditsLimit}` : ""]
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "rounded-2xl border border-black/[.06] bg-black/[.02] p-4 dark:border-white/[.08] dark:bg-white/[.04]",
										children: [/* @__PURE__ */ jsx("p", {
											className: "text-[12px] font-semibold uppercase tracking-[.14em] faint",
											children: "Bookmarks"
										}), /* @__PURE__ */ jsxs("p", {
											className: "mt-3 font-display text-[24px] font-bold",
											children: [billing.bookmarkCount ?? 0, billing.bookmarkLimit === -1 ? "" : ` / ${billing.bookmarkLimit ?? 0}`]
										})]
									})
								]
							})
						]
					}), /* @__PURE__ */ jsxs("aside", {
						className: "rounded-[28px] border border-black/[.06] bg-white/78 p-7 shadow-[0_30px_90px_-55px_rgba(16,18,32,.45)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-8",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "font-display text-[22px] font-bold",
								children: "Quick links"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-5 space-y-3",
								children: [
									/* @__PURE__ */ jsx(Link, {
										href: "/saved-searches",
										className: "btn-accent h-11 w-full justify-center text-sm",
										children: "Open saved searches"
									}),
									/* @__PURE__ */ jsx(Link, {
										href: "/trial",
										className: "btn-ghost h-11 w-full justify-center text-sm",
										children: "View plans"
									}),
									/* @__PURE__ */ jsx(Link, {
										href: "/",
										className: "btn-ghost h-11 w-full justify-center text-sm",
										children: "Run a new search"
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-8 rounded-2xl border border-black/[.06] bg-black/[.02] p-4 dark:border-white/[.08] dark:bg-white/[.04]",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-[12px] font-semibold uppercase tracking-[.14em] faint",
									children: "Signed in as"
								}), /* @__PURE__ */ jsx("p", {
									className: "mt-3 text-[14px] font-semibold",
									children: auth.user?.email ?? "Unknown account"
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "border-t border-black/[.06] bg-canvas/80 backdrop-blur-xl dark:border-white/[.08] dark:bg-canvas-dark/80",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8",
					children: [/* @__PURE__ */ jsx("nav", {
						className: "flex flex-wrap items-center gap-2",
						children: FOOT_NAV.map((item) => /* @__PURE__ */ jsx(Link, {
							href: item.href,
							className: "rounded-xl px-3 py-2 text-[13px] font-semibold muted transition hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.05] dark:hover:text-white",
							children: item.label
						}, item.href))
					}), /* @__PURE__ */ jsx("p", {
						className: "text-[12px] faint",
						children: "VVF dashboard shell"
					})]
				})
			})
		]
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
/** Convenience wrapper: <Reveal delay={120}>…</Reveal> */
function Reveal({ delay = 0, as: Tag = "div", className = "", children, ...rest }) {
	return /* @__PURE__ */ jsx(Tag, {
		"data-reveal": "",
		style: { "--reveal-delay": `${delay}ms` },
		className,
		...rest,
		children
	});
}
//#endregion
//#region resources/js/landing/components/Icons.jsx
var Logo = ({ className = "h-7 w-7" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 24 24",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [/* @__PURE__ */ jsx("rect", {
		width: "24",
		height: "24",
		rx: "7",
		fill: "#5b34f5"
	}), /* @__PURE__ */ jsx("path", {
		d: "M5 15.5 L9 10.5 L12 13 L16 6.5 L19 9.5",
		stroke: "#fff",
		strokeWidth: "2.1",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	})]
});
var Mascot = ({ className = "h-14 w-14" }) => /* @__PURE__ */ jsxs("svg", {
	viewBox: "0 0 64 64",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: [
		/* @__PURE__ */ jsx("rect", {
			x: "10",
			y: "14",
			width: "44",
			height: "38",
			rx: "12",
			fill: "#5b34f5"
		}),
		/* @__PURE__ */ jsx("rect", {
			x: "16",
			y: "20",
			width: "32",
			height: "20",
			rx: "8",
			fill: "#fff"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "26",
			cy: "30",
			r: "5",
			fill: "#16171d"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "27.6",
			cy: "28.4",
			r: "1.5",
			fill: "#fff"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "40",
			cy: "30",
			r: "3.4",
			fill: "#16171d"
		}),
		/* @__PURE__ */ jsx("path", {
			d: "M24 46 q8 5 16 0",
			stroke: "#fff",
			strokeWidth: "2.2",
			strokeLinecap: "round",
			fill: "none"
		}),
		/* @__PURE__ */ jsx("line", {
			x1: "32",
			y1: "14",
			x2: "32",
			y2: "7",
			stroke: "#5b34f5",
			strokeWidth: "2.4",
			strokeLinecap: "round"
		}),
		/* @__PURE__ */ jsx("circle", {
			cx: "32",
			cy: "5",
			r: "3",
			fill: "#ff3d71"
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
var Moon = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 24 24",
	fill: "none",
	className,
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", {
		d: "M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z",
		stroke: "currentColor",
		strokeWidth: "1.8",
		strokeLinejoin: "round"
	})
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
//#endregion
//#region resources/js/landing/components/ThemeToggle.jsx
function ThemeToggle({ theme, onToggle, className = "" }) {
	const isDark = theme === "dark";
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: onToggle,
		"aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
		title: isDark ? "Light mode" : "Dark mode",
		className: `relative inline-flex h-9 w-[62px] shrink-0 items-center rounded-full border
        border-black/10 bg-black/[.04] p-1 transition-colors
        dark:border-white/15 dark:bg-white/[.06] ${className}`,
		children: [/* @__PURE__ */ jsx("span", { className: `absolute h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-300
          dark:bg-accent ${isDark ? "translate-x-[26px]" : "translate-x-0"}` }), /* @__PURE__ */ jsxs("span", {
			className: "relative z-10 flex w-full items-center justify-between px-[7px]",
			children: [/* @__PURE__ */ jsx(Sun, { className: `h-3.5 w-3.5 transition-colors ${isDark ? "text-white/40" : "text-amber-500"}` }), /* @__PURE__ */ jsx(Moon, { className: `h-3.5 w-3.5 transition-colors ${isDark ? "text-white" : "text-ink/35"}` })]
		})]
	});
}
//#endregion
//#region resources/js/landing/data/dummy.js
var NAV_LINKS = [
	{
		label: "Features",
		href: "#top"
	},
	{
		label: "Pricing",
		href: "#top"
	},
	{
		label: "Blog",
		href: "#top"
	},
	{
		label: "Consulting",
		href: "#top"
	},
	{
		label: "Affiliate",
		href: "#top"
	},
	{
		label: "Extension",
		href: "#top"
	}
];
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
		title: "Viral Video Finder",
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
		body: "Point VVF at a competitor and get a running feed of every video mentioning them — organic creator posts, affiliate content, and paid spark ads alike.",
		bullets: [
			"Unlimited competitor watchlists",
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
		body: "Save the search and VVF re-runs it on a schedule, emailing you only what is new."
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
		quote: "The outlier scoring is the part that matters. Big accounts posting mediocre videos are noise. VVF filters those out by default.",
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
			"Last 90 days",
			"Top 100 viral videos"
		],
		searchCreditsLimit: 1,
		searchCreditsUsed: 0,
		bookmarkLimit: 0,
		bookmarksUsed: 0
	},
	{
		slug: "basic",
		name: "Basic",
		price: 79,
		tagline: "For a single brand.",
		cta: "Start 10 day trial",
		popular: true,
		features: [
			"150 searches",
			"Weekly + monthly scheduling",
			"CSV export for reports",
			"Virality alerts",
			"2 user seats"
		],
		searchCreditsLimit: 150,
		searchCreditsUsed: 0,
		bookmarkLimit: 50,
		bookmarksUsed: 0
	},
	{
		slug: "premium",
		name: "Premium",
		price: 199,
		tagline: "For brand and agency teams.",
		cta: "Choose Premium",
		features: [
			"400 searches",
			"Weekly + monthly scheduling",
			"Virality alerts",
			"CSV export for reports",
			"10 user seats"
		],
		searchCreditsLimit: 400,
		searchCreditsUsed: 0,
		bookmarkLimit: -1,
		bookmarksUsed: 0
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
		a: "On Basic and above, each tracked search can watch a competitor continuously. Add them to a watchlist and VVF re-runs on your schedule, sending only what changed since last time."
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
var FOOTER_LINKS = [
	{
		heading: "Product",
		links: [
			"Viral Video Finder",
			"Competitor Tracking",
			"Creator Shortlists",
			"Virality Alerts",
			"Changelog"
		]
	},
	{
		heading: "Company",
		links: [
			"About",
			"Careers",
			"Blog",
			"Press kit",
			"Contact"
		]
	},
	{
		heading: "Resources",
		links: [
			"TikTok benchmarks",
			"Category reports",
			"Help center",
			"API docs",
			"Status"
		]
	},
	{
		heading: "Legal",
		links: [
			"Terms",
			"Privacy",
			"DPA",
			"Security"
		]
	}
];
var SEARCH_TYPES = {
	brand: {
		key: "brand",
		label: "Your brand",
		placeholder: "Enter your complete brand name",
		sectionHeading: "Add terms to expand on your brand",
		sample: "GoPure",
		keywords: [
			"beauty",
			"skincare",
			"eye gel",
			"serum",
			"reviews",
			"routine"
		]
	},
	competitor: {
		key: "competitor",
		label: "Competitor",
		placeholder: "Enter one competitor",
		sectionHeading: "Add terms to expand on this competitor",
		sample: "Glossier",
		keywords: [
			"review",
			"dupe",
			"haul",
			"grwm",
			"vs",
			"viral"
		]
	},
	product: {
		key: "product",
		label: "Product",
		placeholder: "Enter one product",
		sectionHeading: "Add terms to expand on this product",
		sample: "lip oil",
		keywords: [
			"review",
			"how to use",
			"before after",
			"dupe",
			"results",
			"viral"
		]
	}
};
var RESULT_VIDEOS = [
	{
		rank: 1,
		views: "4.2M",
		likes: "512K",
		comments: "3.1K",
		duration: "0:14",
		posted: "6 days ago",
		handle: "@glossier",
		caption: "“the only 3 products i use for that glazed donut skin” · grwm using the skin tint + balm",
		multiplier: "18x",
		gradient: "from-[#3a2b6b] to-[#8b3df0]"
	},
	{
		rank: 2,
		views: "3.1M",
		likes: "401K",
		comments: "2.4K",
		duration: "0:21",
		posted: "9 days ago",
		handle: "@glowwithtay",
		caption: "i tried the viral serum for 30 days — honest before and after",
		multiplier: "12x",
		gradient: "from-[#0f3d5c] to-[#2aa7c4]"
	},
	{
		rank: 3,
		views: "2.8M",
		likes: "388K",
		comments: "1.9K",
		duration: "0:09",
		posted: "3 days ago",
		handle: "@cleangirl.ari",
		caption: "the 9 second routine that replaced my whole shelf",
		multiplier: "22x",
		gradient: "from-[#5c1030] to-[#ff3d71]"
	},
	{
		rank: 4,
		views: "1.9M",
		likes: "260K",
		comments: "1.2K",
		duration: "0:17",
		posted: "12 days ago",
		handle: "@glossier",
		caption: "restocking the shelf · what actually sold out this month",
		multiplier: "7x",
		gradient: "from-[#173a2a] to-[#3fbf7a]"
	},
	{
		rank: 5,
		views: "1.4M",
		likes: "190K",
		comments: "880",
		duration: "0:12",
		posted: "5 days ago",
		handle: "@mua.jess",
		caption: "pro makeup artist reacts to the drugstore dupe everyone is buying",
		multiplier: "9x",
		gradient: "from-[#4a3410] to-[#e0a83a]"
	},
	{
		rank: 6,
		views: "1.1M",
		likes: "142K",
		comments: "640",
		duration: "0:28",
		posted: "2 days ago",
		handle: "@thatskinguy",
		caption: "dermatologist breaks down the ingredient list line by line",
		multiplier: "15x",
		gradient: "from-[#2b1b52] to-[#5b34f5]"
	},
	{
		rank: 7,
		views: "980K",
		likes: "121K",
		comments: "512",
		duration: "0:11",
		posted: "8 days ago",
		handle: "@budgetbeautybri",
		caption: "everything under $20 that actually works · part 4",
		multiplier: "6x",
		gradient: "from-[#123a4a] to-[#37c8a0]"
	},
	{
		rank: 8,
		views: "870K",
		likes: "104K",
		comments: "470",
		duration: "0:19",
		posted: "11 days ago",
		handle: "@nightshiftnurse",
		caption: "12 hour shift skin check · what survived",
		multiplier: "11x",
		gradient: "from-[#4a1240] to-[#d13fb0]"
	}
];
//#endregion
//#region resources/js/landing/sections/Nav.jsx
function Nav({ theme, onToggleTheme, onStart }) {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return /* @__PURE__ */ jsxs("header", {
		className: "sticky top-0 z-50",
		children: [/* @__PURE__ */ jsx("div", {
			className: `transition-all duration-500 ${scrolled ? "border-b border-black/[.06] bg-canvas/88 backdrop-blur-xl dark:border-white/[.07] dark:bg-canvas-dark/88" : "border-b border-transparent"}`,
			children: /* @__PURE__ */ jsxs("div", {
				className: "mx-auto grid h-[74px] max-w-page grid-cols-[auto_1fr_auto] items-center gap-8 px-4 sm:px-6 lg:px-8",
				children: [
					/* @__PURE__ */ jsxs("a", {
						href: "#top",
						className: "group flex shrink-0 items-center gap-3 font-display text-[17px] font-bold",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(Logo, {}), /* @__PURE__ */ jsx("span", {
								"aria-hidden": true,
								className: "absolute inset-0 rounded-[7px] bg-accent/50 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
							})]
						}), "VVF"]
					}),
					/* @__PURE__ */ jsx("nav", {
						className: "hidden items-center justify-center gap-7 xl:flex",
						children: NAV_LINKS.map((l) => /* @__PURE__ */ jsx("a", {
							href: l.href,
							className: "py-2 text-[15px] font-medium text-ink/76 transition-all duration-300 hover:text-ink dark:text-white/72 dark:hover:text-white",
							children: l.label
						}, l.href))
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-end gap-3 sm:gap-4",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "hidden xl:block",
								children: /* @__PURE__ */ jsx(ThemeToggle, {
									theme,
									onToggle: onToggleTheme
								})
							}),
							/* @__PURE__ */ jsx("a", {
								href: "/login",
								className: "hidden py-2 text-[15px] font-medium text-ink/76 transition hover:text-ink xl:inline-flex dark:text-white/72 dark:hover:text-white",
								children: "Sign In"
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: () => onStart(),
								className: "hidden h-[42px] items-center rounded-full bg-ink px-6 text-[15px] font-semibold text-white shadow-[0_12px_30px_-16px_rgba(15,15,15,.55)] transition hover:-translate-y-px hover:bg-black xl:inline-flex dark:bg-white dark:text-ink dark:hover:bg-white/90",
								children: "Try for Free"
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: () => setOpen((o) => !o),
								"aria-label": "Menu",
								className: "flex h-10 w-10 items-center justify-center rounded-xl border border-black/[.09] lg:hidden dark:border-white/[.12]",
								children: open ? /* @__PURE__ */ jsx(Close, {}) : /* @__PURE__ */ jsx(Menu, {})
							})
						]
					})
				]
			})
		}), open && /* @__PURE__ */ jsxs("div", {
			className: "border-b border-black/[.06] bg-canvas/95 px-4 pt-3 pb-5 backdrop-blur-xl lg:hidden dark:border-white/[.07] dark:bg-canvas-dark/95",
			children: [/* @__PURE__ */ jsx("nav", {
				className: "flex flex-col",
				children: NAV_LINKS.map((l) => /* @__PURE__ */ jsx("a", {
					href: l.href,
					onClick: () => setOpen(false),
					className: "rounded-xl px-3 py-3 text-[15px] font-medium muted transition hover:bg-black/[.04] dark:hover:bg-white/[.06]",
					children: l.label
				}, l.href))
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-3 flex flex-col gap-2",
				children: [
					/* @__PURE__ */ jsxs("button", {
						className: "btn-ghost h-11 w-full justify-between px-4 text-sm",
						children: [/* @__PURE__ */ jsx("span", { children: "Theme" }), /* @__PURE__ */ jsxs("span", {
							className: "inline-flex items-center gap-2",
							children: [/* @__PURE__ */ jsx(ThemeToggle, {
								theme,
								onToggle: onToggleTheme
							}), /* @__PURE__ */ jsx(Chevron, { className: "h-3.5 w-3.5" })]
						})]
					}),
					/* @__PURE__ */ jsx("a", {
						href: "/login",
						className: "btn-ghost h-11 w-full text-sm",
						children: "Sign In"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: () => {
							setOpen(false);
							onStart();
						},
						className: "h-11 w-full rounded-full bg-ink text-sm font-semibold text-white transition hover:bg-black dark:bg-white dark:text-ink",
						children: "Try for Free"
					})
				]
			})]
		})]
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
	useEffect(() => {
		if (parts.numeric === null) {
			setShown(value);
			return;
		}
		const el = ref.current;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const settle = () => setShown(value);
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
		className,
		children: shown ?? `${parts.prefix}0${parts.suffix}`
	});
}
//#endregion
//#region resources/js/landing/sections/Hero.jsx
var TYPE_KEYS = [
	"brand",
	"competitor",
	"product"
];
function Hero({ onStart }) {
	const [type, setType] = useState("brand");
	const [value, setValue] = useState("");
	const config = SEARCH_TYPES[type];
	const submit = (e) => {
		e.preventDefault();
		onStart(type, value);
	};
	return /* @__PURE__ */ jsxs("section", {
		id: "top",
		className: "relative isolate overflow-hidden pt-12 sm:pt-20 lg:pt-24",
		children: [/* @__PURE__ */ jsxs("div", {
			"aria-hidden": true,
			className: "pointer-events-none absolute inset-0 -z-10",
			children: [
				/* @__PURE__ */ jsx("div", { className: "bg-grid mask-radial-fade absolute inset-0" }),
				/* @__PURE__ */ jsx("div", { className: "absolute top-[-18%] left-1/2 h-[560px] w-[900px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/25 blur-[150px] dark:bg-accent/30" }),
				/* @__PURE__ */ jsx("div", { className: "animate-float absolute top-[24%] right-[6%] h-[260px] w-[260px] rounded-full bg-hot/20 blur-[120px]" }),
				/* @__PURE__ */ jsx("div", { className: "absolute bottom-[-10%] left-[4%] h-[240px] w-[240px] rounded-full bg-accent-glow/15 blur-[130px]" })
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative mx-auto max-w-page px-4 sm:px-6 lg:px-8",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mx-auto max-w-3xl text-center",
					children: [
						/* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsxs("span", {
							className: "ring-gradient inline-flex items-center gap-2.5 rounded-full bg-white/60 px-4 py-2 text-[12.5px] font-semibold backdrop-blur-xl dark:bg-white/[.05]",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "relative flex h-2 w-2",
								children: [/* @__PURE__ */ jsx("span", { className: "animate-pulse-ring absolute inset-0 rounded-full bg-hot" }), /* @__PURE__ */ jsx("span", { className: "relative h-2 w-2 rounded-full bg-hot" })]
							}), "TikTok social intelligence for brands"]
						}) }),
						/* @__PURE__ */ jsx(Reveal, {
							delay: 80,
							children: /* @__PURE__ */ jsxs("h1", {
								className: "mt-7 font-display text-[38px] leading-[1.04] font-bold tracking-[-.035em] sm:text-[58px] lg:text-[72px]",
								children: [
									"Find the TikToks",
									/* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
									" that are",
									" ",
									/* @__PURE__ */ jsx("span", {
										className: "text-gradient",
										children: "actually moving"
									}),
									/* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
									" your category"
								]
							})
						}),
						/* @__PURE__ */ jsx(Reveal, {
							delay: 140,
							children: /* @__PURE__ */ jsx("p", {
								className: "mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed muted sm:text-[17px]",
								children: "Point VVF at your brand, a competitor, or a single product. We scan TikTok and hand back the viral videos, the creators behind them, and what changed since last week."
							})
						})
					]
				}),
				/* @__PURE__ */ jsxs(Reveal, {
					delay: 200,
					className: "mx-auto mt-11 max-w-2xl",
					children: [/* @__PURE__ */ jsx("div", {
						className: "ring-gradient rounded-[26px] bg-white/70 p-1.5 shadow-[0_40px_100px_-50px_rgba(20,20,50,.5)] backdrop-blur-2xl dark:bg-white/[.045] dark:shadow-[0_50px_120px_-60px_rgba(0,0,0,1)]",
						children: /* @__PURE__ */ jsxs("div", {
							className: "rounded-[20px] bg-white/85 p-4 sm:p-5 dark:bg-black/25",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "mb-5 flex items-start gap-3 text-left",
									children: [/* @__PURE__ */ jsx(Mascot, { className: "animate-float h-12 w-12 shrink-0 sm:h-14 sm:w-14" }), /* @__PURE__ */ jsxs("div", {
										className: "relative rounded-2xl bg-ink px-4 py-3 text-[13.5px] leading-relaxed text-white shadow-lg dark:bg-white dark:text-ink",
										children: [/* @__PURE__ */ jsx("span", {
											"aria-hidden": true,
											className: "absolute top-4 -left-1.5 h-3 w-3 rotate-45 rounded-sm bg-ink dark:bg-white"
										}), "I scan TikTok for your brand, products, and competitors, and pull the recent viral videos."]
									})]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mb-2.5 text-left font-display text-[15px] font-semibold",
									children: "What do you want to research?"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "flex gap-1.5 rounded-2xl bg-black/[.045] p-1.5 dark:bg-white/[.05]",
									children: TYPE_KEYS.map((k) => /* @__PURE__ */ jsx("button", {
										onClick: () => setType(k),
										className: `flex-1 rounded-xl px-2 py-2.5 text-[13px] font-semibold transition-all duration-300 sm:text-[13.5px] ${type === k ? "bg-white text-ink shadow-[0_2px_10px_-2px_rgba(16,18,32,.18)] dark:bg-ink-700 dark:text-white" : "muted hover:text-ink dark:hover:text-white"}`,
										children: SEARCH_TYPES[k].label
									}, k))
								}),
								/* @__PURE__ */ jsxs("form", {
									onSubmit: submit,
									className: "mt-3 flex flex-col gap-2 sm:flex-row",
									children: [/* @__PURE__ */ jsx("input", {
										id: "search-subject",
										value,
										onChange: (e) => setValue(e.target.value),
										placeholder: config.placeholder,
										className: "field h-[54px] flex-1"
									}), /* @__PURE__ */ jsxs("button", {
										type: "submit",
										className: "btn-accent h-[54px] px-6 text-[15px]",
										children: ["Scout viral videos ", /* @__PURE__ */ jsx(Arrow, {})]
									})]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "mt-3.5 text-left text-[12.5px] faint",
									children: [
										"Try",
										" ",
										/* @__PURE__ */ jsxs("button", {
											type: "button",
											onClick: () => setValue(config.sample),
											className: "font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow",
											children: [
												"“",
												config.sample,
												"”"
											]
										}),
										" ",
										"· one subject per search keeps each result tight."
									]
								})
							]
						})
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6",
						children: [/* @__PURE__ */ jsxs("button", {
							className: "group inline-flex items-center gap-2.5 text-[13.5px] font-semibold muted transition hover:text-accent dark:hover:text-accent-glow",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex h-8 w-8 items-center justify-center rounded-full border border-black/[.09] transition group-hover:border-accent/50 group-hover:bg-accent/10 dark:border-white/15",
								children: /* @__PURE__ */ jsx(Play, { className: "h-3 w-3" })
							}), "Watch 2 min demo"]
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[13px] faint",
							children: "1 free search · no credit card"
						})]
					})]
				}),
				/* @__PURE__ */ jsx("dl", {
					className: "mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/[.06] bg-black/[.06] sm:mt-20 sm:grid-cols-4 dark:border-white/[.08] dark:bg-white/[.08]",
					children: STATS.map((s, i) => /* @__PURE__ */ jsxs(Reveal, {
						delay: i * 70,
						className: "bg-canvas px-4 py-6 text-center dark:bg-canvas-dark",
						children: [/* @__PURE__ */ jsx("dt", {
							className: "font-display text-[26px] font-bold tracking-tight sm:text-[32px]",
							children: /* @__PURE__ */ jsx(CountUp, { value: s.value })
						}), /* @__PURE__ */ jsxs("dd", {
							className: "mt-1.5 flex items-center justify-center gap-1.5 text-[12.5px] faint",
							children: [/* @__PURE__ */ jsx(Trend, { className: "h-2.5 w-2.5 text-accent dark:text-accent-glow" }), s.label]
						})]
					}, s.label))
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/landing/sections/BrandMarquee.jsx
function BrandChip({ brand }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "group flex shrink-0 items-center gap-3 rounded-2xl border border-black/[.06] bg-white/70 px-4 py-3 backdrop-blur-xl transition-colors duration-300 hover:border-accent/30 dark:border-white/[.08] dark:bg-white/[.035]",
		children: [/* @__PURE__ */ jsx("span", {
			className: "flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-accent/20 to-hot/10 font-display text-[12.5px] font-bold text-accent dark:text-accent-glow",
			children: brand.name.slice(0, 2).toUpperCase()
		}), /* @__PURE__ */ jsxs("div", {
			className: "leading-tight",
			children: [/* @__PURE__ */ jsx("p", {
				className: "text-[13.5px] font-semibold",
				children: brand.name
			}), /* @__PURE__ */ jsxs("p", {
				className: "text-[11.5px] faint",
				children: [
					brand.category,
					" · ",
					brand.reach,
					" tracked"
				]
			})]
		})]
	});
}
function BrandMarquee() {
	const rowA = [...BRANDS.slice(0, 6), ...BRANDS.slice(0, 6)];
	const rowB = [...BRANDS.slice(6), ...BRANDS.slice(6)];
	return /* @__PURE__ */ jsxs("section", {
		className: "mt-20 sm:mt-28",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-center font-display text-[11px] font-semibold tracking-[.2em] uppercase faint",
			children: "Tracking the TikTok footprint of 11,000+ brands"
		}), /* @__PURE__ */ jsxs("div", {
			className: "mask-fade-x mt-7 space-y-3 overflow-hidden",
			children: [/* @__PURE__ */ jsx("div", {
				className: "animate-marquee flex w-max gap-3",
				children: rowA.map((b, i) => /* @__PURE__ */ jsx(BrandChip, { brand: b }, `a${i}`))
			}), /* @__PURE__ */ jsx("div", {
				className: "animate-marquee-reverse flex w-max gap-3",
				children: rowB.map((b, i) => /* @__PURE__ */ jsx(BrandChip, { brand: b }, `b${i}`))
			})]
		})]
	});
}
//#endregion
//#region resources/js/landing/sections/Features.jsx
function Preview({ feature }) {
	const videos = RESULT_VIDEOS.slice(0, 3);
	return /* @__PURE__ */ jsxs("div", {
		className: "ring-gradient animate-fade-up relative overflow-hidden rounded-3xl bg-white/70 p-5 backdrop-blur-2xl sm:p-6 dark:bg-white/[.04]",
		children: [
			/* @__PURE__ */ jsx("div", {
				"aria-hidden": true,
				className: `pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-linear-to-br ${feature.accent} opacity-30 blur-3xl`
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("span", {
					className: "rounded-lg border border-black/[.06] bg-black/[.03] px-2.5 py-1 text-[11px] font-semibold muted dark:border-white/[.08] dark:bg-white/[.06]",
					children: feature.tag
				}), /* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1.5 text-[11px] font-semibold text-hot",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "relative flex h-1.5 w-1.5",
						children: [/* @__PURE__ */ jsx("span", { className: "animate-pulse-ring absolute inset-0 rounded-full bg-hot" }), /* @__PURE__ */ jsx("span", { className: "relative h-1.5 w-1.5 rounded-full bg-hot" })]
					}), "live"]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative mt-5 grid grid-cols-3 gap-3",
				children: videos.map((v) => /* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: `relative flex aspect-[9/16] items-center justify-center overflow-hidden rounded-xl bg-linear-to-br ${v.gradient} shadow-[0_16px_34px_-20px_rgba(0,0,0,.8)]`,
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm",
								children: /* @__PURE__ */ jsx(Play, { className: "h-3 w-3 translate-x-px text-white" })
							}), /* @__PURE__ */ jsx("span", {
								className: "absolute bottom-1.5 left-1.5 rounded bg-hot px-1.5 py-0.5 text-[9px] font-bold text-white",
								children: v.multiplier
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 truncate font-display text-[13px] font-bold text-hot",
							children: v.views
						}),
						/* @__PURE__ */ jsx("p", {
							className: "truncate text-[10.5px] faint",
							children: v.handle
						})
					]
				}, v.rank))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative mt-5 space-y-2.5 rounded-2xl border border-black/[.05] bg-black/[.02] p-4 dark:border-white/[.06] dark:bg-white/[.03]",
				children: [
					"Outlier score",
					"Creator reach",
					"Week over week"
				].map((label, i) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "w-[92px] shrink-0 text-[11px] faint",
							children: label
						}),
						/* @__PURE__ */ jsx("span", {
							className: "h-1.5 flex-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10",
							children: /* @__PURE__ */ jsx("span", {
								className: "block h-full rounded-full bg-linear-to-r from-accent to-accent-glow transition-all duration-700",
								style: { width: `${[
									82,
									64,
									91
								][i]}%` }
							})
						}),
						/* @__PURE__ */ jsx("span", {
							className: "w-9 shrink-0 text-right text-[11px] font-semibold muted",
							children: [
								82,
								64,
								91
							][i]
						})
					]
				}, label))
			})
		]
	});
}
function Features() {
	const [active, setActive] = useState(FEATURES[0].id);
	const feature = FEATURES.find((f) => f.id === active);
	return /* @__PURE__ */ jsxs("section", {
		id: "features",
		className: "mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8",
		children: [/* @__PURE__ */ jsxs(Reveal, {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ jsxs("p", {
					className: "eyebrow",
					children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " Research & monitor"]
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "section-title mt-4",
					children: "Everything you need to read TikTok"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-5 text-[15.5px] leading-relaxed muted sm:text-base",
					children: "Four tools built on one index. Find what broke out, watch who is moving, and get told when something about you starts climbing."
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-3",
				children: [FEATURES.map((f, i) => {
					const on = f.id === active;
					return /* @__PURE__ */ jsx(Reveal, {
						delay: i * 70,
						children: /* @__PURE__ */ jsxs("button", {
							onClick: () => setActive(f.id),
							className: `w-full rounded-2xl border p-5 text-left transition-all duration-300 sm:p-6 ${on ? "ring-gradient border-transparent bg-white shadow-[0_28px_60px_-34px_rgba(109,75,255,.5)] dark:bg-white/[.06]" : "border-black/[.06] hover:-translate-y-px hover:border-accent/25 dark:border-white/[.08]"}`,
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ jsx("span", { className: `h-2 w-2 rounded-full transition-all duration-300 ${on ? "bg-accent shadow-[0_0_12px_2px_rgba(109,75,255,.6)]" : "bg-black/15 dark:bg-white/20"}` }), /* @__PURE__ */ jsx("span", {
										className: "font-display text-[16px] font-bold sm:text-[17px]",
										children: f.title
									})]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2.5 text-[13.5px] leading-relaxed muted",
									children: f.body
								}),
								on && /* @__PURE__ */ jsx("ul", {
									className: "animate-fade-up mt-4 flex flex-wrap gap-x-4 gap-y-2",
									children: f.bullets.map((b) => /* @__PURE__ */ jsxs("li", {
										className: "flex items-center gap-1.5 text-[12.5px] font-medium muted",
										children: [/* @__PURE__ */ jsx("span", {
											className: "flex h-4 w-4 items-center justify-center rounded-full bg-accent/15 text-accent dark:text-accent-glow",
											children: /* @__PURE__ */ jsx(Check, { className: "h-2.5 w-2.5" })
										}), b]
									}, b))
								})
							]
						})
					}, f.id);
				}), /* @__PURE__ */ jsxs("a", {
					href: "#pricing",
					className: "mt-1 inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow",
					children: ["See all features ", /* @__PURE__ */ jsx(Arrow, {})]
				})]
			}), /* @__PURE__ */ jsx(Reveal, {
				delay: 120,
				className: "lg:sticky lg:top-24",
				children: /* @__PURE__ */ jsx(Preview, { feature }, feature.id)
			})]
		})]
	});
}
//#endregion
//#region resources/js/landing/sections/HowItWorks.jsx
function HowItWorks({ onStart }) {
	return /* @__PURE__ */ jsxs("section", {
		id: "how",
		className: "mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8",
		children: [
			/* @__PURE__ */ jsxs(Reveal, {
				className: "mx-auto max-w-2xl text-center",
				children: [
					/* @__PURE__ */ jsxs("p", {
						className: "eyebrow",
						children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " How it works"]
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "section-title mt-4",
						children: "One subject in, a viral cut out"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-5 text-[15.5px] leading-relaxed muted sm:text-base",
						children: "No dashboards to configure and no keyword research to do first. Four steps, most of them optional."
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative mt-14",
				children: [/* @__PURE__ */ jsx("div", {
					"aria-hidden": true,
					className: "absolute top-[46px] right-[12%] left-[12%] hidden h-px bg-linear-to-r from-transparent via-accent/30 to-transparent lg:block"
				}), /* @__PURE__ */ jsx("div", {
					className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-4",
					children: STEPS.map((s, i) => /* @__PURE__ */ jsxs(Reveal, {
						delay: i * 90,
						className: "relative",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "surface-hover h-full p-6",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-deep font-display text-[13px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(109,75,255,.9)]",
									children: s.n
								}),
								/* @__PURE__ */ jsx("h3", {
									className: "mt-5 font-display text-[17px] font-bold",
									children: s.title
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2.5 text-[13.5px] leading-relaxed muted",
									children: s.body
								})
							]
						}), i < STEPS.length - 1 && /* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: "absolute top-[46px] -right-[18px] z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-black/[.06] bg-canvas text-accent lg:flex dark:border-white/[.08] dark:bg-canvas-dark",
							children: /* @__PURE__ */ jsx(Arrow, { className: "h-3 w-3" })
						})]
					}, s.n))
				})]
			}),
			/* @__PURE__ */ jsx(Reveal, {
				delay: 120,
				className: "mt-12 text-center",
				children: /* @__PURE__ */ jsxs("button", {
					onClick: () => onStart(),
					className: "btn-accent h-[52px] px-7 text-[15px]",
					children: ["Run your free search ", /* @__PURE__ */ jsx(Arrow, {})]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/landing/sections/Testimonials.jsx
function Card({ t }) {
	return /* @__PURE__ */ jsxs("figure", {
		className: "surface-hover break-inside-avoid p-6",
		children: [
			/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				className: "font-display text-4xl leading-none text-accent/30 dark:text-accent-glow/40",
				children: "“"
			}),
			/* @__PURE__ */ jsx("blockquote", {
				className: "mt-2 text-[14.5px] leading-relaxed",
				children: t.quote
			}),
			/* @__PURE__ */ jsxs("figcaption", {
				className: "mt-5 flex items-center gap-3 border-t border-black/[.05] pt-4 dark:border-white/[.07]",
				children: [/* @__PURE__ */ jsx("span", {
					className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent/25 to-hot/15 font-display text-[12.5px] font-bold text-accent dark:text-accent-glow",
					children: t.initials
				}), /* @__PURE__ */ jsxs("span", {
					className: "min-w-0 leading-tight",
					children: [/* @__PURE__ */ jsx("span", {
						className: "block truncate text-[13.5px] font-semibold",
						children: t.name
					}), /* @__PURE__ */ jsxs("span", {
						className: "block truncate text-[12px] faint",
						children: [
							t.role,
							" · ",
							t.company
						]
					})]
				})]
			})
		]
	});
}
function Testimonials() {
	return /* @__PURE__ */ jsxs("section", {
		id: "customers",
		className: "mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8",
		children: [/* @__PURE__ */ jsxs(Reveal, {
			className: "mx-auto max-w-2xl text-center",
			children: [
				/* @__PURE__ */ jsxs("p", {
					className: "eyebrow",
					children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " Customers"]
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "section-title mt-4",
					children: "Why brand teams switch to VVF"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-5 text-[15.5px] leading-relaxed muted sm:text-base",
					children: "Placeholder quotes for the MVP — swap these for real ones before launch."
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5",
			children: TESTIMONIALS.map((t, i) => /* @__PURE__ */ jsx(Reveal, {
				delay: i % 3 * 80,
				className: "break-inside-avoid",
				children: /* @__PURE__ */ jsx(Card, { t })
			}, t.name))
		})]
	});
}
//#endregion
//#region resources/js/landing/sections/Pricing.jsx
function Pricing({ onStart, onTrial }) {
	const [annual, setAnnual] = useState(false);
	const { pricingPlans = [] } = usePage().props;
	const plans = (pricingPlans.length > 0 ? [...pricingPlans] : [...PRICING.monthly]).sort((a, b) => {
		const aKey = a.slug ?? a.name?.toLowerCase();
		const bKey = b.slug ?? b.name?.toLowerCase();
		const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
		const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);
		return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
	});
	const price = (p) => p === 0 ? 0 : annual ? Math.round(p * 12 * .8 / 12) : p;
	return /* @__PURE__ */ jsxs("section", {
		id: "pricing",
		className: "mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8",
		children: [/* @__PURE__ */ jsxs(Reveal, {
			className: "mx-auto max-w-2xl text-center",
			children: [
				/* @__PURE__ */ jsxs("p", {
					className: "eyebrow justify-center",
					children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " Pricing"]
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "section-title mt-4",
					children: "Simple, per-search pricing"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-5 text-[15.5px] leading-relaxed muted sm:text-base",
					children: "Start with one free search. Upgrade when you want tracking on a schedule."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-8 inline-flex items-center gap-1 rounded-2xl border border-black/[.06] bg-black/[.035] p-1.5 dark:border-white/[.08] dark:bg-white/[.05]",
					children: [{
						k: false,
						label: "Monthly"
					}, {
						k: true,
						label: "Annual −20%"
					}].map((o) => /* @__PURE__ */ jsx("button", {
						onClick: () => setAnnual(o.k),
						className: `rounded-xl px-5 py-2 text-[13.5px] font-semibold transition-all duration-300 ${annual === o.k ? "bg-white text-ink shadow-[0_2px_10px_-2px_rgba(16,18,32,.2)] dark:bg-ink-700 dark:text-white" : "muted"}`,
						children: o.label
					}, o.label))
				})
			]
		}), /* @__PURE__ */ jsx("div", {
			className: "mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3",
			children: plans.map((t, i) => /* @__PURE__ */ jsx(Reveal, {
				delay: i * 90,
				className: t.popular ? "lg:-mt-4 lg:mb-4" : "",
				children: /* @__PURE__ */ jsxs("div", {
					className: `relative flex h-full flex-col rounded-3xl p-6 transition-all duration-300 sm:p-7 ${t.popular ? "ring-gradient bg-white shadow-[0_40px_90px_-45px_rgba(109,75,255,.7)] dark:bg-white/[.06]" : "border border-black/[.06] bg-white hover:-translate-y-1 hover:border-accent/25 dark:border-white/[.08] dark:bg-white/[.03]"}`,
					children: [
						t.popular && /* @__PURE__ */ jsx("span", {
							className: "absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-accent-glow to-accent px-3 py-1 text-[10.5px] font-bold tracking-wider text-white uppercase shadow-[0_8px_20px_-8px_rgba(109,75,255,1)]",
							children: "Most popular"
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "font-display text-[17px] font-bold",
							children: t.name
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[12.5px] faint",
							children: t.tagline
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-5 font-display text-[40px] leading-none font-bold tracking-[-.03em]",
							children: [
								"$",
								price(t.price),
								/* @__PURE__ */ jsx("span", {
									className: "text-[13px] font-medium muted",
									children: "/mo"
								})
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 h-4 text-[11.5px] faint",
							children: annual && t.price > 0 ? `Billed $${price(t.price) * 12}/year` : t.price > 0 ? "Billed monthly" : ""
						}),
						/* @__PURE__ */ jsxs("button", {
							onClick: () => t.price === 0 ? onStart() : onTrial(),
							className: `mt-6 h-12 w-full text-sm ${t.popular ? "btn-accent" : "btn-ghost"}`,
							children: [
								t.cta,
								" ",
								/* @__PURE__ */ jsx(Arrow, {})
							]
						}),
						/* @__PURE__ */ jsx("ul", {
							className: "mt-6 space-y-3 border-t border-black/[.05] pt-6 dark:border-white/[.07]",
							children: t.features.map((f) => /* @__PURE__ */ jsxs("li", {
								className: "flex gap-3 text-[13.5px] muted",
								children: [/* @__PURE__ */ jsx("span", {
									className: "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent dark:text-accent-glow",
									children: /* @__PURE__ */ jsx(Check, { className: "h-2.5 w-2.5" })
								}), f]
							}, f))
						})
					]
				})
			}, t.name))
		})]
	});
}
//#endregion
//#region resources/js/landing/sections/Faq.jsx
function Faq() {
	const [open, setOpen] = useState(0);
	return /* @__PURE__ */ jsx("section", {
		id: "faq",
		className: "mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8",
		children: /* @__PURE__ */ jsxs("div", {
			className: "grid gap-10 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-16",
			children: [/* @__PURE__ */ jsxs(Reveal, {
				className: "lg:sticky lg:top-28 lg:self-start",
				children: [
					/* @__PURE__ */ jsxs("p", {
						className: "eyebrow",
						children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " FAQ"]
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "section-title mt-4",
						children: "Questions? Answers."
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-5 text-[15.5px] leading-relaxed muted",
						children: [
							"Still stuck? Email",
							" ",
							/* @__PURE__ */ jsx("a", {
								href: "mailto:hello@vvf.app",
								className: "font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow",
								children: "hello@vvf.app"
							}),
							" ",
							"and a human replies same day."
						]
					})
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "flex flex-col gap-2.5",
				children: FAQS.map((f, i) => {
					const on = open === i;
					return /* @__PURE__ */ jsx(Reveal, {
						delay: Math.min(i, 5) * 50,
						children: /* @__PURE__ */ jsxs("div", {
							className: `overflow-hidden rounded-2xl border transition-all duration-300 ${on ? "border-accent/30 bg-white shadow-[0_24px_50px_-34px_rgba(109,75,255,.5)] dark:bg-white/[.05]" : "border-black/[.06] hover:border-accent/20 dark:border-white/[.08]"}`,
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: () => setOpen(on ? -1 : i),
								"aria-expanded": on,
								className: "flex w-full items-center justify-between gap-4 px-5 py-4 text-left",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-display text-[15px] font-semibold",
									children: f.q
								}), /* @__PURE__ */ jsx("span", {
									className: `flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${on ? "rotate-180 bg-linear-to-br from-accent-glow to-accent text-white" : "bg-black/[.05] muted dark:bg-white/[.08]"}`,
									children: /* @__PURE__ */ jsx(Chevron, { className: "h-3.5 w-3.5" })
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: `grid transition-all duration-300 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`,
								children: /* @__PURE__ */ jsx("div", {
									className: "overflow-hidden",
									children: /* @__PURE__ */ jsx("p", {
										className: "px-5 pb-5 text-[14px] leading-relaxed muted",
										children: f.a
									})
								})
							})]
						})
					}, f.q);
				})
			})]
		})
	});
}
//#endregion
//#region resources/js/landing/sections/FinalCta.jsx
function FinalCta({ onStart }) {
	return /* @__PURE__ */ jsx("section", {
		className: "mx-auto mt-28 max-w-page px-4 sm:mt-36 sm:px-6 lg:px-8",
		children: /* @__PURE__ */ jsx(Reveal, { children: /* @__PURE__ */ jsxs("div", {
			className: "relative isolate overflow-hidden rounded-[32px] bg-ink px-6 py-16 text-center sm:px-10 sm:py-24 dark:bg-white/[.05]",
			children: [/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 -z-10",
				children: [
					/* @__PURE__ */ jsx("div", { className: "bg-grid absolute inset-0 opacity-[.35]" }),
					/* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 h-[340px] w-[680px] max-w-[140vw] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/50 blur-[130px]" }),
					/* @__PURE__ */ jsx("div", { className: "animate-float absolute right-0 bottom-0 h-[240px] w-[240px] translate-x-1/4 translate-y-1/3 rounded-full bg-hot/35 blur-[110px]" })
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "relative mx-auto max-w-2xl",
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-white/80 backdrop-blur-xl",
						children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-hot" }), "Your first search is free"]
					}),
					/* @__PURE__ */ jsxs("h2", {
						className: "mt-6 font-display text-[32px] leading-[1.06] font-bold tracking-[-.03em] text-white sm:text-[46px] lg:text-[56px]",
						children: [
							"See what TikTok is",
							/* @__PURE__ */ jsx("br", { className: "hidden sm:block" }),
							" ",
							/* @__PURE__ */ jsx("span", {
								className: "text-gradient",
								children: "saying about you"
							})
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mx-auto mt-5 max-w-lg text-[15.5px] leading-relaxed text-white/60",
						children: "One free search, no card. Most brands get their first surprise within the top ten results."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row",
						children: [/* @__PURE__ */ jsxs("button", {
							onClick: () => onStart(),
							className: "btn-accent h-[52px] w-full px-8 text-[15px] sm:w-auto",
							children: ["Start free ", /* @__PURE__ */ jsx(Arrow, {})]
						}), /* @__PURE__ */ jsxs("button", {
							className: "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-7 text-[15px] font-semibold whitespace-nowrap text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-px hover:bg-white/10 sm:w-auto",
							children: [/* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5" }), " Watch demo · 2 min"]
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-6 text-[12.5px] text-white/40",
						children: "No credit card required · cancel any trial in two clicks"
					})
				]
			})]
		}) })
	});
}
//#endregion
//#region resources/js/landing/sections/Footer.jsx
function Footer() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	return /* @__PURE__ */ jsxs("footer", {
		className: "relative mt-28 overflow-hidden border-t border-black/[.06] pt-16 sm:mt-36 dark:border-white/[.07]",
		children: [/* @__PURE__ */ jsx("div", {
			"aria-hidden": true,
			className: "pointer-events-none absolute -top-24 left-1/2 h-[240px] w-[700px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative mx-auto max-w-page px-4 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("a", {
						href: "#top",
						className: "flex items-center gap-2.5 font-display text-[17px] font-bold",
						children: [/* @__PURE__ */ jsx(Logo, {}), "VVF"]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-4 max-w-xs text-[13.5px] leading-relaxed muted",
						children: "TikTok social intelligence for brands. Find the viral videos moving your category, and the creators behind them."
					}),
					/* @__PURE__ */ jsxs("form", {
						onSubmit: (e) => {
							e.preventDefault();
							setSent(true);
						},
						className: "mt-7 max-w-sm",
						children: [
							/* @__PURE__ */ jsx("label", {
								className: "block text-[12.5px] font-semibold",
								children: "Weekly viral digest"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-2.5 flex gap-2",
								children: [/* @__PURE__ */ jsx("input", {
									type: "email",
									required: true,
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: "you@brand.com",
									className: "field h-11 flex-1 text-[14px]"
								}), /* @__PURE__ */ jsxs("button", {
									type: "submit",
									className: "btn-accent h-11 px-4 text-[13.5px]",
									children: [sent ? "Subscribed" : "Subscribe", !sent && /* @__PURE__ */ jsx(Arrow, { className: "h-3 w-3" })]
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2.5 text-[11.5px] faint",
								children: "One email a week. Unsubscribe anytime."
							})
						]
					})
				] }), /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-2 gap-8 sm:grid-cols-4",
					children: FOOTER_LINKS.map((col) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", {
						className: "font-display text-[11.5px] font-semibold tracking-[.14em] uppercase faint",
						children: col.heading
					}), /* @__PURE__ */ jsx("ul", {
						className: "mt-4 space-y-3",
						children: col.links.map((l) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
							href: "#top",
							className: "text-[13.5px] muted transition-colors duration-200 hover:text-accent dark:hover:text-accent-glow",
							children: l
						}) }, l))
					})] }, col.heading))
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-16 flex flex-col items-center justify-between gap-3 border-t border-black/[.06] py-7 sm:flex-row dark:border-white/[.07]",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "text-[12.5px] faint",
					children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" VVF. Prototype — dummy data throughout."
					]
				}), /* @__PURE__ */ jsx("div", {
					className: "flex gap-6 text-[12.5px] faint",
					children: [
						"Terms",
						"Privacy",
						"Contact"
					].map((l) => /* @__PURE__ */ jsx("a", {
						href: "#top",
						className: "transition-colors hover:text-accent dark:hover:text-accent-glow",
						children: l
					}, l))
				})]
			})]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Landing.jsx
var Landing_exports = /* @__PURE__ */ __exportAll({ default: () => Landing });
function Landing() {
	const { theme, toggle } = useTheme();
	const revealRoot = useReveal();
	/**
	* Called with a type + subject from the hero form, and with nothing from the
	* secondary CTAs — those just send the visitor back to the hero input.
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "VVF — TikTok viral intelligence for brands" }), /* @__PURE__ */ jsxs("div", {
		ref: revealRoot,
		className: "vvf-landing min-h-screen font-body",
		children: [
			/* @__PURE__ */ jsx(Nav, {
				theme,
				onToggleTheme: toggle,
				onStart: startSearch
			}),
			/* @__PURE__ */ jsxs("main", { children: [
				/* @__PURE__ */ jsx(Hero, { onStart: startSearch }),
				/* @__PURE__ */ jsx(BrandMarquee, {}),
				/* @__PURE__ */ jsx(Features, {}),
				/* @__PURE__ */ jsx(HowItWorks, { onStart: startSearch }),
				/* @__PURE__ */ jsx(Testimonials, {}),
				/* @__PURE__ */ jsx(Pricing, {
					onStart: startSearch,
					onTrial: () => router.visit("/trial")
				}),
				/* @__PURE__ */ jsx(Faq, {}),
				/* @__PURE__ */ jsx(FinalCta, { onStart: startSearch })
			] }),
			/* @__PURE__ */ jsx(Footer, {})
		]
	})] });
}
//#endregion
//#region resources/js/landing/flow/SearchShell.jsx
var TONES = {
	ok: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	accent: "border-accent/25 bg-accent/10 text-accent dark:text-accent-glow"
};
var STEP_ORDER = [
	"keywords",
	"running",
	"results"
];
/**
* Page chrome for the search flow screens. Each step is its own page, so this
* renders a real sticky header rather than modal furniture.
*/
function SearchShell({ pill, step, onNewSearch, onExit, width = "max-w-4xl", children }) {
	const { theme, toggle } = useTheme();
	const stepIndex = STEP_ORDER.indexOf(step);
	return /* @__PURE__ */ jsxs("div", {
		className: "vvf-landing relative isolate min-h-screen font-body",
		children: [
			/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", { className: "bg-grid mask-radial-fade absolute inset-0" }), /* @__PURE__ */ jsx("div", { className: "absolute top-[-20%] left-1/2 h-[420px] w-[760px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/15 blur-[140px] dark:bg-accent/20" })]
			}),
			/* @__PURE__ */ jsxs("header", {
				className: "sticky top-0 z-40 border-b border-black/[.06] bg-canvas/70 backdrop-blur-xl dark:border-white/[.07] dark:bg-canvas-dark/70",
				children: [/* @__PURE__ */ jsxs("div", {
					className: `mx-auto flex h-[68px] ${width} items-center justify-between px-4 sm:px-6`,
					children: [/* @__PURE__ */ jsxs("button", {
						onClick: onExit,
						className: "flex items-center gap-2.5 font-display text-[17px] font-bold",
						"aria-label": "Back to home",
						children: [/* @__PURE__ */ jsx(Logo, {}), "VVF"]
					}), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 sm:gap-3",
						children: [
							pill && /* @__PURE__ */ jsx("span", {
								className: `rounded-full border px-3 py-1 text-[11.5px] font-semibold ${TONES[pill.tone]}`,
								children: pill.text
							}),
							/* @__PURE__ */ jsx(ThemeToggle, {
								theme,
								onToggle: toggle,
								className: "hidden sm:inline-flex"
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: onNewSearch,
								className: "btn-ghost hidden h-10 px-4 text-[13px] sm:inline-flex",
								children: "New search"
							}),
							/* @__PURE__ */ jsx("button", {
								onClick: onExit,
								"aria-label": "Close",
								className: "flex h-10 w-10 items-center justify-center rounded-xl border border-black/[.09] transition-all duration-300 hover:-translate-y-px hover:border-accent/40 dark:border-white/[.12]",
								children: /* @__PURE__ */ jsx(Close, { className: "h-4 w-4" })
							})
						]
					})]
				}), stepIndex >= 0 && /* @__PURE__ */ jsx("div", {
					className: "h-[2px] w-full bg-black/[.05] dark:bg-white/[.06]",
					children: /* @__PURE__ */ jsx("div", {
						className: "h-full bg-linear-to-r from-accent-glow to-accent transition-all duration-700 ease-out",
						style: { width: `${(stepIndex + 1) / STEP_ORDER.length * 100}%` }
					})
				})]
			}),
			/* @__PURE__ */ jsx("main", {
				className: `mx-auto ${width} px-4 py-10 sm:px-6 sm:py-12`,
				children
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/SavedSearches/Index.jsx
var Index_exports = /* @__PURE__ */ __exportAll({ default: () => Index });
var STATUS = {
	scraping: {
		label: "Refreshing",
		className: "border-accent/25 bg-accent/10 text-accent dark:text-accent-glow"
	},
	done: {
		label: "Ready",
		className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
	},
	paused: {
		label: "Paused",
		className: "border-black/[.1] muted dark:border-white/[.15]"
	},
	failed: {
		label: "Failed",
		className: "border-hot/25 bg-hot/10 text-hot"
	}
};
function formatDate(iso) {
	return iso ? new Date(iso).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	}) : "—";
}
function Index({ searches }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Saved searches — VVF" }), /* @__PURE__ */ jsx(SearchShell, {
		pill: {
			text: `${searches.length} saved`,
			tone: "accent"
		},
		onNewSearch: () => router.visit("/"),
		onExit: () => router.visit("/"),
		width: "max-w-5xl",
		children: /* @__PURE__ */ jsxs("div", {
			className: "animate-fade-up",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", {
					className: "font-display text-[28px] leading-tight font-bold tracking-[-.025em] sm:text-[36px]",
					children: "Saved searches"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-2.5 text-[13.5px] muted",
					children: "Each one re-runs on its own schedule and keeps the top matches."
				})] }), /* @__PURE__ */ jsxs("button", {
					onClick: () => router.visit("/"),
					className: "btn-accent h-11 px-5 text-sm",
					children: [/* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }), " New search"]
				})]
			}), searches.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "ring-gradient mt-8 rounded-3xl bg-white/70 p-12 text-center backdrop-blur-2xl dark:bg-white/[.04]",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "font-display text-[20px] font-bold",
						children: "Nothing saved yet"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed muted",
						children: "Run a search from the home page and it will land here, refreshing on the cadence you pick."
					}),
					/* @__PURE__ */ jsxs("button", {
						onClick: () => router.visit("/"),
						className: "btn-accent mx-auto mt-6 h-11 px-5 text-sm",
						children: ["Run your first search ", /* @__PURE__ */ jsx(Arrow, {})]
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "mt-8 grid gap-4 sm:grid-cols-2",
				children: searches.map((s) => {
					const status = STATUS[s.status] ?? STATUS.done;
					return /* @__PURE__ */ jsxs("button", {
						onClick: () => router.visit(s.url),
						className: "surface-hover p-5 text-left",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ jsx("h2", {
									className: "font-display text-[16px] font-bold",
									children: s.name
								}), /* @__PURE__ */ jsx("span", {
									className: `shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`,
									children: status.label
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1.5 truncate text-[12.5px] faint",
								children: s.phrase
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] muted",
								children: [
									/* @__PURE__ */ jsxs("span", {
										className: "flex items-center gap-1.5 font-semibold",
										children: [
											/* @__PURE__ */ jsx(Trend, { className: "h-3 w-3 text-hot" }),
											s.result_count,
											" videos"
										]
									}),
									/* @__PURE__ */ jsx("span", {
										className: "capitalize",
										children: s.frequency
									}),
									/* @__PURE__ */ jsxs("span", { children: ["Last run ", formatDate(s.last_run_at)] })
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-4 flex flex-wrap gap-1.5",
								children: [s.keywords.slice(0, 3).map((k) => /* @__PURE__ */ jsx("span", {
									className: "rounded-lg border border-black/[.06] bg-black/[.03] px-2 py-1 text-[11.5px] faint dark:border-white/[.08] dark:bg-white/[.05]",
									children: k
								}, k)), s.keywords.length > 3 && /* @__PURE__ */ jsxs("span", {
									className: "px-1 py-1 text-[11.5px] faint",
									children: ["+", s.keywords.length - 3]
								})]
							})
						]
					}, s.id);
				})
			})]
		})
	})] });
}
//#endregion
//#region resources/js/landing/flow/format.js
/** 4_200_000 → "4.2M". Keeps one decimal only when it adds information. */
function compactNumber(value) {
	const n = Number(value) || 0;
	if (n >= 1e9) return trim(n / 1e9) + "B";
	if (n >= 1e6) return trim(n / 1e6) + "M";
	if (n >= 1e3) return trim(n / 1e3) + "K";
	return String(Math.round(n));
}
function trim(value) {
	return value >= 100 ? String(Math.round(value)) : String(Math.round(value * 10) / 10).replace(/\.0$/, "");
}
/** 14.2 → "0:14" */
function duration(seconds) {
	const total = Math.max(0, Math.round(Number(seconds) || 0));
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
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
* Score is engagement per follower — shown as a multiplier so a card can say
* "18x" the way the old mock did, without inventing a number.
*/
function multiplier(score) {
	const n = Number(score) || 0;
	if (n <= 0) return null;
	return `${n >= 10 ? Math.round(n) : Math.round(n * 10) / 10}x`;
}
var GRADIENTS = [
	"from-[#3a2b6b] to-[#8b3df0]",
	"from-[#0f3d5c] to-[#2aa7c4]",
	"from-[#5c1030] to-[#ff3d71]",
	"from-[#173a2a] to-[#3fbf7a]",
	"from-[#4a3410] to-[#e0a83a]",
	"from-[#2b1b52] to-[#5b34f5]",
	"from-[#123a4a] to-[#37c8a0]",
	"from-[#4a1240] to-[#d13fb0]"
];
/** Stable per-video gradient, used behind thumbnails that fail to load. */
function gradientFor(key) {
	const str = String(key ?? "");
	let hash = 0;
	for (let i = 0; i < str.length; i++) hash = hash * 31 + str.charCodeAt(i) >>> 0;
	return GRADIENTS[hash % GRADIENTS.length];
}
//#endregion
//#region resources/js/landing/flow/VideoCard.jsx
function Thumb({ video, rank, className = "" }) {
	const [broken, setBroken] = useState(false);
	const gradient = gradientFor(video.video_id ?? video.id);
	const src = video.thumbnail_url;
	const mult = multiplier(video.score ?? video.virality_score);
	return /* @__PURE__ */ jsxs("div", {
		className: `group relative flex items-center justify-center overflow-hidden rounded-2xl
        bg-linear-to-br ${gradient} shadow-[0_20px_44px_-24px_rgba(0,0,0,.85)] ${className}`,
		children: [
			src && !broken && /* @__PURE__ */ jsx("img", {
				src,
				alt: "",
				loading: "lazy",
				referrerPolicy: "no-referrer",
				onError: () => setBroken(true),
				className: "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
			}),
			/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				className: "absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/20"
			}),
			rank != null && /* @__PURE__ */ jsx("span", {
				className: "absolute top-2.5 left-2.5 flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-white/95 px-1.5 font-display text-xs font-bold text-ink",
				children: rank
			}),
			/* @__PURE__ */ jsx("span", {
				className: "relative flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110",
				children: /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 translate-x-px text-white" })
			}),
			video.duration > 0 && /* @__PURE__ */ jsx("span", {
				className: "absolute right-2.5 bottom-2.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm",
				children: duration(video.duration)
			}),
			mult && /* @__PURE__ */ jsx("span", {
				className: "absolute bottom-2.5 left-2.5 rounded-md bg-hot px-1.5 py-0.5 text-[10px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(255,61,113,1)]",
				title: "Engagement relative to the creator's own following",
				children: mult
			})
		]
	});
}
function BookmarkButton({ video, onToggleBookmark, bookmarking = false }) {
	if (!onToggleBookmark || !video?.id) return null;
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick: () => onToggleBookmark(video),
		disabled: bookmarking,
		className: "btn-ghost h-11 px-4 text-sm",
		children: [
			/* @__PURE__ */ jsx(Bookmark, { filled: Boolean(video.bookmarked) }),
			" ",
			video.bookmarked ? "Bookmarked" : "Bookmark"
		]
	});
}
function FeaturedVideo({ video, onToggleBookmark, bookmarking = false }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "ring-gradient mt-5 flex flex-col gap-6 rounded-3xl bg-white/70 p-5 backdrop-blur-2xl sm:flex-row sm:p-6 dark:bg-white/[.04]",
		children: [/* @__PURE__ */ jsx(Thumb, {
			video,
			rank: video.rank,
			className: "aspect-[9/16] w-full shrink-0 sm:w-[160px] lg:w-[184px]"
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-1 flex-col",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-hot/25 bg-hot/10 px-2.5 py-1 font-display text-[10.5px] font-bold tracking-[.1em] text-hot uppercase",
					children: [/* @__PURE__ */ jsx(Trend, { className: "h-3 w-3" }), " Top video this period"]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-baseline gap-2",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-display text-[38px] leading-none font-bold tracking-[-.03em] text-hot sm:text-[46px]",
						children: compactNumber(video.views)
					}), /* @__PURE__ */ jsx("span", {
						className: "text-sm font-medium muted",
						children: "views"
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] muted",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ jsx(Heart, {}),
								" ",
								compactNumber(video.likes)
							]
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ jsx(Comment, {}),
								" ",
								compactNumber(video.comments)
							]
						}),
						video.uploaded_at && /* @__PURE__ */ jsx("span", { children: relativeTime(video.uploaded_at) }),
						video.followers > 0 && /* @__PURE__ */ jsxs("span", { children: [compactNumber(video.followers), " followers"] })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-4 text-sm font-semibold",
					children: video.handle ?? video.creator_name
				}),
				video.title && /* @__PURE__ */ jsx("p", {
					className: "mt-2 line-clamp-3 text-[13.5px] leading-relaxed muted",
					children: video.title
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ jsxs("a", {
						href: video.post_url,
						target: "_blank",
						rel: "noreferrer noopener",
						className: "btn-accent h-12 px-5 text-sm",
						children: ["View on TikTok ", /* @__PURE__ */ jsx(Arrow, {})]
					}), /* @__PURE__ */ jsx(BookmarkButton, {
						video,
						onToggleBookmark,
						bookmarking
					})]
				})
			]
		})]
	});
}
function GridVideo({ video, onToggleBookmark, bookmarking = false }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "group",
		children: [/* @__PURE__ */ jsx(Thumb, {
			video,
			rank: video.rank,
			className: "aspect-[9/16] w-full"
		}), /* @__PURE__ */ jsxs("div", {
			className: "pt-3",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1.5 font-display text-[16px] font-bold text-hot",
					children: [
						/* @__PURE__ */ jsx(Trend, { className: "h-3 w-3" }),
						" ",
						compactNumber(video.views)
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-1.5 flex gap-3 text-[11.5px] faint",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ jsx(Heart, { className: "h-3 w-3" }),
							" ",
							compactNumber(video.likes)
						]
					}), /* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ jsx(Comment, { className: "h-3 w-3" }),
							" ",
							compactNumber(video.comments)
						]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-2 truncate text-[12.5px] muted",
					children: video.handle ?? video.creator_name
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ jsxs("a", {
						href: video.post_url,
						target: "_blank",
						rel: "noreferrer noopener",
						className: "inline-flex items-center gap-1 text-xs font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow",
						children: ["View on TikTok ", /* @__PURE__ */ jsx(Arrow, { className: "h-3 w-3" })]
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onToggleBookmark?.(video),
						disabled: !onToggleBookmark || bookmarking,
						className: "inline-flex items-center gap-1 text-xs font-semibold muted",
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
function createSavedSearch({ phrase, name, keywords, frequency }) {
	return request(`${API_V1}/saved-searches`, {
		method: "POST",
		body: {
			phrase,
			name,
			keywords,
			frequency
		}
	});
}
function fetchNotifications(ids) {
	return request(`${API_V1}/saved-searches/notifications?${ids.map((id) => `ids[]=${encodeURIComponent(id)}`).join("&")}`);
}
var savedSearch = {
	get: (id) => request(`${API_V1}/saved-searches/${id}/json`),
	pause: (id) => request(`${API_V1}/saved-searches/${id}/pause`, { method: "PATCH" }),
	resume: (id) => request(`${API_V1}/saved-searches/${id}/resume`, { method: "PATCH" }),
	update: (id, body) => request(`${API_V1}/saved-searches/${id}/frequency`, {
		method: "PATCH",
		body
	}),
	refresh: (id) => request(`${API_V1}/saved-searches/${id}/refresh`, { method: "POST" }),
	destroy: (id) => request(`${API_V1}/saved-searches/${id}`, { method: "DELETE" })
};
var billing = { checkout: (slug) => {
	window.location.assign(`/billing/checkout/${encodeURIComponent(slug)}`);
} };
var bookmarks = {
	save: (id) => request(`${API_V1}/videos/${id}/bookmark`, { method: "POST" }),
	remove: (id) => request(`${API_V1}/videos/${id}/bookmark`, { method: "DELETE" })
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
function untrackSearch(id) {
	writeTracked(readTracked().filter((t) => String(t.id) !== String(id)));
}
//#endregion
//#region resources/js/landing/flow/screens/ResultsScreen.jsx
var PAGE_STEP = 12;
function EmptyState({ phrase, onRefresh, refreshing }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "ring-gradient mt-6 rounded-3xl bg-white/70 p-10 text-center backdrop-blur-2xl dark:bg-white/[.04]",
		children: [
			/* @__PURE__ */ jsx("h2", {
				className: "font-display text-[20px] font-bold",
				children: "No videos cleared the bar"
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed muted",
				children: [
					"We scanned TikTok for ",
					/* @__PURE__ */ jsx("b", {
						className: "text-ink dark:text-white",
						children: phrase
					}),
					" but nothing matched the phrase with a real creator behind it. Narrower phrases and brand names often do this - try a broader one, or refresh to pull again."
				]
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: onRefresh,
				disabled: refreshing,
				className: "btn-ghost mx-auto mt-6 h-11 px-5 text-sm",
				children: refreshing ? "Refreshing..." : "Run it again"
			})
		]
	});
}
function LoginGate({ resultCount }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "ring-gradient relative mt-6 overflow-hidden rounded-3xl bg-white/72 p-8 backdrop-blur-2xl dark:bg-white/[.04]",
		children: [
			/* @__PURE__ */ jsx("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0",
				children: /* @__PURE__ */ jsx("div", { className: "absolute inset-x-8 top-6 h-32 rounded-full bg-accent/12 blur-3xl" })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative mx-auto max-w-2xl text-center",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent dark:text-accent-glow",
						children: "Results locked"
					}),
					/* @__PURE__ */ jsx("h2", {
						className: "mt-4 font-display text-[24px] font-bold tracking-[-.025em] sm:text-[30px]",
						children: "Sign in to view the matched videos"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mx-auto mt-3 max-w-lg text-[14px] leading-relaxed muted",
						children: [
							"We found ",
							compactNumber(resultCount),
							" videos for this search. Continue with Google to unlock the featured result, ranked list, and outbound TikTok links."
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row",
						children: [/* @__PURE__ */ jsxs("a", {
							href: "/auth/google",
							className: "btn-accent h-12 px-5 text-sm",
							children: ["Continue with Google ", /* @__PURE__ */ jsx(Arrow, {})]
						}), /* @__PURE__ */ jsx("a", {
							href: "/trial",
							className: "btn-ghost h-12 px-5 text-sm",
							children: "Start free trial"
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4",
				children: Array.from({ length: Math.min(Math.max(resultCount, 4), 8) }).map((_, index) => /* @__PURE__ */ jsxs("div", {
					"aria-hidden": "true",
					className: "overflow-hidden rounded-2xl border border-black/[.06] bg-black/[.03] p-2.5 dark:border-white/[.08] dark:bg-white/[.04]",
					children: [
						/* @__PURE__ */ jsx("div", { className: "aspect-[9/16] rounded-xl bg-linear-to-br from-black/8 via-black/4 to-transparent blur-[0.2px] dark:from-white/10 dark:via-white/5" }),
						/* @__PURE__ */ jsx("div", { className: "mt-3 h-3 w-16 rounded-full bg-black/10 dark:bg-white/10" }),
						/* @__PURE__ */ jsx("div", { className: "mt-2 h-2.5 w-24 rounded-full bg-black/7 dark:bg-white/7" })
					]
				}, index))
			})
		]
	});
}
function ResultsScreen({ search, isAuthenticated = false, billingState = null, onStartTrial, onRefresh, refreshing = false, freeSearch = true }) {
	const [visible, setVisible] = useState(13);
	const [copied, setCopied] = useState(false);
	const [bookmarkingId, setBookmarkingId] = useState(null);
	const [items, setItems] = useState(search?.results ?? []);
	const results = items;
	const [featured, ...rest] = results;
	const shown = rest.slice(0, Math.max(visible - 1, 0));
	const share = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2e3);
		} catch {}
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
	return /* @__PURE__ */ jsxs("div", {
		className: "animate-fade-up",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [freeSearch ? /* @__PURE__ */ jsx("p", {
					className: "inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent dark:text-accent-glow",
					children: "* This is your 1 free search"
				}) : /* @__PURE__ */ jsxs("p", {
					className: "inline-flex items-center gap-2 rounded-full border border-black/[.08] px-3 py-1 text-[12px] font-semibold muted dark:border-white/[.12]",
					children: ["Refreshes ", search?.frequency ?? "weekly"]
				}), /* @__PURE__ */ jsxs("button", {
					onClick: share,
					className: "btn-ghost h-10 px-3.5 text-[13px]",
					children: [
						copied ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Share, {}),
						" ",
						copied ? "Link copied" : "Share"
					]
				})]
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "mt-4 font-display text-[28px] leading-tight font-bold tracking-[-.025em] sm:text-[36px]",
				children: search?.name ?? "Recent viral videos"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "rounded-xl bg-ink px-3 py-1.5 text-[12.5px] font-semibold text-white dark:bg-white dark:text-ink",
					children: search?.phrase
				}), (search?.keywords ?? []).filter((k) => k !== search?.phrase).slice(0, 5).map((k) => /* @__PURE__ */ jsxs("span", {
					className: "rounded-xl border border-black/[.06] bg-black/[.03] px-3 py-1.5 text-[12.5px] muted dark:border-white/[.08] dark:bg-white/[.06]",
					children: ["+ ", k]
				}, k))]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-black/[.06] py-3 dark:border-white/[.07]",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "text-[12.5px] faint",
					children: [
						search?.scanned_count > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
							/* @__PURE__ */ jsx("b", {
								className: "muted",
								children: compactNumber(search.scanned_count)
							}),
							" videos scanned ·",
							" "
						] }),
						/* @__PURE__ */ jsx("b", {
							className: "muted",
							children: results.length
						}),
						" matched your keywords"
					]
				}), /* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-2 rounded-lg border border-black/[.08] px-3 py-1.5 text-[12.5px] font-semibold dark:border-white/[.12]",
					children: [/* @__PURE__ */ jsx(Trend, { className: "h-3 w-3 text-hot" }), " Sorted by outlier score"]
				})]
			}),
			results.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
				phrase: search?.phrase,
				onRefresh,
				refreshing
			}) : !isAuthenticated ? /* @__PURE__ */ jsx(LoginGate, { resultCount: results.length }) : /* @__PURE__ */ jsxs(Fragment, { children: [
				billingState && /* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-black/[.06] bg-black/[.03] px-4 py-3 text-[12.5px] muted dark:border-white/[.08] dark:bg-white/[.04]",
					children: [
						/* @__PURE__ */ jsxs("span", { children: ["Plan ", /* @__PURE__ */ jsx("b", {
							className: "text-ink dark:text-white capitalize",
							children: billingState.currentPlan
						})] }),
						/* @__PURE__ */ jsx("span", { children: "·" }),
						/* @__PURE__ */ jsxs("span", { children: [
							billingState.searchCreditsRemaining,
							" / ",
							billingState.searchCreditsLimit,
							" credits left"
						] }),
						/* @__PURE__ */ jsx("span", { children: "·" }),
						/* @__PURE__ */ jsxs("span", { children: [
							billingState.bookmarkCount,
							billingState.bookmarkLimit === -1 ? "" : ` / ${billingState.bookmarkLimit}`,
							" bookmarks"
						] })
					]
				}),
				/* @__PURE__ */ jsx(FeaturedVideo, {
					video: featured,
					onToggleBookmark: toggleBookmark,
					bookmarking: bookmarkingId === featured?.id
				}),
				shown.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h2", {
					className: "mt-10 font-display text-[11px] font-semibold tracking-[.14em] uppercase faint",
					children: "More viral videos"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4",
					children: shown.map((v) => /* @__PURE__ */ jsx(GridVideo, {
						video: v,
						onToggleBookmark: toggleBookmark,
						bookmarking: bookmarkingId === v.id
					}, v.id))
				})] }),
				visible < results.length && /* @__PURE__ */ jsx("button", {
					onClick: () => setVisible((v) => v + PAGE_STEP),
					className: "btn-ghost mx-auto mt-8 flex h-12 px-6 text-sm",
					children: "Load more"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mt-3 text-center text-xs faint",
					children: [
						"Showing ",
						Math.min(visible, results.length),
						" of ",
						results.length
					]
				})
			] }),
			freeSearch && /* @__PURE__ */ jsxs("div", {
				className: "relative mt-10 isolate flex flex-col gap-5 overflow-hidden rounded-3xl bg-ink p-7 sm:flex-row sm:items-center sm:justify-between dark:bg-white/[.05]",
				children: [
					/* @__PURE__ */ jsx("div", {
						"aria-hidden": true,
						className: "pointer-events-none absolute inset-0 -z-10",
						children: /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 h-[220px] w-[420px] translate-x-1/4 -translate-y-1/3 rounded-full bg-accent/45 blur-[110px]" })
					}),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "font-display text-[17px] font-bold text-white",
						children: "Want another search, or weekly tracking?"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1.5 text-[13.5px] text-white/60",
						children: "Basic includes 150 credits and 50 bookmarks. Premium includes 400 credits and unlimited bookmarks."
					})] }),
					/* @__PURE__ */ jsxs("button", {
						onClick: onStartTrial,
						className: "btn-accent h-[52px] shrink-0 px-6 text-[15px]",
						children: ["Start free trial ", /* @__PURE__ */ jsx(Arrow, {})]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/SavedSearches/Show.jsx
var Show_exports = /* @__PURE__ */ __exportAll({ default: () => Show });
var PILL = {
	scraping: {
		text: "Refreshing",
		tone: "ok"
	},
	done: {
		text: "Free result",
		tone: "accent"
	},
	paused: {
		text: "Paused",
		tone: "ok"
	},
	failed: {
		text: "Last run failed",
		tone: "accent"
	}
};
function Show({ search: initial, isAuthenticated = false, billing }) {
	const [search, setSearch] = useState(initial);
	const [refreshing, setRefreshing] = useState(false);
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
		untrackSearch(search.id);
		router.visit("/saved-searches");
	};
	const togglePause = async () => {
		const { search: updated } = search.status === "paused" ? await savedSearch.resume(search.id) : await savedSearch.pause(search.id);
		setSearch((prev) => ({
			...prev,
			...updated
		}));
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: `${search.name} — VVF` }), /* @__PURE__ */ jsxs(SearchShell, {
		pill: PILL[search.status] ?? PILL.done,
		step: "results",
		onNewSearch: () => router.visit("/"),
		onExit: () => router.visit("/saved-searches"),
		children: [/* @__PURE__ */ jsx(ResultsScreen, {
			search,
			isAuthenticated,
			billingState: billing,
			refreshing,
			onRefresh: refresh,
			onStartTrial: () => router.visit("/trial")
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-black/[.06] pt-6 dark:border-white/[.07]",
			children: [/* @__PURE__ */ jsx("p", {
				className: "text-[12.5px] faint",
				children: search.status === "paused" ? "Paused — no refreshes will run." : search.next_run_at ? `Next refresh ${new Date(search.next_run_at).toLocaleDateString()}` : "No refresh scheduled."
			}), /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ jsx("button", {
						onClick: togglePause,
						className: "btn-ghost h-10 px-4 text-[13px]",
						children: search.status === "paused" ? "Resume" : "Pause"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: refresh,
						disabled: refreshing || search.status === "scraping",
						className: "btn-ghost h-10 px-4 text-[13px]",
						children: "Refresh now"
					}),
					/* @__PURE__ */ jsx("button", {
						onClick: remove,
						className: "h-10 rounded-xl border border-hot/30 px-4 text-[13px] font-semibold text-hot transition hover:bg-hot/10",
						children: "Delete"
					})
				]
			})]
		})]
	})] });
}
//#endregion
//#region resources/js/landing/flow/screens/KeywordsScreen.jsx
var FREQUENCIES = [{
	value: "weekly",
	label: "Weekly",
	hint: "Fresh viral videos every week. Best for fast-moving categories."
}, {
	value: "monthly",
	label: "Monthly",
	hint: "A monthly pull. Lighter cadence for slower niches."
}];
function KeywordChip({ value, selected, onToggle, onRemove }) {
	return /* @__PURE__ */ jsxs("span", {
		className: `group inline-flex items-center rounded-xl border text-[13.5px] transition-all duration-300 ${selected ? "border-accent/50 bg-accent/10 font-semibold text-accent shadow-[0_8px_22px_-14px_rgba(109,75,255,.9)] dark:text-accent-glow" : "border-black/[.09] hover:-translate-y-px hover:border-accent/35 dark:border-white/[.12]"}`,
		children: [/* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: onToggle,
			"aria-pressed": selected,
			className: "flex items-center gap-2.5 py-2.5 pr-2 pl-3.5",
			children: [/* @__PURE__ */ jsx("span", {
				className: `flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${selected ? "border-accent bg-accent text-white" : "border-black/25 dark:border-white/30"}`,
				children: selected && /* @__PURE__ */ jsx(Check, {})
			}), value]
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: onRemove,
			"aria-label": `Remove ${value}`,
			title: "Remove",
			className: "py-2.5 pr-3 pl-1 opacity-35 transition-opacity duration-200 hover:opacity-100",
			children: /* @__PURE__ */ jsx(Close, { className: "h-3.5 w-3.5" })
		})]
	});
}
function SkeletonChips() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex flex-wrap gap-2",
		"aria-hidden": true,
		children: [
			132,
			108,
			156,
			96,
			140,
			118
		].map((width, i) => /* @__PURE__ */ jsx("span", {
			className: "h-[42px] animate-pulse rounded-xl bg-black/[.05] dark:bg-white/[.06]",
			style: { width }
		}, i))
	});
}
function KeywordsScreen({ phrase, onBack, onSubmit, submitting = false, error = null }) {
	const [terms, setTerms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [expansionSource, setExpansionSource] = useState(null);
	const [draft, setDraft] = useState("");
	const [frequency, setFrequency] = useState("weekly");
	const [name, setName] = useState(phrase);
	const requested = useRef(false);
	useEffect(() => {
		if (requested.current) return void 0;
		requested.current = true;
		const controller = new AbortController();
		expandKeywords(phrase, { signal: controller.signal }).then((payload) => {
			const keywords = Array.isArray(payload?.keywords) ? payload.keywords : [phrase];
			setExpansionSource(payload?.source ?? null);
			setTerms(keywords.map((value, i) => ({
				value,
				selected: i <= 2,
				locked: i === 0
			})));
		}).catch(() => {
			setTerms([{
				value: phrase,
				selected: true,
				locked: true
			}]);
		}).finally(() => setLoading(false));
		return () => controller.abort();
	}, [phrase]);
	const selected = terms.filter((t) => t.selected).map((t) => t.value);
	const toggle = (value) => setTerms((prev) => prev.map((t) => t.value === value && !t.locked ? {
		...t,
		selected: !t.selected
	} : t));
	const remove = (value) => setTerms((prev) => prev.filter((t) => t.value !== value || t.locked));
	const add = (e) => {
		e.preventDefault();
		const value = draft.trim().replace(/\s+/g, " ");
		if (!value) return;
		const match = terms.find((t) => t.value.toLowerCase() === value.toLowerCase());
		if (match) setTerms((prev) => prev.map((t) => t.value === match.value ? {
			...t,
			selected: true
		} : t));
		else if (terms.length < 12) setTerms((prev) => [...prev, {
			value,
			selected: true
		}]);
		setDraft("");
	};
	const atKeywordCap = terms.length >= 12;
	return /* @__PURE__ */ jsxs("div", {
		className: "animate-fade-up mx-auto max-w-3xl",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: onBack,
				className: "text-[13px] font-semibold muted transition hover:text-accent",
				children: "← Back"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 flex flex-wrap items-center gap-2.5",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-[13px] muted",
					children: "Researching"
				}), /* @__PURE__ */ jsx("span", {
					className: "inline-flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2 text-[13.5px] font-semibold text-white shadow-[0_10px_26px_-14px_rgba(0,0,0,.8)] dark:bg-white dark:text-ink",
					children: phrase
				})]
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "mt-7 font-display text-[26px] leading-tight font-bold tracking-[-.02em] sm:text-[32px]",
				children: "Add terms to widen the pull"
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "mt-2.5 text-[13.5px] muted",
				children: [
					"We scrape broadly on ",
					/* @__PURE__ */ jsx("b", {
						className: "text-ink dark:text-white",
						children: phrase
					}),
					", then use everything you tick here to filter and rank what comes back. Keywords are fixed once the search is saved."
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ring-gradient mt-7 rounded-3xl bg-white/70 p-5 backdrop-blur-2xl sm:p-6 dark:bg-white/[.04]",
				children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", {
					className: "mb-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-accent dark:text-accent-glow",
					children: [/* @__PURE__ */ jsx("span", { className: "h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" }), "Suggesting keywords…"]
				}), /* @__PURE__ */ jsx(SkeletonChips, {})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap gap-2",
						children: terms.map(({ value, selected: on, locked }) => locked ? /* @__PURE__ */ jsxs("span", {
							title: "The primary phrase is always included",
							className: "inline-flex items-center gap-2.5 rounded-xl border border-accent/50 bg-accent/10 py-2.5 pr-3.5 pl-3.5 text-[13.5px] font-semibold text-accent dark:text-accent-glow",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-accent bg-accent text-white",
									children: /* @__PURE__ */ jsx(Check, {})
								}),
								value,
								/* @__PURE__ */ jsx("span", {
									className: "text-[10.5px] font-bold tracking-wider uppercase opacity-60",
									children: "primary"
								})
							]
						}, value) : /* @__PURE__ */ jsx(KeywordChip, {
							value,
							selected: on,
							onToggle: () => toggle(value),
							onRemove: () => remove(value)
						}, value))
					}),
					/* @__PURE__ */ jsxs("form", {
						onSubmit: add,
						className: "mt-5 flex max-w-md gap-2",
						children: [/* @__PURE__ */ jsx("input", {
							value: draft,
							onChange: (e) => setDraft(e.target.value),
							placeholder: atKeywordCap ? "Keyword limit reached" : "Add your own keyword",
							"aria-label": "Add your own keyword",
							disabled: atKeywordCap,
							className: "field h-11 flex-1 text-sm"
						}), /* @__PURE__ */ jsxs("button", {
							type: "submit",
							disabled: !draft.trim() || atKeywordCap,
							className: "btn-ghost h-11 px-4 text-sm",
							children: [/* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }), " Add"]
						})]
					}),
					expansionSource === "fallback" && /* @__PURE__ */ jsx("p", {
						className: "mt-3 text-[12px] faint",
						children: "Suggestions came from templates this time — edit them freely."
					})
				] })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-6 grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
					htmlFor: "search-name",
					className: "block text-[12.5px] font-semibold",
					children: "Search name"
				}), /* @__PURE__ */ jsx("input", {
					id: "search-name",
					value: name,
					maxLength: 80,
					onChange: (e) => setName(e.target.value),
					className: "field mt-2 h-11 text-sm"
				})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
					className: "block text-[12.5px] font-semibold",
					children: "Refresh"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-2 flex gap-2",
					children: FREQUENCIES.map((f) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setFrequency(f.value),
						title: f.hint,
						className: `h-11 flex-1 rounded-xl border text-[13.5px] font-semibold transition-all duration-300 ${frequency === f.value ? "border-accent/50 bg-accent/10 text-accent dark:text-accent-glow" : "border-black/[.09] muted hover:border-accent/35 dark:border-white/[.12]"}`,
						children: f.label
					}, f.value))
				})] })]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2.5 text-[12px] faint",
				children: FREQUENCIES.find((f) => f.value === frequency)?.hint
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: "mt-4 rounded-xl border border-hot/30 bg-hot/10 px-4 py-3 text-[13px] text-hot",
				children: error
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-8 flex flex-col gap-4 border-t border-black/[.06] pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/[.07]",
				children: [/* @__PURE__ */ jsxs("p", {
					className: "text-[13px] muted",
					children: [
						/* @__PURE__ */ jsx("b", {
							className: "font-display text-[15px] text-ink dark:text-white",
							children: selected.length
						}),
						" keyword",
						selected.length === 1 ? "" : "s",
						" · 1 search covers everything you select"
					]
				}), /* @__PURE__ */ jsxs("button", {
					onClick: () => onSubmit({
						keywords: selected,
						frequency,
						name: name.trim() || phrase
					}),
					disabled: loading || submitting || selected.length === 0,
					className: "btn-accent h-[52px] px-7 text-[15px]",
					children: [
						submitting ? "Starting…" : "Run search",
						" ",
						/* @__PURE__ */ jsx(Arrow, {})
					]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Search/Keywords.jsx
var Keywords_exports = /* @__PURE__ */ __exportAll({ default: () => Keywords });
function Keywords({ phrase }) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const submit = async ({ keywords, frequency, name }) => {
		setSubmitting(true);
		setError(null);
		try {
			const created = await createSavedSearch({
				phrase,
				name,
				keywords,
				frequency
			});
			trackSearch({
				id: created.id,
				name: created.name,
				url: created.url
			});
			router.visit(`/search/running?id=${created.id}`);
		} catch (e) {
			setError(e.message || "Could not start the search. Try again.");
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Add keywords — VVF" }), /* @__PURE__ */ jsx(SearchShell, {
		pill: {
			text: "1 free search",
			tone: "ok"
		},
		step: "keywords",
		onNewSearch: () => router.visit("/"),
		onExit: () => router.visit("/"),
		children: /* @__PURE__ */ jsx(KeywordsScreen, {
			phrase,
			submitting,
			error,
			onBack: () => router.visit("/"),
			onSubmit: submit
		})
	})] });
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
function RunningScreen({ searchId, onBack, onDone }) {
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
	return /* @__PURE__ */ jsxs("div", {
		className: "animate-fade-up",
		children: [/* @__PURE__ */ jsx("button", {
			onClick: onBack,
			className: "text-[13px] font-semibold muted transition hover:text-accent",
			children: "← Back to keywords"
		}), /* @__PURE__ */ jsx("div", {
			className: "mx-auto mt-8 max-w-md text-center",
			children: failed ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("span", {
					className: "inline-flex items-center gap-2.5 rounded-full border border-hot/25 bg-hot/10 px-4 py-2 text-[12.5px] font-semibold text-hot",
					children: "Search failed"
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-7 font-display text-[26px] leading-tight font-bold tracking-[-.02em] sm:text-[32px]",
					children: "That run didn't finish"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-[14.5px] muted",
					children: failed
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: onBack,
					className: "btn-ghost mx-auto mt-7 h-[52px] px-6 text-[15px]",
					children: "Edit keywords and retry"
				})
			] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-2.5 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-[12.5px] font-semibold text-accent dark:text-accent-glow",
					children: [/* @__PURE__ */ jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" }), "Search running · 1 to 20 min"]
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-7 font-display text-[26px] leading-tight font-bold tracking-[-.02em] sm:text-[32px]",
					children: search?.name ? `Scouting “${search.name}”` : "Scouting your niche"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-[14.5px] muted",
					children: "We'll show the results right here the moment they're ready."
				}),
				/* @__PURE__ */ jsx("ol", {
					className: "mx-auto mt-8 max-w-sm space-y-2.5 text-left",
					children: STAGES.map((label, i) => {
						const state = i < stage ? "done" : i === stage ? "active" : "pending";
						return /* @__PURE__ */ jsxs("li", {
							className: `flex items-center gap-3 rounded-xl border px-4 py-3 text-[13.5px] transition-all duration-500 ${state === "pending" ? "border-black/[.06] faint dark:border-white/[.07]" : "border-accent/25 bg-accent/[.06]"}`,
							children: [/* @__PURE__ */ jsx("span", {
								className: `flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${state === "done" ? "bg-accent text-white" : state === "active" ? "border-2 border-accent border-t-transparent animate-spin" : "border border-black/15 dark:border-white/20"}`,
								children: state === "done" && /* @__PURE__ */ jsx(Check, { className: "h-2.5 w-2.5" })
							}), label]
						}, label);
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "ring-gradient mt-8 rounded-3xl bg-white/70 p-6 text-left backdrop-blur-2xl dark:bg-white/[.04]",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "mb-4 text-center font-display text-sm font-semibold",
							children: "Or have them emailed when they're done"
						}),
						/* @__PURE__ */ jsxs("button", {
							className: "btn-ghost h-[52px] w-full text-[15px]",
							children: [/* @__PURE__ */ jsx(Google, {}), " Continue with Google"]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "my-4 flex items-center gap-3 text-xs faint",
							children: [
								/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-black/[.08] dark:bg-white/10" }),
								"or",
								/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-black/[.08] dark:bg-white/10" })
							]
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: (e) => {
								e.preventDefault();
								setEmailSaved(true);
							},
							className: "flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ jsx("input", {
								type: "email",
								required: true,
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "you@brand.com",
								className: "field h-[52px] flex-1"
							}), /* @__PURE__ */ jsxs("button", {
								type: "submit",
								className: "btn-accent h-[52px] px-5 text-[15px]",
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
					className: "mt-5 text-[12.5px] leading-relaxed faint",
					children: "Safe to close this tab — the search keeps running and stays in your saved searches."
				})
			] })
		})]
	});
}
//#endregion
//#region resources/js/Pages/Search/Running.jsx
var Running_exports = /* @__PURE__ */ __exportAll({ default: () => Running });
function Running({ searchId }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Search running — VVF" }), /* @__PURE__ */ jsx(SearchShell, {
		pill: {
			text: "Search running",
			tone: "ok"
		},
		step: "running",
		onNewSearch: () => router.visit("/"),
		onExit: () => router.visit("/"),
		children: /* @__PURE__ */ jsx(RunningScreen, {
			searchId,
			onBack: () => router.visit("/"),
			onDone: () => router.visit(`/saved-searches/${searchId}`)
		})
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
			window.location.assign("/auth/google");
			return;
		}
		billing.checkout(slug);
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
					children: "Basic gives you 150 search credits and 50 bookmarks. Premium gives you 400 search credits and unlimited bookmarks."
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
							/* @__PURE__ */ jsxs("p", {
								className: "mt-3 font-display text-[32px] leading-none font-bold tracking-[-.03em]",
								children: [
									"$",
									t.price,
									/* @__PURE__ */ jsx("span", {
										className: "text-[13px] font-medium muted",
										children: "/mo"
									})
								]
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-4 text-[12px] faint",
								children: [
									t.searchCreditsLimit,
									" credits · ",
									t.bookmarkLimit === -1 ? "Unlimited" : t.bookmarkLimit,
									" bookmarks"
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
									t.cta,
									" ",
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
						" plan ",
						/* @__PURE__ */ jsx(Arrow, {})
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-4 text-xs faint",
					children: "Checkout uses Stripe subscriptions. Sign in first if you want the subscription attached to your account."
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Trial.jsx
var Trial_exports = /* @__PURE__ */ __exportAll({ default: () => Trial });
function Trial() {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Start your trial — VVF" }), /* @__PURE__ */ jsx(SearchShell, {
		pill: {
			text: "Trial",
			tone: "accent"
		},
		onNewSearch: () => router.visit("/"),
		onExit: () => router.visit("/"),
		children: /* @__PURE__ */ jsx(TrialScreen, {
			backLabel: "Back to home",
			onBack: () => router.visit("/")
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
			"./Pages/Auth/Login.jsx": Login_exports,
			"./Pages/Auth/Register.jsx": Register_exports,
			"./Pages/Dashboard.jsx": Dashboard_exports,
			"./Pages/Home.jsx": Home_exports,
			"./Pages/Landing.jsx": Landing_exports,
			"./Pages/SavedSearches/Index.jsx": Index_exports,
			"./Pages/SavedSearches/Show.jsx": Show_exports,
			"./Pages/Search/Keywords.jsx": Keywords_exports,
			"./Pages/Search/Running.jsx": Running_exports,
			"./Pages/Trial.jsx": Trial_exports
		}))[`./Pages/${name}.jsx`];
	},
	setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
}));
//#endregion
export {};
