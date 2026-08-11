import { Head, Link, createInertiaApp, router, useForm, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
//#region resources/js/Pages/components/AppFooter.jsx
var AppFooter_exports = /* @__PURE__ */ __exportAll({ default: () => AppFooter });
var FOOT_NAV = [
	{
		label: "Home",
		href: "/"
	},
	{
		label: "Watchlist",
		href: "/saved-searches"
	},
	{
		label: "Pricing",
		href: "/trial"
	}
];
/**
* Shared footer that sits under the content column in AppLayout. Hidden on
* mobile, where the bottom tab bar owns that space instead.
*/
function AppFooter({ label = "© Outlier Vault - find outlier videos daily", className = "" }) {
	const { billing = {} } = usePage().props;
	const navItems = FOOT_NAV.filter((item) => item.href !== "/trial" || (billing.trialEligible ?? true));
	return /* @__PURE__ */ jsx("footer", {
		className: `border-t border-black/[.06] dark:border-white/[.08] ${className}`.trim(),
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8",
			children: [/* @__PURE__ */ jsx("nav", {
				className: "flex flex-wrap items-center gap-1",
				children: navItems.map((item) => /* @__PURE__ */ jsx(Link, {
					href: item.href,
					className: "rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold muted transition hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.06] dark:hover:text-white",
					children: item.label
				}, item.href))
			}), /* @__PURE__ */ jsx("p", {
				className: "text-[12px] faint",
				children: label
			})]
		})
	});
}
//#endregion
//#region resources/js/Pages/Auth/Login.jsx
var Login_exports = /* @__PURE__ */ __exportAll({ default: () => Login });
function GoogleMark$1() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		className: "h-5 w-5",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ jsx("path", {
				fill: "#EA4335",
				d: "M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2H12z"
			}),
			/* @__PURE__ */ jsx("path", {
				fill: "#34A853",
				d: "M12 22c2.6 0 4.7-.8 6.3-2.4l-3.1-2.4c-.8.6-1.9 1-3.2 1-2.4 0-4.5-1.7-5.2-3.9l-3.2 2.5C5.2 19.8 8.3 22 12 22z"
			}),
			/* @__PURE__ */ jsx("path", {
				fill: "#4A90E2",
				d: "M6.8 14.3c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3.6 8.2C2.9 9.6 2.5 11 2.5 12.5s.4 2.9 1.1 4.3l3.2-2.5z"
			}),
			/* @__PURE__ */ jsx("path", {
				fill: "#FBBC05",
				d: "M12 6.8c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.7 3.8 14.6 3 12 3 8.3 3 5.2 5.2 3.6 8.2l3.2 2.5c.7-2.2 2.8-3.9 5.2-3.9z"
			})
		]
	});
}
function PasswordField$1({ value, onChange, placeholder, autoComplete }) {
	const [visible, setVisible] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsx("input", {
			type: visible ? "text" : "password",
			value,
			onChange,
			className: "field h-12 pr-12 text-[14px]",
			placeholder,
			autoComplete
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setVisible((current) => !current),
			"aria-label": visible ? "Hide password" : "Show password",
			className: "absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 transition hover:bg-black/[.04] hover:text-ink dark:text-white/40 dark:hover:bg-white/[.06] dark:hover:text-white",
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Sign in - Outlier Vault" }), /* @__PURE__ */ jsxs("div", {
		className: "vvf-landing relative flex min-h-screen flex-col overflow-hidden px-4 py-10 sm:px-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 -z-10",
				children: [/* @__PURE__ */ jsx("div", { className: "bg-grid mask-radial-fade absolute inset-0" }), /* @__PURE__ */ jsx("div", { className: "absolute top-[-12%] left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-accent/16 blur-[150px]" })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto flex w-full max-w-5xl items-center justify-between",
				children: [/* @__PURE__ */ jsx(Link, {
					href: "/",
					className: "font-display text-[20px] font-bold tracking-[-.02em]",
					children: "Outlier Vault"
				}), /* @__PURE__ */ jsx(Link, {
					href: "/register",
					className: "btn-ghost h-10 px-4 text-sm",
					children: "Sign up"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto mt-12 flex w-full max-w-5xl flex-1 items-center justify-center",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-[430px] rounded-[26px] border border-black/[.06] bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(16,18,32,.42)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-9",
					children: [
						/* @__PURE__ */ jsxs("h1", {
							className: "font-display text-[30px] font-bold tracking-[-.04em] text-ink sm:text-[40px] dark:text-white",
							children: ["Welcome ", /* @__PURE__ */ jsx("span", {
								className: "text-[#3568f3] italic",
								children: "back"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[15px] muted",
							children: "Sign in to continue growing your channel."
						}),
						flash.status && /* @__PURE__ */ jsx("div", {
							className: "mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300",
							children: flash.status
						}),
						/* @__PURE__ */ jsxs("a", {
							href: "/auth/google",
							className: "mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#2f2a2a] px-5 text-[15px] font-semibold text-white shadow-[0_18px_40px_-26px_rgba(0,0,0,.55)] transition hover:opacity-95",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex h-8 w-8 items-center justify-center rounded-full bg-white",
								children: /* @__PURE__ */ jsx(GoogleMark$1, {})
							}), "Continue with Google"]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6 flex items-center gap-4",
							children: [
								/* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-black/[.08] dark:bg-white/[.1]" }),
								/* @__PURE__ */ jsx("span", {
									className: "text-[12px] font-semibold tracking-[.14em] faint uppercase",
									children: "Or"
								}),
								/* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-black/[.08] dark:bg-white/[.1]" })
							]
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: submit,
							className: "mt-6 space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[14px] font-semibold text-ink dark:text-white",
										children: "Email"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "email",
										value: form.data.email,
										onChange: (event) => form.setData("email", event.target.value),
										className: "field h-12 text-[14px]",
										placeholder: "you@example.com",
										autoComplete: "email"
									}),
									form.errors.email && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-hot",
										children: form.errors.email
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsxs("div", {
										className: "mb-2 flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ jsx("label", {
											className: "text-[14px] font-semibold text-ink dark:text-white",
											children: "Password"
										}), /* @__PURE__ */ jsx("button", {
											type: "button",
											className: "text-[13px] font-medium text-[#8d6b59] transition hover:opacity-80",
											children: "Forgot password?"
										})]
									}),
									/* @__PURE__ */ jsx(PasswordField$1, {
										value: form.data.password,
										onChange: (event) => form.setData("password", event.target.value),
										placeholder: "Enter your password",
										autoComplete: "current-password"
									}),
									form.errors.password && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-hot",
										children: form.errors.password
									})
								] }),
								/* @__PURE__ */ jsxs("label", {
									className: "flex items-center gap-3 pt-1 text-[13px] muted",
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
									className: "mt-2 h-12 w-full rounded-full bg-[#3568f3] text-[15px] font-semibold text-white shadow-[0_20px_45px_-26px_rgba(53,104,243,.8)] transition hover:opacity-95 disabled:opacity-50",
									children: form.processing ? "Signing in..." : "Sign in"
								})
							]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-6 text-center text-[14px] muted",
							children: [
								"Don't have an account?",
								" ",
								/* @__PURE__ */ jsx(Link, {
									href: "/register",
									className: "font-semibold text-[#3568f3] hover:underline",
									children: "Sign up free"
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx(AppFooter, {
				label: "Outlier Vault sign in",
				className: "mt-12"
			})
		]
	})] });
}
//#endregion
//#region resources/js/Pages/Auth/Register.jsx
var Register_exports = /* @__PURE__ */ __exportAll({ default: () => Register });
function GoogleMark() {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		className: "h-5 w-5",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ jsx("path", {
				fill: "#EA4335",
				d: "M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2H12z"
			}),
			/* @__PURE__ */ jsx("path", {
				fill: "#34A853",
				d: "M12 22c2.6 0 4.7-.8 6.3-2.4l-3.1-2.4c-.8.6-1.9 1-3.2 1-2.4 0-4.5-1.7-5.2-3.9l-3.2 2.5C5.2 19.8 8.3 22 12 22z"
			}),
			/* @__PURE__ */ jsx("path", {
				fill: "#4A90E2",
				d: "M6.8 14.3c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8L3.6 8.2C2.9 9.6 2.5 11 2.5 12.5s.4 2.9 1.1 4.3l3.2-2.5z"
			}),
			/* @__PURE__ */ jsx("path", {
				fill: "#FBBC05",
				d: "M12 6.8c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.7 3.8 14.6 3 12 3 8.3 3 5.2 5.2 3.6 8.2l3.2 2.5c.7-2.2 2.8-3.9 5.2-3.9z"
			})
		]
	});
}
function PasswordField({ value, onChange, placeholder, autoComplete }) {
	const [visible, setVisible] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsx("input", {
			type: visible ? "text" : "password",
			value,
			onChange,
			className: "field h-12 pr-12 text-[14px]",
			placeholder,
			autoComplete
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setVisible((current) => !current),
			"aria-label": visible ? "Hide password" : "Show password",
			className: "absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 transition hover:bg-black/[.04] hover:text-ink dark:text-white/40 dark:hover:bg-white/[.06] dark:hover:text-white",
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Sign up - Outlier Vault" }), /* @__PURE__ */ jsxs("div", {
		className: "vvf-landing relative flex min-h-screen flex-col overflow-hidden px-4 py-10 sm:px-6",
		children: [
			/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 -z-10",
				children: [/* @__PURE__ */ jsx("div", { className: "bg-grid mask-radial-fade absolute inset-0" }), /* @__PURE__ */ jsx("div", { className: "absolute top-[-12%] left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-hot/10 blur-[150px]" })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto flex w-full max-w-5xl items-center justify-between",
				children: [/* @__PURE__ */ jsx(Link, {
					href: "/",
					className: "font-display text-[20px] font-bold tracking-[-.02em]",
					children: "Outlier Vault"
				}), /* @__PURE__ */ jsx(Link, {
					href: "/login",
					className: "btn-ghost h-10 px-4 text-sm",
					children: "Sign in"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto mt-12 flex w-full max-w-5xl flex-1 items-center justify-center",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-[430px] rounded-[26px] border border-black/[.06] bg-white/90 p-8 shadow-[0_28px_90px_-50px_rgba(16,18,32,.42)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-9",
					children: [
						/* @__PURE__ */ jsxs("h1", {
							className: "font-display text-[30px] font-bold tracking-[-.04em] text-ink sm:text-[40px] dark:text-white",
							children: ["Create your ", /* @__PURE__ */ jsx("span", {
								className: "text-[#3568f3] italic",
								children: "account"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[15px] muted",
							children: "Sign up to start tracking viral videos with your team."
						}),
						/* @__PURE__ */ jsxs("a", {
							href: "/auth/google",
							className: "mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#2f2a2a] px-5 text-[15px] font-semibold text-white shadow-[0_18px_40px_-26px_rgba(0,0,0,.55)] transition hover:opacity-95",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex h-8 w-8 items-center justify-center rounded-full bg-white",
								children: /* @__PURE__ */ jsx(GoogleMark, {})
							}), "Continue with Google"]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6 flex items-center gap-4",
							children: [
								/* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-black/[.08] dark:bg-white/[.1]" }),
								/* @__PURE__ */ jsx("span", {
									className: "text-[12px] font-semibold tracking-[.14em] faint uppercase",
									children: "Or"
								}),
								/* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-black/[.08] dark:bg-white/[.1]" })
							]
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit: submit,
							className: "mt-6 space-y-4",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[14px] font-semibold text-ink dark:text-white",
										children: "Name"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "text",
										value: form.data.name,
										onChange: (event) => form.setData("name", event.target.value),
										className: "field h-12 text-[14px]",
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
										className: "mb-2 block text-[14px] font-semibold text-ink dark:text-white",
										children: "Email"
									}),
									/* @__PURE__ */ jsx("input", {
										type: "email",
										value: form.data.email,
										onChange: (event) => form.setData("email", event.target.value),
										className: "field h-12 text-[14px]",
										placeholder: "you@example.com",
										autoComplete: "email"
									}),
									form.errors.email && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-hot",
										children: form.errors.email
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "mb-2 block text-[14px] font-semibold text-ink dark:text-white",
										children: "Password"
									}),
									/* @__PURE__ */ jsx(PasswordField, {
										value: form.data.password,
										onChange: (event) => form.setData("password", event.target.value),
										placeholder: "Create a password",
										autoComplete: "new-password"
									}),
									form.errors.password && /* @__PURE__ */ jsx("p", {
										className: "mt-2 text-sm text-hot",
										children: form.errors.password
									})
								] }),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "mb-2 block text-[14px] font-semibold text-ink dark:text-white",
									children: "Confirm password"
								}), /* @__PURE__ */ jsx(PasswordField, {
									value: form.data.password_confirmation,
									onChange: (event) => form.setData("password_confirmation", event.target.value),
									placeholder: "Repeat your password",
									autoComplete: "new-password"
								})] }),
								/* @__PURE__ */ jsx("button", {
									type: "submit",
									disabled: form.processing,
									className: "mt-2 h-12 w-full rounded-full bg-[#3568f3] text-[15px] font-semibold text-white shadow-[0_20px_45px_-26px_rgba(53,104,243,.8)] transition hover:opacity-95 disabled:opacity-50",
									children: form.processing ? "Creating account..." : "Sign up"
								})
							]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-6 text-center text-[14px] muted",
							children: [
								"Already have an account?",
								" ",
								/* @__PURE__ */ jsx(Link, {
									href: "/login",
									className: "font-semibold text-[#3568f3] hover:underline",
									children: "Sign in"
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx(AppFooter, {
				label: "Outlier Vault sign up",
				className: "mt-12"
			})
		]
	})] });
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
var Google$1 = ({ className = "h-4 w-4" }) => /* @__PURE__ */ jsxs("svg", {
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
//#region resources/js/Pages/components/AppLayout.jsx
var AppLayout_exports = /* @__PURE__ */ __exportAll({ default: () => AppLayout });
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
* Primary sidebar navigation. Every entry points at a route that exists —
* "Brand searches" and "Competitor searches" seed the search flow with the
* matching `type`, which `routes/public.php` already accepts.
*/
var NAV$1 = [
	{
		label: "Watchlist",
		href: "/saved-searches",
		icon: Library,
		match: "/saved-searches",
		exact: "/saved-searches"
	},
	{
		label: "Brand searches",
		href: "/saved-searches?type=brand",
		icon: Store,
		match: "/saved-searches",
		exact: "/saved-searches?type=brand"
	},
	{
		label: "Competitor searches",
		href: "/saved-searches?type=competitor",
		icon: Target,
		match: "/saved-searches",
		exact: "/saved-searches?type=competitor"
	},
	{
		label: "Product searches",
		href: "/saved-searches?type=product",
		icon: Search,
		match: "/saved-searches",
		exact: "/saved-searches?type=product",
		locked: true
	},
	{
		label: "Plans",
		href: "/plans",
		icon: Spark,
		match: "/plans",
		exact: "/plans"
	}
];
var TABS = [
	{
		label: "Watchlist",
		href: "/saved-searches",
		icon: Library,
		match: "/saved-searches"
	},
	{
		label: "Search",
		href: "/search",
		icon: Search,
		match: "/search"
	},
	{
		label: "Account",
		href: "/settings/account",
		icon: User,
		match: "/settings"
	}
];
function isActive(currentUrl, match) {
	const path = (currentUrl || "/").split("?")[0];
	return match === "/" ? path === "/" : path.startsWith(match);
}
function SidebarSearch({ onSubmitted }) {
	const [phrase, setPhrase] = useState("");
	const submit = (event) => {
		event.preventDefault();
		const q = phrase.trim();
		if (!q) return;
		onSubmitted?.();
		router.visit(`/search?type=brand&q=${encodeURIComponent(q)}`);
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submit,
		className: "relative",
		children: [/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 faint" }), /* @__PURE__ */ jsx("input", {
			value: phrase,
			onChange: (event) => setPhrase(event.target.value),
			placeholder: "Search a brand or topic",
			"aria-label": "Search a brand or topic",
			className: "field h-11 pl-9 text-[13.5px]"
		})]
	});
}
function AffiliateCard() {
	return /* @__PURE__ */ jsxs("div", {
		title: "Affiliate program coming soon",
		className: "flex items-center justify-between gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[.08] px-3 py-2.5",
		children: [/* @__PURE__ */ jsxs("span", {
			className: "flex items-center gap-2 text-[13px] font-semibold text-emerald-700 dark:text-emerald-400",
			children: [/* @__PURE__ */ jsx(Spark, { className: "h-3.5 w-3.5" }), "Be an affiliate"]
		}), /* @__PURE__ */ jsx("span", {
			className: "rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-[.08em] text-emerald-700 uppercase dark:text-emerald-400",
			children: "Soon"
		})]
	});
}
function NavList({ currentUrl, onNavigate, className = "" }) {
	return /* @__PURE__ */ jsx("nav", {
		className: `space-y-1 ${className}`.trim(),
		children: NAV$1.map((item) => {
			const Icon = item.icon;
			const active = item.exact ? currentUrl === item.exact : isActive(currentUrl, item.match);
			if (item.locked) return /* @__PURE__ */ jsxs("div", {
				"aria-disabled": "true",
				title: "Locked for now",
				className: "flex cursor-not-allowed items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-ink/40 dark:text-white/35",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0" }), item.label]
				}), /* @__PURE__ */ jsx(Lock, { className: "h-3.5 w-3.5 shrink-0" })]
			}, item.label);
			return /* @__PURE__ */ jsxs(Link, {
				href: item.href,
				onClick: onNavigate,
				className: `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition ${active ? "bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent-glow" : "muted hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.06] dark:hover:text-white"}`,
				children: [/* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 shrink-0" }), item.label]
			}, item.label);
		})
	});
}
/**
* Account block pinned to the bottom of the sidebar and the mobile drawer.
* Signed-out visitors get log in / sign up in the same slot.
*/
function AccountBlock({ signedIn, email, onSignOut, signingOut, onNavigate }) {
	if (!signedIn) return /* @__PURE__ */ jsxs("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ jsx(Link, {
			href: "/login",
			onClick: onNavigate,
			className: "btn-ghost h-10 w-full justify-center text-[13px]",
			children: "Log in"
		}), /* @__PURE__ */ jsxs(Link, {
			href: "/register",
			onClick: onNavigate,
			className: "btn-accent h-10 w-full justify-center text-[13px]",
			children: ["Sign up ", /* @__PURE__ */ jsx(Arrow, {})]
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-stretch gap-2",
		children: [/* @__PURE__ */ jsxs(Link, {
			href: "/settings/account",
			onClick: onNavigate,
			className: "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-black/[.07] bg-black/[.02] px-3 py-2.5 transition hover:border-accent/30 dark:border-white/[.09] dark:bg-white/[.04]",
			children: [/* @__PURE__ */ jsx(User, { className: "h-4 w-4 shrink-0 faint" }), /* @__PURE__ */ jsxs("span", {
				className: "min-w-0",
				children: [/* @__PURE__ */ jsx("span", {
					className: "block text-[13px] font-semibold",
					children: "Account"
				}), email && /* @__PURE__ */ jsx("span", {
					className: "block truncate text-[11px] faint",
					children: email
				})]
			})]
		}), /* @__PURE__ */ jsx("button", {
			onClick: onSignOut,
			disabled: signingOut,
			title: "Log out",
			"aria-label": "Log out",
			className: "flex w-11 shrink-0 items-center justify-center rounded-xl border border-black/[.07] transition hover:border-hot/40 hover:text-hot disabled:opacity-40 dark:border-white/[.09]",
			children: /* @__PURE__ */ jsx(Exit, { className: "h-4 w-4" })
		})]
	});
}
/**
* The app shell: a persistent sidebar on desktop, a top bar plus slide-in
* drawer and bottom tab bar on mobile, and a shared footer under the content.
*
* Props mirror the old SearchShell so flow screens drop in unchanged:
*   pill     — small status chip shown next to the title
*   step     — 'keywords' | 'running' | 'results', draws the progress rail
*   width    — optional max-width for the content column
*   actions  — right side of the title row. Keep this to one or two buttons;
*              anything denser belongs in `toolbar` or it wraps into a column.
*   subtitle — one line of context under the title
*   toolbar  — full-width row under the header for search, filters, and sort
*/
function AppLayout({ pill, step, title, subtitle, actions, toolbar, width = "max-w-6xl", children }) {
	const { props, url: currentUrl } = usePage();
	const { auth = {} } = props;
	const { theme, toggle } = useTheme();
	const logout = useForm({});
	const [drawerOpen, setDrawerOpen] = useState(false);
	const signedIn = auth.signedIn ?? Boolean(auth.user);
	const stepIndex = STEP_ORDER.indexOf(step);
	const signOut = () => {
		setDrawerOpen(false);
		logout.post("/logout");
	};
	useEffect(() => {
		if (typeof document === "undefined") return void 0;
		document.body.style.overflow = drawerOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [drawerOpen]);
	const closeDrawer = () => setDrawerOpen(false);
	const brand = /* @__PURE__ */ jsxs(Link, {
		href: "/",
		onClick: closeDrawer,
		className: "flex items-center gap-2.5",
		children: [/* @__PURE__ */ jsx(Logo, { className: "h-8 w-8" }), /* @__PURE__ */ jsxs("span", {
			className: "leading-none",
			children: [/* @__PURE__ */ jsx("span", {
				className: "block font-display text-[17px] font-bold tracking-[-.03em]",
				children: "Outlier Vault"
			}), /* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-[9px] font-semibold tracking-[.16em] faint uppercase",
				children: "Find outlier videos daily"
			})]
		})]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "vvf-landing relative isolate min-h-screen font-body",
		children: [
			/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
				children: [/* @__PURE__ */ jsx("div", { className: "bg-grid mask-radial-fade absolute inset-0" }), /* @__PURE__ */ jsx("div", { className: "absolute top-[-20%] left-1/2 h-[420px] w-[760px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/15 blur-[140px] dark:bg-accent/20" })]
			}),
			/* @__PURE__ */ jsxs("aside", {
				className: "fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-black/[.06] bg-canvas/80 px-4 py-5 backdrop-blur-xl lg:flex dark:border-white/[.08] dark:bg-canvas-dark/80",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "px-1",
						children: brand
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-6",
						children: /* @__PURE__ */ jsx(SidebarSearch, {})
					}),
					/* @__PURE__ */ jsx(NavList, {
						currentUrl,
						className: "mt-5"
					}),
					/* @__PURE__ */ jsx("div", { className: "flex-1" }),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-3 border-t border-black/[.06] pt-4 dark:border-white/[.08]",
						children: [
							/* @__PURE__ */ jsx(AffiliateCard, {}),
							/* @__PURE__ */ jsx(AccountBlock, {
								signedIn,
								email: auth.user?.email,
								onSignOut: signOut,
								signingOut: logout.processing
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between px-1",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[11.5px] faint",
									children: "Appearance"
								}), /* @__PURE__ */ jsx(ThemeToggle, {
									theme,
									onToggle: toggle
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("header", {
				className: "sticky top-0 z-40 border-b border-black/[.06] bg-canvas/80 backdrop-blur-xl lg:hidden dark:border-white/[.08] dark:bg-canvas-dark/80",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "flex h-[62px] items-center justify-between px-4",
					children: [brand, /* @__PURE__ */ jsx("button", {
						onClick: () => setDrawerOpen((open) => !open),
						"aria-label": drawerOpen ? "Close menu" : "Open menu",
						"aria-expanded": drawerOpen,
						className: "flex h-10 w-10 items-center justify-center rounded-xl border border-black/[.09] transition hover:border-accent/40 dark:border-white/[.12]",
						children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
					})]
				}), stepIndex >= 0 && /* @__PURE__ */ jsx("div", {
					className: "h-[2px] w-full bg-black/[.05] dark:bg-white/[.06]",
					children: /* @__PURE__ */ jsx("div", {
						className: "h-full bg-linear-to-r from-accent-glow to-accent transition-all duration-700 ease-out",
						style: { width: `${(stepIndex + 1) / STEP_ORDER.length * 100}%` }
					})
				})]
			}),
			drawerOpen && /* @__PURE__ */ jsxs("div", {
				className: "fixed inset-0 z-50 lg:hidden",
				children: [/* @__PURE__ */ jsx("button", {
					"aria-label": "Close menu",
					onClick: closeDrawer,
					className: "absolute inset-0 bg-black/40 backdrop-blur-sm"
				}), /* @__PURE__ */ jsxs("div", {
					className: "animate-fade-up absolute top-0 right-0 flex h-full w-[85%] max-w-[320px] flex-col border-l border-black/[.06] bg-canvas px-4 py-5 dark:border-white/[.08] dark:bg-canvas-dark",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-display text-[15px] font-bold",
								children: "Menu"
							}), /* @__PURE__ */ jsx("button", {
								onClick: closeDrawer,
								"aria-label": "Close menu",
								className: "flex h-9 w-9 items-center justify-center rounded-xl border border-black/[.09] dark:border-white/[.12]",
								children: /* @__PURE__ */ jsx(Close, { className: "h-4 w-4" })
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-5",
							children: /* @__PURE__ */ jsx(SidebarSearch, { onSubmitted: closeDrawer })
						}),
						/* @__PURE__ */ jsx(NavList, {
							currentUrl,
							onNavigate: closeDrawer,
							className: "mt-4"
						}),
						/* @__PURE__ */ jsx("div", { className: "flex-1" }),
						/* @__PURE__ */ jsxs("div", {
							className: "space-y-3 border-t border-black/[.06] pt-4 dark:border-white/[.08]",
							children: [
								/* @__PURE__ */ jsx(AffiliateCard, {}),
								/* @__PURE__ */ jsxs("div", {
									className: "flex items-center justify-between px-1",
									children: [/* @__PURE__ */ jsx("span", {
										className: "text-[12px] faint",
										children: "Appearance"
									}), /* @__PURE__ */ jsx(ThemeToggle, {
										theme,
										onToggle: toggle
									})]
								}),
								/* @__PURE__ */ jsx(AccountBlock, {
									signedIn,
									email: auth.user?.email,
									onSignOut: signOut,
									signingOut: logout.processing,
									onNavigate: closeDrawer
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex min-h-screen flex-col lg:pl-[268px]",
				children: [
					stepIndex >= 0 && /* @__PURE__ */ jsx("div", {
						className: "hidden h-[2px] w-full bg-black/[.05] lg:block dark:bg-white/[.06]",
						children: /* @__PURE__ */ jsx("div", {
							className: "h-full bg-linear-to-r from-accent-glow to-accent transition-all duration-700 ease-out",
							style: { width: `${(stepIndex + 1) / STEP_ORDER.length * 100}%` }
						})
					}),
					/* @__PURE__ */ jsx("main", {
						className: "flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-10",
						children: /* @__PURE__ */ jsxs("div", {
							className: `mx-auto w-full ${width}`,
							children: [
								(title || pill || actions || subtitle) && /* @__PURE__ */ jsxs("div", {
									className: "mb-5",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center justify-between gap-x-4 gap-y-3",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "flex items-center gap-2.5",
											children: [title && /* @__PURE__ */ jsx("h1", {
												className: "font-display text-[22px] font-bold tracking-[-.025em] sm:text-[26px]",
												children: title
											}), pill && /* @__PURE__ */ jsx("span", {
												className: `rounded-full border px-2.5 py-1 text-[11.5px] font-semibold ${TONES[pill.tone] ?? TONES.accent}`,
												children: pill.text
											})]
										}), actions && /* @__PURE__ */ jsx("div", {
											className: "flex flex-wrap items-center gap-2",
											children: actions
										})]
									}), subtitle && /* @__PURE__ */ jsx("p", {
										className: "mt-2 max-w-2xl text-[13.5px] muted",
										children: subtitle
									})]
								}),
								toolbar && /* @__PURE__ */ jsx("div", {
									className: "mb-6",
									children: toolbar
								}),
								children
							]
						})
					}),
					/* @__PURE__ */ jsx(AppFooter, { className: "hidden lg:block" })
				]
			}),
			/* @__PURE__ */ jsx("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-black/[.06] bg-canvas/90 backdrop-blur-xl lg:hidden dark:border-white/[.08] dark:bg-canvas-dark/90",
				children: /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-3",
					children: TABS.map((tab) => {
						const Icon = tab.icon;
						const active = isActive(currentUrl, tab.match);
						return /* @__PURE__ */ jsxs(Link, {
							href: tab.href,
							className: `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${active ? "text-accent dark:text-accent-glow" : "faint"}`,
							children: [/* @__PURE__ */ jsx(Icon, { className: "h-[18px] w-[18px]" }), tab.label]
						}, tab.label);
					})
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Dashboard.jsx
var Dashboard_exports = /* @__PURE__ */ __exportAll({ default: () => Dashboard });
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "surface p-5",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-[11.5px] font-semibold tracking-[.14em] faint uppercase",
				children: label
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 font-display text-[26px] font-bold tracking-[-.02em]",
				children: value
			}),
			hint && /* @__PURE__ */ jsx("p", {
				className: "mt-1.5 text-[12px] faint",
				children: hint
			})
		]
	});
}
function QuickLink({ href, icon: Icon, title, blurb }) {
	return /* @__PURE__ */ jsxs(Link, {
		href,
		className: "surface-hover group flex items-start gap-3.5 p-5",
		children: [/* @__PURE__ */ jsx("span", {
			className: "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent dark:text-accent-glow",
			children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
		}), /* @__PURE__ */ jsxs("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "flex items-center gap-1.5 font-display text-[15px] font-bold",
				children: [title, /* @__PURE__ */ jsx(Arrow, { className: "h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" })]
			}), /* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-[13px] leading-relaxed muted",
				children: blurb
			})]
		})]
	});
}
function Dashboard() {
	const { auth = {}, billing = {}, flash = {} } = usePage().props;
	const creditsLimit = typeof billing.searchCreditsLimit === "number" ? billing.searchCreditsLimit : null;
	const bookmarkLimit = billing.bookmarkLimit === -1 ? null : billing.bookmarkLimit ?? 0;
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Dashboard - Outlier Vault" }), /* @__PURE__ */ jsxs(AppLayout, {
		title: `Welcome back${auth.user?.name ? `, ${auth.user.name}` : ""}`,
		pill: {
			text: billing.currentPlan ?? "free",
			tone: billing.hasPaidPlan ? "ok" : "accent"
		},
		actions: /* @__PURE__ */ jsxs(Link, {
			href: "/search?type=brand",
			className: "btn-accent h-10 px-4 text-[13px]",
			children: ["New search ", /* @__PURE__ */ jsx(Arrow, {})]
		}),
		children: [
			flash.status && /* @__PURE__ */ jsx("div", {
				className: "mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300",
				children: flash.status
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "animate-fade-up grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: [
					/* @__PURE__ */ jsx(Stat, {
						label: "Current plan",
						value: /* @__PURE__ */ jsx("span", {
							className: "capitalize",
							children: billing.currentPlan ?? "free"
						})
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "Search credits",
						value: `${billing.searchCreditsRemaining ?? 0}${creditsLimit !== null ? ` / ${creditsLimit}` : ""}`,
						hint: `${billing.searchCreditsUsed ?? 0} used`
					}),
					/* @__PURE__ */ jsx(Stat, {
						label: "Bookmarks",
						value: `${billing.bookmarkCount ?? 0}${bookmarkLimit !== null ? ` / ${bookmarkLimit}` : ""}`,
						hint: bookmarkLimit === null ? "Unlimited" : void 0
					})
				]
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-10 font-display text-[17px] font-bold",
				children: "Jump back in"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: [
					/* @__PURE__ */ jsx(QuickLink, {
						href: "/saved-searches",
						icon: Library,
						title: "Watchlist",
						blurb: "Every saved search, refreshing on its own schedule."
					}),
					/* @__PURE__ */ jsx(QuickLink, {
						href: "/search?type=brand",
						icon: Search,
						title: "Run a new search",
						blurb: "Turn one phrase into a self-refreshing list of viral videos."
					}),
					/* @__PURE__ */ jsx(QuickLink, {
						href: "/plans",
						icon: Bookmark,
						title: "Plans & billing",
						blurb: "Compare plans and unlock unlimited refreshes."
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "surface mt-10 p-5",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-[11.5px] font-semibold tracking-[.14em] faint uppercase",
						children: "Signed in as"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2.5 text-[14px] font-semibold",
						children: auth.user?.email ?? "Unknown account"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-4",
						children: /* @__PURE__ */ jsxs(Link, {
							href: "/settings/account",
							className: "inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent transition hover:gap-2 dark:text-accent-glow",
							children: ["Manage account ", /* @__PURE__ */ jsx(Arrow, { className: "h-3.5 w-3.5" })]
						})
					})
				]
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
				children: [/* @__PURE__ */ jsxs("a", {
					href: "#top",
					className: "group flex shrink-0 items-center gap-3 font-display text-[17px] font-bold",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "relative",
						children: [/* @__PURE__ */ jsx(Logo, {}), /* @__PURE__ */ jsx("span", {
							"aria-hidden": true,
							className: "absolute inset-0 rounded-[7px] bg-accent/50 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
						})]
					}), "Outlier Vault"]
				}), /* @__PURE__ */ jsxs("div", {
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
				})]
			})
		}), open && /* @__PURE__ */ jsx("div", {
			className: "border-b border-black/[.06] bg-canvas/95 px-4 pt-3 pb-5 backdrop-blur-xl lg:hidden dark:border-white/[.07] dark:bg-canvas-dark/95",
			children: /* @__PURE__ */ jsxs("div", {
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
			})
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
		body: "Point Outlier Vault at a competitor and get a running feed of every video mentioning them - organic creator posts, affiliate content, and paid spark ads alike.",
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
		body: "Save the search and Outlier Vault re-runs it on a schedule, emailing you only what is new."
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
		quote: "The outlier scoring is the part that matters. Big accounts posting mediocre videos are noise. Outlier Vault filters those out by default.",
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
			"0 watchlist slots",
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
		cta: "Choose Basic",
		popular: true,
		features: [
			"150 searches",
			"50 watchlist slots",
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
			"Unlimited watchlist",
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
		a: "On Basic and above, each tracked search can watch a competitor continuously. Add them to a watchlist and Outlier Vault re-runs on your schedule, sending only what changed since last time."
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
			"Outlier Vault",
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
		label: "Brand",
		placeholder: "Enter brand name",
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
					children: [/* @__PURE__ */ jsx(Reveal, {
						delay: 80,
						children: /* @__PURE__ */ jsxs("h1", {
							className: "mt-7 font-display text-[38px] leading-[1.04] font-bold tracking-[-.035em] sm:text-[58px] lg:text-[72px]",
							children: ["TikTok Brand and Social Media", /* @__PURE__ */ jsx("span", {
								className: "text-gradient",
								children: " Intelligence Tool"
							})]
						})
					}), /* @__PURE__ */ jsx(Reveal, {
						delay: 140,
						children: /* @__PURE__ */ jsx("p", {
							className: "mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed muted sm:text-[17px]",
							children: "Enter your brand, a competitor or single product; then we will scan TikTok and return the most viral outlier videos, the creators behind them and the reason they went viral"
						})
					})]
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
									className: "mb-5 flex items-start gap-3.5 text-left",
									children: [/* @__PURE__ */ jsx("div", {
										className: "pt-1",
										children: /* @__PURE__ */ jsx(Mascot, { className: "animate-float h-12 w-12 shrink-0 sm:h-14 sm:w-14" })
									}), /* @__PURE__ */ jsxs("div", {
										className: "relative rounded-[24px] border border-[#e8e3f6] bg-[linear-gradient(180deg,rgba(255,255,255,.96),rgba(245,242,252,.94))] px-4 py-3 text-[13.5px] leading-relaxed text-[#2e3148] shadow-[0_18px_40px_-28px_rgba(104,93,151,.38)] dark:border-white/10 dark:bg-white/[.08] dark:text-white",
										children: [/* @__PURE__ */ jsx("span", {
											"aria-hidden": true,
											className: "absolute top-4 -left-1.5 h-3 w-3 rotate-45 border-l border-b border-[#e8e3f6] bg-[#f7f4fc] dark:border-white/10 dark:bg-white/[.08]"
										}), "I scan TikTok for your brand, products, and competitors, and pull the recent viral videos."]
									})]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mb-2.5 flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ jsx("p", {
										className: "text-left font-display text-[15px] font-semibold",
										children: "What do you want to research?"
									}), /* @__PURE__ */ jsx("span", {
										className: "rounded-full border border-accent/15 bg-accent/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent dark:border-accent-glow/20 dark:bg-accent-glow/10 dark:text-accent-glow",
										children: "Search"
									})]
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
									children: [/* @__PURE__ */ jsxs("label", {
										className: "group flex h-[54px] flex-1 items-center gap-3 rounded-[18px] border border-black/8 bg-white px-4 shadow-[0_16px_40px_-28px_rgba(76,56,255,.55)] transition-all duration-300 focus-within:-translate-y-0.5 focus-within:border-accent/35 focus-within:shadow-[0_22px_50px_-28px_rgba(76,56,255,.6)] dark:border-white/10 dark:bg-white/[.04] dark:focus-within:border-accent-glow/35",
										children: [/* @__PURE__ */ jsx("div", {
											className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(123,92,255,.16),rgba(255,83,143,.12))] text-accent dark:text-accent-glow",
											children: /* @__PURE__ */ jsxs("svg", {
												viewBox: "0 0 24 24",
												"aria-hidden": true,
												className: "h-4.5 w-4.5",
												fill: "none",
												stroke: "currentColor",
												strokeWidth: "2",
												strokeLinecap: "round",
												strokeLinejoin: "round",
												children: [/* @__PURE__ */ jsx("circle", {
													cx: "11",
													cy: "11",
													r: "7"
												}), /* @__PURE__ */ jsx("path", { d: "m20 20-3.5-3.5" })]
											})
										}), /* @__PURE__ */ jsx("div", {
											className: "min-w-0 flex-1 text-left",
											children: /* @__PURE__ */ jsx("input", {
												id: "search-subject",
												value,
												onChange: (e) => setValue(e.target.value),
												placeholder: config.placeholder,
												className: "w-full border-0 bg-transparent p-0 text-[14px] font-medium text-ink placeholder:text-black/35 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-white/28"
											})
										})]
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
												"\"",
												config.sample,
												"\""
											]
										}),
										" ",
										"- one subject per search keeps each result tight."
									]
								})
							]
						})
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-5 flex items-center justify-center",
						children: /* @__PURE__ */ jsx("span", {
							className: "text-[13px] faint",
							children: "1 free search - no credit card"
						})
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
					children: "Why brand teams switch to Outlier Vault"
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
function Pricing({ onStart, onTrial, onTrialStart, compact = false }) {
	const { pricingPlans = [], billing = {}, subscription = null } = usePage().props;
	const plans = (pricingPlans.length > 0 ? [...pricingPlans] : [...PRICING.monthly]).sort((a, b) => {
		const aKey = a.slug ?? a.name?.toLowerCase();
		const bKey = b.slug ?? b.name?.toLowerCase();
		const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
		const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);
		return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
	});
	const currentPlan = billing.currentPlan ?? "free";
	const subscriptionStatus = subscription?.status ?? null;
	const onBasicTrial = currentPlan === "basic" && subscriptionStatus === "trialing";
	const trialEligible = billing.trialEligible ?? true;
	const launchTrial = () => {
		if (typeof onTrialStart === "function") {
			onTrialStart({ slug: "basic" });
			return;
		}
		onTrial?.({ slug: "basic" });
	};
	const priceBlock = (plan) => {
		if (plan.slug === "basic" || plan.slug === "premium") return {
			primary: "$0",
			suffix: "",
			secondary: `then $${plan.price} after 7 days`
		};
		return {
			primary: `$${plan.price}`,
			suffix: "/mo",
			secondary: plan.price > 0 ? "Billed monthly" : ""
		};
	};
	const trialHeading = onBasicTrial ? "Your 7-day Basic trial is active" : "Start a 7-day Basic trial";
	const trialBody = onBasicTrial ? "You already have trial access to Basic. Upgrade to Premium any time, or keep using your current trial until it ends." : "Try the full Basic plan for 7 days. Card details are collected up front, and billing starts only after the trial ends unless you cancel.";
	const trialButtonLabel = onBasicTrial ? "Currently in Trial" : "Start 7-day trial";
	const cardState = (plan) => {
		const isCurrent = plan.slug === currentPlan;
		if (plan.slug === "free") {
			if (currentPlan !== "free") return {
				disabled: true,
				cta: "Free plan unavailable"
			};
			return {
				disabled: true,
				cta: "Current plan"
			};
		}
		if (plan.slug === "basic") {
			if (isCurrent) return {
				disabled: true,
				cta: subscriptionStatus === "trialing" ? "Currently in Trial" : "Current plan"
			};
			return {
				disabled: false,
				cta: "Choose Basic"
			};
		}
		if (plan.slug === "premium") {
			if (isCurrent) return {
				disabled: true,
				cta: "Current plan"
			};
			return {
				disabled: false,
				cta: currentPlan === "basic" ? "Upgrade to Premium" : "Choose Premium"
			};
		}
		return {
			disabled: false,
			cta: plan.cta
		};
	};
	return /* @__PURE__ */ jsxs("section", {
		id: "pricing",
		className: `mx-auto max-w-page px-4 sm:px-6 lg:px-8 ${compact ? "mt-6 sm:mt-8" : "mt-28 sm:mt-36"}`,
		children: [
			/* @__PURE__ */ jsxs(Reveal, {
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
					/* @__PURE__ */ jsxs("div", {
						className: "mt-8 inline-flex items-center gap-1 rounded-2xl border border-black/[.06] bg-black/[.035] p-1.5 dark:border-white/[.08] dark:bg-white/[.05]",
						children: [/* @__PURE__ */ jsx("button", {
							className: "rounded-xl bg-white px-5 py-2 text-[13.5px] font-semibold text-ink shadow-[0_2px_10px_-2px_rgba(16,18,32,.2)] dark:bg-ink-700 dark:text-white",
							children: "Monthly"
						}), /* @__PURE__ */ jsxs("div", {
							"aria-disabled": "true",
							title: "Annual pricing is coming soon",
							className: "flex cursor-not-allowed items-center gap-2 rounded-xl px-5 py-2 text-[13.5px] font-semibold text-ink/45 dark:text-white/45",
							children: [/* @__PURE__ */ jsx("span", { children: "Annual -20%" }), /* @__PURE__ */ jsx("span", {
								className: "rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold tracking-[.1em] text-accent uppercase dark:text-accent-glow",
								children: "Soon"
							})]
						})]
					})
				]
			}),
			trialEligible && /* @__PURE__ */ jsx(Reveal, {
				className: "mx-auto mt-8 max-w-5xl",
				children: /* @__PURE__ */ jsx("div", {
					className: "rounded-[30px] border border-accent/20 bg-white/78 p-6 shadow-[0_18px_45px_-36px_rgba(109,75,255,.22)] backdrop-blur-xl dark:border-white/[.08] dark:bg-white/[.05] sm:p-7",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "max-w-2xl",
							children: [
								/* @__PURE__ */ jsxs("p", {
									className: "eyebrow",
									children: [/* @__PURE__ */ jsx("span", { className: "h-px w-6 bg-accent/50" }), " Trial"]
								}),
								/* @__PURE__ */ jsx("h3", {
									className: "mt-3 font-display text-[24px] font-bold tracking-[-.03em] sm:text-[30px]",
									children: trialHeading
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-3 text-[14px] leading-relaxed muted sm:text-[15px]",
									children: trialBody
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex w-full flex-col gap-3 lg:w-auto lg:min-w-[280px]",
							children: [/* @__PURE__ */ jsxs("button", {
								onClick: launchTrial,
								disabled: onBasicTrial,
								className: "btn-accent h-12 w-full px-6 text-sm",
								children: [
									trialButtonLabel,
									" ",
									!onBasicTrial && /* @__PURE__ */ jsx(Arrow, {})
								]
							}), /* @__PURE__ */ jsx("p", {
								className: "text-center text-[12px] faint",
								children: "Includes 150 searches and 50 watchlist slots."
							})]
						})]
					})
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3",
				children: plans.map((t, i) => /* @__PURE__ */ jsx(Reveal, {
					delay: i * 90,
					className: t.popular ? "lg:-mt-4 lg:mb-4" : "",
					children: (() => {
						const state = cardState(t);
						const current = t.slug === currentPlan;
						return /* @__PURE__ */ jsxs("div", {
							className: `relative flex h-full flex-col rounded-3xl p-6 transition-all duration-300 sm:p-7 ${current ? "border-2 border-accent/45 bg-white shadow-[0_32px_80px_-46px_rgba(109,75,255,.42)] dark:border-accent/40 dark:bg-white/[.06]" : t.popular ? "ring-gradient bg-white shadow-[0_40px_90px_-45px_rgba(109,75,255,.7)] dark:bg-white/[.06]" : "border border-black/[.06] bg-white hover:-translate-y-1 hover:border-accent/25 dark:border-white/[.08] dark:bg-white/[.03]"}`,
							children: [
								current && /* @__PURE__ */ jsx("span", {
									className: "absolute top-4 right-4 rounded-full bg-accent/10 px-2.5 py-1 text-[10.5px] font-bold tracking-[.08em] text-accent uppercase dark:text-accent-glow",
									children: subscriptionStatus === "trialing" ? "On trial" : "Current plan"
								}),
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
								(() => {
									const pricing = priceBlock(t);
									return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", {
										className: "mt-5 font-display text-[40px] leading-none font-bold tracking-[-.03em]",
										children: [pricing.primary, pricing.suffix && /* @__PURE__ */ jsx("span", {
											className: "text-[13px] font-medium muted",
											children: pricing.suffix
										})]
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-2 min-h-[32px] text-[11.5px] leading-[1.35] faint",
										children: pricing.secondary
									})] });
								})(),
								/* @__PURE__ */ jsxs("button", {
									onClick: () => t.slug === "free" ? onStart() : onTrial?.(t),
									disabled: state.disabled,
									className: `mt-6 h-12 w-full text-sm ${state.disabled ? "cursor-not-allowed rounded-xl border border-black/[.08] bg-black/[.03] text-ink/40 dark:border-white/[.12] dark:bg-white/[.04] dark:text-white/40" : t.popular || current ? "btn-accent" : "btn-ghost"}`,
									children: [
										state.cta,
										" ",
										!state.disabled && /* @__PURE__ */ jsx(Arrow, {})
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
						});
					})()
				}, t.name))
			})
		]
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
								href: "mailto:hello@outliervault.com",
								className: "font-semibold text-accent underline-offset-4 hover:underline dark:text-accent-glow",
								children: "hello@outliervault.com"
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
						children: [/* @__PURE__ */ jsx(Logo, {}), "Outlier Vault"]
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
						" Outlier Vault. Prototype - dummy data throughout."
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
function createSavedSearch({ type, phrase, name, keywords, frequency }) {
	return request(`${API_V1}/saved-searches`, {
		method: "POST",
		body: {
			type,
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
	watchlist: (id, watchlisted) => request(`${API_V1}/saved-searches/${id}/watchlist`, {
		method: "PATCH",
		body: { watchlisted }
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Outlier Vault - TikTok viral intelligence for brands" }), /* @__PURE__ */ jsxs("div", {
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
					onTrial: (plan) => window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(plan?.slug ?? "basic")}&trial=1`),
					onTrialStart: (plan) => window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(plan?.slug ?? "basic")}&trial=1`)
				}),
				/* @__PURE__ */ jsx(Faq, {}),
				/* @__PURE__ */ jsx(FinalCta, { onStart: startSearch })
			] }),
			/* @__PURE__ */ jsx(Footer, {})
		]
	})] });
}
//#endregion
//#region resources/js/Pages/Plans.jsx
var Plans_exports = /* @__PURE__ */ __exportAll({ default: () => Plans });
function Plans() {
	const { auth = {} } = usePage().props;
	const revealRoot = useReveal();
	const startFree = () => {
		window.location.assign("/search?type=brand");
	};
	const startTrialCheckout = (plan) => {
		if (!auth.signedIn) {
			window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(plan?.slug ?? "basic")}&trial=1`);
			return;
		}
		billing.trialCheckout(plan?.slug ?? "basic");
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Plans - Outlier Vault" }), /* @__PURE__ */ jsx(AppLayout, {
		width: "max-w-7xl",
		children: /* @__PURE__ */ jsx("div", {
			ref: revealRoot,
			children: /* @__PURE__ */ jsx(Pricing, {
				onStart: startFree,
				onTrial: startTrialCheckout,
				onTrialStart: startTrialCheckout,
				compact: true
			})
		})
	})] });
}
//#endregion
//#region resources/js/Pages/SavedSearches/Index.jsx
var Index_exports = /* @__PURE__ */ __exportAll({ default: () => Index });
function FilterSelect({ value, onChange, active, label, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [/* @__PURE__ */ jsx("select", {
			"aria-label": label,
			value,
			onChange,
			className: `h-9 cursor-pointer appearance-none rounded-lg border pr-8 pl-3 text-[12.5px] font-semibold outline-none transition duration-200 focus:border-accent/50 focus:ring-4 focus:ring-accent/12 ${active ? "border-accent/30 bg-accent/10 text-accent dark:border-accent/35 dark:text-accent-glow" : "border-black/[.08] bg-white text-ink hover:border-black/[.18] dark:border-white/[.1] dark:bg-white/[.05] dark:text-white dark:hover:border-white/[.2]"}`,
			children
		}), /* @__PURE__ */ jsx(Chevron, { className: "pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 opacity-45" })]
	});
}
function Divider() {
	return /* @__PURE__ */ jsx("div", { className: "hidden h-6 w-px shrink-0 bg-black/[.08] lg:block dark:bg-white/[.1]" });
}
function ModalShell({ title, body, children, onClose }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm",
		children: [/* @__PURE__ */ jsx("button", {
			"aria-label": "Close modal",
			onClick: onClose,
			className: "absolute inset-0"
		}), /* @__PURE__ */ jsxs("div", {
			className: "relative z-10 w-full max-w-lg rounded-[28px] border border-black/[.06] bg-white p-6 shadow-[0_30px_90px_-45px_rgba(16,18,32,.55)] dark:border-white/[.08] dark:bg-canvas-dark",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "font-display text-[24px] font-bold",
					children: title
				}), body && /* @__PURE__ */ jsx("p", {
					className: "mt-2 text-[13.5px] leading-relaxed muted",
					children: body
				})] }), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: onClose,
					className: "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/[.08] transition hover:border-accent/35 dark:border-white/[.12]",
					children: /* @__PURE__ */ jsx(Close, { className: "h-4 w-4" })
				})]
			}), children]
		})]
	});
}
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
var FILTER_LABELS = {
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
function formatDate$2(iso) {
	return iso ? new Date(iso).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	}) : "-";
}
function compareDates(a, b) {
	const aTime = a ? new Date(a).getTime() : 0;
	return (b ? new Date(b).getTime() : 0) - aTime;
}
function Index({ searches: initialSearches, filterType = null, watchlistedOnly = true }) {
	const [searches, setSearches] = useState(initialSearches);
	const [animatingId, setAnimatingId] = useState(null);
	const [openMenuId, setOpenMenuId] = useState(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [frequencyFilter, setFrequencyFilter] = useState("all");
	const [searchTypeFilter, setSearchTypeFilter] = useState(filterType ?? "all");
	const [sortBy, setSortBy] = useState("recent_refresh");
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
	const title = filterType ? FILTER_LABELS[filterType] ?? "Watchlist" : "Watchlist";
	const searchHref = `/search?type=${filterType ?? "brand"}`;
	useEffect(() => {
		if (openMenuId === null) return;
		const handlePointerDown = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
		};
		const handleEscape = (event) => {
			if (event.key === "Escape") setOpenMenuId(null);
		};
		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [openMenuId]);
	useEffect(() => {
		if (modalState.type === null) return;
		const handleEscape = (event) => {
			if (event.key === "Escape") closeModal();
		};
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [modalState.type, submitting]);
	const filteredSearches = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		const next = searches.filter((search) => {
			const matchesQuery = normalizedQuery === "" || search.name?.toLowerCase().includes(normalizedQuery) || search.keywords?.some((keyword) => keyword.toLowerCase().includes(normalizedQuery));
			const matchesStatus = statusFilter === "all" || search.status === statusFilter;
			const matchesFrequency = frequencyFilter === "all" || search.frequency === frequencyFilter;
			const matchesType = !watchlistedOnly || searchTypeFilter === "all" || search.search_type === searchTypeFilter;
			return matchesQuery && matchesStatus && matchesFrequency && matchesType;
		});
		next.sort((left, right) => {
			switch (sortBy) {
				case "video_count": return (right.result_count ?? 0) - (left.result_count ?? 0);
				case "az": return (left.name ?? "").localeCompare(right.name ?? "");
				case "za": return (right.name ?? "").localeCompare(left.name ?? "");
				default: return compareDates(left.last_run_at, right.last_run_at);
			}
		});
		return next;
	}, [
		frequencyFilter,
		query,
		searches,
		searchTypeFilter,
		sortBy,
		statusFilter,
		watchlistedOnly
	]);
	const filtersActive = query.trim() !== "" || statusFilter !== "all" || frequencyFilter !== "all" || watchlistedOnly && searchTypeFilter !== "all";
	const resetFilters = () => {
		setQuery("");
		setStatusFilter("all");
		setFrequencyFilter("all");
		setSearchTypeFilter(filterType ?? "all");
	};
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
	const patchSearch = (searchId, patch) => {
		setSearches((current) => current.map((item) => item.id === searchId ? {
			...item,
			...patch
		} : item));
	};
	const removeSearch = (searchId) => {
		setSearches((current) => current.filter((item) => item.id !== searchId));
	};
	const toggleWatchlist = async (event, search) => {
		event.preventDefault();
		event.stopPropagation();
		setAnimatingId(search.id);
		try {
			const payload = await savedSearch.watchlist(search.id, !search.is_watchlisted);
			setSearches((current) => current.map((item) => item.id === search.id ? {
				...item,
				...payload.search
			} : item).filter((item) => watchlistedOnly ? item.is_watchlisted : true));
		} finally {
			window.setTimeout(() => setAnimatingId((current) => current === search.id ? null : current), 280);
		}
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${title} - Outlier Vault` }),
		/* @__PURE__ */ jsx(AppLayout, {
			title,
			pill: {
				text: `${filteredSearches.length} saved`,
				tone: "accent"
			},
			subtitle: watchlistedOnly ? "Each one re-runs on its own schedule and keeps the top matches." : filterType ? `These ${filterType} searches re-run on their own schedule and keep the top matches.` : "Each one re-runs on its own schedule and keeps the top matches.",
			actions: /* @__PURE__ */ jsxs(Link, {
				href: searchHref,
				className: "btn-accent h-10 px-4 text-[13px]",
				children: [/* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }), " New search"]
			}),
			toolbar: /* @__PURE__ */ jsxs("div", {
				className: "surface flex flex-col gap-2 p-2 lg:flex-row lg:items-center",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "relative min-w-0 flex-1",
						children: [/* @__PURE__ */ jsx(Search, { className: "pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 faint" }), /* @__PURE__ */ jsx("input", {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Search keyword set or label",
							"aria-label": "Search keyword set or label",
							className: "h-9 w-full rounded-lg border border-transparent bg-transparent pr-3 pl-9 text-[13px] text-ink outline-none transition duration-200 placeholder:text-ink/35 focus:border-accent/40 focus:ring-4 focus:ring-accent/12 dark:text-white dark:placeholder:text-white/35"
						})]
					}),
					/* @__PURE__ */ jsx(Divider, {}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							watchlistedOnly && /* @__PURE__ */ jsxs(FilterSelect, {
								label: "Search type",
								value: searchTypeFilter,
								active: searchTypeFilter !== "all",
								onChange: (event) => setSearchTypeFilter(event.target.value),
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "all",
										children: "All types"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "brand",
										children: "Brand"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "competitor",
										children: "Competitor"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "product",
										children: "Product"
									})
								]
							}),
							/* @__PURE__ */ jsxs(FilterSelect, {
								label: "Status",
								value: statusFilter,
								active: statusFilter !== "all",
								onChange: (event) => setStatusFilter(event.target.value),
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "all",
										children: "Any status"
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
							/* @__PURE__ */ jsxs(FilterSelect, {
								label: "Frequency",
								value: frequencyFilter,
								active: frequencyFilter !== "all",
								onChange: (event) => setFrequencyFilter(event.target.value),
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "all",
										children: "Any cadence"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "weekly",
										children: "Weekly"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "monthly",
										children: "Monthly"
									})
								]
							}),
							filtersActive && /* @__PURE__ */ jsxs("button", {
								type: "button",
								onClick: resetFilters,
								className: "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-semibold muted transition hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.06] dark:hover:text-white",
								children: [/* @__PURE__ */ jsx(Close, { className: "h-3.5 w-3.5" }), " Clear"]
							})
						]
					}),
					/* @__PURE__ */ jsx(Divider, {}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "hidden shrink-0 text-[12px] faint sm:inline",
							children: "Sort"
						}), /* @__PURE__ */ jsx(FilterSelect, {
							label: "Sort by",
							value: sortBy,
							onChange: (event) => setSortBy(event.target.value),
							children: Object.entries(SORT_OPTIONS).map(([value, label]) => /* @__PURE__ */ jsx("option", {
								value,
								children: label
							}, value))
						})]
					})
				]
			}),
			children: filteredSearches.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "ring-gradient animate-fade-up rounded-3xl bg-white/70 p-12 text-center backdrop-blur-2xl dark:bg-white/[.04]",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "font-display text-[20px] font-bold",
						children: watchlistedOnly ? "Nothing matched your watchlist filters" : `No ${filterType ?? "saved"} searches matched`
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mx-auto mt-3 max-w-sm text-[13.5px] leading-relaxed muted",
						children: searches.length === 0 ? watchlistedOnly ? "Run a search, then bookmark it to keep it on your watchlist." : "Run a search in this category and it will show up here automatically." : "Try a different keyword, status, frequency, or sort combination."
					}),
					/* @__PURE__ */ jsxs(Link, {
						href: searchHref,
						className: "btn-accent mx-auto mt-6 h-11 px-5 text-sm",
						children: ["Run your first search ", /* @__PURE__ */ jsx(Arrow, {})]
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "animate-fade-up grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: filteredSearches.map((s) => {
					const status = STATUS[s.status] ?? STATUS.done;
					return /* @__PURE__ */ jsxs("div", {
						role: "button",
						tabIndex: 0,
						onClick: () => router.visit(s.url),
						onKeyDown: (event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								router.visit(s.url);
							}
						},
						className: `surface-hover cursor-pointer p-5 text-left transition duration-300 ${animatingId === s.id ? "scale-[1.02] shadow-[0_20px_44px_-24px_rgba(91,52,245,.55)] ring-1 ring-accent/30" : ""}`,
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ jsx("h2", {
										className: "font-display text-[16px] font-bold",
										children: s.name
									}), /* @__PURE__ */ jsx("p", {
										className: "mt-1 text-[11px] font-semibold uppercase tracking-[.12em] faint",
										children: s.search_type
									})]
								}), /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: (event) => toggleWatchlist(event, s),
											className: `inline-flex h-8 w-8 items-center justify-center rounded-lg border transition duration-300 hover:border-accent/35 hover:text-accent dark:hover:text-accent-glow ${animatingId === s.id ? "scale-110 border-accent/45 bg-accent/10 text-accent dark:border-accent/40 dark:text-accent-glow" : "border-black/[.08] dark:border-white/[.12]"}`,
											title: s.is_watchlisted ? "Remove from watchlist" : "Add to watchlist",
											children: /* @__PURE__ */ jsx(Bookmark, {
												className: "h-3.5 w-3.5",
												filled: Boolean(s.is_watchlisted)
											})
										}),
										/* @__PURE__ */ jsxs("div", {
											ref: openMenuId === s.id ? menuRef : null,
											className: "relative",
											children: [/* @__PURE__ */ jsx("button", {
												type: "button",
												onClick: (event) => {
													event.preventDefault();
													event.stopPropagation();
													setOpenMenuId((current) => current === s.id ? null : s.id);
												},
												className: "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/[.08] transition hover:border-accent/35 hover:text-accent dark:border-white/[.12] dark:hover:text-accent-glow",
												title: "Search actions",
												children: /* @__PURE__ */ jsx(Dots, { className: "h-4 w-4" })
											}), openMenuId === s.id && /* @__PURE__ */ jsxs("div", {
												className: "absolute top-10 right-0 z-20 w-44 rounded-2xl border border-black/[.08] bg-white p-1.5 shadow-[0_20px_44px_-24px_rgba(16,18,32,.45)] dark:border-white/[.12] dark:bg-canvas-dark",
												onClick: (event) => {
													event.preventDefault();
													event.stopPropagation();
												},
												children: [
													/* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => openModal("edit", s),
														className: "flex w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition hover:bg-black/[.04] dark:hover:bg-white/[.06]",
														children: "Edit keyword details"
													}),
													/* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => openModal("pause", s),
														disabled: s.status === "paused",
														className: "flex w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/[.06]",
														children: "Pause search"
													}),
													/* @__PURE__ */ jsx("button", {
														type: "button",
														onClick: () => openModal("delete", s),
														className: "flex w-full rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-hot transition hover:bg-hot/10",
														children: "Delete search"
													})
												]
											})]
										}),
										/* @__PURE__ */ jsx("span", {
											className: `shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`,
											children: status.label
										})
									]
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
									/* @__PURE__ */ jsxs("span", { children: ["Last run ", formatDate$2(s.last_run_at)] })
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
			})
		}),
		modalState.type === "edit" && modalState.search && /* @__PURE__ */ jsxs(ModalShell, {
			title: "Edit keyword details",
			body: "Update the saved label and refresh schedule. The keyword set stays fixed for this search.",
			onClose: closeModal,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mt-6 space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "mb-2 text-[12px] font-semibold uppercase tracking-[.14em] faint",
						children: "Keyword set"
					}), /* @__PURE__ */ jsx("div", {
						className: "rounded-2xl border border-black/[.08] bg-black/[.03] p-3 dark:border-white/[.12] dark:bg-white/[.04]",
						children: /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-1.5",
							children: modalState.search.keywords.map((keyword) => /* @__PURE__ */ jsx("span", {
								className: "rounded-lg border border-black/[.06] bg-white px-2 py-1 text-[11.5px] faint dark:border-white/[.08] dark:bg-white/[.05]",
								children: keyword
							}, keyword))
						})
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint",
						children: "Label"
					}), /* @__PURE__ */ jsx("input", {
						value: formState.name,
						onChange: (event) => setFormState((current) => ({
							...current,
							name: event.target.value
						})),
						className: "field h-11 text-sm"
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
						className: "mb-2 block text-[12px] font-semibold uppercase tracking-[.14em] faint",
						children: "Schedule"
					}), /* @__PURE__ */ jsx("div", {
						className: "flex gap-2",
						children: ["weekly", "monthly"].map((frequency) => /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setFormState((current) => ({
								...current,
								frequency
							})),
							className: `h-11 flex-1 rounded-xl border text-[13px] font-semibold transition ${formState.frequency === frequency ? "border-accent/45 bg-accent/10 text-accent dark:text-accent-glow" : "border-black/[.08] muted hover:border-accent/35 dark:border-white/[.12]"}`,
							children: frequency === "weekly" ? "Weekly" : "Monthly"
						}, frequency))
					})] })
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-6 flex justify-end gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: closeModal,
					className: "btn-ghost h-10 px-4 text-sm",
					disabled: submitting,
					children: "Cancel"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: submitEdit,
					className: "btn-accent h-10 px-4 text-sm",
					disabled: submitting,
					children: submitting ? "Saving..." : "Save changes"
				})]
			})]
		}),
		modalState.type === "pause" && modalState.search && /* @__PURE__ */ jsxs(ModalShell, {
			title: "Pause search",
			body: "This will keep the search record, but it will not trigger future refreshes until resumed.",
			onClose: closeModal,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mt-6 rounded-2xl border border-black/[.08] bg-black/[.03] p-4 text-[13.5px] muted dark:border-white/[.12] dark:bg-white/[.04]",
				children: [/* @__PURE__ */ jsx("p", {
					className: "font-semibold text-ink dark:text-white",
					children: modalState.search.name
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1",
					children: "Keyword set stays intact and results remain available."
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-6 flex justify-end gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: closeModal,
					className: "btn-ghost h-10 px-4 text-sm",
					disabled: submitting,
					children: "Cancel"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: confirmPause,
					className: "btn-accent h-10 px-4 text-sm",
					disabled: submitting,
					children: submitting ? "Pausing..." : "Pause search"
				})]
			})]
		}),
		modalState.type === "delete" && modalState.search && /* @__PURE__ */ jsxs(ModalShell, {
			title: "Delete search",
			body: "This removes the saved keyword record only. It does not delete the underlying viral video records.",
			onClose: closeModal,
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mt-6 rounded-2xl border border-hot/20 bg-hot/10 p-4 text-[13.5px] text-hot",
				children: [/* @__PURE__ */ jsx("p", {
					className: "font-semibold",
					children: modalState.search.name
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1",
					children: "This action hides the search from your lists and stops future runs."
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-6 flex justify-end gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: closeModal,
					className: "btn-ghost h-10 px-4 text-sm",
					disabled: submitting,
					children: "Cancel"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: confirmDelete,
					className: "h-10 rounded-xl border border-hot/30 px-4 text-sm font-semibold text-hot transition hover:bg-hot/10",
					disabled: submitting,
					children: submitting ? "Deleting..." : "Delete search"
				})]
			})]
		})
	] });
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
var GRADIENTS$1 = [
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
	return GRADIENTS$1[hash % GRADIENTS$1.length];
}
//#endregion
//#region resources/js/landing/flow/VideoCard.jsx
function embedFor$1(video) {
	if (video.embed_url) return video.embed_url;
	const id = video.video_id;
	return id ? `https://www.tiktok.com/embed/v2/${id}` : null;
}
function Thumb({ video, rank, className = "" }) {
	const [broken, setBroken] = useState(false);
	const [playing, setPlaying] = useState(false);
	const gradient = gradientFor(video.video_id ?? video.id);
	const src = video.thumbnail_url;
	const mult = multiplier(video.score ?? video.virality_score);
	const embed = embedFor$1(video);
	return /* @__PURE__ */ jsx("div", {
		className: `group relative flex items-center justify-center overflow-hidden rounded-2xl
        bg-linear-to-br ${gradient} shadow-[0_20px_44px_-24px_rgba(0,0,0,.85)] ${className}`,
		children: playing && embed ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("iframe", {
			src: embed,
			title: video.title || "TikTok video",
			loading: "lazy",
			allow: "autoplay; fullscreen; encrypted-media; picture-in-picture",
			allowFullScreen: true,
			className: "absolute inset-0 h-full w-full border-0"
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setPlaying(false),
			"aria-label": "Close player",
			className: "absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80",
			children: /* @__PURE__ */ jsx("svg", {
				viewBox: "0 0 24 24",
				className: "h-3.5 w-3.5",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2.5",
				strokeLinecap: "round",
				children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
			})
		})] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
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
			embed ? /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setPlaying(true),
				"aria-label": video.title ? `Play: ${video.title}` : "Play video",
				className: "absolute inset-0 z-10 flex cursor-pointer items-center justify-center",
				children: /* @__PURE__ */ jsx("span", {
					className: "flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-110",
					children: /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 translate-x-px text-white" })
				})
			}) : /* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				className: "relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md",
				children: /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 translate-x-px text-white/50" })
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
		] })
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
//#region resources/js/landing/flow/screens/ResultsScreen.jsx
var PAGE_STEP$1 = 12;
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
function LoginGate({ resultCount, trialEligible = true }) {
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
							className: "flex h-12 items-center justify-center gap-3 rounded-full bg-[#2f2a2a] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_-26px_rgba(0,0,0,.55)] transition hover:opacity-95",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex h-8 w-8 items-center justify-center rounded-full bg-white",
								children: /* @__PURE__ */ jsx(Google, {})
							}), "Continue with Google"]
						}), trialEligible ? /* @__PURE__ */ jsx("a", {
							href: "/trial",
							className: "btn-ghost h-12 px-5 text-sm",
							children: "Start free trial"
						}) : /* @__PURE__ */ jsx("button", {
							disabled: true,
							className: "h-12 cursor-not-allowed rounded-xl border border-black/[.08] bg-black/[.03] px-5 text-sm font-semibold text-ink/40 dark:border-white/[.12] dark:bg-white/[.04] dark:text-white/40",
							children: "Trial unavailable"
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
function ResultsScreen({ search, isAuthenticated = false, billingState = null, onStartTrial, onToggleWatchlist, onRefresh, refreshing = false, freeSearch = true, watchlistUpdating = false }) {
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
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [onToggleWatchlist && /* @__PURE__ */ jsxs("button", {
						onClick: onToggleWatchlist,
						disabled: watchlistUpdating,
						className: "btn-ghost h-10 px-3.5 text-[13px]",
						children: [/* @__PURE__ */ jsx(Bookmark, {
							className: "h-3.5 w-3.5",
							filled: Boolean(search?.is_watchlisted)
						}), search?.is_watchlisted ? "Watchlisted" : "Add to watchlist"]
					}), /* @__PURE__ */ jsxs("button", {
						onClick: share,
						className: "btn-ghost h-10 px-3.5 text-[13px]",
						children: [
							copied ? /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Share, {}),
							" ",
							copied ? "Link copied" : "Share"
						]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "mt-4 font-display text-[28px] leading-tight font-bold tracking-[-.025em] sm:text-[36px]",
				children: search?.name ?? "Recent viral videos"
			}),
			search?.search_type && /* @__PURE__ */ jsx("p", {
				className: "mt-2 text-[11.5px] font-semibold uppercase tracking-[.14em] faint",
				children: search.search_type
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
			}) : !isAuthenticated ? /* @__PURE__ */ jsx(LoginGate, {
				resultCount: results.length,
				trialEligible: billingState?.trialEligible ?? true
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [
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
							" watchlist"
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
					onClick: () => setVisible((v) => v + PAGE_STEP$1),
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
			freeSearch && (billingState?.trialEligible ?? true) && /* @__PURE__ */ jsxs("div", {
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
						children: "Free includes 1 search and 0 watchlist slots. Basic includes 150 searches and 50 watchlist slots. Premium includes 400 searches and unlimited watchlist."
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
//#region resources/js/Pages/SavedSearches/detail/OutlierVideos.jsx
var OutlierVideos_exports = /* @__PURE__ */ __exportAll({
	OutlierCard: () => OutlierCard,
	WinnerVideo: () => WinnerVideo
});
var GRADIENTS = [
	"linear-gradient(150deg,#a7e0c4,#4aa886 50%,#2f6a7a)",
	"linear-gradient(150deg,#ffd27a,#ff9a5a 55%,#c0607a)",
	"linear-gradient(150deg,#c5b8ff,#7a5ae0 55%,#3a2f6a)",
	"linear-gradient(150deg,#8fd0ff,#5a7ce0 55%,#3a2f8a)",
	"linear-gradient(150deg,#7affc4,#3ac0a0 55%,#2a6a7a)",
	"linear-gradient(150deg,#ffb0d8,#d1409a 55%,#5a2060)"
];
function gradientStyle(video) {
	const key = String(video?.video_id ?? video?.id ?? "");
	let hash = 0;
	for (let i = 0; i < key.length; i++) hash = hash * 31 + key.charCodeAt(i) >>> 0;
	return GRADIENTS[hash % GRADIENTS.length];
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
function position(multiple, max) {
	const n = Number(multiple);
	if (!Number.isFinite(n) || n <= 0 || !max || max <= 0) return null;
	return 2 + Math.min(n / max, 1) * 93;
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
function InlinePlayer({ video, className, buttonClassName = "play", iconProps = {}, activePlayerId = null, onPlay = null, onClose = null }) {
	const embed = embedFor(video);
	const playerId = String(video?.id ?? video?.video_id ?? "");
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
function WinnerVideo({ video, medianViews, max, onToggleBookmark, bookmarking = false, activePlayerId = null, onPlay = null, onClose = null }) {
	if (!video) return null;
	const dot = position(video.outlier_multiple, max);
	const median = position(1, max);
	const packEnd = position(Math.min(2, max), max);
	const rate = percent(video.engagement_rate);
	const hasCreative = video.content_format || video.content_hook || video.content_angle;
	return /* @__PURE__ */ jsxs("div", {
		className: "winner",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "vid",
			children: [
				/* @__PURE__ */ jsx(Cover, { video }),
				/* @__PURE__ */ jsx("span", {
					className: "flag",
					children: "★ winner"
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
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "views-ov",
					children: ["▶ ", compactNumber(video.views)]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "detail",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "dtop",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "bigscore",
						children: [/* @__PURE__ */ jsx("div", {
							className: "n",
							children: outlierLabel(video.outlier_multiple) ?? "—"
						}), /* @__PURE__ */ jsx("div", {
							className: "l",
							children: "outlier score"
						})]
					}), dot !== null && /* @__PURE__ */ jsxs("div", {
						className: "devbig",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "track",
							children: [
								/* @__PURE__ */ jsx("div", { className: "ln" }),
								/* @__PURE__ */ jsx("div", {
									className: "pack",
									style: {
										left: "2%",
										width: `${Math.max(packEnd - 2, 2)}%`
									}
								}),
								/* @__PURE__ */ jsx("div", {
									className: "med",
									style: { left: `${median}%` }
								}),
								/* @__PURE__ */ jsx("div", {
									className: "pt",
									style: { left: `${dot}%` }
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "cap",
							children: [/* @__PURE__ */ jsxs("span", { children: ["search median ", /* @__PURE__ */ jsx("b", { children: compactNumber(medianViews) })] }), /* @__PURE__ */ jsxs("span", { children: ["this video ", /* @__PURE__ */ jsx("b", { children: compactNumber(video.views) })] })]
						})]
					})]
				}),
				video.title && /* @__PURE__ */ jsx("h3", { children: video.title }),
				/* @__PURE__ */ jsxs("div", {
					className: "creator",
					children: [/* @__PURE__ */ jsx(Avatar, {
						video,
						className: "av"
					}), /* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("div", {
							className: "cn",
							children: video.handle ?? video.creator_name
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "cs",
							children: [video.uploaded_at ? relativeTime(video.uploaded_at) : "date unknown", " · TikTok"]
						}),
						video.sound_label && /* @__PURE__ */ jsx("div", {
							className: "cs",
							children: video.sound_label
						})
					] })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "kv",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "row",
							children: [/* @__PURE__ */ jsx("span", {
								className: "k",
								children: "views"
							}), /* @__PURE__ */ jsx("span", {
								className: "val mono",
								children: compactNumber(video.views)
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "row",
							children: [/* @__PURE__ */ jsx("span", {
								className: "k",
								children: "engagement rate"
							}), /* @__PURE__ */ jsx("span", {
								className: `val ${rate ? "mono" : "empty"}`,
								children: rate ?? "—"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "row",
							children: [/* @__PURE__ */ jsx("span", {
								className: "k",
								children: "format"
							}), /* @__PURE__ */ jsx("span", {
								className: `val ${video.content_format ? "" : "empty"}`,
								children: video.content_format ? /* @__PURE__ */ jsx("span", {
									className: "tag",
									children: video.content_format
								}) : "—"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "row",
							children: [/* @__PURE__ */ jsx("span", {
								className: "k",
								children: "sound"
							}), /* @__PURE__ */ jsx("span", {
								className: `val ${video.sound_label ? "" : "empty"}`,
								children: video.sound_label ? /* @__PURE__ */ jsx("span", {
									className: "tag",
									children: video.sound_label
								}) : "—"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "row",
							children: [/* @__PURE__ */ jsx("span", {
								className: "k",
								children: "hook"
							}), /* @__PURE__ */ jsx("span", {
								className: `val ${video.content_hook ? "" : "empty"}`,
								children: video.content_hook ?? "—"
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "row",
							children: [/* @__PURE__ */ jsx("span", {
								className: "k",
								children: "angle"
							}), /* @__PURE__ */ jsx("span", {
								className: `val ${video.content_angle ? "" : "empty"}`,
								children: video.content_angle ?? "—"
							})]
						})
					]
				}),
				hasCreative && /* @__PURE__ */ jsx("p", {
					className: "provnote",
					style: { marginTop: "12px" },
					children: "Format, hook and angle are inferred from the caption, not the footage."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "cta",
					children: [/* @__PURE__ */ jsx("a", {
						href: video.post_url,
						target: "_blank",
						rel: "noreferrer noopener",
						className: "tbtn primary",
						children: "open in TikTok ↗"
					}), onToggleBookmark && /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "tbtn",
						onClick: () => onToggleBookmark(video),
						disabled: bookmarking,
						children: video.bookmarked ? "saved to board" : "save to board"
					})]
				})
			]
		})]
	});
}
function OutlierCard({ video, rank, medianViews, max, onToggleBookmark, bookmarking = false, activePlayerId = null, onPlay = null, onClose = null }) {
	const dot = position(video.outlier_multiple, max);
	const median = position(1, max);
	const packEnd = position(Math.min(2, max), max);
	const label = outlierLabel(video.outlier_multiple);
	const hot = video.outlier_multiple >= 3;
	return /* @__PURE__ */ jsxs("article", {
		className: "card",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "thumb",
			children: [
				/* @__PURE__ */ jsx(Cover, { video }),
				/* @__PURE__ */ jsx("span", {
					className: "rank",
					children: String(rank).padStart(2, "0")
				}),
				label && /* @__PURE__ */ jsxs("span", {
					className: `score-tag ${hot ? "" : "mid"}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "num",
						children: label
					}), /* @__PURE__ */ jsx("span", {
						className: "lbl",
						children: "outlier"
					})]
				}),
				/* @__PURE__ */ jsx(InlinePlayer, {
					video,
					className: "absolute inset-0 z-10 h-full w-full border-0",
					activePlayerId,
					onPlay,
					onClose
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "views-ov",
					children: ["▶ ", compactNumber(video.views)]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "card-body",
			children: [
				dot !== null && /* @__PURE__ */ jsxs("div", {
					className: "dev",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "dev-track",
						children: [
							/* @__PURE__ */ jsx("div", { className: "dev-line" }),
							/* @__PURE__ */ jsx("div", {
								className: "dev-pack",
								style: {
									left: "2%",
									width: `${Math.max(packEnd - 2, 2)}%`
								}
							}),
							/* @__PURE__ */ jsx("div", {
								className: "dev-median",
								style: { left: `${median}%` }
							}),
							/* @__PURE__ */ jsx("div", {
								className: `dev-pt ${hot ? "" : "mid"}`,
								style: { left: `${dot}%` }
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "dev-cap",
						children: [/* @__PURE__ */ jsxs("span", { children: ["median ", /* @__PURE__ */ jsx("b", { children: compactNumber(medianViews) })] }), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("b", { children: label }), " out"] })]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "creator",
					children: [/* @__PURE__ */ jsx(Avatar, {
						video,
						className: "av"
					}), /* @__PURE__ */ jsxs("div", {
						style: { minWidth: 0 },
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "h2n",
								children: video.handle ?? video.creator_name
							}),
							/* @__PURE__ */ jsx("div", {
								className: "sub",
								children: video.uploaded_at ? relativeTime(video.uploaded_at) : "date unknown"
							}),
							video.sound_label && /* @__PURE__ */ jsx("div", {
								className: "sub",
								children: video.sound_label
							})
						]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "card-foot",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "metric",
						children: [/* @__PURE__ */ jsx("b", { children: compactNumber(video.views) }), " views"]
					}), /* @__PURE__ */ jsxs("span", {
						style: {
							display: "flex",
							gap: "10px",
							alignItems: "center"
						},
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "open",
							onClick: () => onToggleBookmark?.(video),
							disabled: !onToggleBookmark || bookmarking,
							title: video.bookmarked ? "Remove from board" : "Save to board",
							children: video.bookmarked ? "saved" : "save"
						}), /* @__PURE__ */ jsx("a", {
							href: video.post_url,
							target: "_blank",
							rel: "noreferrer noopener",
							className: "open",
							children: "open ↗"
						})]
					})]
				})
			]
		})]
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
	return /* @__PURE__ */ jsxs("div", {
		className: `d ${direction === "up" ? "up" : direction === "down" ? "down" : "flat"}`,
		title: reconstructed ? "Compared against a week rebuilt from upload dates" : "Versus the previous week",
		children: [
			direction === "up" ? "↑" : direction === "down" ? "↓" : "→",
			" ",
			Math.abs(value),
			unit === "percent" ? "%" : unit === "points" ? " pts" : unit === "multiple" ? "x" : "",
			" wk",
			reconstructed ? " ~" : ""
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
var HOUR_LABELS = {
	0: "12a",
	6: "6a",
	12: "12p",
	18: "6p"
};
/**
* Splits a formatted figure into the big number and its trailing unit, so the
* unit renders in the mockup's smaller muted `small`.
*/
function splitUnit(text) {
	const match = String(text).match(/^([\d.,]+)(.*)$/);
	return match ? [match[1], match[2]] : [text, ""];
}
function tileValue(tile) {
	if (tile.value === null || tile.value === void 0) return ["—", ""];
	switch (tile.format) {
		case "multiple": return splitUnit(outlierLabel(tile.value) ?? "—");
		case "percent": return splitUnit(percent(tile.value) ?? "—");
		case "compact": return splitUnit(compactNumber(tile.value));
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
		children: "—"
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
			up ? "↑" : "↓",
			" ",
			Math.abs(growth.change_pct),
			"%"
		]
	});
}
function HashtagPanel({ hashtags = [] }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "hspanel",
		children: [/* @__PURE__ */ jsx("h3", { children: "# hashtags" }), hashtags.length === 0 ? /* @__PURE__ */ jsx("p", {
			className: "empty",
			children: "No hashtags on the matched videos."
		}) : hashtags.map((row, index) => /* @__PURE__ */ jsxs("div", {
			className: "hrow",
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
		}, row.tag))]
	});
}
function SoundPanel({ sounds = [] }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "hspanel",
		children: [/* @__PURE__ */ jsx("h3", { children: "♪ sounds" }), sounds.length === 0 ? /* @__PURE__ */ jsx("p", {
			className: "empty",
			children: "No sound credited on the matched videos."
		}) : sounds.map((row, index) => /* @__PURE__ */ jsxs("div", {
			className: "hrow",
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
		}, row.label))]
	});
}
/**
* Posting rhythm by weekday and hour. Hours are UTC — `uploaded_at` is stored
* in UTC and no creator timezone is captured, so the label says so plainly
* rather than implying local time.
*/
function PostingHeatmap({ heatmap }) {
	if (!heatmap || heatmap.counted === 0) return /* @__PURE__ */ jsx("div", {
		className: "panel",
		children: /* @__PURE__ */ jsx("p", {
			className: "empty",
			children: "No upload timestamps on the matched videos yet."
		})
	});
	const { days = [], cells = [], max = 0, peak, timezone } = heatmap;
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
								return /* @__PURE__ */ jsx("div", {
									className: "cell",
									title: `${day} ${String(hour).padStart(2, "0")}:00 ${timezone} — ${count} ${count === 1 ? "post" : "posts"}`,
									style: count > 0 ? { background: isPeak ? "var(--coral)" : `color-mix(in srgb, var(--violet) ${Math.round(18 + t * 82)}%, var(--paper-2))` } : void 0
								}, hour);
							})]
						}, day))
					]
				})
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
					String(peak.hour).padStart(2, "0"),
					":00 ",
					timezone,
					", with ",
					peak.count,
					" ",
					peak.count === 1 ? "post" : "posts",
					". Hours are ",
					timezone,
					" — no creator timezone is captured on a scrape."
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
* explanation instead of six zeros — on a first run that chart looks broken,
* and the two reasons it can be empty deserve different sentences: either no
* post has cleared the threshold at all, or the outliers exist but were
* posted before the 12-week window this chart covers.
*/
function OutliersPerWeek({ bars = [], threshold = 3, totalOutliers = 0, nextRunLabel = null }) {
	const max = Math.max(...bars.map((b) => b.value), 1);
	const anyRebuilt = bars.some((b) => b.reconstructed);
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
				children: totalOutliers > 0 ? `All ${totalOutliers} of their outliers were posted more than 12 weeks ago — this chart covers recent weeks only. It fills in as refreshes land.` : `Nothing has beaten ${outlierLabel(threshold) ?? "3x"} the search median yet. A bar appears the week a post breaks out${nextRunLabel ? ` — next check ${nextRunLabel}` : ""}.`
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ jsxs("h3", { children: ["outliers per week ", anyRebuilt && /* @__PURE__ */ jsx(RebuiltBadge, { className: "ml-2" })] }),
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
	if (value === null || value === void 0) return "â€”";
	if (format === "compact") return compactNumber(value);
	if (format === "percent") return percent(value) ?? "â€”";
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
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "ts-val",
						children: formatValue(series.current, series.format)
					}),
					delta && /* @__PURE__ */ jsxs("span", {
						className: `ts-delta ${deltaTone}`,
						children: [
							delta.direction === "up" ? "â†‘" : delta.direction === "down" ? "â†“" : "â†’",
							" ",
							Math.abs(delta.value),
							deltaSuffix,
							" vs 12 wk ago"
						]
					}),
					trend.has_reconstructed && /* @__PURE__ */ jsx(RebuiltBadge, {})
				]
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
function TrackerHead({ search, account, lastRun, onToggleWatchlist, onShare, copied, watchlistUpdating }) {
	const initial = (search?.name ?? "?").slice(0, 1).toUpperCase();
	return /* @__PURE__ */ jsxs("header", { children: [/* @__PURE__ */ jsxs("div", {
		className: "crumb",
		children: ["trackers / ", search?.search_type ?? "brand"]
	}), /* @__PURE__ */ jsxs("div", {
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
						account?.followers > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", { className: "sep" }), /* @__PURE__ */ jsxs("span", { children: [compactNumber(account.followers), " followers"] })] }),
						/* @__PURE__ */ jsx("span", { className: "sep" }),
						/* @__PURE__ */ jsxs("span", { children: [
							"checked ",
							search?.frequency ?? "weekly",
							lastRun ? ` Â· last run ${lastRun}` : ""
						] })
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "head-actions",
				children: [onToggleWatchlist && /* @__PURE__ */ jsx("button", {
					className: "tbtn",
					onClick: onToggleWatchlist,
					disabled: watchlistUpdating,
					children: search?.is_watchlisted ? "watchlisted" : "add to watchlist"
				}), /* @__PURE__ */ jsx("button", {
					className: "tbtn primary",
					onClick: onShare,
					children: copied ? "link copied" : "share"
				})]
			})
		]
	})] });
}
/**
* The one-line read. Absent until the enrichment job has run, which is correct
* on a brand new search â€” it never renders a placeholder sentence.
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
function DetailScreen({ search, isAuthenticated = false, billing = null, onToggleWatchlist, onRefresh, onTogglePause, onDelete, refreshing = false, watchlistUpdating = false }) {
	const [visible, setVisible] = useState(PAGE_STEP);
	const [copied, setCopied] = useState(false);
	const [bookmarkingId, setBookmarkingId] = useState(null);
	const [items, setItems] = useState(search?.results ?? []);
	const [view, setView] = useState("outliers");
	const [activePlayerId, setActivePlayerId] = useState(null);
	const insights = search?.insights ?? {};
	const medianViews = insights.baseline?.median_views ?? 0;
	const threshold = insights.baseline?.outlier_threshold ?? 3;
	const account = insights.account ?? null;
	const trend = insights.trend ?? null;
	const profile = account?.profile ?? {};
	const brandHandle = account?.handle ? account.handle.toLowerCase() : null;
	const feedItems = view === "their" && brandHandle ? items.filter((v) => (v.handle ?? "").toLowerCase() === brandHandle) : items;
	const [winner, ...rest] = feedItems;
	const shown = rest.slice(0, visible);
	const maxMultiple = Math.max(...feedItems.map((v) => Number(v.outlier_multiple) || 0), 1);
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
		className: "tracker",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "viewbar",
				children: [
					/* @__PURE__ */ jsx("a", {
						href: "/saved-searches",
						className: "back",
						children: "← all trackers"
					}),
					/* @__PURE__ */ jsx("span", { className: "spring" }),
					/* @__PURE__ */ jsxs("div", {
						className: "viewswitch",
						children: [/* @__PURE__ */ jsx("button", {
							className: view === "outliers" ? "on" : "",
							onClick: () => setView("outliers"),
							children: "outliers"
						}), /* @__PURE__ */ jsx("button", {
							className: view === "their" ? "on" : "",
							onClick: () => setView("their"),
							disabled: !brandHandle,
							title: brandHandle ? `Only posts by ${account.handle}` : "No brand handle available yet",
							children: "their content"
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx(TrackerHead, {
				search,
				account,
				lastRun: formatDate$1(search?.last_run_at),
				onToggleWatchlist,
				onShare: share,
				copied,
				watchlistUpdating
			}),
			/* @__PURE__ */ jsx("div", {
				className: "sect-head",
				style: { marginTop: "14px" },
				children: /* @__PURE__ */ jsx("span", {
					className: "note",
					children: search?.status === "paused" ? "paused - no refreshes will run." : search?.next_run_at ? `next refresh at ${new Date(search.next_run_at).toLocaleDateString()}` : "no refresh scheduled."
				})
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
					title: view === "their" ? "their content" : "outlier videos",
					note: view === "their" ? `${account?.handle}'s own posts in this search. ranked by outlier score.` : "their posts that beat the search median. ranked by outlier score."
				}),
				feedItems.length === 0 ? /* @__PURE__ */ jsx("div", {
					className: "panel",
					children: /* @__PURE__ */ jsxs("p", {
						className: "empty",
						children: [
							"None of the matched videos were posted by ",
							account?.handle,
							". The outliers view still has all",
							" ",
							items.length,
							"."
						]
					})
				}) : null,
				/* @__PURE__ */ jsx(WinnerVideo, {
					video: winner,
					medianViews,
					max: maxMultiple,
					onToggleBookmark: toggleBookmark,
					bookmarking: bookmarkingId === winner?.id,
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
							children: view === "their" ? "more of their posts" : "more outliers"
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
							medianViews,
							max: maxMultiple,
							onToggleBookmark: toggleBookmark,
							bookmarking: bookmarkingId === video.id,
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
					title: "performance over time",
					note: "this tracker, past 12 weeks."
				}),
				/* @__PURE__ */ jsx(PerformanceChart, { trend }),
				/* @__PURE__ */ jsx(SectionHead, {
					title: "when they post",
					note: "posting schedule by day and hour."
				}),
				/* @__PURE__ */ jsx(PostingHeatmap, { heatmap: insights.heatmap }),
				/* @__PURE__ */ jsx(SectionHead, {
					title: "more data",
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
			] })
		]
	});
}
//#endregion
//#region resources/js/Pages/SavedSearches/Show.jsx
var Show_exports = /* @__PURE__ */ __exportAll({ default: () => Show });
/** Types that get the tracker detail layout. Product keeps the results view. */
var TRACKER_TYPES = ["brand", "competitor"];
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
	const [watchlistUpdating, setWatchlistUpdating] = useState(false);
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
	const toggleWatchlist = async () => {
		setWatchlistUpdating(true);
		try {
			const { search: updated } = await savedSearch.watchlist(search.id, !search.is_watchlisted);
			setSearch((prev) => ({
				...prev,
				...updated
			}));
		} finally {
			setWatchlistUpdating(false);
		}
	};
	const isTracker = TRACKER_TYPES.includes(search.search_type);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: `${search.name} - Outlier Vault` }), /* @__PURE__ */ jsx(AppLayout, {
		pill: isTracker ? void 0 : PILL[search.status] ?? PILL.done,
		step: "results",
		width: isTracker ? "max-w-[1240px]" : "max-w-6xl",
		children: isTracker ? /* @__PURE__ */ jsx(DetailScreen, {
			search,
			isAuthenticated,
			billing,
			refreshing,
			watchlistUpdating,
			onRefresh: refresh,
			onToggleWatchlist: toggleWatchlist,
			onTogglePause: togglePause,
			onDelete: remove
		}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(ResultsScreen, {
			search,
			isAuthenticated,
			billingState: billing,
			refreshing,
			watchlistUpdating,
			onRefresh: refresh,
			onStartTrial: () => router.visit("/trial"),
			onToggleWatchlist: toggleWatchlist
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
		})] })
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
function Keywords({ phrase, type = "brand" }) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const submit = async ({ keywords, frequency, name }) => {
		setSubmitting(true);
		setError(null);
		try {
			const created = await createSavedSearch({
				type,
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
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Add keywords - Outlier Vault" }), /* @__PURE__ */ jsx(AppLayout, {
		pill: {
			text: "1 free search",
			tone: "ok"
		},
		step: "keywords",
		width: "max-w-4xl",
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
				!signedIn && /* @__PURE__ */ jsxs("div", {
					className: "ring-gradient mt-8 rounded-3xl bg-white/70 p-6 text-left backdrop-blur-2xl dark:bg-white/[.04]",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "mb-4 text-center font-display text-sm font-semibold",
							children: "Or have them emailed when they're done"
						}),
						/* @__PURE__ */ jsxs("a", {
							href: "/auth/google",
							className: "flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#2f2a2a] px-5 text-[15px] font-semibold text-white shadow-[0_18px_40px_-26px_rgba(0,0,0,.55)] transition hover:opacity-95",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex h-8 w-8 items-center justify-center rounded-full bg-white",
								children: /* @__PURE__ */ jsx(Google$1, {})
							}), "Continue with Google"]
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
					className: `text-[12.5px] leading-relaxed faint ${signedIn ? "mt-8" : "mt-5"}`,
					children: "Safe to close this tab — the search keeps running and stays on your watchlist."
				})
			] })
		})]
	});
}
//#endregion
//#region resources/js/Pages/Search/Running.jsx
var Running_exports = /* @__PURE__ */ __exportAll({ default: () => Running });
function Running({ searchId }) {
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Search running - Outlier Vault" }), /* @__PURE__ */ jsx(AppLayout, {
		pill: {
			text: "Search running",
			tone: "ok"
		},
		step: "running",
		width: "max-w-4xl",
		children: /* @__PURE__ */ jsx(RunningScreen, {
			searchId,
			onBack: () => router.visit("/saved-searches"),
			onDone: () => router.visit(`/saved-searches/${searchId}`)
		})
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
	}
];
function SettingsShell({ section, heading, eyebrow, children, hideHeader = false, hideSidebar = false }) {
	const { auth = {} } = usePage().props;
	const logout = useForm({});
	const signOut = () => {
		logout.post("/logout");
	};
	return /* @__PURE__ */ jsx(AppLayout, {
		width: "max-w-7xl",
		children: /* @__PURE__ */ jsxs("div", {
			className: hideSidebar ? "" : "grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]",
			children: [!hideSidebar && /* @__PURE__ */ jsxs("aside", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsx("div", {
					className: "surface p-4",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx("div", {
							className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/12 font-display text-[18px] font-bold text-accent dark:text-accent-glow",
							children: (auth.user?.name ?? "V").slice(0, 1).toUpperCase()
						}), /* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("p", {
								className: "truncate text-[13px] font-semibold text-ink dark:text-white",
								children: auth.user?.name ?? "Account"
							}), /* @__PURE__ */ jsx("p", {
								className: "truncate text-[11.5px] faint",
								children: auth.user?.email ?? "No email found"
							})]
						})]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "surface p-3",
					children: [/* @__PURE__ */ jsx("nav", {
						className: "space-y-1",
						children: NAV.map((item) => {
							const Icon = item.icon;
							const active = item.key === section;
							return /* @__PURE__ */ jsxs(Link, {
								href: item.href,
								className: `flex items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-semibold transition ${active ? "bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent-glow" : "muted hover:bg-black/[.04] hover:text-ink dark:hover:bg-white/[.06] dark:hover:text-white"}`,
								children: [
									/* @__PURE__ */ jsx("span", {
										className: `flex h-8 w-8 items-center justify-center rounded-xl border ${active ? "border-accent/20 bg-white dark:bg-white/[.06]" : "border-black/[.06] bg-black/[.02] dark:border-white/[.08] dark:bg-white/[.03]"}`,
										children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
									}),
									item.label,
									active && /* @__PURE__ */ jsx("span", { className: "ml-auto h-2 w-2 rounded-full bg-[#ff4f87]" })
								]
							}, item.key);
						})
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-3 border-t border-black/[.06] pt-3 dark:border-white/[.08]",
						children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							className: "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-semibold text-ink/45 transition hover:bg-hot/8 hover:text-hot dark:text-white/40",
							disabled: true,
							title: "Delete account flow will be added later",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex h-8 w-8 items-center justify-center rounded-xl border border-black/[.06] bg-black/[.02] dark:border-white/[.08] dark:bg-white/[.03]",
								children: /* @__PURE__ */ jsx(Exit, { className: "h-4 w-4" })
							}), "Delete account"]
						})
					})]
				})]
			}), /* @__PURE__ */ jsxs("section", {
				className: "surface overflow-hidden",
				children: [!hideHeader && /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center justify-between gap-3 border-b border-black/[.06] px-6 py-5 dark:border-white/[.08]",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[11px] font-semibold tracking-[.18em] text-accent uppercase dark:text-accent-glow",
						children: eyebrow
					}), /* @__PURE__ */ jsx("h1", {
						className: "mt-1 font-display text-[24px] font-bold tracking-[-.02em]",
						children: heading
					})] }), /* @__PURE__ */ jsxs("button", {
						type: "button",
						onClick: signOut,
						disabled: logout.processing,
						className: "inline-flex h-11 items-center gap-2 rounded-2xl border border-black/[.08] px-4 text-[13px] font-semibold transition hover:border-accent/35 hover:text-accent dark:border-white/[.12] dark:hover:text-accent-glow",
						children: [/* @__PURE__ */ jsx(Exit, { className: "h-4 w-4" }), logout.processing ? "Logging out..." : "Log out"]
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "px-6 py-6",
					children
				})]
			})]
		})
	});
}
//#endregion
//#region resources/js/Pages/Settings/Account.jsx
var Account_exports = /* @__PURE__ */ __exportAll({ default: () => Account });
function Account() {
	const { auth = {}, flash = {} } = usePage().props;
	const form = useForm({ name: auth.user?.name ?? "" });
	const submit = (event) => {
		event.preventDefault();
		form.patch("/settings/account");
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Account settings - Outlier Vault" }), /* @__PURE__ */ jsx(SettingsShell, {
		section: "account",
		eyebrow: "Profile",
		heading: "Account",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-3xl space-y-6",
			children: [flash.status && /* @__PURE__ */ jsx("div", {
				className: "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300",
				children: flash.status
			}), /* @__PURE__ */ jsxs("div", {
				className: "surface p-5",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-5",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "font-display text-[18px] font-bold",
						children: "Profile details"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-2 text-[13.5px] muted",
						children: "Update the name shown across your account."
					})]
				}), /* @__PURE__ */ jsxs("form", {
					onSubmit: submit,
					className: "space-y-5",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("label", {
								htmlFor: "account-name",
								className: "mb-2 block text-[12px] font-semibold tracking-[.08em] faint uppercase",
								children: "Name"
							}),
							/* @__PURE__ */ jsx("input", {
								id: "account-name",
								type: "text",
								value: form.data.name,
								onChange: (event) => form.setData("name", event.target.value),
								className: "field h-12"
							}),
							form.errors.name && /* @__PURE__ */ jsx("p", {
								className: "mt-2 text-sm text-hot",
								children: form.errors.name
							})
						] }),
						/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("label", {
								htmlFor: "account-email",
								className: "mb-2 block text-[12px] font-semibold tracking-[.08em] faint uppercase",
								children: "Email"
							}),
							/* @__PURE__ */ jsx("input", {
								id: "account-email",
								type: "email",
								value: auth.user?.email ?? "",
								readOnly: true,
								className: "field h-12 cursor-not-allowed opacity-70"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-[12.5px] muted",
								children: "Email changes are not available yet."
							})
						] }),
						/* @__PURE__ */ jsx("button", {
							type: "submit",
							disabled: form.processing,
							className: "btn-accent h-11 px-5 text-[13px]",
							children: form.processing ? "Saving..." : "Save changes"
						})
					]
				})]
			})]
		})
	})] });
}
//#endregion
//#region resources/js/Pages/Settings/Appearance.jsx
var Appearance_exports = /* @__PURE__ */ __exportAll({ default: () => Appearance });
function Appearance() {
	const { theme, toggle } = useTheme();
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Appearance settings - Outlier Vault" }), /* @__PURE__ */ jsx(SettingsShell, {
		section: "appearance",
		eyebrow: "Display",
		heading: "Appearance",
		children: /* @__PURE__ */ jsx("div", {
			className: "max-w-4xl",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-4 dark:border-white/[.08]",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "font-display text-[18px] font-bold",
					children: "Color theme"
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-2 text-[13.5px] muted",
					children: "Switch between light and dark mode."
				})] }), /* @__PURE__ */ jsx(ThemeToggle, {
					theme,
					onToggle: toggle
				})]
			})
		})
	})] });
}
//#endregion
//#region resources/js/Pages/Settings/Subscription.jsx
var Subscription_exports = /* @__PURE__ */ __exportAll({ default: () => Subscription });
function formatDate(iso) {
	if (!iso) return null;
	return new Date(iso).toLocaleString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		timeZoneName: "short"
	});
}
function usageRatio(used, limit) {
	if (limit === -1 || limit === 0) return 0;
	return Math.min(100, Math.max(0, used / limit * 100));
}
function LimitCard({ title, blurb, remainingLabel, chip, ratio, tone = "sky" }) {
	const tones = {
		sky: "from-sky-500/10 to-cyan-500/10 border-sky-500/15",
		mint: "from-emerald-500/10 to-teal-500/10 border-emerald-500/15",
		rose: "from-pink-500/10 to-rose-500/10 border-pink-500/15",
		violet: "from-violet-500/10 to-fuchsia-500/10 border-violet-500/15"
	};
	return /* @__PURE__ */ jsxs("div", {
		className: `rounded-[26px] border bg-linear-to-br p-5 ${tones[tone] ?? tones.sky}`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", {
					className: "font-display text-[18px] font-bold",
					children: title
				}), /* @__PURE__ */ jsx("p", {
					className: "mt-1 max-w-[230px] text-[12.5px] muted",
					children: blurb
				})] }), /* @__PURE__ */ jsx("div", {
					className: "flex h-9 items-center rounded-full bg-white/80 px-3 text-[11px] font-semibold tracking-[.12em] text-ink uppercase dark:bg-white/[.08] dark:text-white",
					children: chip
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-5 text-[13px] font-semibold text-ink dark:text-white",
				children: remainingLabel
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3 h-2.5 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.08]",
				children: /* @__PURE__ */ jsx("div", {
					className: "h-full rounded-full bg-linear-to-r from-accent-glow to-accent",
					style: { width: `${ratio}%` }
				})
			})
		]
	});
}
function Subscription({ subscription }) {
	const [tab, setTab] = useState("plan");
	const limits = subscription?.limits ?? {};
	const bookmarkLimit = limits.bookmarkLimit ?? 0;
	const searchLimit = limits.searchCreditsLimit ?? 0;
	const bookmarksUsed = limits.bookmarksUsed ?? 0;
	const searchUsed = limits.searchCreditsUsed ?? 0;
	const planFeatures = useMemo(() => {
		return [
			bookmarkLimit === -1 ? "Unlimited watchlist" : `${bookmarkLimit} watchlist slots`,
			`${searchLimit} searches`,
			subscription?.status === "active" ? "Active subscription" : "Billing available"
		];
	}, [
		bookmarkLimit,
		searchLimit,
		subscription?.status
	]);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Head, { title: "Subscription settings - Outlier Vault" }), /* @__PURE__ */ jsx(SettingsShell, {
		section: "subscription",
		eyebrow: "Plan",
		heading: "Subscription",
		children: /* @__PURE__ */ jsxs("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ jsx("div", {
				className: "rounded-[26px] border border-black/[.06] p-1 dark:border-white/[.08]",
				children: /* @__PURE__ */ jsx("div", {
					className: "grid grid-cols-2 gap-1",
					children: [{
						key: "plan",
						label: "Plan"
					}, {
						key: "limits",
						label: "Plan limits"
					}].map((item) => {
						const active = tab === item.key;
						return /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setTab(item.key),
							className: `rounded-[20px] px-4 py-3 text-[13px] font-semibold transition ${active ? "bg-white shadow-[0_12px_30px_-20px_rgba(16,18,32,.35)] dark:bg-white/[.06]" : "muted"}`,
							children: item.label
						}, item.key);
					})
				})
			}), tab === "plan" ? /* @__PURE__ */ jsxs("div", {
				className: "overflow-hidden rounded-[28px] border border-black/[.06] bg-linear-to-br from-accent/5 via-white to-[#ff4f87]/[.04] dark:border-white/[.08] dark:from-accent/10 dark:via-canvas-dark dark:to-[#ff4f87]/[.07]",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "px-6 py-6",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-[11px] font-semibold tracking-[.18em] faint uppercase",
								children: "Summary"
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-4 text-[11px] font-semibold tracking-[.18em] faint uppercase",
								children: "Current plan"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-2 flex flex-wrap items-end justify-between gap-4",
								children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ jsx("h2", {
										className: "font-display text-[34px] font-bold tracking-[-.03em]",
										children: subscription?.planName ?? "Free"
									}), /* @__PURE__ */ jsx("span", {
										className: "rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400",
										children: subscription?.status ?? "free"
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: planFeatures.map((feature) => /* @__PURE__ */ jsx("span", {
										className: "rounded-full border border-black/[.06] bg-white/85 px-3 py-1.5 text-[12px] font-semibold dark:border-white/[.08] dark:bg-white/[.06]",
										children: feature
									}, feature))
								})] }), /* @__PURE__ */ jsxs("div", {
									className: "text-right",
									children: [/* @__PURE__ */ jsx("p", {
										className: "font-display text-[40px] font-bold tracking-[-.04em]",
										children: subscription?.price ? `$${subscription.price}` : "$0.00"
									}), /* @__PURE__ */ jsxs("p", {
										className: "text-[13px] muted",
										children: ["/ ", subscription?.interval ?? "month"]
									})]
								})]
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "border-t border-black/[.06] px-6 py-4 dark:border-white/[.08]",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap gap-x-5 gap-y-2 text-[12px] muted",
							children: [/* @__PURE__ */ jsxs("span", { children: ["Started ", formatDate(subscription?.startedAt) ?? "Not started yet"] }), /* @__PURE__ */ jsxs("span", { children: ["Renews ", formatDate(subscription?.renewsAt) ?? "No renewal date"] })]
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid gap-3 border-t border-black/[.06] px-6 py-5 sm:grid-cols-2 dark:border-white/[.08]",
						children: [/* @__PURE__ */ jsx(Link, {
							href: "/plans",
							className: "inline-flex h-12 items-center justify-center rounded-2xl bg-[#12172a] px-5 text-[13px] font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-canvas-dark",
							children: "View plans"
						}), /* @__PURE__ */ jsx(Link, {
							href: "/plans",
							className: "inline-flex h-12 items-center justify-center rounded-2xl border border-black/[.08] px-5 text-[13px] font-semibold transition hover:border-accent/35 hover:text-accent dark:border-white/[.12] dark:hover:text-accent-glow",
							children: "Manage billing"
						})]
					})
				]
			}) : /* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 xl:grid-cols-2",
				children: [/* @__PURE__ */ jsx(LimitCard, {
					title: "Search",
					blurb: "Saved searches and search credits available on your current plan.",
					remainingLabel: searchLimit === -1 ? "Unlimited" : `${Math.max(0, searchLimit - searchUsed)} remaining`,
					chip: searchLimit === -1 ? "Unlimited" : `${searchUsed} / ${searchLimit} used`,
					ratio: usageRatio(searchUsed, searchLimit),
					tone: "sky"
				}), /* @__PURE__ */ jsx(LimitCard, {
					title: "Watchlist",
					blurb: "Watchlist capacity available on your current plan.",
					remainingLabel: bookmarkLimit === -1 ? "Unlimited" : `${Math.max(0, bookmarkLimit - bookmarksUsed)} remaining`,
					chip: bookmarkLimit === -1 ? "Unlimited" : `${bookmarksUsed} / ${bookmarkLimit} used`,
					ratio: usageRatio(bookmarksUsed, bookmarkLimit),
					tone: "mint"
				})]
			})]
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
					children: "Start on a 7-day trial. Basic includes 150 searches and 50 watchlist slots. Premium includes 400 searches and unlimited watchlist."
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
									t.bookmarkLimit === -1 ? "Unlimited" : t.bookmarkLimit,
									" watchlist"
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
			"./Pages/Plans.jsx": Plans_exports,
			"./Pages/SavedSearches/Index.jsx": Index_exports,
			"./Pages/SavedSearches/Show.jsx": Show_exports,
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
			"./Pages/components/AppFooter.jsx": AppFooter_exports,
			"./Pages/components/AppLayout.jsx": AppLayout_exports
		}))[`./Pages/${name}.jsx`];
	},
	setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
}));
//#endregion
export {};
