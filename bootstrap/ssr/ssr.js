import { Head, Link, createInertiaApp, router, useForm, usePage } from "@inertiajs/react";
import { Component, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
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
var Check$1 = ({ className = "h-3 w-3" }) => /* @__PURE__ */ jsx("svg", {
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
		}, {
			key: "activity",
			label: "Activity Log",
			href: "/x/admin/activity",
			description: "User activity",
			icon: "AL"
		}]
	},
	{
		label: "Needs Attention",
		items: [
			{
				key: "critical-errors",
				label: "Critical Errors",
				href: "/x/admin/critical-errors",
				description: "Third-party and core failures",
				icon: "CE"
			},
			{
				key: "subscription-past-due",
				label: "Past Due Subs",
				href: "/x/admin/subscription?status=past_due",
				description: "Payment follow-up",
				icon: "PD"
			},
			{
				key: "plans-archived",
				label: "Archived Plans",
				href: "/x/admin/plans?status=archived",
				description: "Legacy pricing",
				icon: "AP"
			},
			{
				key: "users-deleted",
				label: "Deleted Users",
				href: "/x/admin/users?status=deleted",
				description: "Restore review",
				icon: "DU"
			},
			{
				key: "videos-archived",
				label: "Archived Videos",
				href: "/x/admin/viral-videos?status=archived",
				description: "Content review",
				icon: "AV"
			},
			{
				key: "keywords-archived",
				label: "Archived Keywords",
				href: "/x/admin/keyword-index?status=archived",
				description: "Suggestion cleanup",
				icon: "AK"
			}
		]
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
				key: "keyword-index",
				label: "Keyword Index",
				href: "/x/admin/keyword-index",
				description: "Brands and products",
				icon: "KI"
			},
			{
				key: "inquiries",
				label: "Inquiries",
				href: "/x/admin/inquiries",
				description: "Contact inbox",
				icon: "IN"
			},
			{
				key: "newsletter",
				label: "Newsletter",
				href: "/x/admin/newsletter",
				description: "Digest subscribers",
				icon: "NL"
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
		label: "Blog Management",
		items: [
			{
				key: "blogs",
				label: "Blogs",
				href: "/x/admin/blogs",
				description: "Articles",
				icon: "BL"
			},
			{
				key: "blogs-create",
				label: "Create Article",
				href: "/x/admin/blogs/create",
				description: "Block editor",
				icon: "CA"
			},
			{
				key: "blogs-categories",
				label: "Categories",
				href: "/x/admin/blogs/categories",
				description: "Article categories",
				icon: "BC"
			},
			{
				key: "blogs-tags",
				label: "Tags",
				href: "/x/admin/blogs/tags",
				description: "Article tags",
				icon: "BT"
			},
			{
				key: "blogs-featured",
				label: "Featured Articles",
				href: "/x/admin/blogs/featured",
				description: "Featured order",
				icon: "FA"
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
		label: "Coupons",
		items: [
			{
				key: "coupon-programs",
				label: "Coupon Programs",
				href: "/x/admin/coupon-programs",
				description: "Program config",
				icon: "CP"
			},
			{
				key: "coupon-whitelist",
				label: "Coupon Whitelist",
				href: "/x/admin/coupon-whitelist",
				description: "Allowed emails",
				icon: "CW"
			},
			{
				key: "coupon-usage",
				label: "Coupon Usage",
				href: "/x/admin/coupon-usage",
				description: "Redemptions",
				icon: "CU"
			}
		]
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
					children: group.label ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("button", {
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
			/* @__PURE__ */ jsx(Head, { title: `${title} - Admin - Breakout Vault` }),
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
							breadcrumbGroup && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
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
//#region resources/js/Pages/Admin/ActivityLog.jsx
var ActivityLog_exports = /* @__PURE__ */ __exportAll({ default: () => ActivityLog });
var RANGES = [
	"7D",
	"30D",
	"6M",
	"1Y"
];
var CATEGORIES = [
	["all", "All activity"],
	["sign_up", "Sign ups"],
	["subscription", "Subscription"],
	["engagement", "Engagement"],
	["analysis", "Analysis"],
	["coupon_usage", "Coupon usage"]
];
var EVENT_LABELS = {
	account_created: "Signup Created",
	logged_in: "Login",
	search_triggered: "Custom Keyword Search Started",
	search_bookmarked: "Search Bookmarked",
	video_bookmarked: "Bookmark Saved",
	video_analysis_triggered: "Video Analysis Triggered",
	checkout_initiated: "Checkout Initiated",
	trial_started: "Trial Started",
	trial_completed: "Trial Completed",
	subscription_paid: "Subscription Activated",
	subscription_reactivated: "Subscription Reactivated",
	subscription_cancellation_requested: "Cancellation Requested",
	subscription_cancellation_scheduled: "Cancellation Scheduled",
	subscription_cancellation_reverted: "Cancellation Reverted",
	subscription_reactivation_requested: "Reactivation Requested",
	subscription_cancelled: "Subscription Canceled",
	subscription_reverted_to_free: "Reverted To Free",
	payment_failed: "Payment Failed",
	payment_recovered: "Payment Recovered",
	invoice_paid: "Invoice Paid",
	account_deletion_requested: "Account Deletion Requested",
	account_deleted: "Account Deleted",
	coupon_checkout_initiated: "Coupon Checkout Started",
	coupon_redeemed: "Coupon Redeemed",
	coupon_blocked_invalid_email: "Coupon Blocked: Invalid Email",
	coupon_blocked_slots_exhausted: "Coupon Blocked: Slots Exhausted",
	coupon_blocked_already_redeemed: "Coupon Blocked: Already Redeemed",
	coupon_blocked_trial_already_used: "Coupon Blocked: Trial Used",
	coupon_blocked_reverted_to_free: "Coupon Blocked: Reverted To Free",
	coupon_blocked_program_inactive: "Coupon Blocked: Program Inactive"
};
var TONES = {
	sign_up: "#20cfc2",
	subscription: "#ee4393",
	engagement: "#7b5cff",
	analysis: "#25a6d9",
	coupon_usage: "#f6a819"
};
function formatTimestamp$2(value) {
	if (!value) return "-";
	return new Date(value).toLocaleString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function ActivityLog({ rows = [], filters = {}, events = [], pagination = {} }) {
	const current = {
		range: filters.range ?? "30D",
		category: filters.category ?? "all",
		event: filters.event ?? "all"
	};
	const update = (changes) => router.get("/x/admin/activity", {
		...current,
		...changes,
		page: 1
	}, {
		preserveScroll: true,
		replace: true
	});
	const goToPage = (page) => router.get("/x/admin/activity", {
		...current,
		page
	}, { preserveScroll: true });
	return /* @__PURE__ */ jsx(AdminLayout, {
		title: "Activity Log",
		section: "activity",
		children: /* @__PURE__ */ jsxs("section", {
			className: "rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f6f9ff_100%)] p-4 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] sm:p-5",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-start justify-between gap-4",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-[10px] font-semibold tracking-[.22em] text-[#ed3d8d] uppercase",
							children: "Activity"
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-1 text-[22px] font-bold tracking-[-.03em] text-[var(--ink)]",
							children: "Activity log"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11px] text-[#718197]",
							children: "All recorded user activity in the selected time range."
						})
					] }), /* @__PURE__ */ jsx("div", {
						className: "flex rounded-xl border border-[#dce4f0] bg-white p-1",
						children: RANGES.map((range) => /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => update({ range }),
							className: `rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${current.range === range ? "bg-[#ed3d8d] text-white" : "text-[#718197] hover:bg-[#f6f9ff]"}`,
							children: range
						}, range))
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ jsx("label", {
							className: "sr-only",
							htmlFor: "activity-category",
							children: "Activity category"
						}),
						/* @__PURE__ */ jsx("select", {
							id: "activity-category",
							value: current.category,
							onChange: (event) => update({ category: event.target.value }),
							className: "h-9 rounded-lg border border-[#dce4f0] bg-white px-3 text-[11px] font-medium text-[var(--ink)] outline-none focus:border-[#49d4ef]",
							children: CATEGORIES.map(([value, label]) => /* @__PURE__ */ jsx("option", {
								value,
								children: label
							}, value))
						}),
						/* @__PURE__ */ jsx("label", {
							className: "sr-only",
							htmlFor: "activity-event",
							children: "Activity event"
						}),
						/* @__PURE__ */ jsxs("select", {
							id: "activity-event",
							value: current.event,
							onChange: (event) => update({ event: event.target.value }),
							className: "h-9 min-w-[190px] rounded-lg border border-[#dce4f0] bg-white px-3 text-[11px] font-medium text-[var(--ink)] outline-none focus:border-[#49d4ef]",
							children: [/* @__PURE__ */ jsx("option", {
								value: "all",
								children: "All event keys"
							}), events.map((event) => /* @__PURE__ */ jsx("option", {
								value: event,
								children: EVENT_LABELS[event] ?? event.replaceAll("_", " ")
							}, event))]
						})
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-4 overflow-hidden rounded-xl border border-[#dce4f0] bg-white",
					children: rows.length === 0 ? /* @__PURE__ */ jsx("p", {
						className: "px-4 py-10 text-center text-[12px] text-[#718197]",
						children: "No activity matches these filters."
					}) : rows.map((row) => /* @__PURE__ */ jsxs("article", {
						className: "flex gap-3 border-b border-[#e8edf5] px-4 py-3 last:border-b-0",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "mt-1.5 h-2 w-2 shrink-0 rounded-full",
								style: { backgroundColor: TONES[row.category] ?? "#718197" }
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap items-center gap-1.5",
										children: [/* @__PURE__ */ jsx("strong", {
											className: "text-[12px] text-[var(--ink)]",
											children: row.name
										}), /* @__PURE__ */ jsx("span", {
											className: "rounded-full border border-[#dce4f0] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.1em] text-[#53657d] uppercase",
											children: row.category.replace("_", " ")
										})]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "mt-1 text-[11px] text-[#55667d]",
										children: row.summary
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "mt-1 text-[10px] text-[#8a98aa]",
										children: [
											row.email,
											" - ",
											formatTimestamp$2(row.date)
										]
									})
								]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "hidden shrink-0 self-start rounded-full bg-[#f1f4f8] px-2 py-1 text-[8px] font-semibold tracking-[.08em] text-[#718197] uppercase sm:block",
								children: EVENT_LABELS[row.event] ?? row.event.replaceAll("_", " ")
							})
						]
					}, row.id))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 flex flex-col gap-2 text-[11px] text-[#718197] sm:flex-row sm:items-center sm:justify-between sm:gap-3",
					children: [/* @__PURE__ */ jsxs("span", { children: [pagination.total ?? 0, " activities"] }), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: (pagination.currentPage ?? 1) <= 1,
								onClick: () => goToPage(pagination.currentPage - 1),
								className: "rounded-lg border border-[#dce4f0] bg-white px-3 py-1.5 font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45",
								children: "Previous"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "px-1 py-1.5",
								children: [
									"Page ",
									pagination.currentPage ?? 1,
									" of ",
									pagination.lastPage ?? 1
								]
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: (pagination.currentPage ?? 1) >= (pagination.lastPage ?? 1),
								onClick: () => goToPage(pagination.currentPage + 1),
								className: "rounded-lg border border-[#dce4f0] bg-white px-3 py-1.5 font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45",
								children: "Next"
							})
						]
					})]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/Pages/Admin/Blogs/shared.jsx
var shared_exports = /* @__PURE__ */ __exportAll({
	BlogTabs: () => BlogTabs,
	Field: () => Field,
	Notice: () => Notice,
	Pagination: () => Pagination,
	base: () => base,
	slugify: () => slugify
});
var base = "/x/admin/blogs";
var slugify = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function Notice() {
	const { flash = {}, errors = {} } = usePage().props;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [flash.status && /* @__PURE__ */ jsx("p", {
		role: "status",
		className: "blog-notice",
		children: flash.status
	}), Object.keys(errors).length > 0 && /* @__PURE__ */ jsxs("div", {
		role: "alert",
		className: "blog-errors",
		children: [/* @__PURE__ */ jsx("strong", { children: "Please check the following:" }), Object.entries(errors).map(([key, error]) => /* @__PURE__ */ jsxs("p", { children: [
			key,
			": ",
			error
		] }, key))]
	})] });
}
function Field({ label, children, error }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "blog-field",
		children: [
			/* @__PURE__ */ jsx("span", { children: label }),
			children,
			error && /* @__PURE__ */ jsx("small", {
				className: "text-red-700",
				children: error
			})
		]
	});
}
function Pagination({ links = [] }) {
	if (links.length <= 3) return null;
	return /* @__PURE__ */ jsx("nav", {
		"aria-label": "Pagination",
		className: "blog-pagination",
		children: links.map((link, i) => {
			const label = i === 0 ? "← Previous" : i === links.length - 1 ? "Next →" : String(link.label).replace(/<[^>]*>/g, "").replace(/&hellip;/g, "…");
			return link.url ? /* @__PURE__ */ jsx(Link, {
				href: link.url,
				"aria-current": link.active ? "page" : void 0,
				className: link.active ? "active" : "",
				children: label
			}, i) : /* @__PURE__ */ jsx("span", {
				"aria-disabled": "true",
				children: label
			}, i);
		})
	});
}
function BlogTabs() {
	return /* @__PURE__ */ jsxs("nav", {
		"aria-label": "Blog management",
		className: "blog-tabs",
		children: [
			/* @__PURE__ */ jsx(Link, {
				className: "blog-button",
				href: base,
				children: "Articles"
			}),
			/* @__PURE__ */ jsx(Link, {
				className: "blog-button",
				href: `${base}/create`,
				children: "Create article"
			}),
			/* @__PURE__ */ jsx(Link, {
				className: "blog-button",
				href: `${base}/categories`,
				children: "Categories"
			}),
			/* @__PURE__ */ jsx(Link, {
				className: "blog-button",
				href: `${base}/tags`,
				children: "Tags"
			}),
			/* @__PURE__ */ jsx(Link, {
				className: "blog-button",
				href: `${base}/featured`,
				children: "Featured"
			}),
			/* @__PURE__ */ jsx("a", {
				className: "blog-button",
				href: "/blog",
				target: "_blank",
				rel: "noreferrer",
				children: "View blog ↗"
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Admin/Blogs/Articles.jsx
var Articles_exports = /* @__PURE__ */ __exportAll({ default: () => Articles });
function Articles({ articles, categories, tags, filters, stats }) {
	const [search, setSearch] = useState(filters.search ?? "");
	const form = useForm({
		ids: [],
		action: ""
	});
	const [busy, setBusy] = useState(false);
	useEffect(() => {
		form.setData({
			ids: [],
			action: ""
		});
	}, [articles]);
	useEffect(() => setSearch(filters.search ?? ""), [filters.search]);
	const filter = (key, value) => router.get(base, {
		...filters,
		[key]: value,
		page: 1
	}, { preserveState: true });
	const mutate = (article, action) => {
		if (action === "delete" && !confirm(`Permanently delete “${article.title}”?`)) return;
		router.visit(`${base}/${article.id}${action === "delete" ? "" : `/${action}`}`, {
			method: action === "delete" ? "delete" : "post",
			preserveScroll: true,
			onStart: () => setBusy(true),
			onFinish: () => setBusy(false)
		});
	};
	const bulk = (e) => {
		e.preventDefault();
		if (form.data.action === "delete" && !confirm(`Permanently delete ${form.data.ids.length} selected articles?`)) return;
		form.post(`${base}/bulk`, {
			preserveScroll: true,
			onSuccess: () => form.reset()
		});
	};
	return /* @__PURE__ */ jsx(AdminLayout, {
		title: "Articles",
		section: "blogs",
		actions: /* @__PURE__ */ jsx(Link, {
			className: "blog-button primary",
			href: `${base}/create`,
			children: "New article"
		}),
		children: /* @__PURE__ */ jsxs("div", {
			className: "blog-admin",
			children: [
				/* @__PURE__ */ jsx(BlogTabs, {}),
				/* @__PURE__ */ jsx(Notice, {}),
				/* @__PURE__ */ jsx("div", {
					className: "blog-stats",
					children: Object.entries(stats).map(([label, count]) => /* @__PURE__ */ jsxs("div", {
						className: "blog-panel",
						children: [/* @__PURE__ */ jsx("span", { children: label }), /* @__PURE__ */ jsx("strong", { children: count })]
					}, label))
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "blog-panel",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "blog-filters",
							children: [
								/* @__PURE__ */ jsx("form", {
									onSubmit: (e) => {
										e.preventDefault();
										filter("search", search);
									},
									children: /* @__PURE__ */ jsx(Field, {
										label: "Search articles",
										children: /* @__PURE__ */ jsx("input", {
											placeholder: "Title, slug or excerpt",
											value: search,
											onChange: (e) => setSearch(e.target.value)
										})
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Status",
									children: /* @__PURE__ */ jsxs("select", {
										value: filters.status ?? "",
										onChange: (e) => filter("status", e.target.value),
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "",
												children: "All statuses"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "published",
												children: "Published"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "draft",
												children: "Draft"
											})
										]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Category",
									children: /* @__PURE__ */ jsxs("select", {
										value: filters.category ?? "",
										onChange: (e) => filter("category", e.target.value),
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "All categories"
										}), categories.map((c) => /* @__PURE__ */ jsx("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Tag",
									children: /* @__PURE__ */ jsxs("select", {
										value: filters.tag ?? "",
										onChange: (e) => filter("tag", e.target.value),
										children: [/* @__PURE__ */ jsx("option", {
											value: "",
											children: "All tags"
										}), tags.map((t) => /* @__PURE__ */ jsx("option", {
											value: t.id,
											children: t.name
										}, t.id))]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Featured",
									children: /* @__PURE__ */ jsxs("select", {
										value: filters.featured ?? "",
										onChange: (e) => filter("featured", e.target.value),
										children: [
											/* @__PURE__ */ jsx("option", {
												value: "",
												children: "All"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "featured",
												children: "Featured"
											}),
											/* @__PURE__ */ jsx("option", {
												value: "standard",
												children: "Not featured"
											})
										]
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Per page",
									children: /* @__PURE__ */ jsx("select", {
										value: filters.per_page ?? 10,
										onChange: (e) => filter("per_page", e.target.value),
										children: [
											10,
											25,
											50
										].map((n) => /* @__PURE__ */ jsx("option", { children: n }, n))
									})
								})
							]
						}),
						form.data.ids.length > 0 && /* @__PURE__ */ jsxs("form", {
							onSubmit: bulk,
							className: "blog-actions my-5",
							children: [
								/* @__PURE__ */ jsxs("strong", { children: [form.data.ids.length, " selected"] }),
								/* @__PURE__ */ jsxs("select", {
									"aria-label": "Bulk action",
									value: form.data.action,
									onChange: (e) => form.setData("action", e.target.value),
									children: [
										/* @__PURE__ */ jsx("option", {
											value: "",
											children: "Choose action"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "publish",
											children: "Publish"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "draft",
											children: "Move to draft"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "feature",
											children: "Feature"
										}),
										/* @__PURE__ */ jsx("option", {
											value: "delete",
											children: "Delete"
										})
									]
								}),
								/* @__PURE__ */ jsx("button", {
									className: "blog-button",
									disabled: !form.data.action || form.processing || busy,
									children: "Apply"
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ jsxs("table", {
								className: "blog-table",
								children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
									/* @__PURE__ */ jsx("th", { children: /* @__PURE__ */ jsx("input", {
										type: "checkbox",
										"aria-label": "Select all articles on this page",
										checked: articles.data.length > 0 && form.data.ids.length === articles.data.length,
										onChange: (e) => form.setData("ids", e.target.checked ? articles.data.map((a) => a.id) : [])
									}) }),
									/* @__PURE__ */ jsx("th", { children: "Title" }),
									/* @__PURE__ */ jsx("th", { children: "Category" }),
									/* @__PURE__ */ jsx("th", { children: "Status" }),
									/* @__PURE__ */ jsx("th", { children: "Published" }),
									/* @__PURE__ */ jsx("th", { children: "Actions" })
								] }) }), /* @__PURE__ */ jsxs("tbody", { children: [articles.data.map((article) => /* @__PURE__ */ jsxs("tr", { children: [
									/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("input", {
										type: "checkbox",
										"aria-label": `Select ${article.title}`,
										checked: form.data.ids.includes(article.id),
										onChange: (e) => form.setData("ids", e.target.checked ? [...form.data.ids, article.id] : form.data.ids.filter((id) => id !== article.id))
									}) }),
									/* @__PURE__ */ jsxs("td", { children: [
										/* @__PURE__ */ jsx(Link, {
											className: "font-semibold",
											href: `${base}/${article.id}/edit`,
											children: article.title
										}),
										/* @__PURE__ */ jsx("small", {
											className: "block text-slate-500",
											children: article.slug
										}),
										article.is_featured && /* @__PURE__ */ jsx("span", {
											className: "blog-badge",
											children: "Featured"
										})
									] }),
									/* @__PURE__ */ jsx("td", { children: article.category?.name ?? "—" }),
									/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", {
										className: `blog-badge ${article.status}`,
										children: article.status
									}) }),
									/* @__PURE__ */ jsx("td", { children: article.published_at?.slice(0, 10) ?? "—" }),
									/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", {
										className: "blog-actions",
										children: [
											/* @__PURE__ */ jsx(Link, {
												className: "blog-button",
												href: `${base}/${article.id}/edit`,
												children: "Edit"
											}),
											/* @__PURE__ */ jsx("button", {
												className: "blog-button",
												disabled: busy || form.processing,
												onClick: () => mutate(article, article.status === "published" ? "unpublish" : "publish"),
												children: article.status === "published" ? "Unpublish" : "Publish"
											}),
											/* @__PURE__ */ jsx("button", {
												className: "blog-button",
												disabled: busy || form.processing,
												onClick: () => mutate(article, "duplicate"),
												children: "Duplicate"
											}),
											/* @__PURE__ */ jsx("button", {
												className: "blog-button danger",
												disabled: busy || form.processing,
												onClick: () => mutate(article, "delete"),
												children: "Delete"
											})
										]
									}) })
								] }, article.id)), !articles.data.length && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
									colSpan: "6",
									className: "text-center py-12",
									children: "No articles found."
								}) })] })]
							})
						}),
						/* @__PURE__ */ jsx(Pagination, { links: articles.links })
					]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/landing/sections/Nav.jsx
function Nav({ homeHref = "#top" }) {
	const { auth } = usePage().props;
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
				href: homeHref,
				className: "brand",
				"aria-label": "Brand Beacon home",
				children: [/* @__PURE__ */ jsx(Logo, { className: "h-8 w-8" }), /* @__PURE__ */ jsx("span", { children: "Brand Beacon" })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "nav__end",
				children: [/* @__PURE__ */ jsx(Link, {
					href: auth?.signedIn ? "/home" : "/login",
					className: "nav__signin",
					children: auth?.signedIn ? "Dashboard" : "Sign In"
				}), /* @__PURE__ */ jsxs("a", {
					href: auth?.signedIn ? "/settings/subscription" : "/auth/google",
					className: "btn btn--primary",
					style: {
						height: 44,
						padding: "0 20px"
					},
					children: [/* @__PURE__ */ jsx("span", {
						className: "gicon gicon--sm",
						children: /* @__PURE__ */ jsx(Google, {})
					}), auth?.signedIn ? "My Plan" : "Try for Free"]
				})]
			})]
		})
	});
}
//#endregion
//#region resources/js/landing/sections/Footer.jsx
var COLS = [
	{
		h: "Product",
		links: [
			{
				label: "TikTok Brand Tracking",
				href: "/tiktok-brand-tracking"
			},
			{
				label: "TikTok Product Research",
				href: "/tiktok-product-research"
			},
			{
				label: "Viral Video Monitoring",
				href: "/viral-video-monitoring"
			}
		]
	},
	{
		h: "Company",
		links: [
			{
				label: "Blog",
				href: "/blog"
			},
			{
				label: "Support",
				href: "/support"
			},
			{
				label: "Contact",
				href: "/contact"
			}
		]
	},
	{
		h: "Resources",
		links: [{
			label: "Brand Tracking",
			href: "/tiktok-brand-tracking"
		}, {
			label: "UGC Trend Discovery",
			href: "/ugc-trend-discovery"
		}]
	},
	{
		h: "Legal",
		links: [
			{
				label: "Terms",
				href: "/terms"
			},
			{
				label: "Privacy",
				href: "/privacy"
			},
			{
				label: "DPA",
				href: "/dpa"
			},
			{
				label: "Security",
				href: "/security"
			}
		]
	}
];
function Footer({ homeHref = "#top" }) {
	const form = useForm({ email: "" });
	const subscribe = (e) => {
		e.preventDefault();
		form.post("/newsletter", {
			preserveScroll: true,
			onSuccess: () => form.reset("email")
		});
	};
	return /* @__PURE__ */ jsx("footer", {
		className: "ftr",
		children: /* @__PURE__ */ jsxs("div", {
			className: "wrap",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "ftr__top",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("a", {
						href: homeHref,
						className: "brand",
						children: [/* @__PURE__ */ jsx(Logo, { className: "h-8 w-8" }), /* @__PURE__ */ jsx("span", { children: "Brand Beacon" })]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "ftr__blurb",
						children: "TikTok social intelligence for brands. Find the viral videos moving your category, and the creators behind them."
					}),
					/* @__PURE__ */ jsxs("form", {
						className: "ftr__form",
						onSubmit: subscribe,
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
									placeholder: "you@brand.com",
									autoComplete: "email",
									value: form.data.email,
									onChange: (e) => form.setData("email", e.target.value),
									disabled: form.processing
								}), /* @__PURE__ */ jsx("button", {
									type: "submit",
									className: "btn btn--primary",
									disabled: form.processing,
									children: form.processing ? "Subscribing…" : form.wasSuccessful ? "Subscribed" : "Subscribe"
								})]
							}),
							form.errors.email ? /* @__PURE__ */ jsx("p", {
								className: "ftr__fine ftr__fine--error",
								children: form.errors.email
							}) : form.wasSuccessful ? /* @__PURE__ */ jsx("p", {
								className: "ftr__fine",
								children: "Thanks — you're on the list. One email a week."
							}) : /* @__PURE__ */ jsx("p", {
								className: "ftr__fine",
								children: "One email a week. Unsubscribe anytime."
							})
						]
					})
				] }), /* @__PURE__ */ jsx("div", {
					className: "ftr__cols",
					children: COLS.map((col) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h4", { children: col.h }), /* @__PURE__ */ jsx("ul", { children: col.links.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
						href: link.href,
						children: link.label
					}) }, link.label)) })] }, col.h))
				})]
			}), /* @__PURE__ */ jsx("div", {
				className: "ftr__btm",
				children: /* @__PURE__ */ jsx("p", { children: "© 2026 Brand Beacon. TikTok viral intelligence for brands." })
			})]
		})
	});
}
//#endregion
//#region resources/js/Pages/Blog/components.jsx
var components_exports = /* @__PURE__ */ __exportAll({
	Art: () => Art,
	ArticleBlocks: () => ArticleBlocks,
	Badges: () => Badges,
	Card: () => Card$1,
	Cta: () => Cta,
	Shell: () => Shell
});
function Shell({ seo, jsonLd, children }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs(Head, {
		title: seo.title,
		children: [
			/* @__PURE__ */ jsx("meta", {
				"head-key": "description",
				name: "description",
				content: seo.description
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "robots",
				name: "robots",
				content: seo.noIndex ? "noindex,follow" : "index,follow"
			}),
			/* @__PURE__ */ jsx("link", {
				"head-key": "canonical",
				rel: "canonical",
				href: seo.canonical
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:type",
				property: "og:type",
				content: seo.type ?? "website"
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:title",
				property: "og:title",
				content: seo.title
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:description",
				property: "og:description",
				content: seo.description
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:url",
				property: "og:url",
				content: seo.canonical
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:image",
				property: "og:image",
				content: seo.image || new URL("/brand-beacon-logo.svg", seo.canonical).href
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:card",
				name: "twitter:card",
				content: "summary_large_image"
			}),
			seo.published && /* @__PURE__ */ jsx("meta", {
				"head-key": "published",
				property: "article:published_time",
				content: seo.published
			}),
			seo.modified && /* @__PURE__ */ jsx("meta", {
				"head-key": "modified",
				property: "article:modified_time",
				content: seo.modified
			}),
			/* @__PURE__ */ jsx("script", {
				"head-key": "blog-jsonld",
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }
			})
		]
	}), /* @__PURE__ */ jsxs("div", {
		className: "blog-public",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "bbh",
				children: /* @__PURE__ */ jsx(Nav, { homeHref: "/" })
			}),
			children,
			/* @__PURE__ */ jsx("div", {
				className: "bbh",
				children: /* @__PURE__ */ jsx(Footer, { homeHref: "/" })
			})
		]
	})] });
}
function Badges({ article }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap gap-2",
		children: [article.category && /* @__PURE__ */ jsx("span", {
			className: "blog-badge",
			children: article.category.name
		}), article.tags.map((tag) => /* @__PURE__ */ jsx("span", {
			className: "blog-badge",
			children: tag.name
		}, tag.name))]
	});
}
function Art({ label = "Creator intelligence", className = "" }) {
	return /* @__PURE__ */ jsx("div", {
		className: `blog-art ${className}`,
		children: /* @__PURE__ */ jsx("span", { children: label })
	});
}
function Card$1({ article }) {
	return /* @__PURE__ */ jsxs(Link, {
		href: article.url,
		className: "blog-card",
		children: [article.heroMedium ? /* @__PURE__ */ jsx("img", {
			src: article.heroMedium,
			alt: "",
			loading: "lazy"
		}) : /* @__PURE__ */ jsx(Art, {}), /* @__PURE__ */ jsxs("div", {
			className: "blog-card-copy",
			children: [
				/* @__PURE__ */ jsx(Badges, { article }),
				/* @__PURE__ */ jsx("h3", { children: article.title }),
				/* @__PURE__ */ jsx("p", { children: article.excerpt }),
				/* @__PURE__ */ jsxs("div", {
					className: "blog-card-footer",
					children: [/* @__PURE__ */ jsx("time", { children: article.publishedDate }), /* @__PURE__ */ jsx("span", { children: "Read article ↗" })]
				})
			]
		})]
	});
}
function Cta({ eyebrow = "Put your research to work", title = "Find your next breakout idea.", text = "Discover the videos, brands and products gaining momentum with Brand Beacon.", button_label = "Explore Brand Beacon", button_url = "/home" }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "blog-cta",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "blog-eyebrow",
				children: eyebrow
			}),
			/* @__PURE__ */ jsx("h2", { children: title }),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm leading-relaxed",
				children: text
			}),
			button_label && button_url && /* @__PURE__ */ jsxs("a", {
				className: "blog-button primary",
				href: button_url,
				children: [button_label, " →"]
			})
		]
	});
}
function ArticleBlocks({ blocks }) {
	return /* @__PURE__ */ jsx("div", {
		className: "blog-blocks",
		children: blocks.map((b, i) => {
			switch (b.type) {
				case "paragraph": return b.text ? /* @__PURE__ */ jsx("p", { children: b.text }, i) : null;
				case "heading": {
					const Tag = `h${b.level}`;
					return b.text ? /* @__PURE__ */ jsx(Tag, {
						id: b.anchor,
						children: b.text
					}, i) : null;
				}
				case "list": {
					const Tag = b.style === "ordered" ? "ol" : "ul";
					return b.items.length ? /* @__PURE__ */ jsx(Tag, { children: b.items.map((item, n) => /* @__PURE__ */ jsx("li", { children: item }, n)) }, i) : null;
				}
				case "quote": return b.text ? /* @__PURE__ */ jsxs("blockquote", { children: [/* @__PURE__ */ jsx("p", { children: b.text }), b.attribution && /* @__PURE__ */ jsxs("cite", { children: ["— ", b.attribution] })] }, i) : null;
				case "callout": return b.title || b.text ? /* @__PURE__ */ jsxs("section", {
					className: `blog-callout ${b.tone}`,
					children: [b.title && /* @__PURE__ */ jsx("strong", { children: b.title }), b.text && /* @__PURE__ */ jsx("p", { children: b.text })]
				}, i) : null;
				case "link": return b.label && b.url ? /* @__PURE__ */ jsxs("a", {
					className: "blog-panel",
					href: b.url,
					target: "_blank",
					rel: "noopener noreferrer",
					children: [/* @__PURE__ */ jsxs("strong", { children: [b.label, " ↗"] }), b.text && /* @__PURE__ */ jsx("p", { children: b.text })]
				}, i) : null;
				case "image": return b.src ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
					src: b.src,
					alt: b.alt,
					loading: "lazy"
				}), b.caption && /* @__PURE__ */ jsx("figcaption", { children: b.caption })] }, i) : null;
				case "embed": return b.url ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("iframe", {
					src: b.url,
					title: b.caption || `Embedded video ${i + 1}`,
					loading: "lazy",
					allowFullScreen: true,
					sandbox: "allow-scripts allow-same-origin allow-presentation",
					referrerPolicy: "strict-origin-when-cross-origin",
					allow: "fullscreen; picture-in-picture"
				}), b.caption && /* @__PURE__ */ jsx("figcaption", { children: b.caption })] }, i) : null;
				case "cta": return b.title || b.text ? /* @__PURE__ */ jsx(Cta, { ...b }, i) : null;
				case "divider": return /* @__PURE__ */ jsx("hr", { className: "border-slate-200" }, i);
				default: return null;
			}
		})
	});
}
//#endregion
//#region resources/js/Pages/Admin/Blogs/Editor.jsx
var Editor_exports = /* @__PURE__ */ __exportAll({ default: () => Editor });
function ImageBlockField({ block, onChange, error }) {
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState(null);
	const upload = async (file) => {
		if (!file) return;
		setUploading(true);
		setUploadError(null);
		const data = new FormData();
		data.append("image", file);
		try {
			const csrf = document.querySelector("meta[name=\"csrf-token\"]")?.content;
			const res = await fetch(`${base}/images`, {
				method: "POST",
				body: data,
				headers: {
					"X-Requested-With": "XMLHttpRequest",
					...csrf ? { "X-CSRF-TOKEN": csrf } : {}
				}
			});
			if (!res.ok) throw new Error("Upload failed");
			onChange("src", (await res.json()).url);
		} catch {
			setUploadError("Could not upload that image. Try again.");
		} finally {
			setUploading(false);
		}
	};
	return /* @__PURE__ */ jsxs(Field, {
		label: "Image",
		error: error || uploadError,
		children: [/* @__PURE__ */ jsxs("div", {
			className: "blog-image-drop",
			children: [
				block.src && /* @__PURE__ */ jsx("img", {
					src: block.src,
					alt: ""
				}),
				/* @__PURE__ */ jsx("input", {
					type: "file",
					accept: "image/jpeg,image/png,image/webp,image/gif",
					disabled: uploading,
					onChange: (e) => upload(e.target.files[0])
				}),
				uploading && /* @__PURE__ */ jsx("span", {
					className: "text-xs text-slate-500",
					children: "Uploading…"
				})
			]
		}), /* @__PURE__ */ jsx("input", {
			placeholder: "Or paste an image URL",
			value: block.src,
			onChange: (e) => onChange("src", e.target.value)
		})]
	});
}
var fields = {
	paragraph: ["text"],
	heading: ["text"],
	list: [],
	quote: ["text", "attribution"],
	callout: ["title", "text"],
	link: [
		"label",
		"url",
		"text"
	],
	image: [
		"src",
		"alt",
		"caption"
	],
	embed: ["url", "caption"],
	cta: [
		"eyebrow",
		"title",
		"text",
		"button_label",
		"button_url"
	],
	divider: []
};
function newBlock(type) {
	return {
		type,
		...Object.fromEntries(fields[type].map((key) => [key, key === "eyebrow" ? "Next step" : ""])),
		...type === "heading" ? { level: 2 } : {},
		...type === "list" ? {
			style: "bullet",
			items: ["", ""]
		} : {},
		...type === "callout" ? { tone: "info" } : {}
	};
}
function Editor({ article, content, categories, tags, publishedLocal, timezone, heroUrl }) {
	const form = useForm({
		title: article?.title ?? "",
		slug: article?.slug ?? "",
		excerpt: article?.excerpt ?? "",
		status: article?.status ?? "draft",
		published_at: publishedLocal ?? "",
		category_id: article?.category_id ?? "",
		tag_ids: article?.tags.map((t) => t.id) ?? [],
		is_featured: article?.is_featured ?? false,
		layout: content.layout,
		blocks: content.blocks,
		heroImageUpload: null
	});
	const [manualSlug, setManualSlug] = useState(!!article);
	const [preview, setPreview] = useState(null);
	const [showPreview, setShowPreview] = useState(false);
	useEffect(() => {
		if (!form.data.heroImageUpload) {
			setPreview(null);
			return;
		}
		const url = URL.createObjectURL(form.data.heroImageUpload);
		setPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [form.data.heroImageUpload]);
	const blocks = form.data.blocks;
	const update = (i, key, value) => form.setData("blocks", blocks.map((b, n) => n === i ? {
		...b,
		[key]: value
	} : b));
	const move = (i, delta) => {
		const next = [...blocks];
		[next[i], next[i + delta]] = [next[i + delta], next[i]];
		form.setData("blocks", next);
	};
	const save = (status) => {
		form.transform((data) => ({
			...data,
			status,
			...article ? { _method: "put" } : {}
		}));
		form.post(article ? `${base}/${article.id}` : base, {
			forceFormData: true,
			preserveScroll: true,
			onSuccess: () => form.setData("heroImageUpload", null)
		});
	};
	return /* @__PURE__ */ jsxs(AdminLayout, {
		title: article ? "Edit article" : "New article",
		section: "blogs-create",
		actions: /* @__PURE__ */ jsxs("div", {
			className: "blog-actions",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "blog-button",
					onClick: () => setShowPreview(true),
					children: "Preview"
				}),
				/* @__PURE__ */ jsx("button", {
					className: "blog-button",
					disabled: form.processing,
					onClick: () => save("draft"),
					children: "Save draft"
				}),
				/* @__PURE__ */ jsx("button", {
					className: "blog-button primary",
					disabled: form.processing,
					onClick: () => save("published"),
					children: form.processing ? "Saving…" : "Publish"
				})
			]
		}),
		children: [/* @__PURE__ */ jsxs("div", {
			className: "blog-admin",
			children: [
				/* @__PURE__ */ jsx(BlogTabs, {}),
				/* @__PURE__ */ jsx(Notice, {}),
				/* @__PURE__ */ jsx(Link, {
					className: "inline-block mb-4",
					href: base,
					children: "← Articles"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "blog-editor",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-5",
						children: [
							/* @__PURE__ */ jsxs("section", {
								className: "blog-panel space-y-5",
								children: [
									/* @__PURE__ */ jsx(Field, {
										label: "Title",
										error: form.errors.title,
										children: /* @__PURE__ */ jsx("input", {
											maxLength: 255,
											value: form.data.title,
											onChange: (e) => form.setData({
												...form.data,
												title: e.target.value,
												...!manualSlug ? { slug: slugify(e.target.value) } : {}
											})
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Slug",
										error: form.errors.slug,
										children: /* @__PURE__ */ jsx("input", {
											maxLength: 255,
											value: form.data.slug,
											onChange: (e) => {
												setManualSlug(true);
												form.setData("slug", e.target.value);
											}
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Excerpt",
										error: form.errors.excerpt,
										children: /* @__PURE__ */ jsx("textarea", {
											rows: 3,
											maxLength: 500,
											value: form.data.excerpt,
											onChange: (e) => form.setData("excerpt", e.target.value)
										})
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between items-center",
								children: [/* @__PURE__ */ jsx("h2", {
									className: "font-semibold text-lg",
									children: "Content blocks"
								}), /* @__PURE__ */ jsxs("span", {
									className: "text-sm text-slate-500",
									children: [
										"Plain text · ",
										blocks.length,
										" blocks"
									]
								})]
							}),
							blocks.map((block, i) => /* @__PURE__ */ jsxs("section", {
								className: "blog-panel space-y-4",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "flex flex-wrap justify-between gap-3",
										children: [/* @__PURE__ */ jsxs("h3", {
											className: "capitalize font-semibold",
											children: [
												i + 1,
												". ",
												block.type
											]
										}), /* @__PURE__ */ jsxs("div", {
											className: "blog-actions",
											children: [
												/* @__PURE__ */ jsx("button", {
													type: "button",
													className: "blog-button",
													"aria-label": `Move block ${i + 1} up`,
													disabled: i === 0,
													onClick: () => move(i, -1),
													children: "↑ Up"
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													className: "blog-button",
													"aria-label": `Move block ${i + 1} down`,
													disabled: i === blocks.length - 1,
													onClick: () => move(i, 1),
													children: "↓ Down"
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													className: "blog-button",
													onClick: () => form.setData("blocks", [
														...blocks.slice(0, i + 1),
														JSON.parse(JSON.stringify(block)),
														...blocks.slice(i + 1)
													]),
													children: "Duplicate"
												}),
												/* @__PURE__ */ jsx("button", {
													type: "button",
													className: "blog-button danger",
													onClick: () => form.setData("blocks", blocks.filter((_, n) => n !== i)),
													children: "Remove"
												})
											]
										})]
									}),
									block.type === "heading" && /* @__PURE__ */ jsx(Field, {
										label: "Heading level",
										children: /* @__PURE__ */ jsx("select", {
											value: block.level,
											onChange: (e) => update(i, "level", Number(e.target.value)),
											children: [
												1,
												2,
												3
											].map((n) => /* @__PURE__ */ jsxs("option", {
												value: n,
												children: ["H", n]
											}, n))
										})
									}),
									block.type === "callout" && /* @__PURE__ */ jsx(Field, {
										label: "Tone",
										children: /* @__PURE__ */ jsx("select", {
											value: block.tone,
											onChange: (e) => update(i, "tone", e.target.value),
											children: [
												"info",
												"tip",
												"warning"
											].map((tone) => /* @__PURE__ */ jsx("option", { children: tone }, tone))
										})
									}),
									block.type === "image" && /* @__PURE__ */ jsx(ImageBlockField, {
										block,
										onChange: (key, value) => update(i, key, value),
										error: form.errors[`blocks.${i}.src`]
									}),
									fields[block.type]?.filter((key) => !(block.type === "image" && key === "src")).map((key) => /* @__PURE__ */ jsx(Field, {
										label: key.replaceAll("_", " "),
										error: form.errors[`blocks.${i}.${key}`],
										children: key === "text" ? /* @__PURE__ */ jsx("textarea", {
											rows: 4,
											value: block[key],
											onChange: (e) => update(i, key, e.target.value)
										}) : /* @__PURE__ */ jsx("input", {
											value: block[key],
											onChange: (e) => update(i, key, e.target.value)
										})
									}, key)),
									block.type === "embed" && /* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-500",
										children: "YouTube or Vimeo HTTPS video links. Watch links are converted automatically."
									}),
									block.type === "list" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
										/* @__PURE__ */ jsx(Field, {
											label: "List style",
											children: /* @__PURE__ */ jsxs("select", {
												value: block.style,
												onChange: (e) => update(i, "style", e.target.value),
												children: [/* @__PURE__ */ jsx("option", {
													value: "bullet",
													children: "Bullet"
												}), /* @__PURE__ */ jsx("option", {
													value: "ordered",
													children: "Ordered"
												})]
											})
										}),
										block.items.map((item, n) => /* @__PURE__ */ jsxs("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ jsx("input", {
												"aria-label": `Block ${i + 1}, list item ${n + 1}`,
												value: item,
												onChange: (e) => update(i, "items", block.items.map((v, j) => j === n ? e.target.value : v))
											}), /* @__PURE__ */ jsx("button", {
												type: "button",
												className: "blog-button",
												"aria-label": `Remove list item ${n + 1}`,
												onClick: () => update(i, "items", block.items.filter((_, j) => j !== n)),
												children: "Remove"
											})]
										}, n)),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											className: "blog-button",
											onClick: () => update(i, "items", [...block.items, ""]),
											children: "Add item"
										})
									] }),
									block.type === "divider" && /* @__PURE__ */ jsx("hr", { className: "border-slate-200" })
								]
							}, i)),
							!blocks.length && /* @__PURE__ */ jsx("p", {
								className: "blog-panel",
								children: "No blocks yet. Add one below."
							}),
							/* @__PURE__ */ jsxs("section", {
								className: "blog-panel",
								children: [/* @__PURE__ */ jsx("h3", {
									className: "font-semibold mb-3",
									children: "Add a block"
								}), /* @__PURE__ */ jsx("div", {
									className: "blog-actions",
									children: Object.keys(fields).map((type) => /* @__PURE__ */ jsxs("button", {
										type: "button",
										className: "blog-button capitalize",
										onClick: () => form.setData("blocks", [...blocks, newBlock(type)]),
										children: ["+ ", type]
									}, type))
								})]
							})
						]
					}), /* @__PURE__ */ jsxs("aside", {
						className: "space-y-5",
						children: [
							/* @__PURE__ */ jsxs("section", {
								className: "blog-panel space-y-4",
								children: [
									/* @__PURE__ */ jsx("h2", {
										className: "font-semibold",
										children: "Settings"
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Status",
										children: /* @__PURE__ */ jsxs("select", {
											value: form.data.status,
											onChange: (e) => form.setData("status", e.target.value),
											children: [/* @__PURE__ */ jsx("option", {
												value: "draft",
												children: "Draft"
											}), /* @__PURE__ */ jsx("option", {
												value: "published",
												children: "Published"
											})]
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: `Publication date (${timezone})`,
										children: /* @__PURE__ */ jsx("input", {
											type: "datetime-local",
											value: form.data.published_at,
											onChange: (e) => form.setData("published_at", e.target.value)
										})
									}),
									/* @__PURE__ */ jsx("p", {
										className: "text-xs text-slate-500",
										children: "Publish makes the article public immediately. The date does not schedule publication."
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Layout",
										children: /* @__PURE__ */ jsx("select", {
											value: form.data.layout,
											onChange: (e) => form.setData("layout", e.target.value),
											children: [
												"standard",
												"guide",
												"analysis"
											].map((v) => /* @__PURE__ */ jsx("option", { children: v }, v))
										})
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Category",
										children: /* @__PURE__ */ jsxs("select", {
											value: form.data.category_id,
											onChange: (e) => form.setData("category_id", e.target.value),
											children: [/* @__PURE__ */ jsx("option", {
												value: "",
												children: "Uncategorized"
											}), categories.map((c) => /* @__PURE__ */ jsx("option", {
												value: c.id,
												children: c.name
											}, c.id))]
										})
									}),
									/* @__PURE__ */ jsxs("label", {
										className: "flex gap-2 items-center",
										children: [/* @__PURE__ */ jsx("input", {
											type: "checkbox",
											checked: form.data.is_featured,
											onChange: (e) => form.setData("is_featured", e.target.checked)
										}), " Featured"]
									})
								]
							}),
							/* @__PURE__ */ jsxs("section", {
								className: "blog-panel",
								children: [/* @__PURE__ */ jsx("h2", {
									className: "font-semibold mb-3",
									children: "Tags"
								}), /* @__PURE__ */ jsxs("div", {
									className: "blog-actions",
									children: [tags.map((tag) => /* @__PURE__ */ jsx("button", {
										type: "button",
										"aria-pressed": form.data.tag_ids.includes(tag.id),
										className: `blog-button ${form.data.tag_ids.includes(tag.id) ? "primary" : ""}`,
										onClick: () => form.setData("tag_ids", form.data.tag_ids.includes(tag.id) ? form.data.tag_ids.filter((id) => id !== tag.id) : [...form.data.tag_ids, tag.id]),
										children: tag.name
									}, tag.id)), !tags.length && /* @__PURE__ */ jsx("p", { children: "No tags yet." })]
								})]
							}),
							/* @__PURE__ */ jsxs("section", {
								className: "blog-panel space-y-3",
								children: [
									/* @__PURE__ */ jsx("h2", {
										className: "font-semibold",
										children: "Hero image"
									}),
									(preview || heroUrl) && /* @__PURE__ */ jsx("img", {
										className: "rounded-xl w-full",
										src: preview || heroUrl,
										alt: "Article hero preview"
									}),
									/* @__PURE__ */ jsx(Field, {
										label: "Upload image (up to 5 MB)",
										error: form.errors.heroImageUpload,
										children: /* @__PURE__ */ jsx("input", {
											type: "file",
											accept: "image/jpeg,image/png,image/webp,image/gif",
											onChange: (e) => form.setData("heroImageUpload", e.target.files[0] ?? null)
										}, article?.updated_at ?? "new")
									})
								]
							})
						]
					})]
				})
			]
		}), showPreview && /* @__PURE__ */ jsx("div", {
			className: "blog-modal-backdrop",
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Article preview",
			onClick: (e) => e.target === e.currentTarget && setShowPreview(false),
			children: /* @__PURE__ */ jsxs("div", {
				className: "blog-modal",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "blog-modal-head",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "blog-eyebrow",
						children: "Preview"
					}), /* @__PURE__ */ jsx("strong", { children: form.data.title || "Untitled article" })] }), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "blog-button",
						onClick: () => setShowPreview(false),
						children: "Close ✕"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "blog-modal-body",
					children: [
						(preview || heroUrl) && /* @__PURE__ */ jsx("img", {
							className: "blog-article-hero",
							src: preview || heroUrl,
							alt: form.data.title
						}),
						form.data.category_id && /* @__PURE__ */ jsx("p", {
							className: "blog-eyebrow mb-3",
							children: categories.find((c) => String(c.id) === String(form.data.category_id))?.name
						}),
						/* @__PURE__ */ jsx("h1", {
							className: "blog-article-title",
							children: form.data.title || "Untitled article"
						}),
						form.data.excerpt && /* @__PURE__ */ jsx("p", {
							className: "blog-article-excerpt",
							children: form.data.excerpt
						}),
						/* @__PURE__ */ jsx(ArticleBlocks, { blocks })
					]
				})]
			})
		})]
	});
}
//#endregion
//#region resources/js/Pages/Admin/Blogs/Featured.jsx
var Featured_exports = /* @__PURE__ */ __exportAll({ default: () => Featured });
function Featured({ articles }) {
	const [order, setOrder] = useState(articles);
	const [busy, setBusy] = useState(false);
	const form = useForm({ ordered_ids: [] });
	useEffect(() => setOrder(articles), [articles]);
	const dirty = order.some((a, i) => a.id !== articles[i]?.id);
	const move = (i, delta) => {
		const next = [...order];
		[next[i], next[i + delta]] = [next[i + delta], next[i]];
		setOrder(next);
	};
	const save = () => form.transform(() => ({ ordered_ids: order.map((a) => a.id) })).put(`${base}/featured`, { preserveScroll: true });
	const remove = (article) => {
		if (!confirm(`Remove “${article.title}” from featured articles?`)) return;
		router.post(`${base}/${article.id}/unfeature`, {}, {
			preserveScroll: true,
			onStart: () => setBusy(true),
			onFinish: () => setBusy(false)
		});
	};
	return /* @__PURE__ */ jsx(AdminLayout, {
		title: "Featured articles",
		section: "blogs-featured",
		actions: dirty && /* @__PURE__ */ jsx("button", {
			className: "blog-button primary",
			disabled: form.processing || busy,
			onClick: save,
			children: "Save order"
		}),
		children: /* @__PURE__ */ jsxs("div", {
			className: "blog-admin",
			children: [
				/* @__PURE__ */ jsx(BlogTabs, {}),
				/* @__PURE__ */ jsx(Notice, {}),
				/* @__PURE__ */ jsxs("section", {
					className: "blog-panel",
					children: [order.map((article, i) => /* @__PURE__ */ jsxs("div", {
						className: "blog-taxonomy-row",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "blog-badge",
								children: i + 1
							}),
							article.heroUrl && /* @__PURE__ */ jsx("img", {
								src: article.heroUrl,
								alt: "",
								className: "h-12 w-16 rounded-lg object-cover"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("strong", {
									className: "block truncate",
									children: article.title
								}), /* @__PURE__ */ jsx("small", { children: article.category?.name ?? "Uncategorized" })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "blog-actions",
								children: [
									/* @__PURE__ */ jsx("button", {
										className: "blog-button",
										"aria-label": `Move ${article.title} up`,
										disabled: i === 0 || busy || form.processing,
										onClick: () => move(i, -1),
										children: "↑ Up"
									}),
									/* @__PURE__ */ jsx("button", {
										className: "blog-button",
										"aria-label": `Move ${article.title} down`,
										disabled: i === order.length - 1 || busy || form.processing,
										onClick: () => move(i, 1),
										children: "↓ Down"
									}),
									/* @__PURE__ */ jsx("button", {
										className: "blog-button danger",
										disabled: busy || form.processing,
										onClick: () => remove(article),
										children: "Remove"
									})
								]
							})
						]
					}, article.id)), !order.length && /* @__PURE__ */ jsxs("div", {
						className: "text-center py-12",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "font-semibold",
							children: "No featured articles yet."
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-slate-500",
							children: "Feature a published article from the articles table."
						})]
					})]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/Pages/Admin/Blogs/Taxonomy.jsx
var Taxonomy_exports = /* @__PURE__ */ __exportAll({ default: () => Taxonomy });
function Taxonomy({ kind, items }) {
	const category = kind === "categories";
	const singular = category ? "category" : "tag";
	const title = category ? "Categories" : "Tags";
	const dialog = useRef(null);
	const [editing, setEditing] = useState(null);
	const [open, setOpen] = useState(false);
	const [busy, setBusy] = useState(false);
	const [manualSlug, setManualSlug] = useState(false);
	const form = useForm({
		name: "",
		slug: "",
		color: "#00e8c4"
	});
	useEffect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		dialog.current.showModal();
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open]);
	const close = () => {
		if (!form.processing) {
			dialog.current.close();
			setOpen(false);
		}
	};
	const edit = (item = null) => {
		setEditing(item);
		setManualSlug(!!item);
		form.clearErrors();
		form.setData({
			name: item?.name ?? "",
			slug: item?.slug ?? "",
			color: item?.color ?? "#00e8c4"
		});
		setOpen(true);
	};
	const submit = (e) => {
		e.preventDefault();
		form[editing ? "put" : "post"](`${base}/${kind}${editing ? `/${editing.id}` : ""}`, {
			preserveScroll: true,
			onSuccess: () => {
				dialog.current.close();
				setOpen(false);
				form.reset();
			}
		});
	};
	const remove = (item) => {
		if (!confirm(`Delete ${singular} “${item.name}”? Its ${item.articles_count} articles will be retained.`)) return;
		router.delete(`${base}/${kind}/${item.id}`, {
			preserveScroll: true,
			onStart: () => setBusy(true),
			onFinish: () => setBusy(false)
		});
	};
	return /* @__PURE__ */ jsx(AdminLayout, {
		title,
		section: `blogs-${kind}`,
		actions: /* @__PURE__ */ jsxs("button", {
			className: "blog-button primary",
			onClick: () => edit(),
			children: ["New ", singular]
		}),
		children: /* @__PURE__ */ jsxs("div", {
			className: "blog-admin",
			children: [
				/* @__PURE__ */ jsx(BlogTabs, {}),
				/* @__PURE__ */ jsx(Notice, {}),
				/* @__PURE__ */ jsxs("section", {
					className: "blog-panel",
					children: [items.map((item) => /* @__PURE__ */ jsxs("div", {
						className: "blog-taxonomy-row",
						children: [
							category && /* @__PURE__ */ jsx("span", {
								className: "w-5 h-5 rounded-full border border-slate-200 shrink-0",
								style: { backgroundColor: item.color }
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("strong", { children: item.name }), /* @__PURE__ */ jsxs("p", {
									className: "text-sm text-slate-500",
									children: [
										item.slug,
										" · ",
										item.articles_count,
										" articles"
									]
								})]
							}),
							/* @__PURE__ */ jsx("button", {
								className: "blog-button",
								onClick: () => edit(item),
								children: "Edit"
							}),
							/* @__PURE__ */ jsx("button", {
								className: "blog-button danger",
								disabled: busy,
								onClick: () => remove(item),
								children: "Delete"
							})
						]
					}, item.id)), !items.length && /* @__PURE__ */ jsxs("p", {
						className: "text-center py-12",
						children: [
							"No ",
							kind,
							" yet."
						]
					})]
				}),
				/* @__PURE__ */ jsx("dialog", {
					ref: dialog,
					className: "blog-dialog",
					"aria-labelledby": "taxonomy-title",
					onCancel: (e) => {
						e.preventDefault();
						close();
					},
					onClick: (e) => {
						if (e.target === dialog.current) close();
					},
					children: /* @__PURE__ */ jsxs("form", {
						onSubmit: submit,
						className: "blog-panel space-y-5",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex justify-between items-center",
								children: [/* @__PURE__ */ jsxs("h2", {
									id: "taxonomy-title",
									className: "font-semibold text-xl",
									children: [
										editing ? "Edit" : "New",
										" ",
										singular
									]
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									"aria-label": "Close dialog",
									disabled: form.processing,
									onClick: close,
									children: "✕"
								})]
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Name",
								error: form.errors.name,
								children: /* @__PURE__ */ jsx("input", {
									autoFocus: true,
									required: true,
									maxLength: 255,
									value: form.data.name,
									onChange: (e) => form.setData({
										...form.data,
										name: e.target.value,
										...!manualSlug ? { slug: slugify(e.target.value) } : {}
									})
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "Slug",
								error: form.errors.slug,
								children: /* @__PURE__ */ jsx("input", {
									required: true,
									maxLength: 255,
									value: form.data.slug,
									onChange: (e) => {
										setManualSlug(true);
										form.setData("slug", e.target.value);
									}
								})
							}),
							category && /* @__PURE__ */ jsxs("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ jsx(Field, {
									label: "Color picker",
									children: /* @__PURE__ */ jsx("input", {
										type: "color",
										value: /^#[0-9a-f]{6}$/i.test(form.data.color) ? form.data.color : "#00e8c4",
										onChange: (e) => form.setData("color", e.target.value)
									})
								}), /* @__PURE__ */ jsx(Field, {
									label: "Hex color",
									error: form.errors.color,
									children: /* @__PURE__ */ jsx("input", {
										value: form.data.color,
										maxLength: 7,
										pattern: "#[0-9A-Fa-f]{6}",
										onChange: (e) => form.setData("color", e.target.value)
									})
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "blog-actions justify-end",
								children: [/* @__PURE__ */ jsx("button", {
									className: "blog-button",
									type: "button",
									disabled: form.processing,
									onClick: close,
									children: "Cancel"
								}), /* @__PURE__ */ jsx("button", {
									className: "blog-button primary",
									disabled: form.processing,
									children: form.processing ? "Saving…" : "Save"
								})]
							})
						]
					})
				})
			]
		})
	});
}
//#endregion
//#region resources/js/Pages/Admin/CriticalErrors.jsx
var CriticalErrors_exports = /* @__PURE__ */ __exportAll({ default: () => CriticalErrors });
var STATUSES = [
	["unresolved", "Unresolved"],
	["resolved", "Resolved"],
	["all", "All"]
];
function formatTimestamp$1(value) {
	if (!value) return "-";
	return new Date(value).toLocaleString(void 0, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function ErrorRow({ row }) {
	const [expanded, setExpanded] = useState(false);
	const resolveForm = useForm({});
	const hasDetails = Boolean(row.exceptionClass || row.file || row.context && Object.keys(row.context).length > 0);
	const resolve = () => {
		resolveForm.patch(`/x/admin/critical-errors/${row.id}/resolve`, { preserveScroll: true });
	};
	return /* @__PURE__ */ jsx("article", {
		className: "border-b border-[#e8edf5] px-4 py-3 last:border-b-0",
		children: /* @__PURE__ */ jsxs("div", {
			className: "flex gap-3",
			children: [
				/* @__PURE__ */ jsx("span", { className: `mt-1.5 h-2 w-2 shrink-0 rounded-full ${row.resolvedAt ? "bg-[#25a6d9]" : "bg-[var(--warn)]"}` }),
				/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-1.5",
							children: [
								/* @__PURE__ */ jsx("strong", {
									className: "text-[12px] text-[var(--ink)]",
									children: row.event
								}),
								row.exceptionClass && /* @__PURE__ */ jsx("span", {
									className: "rounded-full border border-[#dce4f0] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.1em] text-[#53657d] uppercase",
									children: row.exceptionClass
								}),
								row.resolvedAt && /* @__PURE__ */ jsx("span", {
									className: "rounded-full bg-[#e6f6fb] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.1em] text-[#1c7ba0] uppercase",
									children: "Resolved"
								})
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11px] text-[#55667d]",
							children: row.message
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-[10px] text-[#8a98aa]",
							children: [formatTimestamp$1(row.date), row.file && ` · ${row.file}${row.line ? `:${row.line}` : ""}`]
						}),
						hasDetails && /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setExpanded((value) => !value),
							className: "mt-1.5 text-[10.5px] font-semibold text-[#718197] underline decoration-dotted",
							children: expanded ? "Hide details" : "Show details"
						}),
						expanded && row.context && Object.keys(row.context).length > 0 && /* @__PURE__ */ jsx("pre", {
							className: "mt-2 max-h-64 overflow-auto rounded-lg bg-[#f6f9ff] p-3 text-[10px] text-[#40506a]",
							children: JSON.stringify(row.context, null, 2)
						})
					]
				}),
				!row.resolvedAt && /* @__PURE__ */ jsx("button", {
					type: "button",
					disabled: resolveForm.processing,
					onClick: resolve,
					className: "h-7 shrink-0 self-start rounded-lg border border-[#dce4f0] bg-white px-2.5 text-[10px] font-semibold text-[var(--ink)] transition hover:border-[#49d4ef] disabled:opacity-50",
					children: "Mark resolved"
				})
			]
		})
	});
}
function CriticalErrors({ rows = [], filters = {}, events = [], pagination = {} }) {
	const current = {
		status: filters.status ?? "unresolved",
		event: filters.event ?? "all"
	};
	const update = (changes) => router.get("/x/admin/critical-errors", {
		...current,
		...changes,
		page: 1
	}, {
		preserveScroll: true,
		replace: true
	});
	const goToPage = (page) => router.get("/x/admin/critical-errors", {
		...current,
		page
	}, { preserveScroll: true });
	return /* @__PURE__ */ jsx(AdminLayout, {
		title: "Critical Errors",
		section: "critical-errors",
		children: /* @__PURE__ */ jsxs("section", {
			className: "rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f6f9ff_100%)] p-4 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] sm:p-5",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-start justify-between gap-4",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-[10px] font-semibold tracking-[.22em] text-[var(--warn)] uppercase",
							children: "Critical errors"
						}),
						/* @__PURE__ */ jsx("h2", {
							className: "mt-1 text-[22px] font-bold tracking-[-.03em] text-[var(--ink)]",
							children: "Critical error log"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11px] text-[#718197]",
							children: "Third-party connection failures, usage-limit exhaustion, and core-feature exceptions worth reviewing."
						})
					] }), /* @__PURE__ */ jsx("div", {
						className: "flex rounded-xl border border-[#dce4f0] bg-white p-1",
						children: STATUSES.map(([status, label]) => /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => update({ status }),
							className: `rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${current.status === status ? "bg-[var(--warn)] text-white" : "text-[#718197] hover:bg-[#f6f9ff]"}`,
							children: label
						}, status))
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ jsx("label", {
						className: "sr-only",
						htmlFor: "critical-error-event",
						children: "Event"
					}), /* @__PURE__ */ jsxs("select", {
						id: "critical-error-event",
						value: current.event,
						onChange: (event) => update({ event: event.target.value }),
						className: "h-9 min-w-[190px] rounded-lg border border-[#dce4f0] bg-white px-3 text-[11px] font-medium text-[var(--ink)] outline-none focus:border-[#49d4ef]",
						children: [/* @__PURE__ */ jsx("option", {
							value: "all",
							children: "All event keys"
						}), events.map((event) => /* @__PURE__ */ jsx("option", {
							value: event,
							children: event
						}, event))]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-4 overflow-hidden rounded-xl border border-[#dce4f0] bg-white",
					children: rows.length === 0 ? /* @__PURE__ */ jsx("p", {
						className: "px-4 py-10 text-center text-[12px] text-[#718197]",
						children: "No errors match these filters."
					}) : rows.map((row) => /* @__PURE__ */ jsx(ErrorRow, { row }, row.id))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-4 flex flex-col gap-2 text-[11px] text-[#718197] sm:flex-row sm:items-center sm:justify-between sm:gap-3",
					children: [/* @__PURE__ */ jsxs("span", { children: [pagination.total ?? 0, " errors"] }), /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: (pagination.currentPage ?? 1) <= 1,
								onClick: () => goToPage(pagination.currentPage - 1),
								className: "rounded-lg border border-[#dce4f0] bg-white px-3 py-1.5 font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45",
								children: "Previous"
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "px-1 py-1.5",
								children: [
									"Page ",
									pagination.currentPage ?? 1,
									" of ",
									pagination.lastPage ?? 1
								]
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								disabled: (pagination.currentPage ?? 1) >= (pagination.lastPage ?? 1),
								onClick: () => goToPage(pagination.currentPage + 1),
								className: "rounded-lg border border-[#dce4f0] bg-white px-3 py-1.5 font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-45",
								children: "Next"
							})
						]
					})]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/components/admin/AdminTrendChart.jsx
var SERIES = [
	{
		key: "signups",
		label: "Sign ups",
		color: "#ff2d78"
	},
	{
		key: "trialing",
		label: "Trialing",
		color: "#ffae19"
	},
	{
		key: "paid",
		label: "Active paid",
		color: "#7486ff"
	}
];
var WIDTH = 960;
var HEIGHT = 250;
var PAD = {
	top: 14,
	right: 12,
	bottom: 28,
	left: 32
};
function niceMax(value) {
	if (value <= 4) return 4;
	const magnitude = 10 ** Math.floor(Math.log10(value));
	return Math.ceil(value / magnitude) * magnitude;
}
function smoothPath$1(coords, baseline) {
	if (coords.length < 3) return coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ");
	let path = `M${coords[0][0]},${coords[0][1]}`;
	for (let index = 0; index < coords.length - 1; index += 1) {
		const p0 = coords[index - 1] ?? coords[index];
		const p1 = coords[index];
		const p2 = coords[index + 1];
		const p3 = coords[index + 2] ?? p2;
		const c1x = p1[0] + (p2[0] - p0[0]) / 6;
		const c2x = p2[0] - (p3[0] - p1[0]) / 6;
		const c1y = Math.min(baseline, p1[1] + (p2[1] - p0[1]) / 6);
		const c2y = Math.min(baseline, p2[1] - (p3[1] - p1[1]) / 6);
		path += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
	}
	return path;
}
function AdminTrendChart({ points = [] }) {
	const [hidden, setHidden] = useState({});
	const [hoverIndex, setHoverIndex] = useState(null);
	const visible = SERIES.filter((series) => !hidden[series.key]);
	const { max, xFor, yFor, plotWidth, baseline } = useMemo(() => {
		const ceiling = niceMax(points.reduce((peak, point) => visible.reduce((value, series) => Math.max(value, point[series.key] ?? 0), peak), 0));
		const innerWidth = WIDTH - PAD.left - PAD.right;
		const innerHeight = HEIGHT - PAD.top - PAD.bottom;
		return {
			max: ceiling,
			plotWidth: innerWidth,
			baseline: PAD.top + innerHeight,
			xFor: (index) => PAD.left + index * (points.length > 1 ? innerWidth / (points.length - 1) : 0),
			yFor: (value) => PAD.top + innerHeight - value / ceiling * innerHeight
		};
	}, [points, visible]);
	if (points.length === 0) return /* @__PURE__ */ jsx("p", {
		className: "px-4 py-16 text-center text-[13px] text-[var(--faint)]",
		children: "No snapshots captured yet."
	});
	const active = hoverIndex === null ? null : points[hoverIndex];
	const labelEvery = Math.max(1, Math.ceil(points.length / 14));
	const tooltipLeft = hoverIndex === null ? 0 : Math.min(86, Math.max(2, xFor(hoverIndex) / WIDTH * 100));
	const updateHover = (event) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		const ratio = (event.clientX - bounds.left) / bounds.width * WIDTH;
		const index = Math.round((ratio - PAD.left) / plotWidth * (points.length - 1));
		setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "relative",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mb-3 flex flex-wrap gap-2",
				children: SERIES.map((series) => {
					const off = hidden[series.key];
					return /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => setHidden((current) => ({
							...current,
							[series.key]: !current[series.key]
						})),
						className: "rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[.11em] uppercase transition",
						style: {
							borderColor: off ? "#dce4f0" : `${series.color}99`,
							color: off ? "#95a2b3" : series.color,
							backgroundColor: off ? "#fff" : `${series.color}12`
						},
						children: series.label
					}, series.key);
				})
			}),
			active && /* @__PURE__ */ jsxs("div", {
				className: "pointer-events-none absolute z-10 w-28 rounded-xl bg-[#101a31] px-3 py-2.5 text-[10px] shadow-[0_14px_30px_rgba(16,26,49,.28)]",
				style: {
					left: `${tooltipLeft}%`,
					top: 50
				},
				children: [/* @__PURE__ */ jsx("strong", {
					className: "block text-[11px] text-white",
					children: active.label
				}), visible.map((series) => /* @__PURE__ */ jsxs("span", {
					className: "mt-1 block",
					style: { color: series.color },
					children: [
						series.label,
						": ",
						active[series.key] ?? 0
					]
				}, series.key))]
			}),
			/* @__PURE__ */ jsxs("svg", {
				viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
				className: "h-[250px] w-full",
				onMouseLeave: () => setHoverIndex(null),
				onMouseMove: updateHover,
				children: [
					[
						0,
						.25,
						.5,
						.75,
						1
					].map((ratio) => {
						const y = PAD.top + (HEIGHT - PAD.top - PAD.bottom) * ratio;
						return /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
							x1: PAD.left,
							x2: WIDTH - PAD.right,
							y1: y,
							y2: y,
							stroke: "#edf1f6"
						}), /* @__PURE__ */ jsx("text", {
							x: 2,
							y: y + 3,
							fill: "#8b98aa",
							fontSize: "9",
							children: Math.round(max * (1 - ratio))
						})] }, ratio);
					}),
					visible.map((series) => {
						const coords = points.map((point, index) => [xFor(index), yFor(point[series.key] ?? 0)]);
						return /* @__PURE__ */ jsx("path", {
							d: smoothPath$1(coords, baseline),
							fill: "none",
							stroke: series.color,
							strokeWidth: "1.8",
							strokeLinecap: "round"
						}, series.key);
					}),
					hoverIndex !== null && /* @__PURE__ */ jsxs("g", { children: [/* @__PURE__ */ jsx("line", {
						x1: xFor(hoverIndex),
						x2: xFor(hoverIndex),
						y1: PAD.top,
						y2: baseline,
						stroke: "#cbd5e1",
						strokeDasharray: "3 3"
					}), visible.map((series) => /* @__PURE__ */ jsx("circle", {
						cx: xFor(hoverIndex),
						cy: yFor(points[hoverIndex][series.key] ?? 0),
						r: "3.4",
						fill: "#fff",
						stroke: series.color,
						strokeWidth: "2"
					}, series.key))] }),
					points.map((point, index) => index % labelEvery === 0 ? /* @__PURE__ */ jsx("text", {
						x: xFor(index),
						y: 243,
						fill: "#8b98aa",
						fontSize: "9",
						textAnchor: "middle",
						children: point.label
					}, point.date) : null)
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Admin/components/AcquisitionTable.jsx
var AcquisitionTable_exports = /* @__PURE__ */ __exportAll({ default: () => AcquisitionTable });
var METRICS = [
	["signups", "Signups"],
	["completed", "First search completed"],
	["trials", "Trial starts"],
	["paid", "First paid conversion"]
];
var PAGE_SIZE$1 = 15;
var sourceLabel = (row) => row.medium === "Medium not recorded" ? row.source : `${row.source} / ${row.medium}`;
var attributionLabel = (row) => row.campaign === "No campaign recorded" ? sourceLabel(row) : `${sourceLabel(row)} · Campaign: ${row.campaign}`;
function AcquisitionTable({ acquisition = {} }) {
	const cohort = acquisition.cohort ?? {
		groups: [],
		rows: [],
		totals: {}
	};
	const [sort, setSort] = useState({
		key: "signups",
		descending: true
	});
	const [expanded, setExpanded] = useState({});
	const [selection, setSelection] = useState(null);
	const [page, setPage] = useState(1);
	const sorted = (rows) => [...rows].sort((a, b) => {
		return (sort.key === "source" ? `${a.source ?? a.campaign} / ${a.medium ?? ""}`.localeCompare(`${b.source ?? b.campaign} / ${b.medium ?? ""}`) : a[sort.key] - b[sort.key]) * (sort.descending ? -1 : 1);
	});
	const select = (metric, group = null, campaign = null) => {
		setSelection({
			metric,
			group,
			campaign
		});
		setPage(1);
	};
	const matches = selection ? cohort.rows.filter((row) => row[selection.metric] && (!selection.group || row.source === selection.group.source && row.medium === selection.group.medium) && (selection.campaign === null || row.campaign === selection.campaign)) : [];
	const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE$1));
	const currentPage = Math.min(page, pages);
	const cells = (row, group, campaign = null) => /* @__PURE__ */ jsxs(Fragment$1, { children: [METRICS.map(([key, label]) => /* @__PURE__ */ jsx("td", {
		className: "px-3 py-3 text-right",
		children: /* @__PURE__ */ jsx("button", {
			className: "rounded px-2 py-1 text-sky-800 underline decoration-sky-200 hover:bg-sky-50 focus-visible:outline-2",
			onClick: () => select(key, group, campaign),
			"aria-label": `${label}: ${row[key]} for ${campaign ?? sourceLabel(group)}`,
			children: row[key].toLocaleString()
		})
	}, key)), /* @__PURE__ */ jsxs("td", {
		className: "px-3 py-3 text-right",
		children: [row.rate, "%"]
	})] });
	return /* @__PURE__ */ jsxs("section", {
		className: "min-w-0 rounded-2xl border border-[#dce4f0] bg-white p-4 sm:p-5",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs font-semibold uppercase tracking-widest text-sky-700",
					children: "Acquisition"
				}), /* @__PURE__ */ jsx("h3", {
					className: "mt-1 text-lg font-semibold",
					children: "Where they come from"
				})] }), /* @__PURE__ */ jsxs("span", {
					className: "text-xs text-slate-500",
					children: ["Signed up ", acquisition.rangeLabel]
				})]
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "mt-2 text-sm text-slate-600",
				children: [
					"People who signed up in this range, followed through their outcomes as of ",
					cohort.asOf ? new Date(cohort.asOf).toLocaleString(void 0, { timeZone: "UTC" }) : "today",
					" UTC. Recent signups have had less time to convert."
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: METRICS.map(([key, label]) => /* @__PURE__ */ jsxs("button", {
					onClick: () => select(key),
					className: "rounded-xl border border-slate-200 p-3 text-left hover:bg-sky-50",
					children: [/* @__PURE__ */ jsx("span", {
						className: "block text-xs text-slate-600",
						children: label
					}), /* @__PURE__ */ jsx("strong", {
						className: "mt-1 block text-2xl",
						children: (cohort.totals[key] ?? 0).toLocaleString()
					})]
				}, key))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 min-w-0 overflow-x-auto",
				children: [/* @__PURE__ */ jsxs("table", {
					className: "w-full min-w-[520px] text-sm",
					children: [
						/* @__PURE__ */ jsx("caption", {
							className: "sr-only",
							children: "Acquisition by source and medium. Expand a source to compare campaigns; select a count to see users."
						}),
						/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", {
							className: "border-b border-slate-200 text-left text-xs text-slate-600",
							children: [
								["source", "Source / medium"],
								...METRICS,
								["rate", "Signup → paid"]
							].map(([key, label]) => /* @__PURE__ */ jsx("th", {
								className: `px-3 py-3 ${key === "source" ? "" : "text-right"}`,
								"aria-sort": sort.key === key ? sort.descending ? "descending" : "ascending" : "none",
								children: /* @__PURE__ */ jsxs("button", {
									onClick: () => setSort({
										key,
										descending: sort.key === key ? !sort.descending : key !== "source"
									}),
									children: [
										label,
										" ",
										sort.key === key ? sort.descending ? "↓" : "↑" : ""
									]
								})
							}, key))
						}) }),
						/* @__PURE__ */ jsx("tbody", { children: sorted(cohort.groups).map((group) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("tr", {
							className: "border-b border-slate-100",
							children: [/* @__PURE__ */ jsx("th", {
								className: "px-3 py-3 text-left font-medium",
								children: /* @__PURE__ */ jsxs("button", {
									className: "text-left",
									"aria-expanded": Boolean(expanded[group.key]),
									onClick: () => setExpanded({
										...expanded,
										[group.key]: !expanded[group.key]
									}),
									children: [
										expanded[group.key] ? "▾" : "▸",
										" ",
										group.source,
										" ",
										group.medium !== "Medium not recorded" && /* @__PURE__ */ jsxs("span", {
											className: "font-normal text-slate-500",
											children: ["/ ", group.medium]
										})
									]
								})
							}), cells(group, group)]
						}), expanded[group.key] && sorted(group.campaigns).map((campaign) => /* @__PURE__ */ jsxs("tr", {
							className: "border-b border-slate-100 bg-slate-50",
							children: [/* @__PURE__ */ jsxs("th", {
								className: "py-3 pl-8 pr-3 text-left font-normal",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs text-slate-500",
									children: "Campaign: "
								}), campaign.campaign]
							}), cells(campaign, group, campaign.campaign)]
						}, campaign.campaign))] }, group.key)) })
					]
				}), cohort.groups.length === 0 && /* @__PURE__ */ jsx("p", {
					className: "py-8 text-center text-sm text-slate-500",
					children: "No signups in this range."
				})]
			}),
			/* @__PURE__ */ jsxs("details", {
				className: "mt-3 text-xs text-slate-500",
				children: [
					/* @__PURE__ */ jsx("summary", {
						className: "cursor-pointer",
						children: "How these numbers are counted"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2",
						children: "Each person counts once per outcome, using their earliest recorded signup attribution. Subscription attribution copies are excluded. Trials stay counted after cancellation or conversion. Completed searches include archived searches."
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2",
						children: "Paid conversions use recorded paid subscription events or current paid status. Older customers who canceled before activity recording began may be missing. Trial completion alone does not prove payment."
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2",
						children: "Source not recorded means we did not capture where this person came from; it does not necessarily mean they visited directly. Missing medium and campaign values are hidden from user rows. No campaign recorded groups signups without a campaign tag. Paid and organic traffic are not inferred from the source alone. Program membership is separate from acquisition source."
					})
				]
			}),
			selection && /* @__PURE__ */ jsxs("div", {
				className: "mt-5 rounded-xl border border-slate-200 p-3",
				"aria-label": "Matching users",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ jsxs("h4", {
							className: "font-semibold",
							children: [
								METRICS.find(([key]) => key === selection.metric)?.[1],
								" · ",
								selection.group ? sourceLabel(selection.group) : "All sources",
								selection.campaign !== null ? ` · ${selection.campaign}` : "",
								" (",
								matches.length,
								")"
							]
						}), /* @__PURE__ */ jsx("button", {
							onClick: () => setSelection(null),
							className: "text-sm text-slate-600 underline",
							children: "Close"
						})]
					}),
					/* @__PURE__ */ jsx("ul", {
						className: "mt-2 divide-y divide-slate-100",
						children: matches.slice((currentPage - 1) * PAGE_SIZE$1, currentPage * PAGE_SIZE$1).map((user) => /* @__PURE__ */ jsxs("li", {
							className: "flex flex-wrap justify-between gap-2 py-3 text-sm",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "font-medium",
								children: user.name || "Unnamed user"
							}), /* @__PURE__ */ jsx("p", {
								className: "break-all text-slate-500",
								children: user.email
							})] }), /* @__PURE__ */ jsxs("div", {
								className: "text-xs text-slate-500",
								children: [/* @__PURE__ */ jsx("p", { children: attributionLabel(user) }), /* @__PURE__ */ jsxs("p", { children: [
									"Signed up ",
									user.signup_at.slice(0, 10),
									user.program ? " · Coupon program member" : ""
								] })]
							})]
						}, user.id))
					}),
					matches.length === 0 && /* @__PURE__ */ jsx("p", {
						className: "py-4 text-sm text-slate-500",
						children: "No matching users."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-2 flex items-center justify-between text-sm",
						children: [
							/* @__PURE__ */ jsx("button", {
								disabled: currentPage === 1,
								onClick: () => setPage(currentPage - 1),
								className: "rounded border px-3 py-1 disabled:opacity-40",
								children: "Previous"
							}),
							/* @__PURE__ */ jsxs("span", { children: [
								"Page ",
								currentPage,
								" of ",
								pages
							] }),
							/* @__PURE__ */ jsx("button", {
								disabled: currentPage === pages,
								onClick: () => setPage(currentPage + 1),
								className: "rounded border px-3 py-1 disabled:opacity-40",
								children: "Next"
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Admin/Dashboard.jsx
var Dashboard_exports = /* @__PURE__ */ __exportAll({ default: () => Dashboard });
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
var FUNNEL_TONES = {
	teal: "bg-[#20cfc2]",
	amber: "bg-[#ffae19]",
	blue: "bg-[#7f80ff]",
	rose: "bg-[#fb5c6a]"
};
function ConversionFunnel({ funnel = {} }) {
	const steps = funnel.steps ?? [];
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f6f9ff_100%)] p-4 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] sm:p-5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-[10px] font-semibold tracking-[.22em] text-[#188fb7] uppercase",
				children: "Funnel"
			}), /* @__PURE__ */ jsx("h3", {
				className: "mt-1 text-[17px] font-semibold text-[var(--ink)]",
				children: "Conversion funnel"
			})] }), /* @__PURE__ */ jsx("span", {
				className: "text-[10px] font-medium text-[#718197]",
				children: "Same selected range"
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-5 space-y-3",
			children: steps.map((step) => /* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-[58px_1fr_78px] items-center gap-2 sm:grid-cols-[54px_1fr_112px] sm:gap-3",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[10.5px] leading-tight font-medium text-[#55667d]",
						children: step.label
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ jsx("strong", {
							className: "w-7 text-[12px] text-[var(--ink)]",
							children: step.value.toLocaleString()
						}), /* @__PURE__ */ jsx("div", {
							className: "h-3 flex-1 overflow-hidden rounded-full bg-[#edf1f6]",
							children: /* @__PURE__ */ jsx("span", {
								className: `block h-full rounded-full ${FUNNEL_TONES[step.tone] ?? FUNNEL_TONES.teal}`,
								style: { width: `${step.percentage}%` }
							})
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-right text-[10px] text-[#718197]",
						children: step.key === "signups" ? step.caption : `${step.percentage.toFixed(1)}% ${step.caption}`
					})
				]
			}, step.key))
		})]
	});
}
function EngagementInsights({ engagement = {} }) {
	const adoption = engagement.adoption ?? [];
	const frequency = engagement.frequency ?? [];
	const trends = engagement.trends ?? [];
	const suggestions = engagement.suggestions ?? [];
	return /* @__PURE__ */ jsxs("section", {
		className: "overflow-hidden rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f5f8ff_55%,_#f2fffb_100%)] p-3.5 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] min-[390px]:p-4 sm:p-5",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold tracking-[.16em] text-[#119d90] uppercase sm:tracking-[.22em]",
					children: "Insights"
				}), /* @__PURE__ */ jsx("h3", {
					className: "mt-1 text-[18px] leading-tight font-semibold text-[var(--ink)] sm:text-[17px]",
					children: "Engagement insights"
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "text-right",
					children: [/* @__PURE__ */ jsx("strong", {
						className: "block text-[25px] leading-none tracking-[-.04em] text-[var(--ink)]",
						children: (engagement.activeCreators ?? 0).toLocaleString()
					}), /* @__PURE__ */ jsx("span", {
						className: "mt-1 block text-[9px] font-semibold tracking-[.11em] text-[#718197] uppercase sm:tracking-[.15em]",
						children: "Active creators"
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "mt-3 text-[12px] leading-relaxed text-[#55667d] sm:text-[11px]",
				children: [
					"Based on tracked activity in ",
					engagement.rangeLabel?.toLowerCase() ?? "the selected range",
					"."
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 grid gap-5 lg:grid-cols-2 lg:gap-8",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold tracking-[.14em] text-[#7b8ba0] uppercase sm:tracking-[.2em]",
					children: "How far active creators get"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-3 space-y-3.5",
					children: adoption.map((row) => /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
						className: "mb-1.5 flex items-baseline justify-between gap-2 text-[11.5px] text-[#55667d] sm:text-[10.5px]",
						children: [/* @__PURE__ */ jsx("span", {
							className: "min-w-0",
							children: row.label
						}), /* @__PURE__ */ jsxs("span", {
							className: "shrink-0 font-semibold text-[var(--ink)]",
							children: [
								row.percentage,
								"% ",
								/* @__PURE__ */ jsxs("span", {
									className: "font-normal text-[#718197]",
									children: [
										"(",
										row.users,
										")"
									]
								})
							]
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "h-2.5 overflow-hidden rounded-full bg-[#e8edf5] sm:h-2",
						children: /* @__PURE__ */ jsx("span", {
							className: `block h-full rounded-full ${row.tone === "rose" ? "bg-[#fb3f82]" : row.tone === "teal" ? "bg-[#20cfc2]" : "bg-[#8986fb]"}`,
							style: { width: `${row.percentage}%` }
						})
					})] }) }, row.label))
				})] }), /* @__PURE__ */ jsxs("div", {
					className: "space-y-5",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-semibold tracking-[.14em] text-[#7b8ba0] uppercase sm:tracking-[.2em]",
						children: "Usage frequency"
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-3 divide-y divide-[#e8edf5] overflow-hidden rounded-xl border border-[#e8edf5] bg-white/70",
						children: frequency.map((row) => /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between gap-3 px-3 py-2.5 text-[11.5px] sm:text-[10.5px]",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-semibold text-[var(--ink)]",
								children: row.label
							}), /* @__PURE__ */ jsxs("span", {
								className: "shrink-0 text-[#718197]",
								children: [
									/* @__PURE__ */ jsx("strong", {
										className: "font-semibold text-[#55667d]",
										children: row.average
									}),
									" per adopter ",
									/* @__PURE__ */ jsxs("span", {
										className: "hidden min-[390px]:inline",
										children: [
											"(",
											row.adopters,
											")"
										]
									})
								]
							})]
						}, row.label))
					})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-semibold tracking-[.14em] text-[#7b8ba0] uppercase sm:tracking-[.2em]",
						children: "Trends vs previous range"
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-2 divide-y divide-[#e8edf5] border-y border-[#e8edf5]",
						children: trends.map((row) => {
							const rising = row.change !== null && row.change >= 0;
							return /* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-3 py-2.5",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[11.5px] text-[#55667d] sm:text-[10.5px]",
									children: row.label
								}), /* @__PURE__ */ jsxs("span", {
									className: "shrink-0 text-right text-[11px] text-[#718197]",
									children: [/* @__PURE__ */ jsx("strong", {
										className: "mr-1 text-[14px] text-[var(--ink)]",
										children: row.current.toLocaleString()
									}), row.change === null ? "No prior data" : /* @__PURE__ */ jsxs("span", {
										className: rising ? "text-[#159b67]" : "text-[#e94770]",
										children: [
											rising ? "↑" : "↓",
											" ",
											Math.abs(row.change),
											"%"
										]
									})]
								})]
							}, row.label);
						})
					})] })]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 border-t border-[#dce4f0] pt-4",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold tracking-[.14em] text-[#7b8ba0] uppercase sm:tracking-[.2em]",
					children: "Suggested actions"
				}), /* @__PURE__ */ jsx("div", {
					className: "mt-2.5 space-y-2",
					children: suggestions.map((suggestion) => /* @__PURE__ */ jsxs("p", {
						className: "flex gap-2 text-[11.5px] leading-relaxed text-[#55667d] sm:text-[10.5px]",
						children: [/* @__PURE__ */ jsx("span", { className: "mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#fb3f82]" }), suggestion]
					}, suggestion))
				})]
			})
		]
	});
}
var ACTIVITY_TONES = {
	sign_up: "#20cfc2",
	subscription: "#ee4393",
	engagement: "#7b5cff",
	analysis: "#25a6d9",
	coupon_usage: "#f6a819"
};
var ACTIVITY_FILTERS = [
	["all", "All"],
	["sign_up", "Sign up"],
	["subscription", "Subscription"],
	["engagement", "Engagement"],
	["analysis", "Analysis"],
	["coupon_usage", "Coupon"]
];
function RecentActivity({ activity = {} }) {
	const [filter, setFilter] = useState("all");
	const rows = filter === "all" ? activity.rows ?? [] : activity.byCategory?.[filter] ?? (activity.rows ?? []).filter((row) => row.category === filter);
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-2xl border border-[#dce4f0] bg-[linear-gradient(135deg,_#ffffff_0%,_#f6f9ff_100%)] p-4 shadow-[0_18px_42px_-32px_rgba(50,85,150,.45)] sm:p-5",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold tracking-[.22em] text-[#ed3d8d] uppercase",
					children: "Activity"
				}), /* @__PURE__ */ jsx("h3", {
					className: "mt-1 text-[17px] font-semibold text-[var(--ink)]",
					children: "Recent activity"
				})] }), /* @__PURE__ */ jsx(Link, {
					href: "/x/admin/activity",
					className: "text-[11px] font-semibold text-[#ed3d8d] transition hover:text-[#b82367]",
					children: "Show All ->"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 flex flex-wrap gap-1.5",
				children: ACTIVITY_FILTERS.map(([key, label]) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setFilter(key),
					className: `rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${filter === key ? "border-[#ed3d8d] bg-[#fbe1ef] text-[#b82367]" : "border-[#dce4f0] bg-white text-[#718197]"}`,
					children: label
				}, key))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 rounded-xl border border-[#dce4f0] bg-white",
				children: rows.length === 0 ? /* @__PURE__ */ jsx("p", {
					className: "px-4 py-8 text-center text-[12px] text-[#718197]",
					children: "No recent activity matches this filter."
				}) : rows.map((row) => /* @__PURE__ */ jsxs("div", {
					className: "flex gap-2.5 border-b border-[#e8edf5] px-3 py-2.5 last:border-b-0",
					children: [/* @__PURE__ */ jsx("span", {
						className: "mt-1.5 h-2 w-2 shrink-0 rounded-full",
						style: { backgroundColor: ACTIVITY_TONES[row.category] ?? "#718197" }
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex flex-wrap items-center gap-1.5",
							children: [
								/* @__PURE__ */ jsx("strong", {
									className: "text-[12px] text-[var(--ink)]",
									children: row.name
								}),
								/* @__PURE__ */ jsx("span", {
									className: "rounded-full border border-[#dce4f0] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.1em] text-[#53657d] uppercase",
									children: row.category.replace("_", " ")
								}),
								/* @__PURE__ */ jsx("span", {
									className: "rounded-full bg-[#f1f4f8] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.08em] text-[#718197] uppercase",
									children: row.date ? formatDay(row.date.slice(0, 10)) : "-"
								})
							]
						}), /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[10.5px] text-[#718197]",
							children: row.summary
						})]
					})]
				}, row.id))
			})
		]
	});
}
function CriticalErrorsPanel({ criticalErrors = {} }) {
	const rows = criticalErrors.rows ?? [];
	const unresolvedCount = criticalErrors.unresolvedCount ?? 0;
	if (unresolvedCount === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-2xl border border-[rgba(154,52,18,.25)] bg-[var(--warn-bg)] p-4 shadow-[0_18px_42px_-32px_rgba(154,52,18,.35)] sm:p-5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "text-[10px] font-semibold tracking-[.22em] text-[var(--warn)] uppercase",
				children: "Needs attention"
			}), /* @__PURE__ */ jsxs("h3", {
				className: "mt-1 text-[17px] font-semibold text-[var(--ink)]",
				children: [
					unresolvedCount,
					" unresolved critical error",
					unresolvedCount === 1 ? "" : "s"
				]
			})] }), /* @__PURE__ */ jsx(Link, {
				href: "/x/admin/critical-errors",
				className: "text-[11px] font-semibold text-[var(--warn)] transition hover:opacity-80",
				children: "Show All ->"
			})]
		}), /* @__PURE__ */ jsx("div", {
			className: "mt-4 rounded-xl border border-[rgba(154,52,18,.2)] bg-white",
			children: rows.map((row) => /* @__PURE__ */ jsxs("div", {
				className: "flex gap-2.5 border-b border-[#e8edf5] px-3 py-2.5 last:border-b-0",
				children: [/* @__PURE__ */ jsx("span", { className: "mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--warn)]" }), /* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center gap-1.5",
						children: [/* @__PURE__ */ jsx("strong", {
							className: "text-[12px] text-[var(--ink)]",
							children: row.event
						}), /* @__PURE__ */ jsx("span", {
							className: "rounded-full bg-[#f1f4f8] px-1.5 py-0.5 text-[8px] font-semibold tracking-[.08em] text-[#718197] uppercase",
							children: row.date ? formatDay(row.date.slice(0, 10)) : "-"
						})]
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-1 truncate text-[10.5px] text-[#718197]",
						children: row.message
					})]
				})]
			}, row.id))
		})]
	});
}
function CouponProgramsPanel({ coupons = {} }) {
	const programs = coupons.programs ?? [];
	const alerts = coupons.alerts ?? [];
	const recent = coupons.recent ?? [];
	if (programs.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-2xl border border-[var(--line)] bg-white p-4 shadow-[0_1px_2px_rgba(20,15,0,.04),0_16px_32px_-26px_rgba(20,15,0,.18)] sm:p-5",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold tracking-[.22em] text-[var(--amber-ink)] uppercase",
					children: "Coupons"
				}), /* @__PURE__ */ jsx("h3", {
					className: "mt-1 text-[17px] font-semibold text-[var(--ink)]",
					children: "Program redemptions"
				})] })
			}),
			alerts.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "mt-3 flex flex-col gap-1.5",
				children: alerts.map((alert) => /* @__PURE__ */ jsxs("div", {
					className: `flex items-center gap-2 rounded-lg border px-3 py-2 text-[11.5px] font-medium ${alert.type === "full" ? "border-[rgba(154,52,18,.25)] bg-[var(--warn-bg)] text-[var(--warn)]" : "border-[var(--yellow)] bg-[var(--wash)] text-[var(--amber-ink)]"}`,
					children: [/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-current" }), alert.message]
				}, `${alert.program}-${alert.type}`))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: programs.map((program) => {
					const pct = program.max ? Math.min(100, Math.round(program.redeemed / program.max * 100)) : 0;
					return /* @__PURE__ */ jsxs("div", {
						className: "rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-3",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[12.5px] font-bold text-[var(--ink)]",
									children: program.code
								}), /* @__PURE__ */ jsx("span", {
									className: `text-[10px] font-semibold uppercase tracking-[.08em] ${program.active ? "text-[var(--ok)]" : "text-[var(--faint)]"}`,
									children: program.active ? "Active" : "Inactive"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "mt-2 flex items-baseline gap-1.5",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-[20px] font-bold tracking-[-.02em] text-[var(--ink)] [font-variant-numeric:tabular-nums]",
									children: program.redeemed
								}), /* @__PURE__ */ jsxs("span", {
									className: "text-[12px] text-[var(--faint)]",
									children: [
										"/ ",
										program.max ?? "∞",
										" redeemed"
									]
								})]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "mt-2 h-1.5 overflow-hidden rounded-full bg-[#edebe4]",
								children: /* @__PURE__ */ jsx("span", {
									className: `block h-full rounded-full ${program.full ? "bg-[var(--warn)]" : program.low ? "bg-[var(--yellow)]" : "bg-[var(--ok)]"}`,
									style: { width: `${pct}%` }
								})
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-1.5 text-[10.5px] text-[var(--faint)]",
								children: program.remaining === null ? "No cap" : `${program.remaining} slots left`
							})
						]
					}, program.code);
				})
			}),
			recent.length > 0 && /* @__PURE__ */ jsxs("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ jsx("p", {
					className: "mb-2 text-[11px] font-semibold tracking-[.08em] text-[var(--faint)] uppercase",
					children: "Recent redemptions"
				}), /* @__PURE__ */ jsx("div", {
					className: "rounded-xl border border-[var(--line)] bg-white",
					children: recent.map((row, i) => /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 border-b border-[var(--line)] px-3 py-2.5 last:border-b-0",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("p", {
									className: "truncate text-[12px] font-semibold text-[var(--ink)]",
									children: row.name
								}), /* @__PURE__ */ jsx("p", {
									className: "truncate text-[10.5px] text-[var(--faint)]",
									children: row.email
								})]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "shrink-0 rounded-full bg-[var(--wash)] px-2 py-0.5 text-[9px] font-semibold tracking-[.06em] text-[var(--amber-ink)] uppercase",
								children: row.program
							}),
							/* @__PURE__ */ jsx("span", {
								className: "shrink-0 text-[10.5px] text-[var(--faint)]",
								children: row.redeemedAt ? formatDay(row.redeemedAt.slice(0, 10)) : "-"
							})
						]
					}, i))
				})]
			})
		]
	});
}
function Dashboard({ trend = [], stats = [], snapshot = {}, range = "30D", ranges = [], acquisition = {}, activity = {}, engagement = {}, coupons = {}, criticalErrors = {} }) {
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
									/* @__PURE__ */ jsxs("span", {
										className: "hidden sm:inline",
										children: [
											" · ",
											snapshot.rangeStart,
											" to ",
											snapshot.rangeEnd
										]
									})
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
			/* @__PURE__ */ jsx("div", {
				className: "mt-3",
				children: /* @__PURE__ */ jsx(CriticalErrorsPanel, { criticalErrors })
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
				className: "mt-3 grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:gap-3 lg:grid-cols-5",
				children: stats.map((card) => /* @__PURE__ */ jsx(StatCard, { card }, card.key))
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3",
				children: /* @__PURE__ */ jsx(ConversionFunnel, { funnel: acquisition.funnel })
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3",
				children: /* @__PURE__ */ jsx(EngagementInsights, { engagement })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ jsx(RecentActivity, { activity }), /* @__PURE__ */ jsx(AcquisitionTable, { acquisition }, range)]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-3",
				children: /* @__PURE__ */ jsx(CouponProgramsPanel, { coupons })
			})
		]
	});
}
//#endregion
//#region resources/js/components/admin/AdminRowMenu.jsx
function AdminRowMenu({ resource, row, capabilities = {}, onEdit, onPreview, onImpersonate }) {
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
	const canImpersonate = capabilities.impersonate === true && !row.trashed;
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
	if (items.length === 0 && !canEdit && !canPreview && !canImpersonate) return null;
	return /* @__PURE__ */ jsxs("div", {
		ref: container,
		className: "relative flex flex-nowrap items-center justify-end gap-1",
		children: [
			canPreview && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => onPreview(row),
				className: "inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-md border border-[var(--line)] bg-white px-2 text-[11.5px] font-medium text-[var(--ink)] transition hover:border-[var(--yellow)] hover:bg-[var(--wash)]",
				children: "View"
			}),
			canEdit && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => onEdit(row),
				className: "inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-md border border-[var(--yellow)] bg-[var(--wash)] px-2 text-[11.5px] font-medium text-[var(--amber-ink)] transition hover:bg-[var(--yellow)] hover:text-[#1a1400]",
				children: "Edit"
			}),
			canImpersonate && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => {
					if (window.confirm(`Log in as ${row.email || row.user} for one hour?`)) onImpersonate(row);
				},
				className: "inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-md border border-[var(--line)] bg-white px-2 text-[11.5px] font-medium text-[var(--ink)] transition hover:border-[var(--yellow)] hover:bg-[var(--wash)]",
				children: "Log in as"
			}),
			items.length > 0 && /* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "More actions",
				onClick: () => setOpen((current) => !current),
				className: `inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${open ? "border-[var(--yellow)] bg-[var(--wash)] text-[var(--ink)]" : "border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-2)] hover:text-[var(--ink)]"}`,
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
function AdminDataTable({ columns = [], rows = [], resource, capabilities = {}, onEdit = () => {}, onPreview = () => {}, onImpersonate = () => {} }) {
	const hasActions = Boolean(capabilities.preview || capabilities.edit || capabilities.archive || capabilities.delete || capabilities.impersonate);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
		className: "hidden overflow-x-auto md:block",
		children: /* @__PURE__ */ jsxs("table", {
			className: "min-w-full border-separate border-spacing-0",
			children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [columns.map((column) => /* @__PURE__ */ jsx("th", {
				className: "sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-left text-[11px] font-semibold tracking-[.06em] whitespace-nowrap text-[var(--faint)] uppercase",
				children: column.label
			}, column.key)), hasActions && /* @__PURE__ */ jsx("th", {
				className: "sticky top-0 z-10 min-w-[190px] border-b border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-right text-[11px] font-semibold tracking-[.06em] whitespace-nowrap text-[var(--faint)] uppercase",
				children: "Actions"
			})] }) }), /* @__PURE__ */ jsx("tbody", { children: rows.map((row, rowIndex) => /* @__PURE__ */ jsxs("tr", {
				className: "group transition-colors hover:bg-[rgba(255,248,230,.65)]",
				children: [columns.map((column, columnIndex) => /* @__PURE__ */ jsx("td", {
					className: "max-w-[280px] truncate border-b border-[var(--line)] px-4 py-2.5 align-middle whitespace-nowrap",
					children: renderCell(column, row, columnIndex)
				}, column.key)), hasActions && /* @__PURE__ */ jsx("td", {
					className: "border-b border-[var(--line)] px-4 py-2.5 text-right whitespace-nowrap",
					children: /* @__PURE__ */ jsx(AdminRowMenu, {
						resource,
						row,
						capabilities,
						onEdit,
						onPreview,
						onImpersonate
					})
				})]
			}, row.id ?? rowIndex)) })]
		})
	}), /* @__PURE__ */ jsx("div", {
		className: "divide-y divide-[var(--line)] md:hidden",
		children: rows.map((row, rowIndex) => /* @__PURE__ */ jsxs("article", {
			className: "group grid gap-2 px-4 py-3",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "min-w-0",
					children: renderCell(columns[0], row, 0)
				}),
				columns.slice(1).map((column) => /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ jsx("span", {
						className: "shrink-0 text-[11px] text-[var(--faint)]",
						children: column.label
					}), /* @__PURE__ */ jsx("span", {
						className: "min-w-0 truncate text-right",
						children: renderCell(column, row, 1)
					})]
				}, column.key)),
				hasActions && /* @__PURE__ */ jsx("div", {
					className: "mt-1 flex flex-wrap justify-end gap-1.5 border-t border-[var(--line)] pt-2.5",
					children: /* @__PURE__ */ jsx(AdminRowMenu, {
						resource,
						row,
						capabilities,
						onEdit,
						onPreview,
						onImpersonate
					})
				})
			]
		}, row.id ?? rowIndex))
	})] });
}
//#endregion
//#region resources/js/components/admin/AdminEditDrawer.jsx
function AdminEditDrawer({ open, resource, title, fields = [], row, createValues = null, mode = "edit", onClose }) {
	const form = useForm({});
	useEffect(() => {
		if (!open) return;
		const initial = {};
		fields.forEach((field) => {
			const value = (mode === "create" ? createValues : row?.values)?.[field.name];
			initial[field.name] = field.type === "toggle" ? Boolean(value) : value ?? "";
		});
		form.setDefaults(initial);
		form.setData(initial);
	}, [
		open,
		row?.id,
		mode,
		createValues
	]);
	if (!open) return null;
	const submit = (event) => {
		event.preventDefault();
		form.transform((data) => ({
			...data,
			...Object.fromEntries(fields.filter((field) => field.type === "toggle").map((field) => [field.name, Boolean(data[field.name])]))
		}));
		const options = {
			preserveScroll: true,
			onSuccess: onClose
		};
		if (mode === "create") {
			form.post(`/x/admin/records/${resource}`, options);
			return;
		}
		form.patch(`/x/admin/records/${resource}/${row.id}`, options);
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 flex justify-end",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "Close",
			onClick: onClose,
			className: "absolute inset-0 bg-[rgba(11,11,11,.38)] backdrop-blur-[2px]"
		}), /* @__PURE__ */ jsxs("aside", {
			className: "relative flex h-full w-[min(420px,92vw)] max-w-[92vw] flex-col overflow-hidden border-l border-[var(--line)] bg-[var(--paper)] shadow-[0_0_60px_-10px_rgba(20,15,0,.24)]",
			children: [/* @__PURE__ */ jsxs("header", {
				className: "flex items-center justify-between border-b border-[var(--line)] px-4 py-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] font-semibold tracking-[.18em] text-[var(--faint)] uppercase",
						children: mode === "create" ? "Create" : "Edit"
					}), /* @__PURE__ */ jsx("h2", {
						className: "mt-0.5 truncate text-[14px] font-semibold text-[var(--ink)]",
						children: title
					})]
				}), /* @__PURE__ */ jsx("button", {
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
					children: fields.map((field) => /* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [field.type === "toggle" ? /* @__PURE__ */ jsxs("label", {
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
						}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
							/* @__PURE__ */ jsx("label", {
								className: "mb-1.5 block text-[11.5px] font-medium text-[var(--muted)]",
								children: field.label
							}),
							field.type === "select" ? /* @__PURE__ */ jsx("select", {
								value: form.data[field.name] ?? "",
								onChange: (event) => form.setData(field.name, event.target.value),
								className: "h-9 min-w-0 w-full max-w-full rounded-lg border border-[var(--line)] bg-white px-2.5 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--yellow)]",
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
								min: field.type === "number" ? field.min ?? 0 : void 0,
								value: form.data[field.name] ?? "",
								onChange: (event) => form.setData(field.name, event.target.value),
								className: "h-9 min-w-0 w-full max-w-full rounded-lg border border-[var(--line)] bg-white px-2.5 text-[13px] text-[var(--ink)] outline-none focus:border-[var(--yellow)]"
							}),
							field.help && /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-[11.5px] text-[var(--faint)]",
								children: field.help
							})
						] }), form.errors[field.name] && /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[11.5px] text-[var(--warn)]",
							children: form.errors[field.name]
						})]
					}, field.name))
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
						children: form.processing ? mode === "create" ? "Creating..." : "Saving..." : mode === "create" ? "Create" : "Save changes"
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
		if (filter.name === "date" && (filter.value ?? "") === "custom") {
			if ((filter.dateFrom ?? "") !== "") query.date_from = filter.dateFrom;
			if ((filter.dateTo ?? "") !== "") query.date_to = filter.dateTo;
		}
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
function CustomDateRange({ filter, onChange }) {
	const dateFrom = filter.dateFrom ?? "";
	const dateTo = filter.dateTo ?? "";
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap items-center gap-2 rounded-full border border-[var(--yellow)] bg-[var(--wash)] px-2.5 py-1.5",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--amber-ink)]",
				children: "Custom Range"
			}),
			/* @__PURE__ */ jsx("input", {
				type: "date",
				value: dateFrom,
				onChange: (event) => onChange({
					dateFrom: event.target.value,
					dateTo
				}),
				className: "h-7 rounded-md border border-[var(--line)] bg-white px-2 text-[12px] text-[var(--ink)] outline-none focus:border-[var(--yellow)]"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "text-[12px] text-[var(--faint)]",
				children: "to"
			}),
			/* @__PURE__ */ jsx("input", {
				type: "date",
				value: dateTo,
				onChange: (event) => onChange({
					dateFrom,
					dateTo: event.target.value
				}),
				className: "h-7 rounded-md border border-[var(--line)] bg-white px-2 text-[12px] text-[var(--ink)] outline-none focus:border-[var(--yellow)]"
			})
		]
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
	const activeCount = filters.filter((filter) => {
		if ((filter.value ?? "") === "") return false;
		if (filter.name !== "date" || filter.value !== "custom") return true;
		return (filter.dateFrom ?? "") !== "" || (filter.dateTo ?? "") !== "";
	}).length + (searchValue !== "" ? 1 : 0);
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
			children: [filters.map((filter) => /* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-1.5",
				children: [/* @__PURE__ */ jsx(FilterChip, {
					filter,
					onChange: (value) => submit(filters.map((item) => item.name === filter.name ? {
						...item,
						value,
						...value === "custom" ? {} : {
							dateFrom: "",
							dateTo: ""
						}
					} : item), searchValue)
				}), filter.name === "date" && (filter.value ?? "") === "custom" && /* @__PURE__ */ jsx(CustomDateRange, {
					filter,
					onChange: ({ dateFrom, dateTo }) => submit(filters.map((item) => item.name === filter.name ? {
						...item,
						dateFrom,
						dateTo
					} : item), searchValue)
				})]
			}, filter.name)), activeCount > 0 && /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => {
					dirty.current = false;
					setSearchValue("");
					submit(filters.map((filter) => ({
						...filter,
						value: "",
						dateFrom: "",
						dateTo: ""
					})), "");
				},
				className: "inline-flex h-7 items-center gap-1 rounded-full px-2 text-[12px] text-[var(--faint)] transition hover:bg-[var(--wash)] hover:text-[var(--ink)]",
				children: [/* @__PURE__ */ jsx(Close, { className: "h-3 w-3" }), "Clear all"]
			})]
		})]
	});
}
//#endregion
//#region resources/js/components/admin/AdminInsightsStrip.jsx
var TONE_STYLES = {
	warm: "border-[rgba(230,183,67,.28)] bg-[linear-gradient(135deg,rgba(255,248,225,.96),rgba(255,255,255,.98))] text-[#5e4710]",
	amber: "border-[rgba(214,153,46,.24)] bg-[linear-gradient(135deg,rgba(255,243,208,.95),rgba(255,255,255,.98))] text-[#6b4d00]",
	rose: "border-[rgba(204,121,121,.2)] bg-[linear-gradient(135deg,rgba(255,244,241,.96),rgba(255,255,255,.98))] text-[#7b4035]",
	slate: "border-[rgba(93,104,118,.16)] bg-[linear-gradient(135deg,rgba(247,248,250,.96),rgba(255,255,255,.98))] text-[#475467]"
};
function AdminInsightsStrip({ insights = [] }) {
	if (insights.length === 0) return null;
	return /* @__PURE__ */ jsx("section", {
		className: "mb-4 grid gap-3 lg:grid-cols-3",
		children: insights.map((insight) => /* @__PURE__ */ jsxs("article", {
			className: `rounded-xl border px-4 py-3 shadow-[0_1px_2px_rgba(20,15,0,.03),0_14px_34px_-30px_rgba(20,15,0,.18)] ${TONE_STYLES[insight.tone] ?? TONE_STYLES.slate}`,
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-[10px] font-semibold uppercase tracking-[.16em] opacity-80",
					children: "AI Insight"
				}),
				/* @__PURE__ */ jsx("h3", {
					className: "mt-1 text-[14px] font-semibold text-[var(--ink)]",
					children: insight.label
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1 text-[13px] leading-5",
					children: insight.body
				})
			]
		}, insight.label))
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
	const displayValue = value === null || value === void 0 || value === "" ? "-" : value;
	return /* @__PURE__ */ jsxs("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ jsx("p", {
			className: "mb-1.5 text-[11.5px] font-medium text-[var(--muted)]",
			children: label
		}), multiline ? /* @__PURE__ */ jsx("div", {
			className: "min-h-[120px] max-w-full break-words rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] leading-6 whitespace-pre-wrap [overflow-wrap:anywhere] text-[var(--body)]",
			children: displayValue
		}) : /* @__PURE__ */ jsx("div", {
			className: "max-w-full break-words rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[13px] [overflow-wrap:anywhere] text-[var(--body)]",
			children: displayValue
		})]
	});
}
function normalizeSections(preview) {
	return (preview.sections ?? []).map((section) => ({
		...section,
		fields: (section.fields ?? []).filter((field) => {
			const value = field?.value;
			return value !== null && value !== void 0 && String(value).trim() !== "";
		})
	})).filter((section) => section.fields.length > 0);
}
function AdminPreviewDrawer({ open, title, row, onClose }) {
	if (!open || !row) return null;
	const preview = row.preview ?? {};
	const sections = normalizeSections(preview);
	return /* @__PURE__ */ jsxs("div", {
		className: "fixed inset-0 z-50 flex justify-end",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			"aria-label": "Close",
			onClick: onClose,
			className: "absolute inset-0 bg-[rgba(11,11,11,.38)] backdrop-blur-[2px]"
		}), /* @__PURE__ */ jsxs("aside", {
			className: "relative flex h-full w-[min(460px,92vw)] max-w-[92vw] flex-col overflow-hidden border-l border-[var(--line)] bg-[var(--paper)] shadow-[0_0_60px_-10px_rgba(20,15,0,.24)]",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "flex items-center justify-between border-b border-[var(--line)] px-4 py-3",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "text-[10px] font-semibold tracking-[.18em] text-[var(--faint)] uppercase",
								children: preview.eyebrow ?? "Preview"
							}),
							/* @__PURE__ */ jsx("h2", {
								className: "mt-0.5 truncate text-[14px] font-semibold text-[var(--ink)]",
								children: title
							}),
							preview.summary && /* @__PURE__ */ jsx("p", {
								className: "mt-1 break-words text-[12px] [overflow-wrap:anywhere] text-[var(--muted)]",
								children: preview.summary
							})
						]
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onClose,
						className: "flex h-7 w-7 items-center justify-center rounded-md text-[var(--faint)] transition hover:bg-white hover:text-[var(--ink)]",
						children: /* @__PURE__ */ jsx(Close, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4",
					children: sections.length > 0 ? sections.map((section) => /* @__PURE__ */ jsxs("section", {
						className: "space-y-3 rounded-xl border border-[var(--line)] bg-white p-3",
						children: [section.title && /* @__PURE__ */ jsx("h3", {
							className: "text-[11px] font-semibold tracking-[.12em] text-[var(--faint)] uppercase",
							children: section.title
						}), /* @__PURE__ */ jsx("div", {
							className: "space-y-3",
							children: section.fields.map((field) => /* @__PURE__ */ jsx(PreviewField, {
								label: field.label,
								value: field.value,
								multiline: field.multiline === true
							}, `${section.title ?? "details"}-${field.label}`))
						})]
					}, section.title ?? "details")) : /* @__PURE__ */ jsx(PreviewField, {
						label: "Details",
						value: "No additional details available for this record yet.",
						multiline: true
					})
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
function Listing({ resource, title, search, searchPlaceholder, filters = [], columns = [], rows = [], capabilities = {}, editableFields = [], createValues = {}, emptyMessage, pagination, query, insights = [] }) {
	const [editing, setEditing] = useState(null);
	const [previewing, setPreviewing] = useState(null);
	const [creating, setCreating] = useState(false);
	const singularTitle = resource === "keyword-index" ? "Keyword" : title.endsWith("s") ? title.slice(0, -1) : title;
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
		actions: /* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			children: [
				resource === "plans" && /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setCreating(true),
					className: "inline-flex h-8 items-center rounded-md bg-[var(--yellow)] px-3.5 text-[12.5px] font-semibold text-[#1a1400] transition hover:brightness-105",
					children: "New plan"
				}),
				resource === "keyword-index" && /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setCreating(true),
					className: "inline-flex h-8 items-center rounded-md bg-[var(--yellow)] px-3.5 text-[12.5px] font-semibold text-[#1a1400] transition hover:brightness-105",
					children: "New keyword"
				}),
				resource === "coupon-whitelist" && /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setCreating(true),
					className: "inline-flex h-8 items-center rounded-md bg-[var(--yellow)] px-3.5 text-[12.5px] font-semibold text-[#1a1400] transition hover:brightness-105",
					children: "New entry"
				}),
				resource === "coupon-programs" && /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setCreating(true),
					className: "inline-flex h-8 items-center rounded-md bg-[var(--yellow)] px-3.5 text-[12.5px] font-semibold text-[#1a1400] transition hover:brightness-105",
					children: "New program"
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-white px-2 py-1 text-[11.5px] text-[var(--muted)]",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-semibold text-[var(--ink)]",
						children: total.toLocaleString()
					}), total === 1 ? "record" : "records"]
				})
			]
		}),
		children: [
			/* @__PURE__ */ jsx(AdminInsightsStrip, { insights }),
			/* @__PURE__ */ jsxs("section", {
				className: "overflow-visible rounded-xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(20,15,0,.04),0_16px_36px_-28px_rgba(20,15,0,.18)]",
				children: [rows.length > 0 ? /* @__PURE__ */ jsx(AdminDataTable, {
					columns,
					rows,
					resource,
					capabilities,
					onEdit: setEditing,
					onPreview: setPreviewing,
					onImpersonate: (row) => router.post(`/x/admin/users/${row.id}/impersonate`)
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
				mode: "edit",
				onClose: () => setEditing(null)
			}),
			/* @__PURE__ */ jsx(AdminEditDrawer, {
				open: creating,
				resource,
				title: `New ${singularTitle}`,
				fields: editableFields,
				createValues,
				mode: "create",
				onClose: () => setCreating(false)
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
function Login$1() {
	const form = useForm({
		email: "",
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
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Admin Login - Breakout Vault" }), /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-[var(--canvas)] px-4 py-8 text-[var(--ink)] sm:px-6",
		children: [
			/* @__PURE__ */ jsx("style", { children: `@keyframes admin-login-drift { 0%, 100% { transform: translate3d(-4%, -3%, 0) scale(1); } 50% { transform: translate3d(5%, 4%, 0) scale(1.08); } } @keyframes admin-login-grid { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(44px, 44px, 0); } }` }),
			/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				className: "pointer-events-none fixed inset-0 overflow-hidden",
				children: [
					/* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,198,41,.22),_transparent_28%),linear-gradient(180deg,_#faf9f6,_#f5f4f0)]" }),
					/* @__PURE__ */ jsx("div", { className: "absolute -top-28 -right-20 h-80 w-80 rounded-full bg-[rgba(255,198,41,.18)] blur-3xl [animation:admin-login-drift_15s_ease-in-out_infinite]" }),
					/* @__PURE__ */ jsx("div", { className: "absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[rgba(73,212,239,.13)] blur-3xl [animation:admin-login-drift_18s_ease-in-out_infinite_reverse]" }),
					/* @__PURE__ */ jsx("div", { className: "absolute inset-[-44px] opacity-45 [animation:admin-login-grid_24s_linear_infinite] [background-image:linear-gradient(to_right,rgba(92,90,84,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(92,90,84,.06)_1px,transparent_1px)] [background-size:44px_44px]" })
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center",
				children: /* @__PURE__ */ jsx("section", {
					className: "w-full max-w-[560px] rounded-[32px] bg-[rgba(250,249,246,.78)] p-2 shadow-[0_32px_120px_-52px_rgba(20,15,0,.28)] backdrop-blur-xl sm:p-3",
					children: /* @__PURE__ */ jsxs("section", {
						className: "rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_1px_2px_rgba(20,15,0,.04),0_20px_40px_-28px_rgba(20,15,0,.18)] sm:p-7",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--yellow)] shadow-[0_16px_40px_-20px_rgba(255,198,41,.85)]",
								children: /* @__PURE__ */ jsx(Logo, { className: "h-7 w-7 text-[#1a1400]" })
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
					})
				})
			})
		]
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
		remember: false
	});
	const submit = (event) => {
		event.preventDefault();
		form.post("/login");
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Sign in · Brand Beacon" }), /* @__PURE__ */ jsx("div", {
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
									children: [
										/* @__PURE__ */ jsxs("div", { children: [
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
										] }),
										/* @__PURE__ */ jsxs("div", { children: [
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
										] }),
										/* @__PURE__ */ jsxs("label", {
											style: {
												display: "inline-flex",
												alignItems: "center",
												gap: 9,
												cursor: "pointer",
												width: "fit-content"
											},
											children: [/* @__PURE__ */ jsx("input", {
												type: "checkbox",
												checked: form.data.remember,
												onChange: (e) => form.setData("remember", e.target.checked),
												style: {
													width: 16,
													height: 16,
													accentColor: "var(--yellow)"
												}
											}), /* @__PURE__ */ jsx("span", {
												style: {
													fontSize: ".83rem",
													fontWeight: 650,
													color: "var(--ink)"
												},
												children: "Remember me for 30 days"
											})]
										})
									]
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
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Create your account · Brand Beacon" }), /* @__PURE__ */ jsx("div", {
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
//#region resources/js/Pages/Blog/Index.jsx
var Index_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Index$1 });
function Index$1({ seo, jsonLd, search, selectedCategory, categories, featuredArticle, articles }) {
	const [query, setQuery] = useState(search);
	useEffect(() => setQuery(search), [search]);
	const categoryUrl = (slug) => `/blog?${new URLSearchParams({
		...search ? { search } : {},
		...slug ? { category: slug } : {}
	})}`;
	return /* @__PURE__ */ jsx(Shell, {
		seo,
		jsonLd,
		children: /* @__PURE__ */ jsxs("main", {
			className: "blog-wrap pb-32",
			children: [
				/* @__PURE__ */ jsxs("header", {
					className: "blog-hero blog-hero--centered",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "blog-eyebrow-pill",
							children: "Creator Intelligence"
						}),
						/* @__PURE__ */ jsxs("h1", { children: [
							/* @__PURE__ */ jsx("span", {
								className: "ink",
								children: "Signals, "
							}),
							/* @__PURE__ */ jsx("span", {
								className: "accent",
								children: "breakdowns & real data"
							}),
							/* @__PURE__ */ jsx("br", {}),
							/* @__PURE__ */ jsx("span", {
								className: "ink",
								children: "to spot your next breakout."
							})
						] }),
						/* @__PURE__ */ jsx("p", { children: "Go beyond the scroll. Explore the strategies, signals and stories behind the videos, brands and products gaining momentum right now." }),
						/* @__PURE__ */ jsxs("form", {
							className: "blog-search",
							onSubmit: (e) => {
								e.preventDefault();
								router.get("/blog", {
									search: query,
									...selectedCategory ? { category: selectedCategory } : {}
								});
							},
							children: [/* @__PURE__ */ jsx("input", {
								"aria-label": "Search articles",
								placeholder: "Search strategies, brands, ideas…",
								value: query,
								onChange: (e) => setQuery(e.target.value),
								maxLength: 255
							}), /* @__PURE__ */ jsx("button", {
								className: "blog-button primary",
								children: "Search"
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("nav", {
					className: "blog-chips blog-chips--centered",
					"aria-label": "Article categories",
					children: [/* @__PURE__ */ jsx(Link, {
						href: categoryUrl(""),
						className: !selectedCategory ? "active" : "",
						"aria-current": !selectedCategory ? "page" : void 0,
						children: "All articles"
					}), categories.map((category) => /* @__PURE__ */ jsx(Link, {
						href: categoryUrl(category.slug),
						className: selectedCategory === category.slug ? "active" : "",
						"aria-current": selectedCategory === category.slug ? "page" : void 0,
						children: category.name
					}, category.id))]
				}),
				featuredArticle && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("p", {
					className: "blog-section-label",
					children: "Featured article"
				}), /* @__PURE__ */ jsxs(Link, {
					href: featuredArticle.url,
					className: "blog-feature",
					children: [featuredArticle.heroLarge ? /* @__PURE__ */ jsx("img", {
						src: featuredArticle.heroLarge,
						alt: ""
					}) : /* @__PURE__ */ jsx(Art, { label: `${featuredArticle.readMinutes} minute read` }), /* @__PURE__ */ jsxs("div", {
						className: "blog-feature-copy",
						children: [
							/* @__PURE__ */ jsx(Badges, { article: featuredArticle }),
							/* @__PURE__ */ jsx("h2", { children: featuredArticle.title }),
							/* @__PURE__ */ jsx("p", { children: featuredArticle.excerpt }),
							/* @__PURE__ */ jsxs("div", {
								className: "blog-byline",
								children: [
									/* @__PURE__ */ jsx("strong", { children: featuredArticle.author }),
									/* @__PURE__ */ jsx("span", { children: "·" }),
									/* @__PURE__ */ jsx("span", { children: featuredArticle.publishedDate }),
									/* @__PURE__ */ jsx("span", { children: "·" }),
									/* @__PURE__ */ jsx("span", { children: "Read article ↗" })
								]
							})
						]
					})]
				})] }),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between mb-6",
					children: [/* @__PURE__ */ jsx("p", {
						className: "blog-section-label mb-0",
						children: search || selectedCategory ? "Search Results" : "Latest Articles"
					}), /* @__PURE__ */ jsxs("span", {
						className: "text-sm text-slate-500",
						children: [articles.total, " articles"]
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "blog-grid",
					children: articles.data.map((article) => /* @__PURE__ */ jsx(Card$1, { article }, article.id))
				}),
				!articles.data.length && /* @__PURE__ */ jsxs("div", {
					className: "blog-panel text-center py-16",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-xl font-semibold",
							children: "No articles matched that search."
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-slate-500 mt-3",
							children: "Try a broader keyword or explore all categories."
						}),
						/* @__PURE__ */ jsx(Link, {
							className: "blog-button mt-6",
							href: "/blog",
							children: "View all articles"
						})
					]
				}),
				/* @__PURE__ */ jsx(Pagination, { links: articles.links })
			]
		})
	});
}
//#endregion
//#region resources/js/Pages/Blog/Show.jsx
var Show_exports$2 = /* @__PURE__ */ __exportAll({ default: () => Show$2 });
function Show$2({ seo, jsonLd, article, blocks, tocItems, relatedArticles }) {
	return /* @__PURE__ */ jsx(Shell, {
		seo,
		jsonLd,
		children: /* @__PURE__ */ jsxs("main", {
			className: "blog-wrap blog-detail",
			children: [
				/* @__PURE__ */ jsxs("nav", {
					className: "blog-breadcrumb",
					"aria-label": "Breadcrumb",
					children: [
						/* @__PURE__ */ jsx(Link, {
							href: "/blog",
							children: "Blog"
						}),
						article.category && /* @__PURE__ */ jsxs(Fragment$1, { children: [" / ", /* @__PURE__ */ jsx(Link, {
							href: `/blog?category=${encodeURIComponent(article.category.slug)}`,
							children: article.category.name
						})] }),
						" / ",
						/* @__PURE__ */ jsx("span", { children: article.title.length > 52 ? `${article.title.slice(0, 52)}…` : article.title })
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "blog-reading-layout",
					children: [/* @__PURE__ */ jsxs("article", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ jsx(Badges, { article }),
							/* @__PURE__ */ jsx("h1", {
								className: "blog-article-title",
								children: article.title
							}),
							article.excerpt && /* @__PURE__ */ jsx("p", {
								className: "blog-article-excerpt",
								children: article.excerpt
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "blog-byline",
								children: [
									/* @__PURE__ */ jsx("img", {
										src: "/brand-beacon-logo.svg",
										alt: "",
										width: "32",
										height: "32"
									}),
									/* @__PURE__ */ jsx("strong", { children: article.author }),
									/* @__PURE__ */ jsx("time", { children: article.publishedLabel }),
									/* @__PURE__ */ jsxs("span", { children: [article.readMinutes, " min read"] }),
									/* @__PURE__ */ jsxs("span", { children: [article.blockCount, " sections"] })
								]
							}),
							article.heroLarge ? /* @__PURE__ */ jsx("img", {
								className: "blog-article-hero",
								src: article.heroLarge,
								alt: article.title
							}) : /* @__PURE__ */ jsx(Art, {
								className: "blog-article-hero",
								label: "No hero image selected"
							}),
							/* @__PURE__ */ jsx(ArticleBlocks, { blocks })
						]
					}), /* @__PURE__ */ jsx("aside", { children: /* @__PURE__ */ jsxs("div", { children: [tocItems.length > 0 && /* @__PURE__ */ jsxs("nav", {
						className: "blog-toc",
						"aria-label": "In this article",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "blog-eyebrow mb-4",
							children: "In this article"
						}), tocItems.map((item) => /* @__PURE__ */ jsx("a", {
							href: `#${item.id}`,
							style: { paddingLeft: item.level === 3 ? 16 : 0 },
							children: item.label
						}, item.id))]
					}), /* @__PURE__ */ jsx(Cta, {})] }) })]
				}),
				relatedArticles.length > 0 && /* @__PURE__ */ jsxs("section", {
					className: "mt-20",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-2xl font-semibold mb-6",
						children: "Continue Reading"
					}), /* @__PURE__ */ jsx("div", {
						className: "blog-grid related",
						children: relatedArticles.map((related) => /* @__PURE__ */ jsx(Card$1, { article: related }, related.id))
					})]
				})
			]
		})
	});
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
		href: "/library"
	},
	{
		label: "Blog",
		href: "/blog"
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
//#region resources/js/Pages/components/EntitlementsBar.jsx
var EntitlementsBar_exports = /* @__PURE__ */ __exportAll({ default: () => EntitlementsBar });
/**
* Plan and allowance at a glance — the handoff mockup's `.ent` pill, wired to
* real billing props. One quiet line, not a dashboard.
*/
function titleCase$1(slug) {
	return String(slug || "free").split(/[-_\s]+/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
function EntitlementsBar({ variant = "default" }) {
	const { auth = {}, billing = {} } = usePage().props;
	if (!(auth.signedIn ?? Boolean(auth.user))) return null;
	const searchLimit = billing.searchCreditsLimit ?? 0;
	const searchLeft = billing.searchCreditsRemaining ?? 0;
	const searchUsed = billing.searchCreditsUsed ?? 0;
	const searchesLow = searchLimit > 0 && searchLeft <= Math.max(1, Math.round(searchLimit * .1));
	if (variant === "drawer") return /* @__PURE__ */ jsx(Link, {
		href: "/settings/subscription",
		className: "ent ent--drawer",
		"aria-label": "Open subscription settings",
		children: /* @__PURE__ */ jsxs("span", {
			className: "ent__line",
			children: [
				/* @__PURE__ */ jsx("b", { children: titleCase$1(billing.currentPlan) }),
				/* @__PURE__ */ jsx("i", {}),
				/* @__PURE__ */ jsxs("span", {
					className: searchesLow ? "low" : void 0,
					children: [
						/* @__PURE__ */ jsx("b", { children: searchUsed }),
						searchLimit > 0 && ` of ${searchLimit}`,
						" searches"
					]
				}),
				/* @__PURE__ */ jsx("i", {}),
				/* @__PURE__ */ jsx("span", {
					className: "ent__cta",
					children: "View Full Credits"
				})
			]
		})
	});
	return /* @__PURE__ */ jsxs(Link, {
		href: "/settings/subscription",
		className: "ent",
		"aria-label": "Open subscription settings",
		children: [
			/* @__PURE__ */ jsx("b", { children: titleCase$1(billing.currentPlan) }),
			/* @__PURE__ */ jsx("i", {}),
			/* @__PURE__ */ jsxs("span", {
				className: searchesLow ? "low" : void 0,
				children: [
					/* @__PURE__ */ jsx("b", { children: searchUsed }),
					searchLimit > 0 && ` of ${searchLimit}`,
					" searches"
				]
			}),
			!billing.hasPaidPlan && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("i", {}), /* @__PURE__ */ jsx("span", {
				style: { textDecoration: "underline" },
				children: "Upgrade"
			})] })
		]
	});
}
//#endregion
//#region resources/js/lib/analytics.js
function canTrack() {
	return typeof window !== "undefined" && Array.isArray(window.dataLayer);
}
function normalizeEvent(entry) {
	if (!entry || typeof entry !== "object") return null;
	if (!entry.event || typeof entry.event !== "string") return null;
	return {
		event: entry.event,
		...entry.parameters && typeof entry.parameters === "object" ? entry.parameters : {}
	};
}
function pushAnalyticsEvent(entry) {
	const normalized = normalizeEvent(entry);
	if (!normalized || !canTrack()) return;
	window.dataLayer.push(normalized);
}
function pushAnalyticsEvents(entries) {
	if (!Array.isArray(entries)) return;
	entries.forEach(pushAnalyticsEvent);
}
//#endregion
//#region resources/js/landing/flow/api.js
/**
* Small fetch wrapper for the saved-search endpoints. Inertia handles page
* navigation; these calls are the in-page ones that should not re-render the
* whole document.
*/
function csrfToken$2() {
	return document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content") ?? "";
}
var API_V1 = "/api/v1";
async function request(url, { method = "GET", body, signal } = {}) {
	const response = await fetch(url, {
		method,
		credentials: "same-origin",
		signal,
		headers: {
			Accept: "application/json",
			"X-Requested-With": "XMLHttpRequest",
			...body ? { "Content-Type": "application/json" } : {},
			...method === "GET" ? {} : { "X-CSRF-TOKEN": csrfToken$2() }
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
	pushAnalyticsEvents(payload?.analytics);
	return payload;
}
function expandKeywords(phrase, { signal, fresh = false, instant = false, type = "brand" } = {}) {
	return fetch(`${API_V1}/saved-searches/expand`, {
		method: "POST",
		credentials: "same-origin",
		signal,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"X-Requested-With": "XMLHttpRequest",
			"X-CSRF-TOKEN": csrfToken$2()
		},
		body: JSON.stringify({
			phrase,
			type,
			...fresh ? { fresh: true } : {},
			...instant ? { instant: true } : {}
		})
	}).then(async (response) => {
		const payload = await response.json().catch(() => null);
		if (!response.ok) throw new Error(payload?.message || "Could not suggest keywords.");
		return payload;
	});
}
function fetchKeywordSuggestions(type, q, { signal } = {}) {
	const params = new URLSearchParams();
	params.set("type", type);
	if (q) params.set("q", q);
	return request(`${API_V1}/keyword-index/suggestions?${params.toString()}`, { signal });
}
function createSavedSearch({ type, phrase, name, keywords, frequency, sources, refreshExisting = false }) {
	return request(`${API_V1}/saved-searches`, {
		method: "POST",
		body: {
			type,
			phrase,
			name,
			keywords,
			frequency,
			...sources ? { sources } : {},
			...refreshExisting ? { refresh_existing: true } : {}
		}
	});
}
function checkDuplicateSavedSearch({ type, phrase, name, keywords, frequency }) {
	return request(`${API_V1}/saved-searches/check-duplicate`, {
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
function fetchRecentSearches() {
	return request(`${API_V1}/saved-searches/recent`);
}
function fetchBookmarkedVideos() {
	return request(`${API_V1}/saved-searches/bookmarked-videos`);
}
function fetchAnalysisHistory() {
	return request(`${API_V1}/saved-searches/analysis-history`);
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
	retry: (id) => request(`${API_V1}/saved-searches/${id}/retry`, { method: "POST" }),
	destroy: (id) => request(`${API_V1}/saved-searches/${id}`, { method: "DELETE" })
};
var billing = {
	checkout: (slug, cycle = "monthly") => {
		const params = new URLSearchParams();
		if (cycle === "annual") params.set("cycle", "annual");
		const suffix = params.toString() ? `?${params.toString()}` : "";
		window.location.assign(`/billing/checkout/${encodeURIComponent(slug)}${suffix}`);
	},
	trialCheckout: (slug, cycle = "monthly") => {
		const params = new URLSearchParams({ trial: "1" });
		if (cycle === "annual") params.set("cycle", "annual");
		window.location.assign(`/billing/checkout/${encodeURIComponent(slug)}?${params.toString()}`);
	},
	upgrade: (slug) => request(`/billing/upgrade/${encodeURIComponent(slug)}`, { method: "POST" }),
	createPaymentMethodSetup: () => request("/settings/subscription/payment-method/setup", { method: "POST" }),
	updatePaymentMethod: (paymentMethodId) => request("/settings/subscription/payment-method", {
		method: "PATCH",
		body: { payment_method_id: paymentMethodId }
	}),
	cancelSubscription: () => request("/settings/subscription/cancel", { method: "POST" }),
	reactivateSubscription: () => request("/settings/subscription/reactivate", { method: "POST" })
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
var TRACKED_ANALYSES_KEY = "vvf-tracked-video-analyses";
function readTrackedVideoAnalyses() {
	try {
		const raw = window.sessionStorage.getItem(TRACKED_ANALYSES_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function writeTrackedVideoAnalyses(entries) {
	try {
		window.sessionStorage.setItem(TRACKED_ANALYSES_KEY, JSON.stringify(entries.slice(0, 25)));
	} catch {}
}
function trackVideoAnalysis(entry) {
	const existing = readTrackedVideoAnalyses().filter((item) => String(item.videoId) !== String(entry.videoId));
	writeTrackedVideoAnalyses([{ ...entry }, ...existing]);
}
function untrackVideoAnalysis(videoId) {
	writeTrackedVideoAnalyses(readTrackedVideoAnalyses().filter((item) => String(item.videoId) !== String(videoId)));
}
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
		label: "My Feed",
		href: "/home",
		icon: Spark,
		match: "/home"
	},
	{
		label: "Library",
		href: "/library",
		icon: Library,
		match: "/library"
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
		icon: Target,
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
		href: "/home",
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
function CompletedAnalysisModal({ item, onClose, onView }) {
	if (!item) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "bb-drawer is-open",
		children: [/* @__PURE__ */ jsx("button", {
			className: "bb-drawer__bg",
			"aria-label": "Close notification",
			onClick: onClose
		}), /* @__PURE__ */ jsxs("div", {
			className: "mx-4 my-auto w-full max-w-[440px] rounded-[24px] border border-[#E8DFC9] bg-[linear-gradient(180deg,#fffdf7_0%,#fff8ea_100%)] p-6 shadow-[0_30px_90px_rgba(42,33,20,0.22)]",
			style: { marginInline: "auto" },
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Video analysis ready",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "inline-flex items-center gap-2 rounded-full bg-[#FFF3CF] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8C6B10]",
					children: [/* @__PURE__ */ jsx(Spark, { className: "h-3.5 w-3.5" }), "Video analysis ready"]
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-[24px] font-[850] leading-tight tracking-[-0.03em] text-[var(--ink)]",
					children: "Your analysis is done"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mt-3 text-[14px] leading-6 text-[var(--muted)]",
					children: [item.videoLabel || "Your breakout video", " is ready. Open the search result it belongs to and we'll jump straight into the finished analysis."]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-4 rounded-[16px] border border-[var(--line)] bg-white/80 px-4 py-3 text-[13px] font-semibold text-[var(--ink)]",
					children: item.searchName || item.videoLabel || "Saved search"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn--g",
						onClick: onClose,
						children: "Later"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn--y",
						onClick: onView,
						children: "View analysis"
					})]
				})
			]
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
	const [completedAnalysis, setCompletedAnalysis] = useState(null);
	const signedIn = auth.signedIn ?? Boolean(auth.user);
	const impersonation = auth.impersonation;
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
	useEffect(() => {
		if (!signedIn || completedAnalysis) return void 0;
		let cancelled = false;
		const poll = async () => {
			const tracked = readTrackedVideoAnalyses().filter((item) => item && item.videoId && item.searchUrl);
			if (tracked.length === 0) return;
			const statuses = await Promise.all(tracked.map(async (item) => {
				try {
					return {
						item,
						analysis: (await videoAnalysis.get(item.videoId))?.analysis ?? null
					};
				} catch {
					return {
						item,
						analysis: null
					};
				}
			}));
			if (cancelled) return;
			const ready = statuses.find(({ analysis }) => analysis?.status === "complete");
			if (ready) {
				setCompletedAnalysis(ready.item);
				untrackVideoAnalysis(ready.item.videoId);
				return;
			}
			statuses.filter(({ analysis }) => analysis?.status === "failed").forEach(({ item }) => untrackVideoAnalysis(item.videoId));
		};
		poll();
		const timer = window.setInterval(poll, 4e3);
		return () => {
			cancelled = true;
			window.clearInterval(timer);
		};
	}, [signedIn, completedAnalysis]);
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
						signedIn && /* @__PURE__ */ jsx("div", {
							className: "bb-drawer__actions",
							children: /* @__PURE__ */ jsx(EntitlementsBar, { variant: "drawer" })
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
								impersonation && /* @__PURE__ */ jsxs("div", {
									className: "mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--yellow)] bg-[var(--wash)] px-4 py-3 text-[12.5px] text-[var(--amber-ink)]",
									children: [/* @__PURE__ */ jsxs("span", { children: [
										"You are logged in as ",
										auth.user?.email,
										". This admin session ends at",
										" ",
										new Date(impersonation.expires_at).toLocaleTimeString([], {
											hour: "numeric",
											minute: "2-digit"
										}),
										"."
									] }), /* @__PURE__ */ jsx("button", {
										type: "button",
										onClick: () => router.post("/x/admin/impersonation/stop"),
										className: "rounded-md border border-[var(--yellow)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--amber-ink)] transition hover:bg-[var(--yellow)] hover:text-[#1a1400]",
										children: "Return to admin"
									})]
								}),
								header,
								toolbar && /* @__PURE__ */ jsx("div", { children: toolbar }),
								children
							]
						})
					}), /* @__PURE__ */ jsx(AppFooter, { width })]
				})]
			}),
			/* @__PURE__ */ jsx(CompletedAnalysisModal, {
				item: completedAnalysis,
				onClose: () => setCompletedAnalysis(null),
				onView: () => {
					if (!completedAnalysis?.searchUrl || !completedAnalysis?.videoId) {
						setCompletedAnalysis(null);
						return;
					}
					const joiner = completedAnalysis.searchUrl.includes("?") ? "&" : "?";
					const target = `${completedAnalysis.searchUrl}${joiner}analysisVideo=${encodeURIComponent(completedAnalysis.videoId)}&openAnalysis=1`;
					setCompletedAnalysis(null);
					router.visit(target);
				}
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/components/DuplicateSearchModal.jsx
var DuplicateSearchModal_exports = /* @__PURE__ */ __exportAll({ default: () => DuplicateSearchModal });
function DuplicateSearchModal({ search, newKeywords = [], busy = false, onRefresh, onCancel }) {
	const additions = newKeywords.slice(0, 4);
	const hasAdditions = additions.length > 0;
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: onCancel
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "bb-modal__close",
						"aria-label": "Close",
						onClick: onCancel,
						disabled: busy,
						children: /* @__PURE__ */ jsx(Close, {})
					}),
					/* @__PURE__ */ jsx("h2", { children: "Already in your history" }),
					/* @__PURE__ */ jsxs("p", {
						className: "sub",
						children: ["This keyword already has a saved search. ", hasAdditions ? "Add these new expansion terms and refresh it with the latest TikTok results?" : "Would you like to refresh it with the latest TikTok results?"]
					}),
					search?.name && /* @__PURE__ */ jsx("p", {
						style: {
							marginTop: 16,
							fontWeight: 700,
							color: "var(--ink)"
						},
						children: search.name
					}),
					hasAdditions && /* @__PURE__ */ jsxs("div", {
						style: { marginTop: 14 },
						children: [/* @__PURE__ */ jsx("p", {
							className: "sect__n",
							children: "New terms to merge"
						}), /* @__PURE__ */ jsxs("div", {
							className: "chips",
							children: [additions.map((keyword) => /* @__PURE__ */ jsxs("span", {
								className: "chip on",
								children: ["+ ", keyword]
							}, keyword)), newKeywords.length > additions.length && /* @__PURE__ */ jsxs("span", {
								className: "chip on",
								children: [
									"+",
									newKeywords.length - additions.length,
									" more"
								]
							})]
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							marginTop: 12,
							fontSize: ".82rem"
						},
						children: "This refresh uses 1 search credit."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "actrow__r",
						style: {
							marginTop: 24,
							justifyContent: "flex-end"
						},
						children: [search?.url && /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g",
							onClick: () => router.visit(search.url),
							disabled: busy,
							children: "View existing results"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--y",
							onClick: onRefresh,
							disabled: busy,
							children: busy ? "Refreshing…" : hasAdditions ? "Merge & refresh" : "Refresh search"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
//#region resources/js/Pages/components/SearchCreditConfirmModal.jsx
var SearchCreditConfirmModal_exports = /* @__PURE__ */ __exportAll({ default: () => SearchCreditConfirmModal });
function SearchCreditConfirmModal({ body, subject, busy = false, onConfirm, onCancel }) {
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: onCancel
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box",
				children: [
					/* @__PURE__ */ jsx("h2", { children: "Start this search?" }),
					/* @__PURE__ */ jsx("p", {
						className: "sub",
						children: body
					}),
					subject && /* @__PURE__ */ jsx("p", {
						style: {
							marginTop: 16,
							fontWeight: 700,
							color: "var(--ink)"
						},
						children: subject
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
							onClick: onCancel,
							disabled: busy,
							children: "Cancel"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--y",
							onClick: onConfirm,
							disabled: busy,
							children: busy ? "Starting…" : "Start search"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
//#region resources/js/Pages/components/UpgradePromptModal.jsx
var UpgradePromptModal_exports = /* @__PURE__ */ __exportAll({ default: () => UpgradePromptModal });
function SparkIcon$1() {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: /* @__PURE__ */ jsx("path", {
			fill: "currentColor",
			d: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"
		})
	});
}
function CloseIcon() {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.2",
		strokeLinecap: "round",
		"aria-hidden": "true",
		children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
	});
}
function UpgradePromptModal({ open = true, eyebrow = null, title, body, detail = null, emphasis = null, visual = null, primaryLabel, onPrimary, primaryDisabled = false, secondaryLabel = "Maybe later", onSecondary, onClose }) {
	if (!open) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: onClose
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box bb-modal__box--upgrade",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": title,
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "bb-modal__close",
						onClick: onClose,
						"aria-label": "Close",
						children: /* @__PURE__ */ jsx(CloseIcon, {})
					}),
					eyebrow && /* @__PURE__ */ jsxs("div", {
						className: "bb-modal__eyebrow",
						children: [/* @__PURE__ */ jsx(SparkIcon$1, {}), /* @__PURE__ */ jsx("span", { children: eyebrow })]
					}),
					visual === "search-momentum" && /* @__PURE__ */ jsxs("div", {
						className: "bb-upgrade-visual",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "bb-upgrade-visual__chart",
							children: [/* @__PURE__ */ jsx("span", {
								className: "bb-upgrade-visual__badge",
								children: "8-day access"
							}), /* @__PURE__ */ jsxs("svg", {
								viewBox: "0 0 240 76",
								fill: "none",
								children: [
									/* @__PURE__ */ jsx("path", {
										d: "M8 63C34 61 42 48 65 51C91 54 98 34 121 39C147 45 158 24 177 28C202 33 209 11 232 9",
										stroke: "currentColor",
										strokeWidth: "4",
										strokeLinecap: "round"
									}),
									/* @__PURE__ */ jsx("circle", {
										cx: "232",
										cy: "9",
										r: "7",
										fill: "#ffc529",
										stroke: "#fff",
										strokeWidth: "4"
									}),
									/* @__PURE__ */ jsx("path", {
										d: "M8 69H232",
										stroke: "currentColor",
										strokeOpacity: ".14"
									})
								]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "bb-upgrade-visual__perks",
							children: [
								/* @__PURE__ */ jsx("span", { children: "More searches" }),
								/* @__PURE__ */ jsx("span", { children: "Auto refreshes" }),
								/* @__PURE__ */ jsx("span", { children: "Deeper analysis" })
							]
						})]
					}),
					visual === "video-analysis" && /* @__PURE__ */ jsxs("div", {
						className: "bb-analysis-visual",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "bb-analysis-visual__play",
							children: [/* @__PURE__ */ jsx("span", { children: "▶" }), /* @__PURE__ */ jsx("i", { children: "8.4×" })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "bb-analysis-visual__insights",
							children: [
								/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { children: "01" }), /* @__PURE__ */ jsx("b", { children: "Winning hook" })] }),
								/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { children: "02" }), /* @__PURE__ */ jsx("b", { children: "Why it worked" })] }),
								/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", { children: "03" }), /* @__PURE__ */ jsx("b", { children: "How to recreate it" })] })
							]
						})]
					}),
					/* @__PURE__ */ jsx("h2", { children: title }),
					body && /* @__PURE__ */ jsx("p", {
						className: "sub",
						children: body
					}),
					detail && /* @__PURE__ */ jsx("p", {
						className: "bb-modal__detail",
						children: detail
					}),
					emphasis && /* @__PURE__ */ jsx("p", {
						className: "bb-modal__emphasis",
						children: emphasis
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bb-modal__actions",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--y",
							onClick: onPrimary,
							disabled: primaryDisabled,
							children: primaryLabel
						}), secondaryLabel && /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g",
							onClick: onSecondary ?? onClose,
							children: secondaryLabel
						})]
					})
				]
			})]
		})
	});
}
//#endregion
//#region resources/js/Pages/components/BrandInlineFlow.jsx
var BrandInlineFlow_exports = /* @__PURE__ */ __exportAll({ default: () => BrandInlineFlow });
/**
* The brand/product page's expand-in-place search flow (matches the
* "Brand Beacon — Inline search flow" mockup).
*
* States: collapsed → keywords → running → done. The card sits at
* the top of the page and expands in-place — the page context beneath it
* (moving-this-week, suggested-to-track, all-searches) never unmounts.
*
* This is the only search flow now — the dashboard's older SearchWizard was
* retired along with the search homepage.
*/
var STAGE_LIST = [
	{
		key: "start",
		label: "Starting the scrape"
	},
	{
		key: "pull",
		label: "Pulling videos from TikTok"
	},
	{
		key: "filter",
		label: "Filtering against your keywords"
	},
	{
		key: "rank",
		label: "Ranking by Breakout Score"
	}
];
function useRunStages(active, done) {
	const [idx, setIdx] = useState(0);
	useEffect(() => {
		if (!active) {
			setIdx(0);
			return;
		}
		if (done) {
			setIdx(STAGE_LIST.length);
			return;
		}
		const timer = window.setInterval(() => {
			setIdx((i) => i < STAGE_LIST.length - 1 ? i + 1 : i);
		}, 1200);
		return () => window.clearInterval(timer);
	}, [active, done]);
	return idx;
}
function MiniStepper({ current }) {
	const steps = [{
		key: "keywords",
		label: "Keywords"
	}];
	const activeIdx = steps.findIndex((s) => s.key === current);
	if (!(current === "keywords")) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "mini",
		children: [{
			key: "subject",
			label: "Subject"
		}, ...steps].map((s, i, arr) => {
			const stateIdx = i === 0 ? 0 : steps.findIndex((x) => x.key === s.key) + 1;
			const cur = activeIdx + 1;
			const cls = stateIdx < cur ? "done" : stateIdx === cur ? "now" : "todo";
			return /* @__PURE__ */ jsxs("span", {
				className: "mst-wrap",
				style: {
					display: "inline-flex",
					alignItems: "center"
				},
				children: [/* @__PURE__ */ jsxs("span", {
					className: `mst ${cls}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "mst__n",
						children: cls === "done" ? /* @__PURE__ */ jsx(Check$1, {}) : i + 1
					}), /* @__PURE__ */ jsx("span", {
						className: "mst__l",
						children: s.label
					})]
				}), i < arr.length - 1 && /* @__PURE__ */ jsx("span", { className: "mst__line" })]
			}, s.key);
		})
	});
}
function BrandInlineFlow({ kind = "brand", placeholder = "Which brand do you want to research?", sample = "rhode skin", eyebrow = "Start a brand search", hint = "One brand per search — we widen it with keywords next.", prefillSubject = "", prefillNonce = 0, expandOnPrefill = false, onReset = null, onCreated = null }) {
	const { billing: billing$5 = {}, auth = {} } = usePage().props;
	const signedIn = auth.signedIn ?? Boolean(auth.user);
	const [state, setState] = useState("collapsed");
	const [subject, setSubject] = useState("");
	const [subjectSuggestions, setSubjectSuggestions] = useState([]);
	const [activeSuggestion, setActiveSuggestion] = useState(-1);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [keywords, setKeywords] = useState([]);
	const [emailWhenReady, setEmailWhenReady] = useState(true);
	const [addKeyword, setAddKeyword] = useState("");
	const [expanding, setExpanding] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [duplicateSearch, setDuplicateSearch] = useState(null);
	const [confirmRefresh, setConfirmRefresh] = useState(null);
	const [searchResult, setSearchResult] = useState(null);
	const [runDone, setRunDone] = useState(false);
	const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
	const runIdxRef = useRef(0);
	const runIdx = useRunStages(state === "running", runDone);
	runIdxRef.current = runIdx;
	const inputRef = useRef(null);
	const subjectFieldRef = useRef(null);
	const rootRef = useRef(null);
	const kwCount = useMemo(() => keywords.filter((k) => k.selected).length, [keywords]);
	const searchLeft = billing$5.searchCreditsRemaining;
	const searchLimit = billing$5.searchCreditsLimit;
	const searchCreditsAvailable = !signedIn || searchLimit === -1 || Number(searchLeft ?? 0) > 0;
	const shouldOfferTrial = (billing$5.trialEligible ?? true) && !(billing$5.hasUsedTrial ?? false);
	useEffect(() => {
		const controller = new AbortController();
		fetchKeywordSuggestions(kind, subject.trim(), { signal: controller.signal }).then((payload) => setSubjectSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : [])).catch(() => {});
		return () => controller.abort();
	}, [kind, subject]);
	useEffect(() => {
		const close = (event) => {
			if (!subjectFieldRef.current?.contains(event.target)) {
				setShowSuggestions(false);
				setActiveSuggestion(-1);
			}
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, []);
	useEffect(() => {
		const nextSubject = prefillSubject.trim().replace(/\s+/g, " ");
		if (!nextSubject) return;
		setState("collapsed");
		setSubject(nextSubject);
		setShowSuggestions(false);
		setActiveSuggestion(-1);
		setError(null);
		if (expandOnPrefill) {
			startFlow(nextSubject);
			return;
		}
		rootRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		});
		window.requestAnimationFrame(() => inputRef.current?.focus());
	}, [
		prefillNonce,
		prefillSubject,
		expandOnPrefill
	]);
	const startFlow = async (prefill) => {
		const q = (typeof prefill === "string" ? prefill : subject).trim().replace(/\s+/g, " ");
		if (!q) return;
		if (!searchCreditsAvailable) {
			setUpgradeModalOpen(true);
			return;
		}
		setSubject(q);
		setError(null);
		setState("keywords");
		setExpanding(true);
		try {
			const seed = [...((await expandKeywords(q, { type: kind }))?.keywords ?? []).slice(0, 6).map((label) => ({
				label,
				selected: true,
				source: "ai"
			}))];
			const seen = /* @__PURE__ */ new Set();
			const deduped = seed.filter((k) => {
				const key = k.label.toLowerCase();
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			});
			setKeywords(deduped);
		} catch (e) {
			setError(e.message || "Could not suggest keywords.");
			setKeywords([{
				label: q,
				selected: true,
				source: "yours"
			}]);
		} finally {
			setExpanding(false);
		}
	};
	const collapse = () => {
		if (onReset) {
			onReset(subject);
			return;
		}
		setState("collapsed");
		setKeywords([]);
		setSearchResult(null);
		setRunDone(false);
		setError(null);
		setAddKeyword("");
	};
	const toggleKeyword = (label) => {
		setKeywords((current) => current.map((k) => k.label === label ? {
			...k,
			selected: !k.selected
		} : k));
	};
	const addOwnKeyword = () => {
		const v = addKeyword.trim().replace(/\s+/g, " ");
		if (!v) return;
		if (keywords.some((k) => k.label.toLowerCase() === v.toLowerCase())) {
			setAddKeyword("");
			return;
		}
		setKeywords((current) => [...current, {
			label: v,
			selected: true,
			source: "yours"
		}]);
		setAddKeyword("");
	};
	const regenerate = async () => {
		if (!subject) return;
		setExpanding(true);
		try {
			const fresh = ((await expandKeywords(subject, {
				fresh: true,
				type: kind
			}))?.keywords ?? []).slice(0, 6);
			setKeywords((current) => [...fresh.map((label) => ({
				label,
				selected: true,
				source: "ai"
			})), ...current.filter((k) => k.source === "yours")]);
		} catch (e) {
			setError(e.message || "Could not regenerate keywords.");
		} finally {
			setExpanding(false);
		}
	};
	const startSearch = async (refreshExisting = false) => {
		if (!signedIn) {
			window.location.assign(`/search?type=${kind}&q=${encodeURIComponent(subject)}`);
			return;
		}
		const selected = keywords.filter((k) => k.selected).map((k) => k.label);
		if (selected.length === 0) {
			setError("Pick at least one keyword.");
			return;
		}
		setSubmitting(true);
		setError(null);
		setState("running");
		setRunDone(false);
		try {
			const created = await createSavedSearch({
				type: kind,
				phrase: subject,
				name: subject,
				keywords: selected,
				frequency: "weekly",
				refreshExisting
			});
			trackSearch({
				id: created.id,
				name: created.name,
				url: created.url
			});
			onCreated?.(created);
			if (created?.url) {
				router.visit(created.url);
				return;
			}
			setSearchResult(created);
		} catch (e) {
			if (e.status === 409 && e.payload?.code === "existing_search") {
				setDuplicateSearch({
					search: e.payload.search,
					newKeywords: e.payload.new_keywords
				});
				setState("keywords");
				setSubmitting(false);
				return;
			}
			setError(e.message || "Could not start the search.");
			setState("keywords");
			setSubmitting(false);
		}
	};
	const checkAndConfirmSearch = async () => {
		if (!signedIn) {
			window.location.assign(`/search?type=${kind}&q=${encodeURIComponent(subject)}`);
			return;
		}
		const selected = keywords.filter((k) => k.selected).map((k) => k.label);
		if (selected.length === 0) {
			setError("Pick at least one keyword.");
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			const duplicate = await checkDuplicateSavedSearch({
				type: kind,
				phrase: subject,
				name: subject,
				keywords: selected,
				frequency: "weekly"
			});
			if (duplicate.existing) setDuplicateSearch({
				search: duplicate.search,
				newKeywords: duplicate.new_keywords
			});
			else setConfirmRefresh(false);
		} catch (e) {
			setError(e.message || "Could not check your search history. Try again.");
		} finally {
			setSubmitting(false);
		}
	};
	useEffect(() => {
		if (state !== "running" || !searchResult?.id) return void 0;
		let cancelled = false;
		let timer;
		const tick = async () => {
			if (cancelled) return;
			try {
				const s = (await fetchNotifications([searchResult.id]))?.searches?.[0];
				if (!cancelled && s && (s.status === "done" || s.status === "complete")) {
					setSearchResult((current) => ({
						...current,
						...s
					}));
					setRunDone(true);
					setSubmitting(false);
					window.setTimeout(() => !cancelled && setState("done"), 800);
					return;
				}
				if (!cancelled && s?.status === "failed") {
					setError("The search failed to complete.");
					setSubmitting(false);
					setState("keywords");
					return;
				}
			} catch {}
			timer = window.setTimeout(tick, 4e3);
		};
		tick();
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [state, searchResult?.id]);
	const viewResults = () => {
		if (searchResult?.url) router.visit(searchResult.url);
	};
	const showFlowBar = state !== "collapsed";
	const pFillWidth = state === "running" ? `${8 + runIdx / STAGE_LIST.length * 88}%` : runDone ? "100%" : "8%";
	const visibleSuggestions = subjectSuggestions.filter((suggestion) => suggestion.label?.trim());
	const applySuggestion = (label) => {
		setSubject(label);
		setShowSuggestions(false);
		setActiveSuggestion(-1);
		window.requestAnimationFrame(() => inputRef.current?.focus());
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("style", { children: `
        .bif{background:var(--white);border:1px solid var(--line);border-radius:20px;padding:26px 28px;margin-bottom:44px}
        .bif__ey{display:flex;align-items:center;gap:10px;margin-bottom:18px;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-ink)}
        .bif__ey::before{content:'';width:22px;height:2px;background:var(--yellow)}
        .bif__bar{position:relative;display:flex;align-items:center;gap:14px;padding:9px 9px 9px 22px;background:var(--white);border:1.5px solid var(--line-2,#DEDBD3);border-radius:100px;transition:border-color .18s,box-shadow .18s,background .18s}
        .bif__entry{position:relative;display:flex;align-items:center;gap:14px;flex:1 1 auto;min-width:0;white-space:nowrap}
        .bif__field{position:relative;flex:1 1 auto;min-width:0}
        .bif__bar:hover{border-color:var(--faint-2,#9A968E)}
        .bif__bar:focus-within{border-color:var(--yellow);box-shadow:0 0 0 5px rgba(255,198,41,.22);background:#FFFDF6}
        .bif__bar svg.q{width:22px;height:22px;color:var(--faint-2,#9A968E);flex:none;transition:color .18s}
        .bif__bar:focus-within svg.q{color:var(--amber-ink)}
        .bif__bar input{flex:1 1 auto;min-width:0;width:100%;height:54px;line-height:54px;border:0;outline:0;background:transparent;font:inherit;font-size:1.14rem;font-weight:600;letter-spacing:-.02em;color:var(--ink);padding:0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bif__bar input::placeholder{color:var(--faint-2,#9A968E);font-weight:500;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bif__suggest{position:absolute;top:calc(100% + 12px);left:-8px;right:-4px;z-index:20;overflow:hidden;border:1px solid #eadfca;border-radius:18px;background:rgba(255,255,255,.98);box-shadow:0 24px 48px -24px rgba(33,26,12,.3),0 8px 18px -12px rgba(33,26,12,.14);backdrop-filter:blur(10px)}
        .bif__suggest-head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px 10px;background:linear-gradient(180deg,#fff8e3 0%,#fffdf7 100%);border-bottom:1px solid #f0e5cf;font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9d6900}
        .bif__suggest-list{max-height:300px;overflow-y:auto;padding:6px}
        .bif__suggest-item{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border:0;border-radius:14px;background:transparent;text-align:left;cursor:pointer;transition:background .15s,transform .15s}
        .bif__suggest-item:hover,.bif__suggest-item.is-active{background:#fff7df}
        .bif__suggest-item.is-active{transform:translateX(2px)}
        .bif__suggest-copy{display:flex;min-width:0;flex-direction:column;gap:3px}
        .bif__suggest-copy strong{font-size:.92rem;font-weight:700;letter-spacing:-.02em;color:var(--ink)}
        .bif__suggest-copy em{font-style:normal;font-size:.74rem;font-weight:600;color:var(--faint-2,#9A968E)}
        .bif__cta{flex:none;display:inline-flex;align-items:center;gap:9px;height:54px;padding:0 26px;border-radius:100px;font-size:.96rem;font-weight:800;letter-spacing:-.015em;color:#1A1400;background:var(--yellow);border:0;cursor:pointer;box-shadow:0 1px 0 rgba(0,0,0,.04),0 4px 12px -6px rgba(255,198,41,.5);transition:background .18s,box-shadow .18s,transform .18s}
        .bif__cta svg{width:16px;height:16px;flex:none}
        .bif__cta:hover:not(:disabled){background:var(--yellow-hot,#FFD84D);box-shadow:0 1px 0 rgba(0,0,0,.05),0 6px 18px -6px rgba(255,198,41,.75);transform:translateY(-1px)}
        .bif__cta:active:not(:disabled){transform:translateY(0)}
        .bif__cta:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}
        .bif__hint{margin-top:14px;padding-left:6px;font-size:.85rem;color:var(--faint-2,#9A968E);line-height:1.5}
        .bif__hint b{color:var(--muted);font-weight:700}
        @media (max-width:640px){
          .bif{padding:20px}
          .bif__bar{flex-wrap:wrap;padding:12px;border-radius:20px;gap:10px}
          .bif__entry{width:100%;gap:10px}
          .bif__bar input{width:100%;height:44px;font-size:1.02rem;padding:0 6px}
          .bif__cta{width:100%;justify-content:center;height:48px}
          .bif__suggest{left:-2px;right:-2px;top:calc(100% + 8px);border-radius:16px}
          .bif__suggest-head{padding:10px 12px 9px;font-size:.62rem}
          .bif__suggest-item{padding:10px}
          .bif__suggest-copy strong{font-size:.86rem}
        }
        .flowbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
        .flowbar__head{display:flex;align-items:center;gap:14px;width:100%}
        .subject{display:inline-flex;align-items:center;gap:9px;height:40px;padding:0 8px 0 14px;border:1px solid var(--line-2,#DEDBD3);border-radius:100px;background:var(--paper,#FAF9F6)}
        .subject b{font-size:.96rem;font-weight:800;color:var(--ink);letter-spacing:-.01em}
        .subject .edit{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;color:var(--faint,#7C7972);border:0;background:transparent;cursor:pointer;transition:.15s}
        .subject .edit:hover{background:#fff;color:var(--ink)} .subject .edit svg{width:14px;height:14px}
        .mini{display:flex;align-items:center;gap:6px}
        .mst{display:flex;align-items:center;gap:7px}
        .mst__n{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:.72rem;font-weight:800;flex:none}
        .mst__n svg{width:11px;height:11px}
        .mst.todo .mst__n{background:#fff;border:1.5px solid var(--line-2,#DEDBD3);color:var(--faint-2,#9A968E)}
        .mst.now .mst__n{background:var(--yellow);color:#1A1400}
        .mst.done .mst__n{background:var(--ink);color:#fff}
        .mst__l{font-size:.8rem;font-weight:700;color:var(--faint-2,#9A968E)}
        .mst.now .mst__l{color:var(--ink)}
        .mst__line{width:22px;height:1.5px;background:var(--line-2,#DEDBD3);margin:0 4px}
        .flowbar .cancel{margin-left:auto;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:var(--faint,#7C7972);border:1px solid var(--line);background:transparent;cursor:pointer}
        .flowbar .cancel:hover{color:var(--ink);border-color:var(--line-2,#DEDBD3);background:var(--paper,#FAF9F6)} .flowbar .cancel svg{width:16px;height:16px}
        .divide{height:1px;background:var(--line);margin:20px 0}
        .ph{margin-bottom:14px}
        .ph__k{font-size:.7rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--amber-ink);margin-bottom:6px}
        .ph h3{font-size:.96rem;font-weight:800;color:var(--ink);letter-spacing:-.028em}
        .ph p.sub{font-size:.85rem;color:var(--faint-2,#9A968E);margin-top:5px}
        .ph__row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
        .chips{display:flex;flex-wrap:wrap;gap:8px}
        .kw{display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px;border-radius:100px;background:var(--white);border:1px solid var(--line-2,#DEDBD3);font-size:.86rem;font-weight:600;color:var(--body);cursor:pointer;transition:.15s}
        .kw:hover{border-color:var(--faint-2,#9A968E)}
        .kw__c{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--line-2,#DEDBD3);display:grid;place-items:center;color:transparent;transition:.15s}
        .kw__c svg{width:10px;height:10px}
        .kw.on{background:var(--wash);border-color:var(--yellow);color:#5C4200}
        .kw.on .kw__c{background:var(--yellow);border-color:var(--yellow);color:#1A1400}
        .kw__tag{font-size:.64rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--amber-ink);background:#fff;border-radius:5px;padding:2px 5px}
        .kw--add{border-style:dashed;color:var(--amber-ink);font-weight:700;background:transparent;display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 14px;border-radius:100px;border:1px dashed var(--line-2,#DEDBD3);cursor:pointer;font-size:.86rem}
        .kw--add svg{width:14px;height:14px}
        .kw--input{display:inline-flex;align-items:center;height:38px;padding:0 6px 0 14px;border-radius:100px;border:1.5px solid var(--yellow);background:var(--white);gap:6px}
        .kw--input input{border:0;outline:0;background:transparent;font:inherit;font-size:.86rem;font-weight:600;color:var(--ink);min-width:120px}
        .kw--input button{width:26px;height:26px;border-radius:50%;border:0;background:var(--yellow);color:#1A1400;display:grid;place-items:center;cursor:pointer}
        .kw--input button svg{width:12px;height:12px}
        .khint{font-size:.8rem;color:var(--faint-2,#9A968E);margin-top:12px}
        .khint b{color:var(--ink)}
        .schead{font-size:.9rem;font-weight:700;color:var(--ink);margin-top:22px}
        .freq{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
        .fq{text-align:left;padding:14px 16px;border:1px solid var(--line-2,#DEDBD3);border-radius:16px;background:var(--white);cursor:pointer;transition:.15s}
        .fq:hover{border-color:var(--faint-2,#9A968E)}
        .fq__t{display:flex;align-items:center;gap:9px;font-size:.9rem;font-weight:700;color:var(--ink)}
        .fq__r{width:17px;height:17px;border-radius:50%;border:2px solid var(--line-2,#DEDBD3);flex:none;transition:.15s}
        .fq p{font-size:.79rem;color:var(--faint-2,#9A968E);margin-top:6px}
        .fq.on{border-color:var(--yellow);background:var(--wash)}
        .fq.on .fq__r{border-color:var(--yellow);box-shadow:inset 0 0 0 3.5px var(--yellow)}
        .srcs{display:flex;flex-direction:column;gap:10px}
        .src{border:1px solid var(--line-2,#DEDBD3);border-radius:16px;padding:15px 16px;background:var(--white)}
        .src__h{display:flex;align-items:center;gap:10px;margin-bottom:11px}
        .src__i{width:30px;height:30px;border-radius:8px;background:var(--paper,#FAF9F6);display:grid;place-items:center;color:var(--muted);flex:none}
        .src__i svg{width:15px;height:15px}
        .src__t{font-size:.88rem;font-weight:700;color:var(--ink)}
        .src__f{display:flex;align-items:center;gap:2px;height:44px;padding:0 14px;border:1px solid var(--line-2,#DEDBD3);border-radius:100px;background:var(--white);transition:.16s}
        .src__f:focus-within{border-color:var(--yellow);box-shadow:0 0 0 4px rgba(255,198,41,.22)}
        .src__pre{font-size:.92rem;font-weight:600;color:var(--faint-2,#9A968E)}
        .src__f input{flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:.92rem;font-weight:600;color:var(--ink)}
        .src__m{font-size:.78rem;color:var(--muted);margin-top:9px;padding-left:2px}
        .src__m.faint{color:var(--faint-2,#9A968E)}
        .biffoot{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:20px}
        .biffoot__r{display:flex;gap:10px;flex-wrap:wrap}
        .run{text-align:center;padding:8px 0 4px}
        .run__ring{width:46px;height:46px;margin:0 auto 14px;border-radius:50%;border:3px solid var(--wash);border-top-color:var(--yellow);animation:bif-spin 1s linear infinite}
        @keyframes bif-spin{to{transform:rotate(360deg)}}
        .run h3{font-size:1.08rem;font-weight:800;color:var(--ink)}
        .run .sub{font-size:.86rem;color:var(--muted);margin-top:5px}
        .pbar{height:7px;border-radius:100px;background:var(--paper,#FAF9F6);overflow:hidden;margin:18px 0 16px}
        .pbar__f{height:100%;border-radius:100px;background:var(--yellow);transition:width .6s cubic-bezier(.22,.61,.36,1)}
        .stages{display:flex;flex-direction:column;gap:2px;text-align:left;max-width:400px;margin:0 auto}
        .stg{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:11px;font-size:.88rem;font-weight:600;color:var(--faint-2,#9A968E);transition:.2s}
        .stg__i{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--line-2,#DEDBD3);flex:none;display:grid;place-items:center;color:transparent} .stg__i svg{width:11px;height:11px}
        .stg.now{background:var(--wash);color:var(--ink)}
        .stg.now .stg__i{border-color:var(--yellow);border-top-color:transparent;animation:bif-spin 1s linear infinite}
        .stg.done{color:var(--muted)} .stg.done .stg__i{background:var(--ink);border-color:var(--ink);color:#fff}
        .run__note{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:18px;font-size:.83rem;color:var(--faint-2,#9A968E)}
        .sw{width:36px;height:21px;border-radius:100px;background:var(--line-2,#DEDBD3);position:relative;transition:.18s;flex:none;cursor:pointer;border:0}
        .sw::after{content:'';position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transition:.18s}
        .sw.on{background:var(--yellow)} .sw.on::after{left:17px}
        .done{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
        .done__c{width:44px;height:44px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center;flex:none}
        .done__c svg{width:22px;height:22px}
        .done h3{font-size:1.06rem;font-weight:800;color:var(--ink)}
        .done p{font-size:.85rem;color:var(--muted);margin-top:2px}
        .done__r{margin-left:auto;display:flex;gap:10px;flex-wrap:wrap}
        .bif__err{margin-top:12px;padding:10px 14px;border-radius:12px;background:#FBEDE6;color:#B0431B;font-size:.85rem;font-weight:600}
      ` }),
		upgradeModalOpen && /* @__PURE__ */ jsx(UpgradePromptModal, {
			eyebrow: "Keep your momentum",
			title: "Ready to find your next breakout?",
			body: shouldOfferTrial ? "Turn your first signal into a repeatable edge with Growth." : "Keep spotting breakout content before the trend moves on.",
			visual: "search-momentum",
			primaryLabel: shouldOfferTrial ? "Start my 8-day trial" : "Unlock more searches",
			onPrimary: () => shouldOfferTrial ? billing.trialCheckout("growth") : router.visit("/plans"),
			onClose: () => setUpgradeModalOpen(false)
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "bif",
			ref: rootRef,
			children: [
				state === "collapsed" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
					/* @__PURE__ */ jsx("p", {
						className: "bif__ey",
						children: eyebrow
					}),
					/* @__PURE__ */ jsxs("form", {
						className: "bif__bar",
						ref: subjectFieldRef,
						onSubmit: (e) => {
							e.preventDefault();
							startFlow();
						},
						children: [/* @__PURE__ */ jsxs("div", {
							className: "bif__entry",
							children: [/* @__PURE__ */ jsxs("svg", {
								className: "q",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								strokeLinecap: "round",
								children: [/* @__PURE__ */ jsx("circle", {
									cx: "11",
									cy: "11",
									r: "7"
								}), /* @__PURE__ */ jsx("path", { d: "m20 20-3.5-3.5" })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "bif__field",
								children: [/* @__PURE__ */ jsx("input", {
									ref: inputRef,
									type: "text",
									autoComplete: "off",
									value: subject,
									onChange: (e) => {
										setSubject(e.target.value);
										setShowSuggestions(true);
									},
									onFocus: () => setShowSuggestions(true),
									onKeyDown: (event) => {
										if (!visibleSuggestions.length) return;
										if (event.key === "ArrowDown") {
											event.preventDefault();
											setShowSuggestions(true);
											setActiveSuggestion((current) => (current + 1) % visibleSuggestions.length);
										}
										if (event.key === "ArrowUp") {
											event.preventDefault();
											setShowSuggestions(true);
											setActiveSuggestion((current) => current <= 0 ? visibleSuggestions.length - 1 : current - 1);
										}
										if (event.key === "Enter" && activeSuggestion >= 0 && visibleSuggestions[activeSuggestion]) {
											event.preventDefault();
											applySuggestion(visibleSuggestions[activeSuggestion].label);
										}
										if (event.key === "Escape") {
											setShowSuggestions(false);
											setActiveSuggestion(-1);
										}
									},
									placeholder,
									"aria-label": eyebrow,
									"aria-expanded": showSuggestions && visibleSuggestions.length > 0,
									"aria-haspopup": "listbox"
								}), showSuggestions && visibleSuggestions.length > 0 && /* @__PURE__ */ jsxs("div", {
									className: "bif__suggest",
									role: "listbox",
									"aria-label": `${kind} suggestions`,
									children: [/* @__PURE__ */ jsxs("div", {
										className: "bif__suggest-head",
										children: [/* @__PURE__ */ jsxs("span", { children: ["Suggested ", kind === "brand" ? "brands" : "products"] }), /* @__PURE__ */ jsx("span", { children: visibleSuggestions.length })]
									}), /* @__PURE__ */ jsx("div", {
										className: "bif__suggest-list",
										children: visibleSuggestions.map((suggestion, index) => /* @__PURE__ */ jsx("button", {
											type: "button",
											className: `bif__suggest-item${index === activeSuggestion ? " is-active" : ""}`,
											onMouseEnter: () => setActiveSuggestion(index),
											onMouseDown: (event) => event.preventDefault(),
											onClick: () => applySuggestion(suggestion.label),
											children: /* @__PURE__ */ jsxs("span", {
												className: "bif__suggest-copy",
												children: [/* @__PURE__ */ jsx("strong", { children: suggestion.label }), suggestion.sector && /* @__PURE__ */ jsx("em", { children: suggestion.sector })]
											})
										}, `${suggestion.type}-${suggestion.id}`))
									})]
								})]
							})]
						}), /* @__PURE__ */ jsxs("button", {
							type: "submit",
							className: "bif__cta",
							disabled: !subject.trim(),
							children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }), " Find breakouts"]
						})]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "bif__hint",
						children: [
							hint,
							" Try ",
							/* @__PURE__ */ jsxs("b", { children: [
								"\"",
								sample,
								"\""
							] }),
							searchLimit > 0 && /* @__PURE__ */ jsxs(Fragment$1, { children: [
								" · ",
								searchLeft,
								" of ",
								searchLimit,
								" searches left this cycle"
							] })
						]
					})
				] }),
				showFlowBar && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
					className: "flowbar",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flowbar__head",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "subject",
							children: [/* @__PURE__ */ jsx("b", { children: subject }), /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "edit",
								title: "Change subject",
								onClick: () => {
									collapse();
									setTimeout(() => inputRef.current?.focus(), 0);
								},
								children: /* @__PURE__ */ jsxs("svg", {
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									strokeLinecap: "round",
									strokeLinejoin: "round",
									children: [/* @__PURE__ */ jsx("path", { d: "M12 20h9" }), /* @__PURE__ */ jsx("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" })]
								})
							})]
						}), state !== "running" && state !== "done" && /* @__PURE__ */ jsx("button", {
							className: "cancel",
							title: "Cancel",
							onClick: collapse,
							children: /* @__PURE__ */ jsx(Close, { className: "h-4 w-4" })
						})]
					}), /* @__PURE__ */ jsx(MiniStepper, { current: state })]
				}), /* @__PURE__ */ jsx("div", { className: "divide" })] }),
				state === "keywords" && /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs("div", {
						className: "ph ph__row",
						children: [/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("p", {
								className: "ph__k",
								children: "Expand"
							}),
							/* @__PURE__ */ jsx("h3", { children: "Widen the pull" }),
							/* @__PURE__ */ jsxs("p", {
								className: "sub",
								children: [
									"Terms people actually pair with ",
									subject,
									" on TikTok."
								]
							})
						] }), /* @__PURE__ */ jsxs("button", {
							type: "button",
							className: "btn btn--g btn--sm",
							onClick: regenerate,
							disabled: expanding,
							children: [
								/* @__PURE__ */ jsx(Refresh, { className: "h-4 w-4" }),
								" ",
								expanding ? "Loading…" : "Regenerate"
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "chips",
						children: [keywords.map((k) => /* @__PURE__ */ jsxs("button", {
							type: "button",
							className: `kw${k.selected ? " on" : ""}`,
							onClick: () => toggleKeyword(k.label),
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "kw__c",
									children: /* @__PURE__ */ jsx("svg", {
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "3.4",
										strokeLinecap: "round",
										strokeLinejoin: "round",
										children: /* @__PURE__ */ jsx("path", { d: "m5 13 4 4L19 7" })
									})
								}),
								k.label,
								k.source === "yours" && /* @__PURE__ */ jsx("span", {
									className: "kw__tag",
									children: "yours"
								})
							]
						}, k.label)), /* @__PURE__ */ jsxs("span", {
							className: "kw--input",
							children: [/* @__PURE__ */ jsx("input", {
								type: "text",
								value: addKeyword,
								onChange: (e) => setAddKeyword(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addOwnKeyword();
									}
								},
								placeholder: "Add your own",
								"aria-label": "Add your own keyword"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: addOwnKeyword,
								title: "Add",
								children: /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" })
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "khint",
						children: [/* @__PURE__ */ jsx("b", { children: kwCount }), " selected · each keyword widens the same single search."]
					}),
					error && /* @__PURE__ */ jsx("div", {
						className: "bif__err",
						children: error
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "biffoot",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g",
							onClick: collapse,
							children: "Cancel"
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							className: "btn btn--y",
							onClick: checkAndConfirmSearch,
							disabled: kwCount === 0 || submitting,
							children: [
								submitting ? "Starting…" : "Run the search",
								" ",
								/* @__PURE__ */ jsx(Arrow, {})
							]
						})]
					})
				] }),
				state === "running" && /* @__PURE__ */ jsxs("div", {
					className: "run",
					children: [
						/* @__PURE__ */ jsx("div", { className: "run__ring" }),
						/* @__PURE__ */ jsxs("h3", { children: ["Scanning TikTok for ", subject] }),
						/* @__PURE__ */ jsxs("p", {
							className: "sub",
							children: [
								"Widening with ",
								kwCount,
								" keyword",
								kwCount === 1 ? "" : "s",
								" · weekly schedule"
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "pbar",
							children: /* @__PURE__ */ jsx("div", {
								className: "pbar__f",
								style: { width: pFillWidth }
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "stages",
							children: STAGE_LIST.map((s, i) => {
								return /* @__PURE__ */ jsxs("div", {
									className: `stg ${runDone || i < runIdx ? "done" : i === runIdx ? "now" : ""}`.trim(),
									children: [/* @__PURE__ */ jsx("span", {
										className: "stg__i",
										children: /* @__PURE__ */ jsx("svg", {
											viewBox: "0 0 24 24",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "3.4",
											strokeLinecap: "round",
											strokeLinejoin: "round",
											children: /* @__PURE__ */ jsx("path", { d: "m5 13 4 4L19 7" })
										})
									}), s.label]
								}, s.key);
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "run__note",
							children: ["Email me when it's ready", /* @__PURE__ */ jsx("button", {
								type: "button",
								className: `sw${emailWhenReady ? " on" : ""}`,
								onClick: () => setEmailWhenReady((v) => !v),
								"aria-pressed": emailWhenReady,
								"aria-label": "Toggle email notification"
							})]
						})
					]
				}),
				state === "done" && searchResult && /* @__PURE__ */ jsxs("div", {
					className: "done",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "done__c",
							children: /* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "3",
								strokeLinecap: "round",
								strokeLinejoin: "round",
								children: /* @__PURE__ */ jsx("path", { d: "m5 13 4 4L19 7" })
							})
						}),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("h3", { children: [searchResult.name || subject, " is ready"] }), /* @__PURE__ */ jsxs("p", { children: [
							searchResult.outlier_count ?? 0,
							" breakout",
							(searchResult.outlier_count ?? 0) === 1 ? "" : "s",
							" this week",
							searchResult.top_score ? ` · top score ${Math.round(searchResult.top_score)}×` : "",
							searchResult.result_count != null ? ` · ${searchResult.result_count} videos scanned` : ""
						] })] }),
						/* @__PURE__ */ jsxs("div", {
							className: "done__r",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "btn btn--g",
								onClick: collapse,
								children: "Start another"
							}), /* @__PURE__ */ jsxs("button", {
								type: "button",
								className: "btn btn--y",
								onClick: viewResults,
								children: ["View results ", /* @__PURE__ */ jsx(Arrow, {})]
							})]
						})
					]
				})
			]
		}),
		duplicateSearch && /* @__PURE__ */ jsx(DuplicateSearchModal, {
			search: duplicateSearch.search,
			newKeywords: duplicateSearch.newKeywords,
			busy: submitting,
			onCancel: () => setDuplicateSearch(null),
			onRefresh: () => {
				setDuplicateSearch(null);
				startSearch(true);
			}
		}),
		confirmRefresh !== null && /* @__PURE__ */ jsx(SearchCreditConfirmModal, {
			body: searchLimit === -1 ? "Your plan includes unlimited searches, so this run won’t use up a search credit." : `This will use 1 search credit, leaving you ${Math.max(0, Number(searchLeft ?? 0) - 1)} this cycle.`,
			subject,
			busy: submitting,
			onCancel: () => setConfirmRefresh(null),
			onConfirm: () => {
				const refreshExisting = confirmRefresh;
				setConfirmRefresh(null);
				startSearch(refreshExisting);
			}
		})
	] });
}
//#endregion
//#region resources/js/Pages/SavedSearches/detail/tiktokPlayer.js
function detectPlatform(video = {}) {
	if (String(video.social_media_source || "").toLowerCase() === "tiktok") return "tiktok";
	return [
		video.embedUrl,
		video.postUrl,
		video.videoUrl,
		video.embed_url,
		video.post_url,
		video.video_url
	].filter(Boolean).map((value) => String(value).toLowerCase()).some((value) => value.includes("tiktok.com")) ? "tiktok" : null;
}
function buildTikTokPlayerUrl(videoId, autoplay = false) {
	if (!videoId) return null;
	const url = new URL(`https://www.tiktok.com/player/v1/${videoId}`);
	url.searchParams.set("autoplay", autoplay ? "1" : "0");
	url.searchParams.set("controls", "1");
	url.searchParams.set("progress_bar", "0");
	url.searchParams.set("play_button", "1");
	url.searchParams.set("volume_control", "1");
	url.searchParams.set("fullscreen_button", "0");
	url.searchParams.set("timestamp", "0");
	url.searchParams.set("music_info", "0");
	url.searchParams.set("description", "0");
	url.searchParams.set("rel", "0");
	url.searchParams.set("native_context_menu", "0");
	url.searchParams.set("closed_caption", "0");
	url.searchParams.set("muted", "0");
	return url.toString();
}
function withTikTokAutoplay(url, autoplay) {
	if (!url) return null;
	try {
		const next = new URL(url);
		next.searchParams.set("autoplay", autoplay ? "1" : "0");
		return next.toString();
	} catch {
		return url;
	}
}
function previewImageFor(video = {}) {
	return video.thumbnailUrl || video.thumbnail_url || video.cover || null;
}
function isDashboardPlayable(video = {}) {
	const platform = detectPlatform(video);
	const videoId = video.videoId || video.video_id;
	if (platform === "tiktok") return Boolean(videoId);
	return Boolean(video.embedUrl || video.embed_url || video.postUrl || video.post_url);
}
function playerKindFor(video = {}) {
	return detectPlatform(video) === "tiktok" ? "tiktok" : "iframe";
}
function playerUrlFor(video = {}, autoplay = false) {
	const platform = detectPlatform(video);
	const videoId = video.videoId || video.video_id;
	if (platform === "tiktok" && videoId) return buildTikTokPlayerUrl(videoId, autoplay);
	if (platform === "tiktok") return null;
	return video.player_url || video.embedUrl || video.embed_url || null;
}
function targetOriginFor(iframe) {
	try {
		const origin = new URL(iframe?.src || "").origin;
		return origin && origin !== "null" ? origin : "*";
	} catch {
		return "*";
	}
}
function postTikTokMessage(iframe, type) {
	if (!iframe?.contentWindow) return;
	iframe.contentWindow.postMessage({
		"x-tiktok-player": true,
		type
	}, targetOriginFor(iframe));
}
function stopAndResetTikTokPlayer(shell) {
	if (!shell) return;
	const iframe = shell.querySelector("[data-player-frame]");
	const poster = shell.querySelector("[data-player-poster]");
	const overlay = shell.querySelector("[data-player-overlay]");
	const play = shell.querySelector("[data-player-play]");
	const close = shell.querySelector("[data-player-close]");
	const container = shell.querySelector("[data-player-container]");
	if (shell.dataset.playerKind === "tiktok" && iframe) {
		postTikTokMessage(iframe, "pause");
		postTikTokMessage(iframe, "mute");
	}
	delete shell.dataset.playerWantsAudible;
	shell.dataset.playerActive = "false";
	if (container) container.hidden = true;
	if (close) close.hidden = true;
	if (poster) poster.hidden = false;
	if (overlay) overlay.hidden = false;
	if (play) play.hidden = false;
	if (iframe) iframe.src = "about:blank";
}
function activateTikTokPlayer(shell) {
	if (!shell) return;
	const iframe = shell.querySelector("[data-player-frame]");
	const poster = shell.querySelector("[data-player-poster]");
	const overlay = shell.querySelector("[data-player-overlay]");
	const play = shell.querySelector("[data-player-play]");
	const close = shell.querySelector("[data-player-close]");
	const container = shell.querySelector("[data-player-container]");
	const playerSrc = shell.dataset.playerSrc;
	if (!iframe || !playerSrc) return;
	document.querySelectorAll("[data-video-player-shell][data-player-active=\"true\"]").forEach((other) => {
		if (other !== shell) stopAndResetTikTokPlayer(other);
	});
	shell.dataset.playerActive = "true";
	shell.dataset.playerWantsAudible = "true";
	if (poster) poster.hidden = true;
	if (overlay) overlay.hidden = true;
	if (play) play.hidden = true;
	if (container) container.hidden = false;
	if (close) close.hidden = false;
	const nextSrc = shell.dataset.playerKind === "tiktok" ? withTikTokAutoplay(playerSrc, true) : playerSrc;
	if (!iframe.src || iframe.src === "about:blank") iframe.src = nextSrc;
	if (shell.dataset.playerKind === "tiktok") {
		postTikTokMessage(iframe, "unMute");
		postTikTokMessage(iframe, "play");
	}
}
//#endregion
//#region resources/js/Pages/components/BreakoutVideoCard.jsx
var BreakoutVideoCard_exports = /* @__PURE__ */ __exportAll({
	AnalyzeStateButton: () => AnalyzeStateButton,
	VideoFrame: () => VideoFrame,
	breakoutScore: () => breakoutScore$1,
	compact: () => compact,
	default: () => BreakoutVideoCard,
	formatDate: () => formatDate$3,
	formatDuration: () => formatDuration$2,
	gradientFor: () => gradientFor
});
/**
* The one breakout video card. The results page, the saved-videos library and
* the analysis modal all render this so a video looks the same wherever it is
* shown. Styles live in app.css under "breakout video card" so every surface
* picks them up without importing anything.
*
* Analyze and bookmark are opt-in: a surface that cannot spend analysis credits
* simply omits `onAnalyze`, and the action row collapses to what it can do.
*/
var Icons$3 = {
	Play: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: /* @__PURE__ */ jsx("path", { d: "M8 5v14l11-7z" })
	}),
	Spark: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: /* @__PURE__ */ jsx("path", { d: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" })
	}),
	Eye: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" }), /* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "12",
			r: "3"
		})]
	}),
	Heart: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" })
	}),
	Comment: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
	}),
	Share: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ jsx("path", { d: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" }),
			/* @__PURE__ */ jsx("path", { d: "m16 6-4-4-4 4" }),
			/* @__PURE__ */ jsx("path", { d: "M12 2v14" })
		]
	}),
	ExtLink: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M7 17 17 7M8 7h9v9" })
	}),
	Bookmark: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: /* @__PURE__ */ jsx("path", { d: "M6 3h12v18l-6-4.5L6 21z" })
	}),
	BookmarkO: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M6 3h12v18l-6-4.5L6 21z" })
	})
};
function compact(n) {
	if (n == null || Number.isNaN(n)) return "—";
	if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
	if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`;
	return String(Math.round(n));
}
function breakoutScore$1(video) {
	const value = Number(video?.score ?? video?.viral_score ?? video?.virality_score ?? 0);
	return Number.isFinite(value) && value > 0 ? value : 0;
}
function formatDate$3(iso) {
	if (!iso) return null;
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function formatDuration$2(seconds) {
	if (seconds == null || Number.isNaN(seconds)) return null;
	const s = Math.round(seconds);
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function gradientFor(id) {
	const palettes = [
		"linear-gradient(150deg,#ffd6a6,#ff9a8f 55%,#c07a9a)",
		"linear-gradient(150deg,#d8c0ff,#a88fff 55%,#7a9ac0)",
		"linear-gradient(150deg,#c8f0d8,#7ad0a0 55%,#5aa0c0)",
		"linear-gradient(150deg,#a6d8ff,#7aa8ff 55%,#8f7aff)",
		"linear-gradient(150deg,#ffe0a6,#ffbf8f 55%,#c0907a)",
		"linear-gradient(150deg,#ffc0d8,#ff8fb0 55%,#c07a9a)",
		"linear-gradient(150deg,#e0d0ff,#b0a0ff 55%,#8f7aff)",
		"linear-gradient(150deg,#ffd27a,#ff9a5a 60%,#c0607a)"
	];
	let h = 0;
	const s = String(id || "");
	for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) >>> 0;
	return palettes[h % palettes.length];
}
function analysisCtaLabel(analysis) {
	if (analysis?.status === "processing") return "Analyzing video...";
	if (analysis?.status === "complete") return "View analysis";
	if (analysis?.status === "failed") return "Retry analysis";
	return "Analyze video";
}
function AnalyzeStateButton({ analysis, onClick, small = false }) {
	const status = analysis?.status ?? "idle";
	const isProcessing = status === "processing";
	const isComplete = status === "complete";
	const stateClass = isProcessing ? "rs-analyze--busy" : isComplete ? "rs-analyze--done" : "rs-analyze--ready";
	const desktopLabel = analysisCtaLabel(analysis);
	const mobileLabel = desktopLabel === "Analyze video" ? "Analyze" : desktopLabel;
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		className: `rs-analyze ${stateClass}${small ? " rs-analyze--sm" : ""}`,
		onClick,
		"aria-busy": isProcessing,
		disabled: isProcessing,
		children: isProcessing ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__ring",
				"aria-hidden": true
			}),
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__label rs-analyze__label--desktop",
				children: desktopLabel
			}),
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__label rs-analyze__label--mobile",
				children: mobileLabel
			})
		] }) : isComplete ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__badge",
				"aria-hidden": true,
				children: "✓"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__label rs-analyze__label--desktop",
				children: desktopLabel
			}),
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__label rs-analyze__label--mobile",
				children: mobileLabel
			}),
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__chev",
				"aria-hidden": true,
				children: "→"
			})
		] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__icon",
				"aria-hidden": true,
				children: Icons$3.Spark
			}),
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__label rs-analyze__label--desktop",
				children: desktopLabel
			}),
			/* @__PURE__ */ jsx("span", {
				className: "rs-analyze__label rs-analyze__label--mobile",
				children: mobileLabel
			})
		] })
	});
}
function VideoFrame({ video, winner = false, leading = false, showStats = true, isPlaying, onTogglePlay }) {
	const bg = video.thumbnail_url ? void 0 : gradientFor(video.id ?? video.handle);
	const playerUrl = playerUrlFor(video, true);
	const [playerReady, setPlayerReady] = useState(false);
	const iframeRef = useRef(null);
	useEffect(() => {
		setPlayerReady(false);
	}, [isPlaying, playerUrl]);
	useEffect(() => {
		const iframe = iframeRef.current;
		if (!isPlaying || !iframe || !video?.video_id) return void 0;
		const unmuteAndPlay = () => {
			postTikTokMessage(iframe, "unMute");
			postTikTokMessage(iframe, "play");
		};
		const handleReady = (event) => {
			const payload = event?.data;
			if (!payload || payload["x-tiktok-player"] !== true || payload.type !== "onPlayerReady") return;
			if (event.source !== iframe.contentWindow) return;
			unmuteAndPlay();
		};
		iframe.addEventListener("load", unmuteAndPlay);
		window.addEventListener("message", handleReady);
		return () => {
			iframe.removeEventListener("load", unmuteAndPlay);
			window.removeEventListener("message", handleReady);
		};
	}, [isPlaying, video?.video_id]);
	return /* @__PURE__ */ jsxs("div", {
		className: `rs-vf${isPlaying ? " playing" : ""}${winner ? " rs-vf--big" : ""}`,
		children: [
			!isPlaying && (video.thumbnail_url ? /* @__PURE__ */ jsx("img", {
				className: "rs-vf__img",
				src: video.thumbnail_url,
				alt: "",
				loading: "lazy"
			}) : /* @__PURE__ */ jsx("div", {
				className: "rs-vf__img",
				style: { background: bg }
			})),
			isPlaying && playerUrl && /* @__PURE__ */ jsx("iframe", {
				ref: iframeRef,
				className: "rs-vf__player",
				src: playerUrl,
				title: video.title ? `Video: ${video.title}` : "Video preview",
				allow: "autoplay; encrypted-media; fullscreen",
				allowFullScreen: true,
				onLoad: () => setPlayerReady(true)
			}),
			!isPlaying && /* @__PURE__ */ jsx("div", { className: "rs-vf__scrim" }),
			winner ? /* @__PURE__ */ jsx("span", {
				className: `rs-vf__win${leading ? " rs-vf__win--lead" : ""}`,
				children: leading ? "Leading so far" : /* @__PURE__ */ jsxs(Fragment$1, { children: [Icons$3.Spark, "Winner"] })
			}) : video.rank != null && /* @__PURE__ */ jsx("span", {
				className: "rs-vf__rank",
				children: video.rank
			}),
			video.duration != null && /* @__PURE__ */ jsx("span", {
				className: "rs-vf__dur",
				children: formatDuration$2(video.duration)
			}),
			!isPlaying && /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "rs-vf__play-target",
				onClick: onTogglePlay,
				"aria-label": "Play",
				children: /* @__PURE__ */ jsx("span", {
					className: "rs-vf__play",
					children: Icons$3.Play
				})
			}),
			isPlaying && playerUrl && !playerReady && /* @__PURE__ */ jsx("span", {
				className: "rs-vf__loading",
				children: "Loading video…"
			}),
			isPlaying && /* @__PURE__ */ jsx("button", {
				className: "rs-vf__close",
				onClick: onTogglePlay,
				"aria-label": "Close video preview",
				children: "×"
			}),
			showStats && /* @__PURE__ */ jsxs("div", {
				className: "rs-vf__stats",
				"aria-hidden": Boolean(isPlaying),
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rs-ovchip rs-ovchip--out",
					children: [/* @__PURE__ */ jsx("div", {
						className: "rs-ovchip__l",
						children: "Breakout Score"
					}), /* @__PURE__ */ jsxs("div", {
						className: "rs-ovchip__n",
						children: [compact(breakoutScore$1(video)), "×"]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rs-ovchip rs-ovchip--views",
					children: [/* @__PURE__ */ jsx("div", {
						className: "rs-ovchip__l",
						children: "Views"
					}), /* @__PURE__ */ jsx("div", {
						className: "rs-ovchip__n",
						children: compact(video.views)
					})]
				})]
			})
		]
	});
}
function BreakoutVideoCard({ video, runBucket = "old", onAnalyze, onToggleBookmark, bookmarking = false, isPlaying, onTogglePlay, showActions = true }) {
	const [selfPlaying, setSelfPlaying] = useState(false);
	const controlled = typeof onTogglePlay === "function";
	const playing = controlled ? isPlaying : selfPlaying;
	const togglePlay = controlled ? onTogglePlay : () => setSelfPlaying((cur) => !cur);
	const postedAt = video.uploaded_at ? formatDate$3(video.uploaded_at) : video.posted_at ? formatDate$3(video.posted_at) : "";
	return /* @__PURE__ */ jsxs("article", {
		className: `rs-oc rs-oc--run-${runBucket}`,
		children: [/* @__PURE__ */ jsx(VideoFrame, {
			video,
			isPlaying: playing,
			onTogglePlay: togglePlay
		}), /* @__PURE__ */ jsxs("div", {
			className: "rs-oc__b",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "rs-oc__cr",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "rs-av rs-av--sm",
							style: { background: gradientFor(video.handle ?? video.id) }
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rs-oc__copy",
							children: [/* @__PURE__ */ jsx("div", {
								className: "rs-oc__h",
								children: video.handle || video.username || "—"
							}), Number(video.followers ?? 0) > 0 && /* @__PURE__ */ jsxs("div", {
								className: "rs-oc__f",
								children: [compact(video.followers), " followers"]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "rs-oc__s",
							children: postedAt
						})
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "rs-oc__c",
					children: video.title || video.caption
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-oc__st",
					children: [
						/* @__PURE__ */ jsxs("span", { children: [Icons$3.Eye, compact(video.views)] }),
						/* @__PURE__ */ jsxs("span", { children: [Icons$3.Heart, compact(video.likes)] }),
						/* @__PURE__ */ jsxs("span", { children: [Icons$3.Comment, compact(video.comments)] }),
						/* @__PURE__ */ jsxs("span", { children: [Icons$3.Share, compact(video.shares)] })
					]
				}),
				showActions && /* @__PURE__ */ jsxs("div", {
					className: "rs-oc__an",
					children: [
						onAnalyze ? /* @__PURE__ */ jsx(AnalyzeStateButton, {
							analysis: video.analysis,
							onClick: onAnalyze,
							small: true
						}) : /* @__PURE__ */ jsx("span", {}),
						video.post_url && /* @__PURE__ */ jsx("a", {
							className: "rs-ic2",
							href: video.post_url,
							target: "_blank",
							rel: "noopener noreferrer",
							title: "Open in TikTok",
							"aria-label": "Open in TikTok",
							children: Icons$3.ExtLink
						}),
						onToggleBookmark && /* @__PURE__ */ jsx("button", {
							className: `rs-ic2${video.bookmarked ? " on" : ""}`,
							title: video.bookmarked ? "Remove from bookmarks" : "Save video",
							"aria-label": video.bookmarked ? "Remove from bookmarks" : "Save video",
							onClick: onToggleBookmark,
							disabled: bookmarking,
							children: video.bookmarked ? Icons$3.Bookmark : Icons$3.BookmarkO
						})
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
	competitor: "Brand",
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
	const inner = /* @__PURE__ */ jsxs(Fragment$1, { children: [
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
		actions ?? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
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
		href: search.url ?? `/library/${search.id}`,
		children: inner
	});
}
//#endregion
//#region resources/js/Pages/utils/navigation.js
function withReturnTo(url, from) {
	const target = String(url || "").trim();
	const origin = String(from || "").trim();
	if (!target || !origin) return target;
	return `${target}${target.includes("?") ? "&" : "?"}from=${encodeURIComponent(origin)}`;
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
		moversNote: "Best breakout across every brand you track.",
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
		moversNote: "Best breakout across every product you track.",
		allHeading: "All product searches",
		filterPlaceholder: "Filter products"
	}
};
var SORT = {
	outliers: "Most breakouts",
	top_score: "Top score",
	recent: "Recently updated",
	az: "Name A-Z"
};
var SEARCH_PAGE_SIZE = 25;
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
function cardIdentity(search) {
	const title = String(search.name || search.phrase || "Untitled search").trim();
	const phrase = String(search.phrase || "").trim();
	const sameAsTitle = title.localeCompare(phrase, void 0, { sensitivity: "base" }) === 0;
	if (phrase && !sameAsTitle) return {
		title,
		context: `Searching “${phrase}”`
	};
	const cadence = search.frequency === "monthly" ? "Monthly refresh" : "Weekly refresh";
	const keywordCount = Array.isArray(search.keywords) ? search.keywords.length : 0;
	return {
		title,
		context: `${cadence} · ${keywordCount > 0 ? `${keywordCount} keyword${keywordCount === 1 ? "" : "s"}` : "Focused tracking"}`
	};
}
function BrandCard({ search, onOpen, onEdit }) {
	const status = STATUS[search.status] ?? {
		label: "Ready",
		cls: "pill--off"
	};
	const identity = cardIdentity(search);
	const initials = identity.title.slice(0, 2).toUpperCase();
	const topScore = Number(search.top_score) > 0 ? `${Math.round(search.top_score)}x` : "—";
	const videosScanned = search.videos_scanned != null ? compact(search.videos_scanned) : "0";
	const latestOutliers = search.latest_outlier_count != null ? compact(search.latest_outlier_count) : "0";
	const averageVideoViews = Number(search.average_video_views) > 0 ? compact(search.average_video_views) : "—";
	return /* @__PURE__ */ jsxs("div", {
		className: "bcard",
		role: "button",
		tabIndex: 0,
		onClick: onOpen,
		onKeyDown: (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onOpen();
			}
		},
		style: { cursor: "pointer" },
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
							children: identity.title
						}), /* @__PURE__ */ jsx("span", {
							className: "bcard__h",
							children: identity.context
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
						children: videosScanned
					}), /* @__PURE__ */ jsx("span", {
						className: "bcard__l",
						children: "videos scanned"
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "bcard__v",
						children: latestOutliers
					}), /* @__PURE__ */ jsx("span", {
						className: "bcard__l",
						children: "new breakouts"
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "bcard__v",
						children: topScore
					}), /* @__PURE__ */ jsx("span", {
						className: "bcard__l",
						children: "top breakout video"
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
						className: "bcard__v",
						children: averageVideoViews
					}), /* @__PURE__ */ jsx("span", {
						className: "bcard__l",
						children: "avg video views"
					})] })
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "bcard__foot",
				children: [/* @__PURE__ */ jsxs("span", { children: ["Updated ", formatDate$2(search.last_run_at)] }), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "btn btn--g btn--sm",
					onClick: (e) => {
						e.preventDefault();
						e.stopPropagation();
						onEdit();
					},
					children: "Edit details"
				})]
			})
		]
	});
}
function SearchListScreen({ kind = "brand", searches = [], moving = [], suggestions = [], prefillQuery = "" }) {
	const copy = COPY[kind] ?? COPY.brand;
	const { billing = {} } = usePage().props;
	const currentPath = typeof window === "undefined" ? kind === "product" ? "/products" : "/brands" : `${window.location.pathname}${window.location.search}`;
	const [searchList, setSearchList] = useState(searches);
	useEffect(() => setSearchList(searches), [searches]);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortBy, setSortBy] = useState("recent");
	const [page, setPage] = useState(1);
	const [modalSearch, setModalSearch] = useState(null);
	const [formState, setFormState] = useState({
		name: "",
		frequency: "weekly",
		type: "brand"
	});
	const [submitting, setSubmitting] = useState(false);
	const [prefillSubject, setPrefillSubject] = useState(prefillQuery);
	const [prefillNonce, setPrefillNonce] = useState(prefillQuery ? 1 : 0);
	billing.searchCreditsRemaining;
	billing.searchCreditsLimit;
	useMemo(() => suggestions.slice(0, 5), [suggestions]);
	const suggestedToTrack = useMemo(() => suggestions.slice(0, 4), [suggestions]);
	const seedInlineFlow = (value) => {
		const nextSubject = value.trim().replace(/\s+/g, " ");
		if (!nextSubject) return;
		setPrefillSubject(nextSubject);
		setPrefillNonce((current) => current + 1);
	};
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		const next = searchList.filter((s) => {
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
		searchList,
		query,
		statusFilter,
		sortBy
	]);
	useEffect(() => {
		setPage(1);
	}, [filtered]);
	const pageCount = Math.max(1, Math.ceil(filtered.length / SEARCH_PAGE_SIZE));
	const currentPage = Math.min(page, pageCount);
	const pageStart = (currentPage - 1) * SEARCH_PAGE_SIZE;
	useEffect(() => {
		if (!modalSearch) return void 0;
		const onEsc = (e) => e.key === "Escape" && !submitting && setModalSearch(null);
		document.addEventListener("keydown", onEsc);
		return () => document.removeEventListener("keydown", onEsc);
	}, [modalSearch, submitting]);
	const openEdit = (search) => {
		setModalSearch(search);
		setFormState({
			name: search.name ?? "",
			frequency: search.frequency ?? "weekly",
			type: search.search_type === "product" ? "product" : "brand"
		});
	};
	const closeEdit = () => {
		if (submitting) return;
		setModalSearch(null);
	};
	const submitEdit = async () => {
		if (!modalSearch) return;
		setSubmitting(true);
		try {
			await savedSearch.update(modalSearch.id, {
				name: formState.name.trim(),
				frequency: formState.frequency,
				type: formState.type
			});
			setModalSearch(null);
			router.reload({
				only: [
					"searches",
					"moving",
					"suggestions"
				],
				preserveScroll: true
			});
		} finally {
			setSubmitting(false);
		}
	};
	return /* @__PURE__ */ jsxs(AppLayout, {
		width: "max-w-[1240px]",
		title: copy.title,
		subtitle: copy.subtitle,
		actions: /* @__PURE__ */ jsx(EntitlementsBar, {}),
		children: [
			/* @__PURE__ */ jsx(BrandInlineFlow, {
				kind,
				eyebrow: copy.heroEyebrow,
				placeholder: copy.placeholder,
				sample: copy.sample,
				hint: copy.heroHint,
				prefillSubject,
				prefillNonce,
				onCreated: (created) => setSearchList((current) => [{
					...created,
					search_type: kind
				}, ...current])
			}),
			moving.length > 0 && /* @__PURE__ */ jsxs("section", {
				className: "movers",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "movers__h",
					children: [/* @__PURE__ */ jsx("h2", { children: "Breakout videos this week" }), /* @__PURE__ */ jsx("span", {
						className: "note",
						children: copy.moversNote
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "movers__g",
					children: moving.map((v, i) => /* @__PURE__ */ jsxs(Link, {
						className: "mv",
						href: withReturnTo(v.url, currentPath) || "#",
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
			suggestedToTrack.length > 0 && /* @__PURE__ */ jsxs("section", {
				className: "sugg",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "movers__h",
					children: [/* @__PURE__ */ jsx("h2", { children: "Suggested to track" }), /* @__PURE__ */ jsx("span", {
						className: "note",
						children: kind === "product" ? "Products rising in the categories you already watch." : "Based on creator overlap with brands you already watch."
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "sugg__g",
					children: suggestedToTrack.map((s) => /* @__PURE__ */ jsxs("div", {
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
								onClick: () => seedInlineFlow(s.name),
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
							children: [searchList.length, " tracked"]
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
							/* @__PURE__ */ jsx("h2", { children: searchList.length === 0 ? `No ${kind} searches yet` : "Nothing matched" }),
							/* @__PURE__ */ jsx("p", {
								className: "muted",
								style: {
									maxWidth: 360,
									margin: "10px auto 0"
								},
								children: searchList.length === 0 ? `Start one above and it will track on its own schedule.` : "Try a different filter or sort."
							})
						]
					}) : /* @__PURE__ */ jsx("div", {
						className: "bgrid",
						children: filtered.slice(pageStart, pageStart + SEARCH_PAGE_SIZE).map((s) => /* @__PURE__ */ jsx(BrandCard, {
							search: s,
							onOpen: () => router.visit(withReturnTo(s.url ?? `/library/${s.id}`, currentPath)),
							onEdit: () => openEdit(s)
						}, s.id))
					}),
					filtered.length > 0 && /* @__PURE__ */ jsxs("div", {
						style: {
							marginTop: 20,
							textAlign: "center"
						},
						children: [/* @__PURE__ */ jsxs("p", {
							className: "note",
							role: "status",
							children: [
								"Showing ",
								pageStart + 1,
								"–",
								Math.min(pageStart + SEARCH_PAGE_SIZE, filtered.length),
								" of ",
								filtered.length,
								" searches"
							]
						}), pageCount > 1 && /* @__PURE__ */ jsxs("nav", {
							"aria-label": `${copy.title} pagination`,
							style: {
								paddingTop: 12,
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								gap: 12
							},
							children: [
								/* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--g btn--sm",
									disabled: currentPage === 1,
									onClick: () => setPage(currentPage - 1),
									children: "Previous"
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "note",
									children: [
										"Page ",
										currentPage,
										" of ",
										pageCount
									]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--g btn--sm",
									disabled: currentPage === pageCount,
									onClick: () => setPage(currentPage + 1),
									children: "Next"
								})
							]
						})]
					})
				]
			}),
			modalSearch && /* @__PURE__ */ jsx("div", {
				className: "bb",
				children: /* @__PURE__ */ jsxs("div", {
					className: "bb-modal",
					children: [/* @__PURE__ */ jsx("button", {
						className: "bb-modal__bg",
						"aria-label": "Close",
						onClick: closeEdit
					}), /* @__PURE__ */ jsxs("div", {
						className: "bb-modal__box",
						children: [
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
									children: modalSearch.keywords.map((keyword) => /* @__PURE__ */ jsx("span", {
										className: "chip",
										children: keyword
									}, keyword))
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
								children: [
									/* @__PURE__ */ jsx("label", {
										className: "lbl",
										htmlFor: "edit-search-type",
										children: "Type"
									}),
									/* @__PURE__ */ jsxs("select", {
										id: "edit-search-type",
										className: "fld",
										value: formState.type,
										onChange: (e) => setFormState((c) => ({
											...c,
											type: e.target.value
										})),
										children: [/* @__PURE__ */ jsx("option", {
											value: "brand",
											children: "Brand"
										}), /* @__PURE__ */ jsx("option", {
											value: "product",
											children: "Product"
										})]
									}),
									formState.type !== (modalSearch.search_type === "product" ? "product" : "brand") && /* @__PURE__ */ jsx("p", {
										className: "hint",
										style: { marginTop: 8 },
										children: "Your existing results stay — only how we tune keywords and insights changes going forward."
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								style: { marginTop: 20 },
								children: [/* @__PURE__ */ jsx("label", {
									className: "lbl",
									children: "Schedule"
								}), /* @__PURE__ */ jsx("output", {
									className: "btn btn--y btn--w",
									style: {
										cursor: "default",
										userSelect: "none"
									},
									children: formState.frequency === "monthly" ? "Monthly" : "Weekly"
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
									onClick: closeEdit,
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
						]
					})]
				})
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/Brands.jsx
var Brands_exports = /* @__PURE__ */ __exportAll({ default: () => Brands });
function Brands({ searches = [], moving = [], suggestions = [], prefillQuery = "" }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Brand searches · Brand Beacon" }), /* @__PURE__ */ jsx(SearchListScreen, {
		kind: "brand",
		searches,
		moving,
		suggestions,
		prefillQuery
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
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Coming Soon - Breakout Vault" }), /* @__PURE__ */ jsxs("div", {
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
						children: "Breakout Vault is getting its final polish. Leave your email and we'll notify you when the site is live so you can get early access."
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
								children: "Spot brand and product momentum"
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
		category: defaults.category ?? categories[0]?.value ?? "general",
		subject: defaults.subject ?? "",
		message: defaults.message ?? ""
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
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Contact Us - Breakout Vault" }), /* @__PURE__ */ jsx(AppLayout, {
		width: "max-w-5xl",
		children: /* @__PURE__ */ jsx(ContactFormCard, {
			categories,
			defaults
		})
	})] });
}
//#endregion
//#region resources/js/components/Seo.jsx
var BRAND_NAME = "Brand Beacon";
function buildStructuredData({ siteUrl, canonical, schema }) {
	if (!siteUrl || !schema) return null;
	const organizationId = `${siteUrl}/#organization`;
	const graph = [];
	if (schema.organization) graph.push({
		"@type": "Organization",
		"@id": organizationId,
		name: BRAND_NAME,
		url: siteUrl,
		logo: `${siteUrl}/brand-beacon-logo.png`,
		email: "hello@brandbeacon.com"
	});
	if (schema.webSite) graph.push({
		"@type": "WebSite",
		"@id": `${siteUrl}/#website`,
		name: BRAND_NAME,
		url: siteUrl,
		publisher: { "@id": organizationId }
	});
	if (schema.softwareApplication) graph.push({
		"@type": "SoftwareApplication",
		name: BRAND_NAME,
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web",
		url: canonical,
		description: schema.softwareApplication.description,
		provider: { "@id": organizationId }
	});
	const questions = Array.isArray(schema.faqs) ? schema.faqs : [];
	if (questions.length > 0) graph.push({
		"@type": "FAQPage",
		mainEntity: questions.map(({ q, a }) => ({
			"@type": "Question",
			name: q,
			acceptedAnswer: {
				"@type": "Answer",
				text: a
			}
		}))
	});
	if (graph.length === 0) return null;
	return JSON.stringify({
		"@context": "https://schema.org",
		"@graph": graph
	}).replace(/</g, "\\u003c");
}
function Seo({ title, description, noIndex = false, schema = null }) {
	const { app = {}, url = "/" } = usePage();
	const siteUrl = String(app.url ?? "").replace(/\/$/, "");
	const path = String(url).split("?")[0] || "/";
	const canonical = siteUrl ? new URL(path, `${siteUrl}/`).toString() : void 0;
	const robots = noIndex ? "noindex,follow" : "index,follow";
	const structuredData = buildStructuredData({
		siteUrl,
		canonical,
		schema
	});
	return /* @__PURE__ */ jsxs(Head, {
		title,
		children: [
			/* @__PURE__ */ jsx("meta", {
				"head-key": "description",
				name: "description",
				content: description
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "robots",
				name: "robots",
				content: robots
			}),
			canonical && /* @__PURE__ */ jsx("link", {
				"head-key": "canonical",
				rel: "canonical",
				href: canonical
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:type",
				property: "og:type",
				content: "website"
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:site_name",
				property: "og:site_name",
				content: BRAND_NAME
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:title",
				property: "og:title",
				content: title
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "og:description",
				property: "og:description",
				content: description
			}),
			canonical && /* @__PURE__ */ jsx("meta", {
				"head-key": "og:url",
				property: "og:url",
				content: canonical
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:card",
				name: "twitter:card",
				content: "summary"
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:title",
				name: "twitter:title",
				content: title
			}),
			/* @__PURE__ */ jsx("meta", {
				"head-key": "twitter:description",
				name: "twitter:description",
				content: description
			}),
			structuredData && /* @__PURE__ */ jsx("script", {
				"head-key": "structured-data",
				type: "application/ld+json",
				dangerouslySetInnerHTML: { __html: structuredData }
			})
		]
	});
}
//#endregion
//#region resources/js/Pages/LegalPage.jsx
var LegalPage_exports = /* @__PURE__ */ __exportAll({ default: () => LegalPage });
var descriptions = {
	"Privacy Policy": "Learn how Brand Beacon collects, uses, and protects information when you use our TikTok trend intelligence platform.",
	"Terms of Service": "Read the terms that govern use of Brand Beacon and its TikTok trend intelligence platform.",
	"Data Processing Addendum": "Review Brand Beacon's Data Processing Addendum for customer personal data processing.",
	Security: "Learn about the administrative, technical, and operational security practices used by Brand Beacon."
};
function LegalPage({ title, effectiveDate, sections }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Seo, {
			title: `${title} | Brand Beacon`,
			description: descriptions[title] ?? "Legal information for Brand Beacon."
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "bbh",
			children: [
				/* @__PURE__ */ jsx(Nav, {}),
				/* @__PURE__ */ jsxs("main", {
					className: "legal-page",
					children: [/* @__PURE__ */ jsx("section", {
						className: "legal-page__hero wrap",
						children: /* @__PURE__ */ jsx("div", {
							className: "legal-page__heroGrid",
							children: /* @__PURE__ */ jsxs("div", {
								className: "legal-page__heroCopy",
								children: [
									/* @__PURE__ */ jsx("p", {
										className: "legal-page__eyebrow",
										children: "Legal"
									}),
									/* @__PURE__ */ jsx("h1", { children: title }),
									/* @__PURE__ */ jsxs("p", {
										className: "legal-page__meta",
										children: ["Effective date: ", effectiveDate]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "legal-page__lede",
										children: "This document applies to Brand Beacon and the related websites, search tools, subscriptions, and analytics features we make available."
									})
								]
							})
						})
					}), /* @__PURE__ */ jsxs("section", {
						className: "legal-page__body wrap",
						children: [/* @__PURE__ */ jsx("div", {
							className: "legal-page__mobileJump",
							children: /* @__PURE__ */ jsxs("details", {
								className: "legal-page__mobileJumpCard",
								children: [/* @__PURE__ */ jsxs("summary", { children: [/* @__PURE__ */ jsxs("span", {
									className: "legal-page__mobileJumpCopy",
									children: [/* @__PURE__ */ jsx("em", { children: "Quick navigation" }), /* @__PURE__ */ jsx("b", { children: "Jump to a section" })]
								}), /* @__PURE__ */ jsx("strong", {
									"aria-hidden": "true",
									className: "legal-page__mobileJumpIcon",
									children: "⌄"
								})] }), /* @__PURE__ */ jsx("nav", {
									className: "legal-page__mobileJumpList",
									"aria-label": `${title} mobile sections`,
									children: sections.map((section, index) => /* @__PURE__ */ jsxs("a", {
										href: `#legal-section-${index + 1}`,
										children: [
											String(index + 1).padStart(2, "0"),
											" ",
											section.heading.replace(/^\d+\.\s*/, "")
										]
									}, `mobile-${section.heading}`))
								})]
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "legal-page__layout",
							children: [/* @__PURE__ */ jsx("aside", {
								className: "legal-page__toc",
								children: /* @__PURE__ */ jsxs("div", {
									className: "legal-page__tocCard",
									children: [/* @__PURE__ */ jsx("p", {
										className: "legal-page__tocLabel",
										children: "On this page"
									}), /* @__PURE__ */ jsx("nav", {
										className: "legal-page__tocList",
										"aria-label": `${title} sections`,
										children: sections.map((section, index) => /* @__PURE__ */ jsxs("a", {
											href: `#legal-section-${index + 1}`,
											children: [/* @__PURE__ */ jsx("span", { children: String(index + 1).padStart(2, "0") }), /* @__PURE__ */ jsx("strong", { children: section.heading.replace(/^\d+\.\s*/, "") })]
										}, section.heading))
									})]
								})
							}), /* @__PURE__ */ jsx("div", {
								className: "legal-page__card",
								children: sections.map((section, index) => /* @__PURE__ */ jsxs("section", {
									id: `legal-section-${index + 1}`,
									className: "legal-page__section",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "legal-page__sectionHead",
										children: [/* @__PURE__ */ jsx("span", {
											className: "legal-page__sectionNum",
											children: String(index + 1).padStart(2, "0")
										}), /* @__PURE__ */ jsx("h2", { children: section.heading.replace(/^\d+\.\s*/, "") })]
									}), section.paragraphs.map((paragraph, paragraphIndex) => /* @__PURE__ */ jsx("p", { children: paragraph }, `${section.heading}-${paragraphIndex}`))]
								}, section.heading))
							})]
						})]
					})]
				}),
				/* @__PURE__ */ jsx(Footer, {})
			]
		}),
		/* @__PURE__ */ jsx("style", { children: `
        .legal-page{
          background:
            radial-gradient(circle at top left, rgba(255, 217, 108, .22), transparent 28%),
            radial-gradient(circle at top right, rgba(201, 155, 62, .08), transparent 24%),
            linear-gradient(180deg, #fffdf8 0%, #f8f2e8 100%);
          min-height: calc(100vh - 72px);
          padding: 42px 20px 80px;
        }
        .legal-page__hero{max-width: 1120px}
        .legal-page__heroGrid{
          display:grid;
          grid-template-columns:minmax(0,1fr) 300px;
          gap:28px;
          align-items:end;
        }
        .legal-page__heroCopy{min-width:0}
        .legal-page__eyebrow{
          font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#a16d00
        }
        .legal-page__hero h1{
          margin-top:14px;font-size:clamp(2rem,4vw,3.5rem);line-height:1.02;letter-spacing:-.05em;color:#151515
        }
        .legal-page__meta{
          margin-top:14px;font-size:.92rem;font-weight:700;color:#7a6642
        }
        .legal-page__lede{
          max-width: 70ch;
          margin-top: 14px;
          font-size: 1rem;
          line-height: 1.75;
          color: #4f4638;
        }
        .legal-page__summary{
          padding:20px 22px;
          border:1px solid rgba(216, 193, 145, .8);
          border-radius:24px;
          background:linear-gradient(180deg, rgba(255,255,255,.86), rgba(255,247,226,.94));
          box-shadow:0 18px 36px -28px rgba(49,34,11,.25);
        }
        .legal-page__summaryLabel{
          font-size:.7rem;
          font-weight:800;
          letter-spacing:.14em;
          text-transform:uppercase;
          color:#a16d00;
        }
        .legal-page__summaryList{
          margin-top:14px;
          display:grid;
          gap:10px;
          padding:0;
          list-style:none;
        }
        .legal-page__summaryList li{
          font-size:.93rem;
          line-height:1.5;
          color:#4f4638;
          padding-left:16px;
          position:relative;
        }
        .legal-page__summaryList li::before{
          content:'';
          position:absolute;
          left:0;
          top:.62rem;
          width:6px;
          height:6px;
          border-radius:999px;
          background:#d39b22;
        }
        .legal-page__body{max-width: 1120px;margin-top: 30px}
        .legal-page__mobileJump{display:none}
        .legal-page__mobileJumpCard{
          border:1px solid #eadfca;
          border-radius:18px;
          background:rgba(255,255,255,.92);
          box-shadow:0 18px 36px -32px rgba(49,34,11,.28);
          overflow:hidden;
        }
        .legal-page__mobileJumpCard summary{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:16px 16px 15px;
          cursor:pointer;
          list-style:none;
        }
        .legal-page__mobileJumpCard summary::-webkit-details-marker{display:none}
        .legal-page__mobileJumpCopy{
          display:flex;
          flex-direction:column;
          gap:3px;
          min-width:0;
        }
        .legal-page__mobileJumpCopy em{
          font-style:normal;
          font-size:.66rem;
          font-weight:800;
          letter-spacing:.12em;
          text-transform:uppercase;
          color:#a16d00;
        }
        .legal-page__mobileJumpCopy b{
          font-size:.93rem;
          font-weight:800;
          color:#151515;
          letter-spacing:-.02em;
        }
        .legal-page__mobileJumpCard summary strong{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          width:30px;
          height:30px;
          border-radius:999px;
          background:#fff1c8;
          border:1px solid #efd9a1;
          font-size:1rem;
          font-weight:800;
          color:#8f6100;
          white-space:nowrap;
          transition:transform .18s ease, background .18s ease;
        }
        .legal-page__mobileJumpCard[open] .legal-page__mobileJumpIcon{transform:rotate(180deg)}
        .legal-page__mobileJumpList{
          display:grid;
          gap:4px;
          padding:0 10px 12px;
        }
        .legal-page__mobileJumpList a{
          padding:11px 12px;
          border-radius:14px;
          text-decoration:none;
          color:#4f4638;
          font-size:.86rem;
          line-height:1.45;
          font-weight:600;
          background:rgba(255,250,241,.72);
        }
        .legal-page__mobileJumpList a:hover{background:#fff5dc;color:#151515}
        .legal-page__layout{
          display:grid;
          grid-template-columns:260px minmax(0,1fr);
          gap:24px;
          align-items:start;
        }
        .legal-page__toc{
          position:sticky;
          top:96px;
        }
        .legal-page__tocCard{
          padding:18px 16px;
          border:1px solid #eadfca;
          border-radius:24px;
          background:rgba(255,255,255,.78);
          backdrop-filter:blur(8px);
          box-shadow:0 22px 44px -34px rgba(49,34,11,.24);
        }
        .legal-page__tocLabel{
          font-size:.7rem;
          font-weight:800;
          letter-spacing:.14em;
          text-transform:uppercase;
          color:#a16d00;
        }
        .legal-page__tocList{
          display:grid;
          gap:8px;
          margin-top:14px;
        }
        .legal-page__tocList a{
          display:grid;
          grid-template-columns:32px minmax(0,1fr);
          gap:10px;
          align-items:start;
          padding:10px 11px;
          border-radius:14px;
          text-decoration:none;
          color:#4f4638;
          transition:background .16s ease,color .16s ease,transform .16s ease;
        }
        .legal-page__tocList a:hover{
          background:#fff5dc;
          color:#151515;
          transform:translateX(2px);
        }
        .legal-page__tocList a span{
          font-size:.72rem;
          font-weight:800;
          color:#a16d00;
          padding-top:2px;
        }
        .legal-page__tocList a strong{
          font-size:.84rem;
          font-weight:700;
          line-height:1.4;
        }
        .legal-page__card{
          padding: 10px;
          border: 1px solid #eadfca;
          border-radius: 32px;
          background: rgba(255,255,255,.88);
          box-shadow: 0 30px 70px -42px rgba(49, 34, 11, .28);
        }
        .legal-page__section + .legal-page__section{
          margin-top: 12px;
        }
        .legal-page__section{
          padding:24px 22px 26px;
          border-radius:24px;
          background:linear-gradient(180deg, rgba(255,255,255,.96), rgba(255,251,243,.92));
        }
        .legal-page__sectionHead{
          display:flex;
          align-items:flex-start;
          gap:14px;
        }
        .legal-page__sectionNum{
          width:34px;
          height:34px;
          flex:none;
          display:grid;
          place-items:center;
          border-radius:12px;
          background:#fff2ce;
          color:#9a6700;
          font-size:.76rem;
          font-weight:800;
          letter-spacing:.04em;
        }
        .legal-page__section h2{
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -.03em;
          color: #151515;
          padding-top:4px;
        }
        .legal-page__section p{
          margin-top: 12px;
          font-size: .96rem;
          line-height: 1.78;
          color: #4f4638;
        }
        .legal-page__section a{color:#8a5b00;text-decoration:underline}
        html{scroll-behavior:smooth}
        @media (max-width: 980px){
          .legal-page__heroGrid,
          .legal-page__layout{grid-template-columns:minmax(0,1fr)}
          .legal-page__toc{position:static}
        }
        @media (max-width: 640px){
          .legal-page{padding: 20px 12px 48px}
          .legal-page__hero h1{font-size:clamp(1.7rem,8vw,2.4rem)}
          .legal-page__meta{margin-top:10px;font-size:.84rem}
          .legal-page__lede{margin-top:12px;font-size:.9rem;line-height:1.58}
          .legal-page__mobileJump{display:block;margin-bottom:14px}
          .legal-page__toc{display:none}
          .legal-page__mobileJumpCard{border-radius:20px}
          .legal-page__mobileJumpCard summary{padding:15px 14px 14px}
          .legal-page__mobileJumpCopy em{font-size:.62rem}
          .legal-page__mobileJumpCopy b{font-size:.9rem}
          .legal-page__mobileJumpCard summary strong{width:28px;height:28px;font-size:.95rem}
          .legal-page__mobileJumpList{padding:0 8px 10px}
          .legal-page__mobileJumpList a{padding:10px 11px;font-size:.83rem}
          .legal-page__card{padding: 8px;border-radius: 24px}
          .legal-page__section{padding:16px 14px 18px;border-radius:18px}
          .legal-page__section + .legal-page__section{margin-top:8px}
          .legal-page__sectionHead{gap:10px}
          .legal-page__sectionNum{width:30px;height:30px;border-radius:10px;font-size:.7rem}
          .legal-page__section h2{font-size:1rem;line-height:1.2}
          .legal-page__section p{font-size: .89rem;line-height: 1.6;margin-top:10px}
        }
      ` })
	] });
}
//#endregion
//#region resources/js/Pages/DataProcessingAddendum.jsx
var DataProcessingAddendum_exports = /* @__PURE__ */ __exportAll({ default: () => DataProcessingAddendum });
var sections$3 = [
	{
		heading: "1. Scope of This Addendum",
		paragraphs: ["This Data Processing Addendum applies when Brand Beacon processes personal data on behalf of a customer in connection with the services covered by our Terms of Service. It supplements those Terms and applies only to the extent Brand Beacon is acting as a processor or service provider for customer personal data.", "If there is any conflict between this Addendum and the Terms of Service regarding data-processing obligations, this Addendum controls to the extent of that conflict."]
	},
	{
		heading: "2. Roles of the Parties",
		paragraphs: ["The customer is the controller or business, and Brand Beacon is the processor or service provider, for customer personal data processed through the service on the customer’s behalf.", "Each party will comply with the obligations applicable to it under relevant data-protection laws."]
	},
	{
		heading: "3. Subject Matter and Duration",
		paragraphs: ["Brand Beacon processes customer personal data for the purpose of providing the service, including account administration, authentication, search operations, analytics delivery, support, billing administration, service security, troubleshooting, and related operational functions.", "Processing continues for the duration of the customer’s use of the service, plus any limited retention period reasonably required for legal compliance, security, backup integrity, dispute resolution, or other legitimate business needs."]
	},
	{
		heading: "4. Nature of Processing and Types of Data",
		paragraphs: ["Processing may include collection, organization, storage, retrieval, consultation, transmission, analysis, deletion, and other actions necessary to operate the service.", "Customer personal data may include account identifiers, contact information, billing-related metadata, support communications, saved searches, usage records, settings, and other information the customer or its authorized users submit to or generate through the service."]
	},
	{
		heading: "5. Customer Instructions",
		paragraphs: ["Brand Beacon will process customer personal data only on documented instructions from the customer, including as necessary to provide the service under the Terms of Service and this Addendum, unless otherwise required by applicable law.", "If Brand Beacon believes an instruction violates applicable law, it may notify the customer and suspend the affected processing until the issue is resolved."]
	},
	{
		heading: "6. Confidentiality and Personnel",
		paragraphs: ["Brand Beacon will ensure that personnel authorized to process customer personal data are subject to appropriate confidentiality obligations and access controls."]
	},
	{
		heading: "7. Security Measures",
		paragraphs: ["Brand Beacon will implement reasonable technical and organizational measures designed to protect customer personal data against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or unauthorized access.", "Those measures may include access restrictions, role-based permissions, authentication controls, logging, vendor security review, encrypted transmission, and other measures appropriate to the nature of the service."]
	},
	{
		heading: "8. Subprocessors",
		paragraphs: ["The customer authorizes Brand Beacon to use subprocessors that are reasonably necessary to provide the service, including providers supporting hosting, storage, authentication, billing, communications, monitoring, and operational infrastructure.", "Brand Beacon will remain responsible for the performance of its subprocessors to the extent required by applicable law and will impose data-protection obligations on subprocessors as appropriate for the services they provide."]
	},
	{
		heading: "9. Assistance with Data Subject Requests",
		paragraphs: ["Taking into account the nature of the processing, Brand Beacon will provide reasonable assistance to the customer in responding to requests from data subjects where the customer cannot address the request through the service itself."]
	},
	{
		heading: "10. Assistance with Compliance",
		paragraphs: ["Brand Beacon will provide reasonable information to help the customer meet obligations relating to security, breach notification, impact assessments, and consultations with regulators, to the extent required by applicable law and reasonably possible given the nature of the service."]
	},
	{
		heading: "11. Security Incident Notification",
		paragraphs: ["If Brand Beacon becomes aware of a confirmed security incident affecting customer personal data, Brand Beacon will notify the customer without undue delay and provide available information reasonably necessary to help the customer understand the incident and meet applicable notification obligations."]
	},
	{
		heading: "12. Return or Deletion of Data",
		paragraphs: ["Upon termination of the relevant services, Brand Beacon will delete or return customer personal data as required by applicable law and the Terms of Service, except where retention is required for legal, security, backup, accounting, or dispute-resolution purposes."]
	},
	{
		heading: "13. International Transfers",
		paragraphs: ["Customer personal data may be processed in jurisdictions outside the customer’s own jurisdiction where Brand Beacon or its subprocessors operate. Where required by applicable law, the parties will cooperate in implementing appropriate transfer mechanisms."]
	},
	{
		heading: "14. Contact",
		paragraphs: ["Questions regarding this Data Processing Addendum may be sent to hello@brandbeacon.com."]
	}
];
function DataProcessingAddendum() {
	return /* @__PURE__ */ jsx(LegalPage, {
		title: "Data Processing Addendum",
		effectiveDate: "August 29, 2026",
		sections: sections$3
	});
}
//#endregion
//#region resources/js/Pages/Errors/NotFound.jsx
var NotFound_exports = /* @__PURE__ */ __exportAll({ default: () => NotFound });
function NotFound() {
	return /* @__PURE__ */ jsxs("div", {
		className: "bb-not-found",
		children: [
			/* @__PURE__ */ jsx(Head, {
				title: "Page not found · Brand Beacon",
				children: /* @__PURE__ */ jsx("meta", {
					name: "robots",
					content: "noindex, nofollow"
				})
			}),
			/* @__PURE__ */ jsx("header", { children: /* @__PURE__ */ jsxs("a", {
				className: "bb-not-found__brand",
				href: "/",
				"aria-label": "Brand Beacon home",
				children: [/* @__PURE__ */ jsx("img", {
					src: "/brand-beacon-logo.svg",
					width: "32",
					height: "32",
					alt: ""
				}), /* @__PURE__ */ jsx("span", { children: "Brand Beacon" })]
			}) }),
			/* @__PURE__ */ jsx("main", { children: /* @__PURE__ */ jsxs("section", {
				"aria-labelledby": "not-found-title",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "bb-not-found__number",
						"aria-hidden": "true",
						children: ["404", /* @__PURE__ */ jsx("span", {})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "bb-not-found__label",
						children: "PAGE NOT FOUND"
					}),
					/* @__PURE__ */ jsx("h1", {
						id: "not-found-title",
						children: "This page is off the radar."
					}),
					/* @__PURE__ */ jsx("p", { children: "The link may have changed, or the page is no longer available. Let’s get you back to discovering what’s next." }),
					/* @__PURE__ */ jsxs("a", {
						className: "bb-not-found__button",
						href: "/",
						children: ["Back to homepage ", /* @__PURE__ */ jsx("span", {
							"aria-hidden": "true",
							children: "→"
						})]
					})
				]
			}) }),
			/* @__PURE__ */ jsx("footer", { children: "TikTok intelligence. A clearer signal." }),
			/* @__PURE__ */ jsx("style", { children: `
        .bb-not-found{min-height:100svh;display:flex;flex-direction:column;background:#f7f6f2;color:#171714;font-family:Figtree,Arial,sans-serif}
        .bb-not-found header{padding:28px clamp(24px,5vw,72px)}
        .bb-not-found__brand{display:inline-flex;align-items:center;gap:10px;font-weight:800;text-decoration:none;color:inherit}
        .bb-not-found main{flex:1;display:grid;place-items:center;padding:40px 24px 64px}
        .bb-not-found section{width:100%;max-width:560px;text-align:center}
        .bb-not-found__number{position:relative;display:inline-block;font-size:clamp(100px,20vw,160px);font-weight:900;letter-spacing:-.07em;line-height:1.1;isolation:isolate}
        .bb-not-found__number span{position:absolute;bottom:12px;left:0;right:-8px;height:28px;background:#ffcd29;z-index:-1;border-radius:4px}
        .bb-not-found__label{font-size:11px!important;font-weight:800;letter-spacing:.18em;margin:24px 0 14px!important;color:#78766e!important}
        .bb-not-found h1{font-size:clamp(26px,5vw,36px);font-weight:800;line-height:1.2;letter-spacing:-.035em;margin:0 0 16px}
        .bb-not-found section>p{max-width:420px;margin:0 auto;color:#67665d;font-size:16px;line-height:1.7}
        .bb-not-found__button{display:inline-flex;align-items:center;justify-content:center;gap:24px;min-height:48px;margin-top:30px;padding:12px 24px;border-radius:999px;background:#ffcd29;color:#171714;font-size:14px;font-weight:700;text-decoration:none;box-shadow:0 4px 12px #d5a40020}
        .bb-not-found__button:hover{background:#f4bf13}
        .bb-not-found a:focus-visible{outline:3px solid #171714;outline-offset:5px}
        .bb-not-found footer{text-align:center;padding:24px;color:#78766e;font-size:12px}
      ` })
		]
	});
}
//#endregion
//#region resources/js/Pages/VideoAnalysis/AnalysisModal.jsx
var AnalysisModal_exports = /* @__PURE__ */ __exportAll({ default: () => AnalysisModal });
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
function formatDuration$1(seconds) {
	const total = Number(seconds || 0);
	if (!Number.isFinite(total) || total <= 0) return null;
	return `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`;
}
function breakoutScore(video) {
	const value = Number(video?.score ?? video?.viral_score ?? video?.virality_score ?? 0);
	return Number.isFinite(value) && value > 0 ? value : null;
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
		objection: typeof hook === "string" ? null : hook?.objection ?? null,
		text: typeof hook === "string" ? hook : hook?.text || hook?.variation || JSON.stringify(hook)
	}));
	return [];
}
function whyDrags(result) {
	if (!Array.isArray(result?.drags)) return [];
	return result.drags.map((item, index) => ({
		id: index,
		rank: String(index + 1),
		title: typeof item === "string" ? item : item?.title || "Drag",
		body: typeof item === "string" ? null : item?.explanation || item?.reason || null
	})).filter((item) => item.title || item.body);
}
function hookBeats(result) {
	if (!Array.isArray(result?.hook_beats)) return [];
	return result.hook_beats.filter((beat) => beat && (beat.title || beat.explanation)).map((beat, index) => ({
		id: index,
		time: beat.time || null,
		title: beat.title || `Beat ${index + 1}`,
		body: beat.explanation || null
	}));
}
function hookPatterns(result) {
	return Array.isArray(result?.hook_patterns) ? result.hook_patterns.filter((item) => typeof item === "string" && item.trim() !== "") : [];
}
function whyDrivers(result) {
	if (Array.isArray(result?.content_breakdown) && result.content_breakdown.length > 0) return result.content_breakdown.map((item, index) => ({
		id: index,
		rank: String(index + 1).padStart(2, "0"),
		title: item?.title || item?.driver || item?.label || "Breakout signal",
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
function AnalyzeButton$1({ state, onClick }) {
	const running = state === "running";
	const ready = state === "ready";
	const base = "flex h-10 w-full items-center justify-center gap-2 rounded-[11px] px-3.5 text-[13px] font-bold transition";
	if (ready) return /* @__PURE__ */ jsxs("div", {
		className: `${base} cursor-default border border-[#E7E5DF] bg-white text-[#0B0B0B]`,
		children: [/* @__PURE__ */ jsx("svg", {
			viewBox: "0 0 24 24",
			className: "h-[15px] w-[15px]",
			fill: "none",
			stroke: "#1F7A4D",
			strokeWidth: "2.4",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			children: /* @__PURE__ */ jsx("path", { d: "M4 12.5l5.5 5.5L20 7" })
		}), "Analysis ready"]
	});
	if (running) return /* @__PURE__ */ jsxs("div", {
		className: `${base} cursor-default bg-[#FFF8E6] text-[#9A6B00]`,
		children: [/* @__PURE__ */ jsx("span", { className: "h-[14px] w-[14px] animate-spin rounded-full border-2 border-[rgba(154,107,0,.3)] border-t-[#9A6B00]" }), "Analyzing…"]
	});
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		onClick,
		className: `${base} bg-[#FFC629] text-[#1A1400] hover:bg-[#FFD84D]`,
		children: [/* @__PURE__ */ jsxs("svg", {
			viewBox: "0 0 24 24",
			className: "h-[15px] w-[15px]",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2",
			strokeLinecap: "round",
			children: [/* @__PURE__ */ jsx("circle", {
				cx: "11",
				cy: "11",
				r: "7"
			}), /* @__PURE__ */ jsx("path", { d: "m20 20-3.5-3.5" })]
		}), "Analyze video"]
	});
}
function LeftSidebar({ video, canRegenerate = false, regenerating = false, disabledRegenerate = false, onRegenerate, analyzeState = "idle", onAnalyze, saved = false, saving = false, onToggleSave, showExternalLink = true }) {
	return /* @__PURE__ */ jsxs("aside", {
		className: "flex max-h-full min-h-0 flex-col gap-3 self-start overflow-y-auto",
		children: [/* @__PURE__ */ jsx(BreakoutVideoCard, {
			video,
			showActions: false
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-[7px]",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: `grid gap-[7px] ${showExternalLink ? "grid-cols-[minmax(0,1fr)_40px]" : "grid-cols-1"}`,
					children: [/* @__PURE__ */ jsx(AnalyzeButton$1, {
						state: analyzeState,
						onClick: onAnalyze
					}), showExternalLink && /* @__PURE__ */ jsx("a", {
						href: video.post_url || video.postUrl || "#",
						target: "_blank",
						rel: "noreferrer noopener",
						"aria-disabled": !(video.post_url || video.postUrl),
						title: "Open on TikTok",
						"aria-label": "Open on TikTok",
						className: `flex h-10 items-center justify-center rounded-[11px] border border-[#E7E5DF] bg-white text-[#0B0B0B] transition hover:bg-[#FAF9F6] ${video.post_url || video.postUrl ? "" : "pointer-events-none opacity-40"}`,
						children: /* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							className: "h-[15px] w-[15px]",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							children: /* @__PURE__ */ jsx("path", { d: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" })
						})
					})]
				}),
				onToggleSave && /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: onToggleSave,
					disabled: saving,
					"aria-pressed": saved,
					className: `flex h-10 items-center justify-center gap-2 rounded-[11px] border px-2.5 text-[13px] font-bold transition disabled:opacity-60 ${saved ? "border-[#FFC629] bg-[#FFF8E6] text-[#5C4200]" : "border-[#E7E5DF] bg-white text-[#0B0B0B] hover:bg-[#FAF9F6]"}`,
					children: [/* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 24 24",
						className: "h-[15px] w-[15px]",
						fill: saved ? "currentColor" : "none",
						stroke: "currentColor",
						strokeWidth: "2",
						strokeLinejoin: "round",
						children: /* @__PURE__ */ jsx("path", { d: "M6 3h12v18l-6-4.5L6 21z" })
					}), saved ? "Saved" : "Save"]
				}),
				canRegenerate && /* @__PURE__ */ jsx(RegenerateButton, {
					regenerating,
					disabled: disabledRegenerate,
					onClick: onRegenerate,
					fullWidth: true
				})
			]
		})]
	});
}
function VideoHeadline({ video, calloutDismissed, onDismissCallout }) {
	const caption = String(video?.title || video?.caption || "").trim();
	const score = breakoutScore(video);
	const showCallout = !calloutDismissed && Boolean(score);
	const tagMatch = caption.match(/(\s#[^\s#]+(?:\s+#[^\s#]+)*)\s*$/);
	const captionTags = tagMatch ? tagMatch[1].trim() : null;
	const captionBody = tagMatch ? caption.slice(0, tagMatch.index).trim() : caption;
	if (!caption && !showCallout) return null;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [caption && /* @__PURE__ */ jsxs("p", {
		className: "mr-11 mt-0.5 min-w-0 break-words text-[16.5px] font-extrabold leading-[1.4] tracking-[-0.01em] text-[#0B0B0B]",
		children: [
			"“",
			captionBody,
			"”",
			captionTags && /* @__PURE__ */ jsxs("span", {
				className: "font-bold text-[#9A6B00]",
				children: [" ", captionTags]
			})
		]
	}), showCallout && /* @__PURE__ */ jsxs("div", {
		className: "flex min-w-0 items-start gap-[9px] rounded-[12px] border border-[#F2E2AE] bg-[#FFF3CF] px-3 py-2.5",
		children: [
			/* @__PURE__ */ jsx("span", {
				"aria-hidden": true,
				className: "mt-px flex-none text-[#9A6B00]",
				children: /* @__PURE__ */ jsxs("svg", {
					viewBox: "0 0 24 24",
					className: "h-3.5 w-3.5",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2",
					children: [/* @__PURE__ */ jsx("circle", {
						cx: "12",
						cy: "12",
						r: "10"
					}), /* @__PURE__ */ jsx("path", {
						d: "M12 16v-5M12 8h.01",
						strokeLinecap: "round"
					})]
				})
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "m-0 min-w-0 flex-1 break-words text-[12px] leading-[1.45] text-[#5B4300]",
				children: [
					/* @__PURE__ */ jsxs("b", {
						className: "font-extrabold",
						children: [formatMetric(score), "x is this video’s weighted engagement relative to its creator’s follower count."]
					}),
					" ",
					"Views, likes and comments contribute to the score."
				]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: onDismissCallout,
				"aria-label": "Dismiss",
				className: "ml-auto flex-none cursor-pointer font-bold leading-none text-[#9B8140] transition hover:text-[#0B0B0B]",
				children: "✕"
			})
		]
	})] });
}
function TabRow({ tabs, activeTab, onChange }) {
	return /* @__PURE__ */ jsx("div", {
		className: "flex gap-1.5 rounded-[12px] border border-[#E7E5DF] bg-white p-[5px]",
		role: "tablist",
		children: tabs.map((tab) => /* @__PURE__ */ jsx("button", {
			type: "button",
			role: "tab",
			"aria-selected": activeTab === tab.key,
			onClick: () => onChange(tab.key),
			className: `h-9 flex-1 rounded-[9px] text-[13px] font-bold transition ${activeTab === tab.key ? "bg-[#FFF3CF] text-[#9A6B00]" : "text-[#5C5A54] hover:text-[#0B0B0B]"}`,
			children: tab.label
		}, tab.key))
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
			children: status === "failed" ? error || "This analysis could not be completed." : status === "processing" ? "We are preparing the transcript, shared diagnostics, and creator-facing guidance." : /* @__PURE__ */ jsxs(Fragment$1, { children: [
				"Analysis hasn’t started yet. Run ",
				/* @__PURE__ */ jsx("b", {
					className: "font-bold text-[#1a1a1a]",
					children: "Analyze video"
				}),
				" to break down what made this video outperform its audience size — and get a playbook you can hand to your creators."
			] })
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
function Section({ tone = "plain", title, count, children, className = "" }) {
	return /* @__PURE__ */ jsxs("section", {
		className: `min-w-0 rounded-[14px] border px-[15px] py-[14px] ${tone === "next" ? "border-[#F2E2AE] bg-[#FFFCF2]" : "border-[#E7E5DF] bg-white"} ${className}`,
		children: [title && /* @__PURE__ */ jsxs("h3", {
			className: "mb-[11px] flex items-center gap-2 text-[13.5px] font-extrabold tracking-[-0.01em] text-[#0B0B0B]",
			children: [title, count && /* @__PURE__ */ jsx("span", {
				className: "text-[10px] font-extrabold tracking-[0.06em] text-[#8A877F]",
				children: count
			})]
		}), children]
	});
}
function NumberedItems({ items, tone = "good" }) {
	const chip = {
		good: "bg-[#FFF3CF] text-[#9A6B00]",
		bad: "bg-[#FEF0E7] text-[#C2410C]",
		next: "bg-[#E9F5EE] text-[#1F7A4D]"
	}[tone];
	return /* @__PURE__ */ jsx("ul", {
		className: "m-0 grid list-none gap-[11px] p-0",
		children: items.map((item, index) => /* @__PURE__ */ jsxs("li", {
			className: "flex gap-2.5",
			children: [/* @__PURE__ */ jsx("span", {
				className: `mt-px flex h-[19px] flex-[0_0_19px] items-center justify-center rounded-[6px] text-[10.5px] font-extrabold ${chip}`,
				children: item.rank ?? index + 1
			}), /* @__PURE__ */ jsxs("div", {
				className: "min-w-0",
				children: [item.title && /* @__PURE__ */ jsx("b", {
					className: "mb-0.5 block text-[12.8px] font-bold text-[#0B0B0B]",
					children: item.title
				}), item.body && /* @__PURE__ */ jsx("p", {
					className: "m-0 text-[12.3px] leading-[1.5] text-[#5C5A54]",
					children: item.body
				})]
			})]
		}, item.id ?? index))
	});
}
function SourceNote({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "mb-0 mt-[11px] text-[11px] italic text-[#8A877F]",
		children
	});
}
function EmptySection({ children }) {
	return /* @__PURE__ */ jsx("p", {
		className: "m-0 text-[12.3px] leading-[1.5] text-[#8A877F]",
		children
	});
}
function WhyPanel({ result, analysis, video }) {
	const drivers = whyDrivers(result);
	const drags = whyDrags(result);
	const actions = strategistRecommendations(result);
	const rows = transcriptRows(analysis);
	const runtime = formatDuration$1(video?.duration ?? null);
	return /* @__PURE__ */ jsxs("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ jsx(Section, {
				title: "Why it worked",
				count: drivers.length ? `${drivers.length} ${drivers.length === 1 ? "DRIVER" : "DRIVERS"}` : null,
				children: drivers.length > 0 ? /* @__PURE__ */ jsx(NumberedItems, {
					items: drivers,
					tone: "good"
				}) : /* @__PURE__ */ jsx(EmptySection, { children: "No drivers were identified for this video." })
			}),
			/* @__PURE__ */ jsx(Section, {
				title: "What could be improved",
				count: drags.length ? `${drags.length} ${drags.length === 1 ? "DRAG" : "DRAGS"}` : null,
				children: drags.length > 0 ? /* @__PURE__ */ jsx(NumberedItems, {
					items: drags,
					tone: "bad"
				}) : /* @__PURE__ */ jsx(EmptySection, { children: "Nothing measurable held this video back." })
			}),
			/* @__PURE__ */ jsx(Section, {
				tone: "next",
				title: "What you should do next",
				count: actions.length ? `${actions.length} ${actions.length === 1 ? "ACTION" : "ACTIONS"}` : null,
				children: actions.length > 0 ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(NumberedItems, {
					items: actions,
					tone: "next"
				}), /* @__PURE__ */ jsx(SourceNote, { children: "From this video’s transcript and metrics." })] }) : /* @__PURE__ */ jsx(EmptySection, { children: "No next actions were generated for this video." })
			}),
			/* @__PURE__ */ jsx(Section, {
				title: "Transcript",
				count: runtime,
				children: rows.length > 0 ? /* @__PURE__ */ jsx("ul", {
					className: "m-0 grid list-none gap-2 p-0",
					children: rows.map((row, index) => /* @__PURE__ */ jsxs("li", {
						className: "flex gap-[11px] text-[12.3px] leading-[1.5]",
						children: [/* @__PURE__ */ jsx("span", {
							className: "flex-[0_0_34px] pt-px text-[11px] font-bold [font-variant-numeric:tabular-nums] text-[#8A877F]",
							children: row.time
						}), /* @__PURE__ */ jsx("span", {
							className: index === 0 ? "rounded-[6px] bg-[#FFF3CF] px-1.5 py-px" : void 0,
							children: row.text
						})]
					}, row.id))
				}) : /* @__PURE__ */ jsx(EmptySection, { children: "No transcript was captured for this video." })
			})
		]
	});
}
function HookPanel({ result, video }) {
	const hookLine = String(result?.hook_analysis || "").trim();
	const patterns = hookPatterns(result);
	const reasons = hookReasons(result);
	const beats = hookBeats(result);
	const rewrites = hookVariations(result);
	const [copiedId, setCopiedId] = useState(null);
	const copy = async (item) => {
		try {
			await navigator.clipboard.writeText(item.text);
			setCopiedId(item.id);
			window.setTimeout(() => setCopiedId((current) => current === item.id ? null : current), 1600);
		} catch {}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ jsx(Section, { children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-stretch gap-[13px]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "relative aspect-[9/13] flex-[0_0_76px] overflow-hidden rounded-[10px] bg-[#FAF9F6]",
					children: [video?.thumbnail_url ? /* @__PURE__ */ jsx("img", {
						src: video.thumbnail_url,
						alt: "",
						referrerPolicy: "no-referrer",
						className: "absolute inset-0 h-full w-full object-cover"
					}) : /* @__PURE__ */ jsx("span", { className: "absolute inset-0 bg-[linear-gradient(150deg,#e8dcd2,#d8c4b6_55%,#a8887c)]" }), /* @__PURE__ */ jsx("span", {
						className: "absolute bottom-1.5 left-1.5 text-[9px] font-extrabold tracking-[0.06em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,.6)]",
						children: "0:00"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex min-w-0 flex-1 flex-col justify-center",
					children: [hookLine ? /* @__PURE__ */ jsxs("blockquote", {
						className: "m-0 mb-[9px] text-[16px] font-extrabold leading-[1.35] tracking-[-0.01em] text-[#0B0B0B] text-balance",
						children: [
							"“",
							hookLine,
							"”"
						]
					}) : /* @__PURE__ */ jsx(EmptySection, { children: "The opening line was not captured for this video." }), patterns.length > 0 && /* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap gap-1.5",
						children: patterns.map((pattern, index) => /* @__PURE__ */ jsx("span", {
							className: `rounded-[7px] border px-2 py-1 text-[10.5px] font-extrabold tracking-[0.03em] ${index === 0 ? "border-[#F2E2AE] bg-[#FFF3CF] text-[#9A6B00]" : "border-[#E7E5DF] bg-[#F5F4F0] text-[#5C5A54]"}`,
							children: pattern
						}, pattern))
					})]
				})]
			}) }),
			/* @__PURE__ */ jsx(Section, {
				title: "Why it stops the scroll",
				count: reasons.length ? `${reasons.length} ${reasons.length === 1 ? "REASON" : "REASONS"}` : null,
				children: reasons.length > 0 ? /* @__PURE__ */ jsx(NumberedItems, {
					items: reasons,
					tone: "good"
				}) : /* @__PURE__ */ jsx(EmptySection, { children: "No hook breakdown was generated for this video." })
			}),
			beats.length > 0 && /* @__PURE__ */ jsxs(Section, {
				title: "How the first three seconds are built",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mb-3 flex h-1.5 overflow-hidden rounded-full bg-[#E7E5DF]",
					children: [
						/* @__PURE__ */ jsx("i", { className: "block flex-[3] bg-[#9A6B00]" }),
						/* @__PURE__ */ jsx("i", { className: "block flex-[4] bg-[#E0B44A]" }),
						/* @__PURE__ */ jsx("i", { className: "block flex-[3] bg-[#F0D89A]" })
					]
				}), /* @__PURE__ */ jsx("ul", {
					className: "m-0 grid list-none gap-0 p-0",
					children: beats.map((beat, index) => /* @__PURE__ */ jsxs("li", {
						className: `grid grid-cols-[46px_1fr] gap-3 py-[9px] ${index === 0 ? "pt-0" : "border-t border-dashed border-[#E7E5DF]"}`,
						children: [/* @__PURE__ */ jsx("span", {
							className: "pt-px text-[11px] font-extrabold [font-variant-numeric:tabular-nums] text-[#9A6B00]",
							children: beat.time ?? ""
						}), /* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("b", {
								className: "mb-0.5 block text-[12.5px] font-bold text-[#0B0B0B]",
								children: beat.title
							}), beat.body && /* @__PURE__ */ jsx("p", {
								className: "m-0 text-[12.2px] leading-[1.5] text-[#5C5A54]",
								children: beat.body
							})]
						})]
					}, beat.id))
				})]
			}),
			rewrites.length > 0 && /* @__PURE__ */ jsxs(Section, {
				tone: "next",
				title: "Swipe this hook",
				count: `${rewrites.length} ${rewrites.length === 1 ? "REWRITE" : "REWRITES"}`,
				children: [/* @__PURE__ */ jsx("ul", {
					className: "m-0 grid list-none gap-[9px] p-0",
					children: rewrites.map((item) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-start gap-2.5 rounded-[11px] border border-[#E7E5DF] bg-[#F5F4F0] px-[11px] py-2.5",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "min-w-0 flex-1 text-[12.4px] leading-[1.5] text-[#0B0B0B]",
							children: [item.objection && /* @__PURE__ */ jsx("em", {
								className: "mb-[3px] block text-[10.5px] font-extrabold uppercase not-italic tracking-[0.05em] text-[#8A877F]",
								children: item.objection
							}), item.text]
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => copy(item),
							className: "inline-flex h-[26px] flex-shrink-0 items-center gap-[5px] rounded-[8px] border border-[#E7E5DF] bg-white px-[9px] text-[11px] font-bold text-[#5C5A54] transition hover:border-[#c8c4ba] hover:text-[#0B0B0B]",
							children: [/* @__PURE__ */ jsxs("svg", {
								viewBox: "0 0 24 24",
								className: "h-[11px] w-[11px]",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								strokeLinejoin: "round",
								children: [/* @__PURE__ */ jsx("rect", {
									x: "9",
									y: "9",
									width: "12",
									height: "12",
									rx: "2"
								}), /* @__PURE__ */ jsx("path", { d: "M5 15V5a2 2 0 012-2h10" })]
							}), copiedId === item.id ? "Copied" : "Copy"]
						})]
					}, item.id))
				}), /* @__PURE__ */ jsx(SourceNote, { children: "Structure lifted from this video’s opening." })]
			})
		]
	});
}
function ActivePanel({ activeTab, analysis, result, video }) {
	if (activeTab === "hook") return /* @__PURE__ */ jsx(HookPanel, {
		result,
		video
	});
	return /* @__PURE__ */ jsx(WhyPanel, {
		result,
		analysis,
		video
	});
}
var DEFAULT_TABS = [{
	key: "why",
	label: "Why it worked"
}, {
	key: "hook",
	label: "Hook"
}];
function AnalysisModal({ video, initialAnalysis, tabs = DEFAULT_TABS, open = true, onClose, onAnalysisChange, onAnalyze, analyzeBusy = false, saved = false, saving = false, onToggleSave, showExternalLink = true }) {
	const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "why");
	const [analysis, setAnalysis] = usePolling(video.id, initialAnalysis, open);
	const [regenerating, setRegenerating] = useState(false);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [calloutDismissed, setCalloutDismissed] = useState(false);
	const canRegenerate = Boolean(usePage().props?.features?.videoAnalysisRefresh);
	const scrollerRef = useRef(null);
	const selectTab = (key) => {
		setActiveTab(key);
		if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
	};
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
		setCalloutDismissed(false);
	}, [tabs, video?.id]);
	if (!open || !video) return null;
	const result = analysis?.result ?? {};
	const regenerateDisabled = regenerating || analysis?.status === "processing";
	const status = analysis?.status;
	const analyzeState = status === "complete" ? "ready" : analyzeBusy || regenerating || status === "processing" || status === "queued" || status === "pending" ? "running" : "idle";
	const startAnalysis = () => {
		if (onAnalyze) {
			onAnalyze();
			return;
		}
		retryAnalysis();
	};
	return /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(38,33,28,0.42)] px-2 py-3 backdrop-blur-[2px] min-[640px]:px-4 min-[640px]:py-6",
		onClick: onClose,
		children: /* @__PURE__ */ jsx("div", {
			className: "max-h-[calc(100vh-1.5rem)] w-full max-w-[1120px] overflow-y-auto rounded-[22px] border border-[#E7E5DF] bg-[#FAF9F6] p-2 shadow-[0_2px_4px_rgba(20,15,0,.05),0_24px_56px_-20px_rgba(20,15,0,.18)] min-[640px]:max-h-[calc(100vh-3rem)] min-[640px]:p-3 min-[820px]:overflow-hidden",
			onClick: (event) => event.stopPropagation(),
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Video analysis",
			children: /* @__PURE__ */ jsxs("div", {
				className: "relative min-w-0 rounded-[18px] p-3 min-[640px]:p-4 min-[820px]:h-[min(760px,calc(100vh-88px))] min-[820px]:overflow-hidden md:p-5",
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
						className: "absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E7E5DF] bg-white text-[#5C5A54] transition hover:text-[#0B0B0B]",
						"aria-label": "Close analysis",
						children: /* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							className: "h-[13px] w-[13px] stroke-current",
							fill: "none",
							strokeWidth: "2.4",
							strokeLinecap: "round",
							children: /* @__PURE__ */ jsx("path", { d: "M5 5l14 14M19 5L5 19" })
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "grid h-full items-start gap-6 min-[980px]:grid-cols-[300px_minmax(0,1fr)]",
						children: [/* @__PURE__ */ jsx(LeftSidebar, {
							video,
							canRegenerate,
							regenerating,
							disabledRegenerate: regenerateDisabled,
							onRegenerate: regenerate,
							analyzeState,
							onAnalyze: startAnalysis,
							saved,
							saving,
							onToggleSave,
							showExternalLink
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex min-h-0 min-w-0 flex-col gap-3.5 min-[820px]:h-full",
							children: [
								/* @__PURE__ */ jsx(VideoHeadline, {
									video,
									calloutDismissed,
									onDismissCallout: () => setCalloutDismissed(true)
								}),
								/* @__PURE__ */ jsx(TabRow, {
									tabs,
									activeTab,
									onChange: selectTab
								}),
								/* @__PURE__ */ jsx("div", {
									className: "relative flex min-h-0 flex-1 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-[26px] after:bg-[linear-gradient(180deg,rgba(250,249,246,0),#FAF9F6)] min-[820px]:after:block max-[819px]:after:hidden",
									children: /* @__PURE__ */ jsx("div", {
										ref: scrollerRef,
										className: "-mr-2.5 min-h-0 flex-1 overscroll-contain py-0.5 pl-0.5 pr-3 min-[820px]:overflow-y-auto",
										children: analysis?.status !== "complete" ? /* @__PURE__ */ jsx(ProcessingState, {
											status: analysis?.status ?? "idle",
											error: analysis?.error_message
										}) : /* @__PURE__ */ jsx(ActivePanel, {
											activeTab,
											analysis,
											result,
											video
										})
									})
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
//#region resources/js/Pages/components/MyFeed.jsx
var MyFeed_exports = /* @__PURE__ */ __exportAll({ default: () => MyFeed });
/**
* The signed-in "My Feed" home. A stream of the user's strongest breakout
* videos beside a rail of three cards — the searches feeding the stream, the
* hashtags those breakouts lean on, and what is climbing across Brand Beacon.
*
* Everything in the stream comes from the user's own searches; a user with no
* searches yet borrows the global feed instead of seeing an empty column.
*
* Layout follows the feed mockup: a post is a wide card (thumb beside copy) on
* desktop and a full-bleed portrait card on phones. The rail drops to two
* columns under the stream at tablet width, and to one column on phones.
*/
var FIRST_BATCH = 5;
var BATCH = 8;
var Icons$2 = {
	play: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: /* @__PURE__ */ jsx("path", { d: "M8 5v14l11-7z" })
	}),
	spark: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" })
	}),
	heart: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" })
	}),
	comment: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
	}),
	share: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "M22 2 11 13" }), /* @__PURE__ */ jsx("path", { d: "M22 2l-7 20-4-9-9-4z" })]
	}),
	trend: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.4",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "M3 17l6-6 4 4 8-8" }), /* @__PURE__ */ jsx("path", { d: "M21 3h-5m5 0v5" })]
	}),
	bookmark: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: /* @__PURE__ */ jsx("path", { d: "M6 3h12v18l-6-4.5L6 21z" })
	}),
	bookmarkO: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M6 3h12v18l-6-4.5L6 21z" })
	}),
	ext: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M7 17 17 7M8 7h9v9" })
	}),
	arrow: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.4",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M5 12h14M13 6l6 6-6 6" })
	})
};
var tiktokTagUrl = (tag) => `https://www.tiktok.com/tag/${encodeURIComponent(String(tag).replace(/^#/, ""))}`;
/**
* The caption with every #hashtag and @mention linked. Captions arrive as plain
* text from TikTok, so the tags are found by pattern rather than markup.
*/
function Caption({ text }) {
	if (!text) return null;
	const parts = String(text).split(/([#@][\p{L}\p{N}_.]+)/gu);
	return /* @__PURE__ */ jsx("p", {
		className: "bbf-cap",
		children: parts.map((part, i) => {
			if (/^#[\p{L}\p{N}_.]+$/u.test(part)) return /* @__PURE__ */ jsx("a", {
				className: "bbf-tag",
				href: tiktokTagUrl(part),
				target: "_blank",
				rel: "noopener noreferrer",
				children: part
			}, i);
			if (/^@[\p{L}\p{N}_.]+$/u.test(part)) return /* @__PURE__ */ jsx("a", {
				className: "bbf-tag",
				href: `https://www.tiktok.com/${part}`,
				target: "_blank",
				rel: "noopener noreferrer",
				children: part
			}, i);
			return part;
		})
	});
}
function PostMedia({ video }) {
	const [playing, setPlaying] = useState(false);
	const iframeRef = useRef(null);
	const playerUrl = playerUrlFor(video, true);
	useEffect(() => {
		const iframe = iframeRef.current;
		if (!playing || !iframe || !video?.video_id) return void 0;
		const unmuteAndPlay = () => {
			postTikTokMessage(iframe, "unMute");
			postTikTokMessage(iframe, "play");
		};
		const handleReady = (event) => {
			const payload = event?.data;
			if (!payload || payload["x-tiktok-player"] !== true || payload.type !== "onPlayerReady") return;
			if (event.source !== iframe.contentWindow) return;
			unmuteAndPlay();
		};
		iframe.addEventListener("load", unmuteAndPlay);
		window.addEventListener("message", handleReady);
		return () => {
			iframe.removeEventListener("load", unmuteAndPlay);
			window.removeEventListener("message", handleReady);
		};
	}, [playing, video?.video_id]);
	return /* @__PURE__ */ jsx("div", {
		className: `bbf-media${playing ? " playing" : ""}`,
		children: playing && playerUrl ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("iframe", {
			ref: iframeRef,
			src: playerUrl,
			title: video.caption || "TikTok video",
			loading: "lazy",
			allow: "autoplay; encrypted-media; fullscreen; picture-in-picture",
			allowFullScreen: true
		}), /* @__PURE__ */ jsx("button", {
			type: "button",
			className: "bbf-close",
			"aria-label": "Close player",
			onClick: () => setPlaying(false),
			children: "×"
		})] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
			video.thumbnail ? /* @__PURE__ */ jsx("img", {
				src: video.thumbnail,
				alt: "",
				loading: "lazy"
			}) : /* @__PURE__ */ jsx("span", {
				className: "bbf-media__ph",
				style: { background: video.gradient }
			}),
			/* @__PURE__ */ jsx("span", { className: "bbf-scrim" }),
			video.brand && video.search_url && /* @__PURE__ */ jsxs(Link, {
				className: `bbf-vtag${video.search_type === "product" ? " p" : ""}`,
				href: video.search_url,
				children: [/* @__PURE__ */ jsx("i", {}), video.brand]
			}),
			video.duration && /* @__PURE__ */ jsx("span", {
				className: "bbf-dur",
				children: video.duration
			}),
			/* @__PURE__ */ jsxs("span", {
				className: "bbf-ovstats",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "bbf-ovchip bbf-ovchip--score",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "lab",
						children: [/* @__PURE__ */ jsx("i", {}), "Breakout score"]
					}), /* @__PURE__ */ jsx("span", {
						className: "num",
						children: video.score || "—"
					})]
				}), /* @__PURE__ */ jsxs("span", {
					className: "bbf-ovchip bbf-ovchip--views",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "lab",
						children: [/* @__PURE__ */ jsx("i", {}), "Views"]
					}), /* @__PURE__ */ jsx("span", {
						className: "num",
						children: video.views || "—"
					})]
				})]
			}),
			playerUrl ? /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "bbf-play",
				"aria-label": `Play video by ${video.handle || "this creator"}`,
				onClick: () => setPlaying(true),
				children: Icons$2.play
			}) : /* @__PURE__ */ jsx("span", {
				className: "bbf-play-error",
				role: "status",
				children: "Video unavailable."
			})
		] })
	});
}
/** Matches the results page's analyze CTA wording, so the states read the same. */
function analyzeLabel(status) {
	if (status === "processing") return "Analyzing video…";
	if (status === "complete") return "View analysis";
	if (status === "failed") return "Retry analysis";
	return "Analyze video";
}
function Post({ video, onAnalyze, onToggleSave, saving }) {
	const status = video.analysis?.status;
	const busy = status === "processing";
	return /* @__PURE__ */ jsx("article", {
		className: "bbf-post",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bbf-post__b",
			children: [/* @__PURE__ */ jsx(PostMedia, { video }), /* @__PURE__ */ jsxs("div", {
				className: "bbf-side",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "bbf-who",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "bbf-av",
								style: { background: video.gradient }
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "bbf-who__t",
								children: [/* @__PURE__ */ jsx("span", {
									className: "n",
									children: video.handle || "on TikTok"
								}), video.followers && /* @__PURE__ */ jsxs("span", {
									className: "s",
									children: [video.followers, " followers"]
								})]
							}),
							video.uploaded_date && /* @__PURE__ */ jsx("time", {
								className: "bbf-who__d",
								dateTime: video.uploaded_at,
								children: video.uploaded_date
							})
						]
					}),
					/* @__PURE__ */ jsx(Caption, { text: video.caption }),
					/* @__PURE__ */ jsxs("div", {
						className: "bbf-eng",
						children: [
							/* @__PURE__ */ jsxs("span", { children: [Icons$2.heart, video.likes] }),
							/* @__PURE__ */ jsxs("span", { children: [Icons$2.comment, video.comments] }),
							/* @__PURE__ */ jsxs("span", { children: [Icons$2.share, video.shares] }),
							video.engagement && /* @__PURE__ */ jsxs("span", { children: [Icons$2.trend, video.engagement] })
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bbf-acts",
						children: [
							/* @__PURE__ */ jsxs("button", {
								type: "button",
								className: `bbf-act bbf-act--an${status === "complete" ? " done" : ""}`,
								onClick: () => onAnalyze(video),
								"aria-busy": busy,
								disabled: busy,
								children: [busy ? /* @__PURE__ */ jsx("span", {
									className: "bbf-spin",
									"aria-hidden": true
								}) : Icons$2.spark, /* @__PURE__ */ jsx("span", { children: analyzeLabel(status) })]
							}),
							video.post_url && /* @__PURE__ */ jsx("a", {
								className: "bbf-act bbf-act--ic",
								href: video.post_url,
								target: "_blank",
								rel: "noopener noreferrer",
								title: "Open in TikTok",
								"aria-label": "Open in TikTok",
								children: Icons$2.ext
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								className: `bbf-act bbf-act--ic${video.bookmarked ? " on" : ""}`,
								title: video.bookmarked ? "Remove from saved" : "Save video",
								"aria-label": video.bookmarked ? "Remove from saved" : "Save video",
								"aria-pressed": Boolean(video.bookmarked),
								disabled: saving,
								onClick: () => onToggleSave(video),
								children: video.bookmarked ? Icons$2.bookmark : Icons$2.bookmarkO
							})
						]
					})
				]
			})]
		})
	});
}
function SearchesCard({ searches, searchesCount }) {
	if (searches.length === 0) return null;
	return /* @__PURE__ */ jsxs("section", {
		className: "bbf-rcard",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "bbf-rhead",
				children: [/* @__PURE__ */ jsx("h3", { children: "Your searches" }), /* @__PURE__ */ jsx(Link, {
					className: "bbf-chip bbf-chip--plain",
					href: "/library",
					children: "Manage"
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "bbf-rlist",
				children: searches.map((search) => /* @__PURE__ */ jsxs(Link, {
					className: "bbf-rrow",
					href: search.url,
					children: [
						/* @__PURE__ */ jsx("span", {
							className: `bbf-src${search.type === "product" ? " p" : ""}`,
							children: search.initials
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "t",
							children: [/* @__PURE__ */ jsx("b", { children: search.name }), /* @__PURE__ */ jsxs("span", { children: [
								search.breakouts,
								" breakout",
								search.breakouts === 1 ? "" : "s"
							] })]
						}),
						search.score && /* @__PURE__ */ jsx("span", {
							className: "g",
							children: search.score
						})
					]
				}, search.id))
			}),
			searchesCount > searches.length && /* @__PURE__ */ jsxs(Link, {
				className: "bbf-rlink",
				href: "/library",
				children: [
					"See all ",
					searchesCount,
					" searches ",
					Icons$2.arrow
				]
			})
		]
	});
}
function HashtagsCard({ hashtags, hashtagsCount }) {
	if (hashtags.length === 0) return null;
	const top = Math.max(...hashtags.map((h) => h.count), 1);
	return /* @__PURE__ */ jsxs("section", {
		className: "bbf-rcard",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "bbf-rhead",
				children: [/* @__PURE__ */ jsx("h3", { children: "Hashtags in your breakouts" }), /* @__PURE__ */ jsx("span", {
					className: "bbf-chip bbf-chip--yours",
					children: "Yours"
				})]
			}),
			hashtags.map((h) => /* @__PURE__ */ jsxs("a", {
				className: "bbf-hrow",
				href: tiktokTagUrl(h.tag),
				target: "_blank",
				rel: "noopener noreferrer",
				children: [
					/* @__PURE__ */ jsxs("b", { children: ["#", h.tag] }),
					/* @__PURE__ */ jsx("span", {
						className: "bar",
						children: /* @__PURE__ */ jsx("i", { style: { width: `${Math.round(h.count / top * 100)}%` } })
					}),
					/* @__PURE__ */ jsx("span", {
						className: "c",
						children: h.count
					})
				]
			}, h.tag)),
			hashtagsCount > hashtags.length && /* @__PURE__ */ jsxs("p", {
				className: "bbf-rfoot",
				children: [hashtagsCount, " hashtags appear across your breakout videos."]
			})
		]
	});
}
function ClimbingCard({ climbing }) {
	return /* @__PURE__ */ jsxs("section", {
		className: "bbf-rcard",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "bbf-rhead",
				children: [/* @__PURE__ */ jsx("h3", { children: "Climbing this week" }), /* @__PURE__ */ jsx("span", {
					className: "bbf-chip",
					children: "All brands"
				})]
			}),
			climbing.length > 0 ? climbing.map((row) => /* @__PURE__ */ jsxs("a", {
				className: "bbf-hrow",
				href: tiktokTagUrl(row.tag),
				target: "_blank",
				rel: "noopener noreferrer",
				children: [/* @__PURE__ */ jsxs("b", { children: ["#", row.tag] }), /* @__PURE__ */ jsx("span", {
					className: "g",
					children: row.growth === null ? "New" : `+${row.growth}%`
				})]
			}, row.tag)) : /* @__PURE__ */ jsx("p", {
				className: "bbf-rempty",
				children: "No rising hashtags recorded yet."
			}),
			/* @__PURE__ */ jsx("p", {
				className: "bbf-rfoot",
				children: "Growth is week over week across every indexed video, not just your searches. “New” means the hashtag was absent from the previous week."
			})
		]
	});
}
function PopularSearchesCard({ rows }) {
	const [selected, setSelected] = useState(null);
	const dialog = useRef(null);
	useEffect(() => {
		if (selected) dialog.current?.showModal();
		else dialog.current?.close();
	}, [selected]);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("section", {
		className: "bbf-rcard",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "bbf-rhead",
				children: [/* @__PURE__ */ jsx("h3", { children: "Popular Searches" }), /* @__PURE__ */ jsx("span", {
					className: "bbf-chip",
					children: "All time"
				})]
			}),
			rows.length ? rows.map((row) => /* @__PURE__ */ jsxs("button", {
				type: "button",
				className: "bbf-popular-row",
				onClick: () => setSelected(row),
				children: [/* @__PURE__ */ jsx("strong", { children: row.keyword }), /* @__PURE__ */ jsxs("small", { children: [
					row.type === "product" ? "Product" : "Brand",
					" · ",
					row.occurrences.toLocaleString(),
					" searches · ",
					row.users.toLocaleString(),
					" users"
				] })]
			}, `${row.type}:${row.keyword}`)) : /* @__PURE__ */ jsx("p", {
				className: "bbf-rempty",
				children: "Popular searches will appear here as people search."
			}),
			/* @__PURE__ */ jsx("p", {
				className: "bbf-rfoot",
				children: "Top keywords by total searches across all users."
			})
		]
	}), /* @__PURE__ */ jsxs("dialog", {
		ref: dialog,
		className: "bbf-popular-dialog",
		"aria-labelledby": "popular-search-title",
		onCancel: () => setSelected(null),
		onClose: () => setSelected(null),
		children: [
			/* @__PURE__ */ jsx("h2", {
				id: "popular-search-title",
				children: "Search this keyword?"
			}),
			/* @__PURE__ */ jsxs("p", { children: [
				"Open a ",
				selected?.type === "product" ? "product" : "brand",
				" search for ",
				/* @__PURE__ */ jsx("strong", { children: selected?.keyword }),
				"? You can review it before starting."
			] }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "bbf-btn",
				onClick: () => setSelected(null),
				children: "Cancel"
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "bbf-btn",
				onClick: () => {
					const row = selected;
					setSelected(null);
					router.visit(`${row.type === "product" ? "/products" : "/brands"}?q=${encodeURIComponent(row.keyword)}`);
				},
				children: "Yes, continue"
			})] })
		]
	})] });
}
function DiscoveryPrompt() {
	return /* @__PURE__ */ jsxs("div", {
		className: "bbf-prompt",
		children: [/* @__PURE__ */ jsx("span", {
			className: "bbf-prompt__i",
			children: Icons$2.spark
		}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", { children: "Run your first search to make this yours" }), /* @__PURE__ */ jsx("p", { children: "Until then, explore videos from across Brand Beacon. Search a brand or product above to swap it for your own." })] })]
	});
}
function EmptyState() {
	return /* @__PURE__ */ jsxs("div", {
		className: "bbf-empty",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "bbf-empty__i",
				children: Icons$2.spark
			}),
			/* @__PURE__ */ jsx("h2", { children: "Your feed is waiting on your first search" }),
			/* @__PURE__ */ jsx("p", { children: "Search a brand or product above and we’ll start filling this in — your breakout videos, the hashtags they lean on, and the searches behind them." })
		]
	});
}
function MyFeed({ feed = {}, currentPath = "/home", onAnalyze, analysisById = {} }) {
	const { videos = [], totalCount = videos.length, searches = [], searchesCount = 0, hashtags = [], hashtagsCount = 0, climbing = [], popularSearches = [], isDiscoveryFeed = false } = feed;
	const [shown, setShown] = useState(FIRST_BATCH);
	const [saved, setSaved] = useState({});
	const [savingId, setSavingId] = useState(null);
	const cards = useMemo(() => videos.slice(0, shown).map((v) => ({
		...v,
		...v.id in saved ? { bookmarked: saved[v.id] } : {},
		analysis: analysisById[v.id] ?? v.analysis ?? null
	})), [
		videos,
		shown,
		saved,
		analysisById
	]);
	const remaining = Math.max(0, videos.length - shown);
	const toggleSave = async (video) => {
		const next = !video.bookmarked;
		setSavingId(video.id);
		try {
			await (next ? bookmarks.save(video.id) : bookmarks.remove(video.id));
			setSaved((cur) => ({
				...cur,
				[video.id]: next
			}));
		} catch {} finally {
			setSavingId(null);
		}
	};
	const analyze = (video) => {
		if (typeof onAnalyze === "function") return onAnalyze(video);
		return video.search_url ? router.visit(withReturnTo(video.search_url, currentPath)) : void 0;
	};
	const styles = /* @__PURE__ */ jsx("style", { children: scopedCss$3 });
	if (videos.length === 0) return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		styles,
		/* @__PURE__ */ jsx(EmptyState, {}),
		/* @__PURE__ */ jsxs("div", {
			className: "bbf-rail",
			style: { marginTop: 20 },
			children: [/* @__PURE__ */ jsx(ClimbingCard, { climbing }), /* @__PURE__ */ jsx(PopularSearchesCard, { rows: popularSearches })]
		})
	] });
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		styles,
		isDiscoveryFeed && /* @__PURE__ */ jsx(DiscoveryPrompt, {}),
		/* @__PURE__ */ jsxs("div", {
			className: "bbf-sbar",
			children: [/* @__PURE__ */ jsx("h2", { children: isDiscoveryFeed ? "Explore global videos" : "Your top breakout videos" }), /* @__PURE__ */ jsx("p", { children: isDiscoveryFeed ? "Discover videos from across Brand Beacon while your own feed fills up." : `Curated list of the top breakout videos from your searches and categories.${totalCount > videos.length ? ` ${totalCount} broke out for you this week.` : ""}` })]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "bbf-grid",
			children: [/* @__PURE__ */ jsxs("section", {
				className: "bbf-stream",
				"aria-label": isDiscoveryFeed ? "Breakout videos across Brand Beacon" : "Your breakout videos",
				children: [cards.map((video, i) => /* @__PURE__ */ jsx(Post, {
					video,
					onAnalyze: analyze,
					onToggleSave: toggleSave,
					saving: savingId === video.id
				}, `${video.id}-${i}`)), remaining > 0 && /* @__PURE__ */ jsx("div", {
					className: "bbf-more",
					children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "bbf-btn",
						onClick: () => setShown((n) => n + BATCH),
						children: [
							"Load ",
							Math.min(BATCH, remaining),
							" more"
						]
					})
				})]
			}), /* @__PURE__ */ jsxs("aside", {
				className: "bbf-rail",
				"aria-label": "Your searches and hashtag trends",
				children: [
					/* @__PURE__ */ jsx(SearchesCard, {
						searches,
						searchesCount
					}),
					/* @__PURE__ */ jsx(HashtagsCard, {
						hashtags,
						hashtagsCount
					}),
					/* @__PURE__ */ jsx(ClimbingCard, { climbing }),
					/* @__PURE__ */ jsx(PopularSearchesCard, { rows: popularSearches })
				]
			})]
		})
	] });
}
var scopedCss$3 = `
.bbf-popular-row{display:block;width:100%;text-align:left;padding:12px 0;border:0;border-bottom:1px solid var(--line);background:transparent;cursor:pointer;color:var(--ink)}
.bbf-popular-row strong{display:block;overflow-wrap:anywhere;font-size:.85rem}
.bbf-popular-row small{display:block;margin-top:5px;color:var(--muted);font-size:.72rem}
.bbf-popular-row:hover strong{text-decoration:underline}
.bbf-popular-row:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
.bbf-popular-dialog{margin:auto;border:1px solid var(--line);border-radius:20px;padding:28px;width:calc(100% - 32px);max-width:440px;background:var(--white);color:var(--ink)}
.bbf-popular-dialog::backdrop{background:#0006}
.bbf-popular-dialog h2{font-size:1.2rem;font-weight:800;margin:0 0 12px}
.bbf-popular-dialog p{line-height:1.6;overflow-wrap:anywhere}
.bbf-popular-dialog>div{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}
.bbf-popular-dialog>div button:last-child{background:var(--yellow)}
.bbf-sbar{margin:0 0 14px}
.bbf-sbar h2{position:relative;margin:0;padding-left:13px;font-size:1.1rem;font-weight:800;letter-spacing:-.026em;color:var(--ink)}
.bbf-sbar h2::before{content:'';position:absolute;left:0;top:.2em;bottom:.2em;width:3px;border-radius:2px;background:var(--yellow)}
.bbf-sbar p{margin:4px 0 0;padding-left:13px;font-size:.88rem;line-height:1.5;color:var(--muted)}

.bbf-grid{display:grid;grid-template-columns:minmax(0,1fr) 312px;gap:22px;align-items:start}
.bbf-stream{display:flex;flex-direction:column;gap:14px;min-width:0}

.bbf-post{background:var(--white);border:1px solid var(--line);border-radius:16px;overflow:hidden;transition:border-color .16s}
.bbf-post:hover{border-color:var(--line-2,#D9D6CF)}
.bbf-post__b{display:grid;grid-template-columns:262px minmax(0,1fr);gap:18px;padding:16px}

.bbf-media{position:relative;aspect-ratio:9/13;border-radius:14px;overflow:hidden;background:var(--paper,#FAF9F6)}
.bbf-media img,.bbf-media__ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.bbf-media iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;display:block}
.bbf-scrim{position:absolute;left:0;right:0;bottom:0;height:44%;z-index:4;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(11,11,11,.34) 45%,rgba(11,11,11,.62))}
.bbf-vtag{position:absolute;top:9px;left:9px;z-index:6;display:inline-flex;align-items:center;gap:6px;max-width:calc(100% - 76px);padding:5px 10px;border-radius:8px;background:rgba(255,255,255,.94);backdrop-filter:blur(6px);font-size:.74rem;font-weight:800;color:var(--ink);letter-spacing:-.01em;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:.16s}
.bbf-vtag i{width:5px;height:5px;border-radius:50%;background:var(--yellow);flex:none}
.bbf-vtag.p i{background:#C2410C}
.bbf-vtag:hover{background:#fff;color:var(--amber-ink)}
.bbf-dur{position:absolute;top:9px;right:9px;z-index:5;padding:3px 8px;border-radius:7px;background:rgba(11,11,11,.55);color:#fff;font-size:.68rem;font-weight:700;font-variant-numeric:tabular-nums}
.bbf-play{position:absolute;inset:0;margin:auto;z-index:6;width:42px;height:42px;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 3px 12px rgba(0,0,0,.25);cursor:pointer;opacity:0;transition:opacity .2s}
.bbf-media:hover .bbf-play,.bbf-play:focus-visible{opacity:1}
.bbf-play svg{width:15px;height:15px;margin-left:2px;color:#1A1400}
.bbf-close{position:absolute;top:9px;right:9px;z-index:7;width:28px;height:28px;border:0;border-radius:50%;background:rgba(0,0,0,.65);color:#fff;font-size:1.25rem;line-height:1;cursor:pointer}
.bbf-play-error{position:absolute;inset:auto 12px 12px;z-index:6;padding:10px;border-radius:8px;background:rgba(0,0,0,.8);color:#fff;text-align:center;font-size:.78rem}
.bbf-ovstats{position:absolute;left:9px;right:9px;bottom:9px;z-index:5;display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bbf-ovchip{border-radius:10px;padding:7px 8px 8px;border:1px solid rgba(255,255,255,.35);box-shadow:0 4px 14px rgba(0,0,0,.28)}
.bbf-ovchip .lab{display:flex;align-items:center;gap:5px;font-size:.56rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap}
.bbf-ovchip .lab i{width:4px;height:4px;border-radius:50%;background:currentColor;flex:none}
.bbf-ovchip .num{display:block;margin-top:3px;font-size:1.02rem;font-weight:800;line-height:1;letter-spacing:-.02em;color:var(--ink);font-variant-numeric:tabular-nums}
.bbf-ovchip--score{background:#FFF3CF}
.bbf-ovchip--score .lab{color:var(--amber-ink)}
.bbf-ovchip--views{background:#FEF0E7}
.bbf-ovchip--views .lab{color:#C2410C}

.bbf-side{min-width:0;display:flex;flex-direction:column;gap:12px}
.bbf-who{display:flex;align-items:flex-start;gap:9px}
.bbf-av{width:32px;height:32px;border-radius:50%;flex:none;margin-top:1px;background:linear-gradient(150deg,#ffd27a,#ff9a5a 55%,#c0607a)}
.bbf-who__t{min-width:0}
.bbf-who__t .n{display:block;font-size:.88rem;font-weight:700;color:var(--ink);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bbf-who__t .s{display:block;font-size:.76rem;color:var(--faint,#74716A);line-height:1.3}
.bbf-who__d{margin-left:auto;padding-top:2px;flex:none;font-size:.76rem;color:var(--faint,#74716A);white-space:nowrap;font-variant-numeric:tabular-nums}
.bbf-cap{margin:0;font-size:.9rem;line-height:1.5;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bbf-tag{color:var(--amber-ink);font-weight:700;text-decoration:none}
.bbf-tag:hover{text-decoration:underline;text-underline-offset:2px}
.bbf-eng{display:flex;justify-content:space-between;gap:6px;margin-top:auto;padding-top:12px;border-top:1px solid var(--line);font-size:.8rem;font-weight:600;color:var(--muted);font-variant-numeric:tabular-nums}
.bbf-eng span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.bbf-eng svg{width:13px;height:13px;flex:none;color:var(--faint,#74716A)}
.bbf-acts{display:flex;gap:8px;margin-top:2px}
.bbf-act{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;border:0;border-radius:10px;font:inherit;font-size:.84rem;font-weight:700;text-decoration:none;cursor:pointer;transition:.16s}
.bbf-act svg{width:14px;height:14px;flex:none}
.bbf-act--an{flex:1;background:var(--yellow);color:#1A1400}
.bbf-act--an:hover{background:var(--yellow-hot,#FFD84D)}
.bbf-act--ic{width:38px;border:1px solid var(--line);background:var(--white);color:var(--muted)}
.bbf-act--ic:hover{color:var(--ink);border-color:var(--line-2,#D9D6CF)}
.bbf-act--ic.on{color:var(--amber-ink);border-color:#FFF3CF;background:var(--wash)}
.bbf-act--an.done{background:var(--white);border:1px solid var(--yellow);color:var(--ink)}
.bbf-act[disabled]{opacity:.55;cursor:not-allowed}
.bbf-act--an[aria-busy="true"]{opacity:1}
.bbf-spin{width:14px;height:14px;flex:none;border-radius:50%;border:2px solid rgba(26,20,0,.28);border-top-color:#1A1400;animation:bbf-sp .8s linear infinite}
@keyframes bbf-sp{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.bbf-spin{animation:none}}
.bbf-act:focus-visible,.bbf-play:focus-visible,.bbf-vtag:focus-visible{outline:2px solid var(--ink);outline-offset:2px}

.bbf-more{display:flex;justify-content:center;padding:6px 0 4px}
.bbf-btn{display:inline-flex;align-items:center;justify-content:center;height:38px;padding:0 18px;border:1px solid var(--line-2,#D9D6CF);border-radius:10px;background:var(--white);font:inherit;font-size:.85rem;font-weight:700;color:var(--ink);cursor:pointer;transition:.16s}
.bbf-btn:hover{background:var(--paper,#FAF9F6);border-color:#BDBAB2}

.bbf-rail{position:sticky;top:24px;display:flex;flex-direction:column;gap:14px;min-width:0}
.bbf-rcard{background:var(--white);border:1px solid var(--line);border-radius:16px;padding:15px 16px;min-width:0}
.bbf-rhead{display:flex;align-items:center;gap:8px;margin-bottom:11px}
.bbf-rhead h3{margin:0;font-size:.92rem;font-weight:800;letter-spacing:-.02em;color:var(--ink)}
.bbf-chip{margin-left:auto;flex:none;padding:2px 6px;border:1px solid var(--line);border-radius:5px;font-size:.62rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--faint,#74716A);text-decoration:none}
.bbf-chip--plain{text-transform:none;letter-spacing:0;font-size:.72rem}
.bbf-chip--plain:hover{color:var(--ink);border-color:var(--line-2,#D9D6CF)}
.bbf-chip--yours{border-color:transparent;padding:3px 7px;color:var(--amber-ink);background:var(--wash)}
.bbf-rlist{display:flex;flex-direction:column}
.bbf-rrow{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);color:inherit;text-decoration:none}
.bbf-rrow:first-child{padding-top:0}
.bbf-rrow:last-child{border-bottom:0;padding-bottom:0}
.bbf-src{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:8px;background:var(--wash);color:var(--amber-ink);font-size:.72rem;font-weight:800}
.bbf-src.p{background:#FEF0E7;color:#C2410C}
.bbf-rrow .t{flex:1;min-width:0}
.bbf-rrow .t b{display:block;font-size:.82rem;font-weight:700;color:var(--ink);line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bbf-rrow .t span{display:block;font-size:.73rem;color:var(--faint,#74716A);line-height:1.3}
.bbf-rrow:hover .t b{color:var(--amber-ink)}
.bbf-rrow .g,.bbf-hrow .g{flex:none;font-size:.75rem;font-weight:800;color:#1F7A4D;font-variant-numeric:tabular-nums}
.bbf-hrow{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--line);color:inherit;text-decoration:none}
.bbf-hrow:first-of-type{padding-top:0}
.bbf-hrow:last-of-type{border-bottom:0;padding-bottom:0}
.bbf-hrow b{flex:1;min-width:0;font-size:.84rem;font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bbf-hrow:hover b{color:var(--amber-ink)}
.bbf-hrow .bar{width:56px;height:5px;flex:none;border-radius:3px;background:var(--paper,#FAF9F6);overflow:hidden}
.bbf-hrow .bar i{display:block;height:100%;border-radius:3px;background:var(--yellow)}
.bbf-hrow .c{flex:none;min-width:24px;text-align:right;font-size:.75rem;color:var(--faint,#74716A);font-variant-numeric:tabular-nums}
.bbf-rfoot{margin:11px 0 0;padding-top:10px;border-top:1px solid var(--line);font-size:.76rem;line-height:1.45;color:var(--faint,#74716A)}
.bbf-rempty{margin:0;font-size:.8rem;line-height:1.5;color:var(--muted)}
.bbf-rlink{display:inline-flex;align-items:center;gap:5px;margin-top:10px;font-size:.8rem;font-weight:700;color:var(--amber-ink);text-decoration:none}
.bbf-rlink:hover{text-decoration:underline;text-underline-offset:3px}
.bbf-rlink svg{width:12px;height:12px}

.bbf-prompt{display:flex;gap:14px;align-items:flex-start;margin:0 0 18px;padding:16px 18px;border:1px solid #F2E2AE;border-radius:16px;background:var(--wash)}
.bbf-prompt__i{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:10px;background:var(--yellow);color:#1A1400}
.bbf-prompt__i svg{width:17px;height:17px}
.bbf-prompt h2{margin:0;font-size:.95rem;font-weight:800;letter-spacing:-.02em;color:var(--ink)}
.bbf-prompt p{margin:5px 0 0;max-width:70ch;font-size:.83rem;line-height:1.55;color:#5B4300}
.bbf-empty{margin-top:8px;padding:40px 26px;border:1px dashed var(--line-2,#D9D6CF);border-radius:20px;background:var(--white);text-align:center}
.bbf-empty__i{width:52px;height:52px;margin:0 auto 16px;display:grid;place-items:center;border-radius:16px;background:var(--wash);color:var(--amber-ink)}
.bbf-empty__i svg{width:24px;height:24px}
.bbf-empty h2{margin:0;font-size:1.12rem;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.bbf-empty p{margin:10px auto 0;max-width:440px;font-size:.9rem;line-height:1.55;color:var(--muted)}

@media (prefers-reduced-motion:reduce){.bbf-post,.bbf-act,.bbf-play,.bbf-btn,.bbf-vtag{transition:none}}

/* Tablet: the rail moves under the stream as a two-up row. */
@media (max-width:1140px){
  .bbf-grid{grid-template-columns:minmax(0,1fr)}
  .bbf-rail{position:static;display:grid;grid-template-columns:1fr 1fr;gap:14px}
}
@media (max-width:980px){
  .bbf-post__b{grid-template-columns:190px minmax(0,1fr);gap:14px}
}
/* Phone: full-bleed portrait thumb, copy below, single-column rail. */
@media (max-width:680px){
  .bbf-rail{grid-template-columns:1fr}
  .bbf-post__b{display:block;padding:0 0 14px}
  .bbf-media{aspect-ratio:9/16;border-radius:0;margin-bottom:13px}
  .bbf-play{opacity:1}
  .bbf-ovstats{left:12px;right:12px;bottom:12px;gap:8px}
  .bbf-ovchip{padding:9px 12px 10px}
  .bbf-ovchip .lab{font-size:.6rem}
  .bbf-ovchip .num{font-size:1.16rem}
  .bbf-side{padding:0 14px}
  .bbf-cap{-webkit-line-clamp:3}
}
`;
//#endregion
//#region resources/js/Pages/components/SearchFlashModals.jsx
var SearchFlashModals_exports = /* @__PURE__ */ __exportAll({ default: () => SearchFlashModals });
/**
* The modals that hang off a search hand-off: a search started during sign-up
* or checkout flashes onto the landing page, and this watches it to completion.
*
* These used to live on the retired search homepage. They follow the flash
* messages, so they belong wherever a signed-in user lands — My Feed.
*/
var POLL_MS$1 = 1e4;
var ACTIVE_SEARCH_STATUSES$1 = /* @__PURE__ */ new Set([
	"pending",
	"queued",
	"running",
	"scraping"
]);
function SearchCompletionModal({ state, onClose, onViewResults, onContactUs }) {
	if (!state) return null;
	const finished = state.finished ?? [];
	const failed = state.failed ?? [];
	const hasFailures = failed.length > 0;
	const hasFinished = finished.length > 0;
	const title = hasFailures && hasFinished ? "Search updates" : hasFailures ? "Something went wrong" : "Search ready";
	const body = hasFailures && hasFinished ? "Some searches finished successfully, and some need your attention." : hasFailures ? "One or more searches did not finish correctly." : finished.length > 1 ? `${finished.length} searches have finished running.` : finished[0]?.name ? `Your search for ${String.fromCharCode(8220)}${finished[0].name}${String.fromCharCode(8221)} has finished running.` : "Your search has finished running.";
	const primarySearch = hasFinished ? finished[0] : null;
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: onClose
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box",
				children: [
					/* @__PURE__ */ jsx("h2", { children: title }),
					/* @__PURE__ */ jsx("p", {
						className: "sub",
						children: body
					}),
					(hasFinished || hasFailures) && /* @__PURE__ */ jsxs("div", {
						style: {
							marginTop: 18,
							display: "grid",
							gap: 10
						},
						children: [hasFinished && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							style: {
								fontWeight: 800,
								color: "var(--ink)",
								fontSize: ".82rem"
							},
							children: "Finished"
						}), /* @__PURE__ */ jsx("div", {
							style: {
								marginTop: 8,
								display: "grid",
								gap: 8
							},
							children: finished.map((search) => /* @__PURE__ */ jsxs("div", {
								style: {
									padding: "10px 12px",
									borderRadius: 12,
									background: "var(--paper)",
									border: "1px solid var(--line)"
								},
								children: [/* @__PURE__ */ jsx("div", {
									style: {
										fontWeight: 700,
										color: "var(--ink)"
									},
									children: search.name || search.phrase
								}), /* @__PURE__ */ jsxs("div", {
									style: {
										fontSize: ".8rem",
										color: "var(--muted)",
										marginTop: 4
									},
									children: [search.result_count ?? 0, " videos ready"]
								})]
							}, `done-${search.id}`))
						})] }), hasFailures && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							style: {
								fontWeight: 800,
								color: "var(--ink)",
								fontSize: ".82rem"
							},
							children: "Needs support"
						}), /* @__PURE__ */ jsx("div", {
							style: {
								marginTop: 8,
								display: "grid",
								gap: 8
							},
							children: failed.map((search) => /* @__PURE__ */ jsxs("div", {
								style: {
									padding: "10px 12px",
									borderRadius: 12,
									background: "#fff7f2",
									border: "1px solid #f2d1bf"
								},
								children: [/* @__PURE__ */ jsx("div", {
									style: {
										fontWeight: 700,
										color: "var(--ink)"
									},
									children: search.name || search.phrase
								}), /* @__PURE__ */ jsx("div", {
									style: {
										fontSize: ".8rem",
										color: "var(--muted)",
										marginTop: 4
									},
									children: search.latest_run_error || "The search did not finish."
								})]
							}, `failed-${search.id}`))
						})] })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "actrow__r",
						style: {
							marginTop: 24,
							justifyContent: "flex-end",
							flexWrap: "wrap"
						},
						children: [
							/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "btn btn--g",
								onClick: onClose,
								children: "Close"
							}),
							hasFailures && /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "btn btn--g",
								onClick: onContactUs,
								children: "Contact support"
							}),
							primarySearch?.url && /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "btn btn--y",
								onClick: () => onViewResults(primarySearch),
								children: "View results"
							})
						]
					})
				]
			})]
		})
	});
}
function SearchProcessingModal({ searches, onClose }) {
	if (!Array.isArray(searches) || searches.length === 0) return null;
	const first = searches[0];
	const title = searches.length > 1 ? "Your searches are processing" : "Your search is processing";
	const body = searches.length > 1 ? `We started ${searches.length} searches behind the scenes. We’ll update you here when they finish.` : first?.name ? `We started ${String.fromCharCode(8220)}${first.name}${String.fromCharCode(8221)} behind the scenes. We’ll update you here when it finishes.` : "We started your search behind the scenes. We’ll update you here when it finishes.";
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: onClose
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box",
				children: [
					/* @__PURE__ */ jsx("h2", { children: title }),
					/* @__PURE__ */ jsx("p", {
						className: "sub",
						children: body
					}),
					/* @__PURE__ */ jsx("div", {
						style: {
							marginTop: 18,
							display: "grid",
							gap: 8
						},
						children: searches.map((search) => /* @__PURE__ */ jsxs("div", {
							style: {
								padding: "10px 12px",
								borderRadius: 12,
								background: "var(--paper)",
								border: "1px solid var(--line)"
							},
							children: [/* @__PURE__ */ jsx("div", {
								style: {
									fontWeight: 700,
									color: "var(--ink)"
								},
								children: search.name || search.phrase
							}), /* @__PURE__ */ jsx("div", {
								style: {
									fontSize: ".8rem",
									color: "var(--muted)",
									marginTop: 4
								},
								children: "It will appear in Pick up where you left off while it runs."
							})]
						}, `processing-${search.id}`))
					}),
					/* @__PURE__ */ jsx("div", {
						className: "actrow__r",
						style: {
							marginTop: 24,
							justifyContent: "flex-end"
						},
						children: /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--y",
							onClick: onClose,
							children: "Okay"
						})
					})
				]
			})]
		})
	});
}
function SearchAccessPromptModal({ prompt, billing, onClose, onUpgrade }) {
	if (!prompt) return null;
	const trialEligible = billing?.trialEligible ?? true;
	const hasUsedTrial = billing?.hasUsedTrial ?? false;
	const shouldOfferTrial = trialEligible && !hasUsedTrial;
	return /* @__PURE__ */ jsx(UpgradePromptModal, {
		eyebrow: "Keep your momentum",
		title: "Ready to find your next breakout?",
		body: shouldOfferTrial ? "Turn your first signal into a repeatable edge with Growth." : "Keep spotting breakout content before the trend moves on.",
		visual: "search-momentum",
		primaryLabel: shouldOfferTrial ? "Start my 8-day trial" : "Unlock more searches",
		onPrimary: onUpgrade,
		secondaryLabel: "Maybe later",
		onClose
	});
}
function CouponAccessPromptModal({ prompt, onClose }) {
	if (!prompt) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: onClose
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box bb-modal__box--upgrade",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": prompt.title || "Notice",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "bb-modal__close",
						onClick: onClose,
						"aria-label": "Close",
						children: /* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2.2",
							strokeLinecap: "round",
							"aria-hidden": "true",
							children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
						})
					}),
					(prompt.errorKey || prompt.program) && /* @__PURE__ */ jsx("div", {
						className: "bb-modal__eyebrow",
						children: /* @__PURE__ */ jsx("span", { children: [prompt.program, prompt.errorKey].filter(Boolean).join(" · ") })
					}),
					/* @__PURE__ */ jsx("h2", { children: prompt.title || "This offer is unavailable" }),
					prompt.detail && /* @__PURE__ */ jsx("p", {
						className: "sub",
						children: prompt.detail
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bb-modal__actions",
						children: [/* @__PURE__ */ jsx(Link, {
							href: "/contact",
							className: "btn btn--y",
							onClick: onClose,
							children: "Contact us"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g",
							onClick: onClose,
							children: "Got it"
						})]
					})
				]
			})]
		})
	});
}
function SearchFlashModals({ currentPath = "/home" }) {
	const { flash = {}, billing: billing$4 = {} } = usePage().props;
	const [processingModal, setProcessingModal] = useState(null);
	const [completionModal, setCompletionModal] = useState(null);
	const [searchAccessPrompt, setSearchAccessPrompt] = useState(null);
	const [couponPrompt, setCouponPrompt] = useState(null);
	const [recentSearches, setRecentSearches] = useState([]);
	const polling = useRef(false);
	const recentSearchesRef = useRef([]);
	const recentStatuses = useRef(/* @__PURE__ */ new Map());
	const flashedTrackedRef = useRef(false);
	const flashedProcessingRef = useRef(false);
	const hasActiveRecentSearch = recentSearches.some((s) => ACTIVE_SEARCH_STATUSES$1.has(s.status));
	const markTrackedAsPrompted = (searches, patch) => {
		searches.forEach((search) => {
			if (search?.id == null) return;
			updateTracked(search.id, patch);
		});
	};
	const trackedTerminalChanges = (searches) => {
		const tracked = readTracked();
		const trackedById = new Map(tracked.map((entry) => [String(entry.id), entry]));
		const finished = [];
		const failed = [];
		searches.forEach((search) => {
			const trackedEntry = trackedById.get(String(search.id));
			if (!trackedEntry) return;
			if (search.status === "done" && trackedEntry.completedPromptShown !== true) finished.push(search);
			if (search.status === "failed" && trackedEntry.failedPromptShown !== true) failed.push(search);
		});
		return {
			finished,
			failed
		};
	};
	const applyRecentSearches = (searches, notifyOnTerminal = false) => {
		const previousStatuses = recentStatuses.current;
		recentStatuses.current = new Map(searches.map((s) => [String(s.id), s.status]));
		recentSearchesRef.current = searches;
		setRecentSearches(searches);
		if (!notifyOnTerminal) return;
		const terminalSearches = searches.filter((s) => ACTIVE_SEARCH_STATUSES$1.has(previousStatuses.get(String(s.id))) && (s.status === "done" || s.status === "failed"));
		if (terminalSearches.length === 0) return;
		const trackedChanges = trackedTerminalChanges(terminalSearches);
		if (trackedChanges.finished.length > 0 || trackedChanges.failed.length > 0) {
			if (trackedChanges.finished.length > 0) markTrackedAsPrompted(trackedChanges.finished, { completedPromptShown: true });
			if (trackedChanges.failed.length > 0) markTrackedAsPrompted(trackedChanges.failed, { failedPromptShown: true });
			router.reload({
				only: ["billing"],
				preserveScroll: true,
				preserveState: true,
				onFinish: () => setCompletionModal(trackedChanges)
			});
		}
	};
	const refreshRecent = async (notifyOnTerminal = false) => {
		const payload = await fetchRecentSearches();
		applyRecentSearches(payload?.searches ?? [], notifyOnTerminal);
	};
	useEffect(() => {
		if (flashedTrackedRef.current) return;
		flashedTrackedRef.current = true;
		const flashed = Array.isArray(flash.trackedSearches) ? flash.trackedSearches : [];
		if (flashed.length === 0) return;
		flashed.forEach((entry) => {
			if (entry?.id == null) return;
			trackSearch(entry);
		});
		refreshRecent().catch(() => {});
	}, [flash.trackedSearches]);
	useEffect(() => {
		if (flashedProcessingRef.current) return;
		flashedProcessingRef.current = true;
		const flashed = Array.isArray(flash.processingSearches) ? flash.processingSearches : [];
		if (flashed.length === 0) return;
		setProcessingModal(flashed);
	}, [flash.processingSearches]);
	useEffect(() => {
		if (!flash.searchAccessPrompt) return;
		setSearchAccessPrompt(flash.searchAccessPrompt);
	}, [flash.searchAccessPrompt]);
	useEffect(() => {
		if (!flash.couponAccessPrompt) return;
		setCouponPrompt(flash.couponAccessPrompt);
	}, [flash.couponAccessPrompt]);
	useEffect(() => {
		if (completionModal) return void 0;
		let cancelled = false;
		let timer;
		const poll = async () => {
			if (cancelled || polling.current) return;
			if (!recentSearchesRef.current.some((s) => ACTIVE_SEARCH_STATUSES$1.has(s.status))) return;
			polling.current = true;
			try {
				const payload = await fetchRecentSearches();
				if (cancelled) return;
				applyRecentSearches(payload?.searches ?? [], true);
			} catch {} finally {
				polling.current = false;
			}
			if (!cancelled) timer = window.setTimeout(poll, POLL_MS$1);
		};
		poll();
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [completionModal, hasActiveRecentSearch]);
	const viewResults = (search) => {
		if (!search?.url) return setCompletionModal(null);
		untrackSearch(search.id);
		return router.visit(withReturnTo(search.url, currentPath));
	};
	const openSearchUpgrade = () => {
		setSearchAccessPrompt(null);
		if ((billing$4.trialEligible ?? true) && !(billing$4.hasUsedTrial ?? false)) billing.trialCheckout("growth");
		else router.visit("/plans");
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(SearchCompletionModal, {
			state: completionModal,
			onClose: () => setCompletionModal(null),
			onViewResults: viewResults,
			onContactUs: () => {
				setCompletionModal(null);
				router.visit("/contact");
			}
		}),
		/* @__PURE__ */ jsx(SearchProcessingModal, {
			searches: processingModal,
			onClose: () => setProcessingModal(null)
		}),
		/* @__PURE__ */ jsx(CouponAccessPromptModal, {
			prompt: couponPrompt,
			onClose: () => setCouponPrompt(null)
		}),
		/* @__PURE__ */ jsx(SearchAccessPromptModal, {
			prompt: searchAccessPrompt,
			billing: billing$4,
			onClose: () => setSearchAccessPrompt(null),
			onUpgrade: openSearchUpgrade
		})
	] });
}
//#endregion
//#region resources/js/Pages/components/VideoAnalysisGate.jsx
var VideoAnalysisGate_exports = /* @__PURE__ */ __exportAll({
	AnalysisUpgradeModal: () => AnalysisUpgradeModal,
	UsageConfirmModal: () => UsageConfirmModal$1,
	canUsePaidVideoAnalysis: () => canUsePaidVideoAnalysis,
	handleAnalyzeAction: () => handleAnalyzeAction,
	videoAnalysisRemaining: () => videoAnalysisRemaining
});
/**
* The credit gate in front of "Analyze video".
*
* Every surface that offers manual analysis — the results page and My Feed —
* puts the CTA through the same three outcomes, so the prompt a user sees does
* not depend on where they clicked:
*
*   no analysis entitlement  → AnalysisUpgradeModal
*   already analysed/running → open the analysis modal directly
*   otherwise                → UsageConfirmModal, which spends the credit
*
* `handleAnalyzeAction` below encodes that order; the modals and the credit
* maths live here so there is one implementation to change.
*/
var SparkIcon = /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 24 24",
	fill: "currentColor",
	"aria-hidden": "true",
	children: /* @__PURE__ */ jsx("path", { d: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" })
});
/** Paid plans with a non-zero analysis allowance can start a manual analysis. */
function canUsePaidVideoAnalysis(billing) {
	if (!billing) return false;
	const limit = Number(billing.videoAnalysisLimit ?? 0);
	return Boolean(billing.hasPaidPlan) && limit !== 0;
}
/**
* Credits left, counting the ones started in this session but not yet reflected
* in the shared billing prop. -1 means unlimited.
*/
function videoAnalysisRemaining(billing, startedThisSession = 0) {
	if (!billing) return 0;
	const limit = Number(billing.videoAnalysisLimit ?? 0);
	const used = Number(billing.videoAnalysisUsed ?? 0) + Number(startedThisSession || 0);
	if (limit === -1) return -1;
	return Math.max(0, limit - used);
}
/**
* Routes an "Analyze video" click to the right outcome. Surfaces supply the
* three callbacks and keep their own modal state.
*/
function handleAnalyzeAction(video, { billing, onUpgrade, onOpenAnalysis, onConfirm }) {
	if (!canUsePaidVideoAnalysis(billing)) {
		onUpgrade();
		return;
	}
	const status = video?.analysis?.status;
	if (status === "complete" || status === "processing") {
		onOpenAnalysis(video);
		return;
	}
	onConfirm(video);
}
function UsageConfirmModal$1({ video, creditsRemaining, creditsRemainingAfterUse, busy = false, onConfirm, onCancel }) {
	const currentCredits = creditsRemaining === -1 ? "Unlimited" : creditsRemaining;
	return /* @__PURE__ */ jsxs("div", {
		className: "rs-modalback",
		onClick: onCancel,
		children: [/* @__PURE__ */ jsx("style", { children: modalCss }), /* @__PURE__ */ jsxs("div", {
			className: "rs-usage",
			onClick: (event) => event.stopPropagation(),
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Confirm video analysis",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "rs-upg__eyebrow",
					children: [SparkIcon, /* @__PURE__ */ jsx("span", { children: "Video analysis" })]
				}),
				/* @__PURE__ */ jsx("h3", { children: "Analyze this breakout video?" }),
				/* @__PURE__ */ jsxs("p", { children: [
					"You currently have ",
					/* @__PURE__ */ jsx("b", { children: currentCredits }),
					" video analysis ",
					currentCredits === 1 ? "credit" : "credits",
					" remaining. This analysis will use ",
					/* @__PURE__ */ jsx("b", { children: "1 credit" }),
					" when it completes successfully, leaving you with ",
					/* @__PURE__ */ jsx("b", { children: creditsRemainingAfterUse === "unlimited" ? "unlimited" : creditsRemainingAfterUse }),
					"."
				] }),
				/* @__PURE__ */ jsx("p", {
					className: "rs-usage__subject",
					children: video?.title || video?.caption || video?.handle || "Selected video"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-upgmodal__actions",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "rs-btn rs-btn--g",
						onClick: onCancel,
						disabled: busy,
						children: "Cancel"
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "rs-btn rs-btn--y",
						onClick: onConfirm,
						disabled: busy,
						children: busy ? "Starting…" : "Start analysis"
					})]
				})
			]
		})]
	});
}
/**
* The paywall behind analysis and the two search-management entitlements. The
* feed only ever passes the default 'analysis' mode; the results page uses all
* three.
*/
function AnalysisUpgradeModal({ mode = "analysis", trialEligible = true, hasUsedTrial = false, onClose, onUpgrade }) {
	const isSearchBookmark = mode === "search-bookmark";
	const isSearchManagement = mode === "search-management";
	const shouldOfferTrial = trialEligible && !hasUsedTrial;
	return /* @__PURE__ */ jsx(UpgradePromptModal, {
		eyebrow: isSearchBookmark ? "Search bookmarks" : isSearchManagement ? "Search management" : "Video analysis",
		title: isSearchBookmark ? shouldOfferTrial ? "Start your 8-day Growth trial to unlock search bookmarks" : "Upgrade to unlock search bookmarks" : isSearchManagement ? shouldOfferTrial ? "Start your 8-day Growth trial to manage this search" : "Upgrade to manage this search" : shouldOfferTrial ? "Turn more breakouts into winning creative" : "Turn every breakout into your next winning creative",
		body: isSearchBookmark ? shouldOfferTrial ? "Free searches do not include saved search bookmarks. Start your 8-day Growth trial to save searches to your bookmarks." : "Free searches do not include saved search bookmarks. Upgrade to Growth or Scale to save searches to your bookmarks." : isSearchManagement ? shouldOfferTrial ? "Start your 8-day Growth trial to pause, resume, or delete tracked searches from your dashboard." : "Upgrade to Growth or Scale to pause, resume, or delete tracked searches from your dashboard." : shouldOfferTrial ? "See the hook, angle, and strategy behind more high-performing videos during your 8-day Growth trial." : "See the hook, angle, and strategy behind more high-performing videos—then turn those insights into content faster.",
		visual: !isSearchBookmark && !isSearchManagement ? "video-analysis" : null,
		emphasis: !isSearchBookmark && !isSearchManagement ? "Your free top-video breakdown stays included." : null,
		primaryLabel: isSearchBookmark || isSearchManagement ? shouldOfferTrial ? "Start 8-day Growth trial" : "Upgrade to Growth" : shouldOfferTrial ? "Analyze more free for 8 days" : "Unlock more video analysis",
		onPrimary: onUpgrade,
		onClose
	});
}
var modalCss = `
.rs-modalback{position:fixed;inset:0;z-index:130;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,15,0,.34);backdrop-filter:blur(3px)}
.rs-usage{width:min(100%,460px);border:1px solid #f2e4b8;border-radius:22px;padding:22px;background:linear-gradient(180deg,#fffdf7 0%,#fff8ea 100%);box-shadow:0 28px 90px rgba(42,33,20,.22)}
.rs-usage h3{margin-top:10px;font-size:1.15rem;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.rs-usage p{margin-top:8px;font-size:.9rem;line-height:1.55;color:var(--muted)}
.rs-usage b{color:var(--ink)}
.rs-usage__subject{margin-top:14px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.7);font-weight:700;color:var(--ink)}
.rs-upg__eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:.67rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-ink)}
.rs-upg__eyebrow svg{width:12px;height:12px}
.rs-upgmodal__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.rs-upgmodal__actions .rs-btn{flex:1}
.rs-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 18px;border-radius:100px;font-size:.88rem;font-weight:700;letter-spacing:-.01em;white-space:nowrap;transition:.16s;border:0;cursor:pointer}
.rs-btn svg{width:15px;height:15px;flex:none}
.rs-btn--y{background:var(--yellow);color:#1A1400}
.rs-btn--y:hover:not(:disabled){background:var(--yellow-hot,#FFD84D)}
.rs-btn--g{border:1px solid var(--line-2,#DEDBD3);background:var(--white);color:var(--ink)}
.rs-btn--g:hover:not(:disabled){border-color:var(--faint-2,#9A968E);background:var(--paper)}
.rs-btn:disabled{opacity:.55;cursor:not-allowed}
@media(max-width:560px){
  .rs-usage{padding:20px 16px 16px}
  .rs-usage h3{font-size:1.02rem}
  .rs-usage p{font-size:.84rem}
  .rs-upgmodal__actions .rs-btn{width:100%}
}
`;
//#endregion
//#region resources/js/Pages/Feed.jsx
var Feed_exports = /* @__PURE__ */ __exportAll({ default: () => Feed });
/**
* "My Feed" — the signed-in landing page. The search card on top starts every
* search: picking Brand or Product and typing a subject opens keyword
* expansion here, then hands the created search to its live results page.
* Below it the feed is built from
* the searches the user already owns.
*/
var Icons$1 = {
	brand: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M3 9l1.5-5h15L21 9M3 9v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 20v-6h6v6" })
	}),
	product: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "9"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "5"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "1.4",
				fill: "currentColor"
			})
		]
	}),
	search: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		children: [/* @__PURE__ */ jsx("circle", {
			cx: "11",
			cy: "11",
			r: "7"
		}), /* @__PURE__ */ jsx("path", { d: "m20 20-3.5-3.5" })]
	})
};
var TYPES$2 = [{
	key: "brand",
	label: "Brand",
	icon: Icons$1.brand
}, {
	key: "product",
	label: "Product",
	icon: Icons$1.product
}];
/**
* Brand / Product toggle. The indicator is a single sliding pill measured from
* the active button, so it stays correct at any label width or font size.
*/
function TypeToggle({ value, onChange }) {
	const wrapRef = useRef(null);
	const [pill, setPill] = useState(null);
	useEffect(() => {
		const measure = () => {
			const active = wrapRef.current?.querySelector("[aria-pressed=\"true\"]");
			if (!active) return;
			setPill({
				width: active.offsetWidth,
				x: active.offsetLeft - 3
			});
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, [value]);
	return /* @__PURE__ */ jsxs("span", {
		className: "bbs-seg",
		ref: wrapRef,
		children: [pill && /* @__PURE__ */ jsx("span", {
			className: "bbs-seg__ind",
			style: {
				width: pill.width,
				transform: `translateX(${pill.x}px)`
			},
			"aria-hidden": true
		}), TYPES$2.map((type) => /* @__PURE__ */ jsxs("button", {
			type: "button",
			className: value === type.key ? "on" : void 0,
			"aria-pressed": value === type.key,
			onClick: () => onChange(type.key),
			children: [type.icon, type.label]
		}, type.key))]
	});
}
function SearchCard({ suggestions }) {
	const [activeSearch, setActiveSearch] = useState(null);
	const [type, setType] = useState("brand");
	const [query, setQuery] = useState("");
	const [matches, setMatches] = useState([]);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(-1);
	const inputRef = useRef(null);
	const fieldRef = useRef(null);
	const chips = suggestions[type] ?? [];
	useEffect(() => {
		if (!open) return void 0;
		const controller = new AbortController();
		const timer = window.setTimeout(() => {
			fetchKeywordSuggestions(type, query.trim(), { signal: controller.signal }).then((payload) => {
				const rows = Array.isArray(payload?.suggestions) ? payload.suggestions : [];
				setMatches(rows.filter((row) => row.label?.trim()));
				setActive(-1);
			}).catch(() => {});
		}, 160);
		return () => {
			controller.abort();
			window.clearTimeout(timer);
		};
	}, [
		type,
		query,
		open
	]);
	useEffect(() => {
		if (!open) return void 0;
		const onDown = (e) => {
			if (!fieldRef.current?.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		return () => document.removeEventListener("mousedown", onDown);
	}, [open]);
	const run = (phrase = query, kind = type) => {
		const subject = String(phrase).trim();
		if (!subject) {
			inputRef.current?.focus();
			return;
		}
		setOpen(false);
		setActiveSearch({
			subject,
			kind
		});
	};
	const choose = (row) => run(row.label, row.type === "product" ? "product" : "brand");
	const onKeyDown = (event) => {
		if (event.key === "Escape") {
			setOpen(false);
			setActive(-1);
			return;
		}
		if (event.key === "Enter") {
			if (open && active >= 0 && matches[active]) {
				event.preventDefault();
				choose(matches[active]);
				return;
			}
			run();
			return;
		}
		if (!open || matches.length === 0) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActive((cur) => (cur + 1) % matches.length);
		}
		if (event.key === "ArrowUp") {
			event.preventDefault();
			setActive((cur) => cur <= 0 ? matches.length - 1 : cur - 1);
		}
	};
	if (activeSearch) return /* @__PURE__ */ jsx(BrandInlineFlow, {
		kind: activeSearch.kind,
		eyebrow: activeSearch.kind === "product" ? "Start a product search" : "Start a brand search",
		placeholder: activeSearch.kind === "product" ? "Which product do you want to track?" : "Which brand do you want to research?",
		prefillSubject: activeSearch.subject,
		expandOnPrefill: true,
		onReset: (subject) => {
			setQuery(subject);
			setType(activeSearch.kind);
			setOpen(false);
			setActive(-1);
			setActiveSearch(null);
			window.requestAnimationFrame(() => inputRef.current?.focus());
		}
	});
	return /* @__PURE__ */ jsxs("section", {
		className: "bbs-card",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "bbs-field",
			ref: fieldRef,
			children: [
				/* @__PURE__ */ jsx(TypeToggle, {
					value: type,
					onChange: setType
				}),
				Icons$1.search,
				/* @__PURE__ */ jsx("input", {
					ref: inputRef,
					type: "text",
					value: query,
					autoComplete: "off",
					role: "combobox",
					placeholder: type === "product" ? "lip oil" : "rhode skin",
					"aria-label": type === "product" ? "Search a product" : "Search a brand",
					"aria-expanded": open && matches.length > 0,
					"aria-controls": "bbs-suggest",
					"aria-activedescendant": active >= 0 && matches[active] ? `bbs-opt-${matches[active].id}` : void 0,
					onChange: (e) => {
						setQuery(e.target.value);
						setOpen(true);
					},
					onFocus: () => setOpen(true),
					onKeyDown
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					className: "bbs-cta",
					onClick: () => run(),
					children: [Icons$1.search, "Find breakouts"]
				}),
				open && matches.length > 0 && /* @__PURE__ */ jsxs("div", {
					className: "bbs-suggest",
					id: "bbs-suggest",
					role: "listbox",
					"aria-label": type === "product" ? "Product suggestions" : "Brand suggestions",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "bbs-suggest__h",
						children: [/* @__PURE__ */ jsxs("span", { children: [
							query.trim() ? "Matching" : "Trending",
							" ",
							type === "product" ? "products" : "brands"
						] }), /* @__PURE__ */ jsx("span", { children: matches.length })]
					}), matches.map((row, i) => /* @__PURE__ */ jsxs("button", {
						id: `bbs-opt-${row.id}`,
						type: "button",
						role: "option",
						"aria-selected": i === active,
						className: `bbs-suggest__i${i === active ? " on" : ""}`,
						onMouseEnter: () => setActive(i),
						onMouseDown: (e) => e.preventDefault(),
						onClick: () => choose(row),
						children: [/* @__PURE__ */ jsx("strong", { children: row.label }), row.sector && /* @__PURE__ */ jsx("em", { children: row.sector })]
					}, `${row.type}-${row.id}`))]
				})
			]
		}), chips.length > 0 && /* @__PURE__ */ jsxs("div", {
			className: "bbs-sugg",
			children: [/* @__PURE__ */ jsxs("span", {
				className: "bbs-sugg__l",
				children: [
					"Suggested ",
					type === "product" ? "products" : "brands",
					" to track"
				]
			}), chips.map((chip) => /* @__PURE__ */ jsxs("button", {
				type: "button",
				className: `bbs-kw${type === "product" ? " p" : ""}`,
				onClick: () => run(chip.phrase, type),
				children: [/* @__PURE__ */ jsx("i", {}), chip.phrase]
			}, `${chip.type}-${chip.phrase}`))]
		})]
	});
}
function Feed({ feed = {} }) {
	const { billing: billing$3 = {} } = usePage().props;
	const currentPath = typeof window === "undefined" ? "/home" : `${window.location.pathname}${window.location.search}`;
	const [analysisVideo, setAnalysisVideo] = useState(null);
	const [analysisById, setAnalysisById] = useState({});
	const [confirmVideo, setConfirmVideo] = useState(null);
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [starting, setStarting] = useState(false);
	const [reserved, setReserved] = useState([]);
	const remainingNow = videoAnalysisRemaining(billing$3, reserved.length);
	const remainingAfterUse = remainingNow === -1 ? "unlimited" : Math.max(0, remainingNow - 1);
	const onAnalyze = (video) => handleAnalyzeAction({
		...video,
		analysis: analysisById[video.id] ?? video.analysis ?? null
	}, {
		billing: billing$3,
		onUpgrade: () => setUpgradeOpen(true),
		onOpenAnalysis: setAnalysisVideo,
		onConfirm: setConfirmVideo
	});
	const startAnalysis = async (video) => {
		setStarting(true);
		setConfirmVideo(null);
		try {
			const next = (await videoAnalysis.request(video.id))?.analysis ?? null;
			if (next) setAnalysisById((cur) => ({
				...cur,
				[video.id]: next
			}));
			setReserved((cur) => cur.some((id) => String(id) === String(video.id)) ? cur : [...cur, video.id]);
			trackVideoAnalysis({
				videoId: video.id,
				searchUrl: video.search_url,
				searchName: video.brand,
				videoLabel: video.handle || video.caption || "Breakout video"
			});
		} catch (error) {
			setConfirmVideo(video);
			window.alert(error?.message || "Could not start this analysis.");
		} finally {
			setStarting(false);
		}
	};
	const upgrade = () => {
		setUpgradeOpen(false);
		return (billing$3?.trialEligible ?? true) && !(billing$3?.hasUsedTrial ?? false) ? billing.trialCheckout("growth") : billing.checkout("growth");
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "My Feed · Brand Beacon" }),
		/* @__PURE__ */ jsxs(AppLayout, {
			width: "max-w-[1180px] lg:px-6 xl:px-8",
			children: [
				/* @__PURE__ */ jsx("style", { children: scopedCss$2 }),
				/* @__PURE__ */ jsx(SearchCard, { suggestions: feed.suggestions ?? {} }),
				/* @__PURE__ */ jsx(MyFeed, {
					feed,
					currentPath,
					onAnalyze,
					analysisById
				})
			]
		}),
		analysisVideo && /* @__PURE__ */ jsx(AnalysisModal, {
			video: analysisVideo,
			initialAnalysis: analysisById[analysisVideo.id] ?? analysisVideo.analysis ?? null,
			onClose: () => setAnalysisVideo(null),
			onAnalysisChange: (videoId, analysis) => setAnalysisById((cur) => ({
				...cur,
				[videoId]: analysis
			}))
		}),
		confirmVideo && /* @__PURE__ */ jsx(UsageConfirmModal$1, {
			video: confirmVideo,
			creditsRemaining: remainingNow,
			creditsRemainingAfterUse: remainingAfterUse,
			busy: starting,
			onCancel: () => {
				if (!starting) setConfirmVideo(null);
			},
			onConfirm: () => startAnalysis(confirmVideo)
		}),
		upgradeOpen && /* @__PURE__ */ jsx(AnalysisUpgradeModal, {
			trialEligible: billing$3?.trialEligible ?? true,
			hasUsedTrial: billing$3?.hasUsedTrial ?? false,
			onClose: () => setUpgradeOpen(false),
			onUpgrade: upgrade
		}),
		/* @__PURE__ */ jsx(SearchFlashModals, { currentPath })
	] });
}
var scopedCss$2 = `
.bbs-card{background:var(--white);border:1px solid var(--line);border-radius:22px;padding:20px 22px 18px;margin-bottom:26px}
.bbs-field{position:relative;display:flex;align-items:center;gap:12px;height:66px;padding:0 9px;border:1px solid var(--line-2,#D9D6CF);border-radius:100px;background:var(--white);transition:border-color .18s,box-shadow .18s}
.bbs-field:focus-within{border-color:var(--yellow);box-shadow:0 0 0 4px var(--wash)}
.bbs-field>svg{width:20px;height:20px;flex:none;margin-left:4px;color:var(--faint,#74716A)}
.bbs-field input{flex:1;min-width:0;border:0;outline:0;background:none;font:inherit;font-size:1.08rem;font-weight:500;color:var(--ink)}
.bbs-field input::placeholder{color:#A5A29A;font-weight:400}

.bbs-seg{position:relative;display:inline-flex;gap:3px;padding:3px;flex:none;border:1px solid var(--line);border-radius:100px;background:var(--paper,#FAF9F6)}
.bbs-seg__ind{position:absolute;top:3px;left:3px;height:calc(100% - 6px);border-radius:100px;background:var(--yellow);box-shadow:0 2px 8px -2px rgba(255,198,41,.9);transition:transform .26s cubic-bezier(.22,.61,.36,1),width .26s cubic-bezier(.22,.61,.36,1)}
.bbs-seg button{position:relative;z-index:2;display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 15px;border:0;border-radius:100px;background:none;font:inherit;font-size:.84rem;font-weight:700;color:var(--muted);cursor:pointer;transition:color .18s}
.bbs-seg button svg{width:15px;height:15px;opacity:.75}
.bbs-seg button:hover{color:var(--ink)}
.bbs-seg button.on{color:#1A1400}
.bbs-seg button.on svg{opacity:1}

.bbs-cta{position:relative;overflow:hidden;flex:none;height:48px;padding:0 24px;display:inline-flex;align-items:center;gap:9px;border:0;border-radius:100px;background:var(--yellow);color:#1A1400;font:inherit;font-size:.92rem;font-weight:800;letter-spacing:-.01em;cursor:pointer;box-shadow:0 6px 18px -6px rgba(255,198,41,.9)}
.bbs-cta svg{width:16px;height:16px}
.bbs-cta:hover{background:var(--yellow-hot,#FFD84D);box-shadow:0 8px 26px -6px rgba(255,198,41,1)}

.bbs-suggest{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:40;max-height:340px;overflow-y:auto;padding:6px;border:1px solid var(--line);border-radius:16px;background:var(--white);box-shadow:0 18px 40px -18px rgba(20,15,0,.34)}
.bbs-suggest__h{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px 6px;font-size:.68rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--amber-ink)}
.bbs-suggest__i{display:flex;align-items:baseline;gap:10px;width:100%;padding:10px 12px;border:0;border-radius:10px;background:none;font:inherit;text-align:left;cursor:pointer}
.bbs-suggest__i strong{min-width:0;flex:1;font-size:.9rem;font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bbs-suggest__i em{flex:none;font-style:normal;font-size:.74rem;font-weight:600;color:var(--muted);opacity:.75}
.bbs-suggest__i.on,.bbs-suggest__i:focus-visible{background:var(--wash);outline:0}

.bbs-sugg{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}
.bbs-sugg__l{font-size:.82rem;font-weight:700;color:var(--muted)}
.bbs-kw{display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 13px;border:1px solid var(--line);border-radius:100px;background:var(--white);font:inherit;font-size:.83rem;font-weight:600;color:var(--muted);cursor:pointer;transition:.16s}
.bbs-kw i{width:5px;height:5px;flex:none;border-radius:50%;background:var(--yellow)}
.bbs-kw.p i{background:#C2410C}
.bbs-kw:hover{border-color:var(--yellow);background:var(--wash);color:var(--ink)}
.bbs-cta:focus-visible,.bbs-kw:focus-visible,.bbs-seg button:focus-visible{outline:2px solid var(--ink);outline-offset:2px}

@media (prefers-reduced-motion:reduce){.bbs-seg__ind,.bbs-cta,.bbs-kw{transition:none}}

@media (max-width:680px){
  .bbs-card{padding:16px 14px 14px;border-radius:18px}
  .bbs-field{height:auto;flex-wrap:wrap;padding:12px;border-radius:16px;gap:10px}
  .bbs-field>svg{margin-left:2px}
  .bbs-field input{flex:1 1 auto;min-width:0;font-size:1rem}
  .bbs-seg{flex:1 0 100%}
  .bbs-seg button{flex:1;justify-content:center}
  .bbs-cta{flex:1 0 100%;justify-content:center}
  .bbs-suggest{max-height:260px}
}
`;
//#endregion
//#region resources/js/Pages/Home.jsx
var Home_exports = /* @__PURE__ */ __exportAll({ default: () => Home });
function Home({ stack, integrations }) {
	const { props } = usePage();
	const status = props.flash?.status;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Project Base" }), /* @__PURE__ */ jsx("main", {
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
					label: "Breakout Vault starter shell",
					className: "mt-auto border-white/10 bg-white/5 dark:border-white/10 dark:bg-white/5"
				})
			]
		})
	})] });
}
//#endregion
//#region resources/js/landing/data/dummy.js
var BRANDS = [
	{
		name: "Glossier",
		category: "Beauty",
		reach: "4.2M",
		logo: "/landing/brands/glossier.svg"
	},
	{
		name: "GoPure",
		category: "Skincare",
		reach: "1.8M",
		logo: "/landing/brands/gopure.svg"
	},
	{
		name: "Ridge",
		category: "Accessories",
		reach: "3.1M",
		logo: "/landing/brands/ridge.svg"
	},
	{
		name: "Olipop",
		category: "Beverage",
		reach: "6.7M",
		logo: "/landing/brands/olipop.svg"
	},
	{
		name: "Caraway",
		category: "Home",
		reach: "2.4M",
		logo: "/landing/brands/caraway.svg"
	},
	{
		name: "Loops",
		category: "Skincare",
		reach: "980K",
		logo: "/landing/brands/loops.svg"
	},
	{
		name: "Hexclad",
		category: "Kitchen",
		reach: "5.3M",
		logo: "/landing/brands/hexclad.svg"
	},
	{
		name: "Vessi",
		category: "Footwear",
		reach: "1.2M",
		logo: "/landing/brands/vessi.svg"
	},
	{
		name: "Bala",
		category: "Fitness",
		reach: "2.9M",
		logo: "/landing/brands/bala.svg"
	},
	{
		name: "Mud\\Wtr",
		category: "Beverage",
		reach: "3.8M",
		logo: "/landing/brands/mudwtr.svg"
	},
	{
		name: "Solawave",
		category: "Beauty Tech",
		reach: "4.6M",
		logo: "/landing/brands/solawave.svg"
	},
	{
		name: "Jones Road",
		category: "Beauty",
		reach: "7.1M",
		logo: "/landing/brands/jones-road.svg"
	}
];
var FEATURES = [
	{
		id: "outliers",
		tag: "Discovery",
		title: "Breakout Vault",
		body: "Surface the TikToks in your category that broke out this week. The ones running 10× above the creator's own baseline, not just the ones with big follower counts.",
		bullets: [
			"Breakout Score vs creator baseline",
			"Last 7 / 30 / 90 day windows",
			"Sound, hashtag and format tags"
		],
		accent: "from-[#3a2b6b] to-[#8b3df0]"
	},
	{
		id: "tracking",
		tag: "Monitoring",
		title: "Brand Tracking",
		body: "Point Brand Beacon at a brand and get a running feed of every video mentioning it - organic creator posts, affiliate content, and paid spark ads alike.",
		bullets: [
			"Unlimited video bookmarks",
			"Weekly change digest",
			"Share-of-voice trendline"
		],
		accent: "from-[#0f3d5c] to-[#2aa7c4]"
	},
	{
		id: "alerts",
		tag: "Coming soon",
		title: "Virality Alerts",
		body: "Get pinged the moment a video mentioning your brand crosses a threshold you set. Catch the good ones early, and the bad ones earlier.",
		bullets: [
			"Threshold and velocity triggers",
			"Slack and email delivery",
			"Per-search mute rules"
		],
		accent: "from-[#173a2a] to-[#3fbf7a]"
	}
];
var STEPS$1 = [
	{
		n: "01",
		title: "Give us a keyword",
		body: "Enter your brand or a product keyword to start the search.",
		mockup: {
			type: "search",
			label: "Search setup",
			lines: [
				"rhode skin",
				"brand",
				"1 subject only"
			]
		}
	},
	{
		n: "02",
		title: "Keep the keywords that fit",
		body: "We suggest related terms people already use on TikTok. Keep the ones that match what you want to find.",
		mockup: {
			type: "keywords",
			label: "Suggested terms",
			chips: [
				"review",
				"routine",
				"dupe",
				"viral"
			]
		}
	},
	{
		n: "03",
		title: "We show you Breakouts",
		body: "We scan millions of videos and hand back the Viral Breakouts - videos that outperform their creator's average.",
		mockup: {
			type: "results",
			label: "Top hits",
			stats: [
				"4.2M",
				"18x",
				"6 days"
			]
		}
	}
];
var TESTIMONIALS = [
	{
		quote: "We found the creator driving 40% of our category’s TikTok volume in the first search. She was not on any agency list we had been sent.",
		name: "Maya Ellison",
		role: "Head of Growth",
		company: "North Circle Beauty",
		avatar: "/images/landing/testimonials/dana-whitfield.png"
	},
	{
		quote: "Our competitive readout used to be a Friday afternoon of scrolling. Now it lands in Slack on Monday morning and it is more complete.",
		name: "Jordan Pike",
		role: "Brand Marketing Lead",
		company: "Hearth & Pine",
		avatar: "/images/landing/testimonials/marcus-idowu.png"
	},
	{
		quote: "The Breakout Score is the part that matters. Big accounts posting mediocre videos are noise. Brand Beacon filters those out by default.",
		name: "Nina Sethi",
		role: "Social Director",
		company: "Sunset Soda Co.",
		avatar: "/images/landing/testimonials/priya-raman.png"
	},
	{
		quote: "We caught a product complaint trending at 200K views before it hit 2M. That alert alone paid for the year.",
		name: "Owen Mercer",
		role: "VP Communications",
		company: "Forge Kitchenware",
		avatar: "/images/landing/testimonials/tom-bexley.png"
	},
	{
		quote: "I ran one free search to test it and forwarded the results to my CMO the same afternoon. We were on Scale by the end of the week.",
		name: "Elena Rossi",
		role: "Performance Manager",
		company: "Aster Footwear",
		avatar: "/images/landing/testimonials/sofia-marchetti.png"
	},
	{
		quote: "It works for our niche, which is the thing every other tool failed at. Small category, still found 300 relevant videos.",
		name: "Rowan Vale",
		role: "Founder",
		company: "Forme Studio",
		avatar: "/images/landing/testimonials/alex-kerrigan.png"
	}
];
var PRICING = {
	monthly: [
		{
			slug: "free",
			name: "Free",
			price: 0,
			tagline: "One search, no card.",
			cta: "Run a free search",
			features: [
				"1 free search",
				"Unlimited video bookmarks",
				"0 search bookmarks",
				"0 video analysis"
			],
			searchCreditsLimit: 1,
			searchCreditsUsed: 0,
			bookmarkLimit: 0,
			bookmarksUsed: 0,
			videoBookmarkLimit: -1,
			videoBookmarkUsed: 0,
			searchBookmarkLimit: 0,
			searchBookmarkUsed: 0,
			videoAnalysisLimit: 0,
			videoAnalysisUsed: 0,
			trialEnabled: true
		},
		{
			slug: "growth",
			planType: "growth",
			duration: "monthly",
			name: "Growth",
			price: 99,
			annualSavingsPercent: 17,
			tagline: "For a single brand.",
			cta: "Choose Growth",
			popular: true,
			features: [
				"100 searches",
				"100 viral breakout video analysis",
				"Weekly Refresh Scheduling",
				"Virality alerts",
				"Unlimited bookmarks"
			],
			searchCreditsLimit: 100,
			searchCreditsUsed: 0,
			bookmarkLimit: -1,
			bookmarksUsed: 0,
			videoBookmarkLimit: -1,
			videoBookmarkUsed: 0,
			searchBookmarkLimit: -1,
			searchBookmarkUsed: 0,
			videoAnalysisLimit: 100,
			videoAnalysisUsed: 0,
			trialEnabled: true
		},
		{
			slug: "scale",
			planType: "scale",
			duration: "monthly",
			name: "Scale",
			price: 199,
			annualSavingsPercent: 20,
			tagline: "For brand and agency teams.",
			cta: "Choose Scale",
			features: [
				"Unlimited searches",
				"Unlimited viral breakout video analysis",
				"Unlimited bookmarks",
				"Weekly Refresh Scheduling",
				"Virality alerts"
			],
			searchCreditsLimit: -1,
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
	],
	annual: [{
		slug: "growth-annual",
		planType: "growth",
		duration: "annual",
		name: "Growth",
		price: 990,
		annualSavingsPercent: 17,
		tagline: "For a single brand.",
		cta: "Choose Growth Annual",
		popular: true,
		features: [
			"100 searches",
			"100 viral breakout video analysis",
			"Weekly Refresh Scheduling",
			"Virality alerts",
			"Unlimited bookmarks"
		],
		searchCreditsLimit: 100,
		searchCreditsUsed: 0,
		bookmarkLimit: -1,
		bookmarksUsed: 0,
		videoBookmarkLimit: -1,
		videoBookmarkUsed: 0,
		searchBookmarkLimit: -1,
		searchBookmarkUsed: 0,
		videoAnalysisLimit: 100,
		videoAnalysisUsed: 0,
		trialEnabled: true
	}, {
		slug: "scale-annual",
		planType: "scale",
		duration: "annual",
		name: "Scale",
		price: 1899,
		annualSavingsPercent: 20,
		tagline: "For brand and agency teams.",
		cta: "Choose Scale Annual",
		features: [
			"Unlimited searches",
			"Unlimited viral breakout video analysis",
			"Weekly Refresh Scheduling",
			"Virality alerts",
			"Unlimited bookmarks"
		],
		searchCreditsLimit: -1,
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
	}]
};
var PRICING_PLAN_ORDER = [
	"free",
	"growth",
	"growth-annual",
	"scale",
	"scale-annual"
];
var FAQS = [
	{
		q: "What counts as one search?",
		a: "One subject: your brand or a single product. Included are any keywords you attach to widen the search. All of those keywords are covered by that one search, so ticking six terms still only spends one."
	},
	{
		q: "How long does a search take?",
		a: "Most finish around 5 minutes, but can take up to 20 minutes. You can stay on the results page and watch it fill in, or close the tab and we will email you the moment it is ready."
	},
	{
		q: "Why focus on breakouts?",
		a: "A video with 4 million views from a creator with 4 million followers is great, but a video with 4 million views from a creator with 4 thousand followers is something to pay attention to. Breakouts are videos that outperform their creator's average. That's what we want to track."
	},
	{
		q: "Is the free search a trial?",
		a: "No. Your account includes one free search with no credit card required. Starting an 8-day subscription trial is a separate, optional step. A credit card is required for the trial."
	},
	{
		q: "What happens after the 8-day trial?",
		a: "Unless you cancel before the trial ends, we automatically charge your card for the plan and billing cycle you selected at checkout. Monthly plans are billed monthly; annual plans are billed annually."
	},
	{
		q: "How do I cancel my trial?",
		a: "Go to Settings → Subscription and cancel before your trial ends to avoid the subscription charge."
	},
	{
		q: "Is the data real-time?",
		a: "Effectively, yes. Our collection infrastructure tracks Tiktok at scale and routes new videos through the index within hours of them going live. Every index video is continuously re-evaluated by our Breakout Score engine, so the rankings you see are always tied to live performance."
	}
];
//#endregion
//#region resources/js/landing/sections/Hero.jsx
var MODES = [{
	key: "brand",
	label: "Brand",
	icon: Store,
	prompt: "Which brand do you want to research?",
	sample: "rhode skin",
	samples: [
		"rhode skin",
		"rare beauty",
		"summer fridays"
	]
}, {
	key: "product",
	label: "A product",
	icon: Search,
	prompt: "Which product do you want to track?",
	sample: "lip oil",
	samples: [
		"lip oil",
		"blush stick",
		"collagen mask"
	]
}];
function Hero({ onStart }) {
	const [type, setType] = useState("brand");
	const [value, setValue] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [typingText, setTypingText] = useState("");
	const [subjectSuggestions, setSubjectSuggestions] = useState([]);
	const [activeSuggestion, setActiveSuggestion] = useState(-1);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef(null);
	const fieldRef = useRef(null);
	const mode = MODES.find((m) => m.key === type) ?? MODES[0];
	const query = value.trim().replace(/\s+/g, " ");
	const visibleSuggestions = subjectSuggestions.filter((suggestion) => suggestion.label?.trim());
	useEffect(() => {
		const controller = new AbortController();
		fetchKeywordSuggestions(type, value.trim(), { signal: controller.signal }).then((payload) => setSubjectSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : [])).catch(() => {});
		return () => controller.abort();
	}, [type, value]);
	useEffect(() => {
		const close = (event) => {
			if (!fieldRef.current?.contains(event.target)) {
				setShowSuggestions(false);
				setActiveSuggestion(-1);
			}
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, []);
	useEffect(() => {
		if (value) {
			setTypingText("");
			return;
		}
		const samples = mode.samples?.length ? mode.samples : [mode.sample];
		let sampleIndex = 0;
		let charIndex = 0;
		let deleting = false;
		let timeoutId;
		const tick = () => {
			const current = samples[sampleIndex] ?? "";
			if (!deleting) {
				charIndex += 1;
				setTypingText(current.slice(0, charIndex));
				if (charIndex >= current.length) {
					deleting = true;
					timeoutId = window.setTimeout(tick, 1300);
					return;
				}
				timeoutId = window.setTimeout(tick, 75);
				return;
			}
			charIndex -= 1;
			setTypingText(current.slice(0, Math.max(0, charIndex)));
			if (charIndex <= 0) {
				deleting = false;
				sampleIndex = (sampleIndex + 1) % samples.length;
				timeoutId = window.setTimeout(tick, 260);
				return;
			}
			timeoutId = window.setTimeout(tick, 38);
		};
		setTypingText("");
		timeoutId = window.setTimeout(tick, 360);
		return () => window.clearTimeout(timeoutId);
	}, [mode, value]);
	const submit = (e) => {
		e?.preventDefault();
		if (!query) {
			inputRef.current?.focus();
			return;
		}
		onStart(type, query);
	};
	const applySuggestion = (label) => {
		setValue(label);
		setShowSuggestions(false);
		setActiveSuggestion(-1);
		window.requestAnimationFrame(() => inputRef.current?.focus());
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
					children: "Facebook has an ad library. Organic TikTok doesn't. So we built it."
				}),
				/* @__PURE__ */ jsxs("form", {
					className: "box",
					onSubmit: submit,
					children: [
						/* @__PURE__ */ jsxs("p", {
							className: "box__label",
							children: [/* @__PURE__ */ jsx("span", {
								className: "box__step",
								children: "1"
							}), "Pick what you want to search"]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "modes",
							role: "tablist",
							"aria-label": "What to research",
							children: MODES.map(({ key, label, icon: Icon }) => /* @__PURE__ */ jsxs("button", {
								type: "button",
								className: `mode${key === type ? " is-on" : ""}`,
								role: "tab",
								"aria-selected": key === type,
								onClick: () => setType(key),
								children: [/* @__PURE__ */ jsx(Icon, { className: "h-[15px] w-[15px]" }), label]
							}, key))
						}),
						/* @__PURE__ */ jsxs("label", {
							className: "box__label",
							htmlFor: "search-subject",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "box__step",
									children: "2"
								}),
								"Type your ",
								type === "product" ? "product" : "brand name"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "box__field",
							ref: fieldRef,
							children: [
								/* @__PURE__ */ jsx("input", {
									ref: inputRef,
									id: "search-subject",
									maxLength: 80,
									value,
									autoComplete: "off",
									onChange: (e) => {
										setValue(e.target.value);
										setShowSuggestions(true);
									},
									onFocus: () => {
										setIsFocused(true);
										setShowSuggestions(true);
									},
									onBlur: () => setIsFocused(false),
									onKeyDown: (event) => {
										if (!visibleSuggestions.length) return;
										if (event.key === "ArrowDown") {
											event.preventDefault();
											setShowSuggestions(true);
											setActiveSuggestion((current) => (current + 1) % visibleSuggestions.length);
										}
										if (event.key === "ArrowUp") {
											event.preventDefault();
											setShowSuggestions(true);
											setActiveSuggestion((current) => current <= 0 ? visibleSuggestions.length - 1 : current - 1);
										}
										if (event.key === "Enter" && activeSuggestion >= 0 && visibleSuggestions[activeSuggestion]) {
											event.preventDefault();
											applySuggestion(visibleSuggestions[activeSuggestion].label);
										}
										if (event.key === "Escape") {
											setShowSuggestions(false);
											setActiveSuggestion(-1);
										}
									},
									placeholder: "",
									"aria-label": `Type your ${type === "product" ? "product" : "brand name"}`,
									"aria-expanded": showSuggestions && visibleSuggestions.length > 0,
									"aria-haspopup": "listbox"
								}),
								!value && /* @__PURE__ */ jsx("span", {
									className: `box__ghost${isFocused ? " is-focused" : ""}`,
									"aria-hidden": "true",
									children: typingText || mode.sample
								}),
								showSuggestions && visibleSuggestions.length > 0 && /* @__PURE__ */ jsxs("div", {
									className: "hero-suggest",
									role: "listbox",
									"aria-label": `${type} suggestions`,
									children: [/* @__PURE__ */ jsxs("div", {
										className: "hero-suggest__head",
										children: [/* @__PURE__ */ jsxs("span", { children: ["Suggested ", type === "brand" ? "brands" : "products"] }), /* @__PURE__ */ jsx("span", { children: visibleSuggestions.length })]
									}), /* @__PURE__ */ jsx("div", {
										className: "hero-suggest__list",
										children: visibleSuggestions.map((suggestion, index) => /* @__PURE__ */ jsx("button", {
											type: "button",
											className: `hero-suggest__item${index === activeSuggestion ? " is-active" : ""}`,
											onMouseEnter: () => setActiveSuggestion(index),
											onMouseDown: (event) => event.preventDefault(),
											onClick: () => applySuggestion(suggestion.label),
											children: /* @__PURE__ */ jsxs("span", {
												className: "hero-suggest__text",
												children: [/* @__PURE__ */ jsx("strong", { children: suggestion.label }), suggestion.sector && /* @__PURE__ */ jsx("em", { children: suggestion.sector })]
											})
										}, `${suggestion.type}-${suggestion.id}`))
									})]
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "submit",
									className: "btn btn--primary btn--lg btn--pulse",
									children: ["Find breakouts", /* @__PURE__ */ jsx(Arrow, { className: "btn__arrow h-[15px] w-[15px]" })]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "box__foot",
							children: [/* @__PURE__ */ jsx("span", { children: "1 free search · no credit card" }), /* @__PURE__ */ jsx("a", {
								href: "#how",
								children: "See how it works"
							})]
						})
					]
				})
			]
		})
	});
}
//#endregion
//#region resources/js/landing/sections/BrandMarquee.jsx
function Chip({ brand }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "chip",
		children: [/* @__PURE__ */ jsx("span", {
			className: "chip__i",
			children: /* @__PURE__ */ jsx("img", {
				src: brand.logo,
				alt: `${brand.name} logo`,
				loading: "lazy"
			})
		}), /* @__PURE__ */ jsxs("span", {
			className: "chip__copy",
			children: [/* @__PURE__ */ jsx("span", {
				className: "chip__n",
				children: brand.name
			}), /* @__PURE__ */ jsxs("span", {
				className: "chip__m",
				children: [
					brand.category,
					" · ",
					brand.reach
				]
			})]
		})]
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
var OUTLIER_VIDEOS = [
	{
		handle: "@glossier",
		mult: "18×",
		views: "4.2M",
		image: "/images/landing/discovery-coco-shimmy.png"
	},
	{
		handle: "@glowwithtay",
		mult: "12×",
		views: "3.1M",
		image: "/images/landing/discovery-buyer-beware.png"
	},
	{
		handle: "@cleangirl.ari",
		mult: "22×",
		views: "2.8M",
		image: "/images/landing/discovery-brow-grooming.png"
	}
];
var BRAND_FEED = [
	{
		title: "\"the serum that survived my wedding weekend\"",
		meta: "2.1M views · @styledbymia",
		chip: "Affiliate",
		tone: "aff",
		image: "/images/landing/competitor-sourdough-loaf.jpg"
	},
	{
		title: "New drop just landed. Shop the routine.",
		meta: "1.4M views · @glossier",
		chip: "Brand video",
		tone: "brand",
		image: "/images/landing/discovery-coco-shimmy.png"
	},
	{
		title: "glossier dupe vs the real thing, tested",
		meta: "870K views · @honestfinds",
		chip: "UGC",
		tone: "ugc",
		image: "/images/landing/alert-summer-fridays.jpg"
	}
];
var ALERTS = [
	{
		title: "@faithfessel crossed 1.2M views mentioning your brand (14×)",
		meta: "2m ago",
		channel: "Slack"
	},
	{
		title: "@kymieann is climbing fast, +380K views in 6 hours",
		meta: "1h ago",
		channel: "Email"
	},
	{
		title: "A critical review hit 500K views, worth a look",
		meta: "yesterday",
		channel: "Slack"
	}
];
function Features() {
	const [active, setActive] = useState(FEATURES[0].id);
	const [hoverEnabled, setHoverEnabled] = useState(false);
	const current = FEATURES.find((f) => f.id === active) ?? FEATURES[0];
	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
		const media = window.matchMedia("(hover: hover) and (pointer: fine)");
		const sync = () => setHoverEnabled(media.matches);
		sync();
		if (typeof media.addEventListener === "function") {
			media.addEventListener("change", sync);
			return () => media.removeEventListener("change", sync);
		}
		media.addListener(sync);
		return () => media.removeListener(sync);
	}, []);
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
				/* @__PURE__ */ jsxs("h2", { children: ["Everything you need to read ", /* @__PURE__ */ jsx("span", {
					className: "hl",
					children: "TikTok"
				})] }),
				/* @__PURE__ */ jsx("p", { children: "Three tools built on one index. Find what broke out, watch what is moving, and get pinged when something about you starts climbing." })
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "feat__grid",
			children: [/* @__PURE__ */ jsx("div", {
				className: "feat__list",
				children: FEATURES.map((feature) => /* @__PURE__ */ jsxs("div", {
					className: "feat__item",
					children: [/* @__PURE__ */ jsxs("button", {
						type: "button",
						className: `fbtn${feature.id === active ? " is-on" : ""}`,
						onClick: () => setActive(feature.id),
						onMouseEnter: () => {
							if (hoverEnabled) setActive(feature.id);
						},
						onFocus: () => setActive(feature.id),
						"aria-pressed": feature.id === active,
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "fbtn__top",
								children: [
									/* @__PURE__ */ jsx("span", { className: "fdot" }),
									/* @__PURE__ */ jsx("span", {
										className: "fbtn__t",
										children: feature.title
									}),
									/* @__PURE__ */ jsx("span", {
										className: "fbtn__tag",
										children: feature.tag
									})
								]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "fbtn__b",
								children: feature.body
							}),
							/* @__PURE__ */ jsx("ul", {
								className: "fbtn__ul",
								children: feature.bullets.map((bullet) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx(Check$1, { className: "h-[13px] w-[13px]" }), bullet] }, bullet))
							})
						]
					}), feature.id === active && /* @__PURE__ */ jsx("div", {
						className: "feat__mobileprev",
						children: /* @__PURE__ */ jsx(PreviewPane, {
							active,
							current
						})
					})]
				}, feature.id))
			}), /* @__PURE__ */ jsx("div", {
				className: "feat__desktopprev",
				children: /* @__PURE__ */ jsx(PreviewPane, {
					active,
					current
				})
			})]
		})]
	});
}
function PreviewPane({ active, current }) {
	return /* @__PURE__ */ jsxs("div", {
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
				className: `pane${active === "outliers" ? "" : " hide"}`,
				children: /* @__PURE__ */ jsx(VideoGrid, { videos: OUTLIER_VIDEOS })
			}),
			/* @__PURE__ */ jsx("div", {
				className: `pane${active === "tracking" ? "" : " hide"}`,
				children: /* @__PURE__ */ jsxs("div", {
					className: "comp",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "comp__head",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "comp__logo",
									children: /* @__PURE__ */ jsx("img", {
										src: "/landing/brands/glossier.svg",
										alt: "Glossier logo"
									})
								}),
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
									className: "comp__name",
									children: "glossier"
								}), /* @__PURE__ */ jsx("div", {
									className: "comp__sub",
									children: "@glossier · tracked weekly"
								})] }),
								/* @__PURE__ */ jsxs("div", {
									className: "comp__stat",
									children: [/* @__PURE__ */ jsx("span", { children: "Videos this week" }), /* @__PURE__ */ jsxs("strong", { children: [/* @__PURE__ */ jsx(Trend, { className: "h-[13px] w-[13px]" }), "12 new"] })]
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "feed",
							children: BRAND_FEED.map((item) => /* @__PURE__ */ jsxs("div", {
								className: "feed__row",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "feed__thumb",
										children: /* @__PURE__ */ jsx("img", {
											src: item.image,
											alt: ""
										})
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "feed__copy",
										children: [/* @__PURE__ */ jsx("div", {
											className: "feed__title",
											children: item.title
										}), /* @__PURE__ */ jsx("div", {
											className: "feed__meta",
											children: item.meta
										})]
									}),
									/* @__PURE__ */ jsx("span", {
										className: `feed__chip feed__chip--${item.tone}`,
										children: item.chip
									})
								]
							}, item.title))
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "digest",
							children: [/* @__PURE__ */ jsx(Bell, {}), "Weekly digest ready · 12 new videos, 2 breakouts"]
						})
					]
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: `pane${active === "alerts" ? "" : " hide"}`,
				children: /* @__PURE__ */ jsxs("div", {
					className: "alerts",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "threshold",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "threshold__title",
								children: "Alert me when a video mentioning my brand crosses"
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "threshold__rules",
								children: [
									/* @__PURE__ */ jsx("span", { children: "1M views" }),
									"or",
									/* @__PURE__ */ jsx("span", { children: "10× breakout" })
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "deliver",
								children: [/* @__PURE__ */ jsxs("span", {
									className: "deliver__btn is-on",
									children: [/* @__PURE__ */ jsx("i", {}), "Slack"]
								}), /* @__PURE__ */ jsxs("span", {
									className: "deliver__btn is-on",
									children: [/* @__PURE__ */ jsx("i", {}), "Email"]
								})]
							})
						]
					}), /* @__PURE__ */ jsx("div", {
						className: "alerts__list",
						children: ALERTS.map((alert) => /* @__PURE__ */ jsxs("div", {
							className: "alert",
							children: [/* @__PURE__ */ jsx("span", {
								className: "alert__icon",
								children: /* @__PURE__ */ jsx(Bell, {})
							}), /* @__PURE__ */ jsxs("div", {
								className: "alert__body",
								children: [/* @__PURE__ */ jsx("div", {
									className: "alert__title",
									children: alert.title
								}), /* @__PURE__ */ jsxs("div", {
									className: "alert__meta",
									children: [alert.meta, /* @__PURE__ */ jsx("span", { children: alert.channel })]
								})]
							})]
						}, alert.title))
					})]
				})
			})
		]
	});
}
function VideoGrid({ videos }) {
	return /* @__PURE__ */ jsx("div", {
		className: "prev__vids",
		children: videos.map((v, index) => /* @__PURE__ */ jsxs("div", { children: [
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
		] }, `${v.handle}-${index}`))
	});
}
function Bell() {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		"aria-hidden": "true",
		children: /* @__PURE__ */ jsx("path", {
			d: "M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0",
			stroke: "currentColor",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			strokeWidth: "2"
		})
	});
}
//#endregion
//#region resources/js/landing/sections/HowItWorks.jsx
function StepMockup({ step }) {
	const mockup = step.mockup ?? {};
	if (mockup.type === "search") return /* @__PURE__ */ jsxs("div", {
		className: "step__mock step__mock--search",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "step__mockbar",
				children: mockup.label
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "step__searchbox",
				children: [/* @__PURE__ */ jsx("span", { children: mockup.lines?.[0] }), /* @__PURE__ */ jsx("i", {})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "step__stack",
				children: mockup.lines?.slice(1).map((line) => /* @__PURE__ */ jsx("span", { children: line }, line))
			})
		]
	});
	if (mockup.type === "keywords") return /* @__PURE__ */ jsxs("div", {
		className: "step__mock step__mock--keywords",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ jsx("div", {
			className: "step__mockbar",
			children: mockup.label
		}), /* @__PURE__ */ jsx("div", {
			className: "step__chips",
			children: mockup.chips?.map((chip, index) => /* @__PURE__ */ jsx("span", {
				className: index < 2 ? "is-on" : "",
				children: chip
			}, chip))
		})]
	});
	if (mockup.type === "results") return /* @__PURE__ */ jsxs("div", {
		className: "step__mock step__mock--results",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "step__mockbar",
				children: mockup.label
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "step__thumbs",
				children: [
					/* @__PURE__ */ jsx("span", {}),
					/* @__PURE__ */ jsx("span", {}),
					/* @__PURE__ */ jsx("span", {})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "step__metrics",
				children: mockup.stats?.map((stat) => /* @__PURE__ */ jsx("b", { children: stat }, stat))
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "step__mock step__mock--alerts",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "step__mockbar",
				children: mockup.label
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "step__notice",
				children: [/* @__PURE__ */ jsx("strong", { children: mockup.lines?.[0] }), /* @__PURE__ */ jsx("span", { children: mockup.lines?.[1] })]
			}),
			/* @__PURE__ */ jsx("div", { className: "step__pulse" })
		]
	});
}
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
						/* @__PURE__ */ jsx("h2", { children: "One subject in, Breakout videos out" }),
						/* @__PURE__ */ jsx("p", { children: "Give us one keyword and we handle the rest." })
					]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "steps",
					children: STEPS$1.map((step) => /* @__PURE__ */ jsxs("div", {
						className: "step",
						children: [
							/* @__PURE__ */ jsx(StepMockup, { step }),
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
			/* @__PURE__ */ jsxs("figcaption", { children: [/* @__PURE__ */ jsx("img", {
				className: "tav",
				src: t.avatar,
				alt: t.name,
				loading: "lazy"
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
				children: [/* @__PURE__ */ jsx("p", {
					className: "eyebrow",
					children: "Customers"
				}), /* @__PURE__ */ jsx("h2", { children: "Why brand teams switch to Brand Beacon" })]
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
//#region resources/js/utils/pricing.js
function usd(amount) {
	const value = Number(amount ?? 0);
	const hasCents = !Number.isInteger(value);
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: hasCents ? 2 : 0,
		maximumFractionDigits: 2
	}).format(value);
}
function displayedMonthlyRate(plan) {
	const total = Number(plan?.price ?? 0);
	return usd(plan?.duration === "annual" ? total / 12 : total);
}
function annualBillingNote(plan) {
	return `Billed ${usd(plan?.price)} annually. Save ${Number(plan?.annualSavingsPercent ?? 0)}%`;
}
//#endregion
//#region resources/js/landing/sections/Pricing.jsx
function Pricing({ plans = [], onStart, onTrial }) {
	const [billingCycle, setBillingCycle] = useState("monthly");
	const sortedPlans = (plans.length > 0 ? [...plans] : [...PRICING.monthly, ...PRICING.annual]).sort((a, b) => {
		const aKey = a.slug ?? a.name?.toLowerCase();
		const bKey = b.slug ?? b.name?.toLowerCase();
		const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
		const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);
		return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
	});
	const visiblePlans = useMemo(() => sortedPlans.filter((plan) => plan.slug === "free" || (plan.duration ?? "monthly") === billingCycle), [billingCycle, sortedPlans]);
	const annualBanner = useMemo(() => {
		const percents = sortedPlans.filter((plan) => plan.price > 0 && (plan.duration ?? "monthly") === "annual").map((plan) => Number(plan.annualSavingsPercent ?? 0)).filter((value) => value > 0);
		return percents.length > 0 ? Math.max(...percents) : 0;
	}, [sortedPlans]);
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
						/* @__PURE__ */ jsx("h2", { children: "Start with one free search" }),
						/* @__PURE__ */ jsx("p", { children: "Create an account to run one free search. No credit card required. For ongoing tracking, choose a subscription plan." }),
						/* @__PURE__ */ jsxs("div", {
							className: "toggle",
							children: [/* @__PURE__ */ jsx("button", {
								className: billingCycle === "monthly" ? "is-on" : "",
								type: "button",
								onClick: () => setBillingCycle("monthly"),
								children: "Monthly"
							}), /* @__PURE__ */ jsxs("button", {
								className: billingCycle === "annual" ? "is-on" : "",
								type: "button",
								onClick: () => setBillingCycle("annual"),
								children: ["Annual", annualBanner > 0 ? ` · save up to ${annualBanner}%` : ""]
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
									children: [free ? "$0" : displayedMonthlyRate(plan), !free && /* @__PURE__ */ jsx("span", { children: "/mo" })]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "plan__s",
									children: free ? "1 free search after signup · No credit card required" : billingCycle === "annual" ? annualBillingNote(plan) : "$0 for 8 days"
								}),
								/* @__PURE__ */ jsx("ul", { children: plan.features.map((feature) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx(Check$1, { className: "h-[15px] w-[15px]" }), feature] }, feature)) }),
								free ? /* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--ghost btn--wide",
									onClick: () => onStart(),
									children: "Run a free search"
								}) : /* @__PURE__ */ jsx("button", {
									type: "button",
									className: `btn btn--wide ${plan.popular ? "btn--primary" : "btn--ghost"}`,
									onClick: () => onTrial(plan, billingCycle),
									children: "Try free for 8 days"
								})
							]
						}, plan.slug);
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "trial",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h3", { children: "Start an 8-day Growth trial" }), /* @__PURE__ */ jsx("p", { children: "Try Growth free for 8 days. A credit card is required. Your selected subscription starts automatically when the trial ends unless you cancel beforehand." })] }), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn--ink",
						style: { flex: "none" },
						onClick: () => onTrial(visiblePlans.find((p) => p.planType === "growth"), billingCycle),
						children: "Start 8-day trial"
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
				/* @__PURE__ */ jsx("div", {
					className: "final__ctas",
					children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "btn btn--ink btn--lg",
						onClick: () => onStart(),
						children: ["Start free", /* @__PURE__ */ jsx(Arrow, { className: "btn__arrow h-[15px] w-[15px]" })]
					})
				}),
				/* @__PURE__ */ jsx("p", {
					className: "final__n",
					children: "1 free search after signup · No credit card required"
				})
			]
		})
	});
}
//#endregion
//#region resources/js/landing/components/SupportLauncher.jsx
function SupportLauncher() {
	return /* @__PURE__ */ jsxs(Link, {
		href: "/support",
		className: "support-launcher",
		"aria-label": "Open Brand Beacon support",
		children: [/* @__PURE__ */ jsx("span", { children: "Quick FAQs" }), /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Comment, { className: "h-5 w-5" }) })]
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
	const startTrial = (plan, cycle = "monthly") => window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(plan?.slug ?? "growth")}&trial=1&cycle=${encodeURIComponent(cycle)}`);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Seo, {
		title: "TikTok Trend Intelligence for Brands | Brand Beacon",
		description: "Discover viral TikTok videos, track brand mentions, and spot breakout trends before they peak with Brand Beacon.",
		schema: {
			organization: true,
			webSite: true,
			softwareApplication: { description: "Brand Beacon helps teams discover viral TikTok videos, track brand mentions, and identify breakout trends." },
			faqs: FAQS
		}
	}), /* @__PURE__ */ jsxs("div", {
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
			/* @__PURE__ */ jsx(Footer, {}),
			/* @__PURE__ */ jsx(SupportLauncher, {})
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
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Seo, {
		title: "Contact Brand Beacon | TikTok Trend Intelligence",
		description: "Contact the Brand Beacon team for product, account, billing, or partnership support."
	}), /* @__PURE__ */ jsxs("div", {
		ref: revealRoot,
		className: "vvf-landing min-h-screen font-body",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "bbh",
				children: /* @__PURE__ */ jsx(Nav, {
					theme,
					onToggleTheme: toggle,
					onStart: startSearch
				})
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
			/* @__PURE__ */ jsx("div", {
				className: "bbh",
				children: /* @__PURE__ */ jsx(Footer, {})
			})
		]
	})] });
}
//#endregion
//#region resources/js/landing/data/solutions.js
var SOLUTIONS = {
	"brand-tracking": {
		path: "/tiktok-brand-tracking",
		title: "TikTok Brand Tracking | Brand Beacon",
		description: "Track TikTok brand mentions, breakout videos, and creator conversations with Brand Beacon.",
		eyebrow: "TikTok brand tracking",
		navLabel: "Brand Tracking",
		heading: "Know when your brand starts moving on TikTok.",
		intro: "Brand Beacon turns one brand name into a focused view of the videos, creators, and conversations gaining momentum around it.",
		searchType: "brand",
		searchLabel: "Track your brand",
		signal: [
			"Brand and product mentions",
			"Breakout performance versus creator baseline",
			"Weekly changes worth reviewing"
		],
		workflow: [
			["Start with the name people use", "Search your brand, a product line, or the terms customers actually type in captions and hashtags."],
			["Keep the context that matters", "Add supporting keywords to separate relevant creator posts, affiliate content, and reviews from unrelated mentions."],
			["Review what broke out", "Prioritize unusual performance so your team can study the posts that are gaining traction, not just the largest accounts."]
		],
		outcomes: [
			"Find emerging creator conversations before they become obvious.",
			"Use real breakout posts to inform creative briefs and response plans.",
			"Keep one repeatable research workflow for brand and product teams."
		]
	},
	"product-research": {
		path: "/tiktok-product-research",
		title: "TikTok Product Research | Brand Beacon",
		description: "Research product demand, reviews, and breakout TikTok creative with Brand Beacon.",
		eyebrow: "TikTok product research",
		navLabel: "Product Research",
		heading: "Turn TikTok product chatter into research your team can use.",
		intro: "Use Brand Beacon to see how a product is described, demonstrated, compared, and reviewed in the TikTok videos that are outperforming expectations.",
		searchType: "product",
		searchLabel: "Research a product",
		signal: [
			"Product demonstrations and reviews",
			"Language customers use in the wild",
			"High-performing creative patterns"
		],
		workflow: [
			["Search one product concept", "Begin with the product name, category phrase, or problem the product solves."],
			["Add the terms that define the angle", "Use supporting keywords for use cases, claims, ingredients, formats, comparisons, or customer objections."],
			["Study the strongest evidence", "Review the breakout videos and their context to find useful creative language and product education angles."]
		],
		outcomes: [
			"Ground product messaging in the language audiences already use.",
			"Find demonstrations and reviews that make a product easier to understand.",
			"Spot creative angles worth testing before they become familiar."
		]
	},
	"viral-video-monitoring": {
		path: "/viral-video-monitoring",
		title: "Viral Video Monitoring for TikTok | Brand Beacon",
		description: "Monitor viral TikTok videos and identify genuine breakouts with Brand Beacon.",
		eyebrow: "Viral video monitoring",
		navLabel: "Viral Video Monitoring",
		heading: "Monitor the TikTok videos that are breaking out, not just getting views.",
		intro: "A large view count alone does not tell you what is unusual. Brand Beacon helps you find videos performing well above a creator's typical baseline.",
		searchType: "brand",
		searchLabel: "Monitor a topic",
		signal: [
			"Breakout performance signals",
			"Fresh videos around a defined subject",
			"Creator, format, and caption context"
		],
		workflow: [
			["Define the subject to watch", "Set a brand, product, or category phrase that gives the monitoring workflow a clear frame."],
			["Collect relevant videos", "Use supporting context to improve relevance while keeping the search broad enough to surface unexpected creative."],
			["Rank by unusual performance", "Review the strongest breakouts first, then use the surrounding creator and post context to decide what matters."]
		],
		outcomes: [
			"Spend less time sorting through ordinary high-view content.",
			"Catch unusual momentum while it is still useful to your team.",
			"Build a more consistent source of creative and category intelligence."
		]
	},
	"ugc-trend-discovery": {
		path: "/ugc-trend-discovery",
		title: "TikTok UGC Trend Discovery | Brand Beacon",
		description: "Discover TikTok UGC trends, breakout creators, and creative formats with Brand Beacon.",
		eyebrow: "TikTok UGC trend discovery",
		navLabel: "UGC Trend Discovery",
		heading: "Find the creator-led TikTok trends behind the next creative brief.",
		intro: "Brand Beacon helps teams discover breakout UGC patterns around a brand, product, or category, then study the videos that made those patterns travel.",
		searchType: "product",
		searchLabel: "Discover UGC trends",
		signal: [
			"Creator-led product storytelling",
			"Repeatable hooks and demonstrations",
			"Breakout posts around your category"
		],
		workflow: [
			["Start with a product or category", "Use a phrase that reflects the audience, problem, or product story you want to explore."],
			["Add the creative context", "Include supporting terms for routines, comparisons, demonstrations, reviews, or other relevant UGC formats."],
			["Turn breakouts into patterns", "Review the strongest posts together to identify recurring hooks, claims, visual treatments, and creator perspectives."]
		],
		outcomes: [
			"Find UGC inspiration grounded in current category behavior.",
			"Give creators and marketers examples with real audience traction.",
			"Separate repeatable patterns from one-off viral moments."
		]
	}
};
var SOLUTION_LINKS = Object.entries(SOLUTIONS).map(([key, solution]) => ({
	key,
	path: solution.path,
	label: solution.navLabel
}));
//#endregion
//#region resources/js/Pages/LandingSolution.jsx
var LandingSolution_exports = /* @__PURE__ */ __exportAll({ default: () => LandingSolution });
function LandingSolution({ topic }) {
	const solution = SOLUTIONS[topic];
	if (!solution) return null;
	const related = SOLUTION_LINKS.filter((link) => link.key !== topic);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Seo, {
		title: solution.title,
		description: solution.description
	}), /* @__PURE__ */ jsxs("div", {
		className: "bbh solution-page",
		children: [
			/* @__PURE__ */ jsx(Nav, { homeHref: "/" }),
			/* @__PURE__ */ jsxs("main", { children: [
				/* @__PURE__ */ jsx("section", {
					className: "solution-hero",
					children: /* @__PURE__ */ jsxs("div", {
						className: "wrap solution-hero__grid",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "solution-hero__copy",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "eyebrow",
									children: solution.eyebrow
								}),
								/* @__PURE__ */ jsx("h1", { children: solution.heading }),
								/* @__PURE__ */ jsx("p", { children: solution.intro }),
								/* @__PURE__ */ jsxs("div", {
									className: "solution-hero__actions",
									children: [/* @__PURE__ */ jsxs(Link, {
										href: `/search?type=${solution.searchType}`,
										className: "btn btn--primary btn--lg",
										children: [solution.searchLabel, /* @__PURE__ */ jsx(Arrow, { className: "btn__arrow h-[15px] w-[15px]" })]
									}), /* @__PURE__ */ jsx("a", {
										href: "#workflow",
										className: "solution-text-link",
										children: "See the workflow"
									})]
								})
							]
						}), /* @__PURE__ */ jsxs("aside", {
							className: "solution-signal",
							"aria-label": "What you can monitor",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "solution-signal__head",
									children: [/* @__PURE__ */ jsx(Trend, { className: "h-4 w-4" }), " Signal stack"]
								}),
								solution.signal.map((item, index) => /* @__PURE__ */ jsxs("div", {
									className: "solution-signal__row",
									children: [/* @__PURE__ */ jsx("span", { children: String(index + 1).padStart(2, "0") }), /* @__PURE__ */ jsx("p", { children: item })]
								}, item)),
								/* @__PURE__ */ jsxs("div", {
									className: "solution-signal__foot",
									children: [/* @__PURE__ */ jsx("i", {}), " Built for repeatable research"]
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "solution-section wrap",
					id: "workflow",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "solution-section__head",
						children: [/* @__PURE__ */ jsx("p", {
							className: "eyebrow",
							children: "A focused workflow"
						}), /* @__PURE__ */ jsx("h2", { children: "From one subject to useful TikTok evidence." })]
					}), /* @__PURE__ */ jsx("div", {
						className: "solution-steps",
						children: solution.workflow.map(([title, body], index) => /* @__PURE__ */ jsxs("article", {
							className: "solution-step",
							children: [
								/* @__PURE__ */ jsx("span", { children: String(index + 1).padStart(2, "0") }),
								/* @__PURE__ */ jsx("h3", { children: title }),
								/* @__PURE__ */ jsx("p", { children: body })
							]
						}, title))
					})]
				}),
				/* @__PURE__ */ jsx("section", {
					className: "solution-outcomes",
					children: /* @__PURE__ */ jsxs("div", {
						className: "wrap solution-outcomes__grid",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "eyebrow",
							children: "What this unlocks"
						}), /* @__PURE__ */ jsx("h2", { children: "Better questions, better creative decisions." })] }), /* @__PURE__ */ jsx("ul", { children: solution.outcomes.map((outcome) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx(Check$1, { className: "h-4 w-4" }), outcome] }, outcome)) })]
					})
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "solution-related wrap",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "eyebrow",
							children: "Explore more"
						}),
						/* @__PURE__ */ jsx("h2", { children: "More ways to research TikTok." }),
						/* @__PURE__ */ jsx("div", { children: related.map((link) => /* @__PURE__ */ jsxs(Link, {
							href: link.path,
							className: "solution-related__link",
							children: [link.label, /* @__PURE__ */ jsx(Arrow, { className: "h-4 w-4" })]
						}, link.key)) })
					]
				})
			] }),
			/* @__PURE__ */ jsx(Footer, { homeHref: "/" })
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
function planTier(plan) {
	const slug = String(plan?.slug ?? "").toLowerCase();
	const type = String(plan?.planType ?? "").toLowerCase();
	if (type === "scale" || slug.startsWith("scale")) return 2;
	if (type === "growth" || slug.startsWith("growth")) return 1;
	return 0;
}
function formatUsd(amount) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(amount);
}
function Plans() {
	const { billing: billingState = {}, pricingPlans = [], flash = {} } = usePage().props;
	const current = String(billingState.currentPlan ?? "free").toLowerCase();
	const isTrialing = Boolean(billingState.isTrialing);
	const hasUsedTrial = Boolean(billingState.hasUsedTrial);
	const isActivePaidGrowth = current.startsWith("growth") && !isTrialing;
	const [trialPromptOpen, setTrialPromptOpen] = useState(Boolean(flash.trialAccessPrompt));
	const [upgradeError, setUpgradeError] = useState(null);
	const [isUpgrading, setIsUpgrading] = useState(false);
	const [pendingPlanChange, setPendingPlanChange] = useState(null);
	const orderedPlans = [...pricingPlans].sort((a, b) => {
		const aKey = a.slug ?? a.name?.toLowerCase();
		const bKey = b.slug ?? b.name?.toLowerCase();
		const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
		const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);
		return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
	});
	const currentPlan = orderedPlans.find((plan) => plan.slug === current);
	const currentTier = planTier(currentPlan);
	const [billingCycle, setBillingCycle] = useState((currentPlan?.duration ?? "monthly") === "annual" ? "annual" : "monthly");
	const monthlyCtasDisabled = (currentPlan?.duration ?? "monthly") === "annual" && billingCycle === "monthly";
	const isAnnualGrowth = current === "growth-annual" && billingCycle === "annual";
	const visiblePlans = orderedPlans.filter((plan) => plan.slug === "free" || (plan.duration ?? "monthly") === billingCycle);
	const annualBanner = useMemo(() => {
		const percents = orderedPlans.filter((plan) => (plan.duration ?? "monthly") === "annual").map((plan) => Number(plan.annualSavingsPercent ?? 0)).filter((value) => value > 0);
		return percents.length > 0 ? Math.max(...percents) : 0;
	}, [orderedPlans]);
	const upgrade = (slug, cycle = billingCycle) => billing.checkout(slug, cycle);
	const upgradeToScale = async (slug) => {
		if (isUpgrading) return;
		setIsUpgrading(true);
		try {
			await billing.upgrade(slug);
			window.location.assign("/settings/subscription");
		} catch (error) {
			setUpgradeError(error.message || "The Scale upgrade could not be completed.");
		} finally {
			setIsUpgrading(false);
		}
	};
	const canOfferTrial = !hasUsedTrial && !isTrialing;
	const startPlan = (slug, cycle = billingCycle) => canOfferTrial ? billing.trialCheckout(slug, cycle) : billing.checkout(slug, cycle);
	const beginPlanChange = (plan) => {
		const isInPlaceScaleUpgrade = currentTier === 1 && planTier(plan) === 2 && (plan.duration ?? "monthly") === "monthly";
		if (!isTrialing && (currentPlan?.duration ?? "monthly") === "monthly" && currentTier > 0 && (isInPlaceScaleUpgrade || (plan.duration ?? "monthly") === "annual")) {
			setPendingPlanChange({
				plan,
				isInPlaceScaleUpgrade
			});
			return;
		}
		if (isInPlaceScaleUpgrade) {
			upgradeToScale(plan.slug);
			return;
		}
		startPlan(plan.slug, billingCycle);
	};
	const confirmPlanChange = () => {
		if (pendingPlanChange === null) return;
		const { plan, isInPlaceScaleUpgrade } = pendingPlanChange;
		setPendingPlanChange(null);
		if (isInPlaceScaleUpgrade) {
			upgradeToScale(plan.slug);
			return;
		}
		startPlan(plan.slug, billingCycle);
	};
	const promptPlanSlug = flash.trialAccessPrompt?.plan_slug ?? visiblePlans.find((plan) => plan.planType === "growth")?.slug ?? "growth";
	const pendingPlan = pendingPlanChange?.plan;
	const pendingAdditionalCharge = pendingPlan && currentPlan ? Math.max(0, Number(pendingPlan.price ?? 0) - Number(currentPlan.price ?? 0)) : 0;
	useEffect(() => {
		setTrialPromptOpen(Boolean(flash.trialAccessPrompt));
	}, [flash.trialAccessPrompt]);
	const priceLine = (plan) => {
		const annual = billingCycle === "annual";
		if ((plan.price ?? 0) <= 0) return {
			amount: "$0",
			suffix: "/mo",
			subline: ""
		};
		if (!hasUsedTrial || isTrialing) return {
			amount: displayedMonthlyRate(plan),
			suffix: "/mo",
			subline: annual ? annualBillingNote(plan) : "$0 for 8 days"
		};
		return {
			amount: displayedMonthlyRate(plan),
			suffix: "/mo",
			subline: annual ? annualBillingNote(plan) : ""
		};
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Plans · Brand Beacon" }), /* @__PURE__ */ jsxs(SettingsShell, {
		section: "plans",
		children: [
			/* @__PURE__ */ jsx(UpgradePromptModal, {
				open: trialPromptOpen,
				eyebrow: "Trial already used",
				title: "Your 8-day trial has already been used",
				body: "This account already finished its free trial, so the next step is a paid upgrade.",
				detail: "You can still unlock scheduled tracking, bookmarks, and video analysis right away.",
				primaryLabel: "Upgrade to Growth",
				onPrimary: () => upgrade(promptPlanSlug),
				secondaryLabel: "Maybe later",
				onSecondary: () => setTrialPromptOpen(false),
				onClose: () => setTrialPromptOpen(false)
			}),
			/* @__PURE__ */ jsx(UpgradePromptModal, {
				open: Boolean(upgradeError),
				eyebrow: "Scale upgrade",
				title: "Upgrade not completed",
				body: upgradeError,
				primaryLabel: "Got it",
				secondaryLabel: null,
				onPrimary: () => setUpgradeError(null),
				onClose: () => setUpgradeError(null)
			}),
			/* @__PURE__ */ jsx(UpgradePromptModal, {
				open: pendingPlanChange !== null,
				eyebrow: pendingPlanChange?.isInPlaceScaleUpgrade ? "Scale upgrade" : "Annual plan review",
				title: pendingPlanChange?.isInPlaceScaleUpgrade ? "Confirm your Scale upgrade" : `Continue to ${pendingPlan?.name ?? "your"} annual plan`,
				body: pendingPlanChange?.isInPlaceScaleUpgrade ? `Charge today: ${formatUsd(pendingAdditionalCharge)} — the difference between Growth and Scale.` : `You will continue to Stripe to review the ${pendingPlan?.name} annual plan and confirm payment.`,
				detail: pendingPlanChange?.isInPlaceScaleUpgrade ? "Your renewal date and usage stay the same. Scale limits apply immediately." : `The annual plan is ${formatUsd(Number(pendingPlan?.price ?? 0))} per year. Stripe will show the final payment details before any charge is made.`,
				emphasis: null,
				primaryLabel: pendingPlanChange?.isInPlaceScaleUpgrade ? "Confirm and charge" : "Review in Stripe",
				primaryDisabled: isUpgrading,
				onPrimary: confirmPlanChange,
				secondaryLabel: "Keep current plan",
				onSecondary: () => setPendingPlanChange(null),
				onClose: () => setPendingPlanChange(null)
			}),
			/* @__PURE__ */ jsxs("div", {
				style: { marginBottom: 18 },
				children: [
					/* @__PURE__ */ jsx("h2", { children: "Plans" }),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							fontSize: ".86rem",
							marginTop: 6
						},
						children: "Start with one free search. Upgrade when you want tracking on a schedule."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "toggle",
						style: { marginTop: 16 },
						children: [/* @__PURE__ */ jsx("button", {
							className: billingCycle === "monthly" ? "is-on" : "",
							type: "button",
							onClick: () => setBillingCycle("monthly"),
							children: "Monthly"
						}), /* @__PURE__ */ jsxs("button", {
							className: billingCycle === "annual" ? "is-on" : "",
							type: "button",
							onClick: () => setBillingCycle("annual"),
							children: ["Annual", annualBanner > 0 ? ` · save up to ${annualBanner}%` : ""]
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "plans",
				children: visiblePlans.map((plan) => {
					const isCurrent = plan.slug === current;
					const isFree = plan.slug === "free";
					const isScale = plan.planType === "scale" || plan.slug === "scale" || plan.slug === "scale-annual";
					const isGrowthToScaleUpgrade = isScale && isActivePaidGrowth && (plan.duration ?? "monthly") === "monthly";
					const isAnnualGrowthToScale = isScale && isAnnualGrowth;
					const isLowerTier = !isFree && !isTrialing && planTier(plan) < currentTier;
					const contactHref = `/contact?category=plan-upgrade&subject=${encodeURIComponent(`Interested in the ${plan.name} annual plan`)}`;
					const price = priceLine(plan);
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
								children: [price.amount, price.suffix && /* @__PURE__ */ jsx("span", { children: price.suffix })]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "plan__s",
								children: price.subline || (isCurrent ? "Your current plan" : plan.price > 0 ? "Billed monthly" : "")
							}),
							/* @__PURE__ */ jsx("ul", { children: plan.features.map((feature) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx(Check$1, { className: "h-3.5 w-3.5" }), feature] }, feature)) }),
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
							}) : isLowerTier ? /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "btn btn--g btn--w",
								disabled: true,
								title: "Your account already has a higher plan.",
								children: "Lower plan locked"
							}) : monthlyCtasDisabled ? /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "btn btn--g btn--w",
								disabled: true,
								title: "Your annual plan is active. Choose an annual plan to change tiers.",
								children: "Annual plan active"
							}) : isAnnualGrowthToScale ? /* @__PURE__ */ jsxs(Link, {
								href: contactHref,
								className: "btn btn--y btn--w",
								children: ["Contact Us ", /* @__PURE__ */ jsx(Arrow, {})]
							}) : isGrowthToScaleUpgrade ? /* @__PURE__ */ jsxs("button", {
								type: "button",
								className: "btn btn--y btn--w",
								disabled: isUpgrading,
								onClick: () => beginPlanChange(plan),
								children: [
									isUpgrading ? "Upgrading..." : `Upgrade to ${plan.name}`,
									" ",
									/* @__PURE__ */ jsx(Arrow, {})
								]
							}) : /* @__PURE__ */ jsxs("button", {
								type: "button",
								className: "btn btn--y btn--w",
								onClick: () => beginPlanChange(plan),
								children: [
									canOfferTrial ? "Try free for 8 days" : `Upgrade to ${plan.name}`,
									" ",
									/* @__PURE__ */ jsx(Arrow, {})
								]
							})
						]
					}, plan.slug);
				})
			})
		]
	})] });
}
//#endregion
//#region resources/js/Pages/PrivacyPolicy.jsx
var PrivacyPolicy_exports = /* @__PURE__ */ __exportAll({ default: () => PrivacyPolicy });
var sections$2 = [
	{
		heading: "1. Information We Collect",
		paragraphs: [
			"We collect information you provide directly to us, including account details such as your name, email address, password, company or brand information, billing details, support messages, and any information you submit while creating or managing searches.",
			"We also collect service data generated through your use of Brand Beacon, such as saved searches, keywords, bookmarks, video-analysis requests, subscription status, usage counts, settings, and activity needed to operate the product.",
			"Like most online services, we may automatically collect technical and usage information such as IP address, browser type, device information, pages viewed, referring URLs, timestamps, and cookie or session data."
		]
	},
	{
		heading: "2. How We Use Information",
		paragraphs: ["We use information to provide, maintain, secure, and improve Brand Beacon, including operating search workflows, storing results, preserving media references, processing subscriptions, sending transactional messages, analyzing product usage, preventing abuse, and supporting customers.", "We may also use information to communicate with you about your account, product updates, pricing, legal notices, and marketing messages where permitted by law. You can opt out of non-essential marketing emails at any time."]
	},
	{
		heading: "3. Search Data and Third-Party Sources",
		paragraphs: ["Brand Beacon surfaces analytics, search results, and media-related information derived from third-party platforms and service providers. That information can change, become unavailable, or be removed by those platforms at any time.", "We may use service providers to help retrieve, process, enrich, host, store, deliver, or analyze data used within the product. We do not promise that third-party data will always be complete, current, or continuously available."]
	},
	{
		heading: "4. Sharing of Information",
		paragraphs: [
			"We may share information with vendors and service providers that help us operate Brand Beacon, including providers supporting authentication, billing, communications, infrastructure, storage, analytics, and search-related processing.",
			"We may also disclose information when reasonably necessary to comply with law, enforce our terms, protect the rights or safety of Brand Beacon, our users, or others, or in connection with a merger, financing, acquisition, or sale of assets.",
			"We do not sell your personal information for money."
		]
	},
	{
		heading: "5. Cookies and Similar Technologies",
		paragraphs: ["We use cookies, local storage, and similar technologies to keep you signed in, remember preferences, maintain sessions, attribute traffic, improve performance, and understand how the service is used.", "Your browser may allow you to block or remove cookies, but parts of Brand Beacon may not function properly if you do so."]
	},
	{
		heading: "6. Data Retention",
		paragraphs: ["We retain information for as long as reasonably necessary to provide the service, comply with legal obligations, resolve disputes, enforce agreements, and maintain business records.", "Search records, analytics, billing records, and related operational logs may persist for a period of time even after an account is closed or a deletion request is submitted where retention is necessary for security, legal, accounting, or legitimate business purposes."]
	},
	{
		heading: "7. Security",
		paragraphs: ["We use reasonable administrative, technical, and organizational measures designed to protect personal information. However, no system is perfectly secure, and we cannot guarantee absolute security."]
	},
	{
		heading: "8. Your Choices and Rights",
		paragraphs: ["Depending on where you live, you may have rights to access, correct, delete, or restrict certain personal information, or to object to certain processing. You may also have the right to request a copy of certain information.", "To make a privacy request, contact us at hello@brandbeacon.com. We may need to verify your identity before completing your request."]
	},
	{
		heading: "9. Children",
		paragraphs: ["Brand Beacon is not directed to children, and we do not knowingly collect personal information from children under 13."]
	},
	{
		heading: "10. International Processing",
		paragraphs: ["Your information may be processed or stored in countries other than your own, including where our vendors or infrastructure providers operate. By using the service, you understand that information may be transferred to jurisdictions with different data-protection laws."]
	},
	{
		heading: "11. Changes to This Policy",
		paragraphs: ["We may update this Privacy Policy from time to time. If we make material changes, we will post the updated version on this page and may provide additional notice through the product or by email where appropriate."]
	},
	{
		heading: "12. Contact Us",
		paragraphs: ["If you have questions about this Privacy Policy or our privacy practices, contact us at hello@brandbeacon.com."]
	}
];
function PrivacyPolicy() {
	return /* @__PURE__ */ jsx(LegalPage, {
		title: "Privacy Policy",
		effectiveDate: "August 29, 2026",
		sections: sections$2
	});
}
//#endregion
//#region resources/js/Pages/Products.jsx
var Products_exports = /* @__PURE__ */ __exportAll({ default: () => Products });
function Products({ searches = [], moving = [], suggestions = [], prefillQuery = "" }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Product searches · Brand Beacon" }), /* @__PURE__ */ jsx(SearchListScreen, {
		kind: "product",
		searches,
		moving,
		suggestions,
		prefillQuery
	})] });
}
//#endregion
//#region resources/js/Pages/components/SearchHistoryTab.jsx
var SearchHistoryTab_exports = /* @__PURE__ */ __exportAll({ default: () => SearchHistoryTab });
var PAGE_SIZE = 25;
function searchedAt(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString([], {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function localDay(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function statusLabel(value) {
	return {
		scraping: "Running",
		done: "Ready",
		failed: "Failed",
		paused: "Paused"
	}[value] ?? value ?? "Pending";
}
function SearchHistoryTab({ searches = [] }) {
	const [query, setQuery] = useState("");
	const [type, setType] = useState("all");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [page, setPage] = useState(1);
	const filteredSearches = useMemo(() => {
		const term = query.trim().toLowerCase();
		return searches.filter((search) => {
			const haystack = [
				search.name,
				search.phrase,
				...search.keywords ?? []
			].filter(Boolean).join(" ").toLowerCase();
			const day = localDay(search.created_at);
			return (term === "" || haystack.includes(term)) && (type === "all" || (type === "brand" ? search.search_type !== "product" : search.search_type === type)) && (fromDate === "" || day >= fromDate) && (toDate === "" || day <= toDate);
		});
	}, [
		fromDate,
		query,
		searches,
		toDate,
		type
	]);
	useEffect(() => setPage(1), [
		fromDate,
		query,
		searches,
		toDate,
		type
	]);
	const pageCount = Math.max(1, Math.ceil(filteredSearches.length / PAGE_SIZE));
	const visibleSearches = filteredSearches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const hasFilters = query !== "" || type !== "all" || fromDate !== "" || toDate !== "";
	const clearFilters = () => {
		setQuery("");
		setType("all");
		setFromDate("");
		setToDate("");
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "search-history",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "search-history__filters",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "srch search-history__search",
						children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("input", {
							value: query,
							onChange: (event) => setQuery(event.target.value),
							placeholder: "Search history",
							"aria-label": "Search history"
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "search-history__field",
						children: [/* @__PURE__ */ jsx("span", { children: "From" }), /* @__PURE__ */ jsx("input", {
							type: "date",
							value: fromDate,
							max: toDate || void 0,
							onChange: (event) => setFromDate(event.target.value)
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "search-history__field",
						children: [/* @__PURE__ */ jsx("span", { children: "To" }), /* @__PURE__ */ jsx("input", {
							type: "date",
							value: toDate,
							min: fromDate || void 0,
							onChange: (event) => setToDate(event.target.value)
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "search-history__field",
						children: [/* @__PURE__ */ jsx("span", { children: "Type" }), /* @__PURE__ */ jsxs("select", {
							value: type,
							onChange: (event) => setType(event.target.value),
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
									value: "product",
									children: "Product"
								})
							]
						})]
					}),
					hasFilters && /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "search-history__clear",
						onClick: clearFilters,
						children: "Clear"
					})
				]
			}),
			filteredSearches.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "empty search-history__empty",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "empty__i",
						children: /* @__PURE__ */ jsx(Search, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ jsx("h2", { children: searches.length === 0 ? "No searches yet" : "No searches matched" }),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							maxWidth: 380,
							margin: "10px auto 0"
						},
						children: searches.length === 0 ? "Your searches will appear here after you run your first one." : "Try changing your search, date range, or type filter."
					}),
					searches.length === 0 ? /* @__PURE__ */ jsxs(Link, {
						href: "/brands",
						className: "btn btn--y",
						style: { margin: "22px auto 0" },
						children: ["Start a search ", /* @__PURE__ */ jsx(Arrow, {})]
					}) : /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn--g",
						style: { margin: "22px auto 0" },
						onClick: clearFilters,
						children: "Clear filters"
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "search-history__list",
				children: visibleSearches.map((search) => /* @__PURE__ */ jsxs(Link, {
					className: "search-history__row",
					href: search.url,
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "search-history__icon",
							children: /* @__PURE__ */ jsx(Search, {})
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "search-history__main",
							children: [/* @__PURE__ */ jsx("strong", { children: search.name || search.phrase }), /* @__PURE__ */ jsx("span", { children: search.phrase })]
						}),
						/* @__PURE__ */ jsx("span", {
							className: "search-history__type",
							children: search.search_type === "product" ? "Product" : "Brand"
						}),
						/* @__PURE__ */ jsx("span", {
							className: `search-history__status is-${search.status}`,
							children: statusLabel(search.status)
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "search-history__results",
							children: [search.result_count ?? 0, " videos"]
						}),
						/* @__PURE__ */ jsx("time", {
							dateTime: search.created_at,
							children: searchedAt(search.created_at)
						}),
						/* @__PURE__ */ jsx(Arrow, {})
					]
				}, search.id))
			}),
			filteredSearches.length > PAGE_SIZE && /* @__PURE__ */ jsxs("nav", {
				className: "search-history__pagination",
				"aria-label": "Search history pagination",
				children: [/* @__PURE__ */ jsxs("span", { children: [
					(page - 1) * PAGE_SIZE + 1,
					"–",
					Math.min(page * PAGE_SIZE, filteredSearches.length),
					" of ",
					filteredSearches.length
				] }), /* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn--g btn--sm",
						disabled: page === 1,
						onClick: () => setPage((current) => current - 1),
						children: "Previous"
					}),
					/* @__PURE__ */ jsxs("span", { children: [
						"Page ",
						page,
						" of ",
						pageCount
					] }),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "btn btn--g btn--sm",
						disabled: page === pageCount,
						onClick: () => setPage((current) => current + 1),
						children: "Next"
					})
				] })]
			}),
			/* @__PURE__ */ jsx("style", { children: `
        .search-history__filters{display:grid;grid-template-columns:minmax(220px,1fr) auto auto auto auto;align-items:end;gap:10px;margin-bottom:16px}.search-history__search{min-width:0;margin:0}
        .search-history__field{display:flex;flex-direction:column;gap:5px}.search-history__field>span{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--muted)}
        .search-history__field input,.search-history__field select{height:42px;padding:0 12px;border:1px solid var(--line);border-radius:11px;background:var(--white);color:var(--ink);font:inherit;font-size:13px}.search-history__field input{min-width:145px}.search-history__field select{min-width:125px;padding-right:30px}
        .search-history__clear{height:42px;padding:0 8px;border:0;background:transparent;color:var(--muted);font-size:12px;font-weight:700;text-decoration:underline}.search-history__list{background:var(--white);border:1px solid var(--line);border-radius:18px;overflow:hidden}
        .search-history__row{display:grid;grid-template-columns:38px minmax(180px,1fr) 75px 75px 85px 155px 18px;align-items:center;gap:14px;padding:16px 20px;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--line);transition:background .14s}.search-history__row:last-child{border-bottom:0}.search-history__row:hover{background:var(--paper,#faf9f6)}
        .search-history__icon{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:var(--yellow-soft,#fff7d6)}.search-history__icon svg{width:17px;height:17px}.search-history__main{min-width:0;display:flex;flex-direction:column;gap:3px}.search-history__main strong,.search-history__main span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.search-history__main strong{font-size:14px}
        .search-history__main span,.search-history__row time,.search-history__type,.search-history__results{font-size:12px;color:var(--muted)}.search-history__status{justify-self:start;border-radius:999px;padding:4px 9px;background:#edf6ee;color:#397047;font-size:11px;font-weight:700}.search-history__status.is-failed{background:#fff0ed;color:#a13c2e}.search-history__status.is-scraping{background:#fff7d6;color:#765e00}.search-history__status.is-paused{background:#f0efec;color:#666}.search-history__row>svg{width:14px;height:14px;color:var(--muted)}.search-history__empty{background:var(--white);border:1px solid var(--line);border-radius:18px}
        .search-history__pagination{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:16px;color:var(--muted);font-size:12px}.search-history__pagination>div{display:flex;align-items:center;gap:12px}.search-history__pagination .btn:disabled{opacity:.45;cursor:not-allowed}
        @media(max-width:950px){.search-history__filters{grid-template-columns:1fr 1fr}.search-history__search{grid-column:1/-1}.search-history__clear{justify-self:start}.search-history__row{grid-template-columns:38px minmax(0,1fr) auto 14px}.search-history__type,.search-history__status,.search-history__results{display:none}.search-history__row time{grid-column:2}.search-history__row>svg{grid-column:4;grid-row:1/3}}
        @media(max-width:520px){.search-history__filters{grid-template-columns:1fr}.search-history__search{grid-column:auto}.search-history__field input,.search-history__field select{width:100%}.search-history__pagination{align-items:flex-start;flex-direction:column}.search-history__pagination>div{width:100%;justify-content:space-between}}
      ` })
		]
	});
}
//#endregion
//#region resources/js/Pages/SavedSearches/Index.jsx
var Index_exports = /* @__PURE__ */ __exportAll({ default: () => Index });
var FILTER_LABELS = {
	"brand-group": "Brand",
	brand: "Brand",
	product: "Product"
};
var SORT_OPTIONS = {
	recent_refresh: "Most recent refresh",
	video_count: "Video count",
	az: "Name A-Z",
	za: "Name Z-A"
};
var VIDEO_SORT = {
	score: "Breakout Score",
	views: "Views",
	recent: "Most recent"
};
var ANALYSIS_STATUS_LABELS = {
	complete: "Ready",
	processing: "Processing",
	failed: "Failed"
};
var ANALYSIS_SORT = {
	recent: "Most Recent",
	oldest: "Oldest First",
	outlier: "Breakout Score",
	az: "A-Z (by title)",
	za: "Z-A (by title)"
};
var ANALYSIS_PAGE_SIZE = 20;
function formatAnalysisDate(value) {
	if (!value) return "Waiting for analysis";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "Waiting for analysis";
	return date.toLocaleString([], {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
function truncateAnalysisTitle(value, limit = 50) {
	const text = String(value || "").trim();
	if (text.length <= limit) return text;
	return `${text.slice(0, limit).trimEnd()}......`;
}
function analysisAvatarLabel(video) {
	return String(video?.handle || video?.creator_name || video?.username || "?").replace(/^@/, "").trim().slice(0, 2).toUpperCase() || "?";
}
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
function AnalysisHistoryRow({ entry, href, statusLabel, searchNames }) {
	const [thumbBroken, setThumbBroken] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const title = expanded ? String(entry.video?.title || entry.video?.handle || "Analyzed video") : truncateAnalysisTitle(entry.video?.title || entry.video?.handle || "Analyzed video");
	const titleExpandable = String(entry.video?.title || "").trim().length > 50;
	return /* @__PURE__ */ jsxs(Link, {
		href,
		className: "row",
		style: {
			alignItems: "stretch",
			textDecoration: "none"
		},
		children: [/* @__PURE__ */ jsx("div", {
			style: {
				width: 88,
				minWidth: 88,
				borderRadius: 18,
				overflow: "hidden",
				background: "var(--panel)",
				border: "1px solid var(--line)"
			},
			children: entry.video?.thumbnail_url && !thumbBroken ? /* @__PURE__ */ jsx("img", {
				src: entry.video.thumbnail_url,
				alt: entry.video?.title ?? "Video thumbnail",
				onError: () => setThumbBroken(true),
				onLoad: (event) => {
					if (!event.currentTarget.naturalWidth || !event.currentTarget.naturalHeight) setThumbBroken(true);
				},
				style: {
					width: "100%",
					height: "100%",
					minHeight: 88,
					objectFit: "cover"
				}
			}) : /* @__PURE__ */ jsx("div", {
				style: {
					minHeight: 88,
					display: "grid",
					placeItems: "center",
					color: "var(--amber-ink)",
					background: "linear-gradient(160deg, #f6ebcf, #e3c47a)",
					fontSize: 24,
					fontWeight: 800,
					letterSpacing: "-0.03em"
				},
				"aria-hidden": "true",
				children: analysisAvatarLabel(entry.video)
			})
		}), /* @__PURE__ */ jsxs("div", {
			style: {
				flex: 1,
				minWidth: 0
			},
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "row__t",
					style: {
						marginBottom: 6,
						gap: 10,
						alignItems: "center",
						flexWrap: "wrap"
					},
					children: [/* @__PURE__ */ jsx("span", {
						style: {
							minWidth: 0,
							overflowWrap: "anywhere"
						},
						children: title
					}), /* @__PURE__ */ jsxs("span", {
						className: `pill ${entry.status === "complete" ? "pill--ok" : entry.status === "failed" ? "pill--bad" : "pill--run"}`,
						children: [/* @__PURE__ */ jsx("i", {}), statusLabel]
					})]
				}),
				titleExpandable && /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "link",
					onClick: (event) => {
						event.preventDefault();
						event.stopPropagation();
						setExpanded((current) => !current);
					},
					style: { marginBottom: 4 },
					children: expanded ? "Show less" : "Show more"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "row__m",
					children: [entry.video?.handle || entry.video?.creator_name || "Unknown creator", searchNames.length > 0 ? ` • ${searchNames.join(", ")}` : ""]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "row__m",
					style: { marginTop: 6 },
					children: [
						entry.status === "complete" ? "Analyzed" : entry.status === "failed" ? "Last updated" : "Started",
						" ",
						formatAnalysisDate(entry.analyzed_at ?? entry.updated_at),
						!entry.counts_toward_quota ? " • Auto analysis" : ""
					]
				})
			]
		})]
	});
}
function Index({ searches: initialSearches, bookmarkedVideos: initialBookmarkedVideos = [], bookmarkedVideosCount = 0, analysisHistory: initialAnalysisHistory = [], analysisHistoryCount = 0, searchHistory = [], initialTab = "searches", filterType = null, watchlistedOnly: bookmarkedOnly = true }) {
	const currentPath = typeof window === "undefined" ? "/library" : `${window.location.pathname}${window.location.search}`;
	const isBrandCategoryView = filterType === "brand-group";
	const showTabs = bookmarkedOnly && !filterType;
	const [searches, setSearches] = useState(initialSearches);
	useEffect(() => setSearches(initialSearches), [initialSearches]);
	const [tab, setTab] = useState(initialTab === "history" ? "history" : "searches");
	const [openMenuId, setOpenMenuId] = useState(null);
	const [bookmarkedVideos, setBookmarkedVideos] = useState(initialBookmarkedVideos);
	const [analysisHistory, setAnalysisHistory] = useState(initialAnalysisHistory);
	const [bookmarkedVideosLoaded, setBookmarkedVideosLoaded] = useState(initialBookmarkedVideos.length > 0 || bookmarkedVideosCount === 0);
	const [analysisHistoryLoaded, setAnalysisHistoryLoaded] = useState(initialAnalysisHistory.length > 0 || analysisHistoryCount === 0);
	const [bookmarkedVideosLoading, setBookmarkedVideosLoading] = useState(false);
	const [analysisHistoryLoading, setAnalysisHistoryLoading] = useState(false);
	const [analysisModalVideo, setAnalysisModalVideo] = useState(null);
	const [analysisByVideoId, setAnalysisByVideoId] = useState({});
	const [unsavingVideoId, setUnsavingVideoId] = useState(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [searchTypeFilter, setSearchTypeFilter] = useState(isBrandCategoryView ? "all" : filterType ?? "all");
	const [sortBy, setSortBy] = useState("recent_refresh");
	const [videoQuery, setVideoQuery] = useState("");
	const [videoSort, setVideoSort] = useState("score");
	const [analysisQuery, setAnalysisQuery] = useState("");
	const [analysisStatus, setAnalysisStatus] = useState("all");
	const [analysisSort, setAnalysisSort] = useState("recent");
	const [visibleAnalysisCount, setVisibleAnalysisCount] = useState(ANALYSIS_PAGE_SIZE);
	const [modalState, setModalState] = useState({
		type: null,
		search: null
	});
	const [formState, setFormState] = useState({
		name: "",
		frequency: "weekly",
		type: "brand"
	});
	const [submitting, setSubmitting] = useState(false);
	const menuRef = useRef(null);
	const analysisLoadMoreRef = useRef(null);
	const title = filterType ? FILTER_LABELS[filterType] ?? "Library" : "Library";
	const searchHref = `/search?type=${filterType === "product" ? "product" : "brand"}`;
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
	useEffect(() => {
		let cancelled = false;
		if (tab === "videos" && !bookmarkedVideosLoaded) {
			setBookmarkedVideosLoading(true);
			fetchBookmarkedVideos().then((payload) => {
				if (cancelled) return;
				setBookmarkedVideos(Array.isArray(payload?.videos) ? payload.videos : []);
				setBookmarkedVideosLoaded(true);
			}).catch(() => {
				if (cancelled) return;
				setBookmarkedVideos([]);
				setBookmarkedVideosLoaded(true);
			}).finally(() => {
				if (!cancelled) setBookmarkedVideosLoading(false);
			});
		}
		if (tab === "analysis" && !analysisHistoryLoaded) {
			setAnalysisHistoryLoading(true);
			fetchAnalysisHistory().then((payload) => {
				if (cancelled) return;
				setAnalysisHistory(Array.isArray(payload?.history) ? payload.history : []);
				setAnalysisHistoryLoaded(true);
			}).catch(() => {
				if (cancelled) return;
				setAnalysisHistory([]);
				setAnalysisHistoryLoaded(true);
			}).finally(() => {
				if (!cancelled) setAnalysisHistoryLoading(false);
			});
		}
		return () => {
			cancelled = true;
		};
	}, [
		analysisHistoryLoaded,
		bookmarkedVideosLoaded,
		tab
	]);
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
	const unsaveVideo = async (video) => {
		if (!video?.id || unsavingVideoId !== null) return;
		setUnsavingVideoId(video.id);
		try {
			await bookmarks.remove(video.id);
			setBookmarkedVideos((current) => current.filter((v) => String(v.id) !== String(video.id)));
		} finally {
			setUnsavingVideoId(null);
		}
	};
	const filteredAnalyses = useMemo(() => {
		const q = analysisQuery.trim().toLowerCase();
		const next = analysisHistory.filter((entry) => {
			const searchNames = Array.isArray(entry.searches) ? entry.searches.map((search) => search?.name ?? "") : [];
			const matchesQuery = q === "" || entry.video?.title?.toLowerCase().includes(q) || entry.video?.handle?.toLowerCase().includes(q) || entry.video?.creator_name?.toLowerCase().includes(q) || searchNames.some((name) => name.toLowerCase().includes(q));
			const matchesStatus = analysisStatus === "all" ? entry.status !== "idle" : entry.status === analysisStatus;
			return matchesQuery && matchesStatus;
		});
		next.sort((left, right) => {
			const leftTime = new Date(left.analyzed_at ?? left.updated_at ?? 0).getTime();
			const rightTime = new Date(right.analyzed_at ?? right.updated_at ?? 0).getTime();
			const leftTitle = String(left.video?.title || left.video?.handle || "").toLowerCase();
			const rightTitle = String(right.video?.title || right.video?.handle || "").toLowerCase();
			const leftOutlier = Number(left.video?.virality_score ?? 0);
			const rightOutlier = Number(right.video?.virality_score ?? 0);
			switch (analysisSort) {
				case "oldest": return leftTime - rightTime;
				case "outlier": return rightOutlier - leftOutlier;
				case "az": return leftTitle.localeCompare(rightTitle);
				case "za": return rightTitle.localeCompare(leftTitle);
				default: return rightTime - leftTime;
			}
		});
		return next;
	}, [
		analysisHistory,
		analysisQuery,
		analysisSort,
		analysisStatus
	]);
	const visibleAnalyses = useMemo(() => filteredAnalyses.slice(0, visibleAnalysisCount), [filteredAnalyses, visibleAnalysisCount]);
	const hasMoreAnalyses = visibleAnalysisCount < filteredAnalyses.length;
	useEffect(() => {
		setVisibleAnalysisCount(ANALYSIS_PAGE_SIZE);
	}, [
		analysisHistory,
		analysisQuery,
		analysisSort,
		analysisStatus,
		tab
	]);
	useEffect(() => {
		if (tab !== "analysis" || !hasMoreAnalyses || !analysisLoadMoreRef.current) return;
		const observer = new IntersectionObserver((entries) => {
			if (entries.some((entry) => entry.isIntersecting)) setVisibleAnalysisCount((current) => Math.min(current + ANALYSIS_PAGE_SIZE, filteredAnalyses.length));
		}, { rootMargin: "160px 0px" });
		observer.observe(analysisLoadMoreRef.current);
		return () => observer.disconnect();
	}, [
		filteredAnalyses.length,
		hasMoreAnalyses,
		tab
	]);
	const openModal = (type, search) => {
		setOpenMenuId(null);
		setModalState({
			type,
			search
		});
		if (type === "edit") setFormState({
			name: search.name ?? "",
			frequency: search.frequency ?? "weekly",
			type: search.search_type === "product" ? "product" : "brand"
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
			await savedSearch.update(modalState.search.id, {
				name: formState.name.trim(),
				frequency: formState.frequency,
				type: formState.type
			});
			setModalState({
				type: null,
				search: null
			});
			router.reload({
				only: ["searches"],
				preserveScroll: true
			});
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
			untrackSearch(modalState.search.id);
			removeSearch(modalState.search.id);
			closeModal();
		} finally {
			setSubmitting(false);
		}
	};
	const rowActions = (s) => /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("button", {
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
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${title} · Brand Beacon` }),
		/* @__PURE__ */ jsxs(AppLayout, {
			width: "max-w-[1240px]",
			title,
			subtitle: "Everything you have saved and analyzed — tracked searches, bookmarked videos, and your analysis log.",
			actions: /* @__PURE__ */ jsx(EntitlementsBar, {}),
			children: [showTabs && /* @__PURE__ */ jsxs("div", {
				className: "tabs tabs--bookmarks",
				children: [
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						className: `tab${tab === "searches" ? " is-on" : ""}`,
						onClick: () => setTab("searches"),
						children: [
							/* @__PURE__ */ jsx(Bookmark, { className: "h-[15px] w-[15px]" }),
							/* @__PURE__ */ jsx("span", {
								className: "sm:hidden",
								children: "Searches"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "hidden sm:inline",
								children: "Saved searches"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "tab__c",
								children: searches.length
							})
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						className: `tab${tab === "videos" ? " is-on" : ""}`,
						onClick: () => setTab("videos"),
						children: [
							/* @__PURE__ */ jsx(Play, { className: "h-[15px] w-[15px]" }),
							/* @__PURE__ */ jsx("span", {
								className: "sm:hidden",
								children: "Videos"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "hidden sm:inline",
								children: "Saved videos"
							}),
							/* @__PURE__ */ jsx("span", {
								className: "tab__c",
								children: bookmarkedVideosCount
							})
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						className: `tab${tab === "analysis" ? " is-on" : ""}`,
						onClick: () => setTab("analysis"),
						children: [
							/* @__PURE__ */ jsx(Search, { className: "h-[15px] w-[15px]" }),
							/* @__PURE__ */ jsx("span", { children: "Analysis History" }),
							/* @__PURE__ */ jsx("span", {
								className: "tab__c",
								children: analysisHistoryCount
							})
						]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "button",
						className: `tab${tab === "history" ? " is-on" : ""}`,
						onClick: () => setTab("history"),
						children: [
							/* @__PURE__ */ jsx(Search, { className: "h-[15px] w-[15px]" }),
							/* @__PURE__ */ jsx("span", { children: "Search History" }),
							/* @__PURE__ */ jsx("span", {
								className: "tab__c",
								children: searchHistory.length
							})
						]
					})
				]
			}), tab === "searches" || !showTabs ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
				className: "tools",
				style: {
					display: "grid",
					gap: 10
				},
				children: [/* @__PURE__ */ jsxs("label", {
					className: "srch",
					style: { minWidth: 0 },
					children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("input", {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Search your saved searches",
						"aria-label": "Search your saved searches"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "tools tools--library-grid",
					style: { marginBottom: 0 },
					children: [
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
									children: "Brand"
								}),
								!isBrandCategoryView && /* @__PURE__ */ jsx("option", {
									value: "product",
									children: "Product"
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
				})]
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
						children: searches.length === 0 ? "Run a search, then save it to keep it here in Library." : "Try a different keyword, status, type, or sort combination."
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
					onNavigate: () => router.visit(withReturnTo(s.url, currentPath)),
					actions: rowActions(s)
				}, s.id))
			})] }) : tab === "videos" ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
				className: "tools",
				style: {
					display: "grid",
					gap: 10
				},
				children: [/* @__PURE__ */ jsxs("label", {
					className: "srch",
					style: { minWidth: 0 },
					children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("input", {
						value: videoQuery,
						onChange: (e) => setVideoQuery(e.target.value),
						placeholder: "Search your saved videos",
						"aria-label": "Search your saved videos"
					})]
				}), /* @__PURE__ */ jsx("div", {
					className: "tools tools--library-grid",
					style: { marginBottom: 0 },
					children: /* @__PURE__ */ jsx(Sel, {
						value: videoSort,
						onChange: (e) => setVideoSort(e.target.value),
						ariaLabel: "Sort videos",
						children: Object.entries(VIDEO_SORT).map(([value, label]) => /* @__PURE__ */ jsx("option", {
							value,
							children: label
						}, value))
					})
				})]
			}), bookmarkedVideosLoading ? /* @__PURE__ */ jsxs("div", {
				className: "empty",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "empty__i",
						children: /* @__PURE__ */ jsx(Play, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ jsx("h2", { children: "Loading saved videos" }),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							maxWidth: 360,
							margin: "10px auto 0"
						},
						children: "Pulling your bookmarked video library now."
					})
				]
			}) : filteredVideos.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "empty",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "empty__i",
						children: /* @__PURE__ */ jsx(Play, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ jsx("h2", { children: "No saved videos yet" }),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							maxWidth: 360,
							margin: "10px auto 0"
						},
						children: "Open a search and save the videos worth keeping — they collect here."
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "rs-ogrid",
				children: filteredVideos.map((v) => /* @__PURE__ */ jsx(BreakoutVideoCard, {
					video: {
						...v,
						bookmarked: true,
						analysis: analysisByVideoId[v.id] ?? v.analysis ?? null
					},
					onAnalyze: () => setAnalysisModalVideo(v),
					onToggleBookmark: () => unsaveVideo(v),
					bookmarking: unsavingVideoId === v.id
				}, v.id))
			})] }) : tab === "history" ? /* @__PURE__ */ jsx(SearchHistoryTab, { searches: searchHistory }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
				className: "tools",
				style: {
					display: "grid",
					gap: 10
				},
				children: [/* @__PURE__ */ jsxs("label", {
					className: "srch",
					style: { minWidth: 0 },
					children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("input", {
						value: analysisQuery,
						onChange: (e) => setAnalysisQuery(e.target.value),
						placeholder: "Search analysis history",
						"aria-label": "Search analysis history"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "tools tools--library-grid",
					style: { marginBottom: 0 },
					children: [/* @__PURE__ */ jsxs(Sel, {
						value: analysisStatus,
						onChange: (e) => setAnalysisStatus(e.target.value),
						ariaLabel: "Filter analyses",
						children: [
							/* @__PURE__ */ jsx("option", {
								value: "all",
								children: "All statuses"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "complete",
								children: "Ready"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "processing",
								children: "Processing"
							}),
							/* @__PURE__ */ jsx("option", {
								value: "failed",
								children: "Failed"
							})
						]
					}), /* @__PURE__ */ jsx(Sel, {
						value: analysisSort,
						onChange: (e) => setAnalysisSort(e.target.value),
						ariaLabel: "Sort analyses",
						children: Object.entries(ANALYSIS_SORT).map(([value, label]) => /* @__PURE__ */ jsx("option", {
							value,
							children: label
						}, value))
					})]
				})]
			}), analysisHistoryLoading ? /* @__PURE__ */ jsxs("div", {
				className: "empty",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "empty__i",
						children: /* @__PURE__ */ jsx(Search, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ jsx("h2", { children: "Loading analysis history" }),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							maxWidth: 360,
							margin: "10px auto 0"
						},
						children: "Gathering your completed and in-flight video analyses."
					})
				]
			}) : filteredAnalyses.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "empty",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "empty__i",
						children: /* @__PURE__ */ jsx(Search, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ jsx("h2", { children: analysisHistory.length === 0 ? "No analyses yet" : "No analyses matched" }),
					/* @__PURE__ */ jsx("p", {
						className: "muted",
						style: {
							maxWidth: 420,
							margin: "10px auto 0"
						},
						children: analysisHistory.length === 0 ? "Analyze a video from any search result and it will show up here as a running history log." : "Try a different search term or status filter."
					})
				]
			}) : /* @__PURE__ */ jsxs("div", {
				className: "rows",
				children: [visibleAnalyses.map((entry) => {
					const statusLabel = ANALYSIS_STATUS_LABELS[entry.status] ?? "Unknown";
					const searchNames = Array.isArray(entry.searches) ? entry.searches.map((search) => search.name).filter(Boolean) : [];
					const searchHrefWithReturnTo = withReturnTo(entry.search_url, currentPath);
					const href = entry.status === "complete" ? entry.analysis_url : searchHrefWithReturnTo ? `${searchHrefWithReturnTo}${searchHrefWithReturnTo.includes("?") ? "&" : "?"}analysisVideo=${encodeURIComponent(entry.video?.id ?? "")}&openAnalysis=1` : entry.analysis_url;
					return /* @__PURE__ */ jsx(AnalysisHistoryRow, {
						entry,
						href,
						statusLabel,
						searchNames
					}, entry.id);
				}), hasMoreAnalyses && /* @__PURE__ */ jsx("div", {
					ref: analysisLoadMoreRef,
					className: "row",
					"aria-hidden": "true",
					style: {
						justifyItems: "center",
						color: "var(--faint)",
						minHeight: 72
					},
					children: "Loading more analyses..."
				})]
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
						modalState.type === "edit" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
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
								children: [
									/* @__PURE__ */ jsx("label", {
										className: "lbl",
										htmlFor: "edit-search-type",
										children: "Type"
									}),
									/* @__PURE__ */ jsxs("select", {
										id: "edit-search-type",
										className: "fld",
										value: formState.type,
										onChange: (e) => setFormState((c) => ({
											...c,
											type: e.target.value
										})),
										children: [/* @__PURE__ */ jsx("option", {
											value: "brand",
											children: "Brand"
										}), /* @__PURE__ */ jsx("option", {
											value: "product",
											children: "Product"
										})]
									}),
									formState.type !== (modalState.search.search_type === "product" ? "product" : "brand") && /* @__PURE__ */ jsx("p", {
										className: "hint",
										style: { marginTop: 8 },
										children: "Your existing results stay — only how we tune keywords and insights changes going forward."
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								style: { marginTop: 20 },
								children: [/* @__PURE__ */ jsx("label", {
									className: "lbl",
									children: "Schedule"
								}), /* @__PURE__ */ jsx("output", {
									className: "btn btn--y btn--w",
									style: {
										cursor: "default",
										userSelect: "none"
									},
									children: formState.frequency === "monthly" ? "Monthly" : "Weekly"
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
						modalState.type === "pause" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
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
						modalState.type === "delete" && /* @__PURE__ */ jsxs(Fragment$1, { children: [
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
		}),
		analysisModalVideo && /* @__PURE__ */ jsx(AnalysisModal, {
			video: analysisModalVideo,
			initialAnalysis: analysisByVideoId[analysisModalVideo.id] ?? analysisModalVideo.analysis ?? null,
			onClose: () => setAnalysisModalVideo(null),
			onAnalysisChange: (videoId, analysis) => setAnalysisByVideoId((current) => ({
				...current,
				[videoId]: analysis
			})),
			saved: true,
			saving: unsavingVideoId === analysisModalVideo.id,
			onToggleSave: () => unsaveVideo(analysisModalVideo)
		})
	] });
}
//#endregion
//#region resources/js/Pages/SavedSearches/detail/DetailScreen.jsx
var DetailScreen_exports = /* @__PURE__ */ __exportAll({ default: () => DetailScreen });
/**
* Search analytics tracker — the redesigned results page.
*
* Layout follows brandbeaconanalyticsredesign.html:
*   Back bar · Header (with inline handle editor + kebab) · AI Insights bullets ·
*   Stat strip (4 tiles) · Winner breakout with auto-analysis · More breakouts
*   grid with toggle-open per-card analysis · Analytics card with metric tabs +
*   blurred history until the next refresh · When-they-post heatmap with a
*   best-time insight bar · Breakouts-per-week + Score distribution ·
*   Hashtags & sounds scroll panels (each row is a link to TikTok).
*
* The heavy analytical text (insights, per-video why/replicate, best-time)
* comes from a single batched OpenAI call at run completion — see
* SearchEnrichmentService on the backend. Nothing on this page fires a call
* per section.
*/
var PAGE_STEP = 4;
var DAYS_SHORT = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
var HOURS_LABELS = {
	0: "12a",
	6: "6a",
	12: "12p",
	18: "6p"
};
var STATUS_LABEL = {
	done: "Ready",
	complete: "Ready",
	scraping: "Refreshing",
	running: "Refreshing",
	queued: "Refreshing",
	pending: "Refreshing",
	paused: "Paused",
	failed: "Failed"
};
var CHART_BOX = {
	width: 100,
	height: 40,
	leftPad: 8,
	rightPad: 8,
	topPad: 13,
	bottomPad: 4
};
var round = (n) => Math.round(n * 100) / 100;
function smoothPath(coordinates) {
	const n = coordinates.length;
	if (n === 0) return "";
	const move = `M${round(coordinates[0].x)},${round(coordinates[0].y)}`;
	if (n === 1) return move;
	if (n === 2) return `${move} L${round(coordinates[1].x)},${round(coordinates[1].y)}`;
	const dx = [];
	const slope = [];
	for (let i = 0; i < n - 1; i += 1) {
		dx[i] = coordinates[i + 1].x - coordinates[i].x;
		slope[i] = dx[i] === 0 ? 0 : (coordinates[i + 1].y - coordinates[i].y) / dx[i];
	}
	const tangent = new Array(n);
	tangent[0] = slope[0];
	tangent[n - 1] = slope[n - 2];
	for (let i = 1; i < n - 1; i += 1) {
		if (slope[i - 1] * slope[i] <= 0) {
			tangent[i] = 0;
			continue;
		}
		const w1 = 2 * dx[i] + dx[i - 1];
		const w2 = dx[i] + 2 * dx[i - 1];
		tangent[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i]);
	}
	let d = move;
	for (let i = 0; i < n - 1; i += 1) {
		const reach = dx[i] / 3;
		const from = coordinates[i];
		const to = coordinates[i + 1];
		d += ` C${round(from.x + reach)},${round(from.y + tangent[i] * reach)} ${round(to.x - reach)},${round(to.y - tangent[i + 1] * reach)} ${round(to.x)},${round(to.y)}`;
	}
	return d;
}
function chartGeometry(values) {
	const points = values.map((value) => Number(value) || 0);
	if (points.length === 0) return null;
	const min = Math.min(...points);
	const max = Math.max(...points);
	const span = max - min;
	const { width, height, leftPad, rightPad, topPad, bottomPad } = CHART_BOX;
	const coordinates = points.map((value, index) => ({
		x: points.length === 1 ? 50 : leftPad + (width - leftPad - rightPad) * index / (points.length - 1),
		y: span === 0 ? height / 2 : height - bottomPad - (value - min) / span * (height - topPad - bottomPad)
	}));
	const last = coordinates[coordinates.length - 1];
	const first = coordinates[0];
	const linePath = smoothPath(coordinates);
	return {
		min,
		max,
		points: coordinates.map(({ x, y }) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" "),
		linePath,
		areaPath: linePath ? `${linePath} L${round(last.x)},${height} L${round(first.x)},${height} Z` : "",
		last
	};
}
function formatMetricTick(value, metric) {
	if (metric === "outliers") return `${Math.round(Number(value || 0))}`;
	if (metric === "engrate") return `${Number(value || 0).toFixed(1)}%`;
	if (metric === "posts") return `${Math.round(Number(value || 0))}`;
	return compact(Number(value || 0));
}
function buildYAxisTicks(values, metric) {
	const numbers = values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
	if (numbers.length === 0) return [{
		value: 0,
		label: formatMetricTick(0, metric),
		offset: 100
	}];
	const max = Math.max(...numbers, 0);
	const min = Math.min(...numbers, 0);
	if (max === min) return [{
		value: max,
		label: formatMetricTick(max, metric),
		offset: 0
	}, {
		value: 0,
		label: formatMetricTick(0, metric),
		offset: 100
	}];
	return Array.from({ length: 4 }, (_, index) => {
		const ratio = index / 3;
		const value = max - (max - min) * ratio;
		return {
			value,
			label: formatMetricTick(value, metric),
			offset: ratio * 100
		};
	});
}
function buildXAxisLabels(points = []) {
	if (points.length === 0) return [];
	if (points.length === 1) return [{
		label: points[0].label,
		align: "start"
	}];
	const labels = [{
		label: points[0].label,
		align: "start"
	}];
	const middleIndex = Math.floor((points.length - 1) / 2);
	if (middleIndex > 0 && middleIndex < points.length - 1) labels.push({
		label: points[middleIndex].label,
		align: "center"
	});
	labels.push({
		label: points[points.length - 1].label,
		align: "end"
	});
	return labels;
}
function weekKeyFromIso(iso) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	const day = utc.getUTCDay();
	const diff = day === 0 ? -6 : 1 - day;
	utc.setUTCDate(utc.getUTCDate() + diff);
	return utc.toISOString().slice(0, 10);
}
function formatMetricValue(value, metric) {
	if (metric === "outliers") return `${Math.round(Number(value || 0))} breakouts`;
	if (metric === "engrate") return `${Number(value || 0).toFixed(1)}%`;
	if (metric === "posts") return `${Math.round(Number(value || 0))} posts`;
	if (metric === "eng") return `${compact(Number(value || 0))} engagements`;
	return `${compact(Number(value || 0))} views`;
}
function metricExplanation(metric) {
	if (metric === "eng") return "Shows how much interaction those videos pulled that week, using likes, comments, shares, and saves together.";
	if (metric === "outliers") return "Shows how many videos from that week truly broke out, not just how many were posted.";
	return "Shows the total views pulled by the videos uploaded in that week.";
}
function heatmapBestTime(heatmap) {
	const peak = heatmap?.peak;
	const hour = Number(peak?.hour);
	const count = Number(peak?.count) || 0;
	if (!peak?.day || !Number.isInteger(hour) || count < 1) return null;
	const hourLabel = hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
	return { sentence: `Busiest posting window: **${peak.day} around ${hourLabel} UTC** (${count} matched ${count === 1 ? "post" : "posts"}).` };
}
function formatHeatmapHour(hour) {
	if (hour === 0) return "12:00 AM";
	if (hour === 12) return "12:00 PM";
	return hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
}
function canUseSearchBookmarks(billing) {
	if (!billing) return false;
	const limit = Number(billing.searchBookmarkLimit ?? billing.bookmarkLimit ?? 0);
	const used = Number(billing.searchBookmarkCount ?? billing.bookmarksUsed ?? billing.bookmarkCount ?? 0);
	if (limit === -1) return true;
	return Boolean(billing.hasPaidPlan) && limit !== 0 && used < limit;
}
function canManageSearch(billing) {
	if (!billing) return false;
	return Boolean(billing.hasPaidPlan);
}
/** Render **bold** markers as <b>…</b> without allowing raw HTML. */
function renderBold(text) {
	return String(text ?? "").split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
		if (part.startsWith("**") && part.endsWith("**")) return /* @__PURE__ */ jsx("b", { children: part.slice(2, -2) }, i);
		return /* @__PURE__ */ jsx("span", { children: part }, i);
	});
}
function initials(name, fallback = "?") {
	return (name || fallback).trim().slice(0, 2).toUpperCase() || "?";
}
var Icons = {
	Back: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.4",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M19 12H5M11 6l-6 6 6 6" })
	}),
	Bookmark: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: /* @__PURE__ */ jsx("path", { d: "M6 3h12v18l-6-4.5L6 21z" })
	}),
	BookmarkO: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M6 3h12v18l-6-4.5L6 21z" })
	}),
	Kebab: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "5",
				cy: "12",
				r: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "12",
				cy: "12",
				r: "2"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "19",
				cy: "12",
				r: "2"
			})
		]
	}),
	Edit: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "M12 20h9" }), /* @__PURE__ */ jsx("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" })]
	}),
	Refresh: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-2.6-6.4" }), /* @__PURE__ */ jsx("path", { d: "M21 3v6h-6" })]
	}),
	Pause: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		children: [/* @__PURE__ */ jsx("rect", {
			x: "6",
			y: "5",
			width: "4",
			height: "14",
			rx: "1"
		}), /* @__PURE__ */ jsx("rect", {
			x: "14",
			y: "5",
			width: "4",
			height: "14",
			rx: "1"
		})]
	}),
	Trash: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" })
	}),
	Play: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: /* @__PURE__ */ jsx("path", { d: "M8 5v14l11-7z" })
	}),
	Spark: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "currentColor",
		children: /* @__PURE__ */ jsx("path", { d: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" })
	}),
	Eye: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" }), /* @__PURE__ */ jsx("circle", {
			cx: "12",
			cy: "12",
			r: "3"
		})]
	}),
	Heart: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M12 20s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.5-7 9-7 9z" })
	}),
	Comment: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H8l-5 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
	}),
	Share: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ jsx("path", { d: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" }),
			/* @__PURE__ */ jsx("path", { d: "m16 6-4-4-4 4" }),
			/* @__PURE__ */ jsx("path", { d: "M12 2v14" })
		]
	}),
	ExtLink: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M7 17 17 7M8 7h9v9" })
	}),
	UpTrend: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.6",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "M3 17l6-6 4 4 8-8" }), /* @__PURE__ */ jsx("path", { d: "M21 3h-5m5 0v5" })]
	}),
	ChevDown: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.6",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" })
	}),
	ChevRight: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.6",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "m9 5 7 7-7 7" })
	}),
	Music: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ jsx("path", { d: "M9 18V5l12-2v13" }),
			/* @__PURE__ */ jsx("circle", {
				cx: "6",
				cy: "18",
				r: "3"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "18",
				cy: "16",
				r: "3"
			})
		]
	}),
	Plus: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2.4",
		strokeLinecap: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" })
	})
};
var PROC_STEPS = [
	"Scanning TikTok’s videos for your selected keywords",
	"Pulling video and creator information",
	"Analyzing videos with our AI agents",
	"Scoring each video and extracting winners",
	"Making it look pretty for you"
];
var ProcCheck = /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "4",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: /* @__PURE__ */ jsx("path", { d: "M5 12.5l4.6 4.5L19 7" })
});
/** The M20 processing panel — a spinner, the time estimate, a sweeping bar,
* and the five-step checklist. Sits under the brand header while a run is live. */
function ProcessingPanel({ panelRef, step }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "rs-proc",
		ref: panelRef,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "rs-proc__top",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "rs-spin",
					"aria-hidden": true,
					children: [/* @__PURE__ */ jsxs("svg", {
						viewBox: "0 0 108 108",
						children: [
							/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
								id: "rs-proc-g",
								x1: "0",
								y1: "0",
								x2: "1",
								y2: "1",
								children: [/* @__PURE__ */ jsx("stop", {
									offset: "0",
									stopColor: "#ffd84d"
								}), /* @__PURE__ */ jsx("stop", {
									offset: "1",
									stopColor: "#ff9f1c"
								})]
							}) }),
							/* @__PURE__ */ jsx("circle", {
								className: "rs-spin__tr",
								cx: "54",
								cy: "54",
								r: "46"
							}),
							/* @__PURE__ */ jsx("circle", {
								className: "rs-spin__arc",
								cx: "54",
								cy: "54",
								r: "46"
							})
						]
					}), /* @__PURE__ */ jsx("i", {})]
				}), /* @__PURE__ */ jsxs("span", {
					className: "rs-proc__copy",
					children: [/* @__PURE__ */ jsx("h2", { children: "Let us do our thing…" }), /* @__PURE__ */ jsx("span", {
						className: "rs-proc__lede",
						children: "1 to 5 minutes, mostly around 2 minutes."
					})]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "rs-sweep",
				"aria-hidden": true,
				children: /* @__PURE__ */ jsx("i", {})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "rs-proc__steps",
				children: PROC_STEPS.map((label, i) => {
					const state = i < step ? "done" : i === step ? "now" : "wait";
					return /* @__PURE__ */ jsxs("span", {
						className: `rs-tick rs-tick--${state}`,
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "rs-tick__d",
								children: state === "wait" ? "•" : ProcCheck
							}),
							label,
							state === "now" && /* @__PURE__ */ jsx("span", {
								className: "rs-tick__c",
								"aria-hidden": true,
								children: /* @__PURE__ */ jsx("svg", {
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2.6",
									strokeLinecap: "round",
									children: /* @__PURE__ */ jsx("path", { d: "M12 3.4a8.6 8.6 0 1 0 8.6 8.6" })
								})
							})
						]
					}, label);
				})
			})
		]
	});
}
/** A shimmering placeholder standing in for a section whose data needs the
* full dataset before it can be computed. */
function SkeletonSection({ title, height = 140 }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
		className: "rs-sh",
		children: [/* @__PURE__ */ jsx("h2", { children: title }), /* @__PURE__ */ jsxs("span", {
			className: "rs-sofar",
			children: [/* @__PURE__ */ jsx("i", {}), "waiting"]
		})]
	}), /* @__PURE__ */ jsx("div", {
		className: "rs-skcard",
		children: /* @__PURE__ */ jsx("span", {
			className: "rs-sk",
			style: {
				width: "100%",
				height
			}
		})
	})] });
}
function DetailScreen({ search, isAuthenticated = false, billing: billing$2, processing = false, refreshing = false, bookmarkUpdating = false, onRefresh, onSearchUpdated, onToggleBookmark, onToggleVideoBookmark, bookmarkingVideoId = null, onTogglePause, onDelete }) {
	const insights = search?.insights ?? {};
	const bullets = search?.insights_bullets ?? [];
	const [handleEditing, setHandleEditing] = useState(false);
	const [handleDraft, setHandleDraft] = useState(search?.source_tiktok_handle ?? "");
	const [savingHandle, setSavingHandle] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [analysisModal, setAnalysisModal] = useState(null);
	const [confirmAnalysisVideo, setConfirmAnalysisVideo] = useState(null);
	const [upgradeModalType, setUpgradeModalType] = useState(null);
	const [visible, setVisible] = useState(PAGE_STEP);
	const [sortKey, setSortKey] = useState("outlier");
	const [runFilter, setRunFilter] = useState("all");
	const [metric, setMetric] = useState("views");
	const [videoPlayingId, setVideoPlayingId] = useState(null);
	const [heatmapTooltip, setHeatmapTooltip] = useState(null);
	const [chartTooltip, setChartTooltip] = useState(null);
	const [selectedWeekKey, setSelectedWeekKey] = useState(null);
	const [analysisByVideoId, setAnalysisByVideoId] = useState({});
	const [analysisStarting, setAnalysisStarting] = useState(false);
	const [reservedAnalysisVideoIds, setReservedAnalysisVideoIds] = useState([]);
	const [analysisNotice, setAnalysisNotice] = useState(null);
	const [mobileCards, setMobileCards] = useState(false);
	const [insightsCollapsed, setInsightsCollapsed] = useState(false);
	const [confirmAction, setConfirmAction] = useState(null);
	const menuTopRef = useRef(null);
	const menuHeaderRef = useRef(null);
	const autoOpenedAnalysisRef = useRef(false);
	const procPanelRef = useRef(null);
	const [procStep, setProcStep] = useState(processing ? 0 : PROC_STEPS.length);
	const [panelOut, setPanelOut] = useState(false);
	const [landedBarOpen, setLandedBarOpen] = useState(false);
	const wasProcessingRef = useRef(processing);
	useEffect(() => {
		if (!processing) {
			setProcStep(PROC_STEPS.length);
			return;
		}
		setProcStep(0);
		const timer = window.setInterval(() => setProcStep((i) => i < 2 ? i + 1 : i), 9e3);
		return () => window.clearInterval(timer);
	}, [processing]);
	useEffect(() => {
		if (wasProcessingRef.current && !processing) setLandedBarOpen(true);
		wasProcessingRef.current = processing;
	}, [processing]);
	useEffect(() => {
		const el = procPanelRef.current;
		if (!processing || !el || typeof IntersectionObserver === "undefined") {
			setPanelOut(false);
			return;
		}
		const topInset = ((typeof document !== "undefined" ? document.querySelector(".bb-top") : null)?.offsetHeight || 0) + 8;
		const observer = new IntersectionObserver(([entry]) => setPanelOut(!entry.isIntersecting), {
			threshold: 0,
			rootMargin: `-${topInset}px 0px 0px 0px`
		});
		observer.observe(el);
		return () => observer.disconnect();
	}, [processing]);
	const scrollToTop = () => {
		if (typeof window !== "undefined") window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const canAnalyzeMoreOutliers = canUsePaidVideoAnalysis(billing$2);
	const canBookmarkSearch = canUseSearchBookmarks(billing$2);
	const canManageCurrentSearch = canManageSearch(billing$2);
	const analysisRemainingNow = videoAnalysisRemaining(billing$2, reservedAnalysisVideoIds.length);
	const analysisRemainingAfterUse = analysisRemainingNow === -1 ? "unlimited" : Math.max(0, analysisRemainingNow - 1);
	const results = useMemo(() => (search?.results ?? []).map((video) => ({
		...video,
		analysis: analysisByVideoId[video.id] ?? video.analysis ?? null
	})), [search?.results, analysisByVideoId]);
	const menuClose = () => setMenuOpen(false);
	useEffect(() => {
		if (!menuOpen) return void 0;
		const onDocClick = (e) => {
			const inTopMenu = menuTopRef.current?.contains(e.target);
			const inHeaderMenu = menuHeaderRef.current?.contains(e.target);
			if (!inTopMenu && !inHeaderMenu) menuClose();
		};
		document.addEventListener("click", onDocClick);
		return () => document.removeEventListener("click", onDocClick);
	}, [menuOpen]);
	const winner = results[0];
	const rest = results.slice(1);
	const runList = search?.runs ?? [];
	const latestRunId = runList.length > 0 ? runList[runList.length - 1]?.id ?? null : null;
	const previousRunId = runList.length > 1 ? runList[runList.length - 2]?.id ?? null : null;
	const bucketForVideo = (video) => {
		if (previousRunId == null) return "new";
		const rid = video?.search_run_id;
		if (rid == null) return "new";
		if (rid === latestRunId) return "new";
		if (rid === previousRunId) return "prev";
		return "old";
	};
	const runCounts = useMemo(() => rest.reduce((acc, v) => {
		acc[bucketForVideo(v)] += 1;
		return acc;
	}, {
		new: 0,
		prev: 0,
		old: 0
	}), [
		rest,
		latestRunId,
		previousRunId
	]);
	const runLabels = {
		latest: runList.length > 0 ? formatDate$3(runList[runList.length - 1]?.completed_at) || "latest run" : "latest run",
		previous: runList.length > 1 ? formatDate$3(runList[runList.length - 2]?.completed_at) || "previous run" : "previous run"
	};
	const sortedRest = useMemo(() => {
		const arr = runFilter === "all" ? [...rest] : rest.filter((v) => bucketForVideo(v) === runFilter);
		arr.sort((a, b) => {
			if (sortKey === "views") return (b.views ?? 0) - (a.views ?? 0);
			if (sortKey === "date") {
				const at = a.posted_at ? new Date(a.posted_at).getTime() : 0;
				return (b.posted_at ? new Date(b.posted_at).getTime() : 0) - at;
			}
			return breakoutScore$1(b) - breakoutScore$1(a);
		});
		return arr;
	}, [
		rest,
		sortKey,
		runFilter,
		latestRunId,
		previousRunId
	]);
	const tileByKey = (k) => (insights.tiles ?? []).find((t) => t.key === k) ?? {};
	const outlierCount = tileByKey("outliers").value ?? results.filter((r) => Number(r.outlier_multiple ?? r.multiple ?? 0) >= 3).length;
	const videosInRun = search?.scanned_count ?? results.length;
	const topBreakoutScore = breakoutScore$1(winner);
	const avgEng = tileByKey("avg_engagement").value ?? null;
	const medianViews = insights?.baseline?.median_views ?? null;
	const saveHandle = async () => {
		const clean = handleDraft.trim().replace(/^@/, "");
		setSavingHandle(true);
		try {
			const payload = await savedSearch.update(search.id, { sources: {
				tiktokHandle: clean,
				website: search?.source_website ?? ""
			} });
			onSearchUpdated?.(payload?.search ?? { source_tiktok_handle: clean });
			setHandleEditing(false);
		} finally {
			setSavingHandle(false);
		}
	};
	const trend = insights?.trend ?? {};
	const weeklyPoints = trend?.points ?? [];
	const metricKeys = {
		views: "views",
		eng: "engagement",
		outliers: "outliers"
	};
	const latestNonEmptyWeekIndex = [...weeklyPoints].reverse().findIndex((point) => Number(point?.posts ?? 0) > 0);
	const lastFilledWeekIndex = latestNonEmptyWeekIndex === -1 ? -1 : weeklyPoints.length - 1 - latestNonEmptyWeekIndex;
	const firstFilledWeekIndex = weeklyPoints.findIndex((point) => Number(point?.posts ?? 0) > 0);
	const firstFilledWeek = firstFilledWeekIndex >= 0 ? weeklyPoints[firstFilledWeekIndex] : null;
	const lastFilledWeek = lastFilledWeekIndex >= 0 ? weeklyPoints[lastFilledWeekIndex] : null;
	const metricSeriesMap = {
		views: trend?.metrics?.views ? {
			...trend.metrics.views,
			current: Number(lastFilledWeek?.views ?? trend.metrics.views.current ?? 0)
		} : null,
		eng: trend?.metrics?.engagement ? {
			...trend.metrics.engagement,
			current: Number(lastFilledWeek?.engagement ?? trend.metrics.engagement.current ?? 0)
		} : null,
		outliers: weeklyPoints.length > 0 ? {
			label: "outliers",
			format: "count",
			values: weeklyPoints.map((point) => Number(point?.outliers ?? 0)),
			current: Number(lastFilledWeek?.outliers ?? 0),
			delta: firstFilledWeek && lastFilledWeek && firstFilledWeekIndex !== lastFilledWeekIndex ? {
				value: Number(lastFilledWeek?.outliers ?? 0) - Number(firstFilledWeek?.outliers ?? 0),
				unit: "absolute",
				direction: Number(lastFilledWeek?.outliers ?? 0) > Number(firstFilledWeek?.outliers ?? 0) ? "up" : Number(lastFilledWeek?.outliers ?? 0) < Number(firstFilledWeek?.outliers ?? 0) ? "down" : "flat"
			} : null
		} : null
	};
	const activeSeries = metricSeriesMap[metricKeys[metric] ? metric : "views"] ?? metricSeriesMap.views;
	const chartValues = activeSeries?.values ?? [];
	const chart = chartGeometry(chartValues);
	search?.runs?.length;
	const showTrendMetric = activeSeries !== null;
	buildXAxisLabels(weeklyPoints);
	const yAxisTicks = buildYAxisTicks(chartValues, metric);
	const chartPoints = chart?.points ? chart.points.split(" ").map((pair) => pair.split(",").map(Number)) : [];
	const videosByWeek = useMemo(() => {
		const grouped = {};
		results.forEach((video) => {
			const weekKey = weekKeyFromIso(video.uploaded_at);
			if (!weekKey) return;
			if (!grouped[weekKey]) grouped[weekKey] = [];
			grouped[weekKey].push(video);
		});
		Object.values(grouped).forEach((videos) => {
			videos.sort((left, right) => (Number(right.views) || 0) - (Number(left.views) || 0));
		});
		return grouped;
	}, [results]);
	const selectedWeekVideos = selectedWeekKey ? videosByWeek[selectedWeekKey] ?? [] : [];
	const selectedWeekViews = selectedWeekVideos.reduce((sum, video) => sum + (Number(video.views) || 0), 0);
	const comparisonDelta = activeSeries?.delta ?? null;
	const comparisonLabel = comparisonDelta ? `${comparisonDelta.direction === "up" ? "↑" : comparisonDelta.direction === "down" ? "↓" : "→"} ${Math.abs(Number(comparisonDelta.value ?? 0))}${comparisonDelta.unit === "points" ? " pts" : comparisonDelta.unit === "absolute" ? "" : "%"} vs ${weeklyPoints.length || 0} wk ago` : null;
	const metricConfig = {
		views: {
			value: showTrendMetric ? compact(activeSeries?.current) : compact(medianViews),
			label: ""
		},
		eng: {
			value: showTrendMetric ? compact(activeSeries?.current) : "—",
			label: ""
		},
		outliers: {
			value: showTrendMetric ? Number(activeSeries?.current ?? 0).toLocaleString() : outlierCount.toLocaleString(),
			label: ""
		}
	};
	const heatCells = insights?.heatmap?.cells ?? [];
	const heatMax = Math.max(1, Number(insights?.heatmap?.max) || 0);
	const bestPostTime = search?.best_post_time ?? heatmapBestTime(insights?.heatmap);
	const distribution = insights?.distribution ?? [];
	const distMax = Math.max(1, ...distribution.map((d) => d.count ?? 0));
	const weeklyBars = trend?.outliers_per_week ?? [];
	const weeklyMax = Math.max(1, ...weeklyBars.map((b) => b.count ?? b.value ?? 0));
	const hashtags = insights?.hashtags ?? [];
	const sounds = insights?.sounds ?? [];
	const hashMax = Math.max(1, ...hashtags.map((h) => h.count ?? 0));
	const soundMax = Math.max(1, ...sounds.map((s) => s.count ?? 0));
	const openAnalysis = (video) => setAnalysisModal({
		video,
		analysis: video.analysis ?? null
	});
	const closeAnalysis = () => setAnalysisModal(null);
	const closeConfirmAnalysis = () => {
		if (analysisStarting) return;
		setConfirmAnalysisVideo(null);
	};
	const openUpgradeModal = (type = "analysis") => setUpgradeModalType(type);
	const closeUpgradeModal = () => setUpgradeModalType(null);
	const openUpgradeForAnalysis = () => (billing$2?.trialEligible ?? true) && !(billing$2?.hasUsedTrial ?? false) ? billing.trialCheckout("growth") : billing.checkout("growth");
	const videoLabel = (videoId) => {
		const video = results.find((entry) => String(entry.id) === String(videoId));
		return video?.handle || video?.username || video?.title || "This video";
	};
	const updateVideoAnalysis = (videoId, analysis) => {
		if (!videoId || !analysis) return;
		if (analysis.status === "failed") setReservedAnalysisVideoIds((current) => current.filter((id) => String(id) !== String(videoId)));
		setAnalysisByVideoId((current) => {
			const previous = current[videoId] ?? results.find((entry) => String(entry.id) === String(videoId))?.analysis ?? null;
			if (previous?.updated_at === analysis.updated_at && previous?.status === analysis.status) return current;
			if (previous?.status === "processing" && analysis.status === "complete") setAnalysisNotice({
				tone: "success",
				message: `${videoLabel(videoId)} analysis is ready.`
			});
			if (previous?.status === "processing" && analysis.status === "failed") setAnalysisNotice({
				tone: "error",
				message: `${videoLabel(videoId)} analysis could not be completed.`
			});
			return {
				...current,
				[videoId]: analysis
			};
		});
	};
	useEffect(() => {
		if (!analysisNotice) return void 0;
		const timer = window.setTimeout(() => setAnalysisNotice(null), 5e3);
		return () => window.clearTimeout(timer);
	}, [analysisNotice]);
	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") return void 0;
		const media = window.matchMedia("(max-width: 560px)");
		const sync = () => {
			const nextMobile = media.matches;
			setMobileCards(nextMobile);
			setInsightsCollapsed(nextMobile);
		};
		sync();
		if (typeof media.addEventListener === "function") {
			media.addEventListener("change", sync);
			return () => media.removeEventListener("change", sync);
		}
		media.addListener(sync);
		return () => media.removeListener(sync);
	}, []);
	useEffect(() => {
		if (autoOpenedAnalysisRef.current) return;
		const query = typeof window === "undefined" ? "" : window.location.search;
		const params = new URLSearchParams(query);
		const targetVideoId = params.get("analysisVideo");
		if (!(params.get("openAnalysis") === "1") || !targetVideoId) return;
		const targetVideo = results.find((video) => String(video.id) === String(targetVideoId));
		if (!targetVideo) return;
		autoOpenedAnalysisRef.current = true;
		openAnalysis(targetVideo);
		if (typeof window !== "undefined") {
			const next = new URL(window.location.href);
			next.searchParams.delete("analysisVideo");
			next.searchParams.delete("openAnalysis");
			window.history.replaceState({}, "", `${next.pathname}${next.search}${next.hash}`);
		}
	}, [results]);
	const launchManualAnalysis = async (video) => {
		setAnalysisStarting(true);
		setConfirmAnalysisVideo(null);
		try {
			const nextAnalysis = (await videoAnalysis.request(video.id))?.analysis ?? null;
			if (nextAnalysis) updateVideoAnalysis(video.id, nextAnalysis);
			setReservedAnalysisVideoIds((current) => current.some((id) => String(id) === String(video.id)) ? current : [...current, video.id]);
			trackVideoAnalysis({
				videoId: video.id,
				searchUrl: search?.url,
				searchName: search?.name || search?.phrase,
				videoLabel: video.handle || video.username || video.title || video.caption || "Breakout video"
			});
		} catch (error) {
			setConfirmAnalysisVideo(video);
			window.alert(error?.message || "Could not start this analysis.");
		} finally {
			setAnalysisStarting(false);
		}
	};
	const handleAnalyzeAction = (video) => {
		if (!canAnalyzeMoreOutliers) {
			openUpgradeModal("analysis");
			return;
		}
		if (video.analysis?.status === "complete" || video.analysis?.status === "processing") {
			openAnalysis(video);
			return;
		}
		setConfirmAnalysisVideo(video);
	};
	const handleSearchBookmarkAction = () => {
		if (!search?.is_watchlisted && !canBookmarkSearch) {
			openUpgradeModal("search-bookmark");
			return;
		}
		onToggleBookmark?.();
	};
	const openPauseConfirm = () => {
		if (!canManageCurrentSearch) {
			openUpgradeModal("search-management");
			return;
		}
		setMenuOpen(false);
		setConfirmAction(search?.status === "paused" ? "resume" : "pause");
	};
	const openDeleteConfirm = () => {
		if (!canManageCurrentSearch) {
			openUpgradeModal("search-management");
			return;
		}
		setMenuOpen(false);
		setConfirmAction("delete");
	};
	const closeConfirmAction = () => setConfirmAction(null);
	const submitConfirmAction = async () => {
		const action = confirmAction;
		if (!action) return;
		setConfirmAction(null);
		if (action === "delete") {
			await onDelete?.();
			return;
		}
		await onTogglePause?.();
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("style", { children: scopedCss$1 }),
		processing && panelOut && /* @__PURE__ */ jsxs("div", {
			className: "rs-runbar",
			role: "status",
			"aria-live": "polite",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "rs-runbar__mini",
					"aria-hidden": true,
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "#ffc629",
						strokeWidth: "2.4",
						strokeLinecap: "round",
						children: /* @__PURE__ */ jsx("path", { d: "M12 2.8a9.2 9.2 0 1 0 9.2 9.2" })
					})
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "rs-runbar__bd",
					children: [/* @__PURE__ */ jsxs("strong", { children: ["Still scanning TikTok for ", search?.name || search?.phrase || "your search"] }), /* @__PURE__ */ jsxs("span", { children: [PROC_STEPS[Math.min(procStep, PROC_STEPS.length - 1)], " · about a minute left"] })]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "rs-runbar__go",
					onClick: scrollToTop,
					children: "Back to top"
				})
			]
		}),
		landedBarOpen && /* @__PURE__ */ jsxs("div", {
			className: "rs-runbar rs-runbar--done",
			role: "status",
			"aria-live": "polite",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "rs-runbar__mini",
					"aria-hidden": true,
					style: {
						display: "grid",
						placeItems: "center"
					},
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "#ffffff",
						strokeWidth: "3.2",
						strokeLinecap: "round",
						strokeLinejoin: "round",
						children: /* @__PURE__ */ jsx("path", { d: "M5 12.5l4.6 4.5L19 7" })
					})
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "rs-runbar__bd",
					children: [/* @__PURE__ */ jsx("strong", { children: `All ${Number(videosInRun ?? 0).toLocaleString()} videos are in, ${Number(outlierCount ?? 0).toLocaleString()} of them broke out` }), /* @__PURE__ */ jsx("span", { children: "Everything below is the finished readout" })]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "rs-runbar__go",
					onClick: scrollToTop,
					children: "Start from the top"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "rs-runbar__x",
					onClick: () => setLandedBarOpen(false),
					"aria-label": "Dismiss",
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "#ffffff",
						strokeWidth: "2.6",
						strokeLinecap: "round",
						children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
					})
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rs-viewbar",
			children: [/* @__PURE__ */ jsxs("button", {
				type: "button",
				className: "rs-tbtn",
				onClick: goBack,
				children: [Icons.Back, " Go back"]
			}), /* @__PURE__ */ jsxs("div", {
				className: "rs-viewbar__actions rs-mobileonly",
				ref: menuTopRef,
				children: [
					/* @__PURE__ */ jsx("button", {
						className: `rs-iconbtn${search?.is_watchlisted ? " on" : ""}`,
						title: "Bookmark",
						onClick: handleSearchBookmarkAction,
						disabled: bookmarkUpdating,
						children: search?.is_watchlisted ? Icons.Bookmark : Icons.BookmarkO
					}),
					/* @__PURE__ */ jsx("button", {
						className: "rs-iconbtn",
						title: "More",
						onClick: (e) => {
							e.stopPropagation();
							setMenuOpen((v) => !v);
						},
						children: Icons.Kebab
					}),
					menuOpen && /* @__PURE__ */ jsxs("div", {
						className: "rs-menu",
						onClick: (e) => e.stopPropagation(),
						children: [
							/* @__PURE__ */ jsxs("button", {
								onClick: () => {
									setMenuOpen(false);
									setHandleEditing(true);
								},
								children: [Icons.Edit, " Edit TikTok handle"]
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => {
									setMenuOpen(false);
									onRefresh?.();
								},
								disabled: refreshing,
								children: [
									Icons.Refresh,
									" ",
									refreshing ? "Refreshing…" : "Refresh now"
								]
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: openPauseConfirm,
								children: [
									Icons.Pause,
									" ",
									search?.status === "paused" ? "Resume tracking" : "Pause tracking"
								]
							}),
							/* @__PURE__ */ jsx("hr", {}),
							/* @__PURE__ */ jsxs("button", {
								style: { color: "#B0431B" },
								onClick: openDeleteConfirm,
								children: [Icons.Trash, " Delete search"]
							})
						]
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rs-bhead",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "rs-bhead__l",
					style: { background: gradientFor(search?.id ?? search?.name) },
					children: initials(search?.name, search?.phrase)
				}),
				/* @__PURE__ */ jsxs("div", {
					style: {
						minWidth: 0,
						flex: 1
					},
					children: [
						/* @__PURE__ */ jsx("h1", {
							className: "rs-h1",
							children: search?.name || search?.phrase
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rs-bmeta",
							children: [/* @__PURE__ */ jsx("span", {
								className: "rs-bbadge",
								children: (search?.search_type ?? "brand").replace(/^\w/, (c) => c.toUpperCase())
							}), /* @__PURE__ */ jsxs("span", {
								className: "rs-handle",
								children: [/* @__PURE__ */ jsx("span", { children: search?.source_tiktok_handle ? `@${search.source_tiktok_handle.replace(/^@/, "")}` : "no handle set" }), /* @__PURE__ */ jsx("button", {
									className: "rs-ed",
									title: "Edit TikTok handle",
									onClick: () => {
										setHandleDraft(search?.source_tiktok_handle ?? "");
										setHandleEditing((v) => !v);
									},
									children: Icons.Edit
								})]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rs-bsub",
							children: [search?.frequency && /* @__PURE__ */ jsxs("span", {
								className: "rs-bline",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "rs-bline__k",
										children: search.frequency
									}),
									/* @__PURE__ */ jsx("span", { children: search.last_run_at ? `last run ${formatDate$3(search.last_run_at)}` : "not run yet" }),
									search.next_run_at ? /* @__PURE__ */ jsx("span", { children: `next refresh ${formatDate$3(search.next_run_at)}` }) : null
								]
							}), /* @__PURE__ */ jsxs("span", {
								className: `rs-state rs-state--${String(search?.status ?? "ready").toLowerCase()}`,
								children: [/* @__PURE__ */ jsx("span", { className: "rs-state__dot" }), `${STATUS_LABEL[search?.status] ?? "Ready"}`]
							})]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-bhead__actions rs-desktoponly",
					ref: menuHeaderRef,
					children: [
						/* @__PURE__ */ jsx("button", {
							className: `rs-iconbtn${search?.is_watchlisted ? " on" : ""}`,
							title: "Bookmark",
							onClick: handleSearchBookmarkAction,
							disabled: bookmarkUpdating,
							children: search?.is_watchlisted ? Icons.Bookmark : Icons.BookmarkO
						}),
						/* @__PURE__ */ jsx("button", {
							className: "rs-iconbtn",
							title: "More",
							onClick: (e) => {
								e.stopPropagation();
								setMenuOpen((v) => !v);
							},
							children: Icons.Kebab
						}),
						menuOpen && /* @__PURE__ */ jsxs("div", {
							className: "rs-menu",
							onClick: (e) => e.stopPropagation(),
							children: [
								/* @__PURE__ */ jsxs("button", {
									onClick: () => {
										setMenuOpen(false);
										setHandleEditing(true);
									},
									children: [Icons.Edit, " Edit TikTok handle"]
								}),
								/* @__PURE__ */ jsxs("button", {
									onClick: () => {
										setMenuOpen(false);
										onRefresh?.();
									},
									disabled: refreshing,
									children: [
										Icons.Refresh,
										" ",
										refreshing ? "Refreshing…" : "Refresh now"
									]
								}),
								/* @__PURE__ */ jsxs("button", {
									onClick: openPauseConfirm,
									children: [
										Icons.Pause,
										" ",
										search?.status === "paused" ? "Resume tracking" : "Pause tracking"
									]
								}),
								/* @__PURE__ */ jsx("hr", {}),
								/* @__PURE__ */ jsxs("button", {
									style: { color: "#B0431B" },
									onClick: openDeleteConfirm,
									children: [Icons.Trash, " Delete search"]
								})
							]
						})
					]
				})
			]
		}),
		processing && /* @__PURE__ */ jsx(ProcessingPanel, {
			panelRef: procPanelRef,
			step: procStep
		}),
		handleEditing && /* @__PURE__ */ jsxs("div", {
			className: "rs-hedit",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "rs-hedit__pre",
					children: "@"
				}),
				/* @__PURE__ */ jsx("input", {
					autoFocus: true,
					value: handleDraft,
					onChange: (e) => setHandleDraft(e.target.value.replace(/^@/, "")),
					placeholder: "tiktok handle",
					onKeyDown: (e) => {
						if (e.key === "Enter") saveHandle();
						if (e.key === "Escape") setHandleEditing(false);
					}
				}),
				/* @__PURE__ */ jsx("button", {
					className: "rs-btn rs-btn--y rs-btn--sm",
					onClick: saveHandle,
					disabled: savingHandle,
					children: savingHandle ? "Saving…" : "Save"
				}),
				/* @__PURE__ */ jsx("button", {
					className: "rs-btn rs-btn--g rs-btn--sm",
					onClick: () => setHandleEditing(false),
					disabled: savingHandle,
					children: "Cancel"
				})
			]
		}),
		(bullets.length > 0 || search?.ai_summary) && /* @__PURE__ */ jsxs("div", {
			className: `rs-ai${mobileCards ? " rs-ai--mobile" : ""}${insightsCollapsed ? " is-collapsed" : ""}`,
			children: [/* @__PURE__ */ jsxs("button", {
				type: "button",
				className: `rs-ai__toggle${mobileCards ? " is-mobile" : ""}`,
				onClick: () => mobileCards && setInsightsCollapsed((current) => !current),
				"aria-expanded": !insightsCollapsed,
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rs-ai__h",
					children: [
						Icons.Spark,
						/* @__PURE__ */ jsx("span", {
							className: "rs-ai__t",
							children: "Insights"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "rs-ai__when",
							children: formatDate$3(search?.ai_summary_generated_at)
						})
					]
				}), mobileCards && /* @__PURE__ */ jsxs("div", {
					className: "rs-ai__hint",
					children: [/* @__PURE__ */ jsx("span", { children: "Click to View Insights" }), /* @__PURE__ */ jsx("span", {
						className: `rs-ai__chev${insightsCollapsed ? "" : " is-open"}`,
						children: Icons.ChevDown
					})]
				})]
			}), (!mobileCards || !insightsCollapsed) && (bullets.length > 0 ? /* @__PURE__ */ jsx("ul", {
				className: "rs-ai__list",
				children: bullets.map((line, i) => /* @__PURE__ */ jsx("li", { children: renderBold(line) }, i))
			}) : /* @__PURE__ */ jsx("p", {
				style: {
					fontSize: ".92rem",
					lineHeight: 1.5,
					color: "var(--body)"
				},
				children: search.ai_summary
			}))]
		}),
		processing && !(bullets.length > 0 || search?.ai_summary) && /* @__PURE__ */ jsxs("div", {
			className: "rs-ai",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "rs-ai__h",
				children: [
					Icons.Spark,
					/* @__PURE__ */ jsx("span", {
						className: "rs-ai__t",
						children: "Insights"
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "rs-sofar",
						children: [/* @__PURE__ */ jsx("i", {}), "waiting"]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: 10,
					marginTop: 12
				},
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "rs-sk",
						style: {
							width: "100%",
							height: 10
						}
					}),
					/* @__PURE__ */ jsx("span", {
						className: "rs-sk",
						style: {
							width: "92%",
							height: 10
						}
					}),
					/* @__PURE__ */ jsx("span", {
						className: "rs-sk",
						style: {
							width: "61%",
							height: 10
						}
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "rs-stats",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "rs-stt",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "rs-stt__k",
							children: "Breakouts found"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "rs-stt__v",
							children: Number(outlierCount ?? 0).toLocaleString()
						}),
						processing ? /* @__PURE__ */ jsxs("span", {
							className: "rs-sofar",
							children: [/* @__PURE__ */ jsx("i", {}), "so far"]
						}) : /* @__PURE__ */ jsxs("span", {
							className: "rs-stt__d up",
							children: [Icons.UpTrend, /* @__PURE__ */ jsxs("span", { children: [outlierCount ?? 0, " this cycle"] })]
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-stt",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "rs-stt__k",
							children: "Videos in this search"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "rs-stt__v",
							children: Number(videosInRun ?? 0).toLocaleString()
						}),
						processing ? /* @__PURE__ */ jsxs("span", {
							className: "rs-sofar",
							children: [/* @__PURE__ */ jsx("i", {}), "so far"]
						}) : /* @__PURE__ */ jsx("span", {
							className: "rs-stt__d",
							children: search?.last_run_at ? `all from the ${formatDate$3(search.last_run_at)} refresh` : "this run"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-stt hi",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "rs-stt__k",
							children: "Top Breakout Score"
						}),
						/* @__PURE__ */ jsxs("span", {
							className: "rs-stt__v",
							children: [compact(topBreakoutScore), /* @__PURE__ */ jsx("small", { children: "×" })]
						}),
						processing ? /* @__PURE__ */ jsxs("span", {
							className: "rs-sofar rs-sofar--flat",
							children: [/* @__PURE__ */ jsx("i", {}), "can still rise"]
						}) : /* @__PURE__ */ jsx("span", {
							className: "rs-stt__d",
							children: medianViews ? `vs ${compact(medianViews)} median views` : "—"
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-stt",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "rs-stt__k",
							children: "Avg engagement rate"
						}),
						processing && avgEng == null ? /* @__PURE__ */ jsx("span", {
							className: "rs-sk",
							style: {
								width: "66%",
								height: 18,
								marginTop: 3
							}
						}) : /* @__PURE__ */ jsxs("span", {
							className: "rs-stt__v",
							children: [avgEng != null ? Number(avgEng).toFixed(1) : "—", /* @__PURE__ */ jsx("small", { children: "%" })]
						}),
						!processing && /* @__PURE__ */ jsxs("span", {
							className: "rs-stt__d",
							children: [
								"across ",
								results.length,
								" videos"
							]
						})
					]
				})
			]
		}),
		winner && (() => {
			const winnerBucket = bucketForVideo(winner);
			const winnerBucketLabel = winnerBucket === "new" ? "New this run" : winnerBucket === "prev" ? "From the previous run" : "From an older run";
			const winnerBucketHint = winnerBucket === "new" ? runLabels.latest : winnerBucket === "prev" ? runLabels.previous : "3rd run+";
			return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
				className: "rs-sh",
				children: [/* @__PURE__ */ jsx("h2", { children: "Breakout videos" }), /* @__PURE__ */ jsx("span", {
					className: "rs-note",
					children: "Videos with unusually strong engagement for their creator’s audience, ranked by Breakout Score."
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: `rs-winner rs-winner--run-${winnerBucket}`,
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rs-wmedia",
					children: [/* @__PURE__ */ jsx(VideoFrame, {
						video: winner,
						winner: true,
						leading: processing,
						showStats: false,
						isPlaying: videoPlayingId === winner.id,
						onTogglePlay: () => setVideoPlayingId((v) => v === winner.id ? null : winner.id)
					}), /* @__PURE__ */ jsxs("div", {
						className: "rs-oc__ov",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "rs-ovchip rs-ovchip--out",
							children: [/* @__PURE__ */ jsx("div", {
								className: "rs-ovchip__l",
								children: "Breakout Score"
							}), /* @__PURE__ */ jsxs("div", {
								className: "rs-ovchip__n",
								children: [compact(breakoutScore$1(winner)), "×"]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "rs-ovchip rs-ovchip--views",
							children: [/* @__PURE__ */ jsx("div", {
								className: "rs-ovchip__l",
								children: "Views"
							}), /* @__PURE__ */ jsx("div", {
								className: "rs-ovchip__n",
								children: compact(winner.views)
							})]
						})]
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rs-wdet",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "rs-wcreator",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "rs-av",
									style: { background: gradientFor(winner.handle ?? winner.id) }
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "rs-wcreator__copy",
									style: {
										flex: 1,
										minWidth: 0
									},
									children: [/* @__PURE__ */ jsxs("div", {
										className: "rs-wcreator__topline",
										children: [/* @__PURE__ */ jsx("div", {
											className: "rs-wc__n",
											children: winner.handle || winner.username || "—"
										}), /* @__PURE__ */ jsx("div", {
											className: "rs-wc__s",
											children: winner.uploaded_at ? formatDate$3(winner.uploaded_at) : winner.posted_at ? formatDate$3(winner.posted_at) : ""
										})]
									}), /* @__PURE__ */ jsx("div", {
										className: "rs-wc__s",
										children: Number(winner.followers ?? 0) > 0 ? `${compact(winner.followers)} followers` : "on TikTok"
									})]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: `rs-runpill rs-runpill--${winnerBucket}`,
									title: winnerBucketHint,
									children: [/* @__PURE__ */ jsx("span", {
										className: "rs-runpill__dot",
										"aria-hidden": true
									}), winnerBucketLabel]
								}),
								winner.post_url && /* @__PURE__ */ jsx("a", {
									href: winner.post_url,
									target: "_blank",
									rel: "noopener",
									className: "rs-ic2",
									title: "Open in TikTok",
									children: Icons.ExtLink
								})
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "rs-wcap",
							children: winner.title || winner.caption
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "rs-wmets",
							children: [
								/* @__PURE__ */ jsxs("span", { children: [Icons.Eye, /* @__PURE__ */ jsx("b", { children: compact(winner.views) })] }),
								/* @__PURE__ */ jsxs("span", { children: [Icons.Heart, /* @__PURE__ */ jsx("b", { children: compact(winner.likes) })] }),
								/* @__PURE__ */ jsxs("span", { children: [Icons.Comment, /* @__PURE__ */ jsx("b", { children: compact(winner.comments) })] }),
								/* @__PURE__ */ jsxs("span", { children: [Icons.Share, /* @__PURE__ */ jsx("b", { children: compact(winner.shares) })] })
							]
						}),
						/* @__PURE__ */ jsx(VideoTags, { video: winner }),
						/* @__PURE__ */ jsx(AutoAnalysis, { video: winner }),
						/* @__PURE__ */ jsxs("div", {
							className: "rs-wact",
							children: [/* @__PURE__ */ jsx(AnalyzeStateButton, {
								analysis: winner.analysis,
								onClick: () => openAnalysis(winner)
							}), /* @__PURE__ */ jsx("button", {
								className: `rs-ic2${winner.bookmarked ? " on" : ""}`,
								onClick: () => onToggleVideoBookmark?.(winner),
								disabled: bookmarkingVideoId === winner.id,
								title: winner.bookmarked ? "Remove from bookmarks" : "Save video",
								"aria-label": winner.bookmarked ? "Remove from bookmarks" : "Save video",
								children: winner.bookmarked ? Icons.Bookmark : Icons.BookmarkO
							})]
						})
					]
				})]
			})] });
		})(),
		rest.length > 0 && /* @__PURE__ */ jsxs(Fragment$1, { children: [
			/* @__PURE__ */ jsxs("div", {
				className: "rs-sh",
				children: [/* @__PURE__ */ jsx("h2", { children: "More breakouts" }), /* @__PURE__ */ jsxs("span", {
					className: "rs-sh__actions",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "rs-runfilter",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "rs-runfilter__pre",
								children: "Show:"
							}),
							/* @__PURE__ */ jsxs("select", {
								value: runFilter,
								onChange: (e) => setRunFilter(e.target.value),
								"aria-label": "Filter by search run",
								children: [
									/* @__PURE__ */ jsxs("option", {
										value: "all",
										children: [
											"All runs (",
											rest.length,
											")"
										]
									}),
									/* @__PURE__ */ jsxs("option", {
										value: "new",
										children: [
											"New this run (",
											runCounts.new,
											")"
										]
									}),
									/* @__PURE__ */ jsxs("option", {
										value: "prev",
										children: [
											"Previous run (",
											runCounts.prev,
											")"
										]
									}),
									/* @__PURE__ */ jsxs("option", {
										value: "old",
										children: [
											"Older (",
											runCounts.old,
											")"
										]
									})
								]
							}),
							Icons.ChevDown
						]
					}), /* @__PURE__ */ jsxs("span", {
						className: "rs-sortsel",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "rs-sortsel__pre",
								children: "Sort:"
							}),
							/* @__PURE__ */ jsxs("select", {
								value: sortKey,
								onChange: (e) => setSortKey(e.target.value),
								children: [
									/* @__PURE__ */ jsx("option", {
										value: "outlier",
										children: "Breakout Score"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "views",
										children: "Views"
									}),
									/* @__PURE__ */ jsx("option", {
										value: "date",
										children: "Date posted"
									})
								]
							}),
							Icons.ChevDown
						]
					})]
				})]
			}),
			sortedRest.length === 0 ? /* @__PURE__ */ jsxs("div", {
				className: "rs-runempty",
				children: [
					"No videos matched the current run filter.",
					" ",
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "rs-runempty__reset",
						onClick: () => setRunFilter("all"),
						children: "Show all runs"
					})
				]
			}) : /* @__PURE__ */ jsx("div", {
				className: "rs-ogrid",
				children: sortedRest.slice(0, visible).map((v) => /* @__PURE__ */ jsx(BreakoutVideoCard, {
					video: v,
					runBucket: bucketForVideo(v),
					onAnalyze: () => handleAnalyzeAction(v),
					onToggleBookmark: () => onToggleVideoBookmark?.(v),
					bookmarking: bookmarkingVideoId === v.id,
					isPlaying: videoPlayingId === v.id,
					onTogglePlay: () => setVideoPlayingId((cur) => cur === v.id ? null : v.id)
				}, v.id))
			}),
			visible < sortedRest.length && /* @__PURE__ */ jsx("div", {
				className: "rs-loadmore",
				children: /* @__PURE__ */ jsxs("button", {
					className: "rs-btn rs-btn--g",
					onClick: () => setVisible((n) => n + PAGE_STEP),
					children: [
						Icons.Plus,
						" Load ",
						Math.min(PAGE_STEP, sortedRest.length - visible),
						" more"
					]
				})
			})
		] }),
		processing && weeklyPoints.length === 0 ? /* @__PURE__ */ jsx(SkeletonSection, {
			title: "Analytics",
			height: 180
		}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
			className: "rs-sh",
			children: [/* @__PURE__ */ jsx("h2", { children: "Analytics" }), /* @__PURE__ */ jsx("span", {
				className: "rs-note",
				children: "Weekly buckets based on when the matched videos were uploaded."
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "rs-acard",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "rs-mtabs",
					children: [
						["views", "views"],
						["eng", "engagement"],
						["outliers", "breakouts"]
					].map(([key, label]) => /* @__PURE__ */ jsx("button", {
						className: `rs-mtab${metric === key ? " on" : ""}`,
						onClick: () => setMetric(key),
						children: label
					}, key))
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-abig rs-abig--flow",
					children: [/* @__PURE__ */ jsx("span", {
						className: "rs-abig__v",
						children: metricConfig[metric].value
					}), comparisonLabel && /* @__PURE__ */ jsxs("span", {
						className: "rs-abig__delta",
						children: [comparisonLabel, /* @__PURE__ */ jsxs("span", {
							className: "rs-abig__info",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "rs-abig__infoBtn",
								"aria-label": `About ${metric}`,
								children: "i"
							}), /* @__PURE__ */ jsx("span", {
								className: "rs-abig__tooltip",
								role: "tooltip",
								children: metricExplanation(metric)
							})]
						})]
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-achart rs-achart--flow",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "rs-achart__inner",
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "rs-achart__grid",
								"aria-hidden": true,
								children: yAxisTicks.map((tick) => /* @__PURE__ */ jsx("span", { style: { top: `${tick.offset}%` } }, `grid-${metric}-${tick.offset}`))
							}),
							/* @__PURE__ */ jsx("svg", {
								viewBox: "0 0 100 40",
								preserveAspectRatio: "none",
								children: chart && /* @__PURE__ */ jsxs(Fragment$1, { children: [
									/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
										id: "rs-analytics-fill",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ jsx("stop", {
											offset: "0%",
											stopColor: "#E6C97A",
											stopOpacity: ".28"
										}), /* @__PURE__ */ jsx("stop", {
											offset: "100%",
											stopColor: "#F2C96B",
											stopOpacity: "0"
										})]
									}) }),
									/* @__PURE__ */ jsx("path", {
										d: chart.areaPath,
										fill: "url(#rs-analytics-fill)"
									}),
									/* @__PURE__ */ jsx("path", {
										d: chart.linePath,
										fill: "none",
										stroke: "#A87700",
										strokeWidth: "2.25",
										strokeLinecap: "round",
										strokeLinejoin: "round",
										vectorEffect: "non-scaling-stroke"
									})
								] })
							}),
							chartPoints.map(([x, y], index) => {
								const point = weeklyPoints[index];
								const value = chartValues[index] ?? 0;
								const weekKey = weekKeyFromIso(point?.week_start);
								if (!point || !weekKey) return null;
								const weekVideos = videosByWeek[weekKey] ?? [];
								const isLatest = index === chartPoints.length - 1;
								const topPct = y / CHART_BOX.height * 100;
								const tooltip = {
									label: point.label,
									value: formatMetricValue(value, metric),
									count: weekVideos.length,
									x,
									y: topPct
								};
								if (weekVideos.length === 0) return /* @__PURE__ */ jsx("span", {
									className: `rs-achart__point${isLatest ? " is-latest" : ""}`,
									style: {
										left: `${x}%`,
										top: `${topPct}%`
									},
									"aria-hidden": true
								}, `point-${weekKey}`);
								return /* @__PURE__ */ jsx(WeekMarker, {
									videos: weekVideos,
									label: point.label,
									valueLabel: tooltip.value,
									isLatest,
									style: {
										left: `${x}%`,
										top: `${topPct}%`
									},
									onSelect: () => setSelectedWeekKey(weekKey),
									onPeek: () => setChartTooltip(tooltip),
									onPeekEnd: () => setChartTooltip(null)
								}, `point-${weekKey}`);
							}),
							chartTooltip && /* @__PURE__ */ jsxs("div", {
								className: "rs-achart__tooltip",
								role: "status",
								style: {
									left: `${Math.min(Math.max(Number(chartTooltip.x ?? 50), 14), 86)}%`,
									top: `${Number(chartTooltip.y ?? 0)}%`
								},
								children: [
									/* @__PURE__ */ jsx("strong", { children: chartTooltip.label }),
									/* @__PURE__ */ jsx("span", { children: chartTooltip.value }),
									/* @__PURE__ */ jsxs("span", { children: [
										chartTooltip.count,
										" ",
										chartTooltip.count === 1 ? "video" : "videos"
									] })
								]
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "rs-axlabels rs-axlabels--flow",
						children: [
							/* @__PURE__ */ jsx("span", { children: "12 wk ago" }),
							/* @__PURE__ */ jsx("span", { children: "8 wk" }),
							/* @__PURE__ */ jsx("span", { children: "4 wk" }),
							/* @__PURE__ */ jsx("span", { children: "now" })
						]
					})]
				})
			]
		})] }),
		processing && heatCells.length === 0 && /* @__PURE__ */ jsx(SkeletonSection, {
			title: "When they post",
			height: 150
		}),
		heatCells.length > 0 && /* @__PURE__ */ jsxs(Fragment$1, { children: [
			/* @__PURE__ */ jsxs("div", {
				className: "rs-sh",
				children: [/* @__PURE__ */ jsx("h2", { children: "When they post" }), /* @__PURE__ */ jsx("span", {
					className: "rs-note",
					children: "Posting schedule by day and hour."
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rs-heat",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "rs-heatscroll",
						children: /* @__PURE__ */ jsxs("div", {
							className: "rs-heatgrid",
							children: [
								/* @__PURE__ */ jsx("div", {}),
								Array.from({ length: 24 }, (_, h) => /* @__PURE__ */ jsx("div", {
									className: "rs-hh",
									style: { justifyContent: "center" },
									children: HOURS_LABELS[h] ?? ""
								}, h)),
								DAYS_SHORT.map((day, di) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
									className: "rs-hlabel",
									children: day
								}), Array.from({ length: 24 }, (_, h) => {
									const count = Number(heatCells?.[di]?.[h]) || 0;
									const bg = [
										"var(--paper)",
										"var(--a1)",
										"var(--a2)",
										"var(--a3)",
										"var(--a4)",
										"var(--a5)"
									][count > 0 ? Math.min(5, Math.ceil(count / heatMax * 5)) : 0];
									const tooltip = `${day} ${formatHeatmapHour(h)} UTC - ${count} ${count === 1 ? "post" : "posts"}`;
									const updateTooltip = (event) => setHeatmapTooltip({
										label: tooltip,
										x: event.clientX,
										y: event.clientY
									});
									return /* @__PURE__ */ jsx("div", {
										className: `rs-hcell${count > 0 ? " has-posts" : ""}`,
										style: { background: bg },
										title: count > 0 ? tooltip : void 0,
										"aria-label": count > 0 ? tooltip : void 0,
										onMouseEnter: count > 0 ? updateTooltip : void 0,
										onMouseMove: count > 0 ? updateTooltip : void 0,
										onMouseLeave: count > 0 ? () => setHeatmapTooltip(null) : void 0
									}, `c-${di}-${h}`);
								})] }, di))
							]
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rs-hlegend",
						children: [
							"less",
							/* @__PURE__ */ jsx("span", { style: { background: "var(--a1)" } }),
							/* @__PURE__ */ jsx("span", { style: { background: "var(--a2)" } }),
							/* @__PURE__ */ jsx("span", { style: { background: "var(--a3)" } }),
							/* @__PURE__ */ jsx("span", { style: { background: "var(--a4)" } }),
							/* @__PURE__ */ jsx("span", { style: { background: "var(--a5)" } }),
							"more"
						]
					}),
					bestPostTime?.sentence && /* @__PURE__ */ jsxs("div", {
						className: "rs-insightbox",
						children: [Icons.Spark, /* @__PURE__ */ jsx("p", { children: renderBold(bestPostTime.sentence) })]
					})
				]
			}),
			heatmapTooltip && /* @__PURE__ */ jsx("div", {
				className: "rs-heat-tooltip",
				style: {
					left: heatmapTooltip.x + 12,
					top: heatmapTooltip.y - 34
				},
				role: "status",
				children: heatmapTooltip.label
			})
		] }),
		processing && weeklyBars.length === 0 && distribution.length === 0 && /* @__PURE__ */ jsx(SkeletonSection, {
			title: "More data",
			height: 120
		}),
		(weeklyBars.length > 0 || distribution.length > 0) && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
			className: "rs-sh",
			children: [/* @__PURE__ */ jsx("h2", { children: "More data" }), /* @__PURE__ */ jsx("span", {
				className: "rs-note",
				children: "How the tracker is moving."
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "rs-two",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "rs-dcard",
				children: [
					/* @__PURE__ */ jsx("h3", { children: "Breakouts per week" }),
					/* @__PURE__ */ jsx("p", {
						className: "rs-sub",
						children: "Their posts scoring 3× or higher."
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rs-owk",
						children: [weeklyBars.slice(-6).map((b, i) => {
							const count = b.count ?? b.value ?? 0;
							return /* @__PURE__ */ jsxs("div", {
								className: `rs-owk__col${count === weeklyMax && count > 0 ? " peak" : ""}`,
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "rs-owk__v",
										children: count
									}),
									/* @__PURE__ */ jsx("div", {
										className: "rs-owk__bar",
										style: { height: `${Math.max(2, count / weeklyMax * 100)}%` }
									}),
									/* @__PURE__ */ jsx("span", {
										className: "rs-owk__x",
										children: b.label ?? `wk ${i + 1}`
									})
								]
							}, i);
						}), weeklyBars.length === 0 && /* @__PURE__ */ jsx("p", {
							style: {
								fontSize: ".85rem",
								color: "var(--faint-2)"
							},
							children: "No weekly history yet — comes online after your second refresh."
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "rs-dcard",
				children: [
					/* @__PURE__ */ jsx("h3", { children: "Score distribution" }),
					/* @__PURE__ */ jsxs("p", {
						className: "rs-sub",
						children: [
							"This search's ",
							distribution.reduce((s, d) => s + (d.count ?? 0), 0),
							" breakouts."
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "rs-dist",
						children: distribution.map((d) => {
							const shade = d.count / distMax > .7 ? "var(--a5)" : d.count / distMax > .4 ? "var(--a4)" : d.count / distMax > .2 ? "var(--a3)" : "var(--a2)";
							return /* @__PURE__ */ jsxs("div", {
								className: "rs-drow",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "rs-drow__lbl",
										children: d.label
									}),
									/* @__PURE__ */ jsx("div", {
										className: "rs-drow__track",
										children: /* @__PURE__ */ jsx("span", {
											className: "rs-drow__fill",
											style: {
												width: `${d.count / distMax * 100}%`,
												background: shade
											}
										})
									}),
									/* @__PURE__ */ jsx("span", {
										className: "rs-drow__c",
										children: d.count
									})
								]
							}, d.label);
						})
					})
				]
			})]
		})] }),
		processing && hashtags.length === 0 && sounds.length === 0 && /* @__PURE__ */ jsx(SkeletonSection, {
			title: "Hashtags & sounds",
			height: 120
		}),
		(hashtags.length > 0 || sounds.length > 0) && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
			className: "rs-sh",
			children: [/* @__PURE__ */ jsx("h2", { children: "Hashtags & sounds" }), /* @__PURE__ */ jsx("span", {
				className: "rs-note",
				children: "Across this search's breakout videos."
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "rs-two",
			children: [/* @__PURE__ */ jsx(ScrollPanel, {
				title: "Hashtags they used",
				items: hashtags.map((h) => ({
					label: h.tag,
					count: h.count,
					url: `https://www.tiktok.com/tag/${encodeURIComponent(String(h.tag).replace(/^#/, ""))}`
				})),
				max: hashMax
			}), /* @__PURE__ */ jsx(ScrollPanel, {
				title: "Sounds they used",
				items: sounds.map((s) => ({
					label: s.label,
					count: s.count,
					icon: Icons.Music,
					url: `https://www.tiktok.com/search/sound?q=${encodeURIComponent(s.label)}`
				})),
				max: soundMax,
				barColor: "var(--a4)"
			})]
		})] }),
		selectedWeekKey && /* @__PURE__ */ jsx("div", {
			className: "rs-modalback",
			onClick: () => setSelectedWeekKey(null),
			children: /* @__PURE__ */ jsxs("div", {
				className: "rs-weekmodal",
				onClick: (event) => event.stopPropagation(),
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rs-weekmodal__head",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("h3", { children: weeklyPoints.find((point) => weekKeyFromIso(point.week_start) === selectedWeekKey)?.label ?? "Selected week" }),
						/* @__PURE__ */ jsxs("p", { children: [
							selectedWeekVideos.length,
							" matched ",
							selectedWeekVideos.length === 1 ? "video" : "videos",
							" uploaded in this week",
							selectedWeekViews > 0 ? ` · ${compact(selectedWeekViews)} views` : ""
						] }),
						selectedWeekVideos.length > 0 && /* @__PURE__ */ jsxs("span", {
							className: "rs-weekmodal__cue",
							children: [Icons.Play, " Click a video to watch it and open the breakdown"]
						})
					] }), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "rs-weekmodal__close",
						onClick: () => setSelectedWeekKey(null),
						"aria-label": "Close",
						children: "×"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rs-weekmodal__list",
					children: [selectedWeekVideos.map((video) => {
						const multiple = breakoutScore$1(video);
						const openBreakdown = () => {
							setSelectedWeekKey(null);
							openAnalysis(video);
						};
						return /* @__PURE__ */ jsxs("div", {
							role: "button",
							tabIndex: 0,
							className: "rs-weekmodal__row",
							onClick: openBreakdown,
							onKeyDown: (event) => {
								if (event.key !== "Enter" && event.key !== " ") return;
								event.preventDefault();
								openBreakdown();
							},
							children: [
								/* @__PURE__ */ jsxs("span", {
									className: "rs-weekmodal__thumb",
									style: { background: gradientFor(video.id) },
									children: [/* @__PURE__ */ jsx(VideoFace, {
										video,
										prefer: "thumb",
										className: "rs-weekmodal__face"
									}), /* @__PURE__ */ jsx("span", {
										className: "rs-weekmodal__play",
										"aria-hidden": true,
										children: /* @__PURE__ */ jsx("i", { children: Icons.Play })
									})]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "rs-weekmodal__body",
									children: [
										/* @__PURE__ */ jsxs("strong", { children: [/* @__PURE__ */ jsx("span", {
											className: "rs-weekmodal__handle",
											children: video.handle || video.username || video.title || "Video"
										}), multiple >= 3 && /* @__PURE__ */ jsxs("em", {
											className: "rs-weekmodal__ol",
											children: [compact(multiple), "× breakout"]
										})] }),
										/* @__PURE__ */ jsx("span", {
											className: "rs-weekmodal__cap",
											children: video.title || video.caption || "Open this video from the breakout list."
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "rs-weekmodal__meta",
											children: [
												compact(video.views),
												" views · uploaded ",
												formatDate$3(video.uploaded_at) || "—"
											]
										})
									]
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "rs-weekmodal__acts",
									children: [/* @__PURE__ */ jsxs("span", {
										className: "rs-weekmodal__go",
										children: ["Watch ", Icons.ChevRight]
									}), onToggleVideoBookmark && /* @__PURE__ */ jsx("button", {
										type: "button",
										className: `rs-weekmodal__bm${video.bookmarked ? " is-on" : ""}`,
										"aria-pressed": Boolean(video.bookmarked),
										"aria-label": video.bookmarked ? "Remove bookmark" : "Bookmark video",
										disabled: bookmarkingVideoId === video.id,
										onClick: (event) => {
											event.stopPropagation();
											onToggleVideoBookmark(video);
										},
										children: video.bookmarked ? Icons.Bookmark : Icons.BookmarkO
									})]
								})
							]
						}, `week-video-${video.id}`);
					}), selectedWeekVideos.length === 0 && /* @__PURE__ */ jsx("div", {
						className: "rs-weekmodal__empty",
						children: "No videos were available for this week."
					})]
				})]
			})
		}),
		analysisModal && (() => {
			const live = results.find((row) => String(row.id) === String(analysisModal.video.id)) ?? analysisModal.video;
			return /* @__PURE__ */ jsx(AnalysisModal, {
				open: true,
				video: live,
				initialAnalysis: analysisModal.analysis,
				onClose: closeAnalysis,
				onAnalysisChange: updateVideoAnalysis,
				onAnalyze: () => handleAnalyzeAction(live),
				analyzeBusy: analysisStarting,
				saved: Boolean(live.bookmarked),
				saving: bookmarkingVideoId === live.id,
				onToggleSave: onToggleVideoBookmark ? () => onToggleVideoBookmark(live) : void 0
			});
		})(),
		analysisNotice && /* @__PURE__ */ jsxs("div", {
			className: `rs-toast rs-toast--${analysisNotice.tone}`,
			role: "status",
			"aria-live": "polite",
			children: [/* @__PURE__ */ jsx("span", { children: analysisNotice.message }), /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setAnalysisNotice(null),
				"aria-label": "Dismiss notification",
				children: "×"
			})]
		}),
		confirmAnalysisVideo && /* @__PURE__ */ jsx(UsageConfirmModal$1, {
			video: confirmAnalysisVideo,
			creditsRemaining: analysisRemainingNow,
			creditsRemainingAfterUse: analysisRemainingAfterUse,
			busy: analysisStarting,
			onCancel: closeConfirmAnalysis,
			onConfirm: () => launchManualAnalysis(confirmAnalysisVideo)
		}),
		upgradeModalType && /* @__PURE__ */ jsx(AnalysisUpgradeModal, {
			mode: upgradeModalType,
			trialEligible: billing$2?.trialEligible ?? true,
			hasUsedTrial: billing$2?.hasUsedTrial ?? false,
			onClose: closeUpgradeModal,
			onUpgrade: openUpgradeForAnalysis
		}),
		confirmAction && /* @__PURE__ */ jsx(ActionConfirmModal, {
			action: confirmAction,
			searchName: search?.name || search?.phrase,
			onClose: closeConfirmAction,
			onConfirm: submitConfirmAction
		})
	] });
}
function VideoTags({ video }) {
	const tags = [];
	if (video.content_format) tags.push(video.content_format);
	if (video.content_hook) tags.push(`Hook: ${video.content_hook}`);
	if (video.content_angle) tags.push(video.content_angle);
	if (tags.length === 0) (Array.isArray(video.hashtags) ? video.hashtags : []).filter(Boolean).slice(0, 3).forEach((tag) => tags.push(String(tag).startsWith("#") ? String(tag) : `#${tag}`));
	if (tags.length === 0) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "rs-tags",
		children: tags.map((t, i) => /* @__PURE__ */ jsx("span", {
			className: "rs-tag",
			children: t
		}, i))
	});
}
function AutoAnalysis({ video }) {
	const rows = [];
	if (video.why_broke_out) rows.push(["Why it broke out", video.why_broke_out]);
	if (!video.why_broke_out && breakoutScore$1(video) > 0) rows.push(["Performance signal", `${compact(video.views)} views, ${compact(breakoutScore$1(video))}× Breakout Score relative to the creator's audience.`]);
	if (video.content_format) rows.push(["Format", video.content_format]);
	if (video.replicate_with) rows.push(["Replicate with", video.replicate_with]);
	if (rows.length === 0) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "rs-anz",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "rs-anz__h",
			children: [Icons.Spark, "Analysis"]
		}), /* @__PURE__ */ jsx("dl", { children: rows.map(([dt, dd]) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("dt", { children: dt }), /* @__PURE__ */ jsx("dd", { children: dd })] }, dt)) })]
	});
}
function ActionConfirmModal({ action, searchName, onClose, onConfirm }) {
	const isDelete = action === "delete";
	const isResume = action === "resume";
	const title = isDelete ? "Delete this search?" : isResume ? "Resume this search?" : "Pause this search?";
	const body = isDelete ? "This will remove the search from your dashboard and bookmarks." : isResume ? "This search will start tracking again on its normal schedule." : "This search will stop refreshing until you resume it again.";
	const confirmLabel = isDelete ? "Delete search" : isResume ? "Resume tracking" : "Pause tracking";
	return /* @__PURE__ */ jsx("div", {
		className: "rs-modalback",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("div", {
			className: "rs-upgmodal",
			onClick: (event) => event.stopPropagation(),
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "rs-upgmodal__close",
					onClick: onClose,
					"aria-label": "Close confirmation",
					children: /* @__PURE__ */ jsx("svg", {
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2.2",
						strokeLinecap: "round",
						children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-upg__eyebrow",
					children: [isDelete ? Icons.Trash : Icons.Pause, /* @__PURE__ */ jsx("span", { children: isDelete ? "Delete search" : "Tracking status" })]
				}),
				/* @__PURE__ */ jsx("h3", { children: title }),
				/* @__PURE__ */ jsx("p", { children: body }),
				/* @__PURE__ */ jsx("p", {
					className: "rs-usage__subject",
					children: searchName || "Selected search"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rs-upgmodal__actions",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						className: `rs-btn ${isDelete ? "rs-btn--danger" : "rs-btn--y"}`,
						onClick: onConfirm,
						children: confirmLabel
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "rs-btn rs-btn--g",
						onClick: onClose,
						children: "Cancel"
					})]
				})
			]
		})
	});
}
function ScrollPanel({ title, items, max, barColor = "var(--a3)" }) {
	const listRef = useRef(null);
	const [atEnd, setAtEnd] = useState(false);
	useEffect(() => {
		const el = listRef.current;
		if (!el) return void 0;
		const update = () => {
			const end = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
			setAtEnd(end || el.scrollHeight <= el.clientHeight);
		};
		el.addEventListener("scroll", update);
		update();
		return () => el.removeEventListener("scroll", update);
	}, [items]);
	return /* @__PURE__ */ jsxs("div", {
		className: `rs-scrollp${atEnd ? " is-end" : ""}`,
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "rs-scrollp__hd",
				children: [/* @__PURE__ */ jsx("h3", { children: title }), /* @__PURE__ */ jsxs("span", {
					className: "rs-scrollp__cnt",
					children: [items.length, " total"]
				})]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "rs-scrollp__list",
				ref: listRef,
				children: items.map((it, i) => /* @__PURE__ */ jsxs("a", {
					className: "rs-hrow",
					href: it.url,
					target: "_blank",
					rel: "noopener",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "rs-hrow__n",
							children: [
								it.icon,
								/* @__PURE__ */ jsx("span", { children: it.label }),
								Icons.ExtLink
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "rs-hrow__bar",
							children: /* @__PURE__ */ jsx("i", { style: {
								width: `${it.count / max * 100}%`,
								background: barColor
							} })
						}),
						/* @__PURE__ */ jsx("div", {
							className: "rs-hrow__c",
							children: it.count
						})
					]
				}, i))
			}),
			!atEnd && /* @__PURE__ */ jsx("div", {
				className: "rs-scrollp__fade",
				children: /* @__PURE__ */ jsx("span", { children: "scroll for more" })
			})
		]
	});
}
function VideoFace({ video, className, prefer = "avatar" }) {
	const [failed, setFailed] = useState(false);
	const src = prefer === "thumb" ? video?.thumbnail_url || video?.cover || video?.avatar || null : video?.avatar || video?.thumbnail_url || video?.cover || null;
	useEffect(() => {
		setFailed(false);
	}, [src]);
	if (src && !failed) return /* @__PURE__ */ jsx("img", {
		className,
		src,
		alt: "",
		referrerPolicy: "no-referrer",
		loading: "lazy",
		onError: () => setFailed(true)
	});
	return /* @__PURE__ */ jsx("span", {
		className: `${className} rs-face__ph`,
		style: { background: gradientFor(video?.id) },
		children: initials(video?.handle || video?.username || video?.creator_name || video?.title)
	});
}
function WeekMarker({ videos, label, valueLabel, isLatest, style, onSelect, onPeek, onPeekEnd }) {
	const [lead, second, third] = videos;
	const overflow = videos.length - 3;
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		className: `rs-mk${isLatest ? " is-latest" : ""}`,
		style,
		"aria-label": `${label} · ${valueLabel} · ${videos.length} ${videos.length === 1 ? "video" : "videos"}`,
		onClick: onSelect,
		onMouseEnter: onPeek,
		onMouseLeave: onPeekEnd,
		onFocus: onPeek,
		onBlur: onPeekEnd,
		children: [
			second && /* @__PURE__ */ jsx(VideoFace, {
				video: second,
				className: "rs-mk__stack rs-mk__stack--l"
			}),
			third && /* @__PURE__ */ jsx(VideoFace, {
				video: third,
				className: "rs-mk__stack rs-mk__stack--r"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "rs-mk__pin",
				children: /* @__PURE__ */ jsx(VideoFace, {
					video: lead,
					className: "rs-mk__face"
				})
			}),
			overflow > 0 && /* @__PURE__ */ jsxs("span", {
				className: "rs-mk__n rs-mk__n--more",
				children: ["+", overflow]
			}),
			videos.length > 1 && /* @__PURE__ */ jsx("span", {
				className: "rs-mk__n rs-mk__n--all",
				children: videos.length
			})
		]
	});
}
var scopedCss$1 = `
:root{--a1:#FDF0C8;--a2:#FBDE8E;--a3:#F6C445;--a4:#E0A100;--a5:#B87400}
.rs-viewbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px;flex-wrap:wrap;min-width:0;max-width:100%;overflow:visible}
.rs-viewbar__actions{margin-left:auto;display:flex;align-items:center;justify-content:flex-end;gap:8px;flex:none;position:relative;min-width:0;max-width:100%}
.rs-mobileonly{display:none}
.rs-desktoponly{display:flex}
.rs-tbtn{display:inline-flex;align-items:center;gap:7px;font-size:.85rem;font-weight:700;color:var(--muted)}
.rs-tbtn:hover{color:var(--ink)}
.rs-tbtn svg{width:15px;height:15px}

.rs-bhead{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:16px 18px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(250,249,246,.98));box-shadow:0 8px 24px -20px rgba(20,15,0,.24);min-width:0;max-width:100%;overflow-x:hidden}
.rs-bhead__l{width:54px;height:54px;border-radius:15px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:1.05rem;flex:none;text-shadow:0 1px 3px rgba(0,0,0,.15);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 12px 24px -16px rgba(154,107,0,.55)}
.rs-bhead__actions{margin-left:auto;display:flex;align-items:center;justify-content:flex-end;gap:10px;flex:none;position:relative}
.rs-h1{font-size:1.65rem;font-weight:850;letter-spacing:-.04em;color:var(--ink);line-height:1.02;text-wrap:balance}
.rs-bmeta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;font-size:.82rem;color:var(--ink);min-width:0;max-width:100%}
.rs-bbadge{font-size:.64rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-ink);background:var(--wash);padding:5px 9px;border-radius:999px;border:1px solid #f2e4b8}
.rs-sep{width:3px;height:3px;border-radius:50%;background:#CFCCC3}
.rs-handle{display:inline-flex;align-items:center;gap:5px;min-width:0;padding:4px 10px;border-radius:999px;background:var(--paper);border:1px solid var(--line);font-weight:600}
.rs-handle span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
.rs-ed{width:22px;height:22px;border-radius:6px;display:grid;place-items:center;color:var(--faint-2,#9A968E);border:0;background:transparent;cursor:pointer;transition:.15s}
.rs-ed:hover{background:var(--paper);color:var(--ink)} .rs-ed svg{width:13px;height:13px}
.rs-bsub{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:.79rem;color:var(--muted);min-width:0;max-width:100%}
.rs-bline{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.rs-bline span{display:inline-flex;align-items:center}
.rs-bline span+span::before{content:'·';margin-right:7px;color:#c1bdb3}
.rs-bline__k{font-weight:800;color:var(--amber-ink);text-transform:capitalize}
.rs-state{display:inline-flex;align-items:center;gap:7px;padding:4px 10px;border-radius:999px;background:var(--paper);border:1px solid var(--line);font-weight:700;color:var(--muted)}
.rs-state__dot{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.85}
.rs-state--ready,.rs-state--done,.rs-state--complete{color:var(--ok);background:var(--ok-bg);border-color:color-mix(in srgb,var(--ok) 18%,var(--line))}
.rs-state--running,.rs-state--queued,.rs-state--pending,.rs-state--scraping{color:var(--amber-ink);background:var(--wash);border-color:#f2e4b8}
.rs-state--paused{color:#8a6b12;background:#fff6da;border-color:#eddc9a}
.rs-state--failed{color:#b0431b;background:var(--warn-bg);border-color:color-mix(in srgb,#b0431b 20%,var(--line))}
.rs-iconbtn{width:42px;height:42px;border-radius:11px;border:1px solid var(--line-2,#DEDBD3);background:var(--white);display:grid;place-items:center;color:var(--muted);cursor:pointer;transition:.15s;position:relative}
.rs-iconbtn:hover:not(:disabled){border-color:var(--faint-2,#9A968E);color:var(--ink)}
.rs-iconbtn.on{background:var(--wash);border-color:var(--yellow);color:var(--amber-ink)}
.rs-iconbtn svg{width:18px;height:18px}
.rs-iconbtn:disabled{opacity:.5;cursor:not-allowed}
.rs-menu{position:absolute;top:50px;right:0;width:220px;background:var(--white);border:1px solid var(--line);border-radius:16px;padding:6px;z-index:80;box-shadow:0 8px 24px -8px rgba(0,0,0,.15)}
.rs-menu button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 11px;border-radius:11px;font-size:.85rem;font-weight:600;color:var(--body);text-align:left;background:transparent;border:0;cursor:pointer}
.rs-menu button:hover{background:var(--paper);color:var(--ink)} .rs-menu button svg{width:15px;height:15px;color:var(--faint-2,#9A968E)}
.rs-menu hr{border:0;border-top:1px solid var(--line);margin:5px 6px}

.rs-hedit{display:flex;align-items:center;gap:8px;margin-top:12px;padding:10px 12px;border:1px solid var(--line-2,#DEDBD3);border-radius:100px;background:var(--white);max-width:460px}
.rs-hedit__pre{font-size:.9rem;font-weight:700;color:var(--faint-2,#9A968E)}
.rs-hedit input{flex:1;border:0;outline:0;background:transparent;font:inherit;font-size:.92rem;font-weight:700;color:var(--ink)}
.rs-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:42px;padding:0 18px;border-radius:100px;font-size:.88rem;font-weight:700;letter-spacing:-.01em;white-space:nowrap;transition:.16s;border:0;cursor:pointer}
.rs-btn svg{width:15px;height:15px;flex:none}
.rs-btn--y{background:var(--yellow);color:#1A1400} .rs-btn--y:hover:not(:disabled){background:var(--yellow-hot,#FFD84D)}
.rs-btn--g{border:1px solid var(--line-2,#DEDBD3);background:var(--white);color:var(--ink)}
.rs-btn--g:hover:not(:disabled){border-color:var(--faint-2,#9A968E);background:var(--paper)}
.rs-btn--danger{background:#B0431B;color:#fff}
.rs-btn--danger:hover:not(:disabled){background:#972f0f}
.rs-btn--sm{height:34px;padding:0 14px;font-size:.82rem;font-weight:600}
.rs-btn:disabled{opacity:.55;cursor:not-allowed}
/* .rs-analyze, .rs-vf, .rs-vchip, .rs-av, .rs-ic2, .rs-ogrid and .rs-oc live in
   app.css — they are shared with the saved-videos library and analysis modal
   through components/BreakoutVideoCard.jsx. */

.rs-ai{border:1px solid #F2E4B8;background:var(--wash);border-radius:16px;padding:18px 20px;margin-top:20px;min-width:0;max-width:100%;overflow-x:hidden}
.rs-ai__toggle{width:100%;border:0;background:transparent;padding:0;text-align:left;cursor:default}
.rs-ai__toggle.is-mobile{cursor:pointer}
.rs-ai__h{display:flex;align-items:center;gap:9px;margin-bottom:10px}
.rs-ai__h svg{width:19px;height:19px;color:var(--amber-ink)}
.rs-ai__t{font-size:.72rem;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--amber-ink)}
.rs-ai__when{margin-left:auto;font-size:.75rem;color:var(--ink)}
.rs-ai__hint{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:.78rem;font-weight:700;color:var(--amber-ink)}
.rs-ai__chev{display:inline-flex;align-items:center;justify-content:center;transition:transform .18s ease}
.rs-ai__chev svg{width:14px;height:14px;color:currentColor}
.rs-ai__chev.is-open{transform:rotate(180deg)}
.rs-ai__list{list-style:none;display:flex;flex-direction:column;gap:7px;padding:0;margin:0}
.rs-ai__list li{position:relative;padding-left:20px;font-size:.9rem;line-height:1.45;color:var(--body)}
.rs-ai__list li::before{content:'';position:absolute;left:4px;top:9px;width:6px;height:6px;border-radius:50%;background:var(--amber-ink)}
.rs-ai__list b{color:var(--ink);font-weight:800}

.rs-sh{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin:38px 0 14px;flex-wrap:wrap}
.rs-sh h2{font-size:1.06rem;font-weight:800;letter-spacing:-.028em;color:var(--ink);display:flex;align-items:center;gap:11px}
.rs-sh h2::before{content:'';width:4px;height:16px;border-radius:2px;background:var(--yellow)}
.rs-note{font-size:.82rem;color:var(--ink)}

.rs-stats{display:grid;grid-template-columns:repeat(4,1fr);background:var(--white);border:1px solid var(--line);border-radius:16px;overflow:hidden;margin-top:18px;min-width:0;max-width:100%}
.rs-stt{padding:17px 20px;border-right:1px solid var(--line);display:flex;flex-direction:column;gap:11px}
.rs-stt:last-child{border-right:none}
.rs-stt__k{font-size:.73rem;color:var(--ink);font-weight:600}
.rs-stt__v{font-size:1.72rem;font-weight:800;letter-spacing:-.05em;color:var(--ink);line-height:1;font-variant-numeric:tabular-nums}
.rs-stt__v small{font-size:.52em;font-weight:700;color:var(--ink);margin-left:1px}
.rs-stt__d{font-size:.75rem;color:var(--ink);font-weight:500;display:inline-flex;align-items:center;gap:5px}
.rs-stt__d.up{color:var(--ok);font-weight:600} .rs-stt__d svg{width:11px;height:11px}
.rs-stt.hi .rs-stt__v{color:var(--amber-ink)}

@media (min-width:561px){
.rs-viewbar{margin-bottom:18px}
.rs-viewbar__actions{display:none}
.rs-bhead{display:grid;grid-template-columns:58px minmax(0,1fr) auto;align-items:start;gap:16px;padding:0 0 16px;border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}
.rs-bhead__l{width:50px;height:50px;border-radius:14px;font-size:1rem;box-shadow:none}
.rs-bhead__actions .rs-iconbtn{width:46px;height:46px;border-radius:14px;border-color:#E6DFD1;box-shadow:0 2px 6px rgba(36,25,0,.04)}
.rs-h1{font-size:2rem;line-height:.98}
.rs-bmeta{margin-top:6px;gap:10px;font-size:.95rem;color:var(--ink)}
.rs-bbadge{font-size:.68rem;padding:4px 10px}
.rs-handle{padding:0;border:0;background:transparent;border-radius:0;font-weight:500;color:var(--ink)}
.rs-handle span:first-child{max-width:220px}
.rs-ed{width:18px;height:18px}
.rs-bsub{margin-top:10px;gap:8px;font-size:.95rem;color:var(--ink)}
.rs-bline{gap:0}
.rs-bline span+span::before{margin:0 10px 0 9px}
.rs-bline__k{font-weight:700;color:#B28D28}
.rs-state{padding:2px 10px;font-size:.72rem;background:#F3FBF4;border-color:#D6EED9}
.rs-ai{margin-top:12px;padding:18px 22px 16px;border-radius:18px;background:linear-gradient(180deg,#FFF9EA 0%,#FFFCF4 100%);border:1px solid #EBCB7D}
.rs-ai__h{margin-bottom:12px}
.rs-ai__h svg{width:16px;height:16px}
.rs-ai__t{font-size:.84rem;letter-spacing:.15em}
.rs-ai__when{font-size:.92rem;color:var(--ink)}
.rs-ai__list{gap:10px}
.rs-ai__list li{padding-left:18px;font-size:1rem;line-height:1.52}
.rs-ai__list li::before{left:2px;top:11px;width:7px;height:7px}
.rs-stats{margin-top:18px;border-radius:18px;border-color:#E5DED2;grid-template-columns:repeat(4,minmax(0,1fr))}
.rs-stt{padding:18px 20px 17px;gap:10px}
.rs-stt__k{font-size:.9rem;color:var(--ink)}
.rs-stt__v{font-size:2.15rem;letter-spacing:-.06em}
.rs-stt__d{font-size:.95rem;color:var(--ink)}
}

.rs-winner{position:relative;display:grid;grid-template-columns:262px 1fr;gap:22px;background:var(--white);border:1px solid var(--line);border-radius:20px;padding:20px;min-width:0;max-width:100%;overflow:hidden}
/* Run pill in the winner detail column — text remains so the active search
   run context stays visible without relying on accent colors. */
.rs-runpill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:.72rem;font-weight:700;letter-spacing:.01em;white-space:nowrap;border:1px solid transparent;flex:none}
.rs-runpill__dot{width:8px;height:8px;border-radius:50%;flex:none;background:currentColor}
.rs-runpill--new,.rs-runpill--prev,.rs-runpill--old{color:var(--ink);background:var(--paper);border-color:var(--line)}
.rs-wmedia{min-width:0;display:flex;flex-direction:column;gap:12px}
.rs-wdet{min-width:0;display:flex;flex-direction:column}
.rs-wcreator{display:flex;align-items:center;gap:10px}
.rs-wcreator__copy{min-width:0;flex:1}
.rs-wcreator__topline{display:flex;align-items:baseline;gap:8px}
.rs-wc__n{font-size:.92rem;font-weight:800;color:var(--ink);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-wc__s{font-size:.76rem;color:var(--muted);white-space:nowrap}
.rs-wcap{font-size:.92rem;color:var(--body);line-height:1.5;margin:13px 0}
.rs-wmets{display:flex;flex-wrap:wrap;gap:24px;padding:13px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:13px 0}
.rs-wmets span{display:inline-flex;align-items:center;gap:7px;font-size:.9rem;color:var(--ink);font-weight:500}
.rs-wmets svg{width:16px;height:16px;color:var(--ink);flex:none}
.rs-wmets b{font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}
.rs-tags{display:flex;flex-wrap:wrap;gap:7px;margin:13px 0}
.rs-tag{font-size:.76rem;font-weight:600;color:var(--amber-ink);background:var(--wash);border:1px solid #F2E4B8;border-radius:100px;padding:4px 11px}
.rs-anz{border:1px solid var(--line);border-radius:16px;padding:14px 16px;background:var(--paper)}
.rs-anz__h{display:flex;align-items:center;gap:8px;font-size:.74rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-ink);margin-bottom:9px}
.rs-anz__h svg{width:14px;height:14px}
.rs-anz dl{display:grid;grid-template-columns:auto 1fr;gap:6px 14px}
.rs-anz dt{font-size:.8rem;font-weight:700;color:var(--faint,#7C7972)}
.rs-anz dd{font-size:.85rem;color:var(--body)}
.rs-wact{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}

.rs-sh__actions{display:inline-flex;align-items:center;gap:12px;flex-wrap:wrap}
.rs-sortsel,.rs-runfilter{position:relative;display:inline-flex;align-items:center;min-width:0}
.rs-sortsel select,.rs-runfilter select{
  appearance:none;
  min-width:0;
  height:42px;
  padding:0 38px 0 70px;
  border:1px solid var(--line-2,#DEDBD3);
  border-radius:999px;
  background:linear-gradient(180deg,#fff 0%,#fdfbf6 100%);
  font-size:.84rem;
  font-weight:700;
  color:var(--ink);
  cursor:pointer;
  box-shadow:0 1px 2px rgba(20,15,0,.04);
  transition:border-color .16s ease,box-shadow .16s ease,background .16s ease,color .16s ease;
}
.rs-runfilter select{padding-left:74px}
.rs-sortsel select:hover,.rs-runfilter select:hover{border-color:#c7c1b6;background:#fff}
.rs-sortsel select:focus,.rs-runfilter select:focus{
  outline:none;
  border-color:#e2bf5a;
  box-shadow:0 0 0 4px rgba(255,198,41,.16);
}
.rs-sortsel svg,.rs-runfilter svg{position:absolute;right:14px;width:14px;height:14px;color:var(--faint-2,#9A968E);pointer-events:none}
.rs-sortsel__pre,.rs-runfilter__pre{
  position:absolute;
  left:14px;
  top:50%;
  transform:translateY(-50%);
  font-size:.78rem;
  font-weight:700;
  color:var(--faint-2,#9A968E);
  pointer-events:none;
  z-index:1;
}
.rs-runempty{padding:22px;border:1px dashed var(--line);border-radius:14px;background:var(--paper,rgba(250,249,246,.6));font-size:.85rem;color:var(--faint-2,#9A968E);text-align:center}
.rs-runempty__reset{border:0;background:transparent;color:var(--ink);font-weight:700;text-decoration:underline;cursor:pointer;padding:0;margin-left:4px}
/* Mobile: the "More breakouts" header reflows into two controls under the
   title so the run filter remains easy to reach on smaller screens. */
@media (max-width: 640px){
  .rs-sh{display:grid;grid-template-columns:1fr 1fr;grid-template-areas:"title title" "filter sort";align-items:center;gap:10px 12px;margin:28px 0 14px}
  .rs-sh h2{grid-area:title;margin:0}
  .rs-sh .rs-note{grid-column:1 / -1;grid-row:3;margin:0}
  .rs-sh__actions{display:contents}
  .rs-runfilter{grid-area:filter;min-width:0}
  .rs-runfilter select{width:100%}
  .rs-sortsel{grid-area:sort;min-width:0}
  .rs-sortsel select{width:100%}
}
.rs-modalback{position:fixed;inset:0;z-index:130;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,15,0,.34);backdrop-filter:blur(3px)}
.rs-toast{position:fixed;right:18px;bottom:18px;z-index:140;display:flex;align-items:center;gap:12px;max-width:min(420px,calc(100vw - 32px));padding:14px 16px;border-radius:16px;border:1px solid var(--line);background:#fff;box-shadow:0 18px 40px rgba(42,33,20,.18)}
.rs-toast--success{border-color:#cfe8d4;background:#f6fff7}
.rs-toast--error{border-color:#f0d6c8;background:#fff8f4}
.rs-toast span{font-size:.88rem;font-weight:600;color:var(--ink);line-height:1.45}
.rs-toast button{width:28px;height:28px;flex:none;border:0;border-radius:999px;background:rgba(0,0,0,.05);color:var(--muted);font-size:1rem;cursor:pointer}
.rs-usage{width:min(100%,460px);border:1px solid #f2e4b8;border-radius:22px;padding:22px;background:linear-gradient(180deg,#fffdf7 0%,#fff8ea 100%);box-shadow:0 28px 90px rgba(42,33,20,.22)}
.rs-usage h3{margin-top:10px;font-size:1.15rem;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.rs-usage p{margin-top:8px;font-size:.9rem;line-height:1.55;color:var(--muted)}
.rs-usage b{color:var(--ink)}
.rs-usage__subject{margin-top:14px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.7);font-weight:700;color:var(--ink)}
.rs-upgmodal{position:relative;width:min(100%,420px);border:1px solid #f2e4b8;border-radius:22px;padding:22px;background:linear-gradient(180deg,#fffdf7 0%,#fff7e4 100%);box-shadow:0 28px 90px rgba(42,33,20,.22)}
.rs-upgmodal__close{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.8);display:grid;place-items:center;color:var(--muted);cursor:pointer}
.rs-upgmodal__close svg{width:14px;height:14px}
.rs-upg__eyebrow{display:inline-flex;align-items:center;gap:7px;font-size:.67rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--amber-ink)}
.rs-upg__eyebrow svg{width:12px;height:12px}
.rs-upgmodal h3{margin-top:10px;font-size:1.15rem;font-weight:800;letter-spacing:-.03em;color:var(--ink);max-width:14ch}
.rs-upgmodal p{margin-top:8px;font-size:.9rem;line-height:1.55;color:var(--muted)}
.rs-upgmodal__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.rs-upgmodal__actions .rs-btn{flex:1}
.rs-loadmore{display:flex;justify-content:center;margin-top:20px}

.rs-acard{background:linear-gradient(180deg,#FFFEFB 0%,#FFF8EB 100%);border:1px solid #F1E2BE;border-radius:20px;padding:20px 22px;box-shadow:0 18px 38px -30px rgba(117,85,11,.25);min-width:0;max-width:100%;overflow-x:hidden}
.rs-mtabs{display:inline-flex;gap:0;padding:2px;background:#F7F4ED;border:1px solid #DDD3C0;border-radius:9px;margin-bottom:14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}
.rs-mtab{height:24px;padding:0 12px;border-radius:7px;font-size:.72rem;font-weight:500;color:#6F6554;background:transparent;border:0;cursor:pointer;text-transform:lowercase}
.rs-mtab.on{background:#fff;color:#1A1400;box-shadow:0 1px 2px rgba(26,20,0,.08)}
.rs-abig{display:flex;align-items:flex-end;gap:12px}
.rs-abig__v{font-size:2.2rem;font-weight:900;letter-spacing:-.05em;color:var(--ink);line-height:.9;font-variant-numeric:tabular-nums}
.rs-abig__l{font-size:.85rem;color:#8A7445;padding-bottom:4px}
.rs-abig--flow{align-items:center;gap:10px;margin-bottom:14px}
.rs-abig__delta{display:inline-flex;align-items:center;gap:6px;font-size:.84rem;font-weight:700;color:#2D8A55;padding-top:6px;white-space:nowrap}
.rs-abig__info{position:relative;display:inline-flex;align-items:center}
.rs-abig__infoBtn{width:16px;height:16px;display:grid;place-items:center;border-radius:999px;border:1px solid rgba(45,138,85,.28);background:#fff;color:#2D8A55;font-size:.68rem;font-weight:800;line-height:1;cursor:help}
.rs-abig__tooltip{position:absolute;left:22px;top:50%;transform:translateY(-50%);width:min(260px,calc(100vw - 80px));padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.98);border:1px solid #D8E8DC;box-shadow:0 16px 30px -24px rgba(0,0,0,.25);font-size:.72rem;font-weight:500;line-height:1.4;color:#34513F;opacity:0;pointer-events:none;transition:opacity .14s ease;white-space:normal;z-index:4}
.rs-abig__info:hover .rs-abig__tooltip,.rs-abig__info:focus-within .rs-abig__tooltip{opacity:1}
.rs-achart{position:relative;height:236px;margin-top:2px}
.rs-achart--flow{border:none;background:transparent;box-shadow:none;padding:0}
.rs-achart__inner{position:relative;height:200px}
.rs-achart--flow svg{position:absolute;inset:0;width:100%;height:100%}
.rs-achart__grid span{position:absolute;left:0;right:0;height:1px;background:rgba(168,119,0,.08)}
/* A week with no matched videos keeps a plain, inert dot. */
.rs-achart__point{position:absolute;display:block;width:9px;height:9px;border-radius:999px;border:1.5px solid #fff;background:#CBB68A;box-shadow:0 4px 10px rgba(168,119,0,.12);transform:translate(-50%,-50%)}
.rs-achart__point.is-latest{background:#A87700}

/* Annotated data points: an avatar pin for every week that matched videos. */
.rs-mk{position:absolute;z-index:3;width:40px;height:40px;padding:0;border:0;background:none;cursor:pointer;transform:translate(-50%,-100%);transition:transform .17s cubic-bezier(.22,.61,.36,1)}
.rs-mk:hover,.rs-mk:focus-visible{transform:translate(-50%,-100%) translateY(-4px);outline:none;z-index:4}
.rs-mk__stack{position:absolute;left:50%;top:4px;box-sizing:border-box;width:24px;height:24px;border-radius:999px;border:1.5px solid #fff;background:#F7F4ED;object-fit:cover;z-index:1;transition:border-color .17s}
.rs-mk__stack--l{transform:translate(-50%,0) translateX(-9px)}
.rs-mk__stack--r{transform:translate(-50%,0) translateX(9px)}
.rs-mk__pin{position:absolute;left:50%;top:0;z-index:2;box-sizing:border-box;width:32px;height:32px;padding:3px;background:#fff;border:1px solid #EFE3C6;border-radius:999px;transform:translateX(-50%);box-shadow:0 8px 16px -10px rgba(117,85,11,.55);transition:border-color .17s,background .17s}
.rs-mk__pin::before,.rs-mk__pin::after{content:'';position:absolute;left:50%;transform:translateX(-50%);border-left:6px solid transparent;border-right:6px solid transparent}
.rs-mk__pin::before{bottom:-8px;border-top:8px solid #EFE3C6;z-index:0;transition:border-top-color .17s}
.rs-mk__pin::after{bottom:-6px;border-top:7px solid #fff;z-index:1;transition:border-top-color .17s}
.rs-mk__face{position:relative;z-index:2;box-sizing:border-box;width:100%;height:100%;border-radius:999px;object-fit:cover;background:#F7F4ED}
/* Shared initials placeholder for any face whose image is absent or broken.
   It carries its own type size so an unstyled parent can never let the initials
   inherit body text and spill out of a 20px circle; larger faces override. */
.rs-face__ph{display:grid;place-items:center;overflow:hidden;color:#fff;font-size:.55rem;font-weight:800;letter-spacing:-.02em;line-height:1}
.rs-mk__stack.rs-face__ph{font-size:.46rem}
.rs-mk:hover .rs-mk__pin,.rs-mk:focus-visible .rs-mk__pin{border-color:#C7981A;background:#FFF6E1}
.rs-mk:hover .rs-mk__pin::before,.rs-mk:focus-visible .rs-mk__pin::before{border-top-color:#C7981A}
.rs-mk:hover .rs-mk__pin::after,.rs-mk:focus-visible .rs-mk__pin::after{border-top-color:#FFF6E1}
.rs-mk:hover .rs-mk__stack,.rs-mk:focus-visible .rs-mk__stack{border-color:#FFF6E1}
.rs-mk__n{position:absolute;top:-5px;right:-3px;z-index:4;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#F2C96B;border:1.5px solid #fff;font-size:.58rem;font-weight:800;color:#1A1400;line-height:14px;text-align:center;font-variant-numeric:tabular-nums}
.rs-mk__n--all{display:none}
.rs-achart__tooltip{position:absolute;display:flex;flex-direction:column;gap:2px;width:max-content;max-width:190px;padding:9px 12px;border-radius:12px;background:rgba(255,255,255,.98);border:1px solid #E7D7AF;box-shadow:0 16px 30px -24px rgba(0,0,0,.25);z-index:5;transform:translate(-50%,20px);pointer-events:none}
.rs-achart__tooltip strong{font-size:.78rem;color:var(--ink)}
.rs-achart__tooltip span{font-size:.72rem;color:#7C704D}
.rs-axlabels{display:flex;justify-content:space-between;gap:12px;margin-top:8px;font-size:.68rem;color:#8A7445;font-weight:500}
.rs-axlabels--flow{padding-top:2px}
.rs-axlabels__start{text-align:left}
.rs-axlabels__center{text-align:center;flex:1}
.rs-axlabels__end{text-align:right}
.rs-weekmodal{width:min(100%,760px);max-height:min(80vh,720px);display:flex;flex-direction:column;border-radius:22px;background:#fffdf8;border:1px solid #F1E2BE;box-shadow:0 28px 60px rgba(58,44,14,.18);overflow:hidden}
.rs-weekmodal__head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 22px;border-bottom:1px solid #F1E2BE;background:linear-gradient(180deg,#FFFDF6 0%,#FFF8EA 100%)}
.rs-weekmodal__head h3{font-size:1.05rem;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.rs-weekmodal__head p{margin-top:4px;font-size:.84rem;color:var(--ink)}
.rs-weekmodal__close{width:34px;height:34px;flex:none;border-radius:999px;border:1px solid #E8D9B3;background:#fff;color:#8A7445;font-size:1.1rem;cursor:pointer}
.rs-weekmodal__list{padding:14px;overflow:auto;display:flex;flex-direction:column;gap:10px}
.rs-weekmodal__cue{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:4px 9px;border-radius:7px;border:1px solid #F0DFB4;background:#fff;font-size:.72rem;font-weight:700;color:#A87700}
.rs-weekmodal__cue svg{width:11px;height:11px}
.rs-weekmodal__row{display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:12px;align-items:center;padding:9px;border-radius:16px;border:1px solid #EFE3C6;background:#fff;cursor:pointer;text-align:left;transition:border-color .16s,background .16s,transform .16s}
.rs-weekmodal__row:hover,.rs-weekmodal__row:focus-visible{border-color:#E3C36F;background:#FFF9EC;transform:translateY(-1px);outline:none}
.rs-weekmodal__thumb{position:relative;width:52px;height:70px;border-radius:10px;overflow:hidden;display:grid;place-items:center;color:#fff;font-size:.9rem;font-weight:800}
.rs-weekmodal__thumb img,.rs-weekmodal__face{width:100%;height:100%;object-fit:cover}
.rs-weekmodal__face.rs-face__ph{font-size:.9rem}
.rs-weekmodal__play{position:absolute;inset:0;display:grid;place-items:center;background:rgba(20,15,0,.34);opacity:0;transition:opacity .16s}
.rs-weekmodal__row:hover .rs-weekmodal__play,.rs-weekmodal__row:focus-visible .rs-weekmodal__play{opacity:1}
.rs-weekmodal__play i{width:24px;height:24px;border-radius:999px;background:#fff;display:grid;place-items:center}
.rs-weekmodal__play svg{width:10px;height:10px;color:var(--ink)}
.rs-weekmodal__body{display:flex;flex-direction:column;gap:3px;min-width:0}
.rs-weekmodal__body strong{display:flex;align-items:center;gap:7px;min-width:0;font-size:.88rem;color:var(--ink)}
.rs-weekmodal__handle{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-weekmodal__ol{flex:none;font-style:normal;font-size:.62rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#A87700;background:#FFF6E1;border:1px solid #F2E4BE;padding:2px 6px;border-radius:5px}
.rs-weekmodal__cap{font-size:.8rem;color:#5C5A54;line-height:1.4;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.rs-weekmodal__meta{font-size:.76rem;color:#7C704D;line-height:1.4;font-variant-numeric:tabular-nums}
.rs-weekmodal__acts{display:flex;align-items:center;gap:8px;flex:none}
.rs-weekmodal__go{display:inline-flex;align-items:center;gap:4px;font-size:.76rem;font-weight:700;color:#A87700;white-space:nowrap;opacity:.55;transition:opacity .16s}
.rs-weekmodal__row:hover .rs-weekmodal__go,.rs-weekmodal__row:focus-visible .rs-weekmodal__go{opacity:1}
.rs-weekmodal__go svg{width:11px;height:11px}
.rs-weekmodal__bm{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:9px;border:1px solid #EFE3C6;background:#fff;color:#8A7445;cursor:pointer;transition:border-color .16s,background .16s,color .16s}
.rs-weekmodal__bm svg{width:15px;height:15px}
.rs-weekmodal__bm:hover{border-color:#E3C36F;color:var(--ink)}
.rs-weekmodal__bm.is-on{background:#F2C96B;border-color:#F2C96B;color:#1A1400}
.rs-weekmodal__bm:disabled{opacity:.5;cursor:default}
.rs-weekmodal__empty{padding:24px 12px;text-align:center;font-size:.85rem;color:#7C704D}

.rs-heat{background:var(--white);border:1px solid var(--line);border-radius:20px;padding:20px;min-width:0;max-width:100%;overflow:hidden}
.rs-heatscroll{overflow-x:auto;padding-bottom:6px}
.rs-heatgrid{display:grid;grid-template-columns:34px repeat(24,1fr);gap:3px;min-width:620px}
.rs-hh{font-size:.66rem;color:var(--faint-2,#9A968E);font-weight:700;display:flex;align-items:center}
.rs-hlabel{grid-column:1/2;font-size:.72rem;color:var(--muted);font-weight:700;display:flex;align-items:center;height:20px}
.rs-hcell{height:20px;border-radius:4px;background:var(--paper)}
.rs-hcell.has-posts{cursor:help}
.rs-heat-tooltip{position:fixed;z-index:60;pointer-events:none;padding:6px 9px;border-radius:7px;background:#1F1D1A;color:#fff;font-size:.7rem;font-weight:700;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.2)}
.rs-hlegend{display:flex;align-items:center;gap:6px;margin-top:14px;font-size:.72rem;color:var(--ink);font-weight:600}
.rs-hlegend span{width:16px;height:12px;border-radius:3px}
.rs-insightbox{display:flex;gap:11px;margin-top:16px;padding:14px 16px;background:var(--wash);border:1px solid #F2E4B8;border-radius:16px}
.rs-insightbox svg{width:18px;height:18px;color:var(--amber-ink);flex:none;margin-top:1px}
.rs-insightbox p{font-size:.86rem;color:var(--body);line-height:1.5}
.rs-insightbox b{color:var(--ink);font-weight:800}

.rs-two{display:grid;grid-template-columns:1fr 1fr;gap:14px;min-width:0;max-width:100%}
.rs-dcard{background:var(--white);border:1px solid var(--line);border-radius:20px;padding:20px;min-width:0;max-width:100%;overflow:hidden}
.rs-dcard h3{font-size:.95rem;font-weight:800;color:var(--ink);letter-spacing:-.028em}
.rs-sub{font-size:.78rem;color:var(--ink);margin-top:2px}
.rs-owk{display:flex;align-items:flex-end;gap:12px;height:120px;margin-top:20px}
.rs-owk__col{flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;height:100%;justify-content:flex-end}
.rs-owk__bar{width:100%;max-width:34px;border-radius:7px 7px 0 0;background:var(--a2);transition:.2s}
.rs-owk__col.peak .rs-owk__bar{background:var(--yellow)}
.rs-owk__v{font-size:.78rem;font-weight:800;color:var(--ink)}
.rs-owk__x{font-size:.7rem;color:var(--ink);font-weight:600}
.rs-dist{display:flex;flex-direction:column;gap:11px;margin-top:18px}
.rs-drow{display:grid;grid-template-columns:52px 1fr 30px;align-items:center;gap:12px}
.rs-drow__lbl{font-size:.8rem;font-weight:700;color:var(--muted)}
.rs-drow__track{height:10px;border-radius:100px;background:var(--paper);overflow:hidden}
.rs-drow__fill{height:100%;border-radius:100px;display:block}
.rs-drow__c{font-size:.82rem;font-weight:800;color:var(--ink);text-align:right;font-variant-numeric:tabular-nums}

.rs-scrollp{position:relative;background:var(--white);border:1px solid var(--line);border-radius:20px;overflow:hidden;min-width:0;max-width:100%}
.rs-scrollp__hd{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 10px}
.rs-scrollp__hd h3{font-size:.95rem;font-weight:800;color:var(--ink)}
.rs-scrollp__cnt{font-size:.75rem;color:var(--ink);font-weight:600}
.rs-scrollp__list{max-height:232px;overflow-y:auto;padding:2px 20px 20px;scrollbar-width:thin;scrollbar-color:var(--line-2) transparent}
.rs-scrollp__list::-webkit-scrollbar{width:7px}
.rs-scrollp__list::-webkit-scrollbar-thumb{background:var(--line-2,#DEDBD3);border-radius:100px;border:2px solid var(--white)}
.rs-hrow{display:grid;grid-template-columns:1fr 74px 30px;align-items:center;gap:12px;padding:9px 0;border-top:1px solid var(--line);color:inherit;text-decoration:none;transition:.14s}
.rs-hrow:first-child{border-top:none}
.rs-hrow:hover{background:var(--paper);border-radius:8px;padding-left:6px;padding-right:6px}
.rs-hrow__n{display:flex;align-items:center;gap:8px;font-size:.86rem;font-weight:700;color:var(--ink);min-width:0}
.rs-hrow__n svg:first-child{width:15px;height:15px;color:var(--faint-2,#9A968E);flex:none}
.rs-hrow__n span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-hrow__n svg:last-child{width:12px;height:12px;color:var(--faint-2,#9A968E);flex:none;opacity:0;transition:.14s}
.rs-hrow:hover .rs-hrow__n svg:last-child{opacity:1}
.rs-hrow__bar{height:8px;border-radius:100px;background:var(--paper);overflow:hidden}
.rs-hrow__bar i{display:block;height:100%;border-radius:100px;background:var(--a3)}
.rs-hrow__c{font-size:.82rem;font-weight:800;color:var(--muted);text-align:right;font-variant-numeric:tabular-nums}
.rs-scrollp__fade{position:absolute;left:0;right:0;bottom:0;height:48px;background:linear-gradient(transparent,var(--white));pointer-events:none;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;transition:opacity .2s}
.rs-scrollp__fade span{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:700;color:var(--faint,#7C7972);background:var(--white);border:1px solid var(--line);border-radius:100px;padding:3px 10px}
.rs-scrollp.is-end .rs-scrollp__fade{opacity:0}

@media (max-width:900px){
  .rs-stats{grid-template-columns:1fr 1fr}
  .rs-stt:nth-child(2){border-right:none}
  .rs-stt:nth-child(1),.rs-stt:nth-child(2){border-bottom:1px solid var(--line)}
  .rs-winner{grid-template-columns:1fr}.rs-vf--big{max-width:240px;margin:0 auto}.rs-wmedia{max-width:240px;margin-inline:auto;width:100%}
  .rs-two{grid-template-columns:1fr}
  .rs-bhead{align-items:flex-start}
}
@media (max-width:560px){
.rs-mobileonly{display:flex}
.rs-desktoponly{display:none}
.rs-viewbar{margin-bottom:12px}
.rs-viewbar__actions{gap:6px}
.rs-bhead{padding:12px 13px;border-radius:15px;gap:10px}
.rs-bhead__l{width:42px;height:42px;border-radius:12px;font-size:.88rem}
.rs-h1{font-size:1.15rem;line-height:1.05}
.rs-bmeta{margin-top:5px;gap:6px;font-size:.72rem}
.rs-bbadge{padding:4px 8px}
.rs-bsub{margin-top:6px;gap:6px;font-size:.7rem}
.rs-bline{gap:5px}
.rs-bline span+span::before{margin-right:5px}
.rs-state{padding:3px 8px;font-size:.68rem}
.rs-iconbtn{width:36px;height:36px;border-radius:10px}
.rs-iconbtn svg{width:15px;height:15px}
.rs-ai{margin-top:14px;padding:14px 14px 13px;border-radius:14px}
.rs-ai__h{margin-bottom:0}
.rs-ai__h svg{width:16px;height:16px}
.rs-ai__t{font-size:.65rem}
.rs-ai__when{font-size:.68rem}
.rs-ai--mobile .rs-ai__hint{margin-top:6px}
.rs-ai--mobile:not(.is-collapsed) .rs-ai__hint{margin-bottom:10px}
.rs-ai__list{gap:6px}
.rs-ai__list li{padding-left:16px;font-size:.82rem;line-height:1.38}
.rs-ai__list li::before{left:2px;top:8px;width:5px;height:5px}
.rs-stats{margin-top:14px;border-radius:14px}
.rs-stt{padding:12px 12px 11px;gap:6px}
.rs-stt__k{font-size:.65rem}
.rs-stt__v{font-size:1.28rem}
.rs-stt__d{font-size:.67rem;line-height:1.25}
.rs-stt__d svg{width:10px;height:10px}
.rs-handle{padding:0;background:transparent;border:0;color:var(--muted);font-weight:600}
.rs-handle span:first-child{max-width:150px}
.rs-handle .rs-ed{display:none}
.rs-upgmodal{padding:20px 16px 16px}
.rs-upgmodal h3{font-size:1.02rem;max-width:none}
.rs-upgmodal p{font-size:.84rem}
.rs-upgmodal__actions .rs-btn{width:100%}
}
/* Narrow screens: smaller pins so neighbouring weeks stop colliding, and the
   week rows drop the "Watch" cue in favour of the thumbnail affordance. */
@media (max-width:560px){
.rs-achart{height:206px}
.rs-achart__inner{height:172px}
.rs-mk{width:28px;height:34px}
.rs-mk__pin{width:26px;height:26px;padding:2.5px}
.rs-mk__pin::before{bottom:-7px;border-left-width:5px;border-right-width:5px;border-top-width:7px}
.rs-mk__pin::after{bottom:-5px;border-left-width:5px;border-right-width:5px;border-top-width:6px}
/* No room to fan three faces out at this width, so the pin carries the lead
   creator and the badge switches to the plain video count. */
.rs-mk__stack{display:none}
.rs-mk__n{top:-6px;right:-6px;min-width:16px;height:16px;line-height:13px;font-size:.55rem}
.rs-mk__n--more{display:none}
.rs-mk__n--all{display:block}
.rs-weekmodal__go{display:none}
.rs-weekmodal__row{gap:10px;grid-template-columns:46px minmax(0,1fr) auto}
.rs-weekmodal__thumb{width:46px;height:62px}
}

/* ---------- live-run (M20 / M20b / M20c) ---------- */
@keyframes rs-turn{to{transform:rotate(360deg)}}
@keyframes rs-ring{0%{transform:scale(.9);opacity:1}100%{transform:scale(1.12);opacity:0}}
@keyframes rs-sweepmove{0%{left:-40%}100%{left:100%}}
@keyframes rs-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.24);opacity:.6}}
@keyframes rs-shim{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

.rs-proc{border:1px solid var(--line);border-radius:18px;background:var(--white);padding:18px 17px 17px;display:flex;flex-direction:column;gap:15px;margin-bottom:22px;box-shadow:0 8px 24px -20px rgba(20,15,0,.24)}
.rs-proc__top{display:flex;align-items:center;gap:15px}
.rs-proc__copy{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px}
.rs-proc__copy h2{margin:0;font-size:1.2rem;line-height:1.18;font-weight:800;letter-spacing:-.03em;color:var(--ink)}
.rs-proc__lede{font-size:.86rem;line-height:1.45;color:var(--muted)}
.rs-spin{position:relative;width:48px;height:48px;flex:none;display:grid;place-items:center}
.rs-spin svg{position:absolute;inset:0;width:100%;height:100%;animation:rs-turn 1.15s linear infinite}
.rs-spin__tr{fill:none;stroke:var(--paper,#f1efe9);stroke-width:9}
.rs-spin__arc{fill:none;stroke:url(#rs-proc-g);stroke-width:9;stroke-linecap:round;stroke-dasharray:108 400}
.rs-spin>i{position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(255,198,41,.5);animation:rs-ring 2.4s ease-out infinite}
.rs-sweep{position:relative;height:5px;border-radius:999px;background:var(--paper,#f1efe9);overflow:hidden}
.rs-sweep i{position:absolute;top:0;bottom:0;width:38%;border-radius:999px;background:linear-gradient(90deg,#ffd84d,#ff9f1c);animation:rs-sweepmove 1.7s ease-in-out infinite}
.rs-proc__steps{display:flex;flex-direction:column;gap:10px}
.rs-tick{display:flex;align-items:flex-start;gap:11px;font-size:.85rem;font-weight:500;color:var(--body,#33312c);line-height:1.45}
.rs-tick__d{width:18px;height:18px;flex:none;margin-top:1px;display:grid;place-items:center;border-radius:50%;background:var(--ok-bg,#edf7f0);color:var(--ok,#12703f);font-size:.7rem;line-height:1}
.rs-tick__d svg{width:9px;height:9px}
.rs-tick__c{margin-left:auto;flex:none;width:15px;height:15px;margin-top:2px;color:var(--amber-ink,#9a6b00)}
.rs-tick__c svg{width:15px;height:15px;animation:rs-turn .9s linear infinite}
.rs-tick--now{color:var(--ink);font-weight:700}
.rs-tick--now .rs-tick__d{background:var(--yellow);color:#0b0b0b;animation:rs-pulse 1.4s ease-in-out infinite}
.rs-tick--wait{color:var(--faint-2,#9A968E)}
.rs-tick--wait .rs-tick__d{background:var(--paper,#f1efe9);color:var(--paper,#f1efe9)}

.rs-runbar{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:11px;padding:10px 16px;margin-bottom:18px;border-radius:0 0 14px 14px;background:#0b0b0b;color:#fff;box-shadow:0 10px 24px -16px rgba(0,0,0,.5)}
.rs-runbar__mini{width:26px;height:26px;flex:none;display:grid;place-items:center}
.rs-runbar__mini svg{width:24px;height:24px;animation:rs-turn 1.05s linear infinite}
.rs-runbar--done .rs-runbar__mini svg{width:20px;height:20px;animation:none}
.rs-runbar__bd{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.rs-runbar__bd strong{font-size:.82rem;font-weight:700;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-runbar__bd span{color:#d6d2c6;font-size:.71rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs-runbar__go{flex:none;display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;background:var(--yellow);color:#0b0b0b;font-size:.75rem;font-weight:700;white-space:nowrap;border:0;cursor:pointer}
.rs-runbar--done{background:#12703f}
.rs-runbar--done .rs-runbar__bd span{color:#cfe8da}
.rs-runbar__x{flex:none;width:26px;height:26px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.16);border:0;cursor:pointer}
.rs-runbar__x svg{width:12px;height:12px}
/* Below 900px the app shell shows its own sticky top bar (~51px, z-index 50);
   drop the runbar beneath it so it is not hidden behind the bar. */
@media (max-width:900px){.rs-runbar{top:51px;z-index:49}}
/* On mobile the brand header is a card, so give the processing panel below it
   some breathing room instead of letting the two cards nearly touch. */
@media (max-width:560px){.rs-proc{margin-top:16px}}

.rs-sofar{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;background:var(--wash,#fff8e6);color:var(--amber-ink,#9a6b00);font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;white-space:nowrap}
.rs-sofar i{width:6px;height:6px;border-radius:50%;background:var(--yellow);animation:rs-pulse 1.4s ease-in-out infinite}
.rs-sofar--flat{background:var(--paper,#f1efe9);color:var(--muted)}
.rs-sofar--flat i{background:var(--muted);animation:none}

.rs-sk{position:relative;overflow:hidden;border-radius:7px;background:#ecebe4;display:block}
.rs-sk::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.72) 50%,rgba(255,255,255,0));animation:rs-shim 1.6s ease-in-out infinite}
.rs-skcard{border:1px solid var(--line);border-radius:16px;background:var(--white);padding:16px;display:flex;flex-direction:column;gap:10px}

.rs-vf__win--lead{background:var(--amber-ink,#9a6b00);color:#fff8e6}

@media (prefers-reduced-motion:reduce){
.rs-spin svg,.rs-spin>i,.rs-sweep i,.rs-tick--now .rs-tick__d,.rs-tick__c svg,.rs-runbar__mini svg,.rs-sofar i,.rs-sk::after{animation:none}
}
`;
var goBack = () => {
	window.location.assign("/home");
};
//#endregion
//#region resources/js/Pages/SavedSearches/Show.jsx
var Show_exports$1 = /* @__PURE__ */ __exportAll({ default: () => Show$1 });
var ACTIVE_SEARCH_STATUSES = /* @__PURE__ */ new Set([
	"pending",
	"queued",
	"running",
	"scraping"
]);
var SEARCH_POLL_MS = 8e3;
function BuildingPopup({ subject, onDashboard, onClose }) {
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: onClose
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box bb-buildpop",
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "bb-buildpop-title",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "bb-buildpop__i",
						"aria-hidden": "true",
						children: /* @__PURE__ */ jsxs("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							strokeLinecap: "round",
							children: [/* @__PURE__ */ jsx("circle", {
								cx: "11",
								cy: "11",
								r: "7"
							}), /* @__PURE__ */ jsx("path", { d: "m20 20-3.5-3.5" })]
						})
					}),
					/* @__PURE__ */ jsx("h2", {
						id: "bb-buildpop-title",
						children: "Your report is still building"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "sub",
						children: [
							"We’re scanning TikTok for ",
							/* @__PURE__ */ jsx("b", { children: subject }),
							" and filling this page in as results land. Check back in a few minutes — or browse your feed while you wait. We’ll email you the moment it’s complete."
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bb-buildpop__actions",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--y btn--w",
							onClick: onDashboard,
							children: "Browse your feed"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g btn--w",
							onClick: onClose,
							children: "Stay on this page"
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "bb-buildpop__fine",
						children: "Early results are already visible below."
					})
				]
			})]
		})
	});
}
var buildingCss = `
.bb-pend{border:1px solid var(--line);border-radius:var(--r-xl);background:var(--white);padding:22px 24px;margin-bottom:22px;box-shadow:0 1px 2px rgba(20,15,0,.04)}
.bb-pend__t{display:flex;align-items:center;gap:11px;flex-wrap:wrap}
.bb-pend__t h2{font-size:1.06rem;margin:0;letter-spacing:-.01em}
.bb-pend__pill{display:inline-flex;align-items:center;gap:7px}
.bb-pend__spin{width:11px;height:11px;border-radius:50%;border:2px solid currentColor;border-top-color:transparent;animation:bb-pend-spin .8s linear infinite;flex:none;opacity:.85}
@keyframes bb-pend-spin{to{transform:rotate(360deg)}}
.bb-pend__eta{margin-left:auto;font-size:.8rem;color:var(--faint);opacity:.7;font-variant-numeric:tabular-nums}
.bb-pend__cta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid var(--line)}
.bb-pend__cta .btn{display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
.bb-pend__cta p{margin:0;font-size:.84rem;color:var(--faint);opacity:.85;max-width:44ch;line-height:1.5}
.bb-pend.is-done{padding:12px 20px;display:flex;align-items:center;gap:11px;flex-wrap:wrap;background:var(--ok-bg);border-color:#cde7d9;box-shadow:none;animation:bb-pend-fold .3s var(--ease)}
@keyframes bb-pend-fold{from{opacity:.4;transform:translateY(-4px)}to{opacity:1;transform:none}}
.bb-pend.is-done .bb-pend__body{display:none}
.bb-pend__slim{display:none;align-items:center;gap:11px;flex-wrap:wrap;font-size:.85rem;color:var(--muted)}
.bb-pend.is-done .bb-pend__slim{display:flex}
.bb-pend__slim b{color:var(--ink);font-weight:700}
.bb-partial{display:flex;align-items:center;gap:10px;padding:11px 15px;border:1px dashed var(--line-2);border-radius:var(--r);background:var(--paper);font-size:.83rem;color:var(--muted);margin-bottom:18px}
.bb-partial svg{width:15px;height:15px;color:var(--amber-ink);flex:none}
.bb-buildpop{max-width:420px;text-align:center}
.bb-buildpop__i{width:52px;height:52px;margin:0 auto 16px;border-radius:50%;background:var(--wash);display:grid;place-items:center;color:var(--amber-ink);position:relative}
.bb-buildpop__i::after{content:'';position:absolute;inset:-5px;border-radius:50%;border:2px solid var(--yellow);border-top-color:transparent;animation:bb-pend-spin 1.1s linear infinite}
.bb-buildpop__i svg{width:22px;height:22px}
.bb-buildpop .sub{margin:9px 0 0}
.bb-buildpop__actions{display:flex;flex-direction:column;gap:9px;margin-top:20px}
.bb-buildpop__fine{font-size:.78rem;color:var(--faint);opacity:.7;margin-top:12px}
`;
function UsageConfirmModal({ title, body, subject, confirmLabel, busy = false, onConfirm, onCancel }) {
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: onCancel
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box",
				children: [
					/* @__PURE__ */ jsx("h2", { children: title }),
					/* @__PURE__ */ jsx("p", {
						className: "sub",
						children: body
					}),
					subject && /* @__PURE__ */ jsx("p", {
						style: {
							marginTop: 16,
							fontWeight: 700,
							color: "var(--ink)"
						},
						children: subject
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
							onClick: onCancel,
							disabled: busy,
							children: "Cancel"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--y",
							onClick: onConfirm,
							disabled: busy,
							children: busy ? "Starting…" : confirmLabel
						})]
					})
				]
			})]
		})
	});
}
function ProcessingOverlay({ search, failed = false, onGoDashboard }) {
	const title = failed ? "Search needs attention" : "Your search is still processing";
	const body = failed ? search?.latest_run_error || "We could not finish this search. You can head back to the dashboard and try again from there." : "We are still pulling videos, filtering matches, and preparing the result. This page will update automatically as soon as the run finishes.";
	return /* @__PURE__ */ jsxs("div", {
		className: "bb",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("div", {
				className: "bb-modal__bg",
				"aria-hidden": "true"
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box",
				style: { maxWidth: 520 },
				children: [
					!failed && /* @__PURE__ */ jsx("div", {
						"aria-hidden": "true",
						style: {
							width: 52,
							height: 52,
							margin: "0 auto 18px",
							borderRadius: "999px",
							border: "4px solid #f3e5b7",
							borderTopColor: "#d4a017",
							animation: "results-processing-spin 1s linear infinite"
						}
					}),
					/* @__PURE__ */ jsx("h2", {
						style: { textAlign: "center" },
						children: title
					}),
					/* @__PURE__ */ jsx("p", {
						className: "sub",
						style: {
							marginTop: 10,
							textAlign: "center"
						},
						children: body
					}),
					search?.name && /* @__PURE__ */ jsx("p", {
						style: {
							marginTop: 18,
							fontWeight: 700,
							color: "var(--ink)",
							textAlign: "center"
						},
						children: search.name
					}),
					/* @__PURE__ */ jsx("div", {
						style: {
							marginTop: 18,
							display: "flex",
							justifyContent: "center"
						},
						children: /* @__PURE__ */ jsxs("span", {
							className: `pill ${failed ? "pill--bad" : "pill--run"}`,
							style: { fontSize: ".82rem" },
							children: [/* @__PURE__ */ jsx("i", {}), failed ? "Failed" : "Processing"]
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "actrow__r",
						style: {
							marginTop: 24,
							justifyContent: "center"
						},
						children: /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g",
							onClick: onGoDashboard,
							children: "Go to my feed"
						})
					})
				]
			})]
		}), /* @__PURE__ */ jsx("style", { children: `
                @keyframes results-processing-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            ` })]
	});
}
var DetailScreenBoundary = class extends Component {
	constructor(props) {
		super(props);
		this.state = { error: null };
	}
	static getDerivedStateFromError(error) {
		return { error };
	}
	componentDidCatch(error, info) {
		console.error("SavedSearch detail render failed", error, info);
	}
	render() {
		if (this.state.error) return /* @__PURE__ */ jsx("div", {
			className: "tracker",
			children: /* @__PURE__ */ jsxs("div", {
				className: "gate",
				children: [/* @__PURE__ */ jsx("h2", { children: "Results page failed to render" }), /* @__PURE__ */ jsx("p", { children: this.state.error?.message || "An unexpected error happened while rendering this search." })]
			})
		});
		return this.props.children;
	}
};
/**
* The single detail view for every saved search — brand and
* product all render the same analytics tracker (the one design identity).
*/
function Show$1({ search: initial, isAuthenticated = false, billing }) {
	const page = usePage();
	const freeSearchNew = Boolean(page?.props?.flash?.freeSearchNew);
	const [search, setSearch] = useState(initial);
	const [refreshing, setRefreshing] = useState(false);
	const [bookmarkingSearch, setBookmarkingSearch] = useState(false);
	const [bookmarkingVideoId, setBookmarkingVideoId] = useState(null);
	const [confirmRefresh, setConfirmRefresh] = useState(false);
	const [pollError, setPollError] = useState(false);
	const [buildingPopupOpen, setBuildingPopupOpen] = useState(false);
	const isSearchProcessing = ACTIVE_SEARCH_STATUSES.has(String(search?.status ?? "").toLowerCase());
	const hasProcessingFailure = String(search?.status ?? "").toLowerCase() === "failed";
	const wasProcessingRef = useRef(isSearchProcessing);
	const subjectLabel = search?.name || search?.phrase || "your search";
	const searchLimit = billing?.searchCreditsLimit ?? 0;
	const searchUsed = billing?.searchCreditsUsed ?? 0;
	const searchRemainingAfterUse = searchLimit === -1 ? "unlimited" : Math.max(0, searchLimit - searchUsed - 1);
	const runRefresh = async () => {
		setRefreshing(true);
		try {
			await savedSearch.refresh(search.id);
			setSearch((prev) => ({
				...prev,
				status: "scraping"
			}));
		} catch {} finally {
			setRefreshing(false);
		}
	};
	const refresh = async () => {
		if (isAuthenticated && searchLimit !== 0) {
			setConfirmRefresh(true);
			return;
		}
		await runRefresh();
	};
	const remove = async () => {
		await savedSearch.destroy(search.id);
		untrackSearch(search.id);
		router.visit("/library");
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
	const patchSearch = (patch) => {
		setSearch((prev) => ({
			...prev,
			...patch
		}));
	};
	const toggleVideoBookmark = async (video) => {
		if (!video?.id || bookmarkingVideoId !== null) return;
		setBookmarkingVideoId(video.id);
		try {
			const response = video.bookmarked ? await bookmarks.remove(video.id) : await bookmarks.save(video.id);
			setSearch((prev) => ({
				...prev,
				results: (prev.results ?? []).map((result) => String(result.id) === String(video.id) ? {
					...result,
					bookmarked: Boolean(response.bookmarked)
				} : result)
			}));
		} finally {
			setBookmarkingVideoId(null);
		}
	};
	useEffect(() => {
		setSearch(initial);
	}, [initial]);
	useEffect(() => {
		if (!freeSearchNew || !isSearchProcessing) return void 0;
		const timer = window.setTimeout(() => setBuildingPopupOpen(true), 500);
		return () => window.clearTimeout(timer);
	}, []);
	useEffect(() => {
		if (wasProcessingRef.current && !isSearchProcessing && !hasProcessingFailure) setBuildingPopupOpen(false);
		wasProcessingRef.current = isSearchProcessing;
	}, [isSearchProcessing, hasProcessingFailure]);
	useEffect(() => {
		if (!search?.id || !isSearchProcessing) return void 0;
		let cancelled = false;
		let timerId = null;
		const poll = async () => {
			try {
				const payload = await savedSearch.get(search.id);
				if (cancelled || !payload?.search) return;
				setPollError(false);
				setSearch((previous) => ({
					...previous,
					...payload.search
				}));
			} catch {
				if (!cancelled) setPollError(true);
			} finally {
				if (!cancelled) timerId = window.setTimeout(poll, SEARCH_POLL_MS);
			}
		};
		poll();
		return () => {
			cancelled = true;
			if (timerId !== null) window.clearTimeout(timerId);
		};
	}, [isSearchProcessing, search?.id]);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: `${search.name} · Brand Beacon` }),
		/* @__PURE__ */ jsx(AppLayout, {
			width: "max-w-[1240px]",
			children: /* @__PURE__ */ jsx(DetailScreenBoundary, { children: /* @__PURE__ */ jsx(DetailScreen, {
				search,
				isAuthenticated,
				billing,
				processing: isSearchProcessing,
				refreshing,
				bookmarkUpdating: bookmarkingSearch,
				onRefresh: refresh,
				onSearchUpdated: patchSearch,
				onToggleBookmark: toggleBookmark,
				onToggleVideoBookmark: toggleVideoBookmark,
				bookmarkingVideoId,
				onTogglePause: togglePause,
				onDelete: remove
			}) })
		}),
		confirmRefresh && /* @__PURE__ */ jsx(UsageConfirmModal, {
			title: "Refresh this search?",
			body: searchLimit === -1 ? "Your plan includes unlimited searches, so this refresh won’t use up a search credit." : `This will use 1 search credit, leaving you ${searchRemainingAfterUse} this cycle. Credits aren’t restored later, even if you pause or delete the search.`,
			subject: search.name,
			confirmLabel: "Refresh search",
			busy: refreshing,
			onCancel: () => setConfirmRefresh(false),
			onConfirm: async () => {
				setConfirmRefresh(false);
				await runRefresh();
			}
		}),
		buildingPopupOpen && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("style", { children: buildingCss }), /* @__PURE__ */ jsx(BuildingPopup, {
			subject: subjectLabel,
			onDashboard: () => window.location.assign("/home"),
			onClose: () => setBuildingPopupOpen(false)
		})] }),
		hasProcessingFailure && pollError && /* @__PURE__ */ jsx(ProcessingOverlay, {
			search,
			failed: true,
			onGoDashboard: () => window.location.assign("/home")
		})
	] });
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
* Breakout multiple → "11.4x". This is views over the median of the search the
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
function ExpandableSignalList({ items = [], renderRow, emptyLabel, ariaLabel, moreLabelBuilder }) {
	const [visible, setVisible] = useState(PANEL_STEP);
	const [flashRange, setFlashRange] = useState(null);
	const listRef = useRef(null);
	const shown = items.slice(0, visible);
	const remaining = Math.max(0, items.length - shown.length);
	useEffect(() => {
		if (!flashRange) return void 0;
		const list = listRef.current;
		if (list) window.requestAnimationFrame(() => {
			list.scrollTo({
				top: list.scrollHeight,
				behavior: "smooth"
			});
		});
		const timeout = window.setTimeout(() => setFlashRange(null), 1800);
		return () => window.clearTimeout(timeout);
	}, [flashRange]);
	useEffect(() => {
		setVisible(PANEL_STEP);
		setFlashRange(null);
	}, [items]);
	const showMore = () => {
		const added = Math.min(PANEL_STEP, remaining);
		if (added <= 0) return;
		setFlashRange({
			start: visible,
			end: visible + added - 1,
			count: added
		});
		setVisible((count) => count + added);
	};
	return /* @__PURE__ */ jsx(Fragment$1, { children: items.length === 0 ? /* @__PURE__ */ jsx("p", {
		className: "empty",
		children: emptyLabel
	}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("div", {
			ref: listRef,
			className: "hlist",
			role: "list",
			"aria-label": ariaLabel,
			children: shown.map((row, index) => {
				const isNew = flashRange && index >= flashRange.start && index <= flashRange.end;
				return /* @__PURE__ */ jsx("div", {
					className: `hrow${isNew ? " is-new" : ""}`,
					role: "listitem",
					children: renderRow(row, index)
				}, row.id ?? row.tag ?? row.label ?? index);
			})
		}),
		flashRange && /* @__PURE__ */ jsxs("p", {
			className: "hmore-note",
			"aria-live": "polite",
			children: [
				"Added ",
				flashRange.count,
				" more."
			]
		}),
		remaining > 0 && /* @__PURE__ */ jsx("div", {
			className: "hmore",
			children: /* @__PURE__ */ jsx("button", {
				className: "tbtn",
				type: "button",
				onClick: showMore,
				children: moreLabelBuilder(Math.min(PANEL_STEP, remaining))
			})
		})
	] }) });
}
function HashtagPanel({ hashtags = [] }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "hspanel",
		children: [/* @__PURE__ */ jsx("h3", { children: "# hashtags" }), /* @__PURE__ */ jsx(ExpandableSignalList, {
			items: hashtags,
			emptyLabel: "No hashtags on the matched videos.",
			ariaLabel: "Top hashtags",
			moreLabelBuilder: (count) => `show ${count} more`,
			renderRow: (row, index) => /* @__PURE__ */ jsxs(Fragment$1, { children: [
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
			] })
		})]
	});
}
function SoundPanel({ sounds = [] }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "hspanel",
		children: [/* @__PURE__ */ jsx("h3", { children: "sounds" }), /* @__PURE__ */ jsx(ExpandableSignalList, {
			items: sounds,
			emptyLabel: "No sound credited on the matched videos.",
			ariaLabel: "Top sounds",
			moreLabelBuilder: (count) => `show ${count} more`,
			renderRow: (row, index) => /* @__PURE__ */ jsxs(Fragment$1, { children: [
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
			] })
		})]
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
* Six-week breakout bars. An all-zero week set renders as ghost bars with an
* explanation instead of six zeros; on a first run that chart looks broken,
* and the two reasons it can be empty deserve different sentences: either no
* post has cleared the threshold at all, or the breakouts exist but were
* posted before the 12-week window this chart covers.
*/
function OutliersPerWeek({ bars = [], threshold = 3, totalOutliers = 0, nextRunLabel = null }) {
	const max = Math.max(...bars.map((b) => b.value), 1);
	if (bars.length === 0 || bars.every((b) => !b.value)) return /* @__PURE__ */ jsxs("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ jsx("h3", { children: "breakouts per week" }),
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
				children: totalOutliers > 0 ? `All ${totalOutliers} of their breakouts were posted more than 12 weeks ago; this chart covers recent weeks only. It fills in as refreshes land.` : `Nothing has beaten ${outlierLabel(threshold) ?? "3x"} the search median yet. A bar appears the week a post breaks out${nextRunLabel ? ` - next check ${nextRunLabel}` : ""}.`
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "panel",
		children: [
			/* @__PURE__ */ jsx("h3", { children: "breakouts per week" }),
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
					outliers === 1 ? "breakout" : "breakouts"
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
	const key = String(video?.videoId ?? video?.video_id ?? video?.id ?? "");
	let hash = 0;
	for (let i = 0; i < key.length; i++) hash = hash * 31 + key.charCodeAt(i) >>> 0;
	return GRADIENTS[hash % GRADIENTS.length];
}
function formatDuration(duration) {
	if (duration == null || duration === "") return null;
	if (typeof duration === "string") return duration;
	const total = Number(duration);
	if (!Number.isFinite(total)) return null;
	return `${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, "0")}`;
}
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
function playerIdOf(video) {
	return String(video?.id ?? video?.videoId ?? video?.video_id ?? "");
}
function isRenderableVideo(video) {
	return Boolean(previewImageFor(video)) && isDashboardPlayable(video);
}
function Cover({ video, hidden = false }) {
	const [broken, setBroken] = useState(false);
	const src = previewImageFor(video);
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
		className: "grad",
		style: { background: gradientStyle(video) },
		hidden
	}), src && !broken && /* @__PURE__ */ jsx("img", {
		className: "cov",
		src,
		alt: "",
		loading: "lazy",
		referrerPolicy: "no-referrer",
		onError: () => setBroken(true),
		hidden
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
function VideoPlayerShell({ video, activePlayerId, onPlay, onClose, className, discSize = {
	w: 14,
	h: 16
}, rank = null, children = null }) {
	const shellRef = useRef(null);
	const iframeRef = useRef(null);
	const playerId = playerIdOf(video);
	const active = playerId !== "" && activePlayerId === playerId;
	const playerKind = playerKindFor(video);
	const playerSrc = playerUrlFor(video, false);
	const titleName = video?.username || video?.handle || video?.creator_name || "creator";
	const platform = detectPlatform(video);
	useEffect(() => {
		const shell = shellRef.current;
		if (!shell) return;
		if (active) {
			activateTikTokPlayer(shell);
			return;
		}
		stopAndResetTikTokPlayer(shell);
	}, [active]);
	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe || playerKind !== "tiktok") return void 0;
		const replay = () => {
			const shell = shellRef.current;
			if (!shell || shell.dataset.playerWantsAudible !== "true") return;
			postTikTokMessage(iframe, "unMute");
			postTikTokMessage(iframe, "play");
		};
		iframe.addEventListener("load", replay);
		return () => iframe.removeEventListener("load", replay);
	}, [playerKind]);
	if (!isRenderableVideo(video)) return null;
	const openPlayer = (event) => {
		event.preventDefault();
		event.stopPropagation();
		onPlay?.(playerId);
	};
	const closePlayer = (event) => {
		event.preventDefault();
		event.stopPropagation();
		const shell = shellRef.current;
		if (shell) stopAndResetTikTokPlayer(shell);
		onClose?.();
	};
	return /* @__PURE__ */ jsxs("div", {
		ref: shellRef,
		className,
		"data-video-player-shell": true,
		"data-player-kind": playerKind,
		"data-player-src": playerSrc ?? "",
		"data-player-active": active ? "true" : "false",
		children: [
			/* @__PURE__ */ jsx("div", {
				"data-player-poster": true,
				children: /* @__PURE__ */ jsx(Cover, {
					video,
					hidden: false
				})
			}),
			/* @__PURE__ */ jsx("span", {
				className: "player-overlay",
				"data-player-overlay": true,
				"aria-hidden": true
			}),
			rank != null && /* @__PURE__ */ jsx("span", {
				className: "bbrank",
				children: String(rank).padStart(2, "0")
			}),
			children,
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "play",
				"data-player-play": true,
				onClick: openPlayer,
				"aria-label": video?.title ? `Play: ${video.title}` : "Play video",
				children: /* @__PURE__ */ jsx("span", {
					className: "play__disc",
					children: /* @__PURE__ */ jsx(PlayIcon, { ...discSize })
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: "tracker-player-host",
				"data-player-container": true,
				hidden: true,
				children: /* @__PURE__ */ jsx("iframe", {
					ref: iframeRef,
					src: "about:blank",
					"data-card-frame": true,
					"data-player-frame": true,
					"data-player-kind": playerKind,
					"data-player-src": playerSrc ?? "",
					title: platform === "tiktok" ? `TikTok video by ${titleName.startsWith("@") ? titleName : `@${titleName}`}` : `Video preview for ${titleName}`,
					allow: "accelerometer; controls; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
					allowFullScreen: true,
					scrolling: "no",
					className: "tracker-embed-frame"
				})
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: closePlayer,
				"aria-label": "Close player",
				className: "tracker-player-close",
				"data-player-close": true,
				hidden: true,
				children: /* @__PURE__ */ jsx("svg", {
					viewBox: "0 0 24 24",
					className: "h-4 w-4",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2.5",
					strokeLinecap: "round",
					children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" })
				})
			})
		]
	});
}
function AnalyzeButton({ status = "idle", small = false, onClick }) {
	const isProcessing = status === "processing";
	const isComplete = status === "complete";
	const isFailed = status === "failed";
	const stateClass = isProcessing ? "is-busy" : isComplete ? "is-done" : "is-ready";
	const label = isProcessing ? "Analyzing video..." : isComplete ? "View analysis" : isFailed ? "Retry analysis" : "Analyze video";
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		className: `bb-analyze ${stateClass}${small ? " bb-analyze--sm" : ""}`,
		onClick,
		"aria-busy": isProcessing,
		disabled: isProcessing,
		children: isProcessing ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
			className: "bb-analyze__ring",
			"aria-hidden": true
		}), /* @__PURE__ */ jsx("span", { children: label })] }) : isComplete ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
			/* @__PURE__ */ jsx("span", {
				className: "bb-analyze__badge",
				"aria-hidden": true,
				children: "✓"
			}),
			/* @__PURE__ */ jsx("span", { children: label }),
			/* @__PURE__ */ jsx("span", {
				className: "bb-analyze__chev",
				"aria-hidden": true,
				children: "→"
			})
		] }) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Search, { className: small ? "h-[13px] w-[13px]" : "h-[15px] w-[15px]" }), /* @__PURE__ */ jsx("span", { children: label })] })
	});
}
function WinnerVideo({ video, onToggleBookmark, onAnalyze, bookmarking = false, activePlayerId = null, onPlay = null, onClose = null, analysisStatus = "idle" }) {
	if (!video || !isRenderableVideo(video)) return null;
	const playing = activePlayerId === playerIdOf(video);
	const rate = percent(video.engagement_rate);
	const duration = formatDuration(video.duration);
	const tags = creativeTags(video);
	const hasCreative = video.content_format || video.content_hook || video.content_angle;
	return /* @__PURE__ */ jsxs("div", {
		className: "winner",
		children: [/* @__PURE__ */ jsxs(VideoPlayerShell, {
			video,
			activePlayerId,
			onPlay,
			onClose,
			className: `vid${playing ? " playing" : ""}`,
			discSize: {
				w: 16,
				h: 18
			},
			children: [
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
							children: [/* @__PURE__ */ jsx("i", {}), "Breakout Score"]
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
							children: compactNumber(video.views)
						})]
					})]
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
							className: "creator-copy",
							style: { minWidth: 0 },
							children: [/* @__PURE__ */ jsxs("div", {
								className: "creator-topline",
								children: [/* @__PURE__ */ jsx("div", {
									className: "cn",
									children: video.handle ?? video.creator_name
								}), /* @__PURE__ */ jsx("div", {
									className: "cs",
									children: video.uploaded_at ? relativeTime(video.uploaded_at) : "date unknown"
								})]
							}), /* @__PURE__ */ jsx("div", {
								className: "cs",
								children: "TikTok"
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
							compactNumber(video.likes)
						] }),
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Comment, {}),
							" ",
							compactNumber(video.comments)
						] }),
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Share, {}),
							" ",
							compactNumber(video.shares)
						] }),
						video.followers > 0 && /* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(User, {}),
							" ",
							compactNumber(video.followers)
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
	if (!isRenderableVideo(video)) return null;
	const rate = percent(video.engagement_rate);
	const duration = formatDuration(video.duration);
	return /* @__PURE__ */ jsxs("article", {
		className: "bbcard",
		children: [/* @__PURE__ */ jsx(VideoPlayerShell, {
			video,
			activePlayerId,
			onPlay,
			onClose,
			className: "bbthumb",
			rank
		}), /* @__PURE__ */ jsxs("div", {
			className: "bbbody",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "bbstats",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "bbchip bbchip--score",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "lab",
							children: [/* @__PURE__ */ jsx("i", {}), "Breakout Score"]
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
							children: compactNumber(video.views)
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
						/* @__PURE__ */ jsx("div", {
							className: "bbwho__copy",
							style: { minWidth: 0 },
							children: /* @__PURE__ */ jsxs("div", {
								className: "bbwho__topline",
								children: [/* @__PURE__ */ jsx("div", {
									className: "h2n",
									children: video.handle ?? video.creator_name
								}), /* @__PURE__ */ jsx("div", {
									className: "sub",
									children: video.uploaded_at ? relativeTime(video.uploaded_at) : "date unknown"
								})]
							})
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
							compactNumber(video.likes)
						] }),
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Comment, {}),
							" ",
							compactNumber(video.comments)
						] }),
						/* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(Share, {}),
							" ",
							compactNumber(video.shares)
						] }),
						video.followers > 0 && /* @__PURE__ */ jsxs("span", { children: [
							/* @__PURE__ */ jsx(User, {}),
							" ",
							compactNumber(video.followers)
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
	if (format === "compact") return compactNumber(value);
	if (format === "percent") return percent(value) ?? "—";
	return String(value);
}
function formatRunDate(iso) {
	if (!iso) return null;
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function buildDelta(latest, previous, unit) {
	if (latest === null || latest === void 0 || previous === null || previous === void 0) return null;
	const value = unit === "points" ? Math.round((latest - previous) * 100) / 100 : previous === 0 ? null : Math.round((latest - previous) / previous * 100 * 10) / 10;
	if (value === null || Number.isNaN(value)) return null;
	return {
		value,
		unit,
		direction: value > 0 ? "up" : value < 0 ? "down" : "flat"
	};
}
function deltaLabel(delta) {
	if (!delta) return "No comparison yet";
	const prefix = delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→";
	const suffix = delta.unit === "points" ? " pts" : "%";
	return `${prefix} ${Math.abs(delta.value)}${suffix}`;
}
function runLabel(index) {
	return `Refresh ${index + 1}`;
}
function runCountLabel(count) {
	return `${count} completed ${count === 1 ? "run" : "runs"}`;
}
function toPoints(values) {
	if (!values || values.length < 2) return [];
	const max = Math.max(...values);
	const min = Math.min(...values);
	const range = max - min;
	return values.map((v, i) => {
		return [i / (values.length - 1) * W, range === 0 ? H / 2 : 170 - (v - min) / range * 160];
	});
}
function fallbackSnapshotFromTrend(trend) {
	if (!trend?.metrics) return null;
	return {
		views: trend.metrics.views?.current ?? null,
		posts: trend.metrics.posts?.current ?? null,
		engagement: trend.metrics.engagement?.current ?? null,
		engagement_rate: trend.metrics.rate?.current ?? null
	};
}
function PerformanceChart({ trend, runs = [], frequency = "weekly" }) {
	const [metric, setMetric] = useState("views");
	const series = trend?.metrics?.[metric];
	const latestRunId = runs[runs.length - 1]?.id ?? null;
	const trendFallbackSnapshot = fallbackSnapshotFromTrend(trend);
	const completedRuns = runs.map((run) => {
		if (run?.snapshot) return run;
		if (run?.id !== latestRunId || !trendFallbackSnapshot) return run;
		return {
			...run,
			snapshot: {
				...trendFallbackSnapshot,
				captured_at: run?.completed_at ?? null,
				is_fallback: true
			}
		};
	}).filter((run) => run?.snapshot);
	if (!series || completedRuns.length === 0) return /* @__PURE__ */ jsx("div", {
		className: "panel",
		children: /* @__PURE__ */ jsx("p", {
			className: "empty",
			children: "Not enough history to plot yet."
		})
	});
	const latestRun = completedRuns[completedRuns.length - 1];
	const previousRun = completedRuns.length > 1 ? completedRuns[completedRuns.length - 2] : null;
	const baselineRun = completedRuns[0];
	const metricKey = series.format === "percent" ? "engagement_rate" : metric;
	const deltaUnit = series.format === "percent" ? "points" : "percent";
	const currentValue = latestRun?.snapshot?.[metricKey] ?? series.current;
	const previousDelta = previousRun ? buildDelta(currentValue, previousRun?.snapshot?.[metricKey], deltaUnit) : null;
	const coords = toPoints(completedRuns.map((run) => Number(run?.snapshot?.[metricKey]) || 0));
	const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
	const area = line ? `${line} ${W},${H} 0,${H}` : "";
	const lastPoint = coords[coords.length - 1] ?? null;
	const latestRunDate = formatRunDate(latestRun?.completed_at);
	const baselineRunDate = formatRunDate(baselineRun?.completed_at);
	const axisLabels = completedRuns.length === 1 ? [{
		label: runLabel(0),
		align: "start"
	}, {
		label: "latest",
		align: "end"
	}] : completedRuns.map((run, index) => ({
		label: index === 0 ? runLabel(0) : index === completedRuns.length - 1 ? "latest" : completedRuns.length <= 4 || index === Math.floor((completedRuns.length - 1) / 2) ? runLabel(index) : "",
		align: index === 0 ? "start" : index === completedRuns.length - 1 ? "end" : "center"
	}));
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
			/* @__PURE__ */ jsx("div", {
				className: "ts-head",
				children: /* @__PURE__ */ jsx("span", {
					className: "ts-val",
					children: formatValue(currentValue, series.format)
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ts-legend",
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: "ts-chip ts-chip--neutral",
						children: [/* @__PURE__ */ jsx("i", {}), runCountLabel(completedRuns.length)]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "ts-chip ts-chip--neutral",
						children: [
							/* @__PURE__ */ jsx("i", {}),
							"Latest run",
							latestRunDate ? ` • ${latestRunDate}` : ""
						]
					}),
					previousDelta ? /* @__PURE__ */ jsxs("span", {
						className: `ts-chip ts-chip--${previousDelta.direction}`,
						children: [
							/* @__PURE__ */ jsx("i", {}),
							deltaLabel(previousDelta),
							" vs previous run"
						]
					}) : /* @__PURE__ */ jsxs("span", {
						className: "ts-chip ts-chip--neutral",
						children: [/* @__PURE__ */ jsx("i", {}), "Baseline run only"]
					})
				]
			}),
			coords.length >= 2 ? /* @__PURE__ */ jsxs("svg", {
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
						points: area,
						fill: "url(#tsfill)"
					}),
					/* @__PURE__ */ jsx("polyline", {
						points: line,
						fill: "none",
						stroke: "var(--violet)",
						strokeWidth: "2.5",
						strokeLinejoin: "round",
						strokeLinecap: "round"
					}),
					lastPoint && /* @__PURE__ */ jsx("circle", {
						cx: lastPoint[0],
						cy: lastPoint[1],
						r: "4.5",
						fill: "var(--violet)",
						stroke: "#fff",
						strokeWidth: "2"
					})
				]
			}) : /* @__PURE__ */ jsxs("div", {
				className: "ts-emptycta",
				children: [/* @__PURE__ */ jsxs("strong", { children: [runLabel(0), " is your baseline."] }), /* @__PURE__ */ jsxs("span", { children: [
					"Come back next ",
					frequency === "monthly" ? "month" : "week",
					" to unlock comparison against the next refresh."
				] })]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "ts-x",
				children: axisLabels.map((item, index) => /* @__PURE__ */ jsx("span", {
					className: `ts-x--${item.align}`,
					children: item.label
				}, `${item.label || "tick"}-${index}`))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "ts-foot",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "ts-mini",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "ts-mini__label",
								children: "Baseline"
							}),
							/* @__PURE__ */ jsx("strong", { children: runLabel(0) }),
							/* @__PURE__ */ jsx("span", { children: baselineRunDate ?? "First completed run" })
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "ts-mini",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "ts-mini__label",
								children: "Latest"
							}),
							/* @__PURE__ */ jsx("strong", { children: runLabel(completedRuns.length - 1) }),
							/* @__PURE__ */ jsx("span", { children: latestRunDate ?? "Most recent completed run" })
						]
					}),
					completedRuns.some((run) => run?.snapshot?.is_fallback) && /* @__PURE__ */ jsxs("div", {
						className: "ts-mini ts-mini--note",
						children: [/* @__PURE__ */ jsx("span", {
							className: "ts-mini__label",
							children: "Note"
						}), /* @__PURE__ */ jsx("span", { children: "Latest run is using current saved-search metrics because a snapshot record is missing." })]
					})
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
function TrackerHead({ search, account, lastRun, nextRun, onEditDetails, onToggleWatchlist, onTogglePause, onDelete, watchlistUpdating }) {
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
	const openEdit = () => {
		setMenuOpen(false);
		onEditDetails?.();
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
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("header", { children: /* @__PURE__ */ jsxs("div", {
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
						account?.followers > 0 && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", { className: "sep" }), /* @__PURE__ */ jsxs("span", { children: [compactNumber(account.followers), " followers"] })] }),
						/* @__PURE__ */ jsx("span", { className: "sep" }),
						/* @__PURE__ */ jsx("span", { children: meta })
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "head-actions",
				children: [onToggleWatchlist && /* @__PURE__ */ jsx("button", {
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
				}), (onTogglePause || onDelete) && /* @__PURE__ */ jsxs("span", {
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
						children: [
							onEditDetails && /* @__PURE__ */ jsx("button", {
								type: "button",
								role: "menuitem",
								onClick: openEdit,
								children: "Edit keyword details"
							}),
							onTogglePause && /* @__PURE__ */ jsx("button", {
								type: "button",
								role: "menuitem",
								onClick: openPause,
								children: paused ? "Resume Tracking" : "Pause Tracking"
							}),
							onDelete && /* @__PURE__ */ jsx("button", {
								type: "button",
								role: "menuitem",
								className: "danger",
								onClick: openDelete,
								children: "Delete Tracking"
							})
						]
					})]
				})]
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
//#region resources/js/Pages/Search/Free.jsx
var Free_exports = /* @__PURE__ */ __exportAll({ default: () => Free });
var TYPES$1 = [{
	key: "brand",
	label: "Your brand",
	icon: Store,
	placeholder: "e.g. rhode skin"
}, {
	key: "product",
	label: "A product",
	icon: Search,
	placeholder: "e.g. lip oil"
}];
var csrfToken$1 = () => document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content") ?? "";
function Stepper({ step }) {
	return /* @__PURE__ */ jsx("div", {
		className: "fs-stepper",
		"aria-label": `Step ${step} of 3`,
		children: [
			"Subject",
			"Keywords",
			"Results"
		].map((label, index) => {
			const number = index + 1;
			const state = number < step ? "done" : number === step ? "now" : "";
			return /* @__PURE__ */ jsxs("span", {
				className: `fs-step ${state}`,
				children: [
					/* @__PURE__ */ jsx("i", { children: state === "done" ? /* @__PURE__ */ jsx(Check$1, {}) : number }),
					/* @__PURE__ */ jsx("b", { children: label }),
					number < 3 && /* @__PURE__ */ jsx("em", {})
				]
			}, label);
		})
	});
}
function Free({ phrase = "", type = "brand", error = null }) {
	const [screen, setScreen] = useState(phrase ? "refine" : "subject");
	const [showGateCard, setShowGateCard] = useState(false);
	const [kind, setKind] = useState(type === "competitor" ? "brand" : type);
	const [subject, setSubject] = useState(phrase);
	const [terms, setTerms] = useState([]);
	const [subjectSuggestions, setSubjectSuggestions] = useState([]);
	const [activeSuggestion, setActiveSuggestion] = useState(-1);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [draft, setDraft] = useState("");
	const [adding, setAdding] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState(error);
	const requested = useRef("");
	const subjectFieldRef = useRef(null);
	const config = TYPES$1.find((item) => item.key === kind) ?? TYPES$1[0];
	const selected = terms.filter((term) => term.selected).map((term) => term.value);
	useEffect(() => {
		if (screen !== "refine" || !subject || requested.current === `${kind}:${subject}`) return;
		let active = true;
		requested.current = `${kind}:${subject}`;
		setLoading(true);
		expandKeywords(subject, { type: kind }).then((payload) => {
			if (!active) return;
			const seen = /* @__PURE__ */ new Set([subject.toLowerCase()]);
			const suggestions = (Array.isArray(payload?.keywords) ? payload.keywords : []).filter((value) => {
				const key = String(value).toLowerCase();
				if (!key || seen.has(key)) return false;
				seen.add(key);
				return true;
			}).slice(0, 11).map((value, index) => ({
				value,
				selected: index < 3
			}));
			setTerms([{
				value: subject,
				selected: true,
				locked: true
			}, ...suggestions]);
		}).catch(() => active && setTerms([{
			value: subject,
			selected: true,
			locked: true
		}])).finally(() => active && setLoading(false));
		return () => {
			active = false;
		};
	}, [
		kind,
		screen,
		subject
	]);
	useEffect(() => {
		const controller = new AbortController();
		fetchKeywordSuggestions(kind, subject.trim(), { signal: controller.signal }).then((payload) => setSubjectSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : [])).catch(() => {});
		return () => controller.abort();
	}, [kind, subject]);
	useEffect(() => {
		const close = (event) => {
			if (!subjectFieldRef.current?.contains(event.target)) {
				setShowSuggestions(false);
				setActiveSuggestion(-1);
			}
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, []);
	useEffect(() => {
		if (screen !== "gate") {
			setShowGateCard(false);
			return;
		}
		const timer = window.setTimeout(() => setShowGateCard(true), 2e3);
		return () => window.clearTimeout(timer);
	}, [screen]);
	const beginRefine = (event) => {
		event.preventDefault();
		const clean = subject.trim().replace(/\s+/g, " ");
		if (!clean) return;
		setSubject(clean);
		setScreen("refine");
	};
	const toggle = (value) => setTerms((current) => current.map((term) => term.value === value && !term.locked ? {
		...term,
		selected: !term.selected
	} : term));
	const addKeyword = () => {
		const clean = draft.trim().replace(/\s+/g, " ");
		setDraft("");
		setAdding(false);
		if (!clean || terms.some((term) => term.value.toLowerCase() === clean.toLowerCase()) || terms.length >= 12) return;
		setTerms((current) => [...current, {
			value: clean,
			selected: true
		}]);
	};
	const [pendingRoute, setPendingRoute] = useState(null);
	const stashAndGo = async (destination, tag) => {
		setSaving(true);
		setPendingRoute(tag);
		setMessage(null);
		try {
			if (!(await fetch("/search/pending", {
				method: "POST",
				credentials: "same-origin",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest",
					"X-CSRF-TOKEN": csrfToken$1()
				},
				body: JSON.stringify({
					type: kind,
					phrase: subject,
					keywords: selected,
					frequency: "weekly"
				})
			})).ok) throw new Error("We could not save your search. Please try again.");
			window.location.assign(destination);
		} catch (caught) {
			setMessage(caught.message);
			setSaving(false);
			setPendingRoute(null);
		}
	};
	const prepareAndSignIn = () => stashAndGo("/auth/google", "google");
	const goCreateAccount = () => stashAndGo("/register", "register");
	const goLogin = () => stashAndGo("/login", "login");
	const initials = (subject || "?").trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
	const kindLabel = kind === "brand" ? "Brand" : "Product";
	const stages = [
		"Pulling videos from TikTok",
		"Filtering against your keywords",
		"Scoring breakouts vs creator baseline",
		"Ranking your top breakouts"
	];
	const visibleSuggestions = subjectSuggestions.filter((suggestion) => suggestion.label?.trim());
	const applySuggestion = (label) => {
		setSubject(label);
		setShowSuggestions(false);
		setActiveSuggestion(-1);
	};
	const gateCard = /* @__PURE__ */ jsxs("div", {
		className: "ff-signup ff-signup--m5",
		children: [
			/* @__PURE__ */ jsx("h2", { children: "Where should we send it?" }),
			/* @__PURE__ */ jsx("p", { children: "Your search is running. Create an account and we will email you when it lands." }),
			/* @__PURE__ */ jsxs("div", {
				className: "ff-runchip",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "ff-runchip__mono",
						children: initials
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "ff-runchip__body",
						children: [/* @__PURE__ */ jsx("b", { children: subject }), /* @__PURE__ */ jsxs("em", { children: [
							kindLabel,
							" · ",
							selected.length,
							" keyword",
							selected.length === 1 ? "" : "s",
							" · weekly"
						] })]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "ff-runchip__pill",
						children: "RUNNING"
					})
				]
			}),
			message && /* @__PURE__ */ jsx("p", {
				className: "ff-error",
				children: message
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				className: "ff-google ff-google--outline",
				disabled: saving,
				onClick: prepareAndSignIn,
				children: [/* @__PURE__ */ jsx(Google, {}), saving && pendingRoute === "google" ? "Opening Google…" : "Continue with Google"]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "ff-create",
				disabled: saving,
				onClick: goCreateAccount,
				children: saving && pendingRoute === "register" ? "Opening sign up…" : "Create account"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "ff-trust ff-trust--muted",
				children: "Then you can close the tab."
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				className: "ff-havelogin",
				disabled: saving,
				onClick: goLogin,
				children: saving && pendingRoute === "login" ? "Opening sign in…" : "I already have an account"
			})
		]
	});
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Seo, {
		title: "Free TikTok Search | Brand Beacon",
		description: "Start a TikTok brand or product search with Brand Beacon.",
		noIndex: true
	}), /* @__PURE__ */ jsxs("div", {
		className: "bbh",
		children: [/* @__PURE__ */ jsx(Nav, { homeHref: "/" }), /* @__PURE__ */ jsxs("main", {
			className: `free-flow ${screen === "gate" ? "free-flow--gate" : ""}`,
			children: [
				/* @__PURE__ */ jsx("style", { children: `
      .free-flow{min-height:calc(100vh - 72px);background:#fff;color:#111;padding:0 22px 64px;font-family:Figtree,ui-sans-serif,system-ui,sans-serif}
      .ff-shell{max-width:594px;margin:0 auto;padding-top:28px}.fs-stepper{display:flex;align-items:center;justify-content:center;margin:0 0 28px}.fs-step{display:flex;align-items:center;gap:8px;color:#77726b;font-size:11px}.fs-step i{width:23px;height:23px;border:1px solid #ddd8cf;border-radius:50%;display:grid;place-items:center;font-size:11px;font-style:normal}.fs-step.done,.fs-step.now{color:#151515}.fs-step.done i{background:#111;color:#fff;border-color:#111}.fs-step.now i{background:#ffc629;border-color:#ffc629}.fs-step i svg{width:11px;height:11px}.fs-step em{width:27px;height:1px;background:#ddd8cf;margin:0 9px;font-style:normal}.ff-card{border:1px solid #e4e0d8;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 12px 32px -30px rgba(0,0,0,.3)}.ff-subject{height:66px;padding:0 21px;display:flex;align-items:center;border-bottom:1px solid #e4e0d8}.ff-subject__label,.ff-eyebrow{font-size:10px;font-weight:850;color:#a16d00;letter-spacing:.13em;text-transform:uppercase}.ff-subject strong{margin-left:12px;font-size:15px;letter-spacing:-.03em}.ff-edit{margin-left:auto;width:30px;height:30px;border:1px solid #e4e0d8;border-radius:50%;background:#fff;color:#777;display:grid;place-items:center;cursor:pointer}.ff-edit svg{width:14px;height:14px}.ff-section{padding:23px 21px 24px}.ff-section h1{margin:10px 0 0;font-size:17px;line-height:1.25;letter-spacing:-.035em}.ff-section>p{margin:10px 0 0;font-size:13px;line-height:1.55;color:#625e58}.ff-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.ff-chip{height:37px;padding:0 14px;border:1.5px solid #b8b1a2 !important;border-radius:999px;background:#fff;color:#302d29;font:inherit;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s}.ff-chip:hover:not(:disabled){border-color:#8a8271 !important}.ff-chip:disabled{cursor:default}.ff-chip.on{border-color:#ffc629 !important;box-shadow:0 0 0 1.5px #ffc629 inset}.ff-check{width:15px;height:15px;border:1px solid #d9d4ca;border-radius:50%;display:grid;place-items:center}.ff-chip.on .ff-check{background:#ffc629;border-color:#ffc629}.ff-check svg{width:9px;height:9px}.ff-add{border-style:dashed;color:#9d6900}.ff-add svg{width:13px;height:13px}.ff-add-input{height:37px;width:130px;padding:0 12px;border:1px solid #ffc629;border-radius:999px;outline:0;font:inherit;font-size:12px;font-weight:700}.ff-count{margin:14px 0 0!important;font-size:11px!important;color:#756f68!important}.ff-count b{color:#111}.ff-footer{min-height:85px;padding:0 21px;border-top:1px solid #e4e0d8;display:flex;align-items:center;justify-content:space-between;gap:12px}.ff-back,.ff-run{height:41px;padding:0 20px;border-radius:10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}.ff-back{border:1px solid #ddd8cf;background:#fff;color:#111}.ff-run{border:0;background:#ffc629;color:#1a1400;display:inline-flex;align-items:center;gap:10px;box-shadow:0 1px 2px rgba(20,15,0,.1),0 10px 24px -8px rgba(255,198,41,.72)}.ff-run:hover:not(:disabled){background:#ffd84d;transform:translateY(-1px);box-shadow:0 2px 4px rgba(20,15,0,.1),0 16px 30px -10px rgba(255,198,41,.85)}.ff-run svg{width:15px;height:15px}.ff-run:disabled{opacity:.55;cursor:not-allowed}.ff-subject-form{max-width:520px;margin:66px auto;border:1px solid #e4e0d8;border-radius:20px;padding:26px}.ff-subject-form h1{margin:0;font-size:25px;letter-spacing:-.05em}.ff-modes{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:22px}.ff-mode{height:45px;border:1px solid #ddd8cf;border-radius:10px;background:#fff;font:inherit;font-size:12px;font-weight:750;cursor:pointer}.ff-mode.is-on{background:#111;border-color:#111;color:#fff}.ff-mode svg{width:14px;height:14px;vertical-align:-2px;margin-right:5px}.ff-input{width:100%;box-sizing:border-box;height:48px;margin-top:16px;padding:0 13px;border:1px solid #d9d4ca;border-radius:10px;font:inherit;font-weight:650;outline:0}.ff-input:focus{border-color:#ffc629;box-shadow:0 0 0 4px rgba(255,198,41,.2)}
      .ff-subject-field{position:relative;margin-top:16px}
      .ff-subject-suggest{position:absolute;top:calc(100% + 10px);left:0;right:0;z-index:20;overflow:hidden;border:1px solid #eadfca;border-radius:18px;background:rgba(255,255,255,.98);box-shadow:0 24px 48px -24px rgba(33,26,12,.3),0 8px 18px -12px rgba(33,26,12,.14);backdrop-filter:blur(10px)}
      .ff-subject-suggest__head{display:flex;align-items:center;justify-content:space-between;padding:11px 14px 10px;background:linear-gradient(180deg,#fff8e3 0%,#fffdf7 100%);border-bottom:1px solid #f0e5cf;font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9d6900}
      .ff-subject-suggest__list{max-height:300px;overflow-y:auto;padding:6px}
      .ff-subject-suggest__item{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px;border:0;border-radius:14px;background:transparent;text-align:left;cursor:pointer;transition:background .15s,transform .15s}
      .ff-subject-suggest__item:hover,.ff-subject-suggest__item.is-active{background:#fff7df}
      .ff-subject-suggest__item.is-active{transform:translateX(2px)}
      .ff-subject-suggest__copy{display:flex;min-width:0;flex-direction:column;gap:3px}
      .ff-subject-suggest__copy strong{font-size:.92rem;font-weight:700;letter-spacing:-.02em;color:#181614}
      .ff-subject-suggest__copy em{font-style:normal;font-size:.74rem;font-weight:600;color:#8b8577}
      .ff-shell{max-width:594px;margin:0 auto;padding-top:28px}.fs-stepper{display:flex;align-items:center;justify-content:center;margin:0 0 28px}.fs-step{display:flex;align-items:center;gap:8px;color:#77726b;font-size:11px}.fs-step i{width:23px;height:23px;border:1px solid #ddd8cf;border-radius:50%;display:grid;place-items:center;font-size:11px;font-style:normal}.fs-step.done,.fs-step.now{color:#151515}.fs-step.done i{background:#111;color:#fff;border-color:#111}.fs-step.now i{background:#ffc629;border-color:#ffc629}.fs-step i svg{width:11px;height:11px}.fs-step em{width:27px;height:1px;background:#ddd8cf;margin:0 9px;font-style:normal}.ff-card{border:1px solid #e4e0d8;border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 12px 32px -30px rgba(0,0,0,.3)}.ff-subject{height:66px;padding:0 21px;display:flex;align-items:center;border-bottom:1px solid #e4e0d8}.ff-subject__label,.ff-eyebrow{font-size:10px;font-weight:850;color:#a16d00;letter-spacing:.13em;text-transform:uppercase}.ff-subject strong{margin-left:12px;font-size:15px;letter-spacing:-.03em}.ff-edit{margin-left:auto;width:30px;height:30px;border:1px solid #e4e0d8;border-radius:50%;background:#fff;color:#777;display:grid;place-items:center;cursor:pointer}.ff-edit svg{width:14px;height:14px}.ff-section{padding:23px 21px 24px}.ff-section h1{margin:10px 0 0;font-size:17px;line-height:1.25;letter-spacing:-.035em}.ff-section>p{margin:10px 0 0;font-size:13px;line-height:1.55;color:#625e58}.ff-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.ff-chip{height:37px;padding:0 14px;border:1.5px solid #b8b1a2 !important;border-radius:999px;background:#fff;color:#302d29;font:inherit;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:8px;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s}.ff-chip:hover:not(:disabled){border-color:#8a8271 !important}.ff-chip:disabled{cursor:default}.ff-chip.on{border-color:#ffc629 !important;box-shadow:0 0 0 1.5px #ffc629 inset}.ff-check{width:15px;height:15px;border:1px solid #d9d4ca;border-radius:50%;display:grid;place-items:center}.ff-chip.on .ff-check{background:#ffc629;border-color:#ffc629}.ff-check svg{width:9px;height:9px}.ff-add{border-style:dashed;color:#9d6900}.ff-add svg{width:13px;height:13px}.ff-add-input{height:37px;width:130px;padding:0 12px;border:1px solid #ffc629;border-radius:999px;outline:0;font:inherit;font-size:12px;font-weight:700}.ff-count{margin:14px 0 0!important;font-size:11px!important;color:#756f68!important}.ff-count b{color:#111}.ff-footer{min-height:85px;padding:0 21px;border-top:1px solid #e4e0d8;display:flex;align-items:center;justify-content:space-between;gap:12px}.ff-back,.ff-run{height:41px;padding:0 20px;border-radius:10px;font:inherit;font-size:13px;font-weight:800;cursor:pointer}.ff-back{border:1px solid #ddd8cf;background:#fff;color:#111}.ff-run{border:0;background:#ffc629;color:#1a1400;display:inline-flex;align-items:center;gap:10px;box-shadow:0 1px 2px rgba(20,15,0,.1),0 10px 24px -8px rgba(255,198,41,.72)}.ff-run:hover:not(:disabled){background:#ffd84d;transform:translateY(-1px);box-shadow:0 2px 4px rgba(20,15,0,.1),0 16px 30px -10px rgba(255,198,41,.85)}.ff-run svg{width:15px;height:15px}.ff-run:disabled{opacity:.55;cursor:not-allowed}.ff-subject-form{max-width:520px;margin:66px auto;border:1px solid #e4e0d8;border-radius:20px;padding:26px}.ff-subject-form h1{margin:0;font-size:25px;letter-spacing:-.05em}.ff-modes{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:22px}.ff-mode{height:45px;border:1px solid #ddd8cf;border-radius:10px;background:#fff;font:inherit;font-size:12px;font-weight:750;cursor:pointer}.ff-mode.is-on{background:#111;border-color:#111;color:#fff}.ff-mode svg{width:14px;height:14px;vertical-align:-2px;margin-right:5px}.ff-input{width:100%;box-sizing:border-box;height:48px;margin-top:16px;padding:0 13px;border:1px solid #d9d4ca;border-radius:10px;font:inherit;font-weight:650;outline:0}.ff-input:focus{border-color:#ffc629;box-shadow:0 0 0 4px rgba(255,198,41,.2)}
      .free-flow--gate{padding:0;background:#fff}.ff-gate{min-height:calc(100vh - 72px);display:grid;grid-template-columns:1fr 1fr}.ff-gate__copy{padding:clamp(48px,11vh,120px) clamp(29px,5vw,90px);display:flex;align-items:center}.ff-gate__inner{max-width:420px}.ff-gate h1{margin:12px 0 0;font-size:clamp(27px,3vw,38px);line-height:1.08;letter-spacing:-.065em}.ff-gate__copy>div>p{font-size:13px;line-height:1.55;color:#625e58;margin:15px 0 0}.ff-stages{margin-top:35px;display:flex;flex-direction:column;gap:12px}.ff-stage{min-height:34px;padding:0 10px;display:flex;align-items:center;gap:11px;border-radius:9px;font-size:12px;font-weight:650}.ff-stage i{width:15px;height:15px;border-radius:50%;background:#111;color:#fff;display:grid;place-items:center}.ff-stage i svg{width:9px;height:9px}.ff-stage.now{background:#fff5da}.ff-stage.now i{background:transparent;border:1.5px solid #ffc629;border-top-color:transparent;animation:ff-spin .8s linear infinite}.ff-email{display:flex;align-items:center;gap:9px;margin-top:20px;padding:12px;border:1px solid #f1d798;border-radius:10px;background:#fffaf0;color:#9d6900;font-size:11px;font-weight:750}.ff-email svg{width:15px;height:15px}@keyframes ff-spin{to{transform:rotate(360deg)}}.ff-gate__visual{padding:28px 30px;background:#faf9f6;border-left:1px solid #ece8df;display:flex;align-items:center;justify-content:center}.ff-preview{width:min(100%,560px)}.ff-videos{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ff-video{height:200px;width:100%;border-radius:10px;object-fit:cover;filter:blur(3px);opacity:.75}.ff-gate__sheet--desktop{display:block}.ff-gate__sheet--mobile{display:none}.ff-signup{margin:18px auto 0;padding:23px;border:1px solid #e4e0d8;border-radius:16px;background:#fff;text-align:center;box-shadow:0 20px 35px -30px rgba(0,0,0,.25);max-width:100%}.ff-signup h2{font-size:16px;letter-spacing:-.035em;margin:0}.ff-signup p{font-size:11px!important;line-height:1.55!important;margin:13px auto 0!important;color:#756f68!important}.ff-google{appearance:none;-webkit-appearance:none;height:50px;width:100%;margin-top:18px;border:1px solid #111!important;border-radius:9px;background:#111!important;color:#fff!important;font:inherit;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;box-shadow:0 8px 16px -10px rgba(0,0,0,.7);transition:transform .16s,background .16s,box-shadow .16s}.ff-google:hover:not(:disabled){background:#292929!important;box-shadow:0 11px 20px -10px rgba(0,0,0,.65);transform:translateY(-1px)}.ff-google svg{width:19px;height:19px;background:#fff;border-radius:50%;padding:2px}.ff-google:disabled{opacity:.6}.ff-trust{font-size:10px!important;margin-top:12px!important}.ff-error{margin-top:12px!important;color:#aa3820!important;font-weight:700}
      @media(max-width:720px){.free-flow--gate{padding:0;background:#f7f4ed}.ff-gate{position:relative;display:block;min-height:calc(100vh - 72px);padding:44px 16px 250px;overflow:hidden}.ff-gate__copy{display:flex;justify-content:center;padding:0;text-align:center}.ff-gate__inner{max-width:430px}.ff-gate h1{margin:14px 0 0;font-size:clamp(26px,8vw,36px);line-height:1.04}.ff-gate__copy>div>p{max-width:280px;margin-left:auto;margin-right:auto}.ff-stages{margin:32px auto 0;max-width:none}.ff-stage{text-align:left}.ff-stage i{flex:none}.ff-email{margin:20px auto 0;max-width:none;text-align:left}.ff-email svg{flex:none}.ff-gate__visual{display:none}.ff-gate__sheet--desktop{display:none}.ff-gate__sheet--mobile{position:fixed;left:0;right:0;bottom:0;z-index:20;display:flex;justify-content:center;padding:0 6px;pointer-events:none}.ff-gate__sheet--mobile.is-open .ff-signup{transform:translateY(0);opacity:1}.ff-signup{width:min(100%,560px);margin-top:0;padding:18px 18px 22px;border-bottom:0;border-radius:18px 18px 0 0;box-shadow:0 -12px 40px rgba(0,0,0,.10);transform:translateY(110%);opacity:0;transition:transform .34s ease,opacity .24s ease;pointer-events:auto}.ff-signup::before{content:'';display:block;width:46px;height:4px;border-radius:999px;background:#d7d2c8;margin:0 auto 16px}}@media(max-width:500px){.free-flow{padding:0 12px 35px}.free-flow--gate{padding:0}.ff-shell{padding-top:20px}.fs-step b{display:none}.fs-step em{width:20px;margin:0 5px}.ff-card{border-radius:16px}.ff-section{padding:20px 17px}.ff-subject{padding:0 17px}.ff-footer{padding:0 17px}.ff-run{padding:0 14px}.ff-modes{grid-template-columns:1fr}.ff-subject-form{margin:32px auto}.ff-gate{padding:38px 10px 248px}.ff-signup{padding:16px 14px 20px}.ff-subject-suggest{top:calc(100% + 8px);border-radius:16px}.ff-subject-suggest__head{padding:10px 12px 9px;font-size:.62rem}.ff-subject-suggest__item{padding:10px}.ff-subject-suggest__copy strong{font-size:.86rem}}
    ` }),
				/* @__PURE__ */ jsx("style", { children: `
      .ff-chip.on{background:#fff8e1}
      .ff-chips .ff-add{flex:0 0 auto;margin-right:100%;white-space:nowrap}
      .ff-subject{background:#fffaea}
      .ff-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
      .ff-topbar__back{color:#4a4741;background:transparent;border:0;padding:6px 4px;cursor:pointer;font:inherit;font-size:12px;font-weight:650;display:inline-flex;align-items:center;gap:6px}
      .ff-topbar__back:hover{color:#111}
      .ff-topbar__free{display:inline-flex;align-items:center;gap:7px;height:28px;padding:0 12px;background:#fff5da;color:#9d6900;border-radius:999px;font-size:10.5px;font-weight:800;letter-spacing:.02em}
      .ff-topbar__free::before{content:'\\2726';font-size:10px}
      .ff-signup--m5{text-align:left;padding:24px}
      .ff-signup--m5 h2{font-size:19px;letter-spacing:-.03em}
      .ff-signup--m5>p{text-align:left!important;margin:8px 0 0!important;font-size:12px!important;color:#5a5651!important}
      .ff-runchip{display:flex;align-items:center;gap:12px;margin:18px 0 18px;padding:12px 14px;background:#fff8e1;border:1px solid #f1d798;border-radius:12px}
      .ff-runchip__mono{width:34px;height:34px;flex:none;border-radius:8px;background:#ffe9a3;color:#7a5300;font-weight:800;font-size:12px;display:grid;place-items:center;letter-spacing:.02em}
      .ff-runchip__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;font-size:12px;text-align:left}
      .ff-runchip__body b{font-weight:800;color:#181614;letter-spacing:-.02em}
      .ff-runchip__body em{font-style:normal;color:#75694a;font-size:11px}
      .ff-runchip__pill{font-size:9.5px;font-weight:800;letter-spacing:.12em;color:#8a5a00;background:#ffdf80;padding:5px 8px;border-radius:6px}
      .ff-google--outline{background:#fff!important;color:#111!important;border:1px solid #d9d4ca!important;box-shadow:none;margin-top:6px}
      .ff-google--outline:hover:not(:disabled){background:#faf8f2!important;box-shadow:0 4px 10px -6px rgba(0,0,0,.2)}
      .ff-google--outline svg{background:transparent;padding:0}
      .ff-create{appearance:none;-webkit-appearance:none;height:50px;width:100%;margin-top:10px;border:0;border-radius:9px;background:#ffc629;color:#1a1400;font:inherit;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 8px 18px -10px rgba(255,198,41,.9);transition:transform .16s,background .16s,box-shadow .16s}
      .ff-create:hover:not(:disabled){background:#ffd84d;transform:translateY(-1px);box-shadow:0 12px 22px -10px rgba(255,198,41,1)}
      .ff-create:disabled{opacity:.65;cursor:not-allowed}
      .ff-trust--muted{text-align:center;color:#8b8577!important;margin-top:8px!important}
      .ff-havelogin{display:block;margin:14px auto 0;background:transparent;border:0;font:inherit;font-size:12px;font-weight:700;color:#111;text-decoration:underline;cursor:pointer;padding:6px}
      .ff-havelogin:disabled{opacity:.55;cursor:not-allowed}
    ` }),
				screen === "subject" && /* @__PURE__ */ jsxs("section", {
					className: "ff-subject-form",
					children: [/* @__PURE__ */ jsx("h1", { children: "What do you want to scan?" }), /* @__PURE__ */ jsxs("form", {
						onSubmit: beginRefine,
						ref: subjectFieldRef,
						children: [
							/* @__PURE__ */ jsx("div", {
								className: "ff-modes",
								children: TYPES$1.map(({ key, label, icon: Icon }) => /* @__PURE__ */ jsxs("button", {
									type: "button",
									className: `ff-mode ${kind === key ? "is-on" : ""}`,
									onClick: () => setKind(key),
									children: [/* @__PURE__ */ jsx(Icon, {}), label]
								}, key))
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "ff-subject-field",
								children: [/* @__PURE__ */ jsx("input", {
									className: "ff-input",
									autoFocus: true,
									autoComplete: "off",
									value: subject,
									placeholder: config.placeholder,
									onChange: (event) => {
										setSubject(event.target.value);
										setShowSuggestions(true);
									},
									onFocus: () => setShowSuggestions(true),
									onKeyDown: (event) => {
										if (!visibleSuggestions.length) return;
										if (event.key === "ArrowDown") {
											event.preventDefault();
											setShowSuggestions(true);
											setActiveSuggestion((current) => (current + 1) % visibleSuggestions.length);
										}
										if (event.key === "ArrowUp") {
											event.preventDefault();
											setShowSuggestions(true);
											setActiveSuggestion((current) => current <= 0 ? visibleSuggestions.length - 1 : current - 1);
										}
										if (event.key === "Enter" && activeSuggestion >= 0 && visibleSuggestions[activeSuggestion]) {
											event.preventDefault();
											applySuggestion(visibleSuggestions[activeSuggestion].label);
										}
										if (event.key === "Escape") {
											setShowSuggestions(false);
											setActiveSuggestion(-1);
										}
									},
									"aria-expanded": showSuggestions && visibleSuggestions.length > 0,
									"aria-haspopup": "listbox"
								}), showSuggestions && visibleSuggestions.length > 0 && /* @__PURE__ */ jsxs("div", {
									className: "ff-subject-suggest",
									role: "listbox",
									"aria-label": `${kind} suggestions`,
									children: [/* @__PURE__ */ jsxs("div", {
										className: "ff-subject-suggest__head",
										children: [/* @__PURE__ */ jsxs("span", { children: ["Suggested ", kind === "brand" ? "brands" : "products"] }), /* @__PURE__ */ jsx("span", { children: visibleSuggestions.length })]
									}), /* @__PURE__ */ jsx("div", {
										className: "ff-subject-suggest__list",
										children: visibleSuggestions.map((suggestion, index) => /* @__PURE__ */ jsx("button", {
											type: "button",
											className: `ff-subject-suggest__item ${index === activeSuggestion ? "is-active" : ""}`.trim(),
											onMouseEnter: () => setActiveSuggestion(index),
											onMouseDown: (event) => event.preventDefault(),
											onClick: () => applySuggestion(suggestion.label),
											children: /* @__PURE__ */ jsxs("span", {
												className: "ff-subject-suggest__copy",
												children: [/* @__PURE__ */ jsx("strong", { children: suggestion.label }), suggestion.sector && /* @__PURE__ */ jsx("em", { children: suggestion.sector })]
											})
										}, `${suggestion.type}-${suggestion.id}`))
									})]
								})]
							}),
							/* @__PURE__ */ jsxs("button", {
								className: "ff-run",
								style: {
									marginTop: 16,
									marginLeft: "auto"
								},
								disabled: !subject.trim(),
								children: ["Continue ", /* @__PURE__ */ jsx(Arrow, {})]
							})
						]
					})]
				}),
				screen === "refine" && /* @__PURE__ */ jsxs("section", {
					className: "ff-shell",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "ff-topbar",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								className: "ff-topbar__back",
								onClick: () => window.location.assign("/"),
								children: "← Back"
							}), /* @__PURE__ */ jsx("span", {
								className: "ff-topbar__free",
								children: "Free search · no card needed"
							})]
						}),
						/* @__PURE__ */ jsx(Stepper, { step: 2 }),
						/* @__PURE__ */ jsxs("div", {
							className: "ff-card",
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "ff-subject",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "ff-subject__label",
											children: "Searching"
										}),
										/* @__PURE__ */ jsx("strong", { children: subject }),
										/* @__PURE__ */ jsx("button", {
											type: "button",
											className: "ff-edit",
											"aria-label": "Change subject",
											onClick: () => window.location.assign("/"),
											children: /* @__PURE__ */ jsxs("svg", {
												viewBox: "0 0 24 24",
												fill: "none",
												stroke: "currentColor",
												strokeWidth: "2",
												strokeLinecap: "round",
												strokeLinejoin: "round",
												children: [/* @__PURE__ */ jsx("path", { d: "M12 20h9" }), /* @__PURE__ */ jsx("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" })]
											})
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "ff-section",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "ff-eyebrow",
											children: "Widen the pull"
										}),
										/* @__PURE__ */ jsx("h1", { children: "Add keywords to catch more of the trend" }),
										/* @__PURE__ */ jsx("p", { children: "These are the terms people pair with your subject on TikTok. Ticking more still counts as one free search." }),
										loading ? /* @__PURE__ */ jsx("p", { children: "Suggesting keywords..." }) : /* @__PURE__ */ jsxs("div", {
											className: "ff-chips",
											children: [terms.map((term) => /* @__PURE__ */ jsxs("button", {
												type: "button",
												disabled: term.locked,
												className: `ff-chip ${term.selected ? "on" : ""}`,
												onClick: () => toggle(term.value),
												children: [/* @__PURE__ */ jsx("span", {
													className: "ff-check",
													children: term.selected && /* @__PURE__ */ jsx(Check$1, {})
												}), term.value]
											}, term.value)), adding ? /* @__PURE__ */ jsx("input", {
												className: "ff-add-input",
												autoFocus: true,
												value: draft,
												onChange: (event) => setDraft(event.target.value),
												onBlur: addKeyword,
												onKeyDown: (event) => {
													if (event.key === "Enter") addKeyword();
													if (event.key === "Escape") setAdding(false);
												},
												placeholder: "Add a keyword"
											}) : /* @__PURE__ */ jsxs("button", {
												type: "button",
												className: "ff-chip ff-add",
												onClick: () => setAdding(true),
												children: [/* @__PURE__ */ jsx(Plus, {}), "Add your own"]
											})]
										}),
										/* @__PURE__ */ jsxs("p", {
											className: "ff-count",
											children: [/* @__PURE__ */ jsx("b", { children: selected.length }), " selected · all covered by your one free search."]
										}),
										message && /* @__PURE__ */ jsx("p", {
											className: "ff-error",
											children: message
										})
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "ff-footer",
									children: [/* @__PURE__ */ jsx("button", {
										type: "button",
										className: "ff-back",
										onClick: () => window.location.assign("/"),
										disabled: saving,
										children: "Back"
									}), /* @__PURE__ */ jsxs("button", {
										type: "button",
										className: "ff-run",
										disabled: loading || selected.length === 0 || saving,
										onClick: prepareAndSignIn,
										children: [
											saving && pendingRoute === "google" ? "Opening Google…" : "Run my free search",
											" ",
											/* @__PURE__ */ jsx(Arrow, {})
										]
									})]
								})
							]
						})
					]
				}),
				screen === "gate" && /* @__PURE__ */ jsxs("section", {
					className: "ff-gate",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "ff-gate__copy",
							children: /* @__PURE__ */ jsxs("div", {
								className: "ff-gate__inner",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "ff-eyebrow",
										children: "Scanning TikTok"
									}),
									/* @__PURE__ */ jsxs("h1", { children: [
										"Building your report",
										/* @__PURE__ */ jsx("br", {}),
										"for ",
										subject
									] }),
									/* @__PURE__ */ jsx("p", { children: "This is a deep scan, so it takes about 5 to 10 minutes. We are pulling videos, scoring them against each creator's baseline, and ranking the breakouts. You do not need to wait around." }),
									/* @__PURE__ */ jsx("div", {
										className: "ff-stages",
										children: stages.map((label, index) => /* @__PURE__ */ jsxs("div", {
											className: `ff-stage ${index === stages.length - 1 ? "now" : ""}`,
											children: [/* @__PURE__ */ jsx("i", { children: index < stages.length - 1 && /* @__PURE__ */ jsx(Check$1, {}) }), label]
										}, label))
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "ff-email",
										children: [/* @__PURE__ */ jsxs("svg", {
											viewBox: "0 0 24 24",
											fill: "none",
											stroke: "currentColor",
											strokeWidth: "2",
											children: [/* @__PURE__ */ jsx("rect", {
												x: "3",
												y: "5",
												width: "18",
												height: "14",
												rx: "2"
											}), /* @__PURE__ */ jsx("path", { d: "m3 7 9 6 9-6" })]
										}), "We will email your report the moment it is done."]
									})
								]
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: "ff-gate__visual",
							children: /* @__PURE__ */ jsxs("div", {
								className: "ff-preview",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "ff-videos",
									children: [
										/* @__PURE__ */ jsx("img", {
											className: "ff-video",
											src: "/images/landing/discovery-coco-shimmy.png",
											alt: ""
										}),
										/* @__PURE__ */ jsx("img", {
											className: "ff-video",
											src: "/images/landing/discovery-buyer-beware.png",
											alt: ""
										}),
										/* @__PURE__ */ jsx("img", {
											className: "ff-video",
											src: "/images/landing/discovery-brow-grooming.png",
											alt: ""
										})
									]
								}), /* @__PURE__ */ jsx("div", {
									className: "ff-gate__sheet--desktop",
									children: gateCard
								})]
							})
						}),
						/* @__PURE__ */ jsx("div", {
							className: `ff-gate__sheet--mobile ${showGateCard ? "is-open" : ""}`,
							children: gateCard
						})
					]
				})
			]
		})]
	})] });
}
//#endregion
//#region resources/js/landing/data/exampleBreakouts.js
/**
* Fallback example breakouts for the cold-free-user "while you wait" screen
* (M4 / M4b), used only when the backend has no real showcase breakouts to send
* (e.g. an empty corpus in local dev). In production the server supplies real
* top breakouts pulled from the viral-video corpus; see
* SavedSearchController::freeSearchShowcase().
*
* Shape is shared with the real data so RunningScreen renders either the same:
*   { id, handle, tag, caption, score, gradient, thumbnail?,
*     summary, rows: [{label,text}], stats: [{label,value,accent?}], beats? }
*
* These carry no real thumbnails, so each falls back to a stable `gradient`.
*/
var EXAMPLE_BREAKOUTS = [
	{
		id: "olipop-fridge",
		tag: "olipop",
		handle: "@quietkitchen.co",
		caption: "The fridge restock she films at two in the morning.",
		score: "88x",
		gradient: "linear-gradient(150deg,#3a2b6b,#6a3ca8 55%,#c07a9a)",
		summary: "1,400,000 views, off an account that normally does 16,000.",
		rows: [
			{
				label: "Hook",
				text: "“Do not buy this until you have seen the back of the bottle.”"
			},
			{
				label: "Format",
				text: "One take, phone on the counter, no cuts, no captions."
			},
			{
				label: "Why",
				text: "She never says the product name."
			}
		],
		stats: [
			{
				label: "Views",
				value: "1.4M"
			},
			{
				label: "Her usual",
				value: "16K"
			},
			{
				label: "Beat her own account by",
				value: "88x",
				accent: true
			},
			{
				label: "Paid partnership",
				value: "None"
			}
		],
		beats: [
			{
				ts: "0:00",
				text: "The can is already open and already in her hand. ",
				strong: "No introduction, no face, no hello."
			},
			{
				ts: "0:04",
				text: "She is restocking a fridge, which is the whole video. The product is furniture in somebody’s night, ",
				strong: "not the subject",
				tail: "."
			},
			{
				ts: "0:31",
				strong: "She never says the brand name once.",
				tail: " The comments say it 340 times."
			}
		]
	},
	{
		id: "castiron-garage",
		tag: "field co.",
		handle: "@castiron.dad",
		caption: "The guy seasoning a pan in his garage",
		score: "61x",
		gradient: "linear-gradient(150deg,#2f3d2b,#4a5c3a 55%,#7aa060)",
		summary: "980,000 views, off an account that normally does 11,000.",
		rows: [
			{
				label: "Hook",
				text: "“Everyone gets this part wrong.”"
			},
			{
				label: "Format",
				text: "Static shot of a workbench, hands only, one continuous take."
			},
			{
				label: "Why",
				text: "A quiet process video that reads as expertise, not an ad."
			}
		],
		stats: [
			{
				label: "Views",
				value: "980K"
			},
			{
				label: "His usual",
				value: "11K"
			},
			{
				label: "Beat his own account by",
				value: "61x",
				accent: true
			},
			{
				label: "Paid partnership",
				value: "None"
			}
		],
		beats: [
			{
				ts: "0:00",
				strong: "No hook line, no music.",
				text: " Just a pan, a paper towel, and a low burner."
			},
			{
				ts: "0:12",
				text: "He wipes the same spot four times. ",
				strong: "The repetition is the retention."
			},
			{
				ts: "0:45",
				text: "The brand shows for two frames on the box in the corner. ",
				strong: "Nobody skips to check it — they already trust him."
			}
		]
	},
	{
		id: "rental-unboxing",
		tag: "our place",
		handle: "@firstflat.era",
		caption: "Unboxing it in a rental with no counter space",
		score: "44x",
		gradient: "linear-gradient(150deg,#5c1030,#a8324f 55%,#ff8fb0)",
		summary: "620,000 views, off an account that normally does 14,000.",
		rows: [
			{
				label: "Hook",
				text: "“There is genuinely nowhere to put this.”"
			},
			{
				label: "Format",
				text: "Handheld, filmed on the floor because the counter is full."
			},
			{
				label: "Why",
				text: "The constraint is the story — the mess makes it believable."
			}
		],
		stats: [
			{
				label: "Views",
				value: "620K"
			},
			{
				label: "Her usual",
				value: "14K"
			},
			{
				label: "Beat her own account by",
				value: "44x",
				accent: true
			},
			{
				label: "Paid partnership",
				value: "None"
			}
		],
		beats: [
			{
				ts: "0:00",
				strong: "She apologizes for the mess first.",
				text: " It disarms the whole video."
			},
			{
				ts: "0:09",
				text: "The box opens on the floor between two boxes still taped shut. ",
				strong: "Everyone in a small flat sees themselves."
			},
			{
				ts: "0:22",
				strong: "She never recommends it.",
				tail: " She just uses it and moves on."
			}
		]
	},
	{
		id: "back-pocket",
		tag: "nomatic",
		handle: "@carryon.only",
		caption: "Six months in a back pocket, on camera",
		score: "39x",
		gradient: "linear-gradient(150deg,#0f3d5c,#2a6f9c 55%,#7ab6d8)",
		summary: "540,000 views, off an account that normally does 15,000.",
		rows: [
			{
				label: "Hook",
				text: "“This is what six months of abuse looks like.”"
			},
			{
				label: "Format",
				text: "A single close-up, rotating the product slowly in the light."
			},
			{
				label: "Why",
				text: "Proof over promise — the wear is the whole pitch."
			}
		],
		stats: [
			{
				label: "Views",
				value: "540K"
			},
			{
				label: "His usual",
				value: "15K"
			},
			{
				label: "Beat his own account by",
				value: "39x",
				accent: true
			},
			{
				label: "Paid partnership",
				value: "None"
			}
		],
		beats: [
			{
				ts: "0:00",
				strong: "The damage is the first frame.",
				text: " No before, only after."
			},
			{
				ts: "0:15",
				text: "He lists what it survived, ",
				strong: "not what it does."
			},
			{
				ts: "0:28",
				strong: "The one line people quoted:",
				tail: " “still closes like day one.”"
			}
		]
	},
	{
		id: "one-star-reviews",
		tag: "liquid death",
		handle: "@saysitback",
		caption: "Reading her own one-star reviews out loud",
		score: "31x",
		gradient: "linear-gradient(150deg,#4a2b1a,#8a5230 55%,#d69a6a)",
		summary: "410,000 views, off an account that normally does 13,000.",
		rows: [
			{
				label: "Hook",
				text: "“Let’s read the ones that hate it.”"
			},
			{
				label: "Format",
				text: "Talking head, deadpan, reading a phone in one hand."
			},
			{
				label: "Why",
				text: "Leaning into the criticism reads as confidence, and confidence sells."
			}
		],
		stats: [
			{
				label: "Views",
				value: "410K"
			},
			{
				label: "Her usual",
				value: "13K"
			},
			{
				label: "Beat her own account by",
				value: "31x",
				accent: true
			},
			{
				label: "Paid partnership",
				value: "None"
			}
		],
		beats: [
			{
				ts: "0:00",
				strong: "She reads the worst review first.",
				text: " The comments beg her to keep going."
			},
			{
				ts: "0:18",
				text: "Each complaint gets a one-word answer. ",
				strong: "No defensiveness, no pitch."
			},
			{
				ts: "0:36",
				strong: "The last review is a compliment",
				tail: " — and it lands ten times harder for the setup."
			}
		]
	}
];
//#endregion
//#region resources/js/landing/flow/screens/RunningScreen.jsx
var POLL_MS = 1e4;
var STEPS = [
	"Scanning TikTok’s videos for your selected keywords",
	"Pulling video and creator information",
	"Analyzing videos with our AI agents",
	"Scoring each video and extracting winners",
	"Making it look pretty for you"
];
var Check = /* @__PURE__ */ jsx("svg", {
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "4",
	strokeLinecap: "round",
	strokeLinejoin: "round",
	children: /* @__PURE__ */ jsx("path", { d: "M5 12.5l4.6 4.5L19 7" })
});
function elapsedLabel(seconds) {
	if (seconds < 60) return `Started ${Math.max(1, seconds)} second${seconds === 1 ? "" : "s"} ago`;
	const mins = Math.floor(seconds / 60);
	return `Started ${mins} minute${mins === 1 ? "" : "s"} ago`;
}
function Beat({ beat }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "m4-beat",
		children: [/* @__PURE__ */ jsx("span", {
			className: "m4-beat__ts",
			children: beat.ts
		}), /* @__PURE__ */ jsxs("p", { children: [
			beat.text,
			beat.strong && /* @__PURE__ */ jsx("b", { children: beat.strong }),
			beat.tail
		] })]
	});
}
function CardArt({ item }) {
	return /* @__PURE__ */ jsx("span", {
		className: "m4-art",
		style: { background: item.gradient },
		children: item.thumbnail && /* @__PURE__ */ jsx("img", {
			className: "m4-art__img",
			src: item.thumbnail,
			alt: "",
			loading: "lazy"
		})
	});
}
function RailThumb({ item }) {
	return /* @__PURE__ */ jsxs("span", {
		className: "m4-vc",
		style: { background: item.gradient },
		children: [item.thumbnail && /* @__PURE__ */ jsx("img", {
			className: "m4-art__img",
			src: item.thumbnail,
			alt: "",
			loading: "lazy"
		}), item.score && /* @__PURE__ */ jsx("span", {
			className: "m4-sc",
			children: item.score
		})]
	});
}
function BreakoutModal({ item, subject, step, others, onClose }) {
	useEffect(() => {
		const onEsc = (e) => e.key === "Escape" && onClose();
		document.addEventListener("keydown", onEsc);
		return () => document.removeEventListener("keydown", onEsc);
	}, [onClose]);
	const hasBeats = Array.isArray(item.beats) && item.beats.length > 0;
	return /* @__PURE__ */ jsxs("div", {
		className: "m4-modal",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `Why ${item.handle || "this creator"} broke out`,
		children: [/* @__PURE__ */ jsx("button", {
			className: "m4-modal__bg",
			"aria-label": "Back to your search",
			onClick: onClose
		}), /* @__PURE__ */ jsxs("div", {
			className: "m4-modal__panel",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "m4-runbar",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "m4-runbar__mini",
						"aria-hidden": true,
						children: /* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "#ffc629",
							strokeWidth: "2.4",
							strokeLinecap: "round",
							children: /* @__PURE__ */ jsx("path", { d: "M12 2.8a9.2 9.2 0 1 0 9.2 9.2" })
						})
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "m4-runbar__bd",
						children: [/* @__PURE__ */ jsxs("strong", { children: [
							"Your ",
							subject,
							" search is still running"
						] }), /* @__PURE__ */ jsxs("span", { children: [STEPS[Math.min(step, STEPS.length - 1)], " · we will not lose it"] })]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "m4-runbar__go",
						onClick: onClose,
						children: "Back to it"
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "m4-modal__scroll",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "m4-fcard m4-fcard--tall",
						children: [
							/* @__PURE__ */ jsx(CardArt, { item }),
							/* @__PURE__ */ jsx("span", { className: "m4-veil" }),
							item.score && /* @__PURE__ */ jsxs("span", {
								className: "m4-oscore",
								children: [/* @__PURE__ */ jsx("b", { children: item.score }), /* @__PURE__ */ jsx("span", { children: "outlier" })]
							}),
							item.tag && /* @__PURE__ */ jsx("span", {
								className: "m4-tagd",
								children: item.tag
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "m4-fmeta",
								children: [item.handle && /* @__PURE__ */ jsx("span", {
									className: "m4-fmeta__h",
									children: item.handle
								}), /* @__PURE__ */ jsx("p", { children: item.caption })]
							})
						]
					}),
					item.stats?.length > 0 && /* @__PURE__ */ jsx("div", {
						className: "m4-sb2",
						children: item.stats.map((stat) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("span", {
							className: "l",
							children: stat.label
						}), /* @__PURE__ */ jsx("span", {
							className: "v",
							style: stat.accent ? { color: "var(--amber-ink)" } : void 0,
							children: stat.value
						})] }, stat.label))
					}),
					/* @__PURE__ */ jsx("div", {
						className: "m4-sec",
						children: /* @__PURE__ */ jsx("h2", { children: "why it worked" })
					}),
					hasBeats ? /* @__PURE__ */ jsx("div", {
						className: "m4-card m4-beats",
						children: item.beats.map((beat) => /* @__PURE__ */ jsx(Beat, { beat }, beat.ts))
					}) : /* @__PURE__ */ jsx("div", {
						className: "m4-card m4-breakdown",
						children: /* @__PURE__ */ jsx("div", {
							className: "m4-irows",
							children: (item.rows ?? []).map((row) => /* @__PURE__ */ jsxs("span", {
								className: "m4-irow",
								children: [/* @__PURE__ */ jsx("span", {
									className: "m4-itag",
									children: row.label
								}), /* @__PURE__ */ jsx("span", { children: row.text })]
							}, row.label))
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "m4-note",
						children: [/* @__PURE__ */ jsxs("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2.1",
							strokeLinecap: "round",
							children: [
								/* @__PURE__ */ jsx("path", { d: "M12 8.4v4.4" }),
								/* @__PURE__ */ jsx("circle", {
									cx: "12",
									cy: "16.4",
									r: ".9",
									fill: "currentColor"
								}),
								/* @__PURE__ */ jsx("circle", {
									cx: "12",
									cy: "12",
									r: "8.4"
								})
							]
						}), /* @__PURE__ */ jsx("span", { children: "This is the short version. The full second-by-second breakdown, the creators behind it and the words the comments repeat are what your own search is building right now." })]
					}),
					others.length > 0 && /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
						className: "m4-sec",
						children: /* @__PURE__ */ jsx("h2", { children: "more we found for others" })
					}), /* @__PURE__ */ jsx("div", {
						className: "m4-rail",
						children: others.map((b) => /* @__PURE__ */ jsxs("button", {
							type: "button",
							className: "m4-rail__t",
							onClick: () => onClose(b),
							children: [/* @__PURE__ */ jsx(RailThumb, { item: b }), /* @__PURE__ */ jsx("p", {
								className: "m4-ti",
								children: b.caption
							})]
						}, b.id))
					})] })
				]
			})]
		})]
	});
}
/**
* The cold-free-user "while you wait" experience (M4 / M4b). A live view of the
* scrape running server-side, wrapped in curated breakout examples so the wait
* teaches what a breakout looks like. Opening one shows the M4b breakdown over
* the top, with the search still running underneath.
*/
function RunningScreen({ searchId, initialSearch = null, examples = [], onBack, onDone }) {
	const [search, setSearch] = useState(initialSearch);
	const [unavailable, setUnavailable] = useState(!searchId);
	const [failed, setFailed] = useState(null);
	const [completed, setCompleted] = useState(null);
	const [step, setStep] = useState(0);
	const [seconds, setSeconds] = useState(0);
	const [openBreakout, setOpenBreakout] = useState(null);
	const finished = useRef(false);
	const polling = useRef(false);
	const completionTimer = useRef(null);
	const subject = search?.name || "your";
	const source = Array.isArray(examples) && examples.length > 0 ? examples : EXAMPLE_BREAKOUTS;
	const [featured, ...rail] = source;
	useEffect(() => {
		if (!searchId) return void 0;
		let timer;
		let cancelled = false;
		const poll = async () => {
			if (cancelled || finished.current || polling.current) return;
			polling.current = true;
			try {
				const found = (await fetchNotifications([searchId]))?.searches?.[0];
				if (!found) {
					finished.current = true;
					setSearch(null);
					setUnavailable(true);
					return;
				}
				setSearch(found);
				if (found.status === "done") {
					finished.current = true;
					updateTracked(searchId, {
						completedPromptShown: true,
						name: found.name
					});
					setCompleted(found);
					completionTimer.current = window.setTimeout(() => onDone?.(found), 900);
					return;
				}
				if (found.status === "failed") {
					finished.current = true;
					setFailed(found.latest_run_error || "The scrape did not finish. Try running the search again.");
					return;
				}
				if (found.status !== "scraping") {
					finished.current = true;
					setSearch(null);
					setUnavailable(true);
					return;
				}
			} catch {} finally {
				polling.current = false;
			}
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
			window.clearTimeout(completionTimer.current);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [searchId, onDone]);
	useEffect(() => {
		if (failed || unavailable || search?.status !== "scraping") return void 0;
		const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, 2)), 9e3);
		return () => window.clearInterval(timer);
	}, [
		failed,
		unavailable,
		search?.status
	]);
	useEffect(() => {
		if (failed || unavailable || completed) return void 0;
		const timer = window.setInterval(() => setSeconds((s) => s + 1), 1e3);
		return () => window.clearInterval(timer);
	}, [
		failed,
		unavailable,
		completed
	]);
	if (unavailable || !search) return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("style", { children: scopedCss }), /* @__PURE__ */ jsxs("div", {
		className: "m4-card m4-state",
		children: [
			/* @__PURE__ */ jsx("h1", { children: unavailable ? "No search available" : "Checking search status" }),
			/* @__PURE__ */ jsx("p", { children: unavailable ? "Start a search to discover breakout videos for your brand or product." : "Confirming the latest status of your search." }),
			unavailable && /* @__PURE__ */ jsx("button", {
				onClick: onBack,
				className: "m4-btn m4-btn--y",
				children: "Start a search"
			})
		]
	})] });
	if (failed) return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("style", { children: scopedCss }), /* @__PURE__ */ jsxs("div", {
		className: "m4-card m4-state",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "m4-badbadge",
				children: "Search failed"
			}),
			/* @__PURE__ */ jsx("h1", { children: "That run didn’t finish" }),
			/* @__PURE__ */ jsx("p", { children: failed }),
			/* @__PURE__ */ jsx("button", {
				onClick: onBack,
				className: "m4-btn m4-btn--ghost",
				children: "Edit keywords and retry"
			})
		]
	})] });
	if (completed) return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("style", { children: scopedCss }), /* @__PURE__ */ jsxs("div", {
		className: "m4-card m4-state",
		children: [
			/* @__PURE__ */ jsxs("span", {
				className: "m4-okbadge",
				children: [/* @__PURE__ */ jsx("i", {}), "Search complete"]
			}),
			/* @__PURE__ */ jsx("h1", { children: "Your results are ready" }),
			/* @__PURE__ */ jsx("p", { children: "Videos, winner analysis, and search insights are ready. Opening your results now." })
		]
	})] });
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("style", { children: scopedCss }),
		/* @__PURE__ */ jsxs("div", {
			className: "m4-head",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "m4-spin",
					"aria-hidden": true,
					children: [/* @__PURE__ */ jsxs("svg", {
						viewBox: "0 0 108 108",
						children: [
							/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
								id: "m4-g",
								x1: "0",
								y1: "0",
								x2: "1",
								y2: "1",
								children: [/* @__PURE__ */ jsx("stop", {
									offset: "0",
									stopColor: "#ffd84d"
								}), /* @__PURE__ */ jsx("stop", {
									offset: "1",
									stopColor: "#ff9f1c"
								})]
							}) }),
							/* @__PURE__ */ jsx("circle", {
								className: "m4-spin__tr",
								cx: "54",
								cy: "54",
								r: "46"
							}),
							/* @__PURE__ */ jsx("circle", {
								className: "m4-spin__arc",
								cx: "54",
								cy: "54",
								r: "46"
							})
						]
					}), /* @__PURE__ */ jsx("i", {})]
				}),
				/* @__PURE__ */ jsx("h1", { children: "Let us do our thing…" }),
				/* @__PURE__ */ jsx("p", {
					className: "m4-lede",
					children: "1 to 5 minutes, mostly around 2 minutes."
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "m4-card m4-proc",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "m4-proc__top",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "m4-live",
						children: [/* @__PURE__ */ jsx("i", {}), "Live"]
					}), /* @__PURE__ */ jsx("span", {
						className: "m4-meta",
						children: elapsedLabel(seconds)
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "m4-sweep",
					"aria-hidden": true,
					children: /* @__PURE__ */ jsx("i", {})
				}),
				/* @__PURE__ */ jsx("div", {
					className: "m4-steps",
					children: STEPS.map((label, i) => {
						const state = i < step ? "done" : i === step ? "now" : "wait";
						return /* @__PURE__ */ jsxs("span", {
							className: `m4-tick m4-tick--${state}`,
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "m4-tick__d",
									children: state === "wait" ? "•" : Check
								}),
								label,
								state === "now" && /* @__PURE__ */ jsx("span", {
									className: "m4-tick__c",
									"aria-hidden": true,
									children: /* @__PURE__ */ jsx("svg", {
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2.6",
										strokeLinecap: "round",
										children: /* @__PURE__ */ jsx("path", { d: "M12 3.4a8.6 8.6 0 1 0 8.6 8.6" })
									})
								})
							]
						}, label);
					})
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "m4-sec",
			children: [/* @__PURE__ */ jsx("h2", { children: "while we’re working" }), /* @__PURE__ */ jsx("span", {
				className: "m4-stag",
				children: "Brand Beacon"
			})]
		}),
		/* @__PURE__ */ jsx("p", {
			className: "m4-desc",
			children: "Check out these breakout videos we found. Look at the hooks, formatting, and why we believe it worked."
		}),
		/* @__PURE__ */ jsxs("button", {
			type: "button",
			className: "m4-fcard",
			onClick: () => setOpenBreakout(featured),
			children: [
				/* @__PURE__ */ jsx(CardArt, { item: featured }),
				/* @__PURE__ */ jsx("span", { className: "m4-veil" }),
				featured.score && /* @__PURE__ */ jsxs("span", {
					className: "m4-oscore",
					children: [/* @__PURE__ */ jsx("b", { children: featured.score }), /* @__PURE__ */ jsx("span", { children: "outlier" })]
				}),
				featured.tag && /* @__PURE__ */ jsx("span", {
					className: "m4-tagd",
					children: featured.tag
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "m4-fmeta",
					children: [featured.handle && /* @__PURE__ */ jsx("span", {
						className: "m4-fmeta__h",
						children: featured.handle
					}), /* @__PURE__ */ jsx("p", { children: featured.caption })]
				})
			]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "m4-card m4-breakdown",
			children: [
				featured.summary && /* @__PURE__ */ jsx("span", {
					className: "m4-breakdown__sum",
					children: featured.summary
				}),
				/* @__PURE__ */ jsx("div", {
					className: "m4-irows",
					children: (featured.rows ?? []).map((row) => /* @__PURE__ */ jsxs("span", {
						className: "m4-irow",
						children: [/* @__PURE__ */ jsx("span", {
							className: "m4-itag",
							children: row.label
						}), /* @__PURE__ */ jsx("span", { children: row.text })]
					}, row.label))
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "m4-btn m4-btn--ghost",
					onClick: () => setOpenBreakout(featured),
					children: "Read the short breakdown"
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "m4-rail",
			children: rail.map((b) => /* @__PURE__ */ jsxs("button", {
				type: "button",
				className: "m4-rail__t",
				onClick: () => setOpenBreakout(b),
				children: [/* @__PURE__ */ jsx(RailThumb, { item: b }), /* @__PURE__ */ jsx("p", {
					className: "m4-ti",
					children: b.caption
				})]
			}, b.id))
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "m4-note m4-note--amber",
			children: [/* @__PURE__ */ jsxs("svg", {
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.9",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: [/* @__PURE__ */ jsx("path", { d: "M18 8.6a6 6 0 1 0-12 0c0 6-2.2 7.4-2.2 7.4h16.4S18 14.6 18 8.6z" }), /* @__PURE__ */ jsx("path", { d: "M13.7 19.6a2 2 0 0 1-3.4 0" })]
			}), /* @__PURE__ */ jsx("span", { children: "Close the tab if you like. We’ll send a browser notification and an email the moment it lands." })]
		}),
		openBreakout && /* @__PURE__ */ jsx(BreakoutModal, {
			item: openBreakout,
			subject,
			step,
			others: source.filter((b) => b.id !== openBreakout.id).slice(0, 3),
			onClose: (next) => setOpenBreakout(next && next.id ? next : null)
		})
	] });
}
var scopedCss = `
.m4-card{border:1px solid var(--line,#e7e5df);border-radius:16px;background:var(--white,#fff);box-shadow:0 1px 2px rgba(20,15,0,.04)}
.m4-head{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:6px 0 4px;margin-bottom:18px}
.m4-head h1{margin:0;font-size:1.5rem;line-height:1.2;font-weight:800;letter-spacing:-.04em;color:var(--ink,#0b0b0b)}
.m4-lede{margin:0;font-size:.9rem;line-height:1.5;color:var(--muted,#33312c)}
.m4-spin{position:relative;width:108px;height:108px;flex:none;display:grid;place-items:center}
.m4-spin svg{position:absolute;inset:0;width:100%;height:100%;animation:m4-turn 1.15s linear infinite}
.m4-spin__tr{fill:none;stroke:#f1efe9;stroke-width:9}
.m4-spin__arc{fill:none;stroke:url(#m4-g);stroke-width:9;stroke-linecap:round;stroke-dasharray:108 400}
.m4-spin>i{position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(255,198,41,.5);animation:m4-ring 2.4s ease-out infinite}
@keyframes m4-turn{to{transform:rotate(360deg)}}
@keyframes m4-ring{0%{transform:scale(.9);opacity:1}100%{transform:scale(1.12);opacity:0}}
@keyframes m4-sweepmove{0%{left:-40%}100%{left:100%}}
@keyframes m4-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.24);opacity:.6}}
@keyframes m4-blink{0%,100%{opacity:1}50%{opacity:.25}}

.m4-proc{padding:15px 16px 16px;display:flex;flex-direction:column;gap:13px;margin-bottom:16px}
.m4-proc__top{display:flex;align-items:center;gap:9px}
.m4-live{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;background:#fdf0ef;color:#a3231b;font-size:.63rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.m4-live i{width:6px;height:6px;border-radius:50%;background:#d13a2c;animation:m4-blink 1.3s ease infinite}
.m4-meta{margin-left:auto;font-weight:600;font-size:.78rem;color:var(--muted,#33312c)}
.m4-sweep{position:relative;height:5px;border-radius:999px;background:#f1efe9;overflow:hidden}
.m4-sweep i{position:absolute;top:0;bottom:0;width:38%;border-radius:999px;background:linear-gradient(90deg,#ffd84d,#ff9f1c);animation:m4-sweepmove 1.7s ease-in-out infinite}
.m4-steps{display:flex;flex-direction:column;gap:11px}
.m4-tick{display:flex;align-items:flex-start;gap:11px;font-size:.87rem;font-weight:500;color:#33312c;line-height:1.45}
.m4-tick__d{width:18px;height:18px;flex:none;margin-top:1px;display:grid;place-items:center;border-radius:50%;background:#edf7f0;color:#12703f;font-size:.7rem;line-height:1}
.m4-tick__d svg{width:9px;height:9px}
.m4-tick__c{margin-left:auto;flex:none;width:15px;height:15px;margin-top:2px;color:var(--amber-ink,#9a6b00)}
.m4-tick__c svg{width:15px;height:15px;animation:m4-turn .9s linear infinite}
.m4-tick--now{color:#0b0b0b;font-weight:700}
.m4-tick--now .m4-tick__d{background:var(--yellow,#ffc629);color:#0b0b0b;animation:m4-pulse 1.4s ease-in-out infinite}
.m4-tick--wait{color:#5c5a54}
.m4-tick--wait .m4-tick__d{background:#f1efe9;color:#f1efe9}

.m4-sec{display:flex;align-items:baseline;gap:9px;margin:6px 0 0}
.m4-sec h2{margin:0;display:flex;align-items:center;gap:8px;font-size:.98rem;font-weight:700;letter-spacing:-.03em;color:var(--ink,#0b0b0b)}
.m4-sec h2::before{content:'';width:3px;height:15px;flex:none;border-radius:2px;background:var(--yellow,#ffc629)}
.m4-stag{margin-left:auto;flex:none;display:inline-flex;align-items:center;min-height:21px;padding:0 8px;border-radius:6px;background:#f1efe9;color:#26241f;font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.09em;white-space:nowrap}
.m4-desc{margin:8px 0 2px;color:#26241f;font-size:.83rem;line-height:1.55;font-weight:500}

.m4-fcard{position:relative;display:block;width:100%;height:300px;border:0;padding:0;border-radius:16px;overflow:hidden;background:#efece4;cursor:pointer;text-align:left;margin-top:14px}
.m4-fcard--tall{height:330px;margin-top:0}
.m4-art{position:absolute;inset:0}
.m4-art__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.m4-veil{position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.42) 0%,rgba(0,0,0,0) 24%,rgba(0,0,0,0) 40%,rgba(0,0,0,.86) 100%)}
.m4-oscore{position:absolute;top:11px;left:11px;display:inline-flex;align-items:center;gap:7px;min-height:28px;padding:0 11px;border-radius:999px;background:var(--yellow,#ffc629);color:#0b0b0b}
.m4-oscore b{font-family:ui-monospace,Menlo,monospace;font-size:.79rem;font-weight:700}
.m4-oscore span{font-size:.58rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em}
.m4-tagd{position:absolute;top:11px;right:11px;display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border-radius:999px;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);color:#fff;font-size:.68rem;font-weight:700}
.m4-fmeta{position:absolute;left:0;right:14px;bottom:0;padding:0 14px 15px;display:flex;flex-direction:column;gap:6px}
.m4-fmeta__h{color:#fff;font-size:.88rem;font-weight:800}
.m4-fmeta p{margin:0;color:#f1efe9;font-size:.9rem;line-height:1.4}

.m4-breakdown{padding:14px 15px;display:flex;flex-direction:column;gap:11px;margin-top:14px}
.m4-breakdown__sum{font-size:.86rem;font-weight:600;color:#26241f;line-height:1.5}
.m4-irows{display:flex;flex-direction:column;gap:9px}
.m4-irow{display:flex;align-items:flex-start;gap:9px;font-size:.85rem;font-weight:600;line-height:1.5;color:var(--ink,#0b0b0b)}
.m4-itag{flex:none;width:64px;justify-content:center;display:inline-flex;align-items:center;padding:4px 10px;border-radius:7px;background:#fff8e6;color:#9a6b00;font-size:.75rem;font-weight:600}

.m4-rail{display:flex;gap:10px;overflow-x:auto;margin:14px -6px 0;padding:1px 6px 4px;scrollbar-width:thin}
.m4-rail__t{width:116px;flex:none;display:flex;flex-direction:column;gap:6px;border:0;background:transparent;padding:0;cursor:pointer;text-align:left}
.m4-vc{position:relative;display:block;width:100%;aspect-ratio:9/16;border-radius:12px;overflow:hidden;background:#f1efe9}
.m4-sc{position:absolute;left:8px;bottom:8px;display:inline-flex;align-items:center;padding:3px 8px;border-radius:6px;background:var(--yellow,#ffc629);color:#0b0b0b;font-family:ui-monospace,Menlo,monospace;font-size:.7rem;font-weight:700}
.m4-ti{margin:0;font-size:.75rem;font-weight:600;line-height:1.35;color:#33312c}

.m4-note{display:flex;align-items:flex-start;gap:10px;padding:13px 14px;border:1px solid var(--line,#e7e5df);border-radius:14px;background:var(--white,#fff);margin-top:14px;font-size:.8rem;font-weight:500;color:#26241f;line-height:1.5}
.m4-note svg{width:15px;height:15px;flex:none;margin-top:2px;color:#33312c}
.m4-note--amber{background:#fffaeb;border-color:rgba(255,198,41,.34)}
.m4-note--amber svg{color:#9a6b00}
.m4-note--amber span{color:#0b0b0b;font-weight:600}

.m4-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;padding:0 16px;border-radius:10px;font-size:.83rem;font-weight:700;border:1px solid transparent;cursor:pointer;width:100%}
.m4-btn--ghost{background:var(--white,#fff);border-color:rgba(0,0,0,.09);color:#0b0b0b}
.m4-btn--ghost:hover{background:#faf9f6}
.m4-btn--y{background:var(--yellow,#ffc629);color:#1a1400;width:auto;padding:0 22px;min-height:44px;margin:6px auto 0}

.m4-state{padding:34px 22px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px}
.m4-state h1{margin:0;font-size:1.3rem;font-weight:800;letter-spacing:-.03em;color:var(--ink,#0b0b0b)}
.m4-state p{margin:0;font-size:.88rem;color:var(--muted,#33312c);max-width:420px;line-height:1.5}
.m4-okbadge{display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:999px;background:#e9f6ef;color:#1f7a4d;font-size:.78rem;font-weight:700}
.m4-okbadge i{width:7px;height:7px;border-radius:50%;background:currentColor}
.m4-badbadge{display:inline-flex;align-items:center;padding:5px 12px;border-radius:999px;background:#fbede6;color:#b0431b;font-size:.78rem;font-weight:700}

/* -------- M4b modal -------- */
.m4-modal{position:fixed;inset:0;z-index:120;display:flex;justify-content:center;align-items:flex-start;overflow:hidden}
.m4-modal__bg{position:absolute;inset:0;border:0;background:rgba(11,11,11,.5);backdrop-filter:blur(2px);cursor:pointer}
.m4-modal__panel{position:relative;z-index:1;width:min(560px,100%);max-height:100dvh;margin-top:0;display:flex;flex-direction:column;background:var(--paper,#faf9f6);border-radius:0 0 20px 20px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5)}
.m4-modal__scroll{flex:1;min-height:0;overflow-y:auto;padding:15px 16px 22px;display:flex;flex-direction:column;gap:15px}
.m4-modal__scroll>*{flex:0 0 auto}
.m4-runbar{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:11px;padding:10px 16px;background:#0b0b0b;color:#fff}
.m4-runbar__mini{width:26px;height:26px;flex:none;display:grid;place-items:center}
.m4-runbar__mini svg{width:24px;height:24px;animation:m4-turn 1.05s linear infinite}
.m4-runbar__bd{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px}
.m4-runbar__bd strong{font-size:.82rem;font-weight:700;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m4-runbar__bd span{color:#d6d2c6;font-size:.71rem;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.m4-runbar__go{flex:none;display:inline-flex;align-items:center;min-height:30px;padding:0 12px;border-radius:999px;background:var(--yellow,#ffc629);color:#0b0b0b;font-size:.75rem;font-weight:700;white-space:nowrap;border:0;cursor:pointer}
.m4-sb2{display:grid;grid-template-columns:1fr 1fr;background:var(--white,#fff);border:1px solid rgba(0,0,0,.06);border-radius:14px;overflow:hidden}
.m4-sb2>div{padding:12px 14px 13px;display:flex;flex-direction:column;gap:6px;border-top:1px solid rgba(0,0,0,.06);border-left:1px solid rgba(0,0,0,.06)}
.m4-sb2>div:nth-child(-n+2){border-top:0}
.m4-sb2>div:nth-child(2n+1){border-left:0}
.m4-sb2 .l{color:#33312c;font-size:.62rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;line-height:1.3}
.m4-sb2 .v{font-family:ui-monospace,Menlo,monospace;font-size:1.24rem;font-weight:700;letter-spacing:-.03em;line-height:1;color:var(--ink,#0b0b0b)}
.m4-beats{padding:6px 16px 8px}
.m4-beat{display:flex;gap:13px;padding:11px 0;border-bottom:1px solid var(--line,#e7e5df)}
.m4-beat:last-child{border-bottom:0}
.m4-beat__ts{flex:none;font-family:ui-monospace,Menlo,monospace;font-size:.75rem;font-weight:700;color:var(--amber-ink,#9a6b00);padding-top:1px}
.m4-beat p{margin:0;font-size:.85rem;font-weight:500;line-height:1.5;color:#26241f}
.m4-beat p b{font-weight:700;color:var(--ink,#0b0b0b)}

@media (max-width:560px){
.m4-head h1{font-size:1.32rem}
.m4-spin{width:96px;height:96px}
.m4-fcard{height:280px}
.m4-modal__panel{width:100%}
}
@media (prefers-reduced-motion:reduce){
.m4-spin svg,.m4-spin>i,.m4-sweep i,.m4-tick--now .m4-tick__d,.m4-tick__c svg,.m4-live i,.m4-runbar__mini svg{animation:none}
}
`;
//#endregion
//#region resources/js/Pages/Search/Running.jsx
var Running_exports = /* @__PURE__ */ __exportAll({ default: () => Running });
function Running({ searchId, search, examples = [] }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Seo, {
		title: "Search Running | Brand Beacon",
		description: "Your Brand Beacon search is being prepared.",
		noIndex: true
	}), /* @__PURE__ */ jsxs("div", {
		className: "bbh",
		children: [/* @__PURE__ */ jsx(Nav, { homeHref: "/" }), /* @__PURE__ */ jsx("main", {
			className: "bb",
			style: {
				minHeight: "calc(100vh - 72px)",
				padding: "48px 20px",
				background: "var(--paper)"
			},
			children: /* @__PURE__ */ jsx("div", {
				style: {
					maxWidth: 560,
					margin: "0 auto"
				},
				children: /* @__PURE__ */ jsx(RunningScreen, {
					searchId,
					initialSearch: search,
					examples,
					onBack: () => router.visit("/search"),
					onDone: () => router.visit(`/results/${searchId}`)
				})
			})
		})]
	})] });
}
//#endregion
//#region resources/js/Pages/SecurityPage.jsx
var SecurityPage_exports = /* @__PURE__ */ __exportAll({ default: () => SecurityPage });
var sections$1 = [
	{
		heading: "1. Security Overview",
		paragraphs: ["Brand Beacon is designed with practical administrative, technical, and operational controls intended to protect customer accounts, application data, billing workflows, and service infrastructure.", "Our security program continues to evolve as the product, vendors, and threat environment change."]
	},
	{
		heading: "2. Access Controls",
		paragraphs: ["We limit access to systems and data based on role and business need. Administrative access is restricted to authorized personnel, and access may be reviewed, changed, or removed when responsibilities change.", "Customer account access is managed through application authentication controls, and users are responsible for maintaining the confidentiality of their credentials."]
	},
	{
		heading: "3. Infrastructure and Vendors",
		paragraphs: ["Brand Beacon relies on third-party infrastructure and service providers to support hosting, storage, billing, communications, authentication, monitoring, and related application operations.", "We select vendors based on product and operational needs and may review them for security, reliability, and fit for purpose as part of our vendor-management process."]
	},
	{
		heading: "4. Data Protection Measures",
		paragraphs: ["We use reasonable safeguards intended to protect data in transit and to limit unauthorized access to stored service data. Depending on the component, those safeguards may include encrypted transport, access restrictions, environment separation, logging, and least-privilege operational practices.", "No method of transmission or storage is perfectly secure, so we cannot guarantee absolute security."]
	},
	{
		heading: "5. Monitoring and Response",
		paragraphs: ["We maintain operational monitoring and troubleshooting practices intended to detect service issues, abuse, failures, and potential security concerns.", "If we confirm a security incident affecting customer data, we aim to investigate, contain, remediate, and communicate appropriately based on the nature of the incident and our legal obligations."]
	},
	{
		heading: "6. Product Safeguards",
		paragraphs: ["Brand Beacon includes controls intended to reduce misuse and unintended exposure, such as authenticated access to account areas, server-side validation, billing and entitlement checks, audit-oriented activity records, and role-based controls for administrative features."]
	},
	{
		heading: "7. Backups and Availability",
		paragraphs: ["We may use backup, redundancy, and recovery-oriented practices appropriate to the service and infrastructure we operate. However, we do not guarantee that the service will be uninterrupted, error-free, or immune from outages caused by third-party providers or platform dependencies."]
	},
	{
		heading: "8. Customer Responsibilities",
		paragraphs: ["Customers play an important role in security. You should use strong passwords, protect account credentials, limit access to authorized team members, review account activity, and notify us promptly if you suspect unauthorized access or misuse."]
	},
	{
		heading: "9. Responsible Disclosure",
		paragraphs: ["If you believe you have identified a security issue affecting Brand Beacon, contact us at hello@brandbeacon.com with relevant details. Please avoid actions that could harm users, disrupt the service, or access data you are not authorized to access."]
	},
	{
		heading: "10. Contact",
		paragraphs: ["Security-related questions may be sent to hello@brandbeacon.com."]
	}
];
function SecurityPage() {
	return /* @__PURE__ */ jsx(LegalPage, {
		title: "Security",
		effectiveDate: "August 29, 2026",
		sections: sections$1
	});
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
	const { auth = {}, flash = {}, preferences = {}, accountDeletion = {}, passwordAccess = {} } = usePage().props;
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
	const passwordForm = useForm({
		current_password: "",
		password: "",
		password_confirmation: ""
	});
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
	const savePassword = (event) => {
		event.preventDefault();
		passwordForm.submit(passwordAccess.canAdd ? "post" : "patch", "/settings/account/password", {
			preserveScroll: true,
			onSuccess: () => passwordForm.reset()
		});
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Account · Brand Beacon" }), /* @__PURE__ */ jsxs(SettingsShell, {
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
			(passwordAccess.canAdd || passwordAccess.enabled) && /* @__PURE__ */ jsx("div", {
				className: "card",
				style: { marginTop: 16 },
				children: /* @__PURE__ */ jsxs("div", {
					className: "card__p",
					children: [/* @__PURE__ */ jsx("h2", { children: passwordAccess.canAdd ? "Set a manual password" : "Update password" }), /* @__PURE__ */ jsxs("form", {
						onSubmit: savePassword,
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "muted",
								style: {
									fontSize: ".86rem",
									marginTop: 6
								},
								children: passwordAccess.canAdd ? `You sign in with Google. Set a manual password for ${auth.user?.email} before you can update it here.` : "Confirm your current password to save a new password."
							}),
							!passwordAccess.canAdd && /* @__PURE__ */ jsxs("div", {
								style: { marginTop: 18 },
								children: [
									/* @__PURE__ */ jsx("label", {
										className: "lbl",
										htmlFor: "current_password",
										children: "Current password"
									}),
									/* @__PURE__ */ jsx("input", {
										id: "current_password",
										className: "fld",
										type: "password",
										autoComplete: "current-password",
										required: true,
										value: passwordForm.data.current_password,
										onChange: (event) => passwordForm.setData("current_password", event.target.value)
									}),
									passwordForm.errors.current_password && /* @__PURE__ */ jsx("p", {
										className: "hint",
										style: { color: "var(--warn)" },
										children: passwordForm.errors.current_password
									})
								]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "grid2",
								style: { marginTop: 18 },
								children: [/* @__PURE__ */ jsxs("div", { children: [
									/* @__PURE__ */ jsx("label", {
										className: "lbl",
										htmlFor: "new_password",
										children: "New password"
									}),
									/* @__PURE__ */ jsx("input", {
										id: "new_password",
										className: "fld",
										type: "password",
										autoComplete: "new-password",
										required: true,
										value: passwordForm.data.password,
										onChange: (event) => passwordForm.setData("password", event.target.value)
									}),
									passwordForm.errors.password && /* @__PURE__ */ jsx("p", {
										className: "hint",
										style: { color: "var(--warn)" },
										children: passwordForm.errors.password
									})
								] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("label", {
									className: "lbl",
									htmlFor: "password_confirmation",
									children: "Confirm new password"
								}), /* @__PURE__ */ jsx("input", {
									id: "password_confirmation",
									className: "fld",
									type: "password",
									autoComplete: "new-password",
									required: true,
									value: passwordForm.data.password_confirmation,
									onChange: (event) => passwordForm.setData("password_confirmation", event.target.value)
								})] })]
							}),
							/* @__PURE__ */ jsx("button", {
								type: "submit",
								className: "btn btn--y",
								style: { marginTop: 18 },
								disabled: passwordForm.processing,
								children: passwordForm.processing ? "Saving…" : passwordAccess.canAdd ? "Set manual password" : "Update password"
							})
						]
					})]
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
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: "Appearance · Brand Beacon" }), /* @__PURE__ */ jsxs(SettingsShell, {
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
//#region resources/js/Pages/Settings/Receipt.jsx
var Receipt_exports = /* @__PURE__ */ __exportAll({ default: () => Receipt });
function formatDate$1(iso) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString(void 0, {
		month: "long",
		day: "numeric",
		year: "numeric"
	});
}
function formatPeriod(start, end) {
	const a = formatDate$1(start);
	const b = formatDate$1(end);
	if (a && b) return `${a} – ${b}`;
	return a || b || null;
}
var StatusPill = ({ status }) => {
	const paid = status === "paid";
	return /* @__PURE__ */ jsx("span", {
		className: `rcpt-status${paid ? " is-paid" : ""}`,
		children: paid ? "Paid" : status || "Open"
	});
};
function Receipt({ receipt }) {
	const issued = formatDate$1(receipt?.date);
	const lines = Array.isArray(receipt?.lines) ? receipt.lines : [];
	return /* @__PURE__ */ jsxs("div", {
		className: "bb",
		children: [/* @__PURE__ */ jsx(Head, { title: `Receipt ${receipt?.number || ""} · Brand Beacon` }), /* @__PURE__ */ jsxs("div", {
			className: "rcpt",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "rcpt__bar",
				children: [/* @__PURE__ */ jsx(Link, {
					href: "/settings/subscription",
					className: "rcpt__back",
					children: "← Back to subscription"
				}), /* @__PURE__ */ jsxs("div", {
					className: "rcpt__bar-actions",
					children: [receipt?.pdfUrl && /* @__PURE__ */ jsx("a", {
						className: "rcpt__btn",
						href: receipt.pdfUrl,
						target: "_blank",
						rel: "noreferrer",
						children: "Stripe PDF"
					}), /* @__PURE__ */ jsxs("button", {
						type: "button",
						className: "rcpt__btn rcpt__btn--primary",
						onClick: () => window.print(),
						children: [/* @__PURE__ */ jsx("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							children: /* @__PURE__ */ jsx("path", { d: "M6 9V3h12v6M6 18H4v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6h-2M6 14h12v7H6z" })
						}), "Print / Save PDF"]
					})]
				})]
			}), /* @__PURE__ */ jsxs("article", {
				className: "rcpt__sheet",
				children: [
					/* @__PURE__ */ jsxs("header", {
						className: "rcpt__head",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "rcpt__brand",
							children: [/* @__PURE__ */ jsx("span", {
								className: "rcpt__logo",
								"aria-hidden": true,
								children: /* @__PURE__ */ jsxs("svg", {
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									strokeLinecap: "round",
									strokeLinejoin: "round",
									children: [/* @__PURE__ */ jsx("path", { d: "M4 12a8 8 0 0 1 8-8M4 12a8 8 0 0 0 8 8M8 12a4 4 0 0 1 4-4" }), /* @__PURE__ */ jsx("circle", {
										cx: "12",
										cy: "12",
										r: "1.4",
										fill: "currentColor",
										stroke: "none"
									})]
								})
							}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "rcpt__brandname",
								children: "Brand Beacon"
							}), /* @__PURE__ */ jsx("div", {
								className: "rcpt__brandsub",
								children: "TikTok viral intelligence for brands"
							})] })]
						}), /* @__PURE__ */ jsxs("div", {
							className: "rcpt__title",
							children: [
								/* @__PURE__ */ jsx("div", {
									className: "rcpt__title-lab",
									children: "Receipt"
								}),
								receipt?.number && /* @__PURE__ */ jsx("div", {
									className: "rcpt__num",
									children: receipt.number
								}),
								/* @__PURE__ */ jsx(StatusPill, { status: receipt?.status })
							]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rcpt__meta",
						children: [
							/* @__PURE__ */ jsxs("div", { children: [
								/* @__PURE__ */ jsx("div", {
									className: "rcpt__meta-lab",
									children: "Billed to"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "rcpt__meta-val",
									children: receipt?.customerName || receipt?.customerEmail || "—"
								}),
								receipt?.customerName && receipt?.customerEmail && /* @__PURE__ */ jsx("div", {
									className: "rcpt__meta-sub",
									children: receipt.customerEmail
								})
							] }),
							/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "rcpt__meta-lab",
								children: "Date issued"
							}), /* @__PURE__ */ jsx("div", {
								className: "rcpt__meta-val",
								children: issued || "—"
							})] }),
							receipt?.card && /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "rcpt__meta-lab",
								children: "Paid with"
							}), /* @__PURE__ */ jsxs("div", {
								className: "rcpt__meta-val",
								children: [
									receipt.card.brand,
									" ·· ",
									receipt.card.last4
								]
							})] })
						]
					}),
					/* @__PURE__ */ jsxs("table", {
						className: "rcpt__table",
						children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
							/* @__PURE__ */ jsx("th", { children: "Description" }),
							/* @__PURE__ */ jsx("th", {
								className: "rcpt__r",
								children: "Qty"
							}),
							/* @__PURE__ */ jsx("th", {
								className: "rcpt__r",
								children: "Amount"
							})
						] }) }), /* @__PURE__ */ jsx("tbody", { children: lines.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", {
							colSpan: 3,
							className: "rcpt__empty",
							children: "No line items on this invoice."
						}) }) : lines.map((line, i) => {
							const period = formatPeriod(line.periodStart, line.periodEnd);
							return /* @__PURE__ */ jsxs("tr", { children: [
								/* @__PURE__ */ jsxs("td", { children: [/* @__PURE__ */ jsx("div", {
									className: "rcpt__desc",
									children: line.description
								}), period && /* @__PURE__ */ jsx("div", {
									className: "rcpt__period",
									children: period
								})] }),
								/* @__PURE__ */ jsx("td", {
									className: "rcpt__r rcpt__num-cell",
									children: line.quantity
								}),
								/* @__PURE__ */ jsx("td", {
									className: "rcpt__r rcpt__num-cell",
									children: line.amount
								})
							] }, i);
						}) })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "rcpt__totals",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "rcpt__totrow",
								children: [/* @__PURE__ */ jsx("span", { children: "Subtotal" }), /* @__PURE__ */ jsx("span", {
									className: "rcpt__num-cell",
									children: receipt?.subtotal
								})]
							}),
							receipt?.tax && /* @__PURE__ */ jsxs("div", {
								className: "rcpt__totrow",
								children: [/* @__PURE__ */ jsx("span", { children: "Tax" }), /* @__PURE__ */ jsx("span", {
									className: "rcpt__num-cell",
									children: receipt.tax
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "rcpt__totrow rcpt__totrow--grand",
								children: [/* @__PURE__ */ jsx("span", { children: "Total paid" }), /* @__PURE__ */ jsx("span", {
									className: "rcpt__num-cell",
									children: receipt?.amountPaid || receipt?.total
								})]
							})
						]
					}),
					/* @__PURE__ */ jsxs("footer", {
						className: "rcpt__foot",
						children: [/* @__PURE__ */ jsx("p", { children: "Thank you for using Brand Beacon." }), /* @__PURE__ */ jsx("p", {
							className: "rcpt__foot-sub",
							children: "Payments are securely processed by Stripe. Questions about this receipt? Reply to your billing email and we’ll help."
						})]
					})
				]
			})]
		})]
	});
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
var METER_ICONS = {
	search: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		children: [/* @__PURE__ */ jsx("circle", {
			cx: "11",
			cy: "11",
			r: "7"
		}), /* @__PURE__ */ jsx("path", { d: "m20 20-3.5-3.5" })]
	}),
	analysis: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [/* @__PURE__ */ jsx("path", { d: "M3 5h18v14H3z" }), /* @__PURE__ */ jsx("path", { d: "m10 9 5 3-5 3z" })]
	}),
	videoBookmark: /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinejoin: "round",
		children: /* @__PURE__ */ jsx("path", { d: "M6 3h12v18l-6-4.5L6 21z" })
	}),
	searchBookmark: /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: "2",
		strokeLinecap: "round",
		strokeLinejoin: "round",
		children: [
			/* @__PURE__ */ jsx("circle", {
				cx: "11",
				cy: "11",
				r: "7"
			}),
			/* @__PURE__ */ jsx("path", { d: "m20 20-3.5-3.5" }),
			/* @__PURE__ */ jsx("path", {
				d: "M9 13V9l3.5 2z",
				fill: "currentColor",
				stroke: "none"
			})
		]
	})
};
function UsageMeter({ icon, label, used, limit, note }) {
	const unlimited = limit === -1;
	const pct = unlimited ? 0 : ratio(used, limit);
	return /* @__PURE__ */ jsxs("div", {
		className: "subx-meter",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "subx-meter__top",
				children: [/* @__PURE__ */ jsx("span", {
					className: "subx-meter__ic",
					children: icon
				}), /* @__PURE__ */ jsx("span", {
					className: "subx-meter__label",
					children: label
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "subx-meter__val",
				children: [/* @__PURE__ */ jsx("span", {
					className: "subx-meter__used num",
					children: used
				}), unlimited ? /* @__PURE__ */ jsx("span", {
					className: "subx-meter__inf",
					children: "· Unlimited"
				}) : /* @__PURE__ */ jsxs("span", {
					className: "subx-meter__lim num",
					children: ["/ ", limit || 0]
				})]
			}),
			unlimited ? /* @__PURE__ */ jsx("div", { className: "subx-track subx-track--dash subx-track--good" }) : /* @__PURE__ */ jsx("div", {
				className: "subx-track",
				children: /* @__PURE__ */ jsx("i", { style: { width: `${pct}%` } })
			}),
			note && /* @__PURE__ */ jsx("div", {
				className: "subx-meter__note",
				children: note
			})
		]
	});
}
function formatPaymentMethod(method) {
	if (!method?.last4) return "No card on file yet";
	const expiry = method.expMonth && method.expYear ? ` · expires ${String(method.expMonth).padStart(2, "0")}/${String(method.expYear).slice(-2)}` : "";
	return `${method.brand || "Card"} ending in ${method.last4}${expiry}`;
}
var stripeJsPromise = null;
function loadStripeJs() {
	if (typeof window === "undefined") return Promise.reject(/* @__PURE__ */ new Error("Stripe.js requires a browser."));
	if (window.Stripe) return Promise.resolve(window.Stripe);
	if (stripeJsPromise) return stripeJsPromise;
	stripeJsPromise = new Promise((resolve, reject) => {
		const existing = document.querySelector("script[data-stripe-js=\"true\"]");
		if (existing) {
			existing.addEventListener("load", () => resolve(window.Stripe));
			existing.addEventListener("error", () => reject(/* @__PURE__ */ new Error("Could not load Stripe.js.")));
			return;
		}
		const script = document.createElement("script");
		script.src = "https://js.stripe.com/v3/";
		script.async = true;
		script.dataset.stripeJs = "true";
		script.onload = () => resolve(window.Stripe);
		script.onerror = () => reject(/* @__PURE__ */ new Error("Could not load Stripe.js."));
		document.head.appendChild(script);
	});
	return stripeJsPromise;
}
function PaymentMethodModal({ open, busy, saving, error, onClose, onSubmit }) {
	if (!open) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: busy || saving ? void 0 : onClose
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box",
				children: [
					/* @__PURE__ */ jsx("h2", { children: "Update payment method" }),
					/* @__PURE__ */ jsx("p", {
						className: "sub",
						children: "Your card details are collected securely by Stripe. We only store the payment method summary in Brand Beacon."
					}),
					/* @__PURE__ */ jsx("div", {
						id: "stripe-card-element",
						style: {
							marginTop: 18,
							padding: "14px 16px",
							borderRadius: 14,
							border: "1px solid var(--line)",
							background: "var(--paper)",
							minHeight: 52
						}
					}),
					error && /* @__PURE__ */ jsx("p", {
						className: "hint",
						style: {
							marginTop: 10,
							color: "var(--warn)"
						},
						children: error
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "actrow__r",
						style: {
							marginTop: 22,
							justifyContent: "flex-end"
						},
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g",
							onClick: onClose,
							disabled: busy || saving,
							children: "Cancel"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--y",
							onClick: onSubmit,
							disabled: busy || saving,
							children: saving ? "Saving…" : busy ? "Loading…" : "Save card"
						})]
					})
				]
			})]
		})
	});
}
function CancelConfirmModal({ open, busy, error, planName, periodEnd, onConfirm, onClose }) {
	if (!open) return null;
	return /* @__PURE__ */ jsx("div", {
		className: "bb",
		children: /* @__PURE__ */ jsxs("div", {
			className: "bb-modal",
			children: [/* @__PURE__ */ jsx("button", {
				className: "bb-modal__bg",
				"aria-label": "Close",
				onClick: busy ? void 0 : onClose
			}), /* @__PURE__ */ jsxs("div", {
				className: "bb-modal__box",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Cancel subscription",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "subx-cancel__icon",
						"aria-hidden": true,
						children: /* @__PURE__ */ jsxs("svg", {
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							children: [/* @__PURE__ */ jsx("path", { d: "M12 9v4M12 17h.01" }), /* @__PURE__ */ jsx("path", { d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" })]
						})
					}),
					/* @__PURE__ */ jsxs("h2", { children: [
						"Cancel your ",
						planName,
						" plan?"
					] }),
					/* @__PURE__ */ jsxs("p", {
						className: "sub",
						children: [
							"Your subscription will not renew. You’ll keep full access",
							periodEnd ? /* @__PURE__ */ jsxs(Fragment$1, { children: [" until ", /* @__PURE__ */ jsx("b", {
								style: { color: "var(--ink)" },
								children: periodEnd
							})] }) : " until the end of your current billing period",
							", then move to the free plan. You can resubscribe anytime."
						]
					}),
					error && /* @__PURE__ */ jsx("p", {
						className: "subx-error",
						role: "alert",
						style: {
							color: "var(--bad, #d64545)",
							marginTop: 14
						},
						children: error
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "actrow__r",
						style: {
							marginTop: 22,
							justifyContent: "flex-end"
						},
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--g",
							onClick: onClose,
							disabled: busy,
							children: "Keep subscription"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn--bad",
							onClick: onConfirm,
							disabled: busy,
							children: busy ? "Cancelling…" : "Cancel subscription"
						})]
					})
				]
			})]
		})
	});
}
function Subscription({ subscription, stripePublishableKey = null }) {
	const { flash = {} } = usePage().props;
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
	const billingCycle = subscription?.billingCycle ?? "monthly";
	const isTrialing = status === "trialing" || status === "trial";
	const cancelAtPeriodEnd = Boolean(subscription?.cancelAtPeriodEnd);
	const cancelsAt = formatDate(subscription?.cancelsAt);
	const trialEnds = formatDate(subscription?.trialEndsAt);
	const renews = formatDate(subscription?.renewsAt);
	const invoices = subscription?.invoices ?? [];
	const [statusMessage, setStatusMessage] = useState(flash.status ?? null);
	const [paymentMethod, setPaymentMethod] = useState(subscription?.paymentMethod ?? null);
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [paymentSaving, setPaymentSaving] = useState(false);
	const [paymentError, setPaymentError] = useState(null);
	const [cancelBusy, setCancelBusy] = useState(false);
	const [cancelError, setCancelError] = useState(null);
	const [reactivateBusy, setReactivateBusy] = useState(false);
	const [cancelModalOpen, setCancelModalOpen] = useState(false);
	const [elementsState, setElementsState] = useState(null);
	const searchesLeft = searchLimit > 0 ? Math.max(0, searchLimit - searchUsed) : 0;
	const videoBookmarksUnlimited = videoBookmarkLimit === -1;
	const searchBookmarksUnlimited = searchBookmarkLimit === -1;
	const analysisUnlimited = videoAnalysisLimit === -1;
	const openPaymentMethodModal = async () => {
		if (!stripePublishableKey) {
			setPaymentError("Stripe is not configured yet.");
			setPaymentModalOpen(true);
			return;
		}
		setPaymentModalOpen(true);
		setPaymentLoading(true);
		setPaymentError(null);
		try {
			const stripe = (await loadStripeJs())(stripePublishableKey);
			const payload = await billing.createPaymentMethodSetup();
			if (!payload?.clientSecret) throw new Error("Could not start the card update flow.");
			const elements = stripe.elements({ clientSecret: payload.clientSecret });
			const card = elements.create("payment");
			card.mount("#stripe-card-element");
			setElementsState({
				stripe,
				elements,
				card
			});
		} catch (error) {
			setPaymentError(error?.message || "Could not open the card form.");
		} finally {
			setPaymentLoading(false);
		}
	};
	const closePaymentMethodModal = () => {
		if (paymentLoading || paymentSaving) return;
		try {
			elementsState?.card?.destroy?.();
		} catch {}
		setElementsState(null);
		setPaymentModalOpen(false);
		setPaymentError(null);
	};
	const savePaymentMethod = async () => {
		if (!elementsState?.stripe || !elementsState?.elements) return;
		setPaymentSaving(true);
		setPaymentError(null);
		try {
			const result = await elementsState.stripe.confirmSetup({
				elements: elementsState.elements,
				redirect: "if_required"
			});
			if (result.error) throw new Error(result.error.message || "Could not save this card.");
			const paymentMethodId = result.setupIntent?.payment_method;
			if (!paymentMethodId) throw new Error("Stripe did not return a payment method.");
			const response = await billing.updatePaymentMethod(paymentMethodId);
			setPaymentMethod(response?.paymentMethod ?? null);
			setStatusMessage(response?.message || "Payment method updated.");
			closePaymentMethodModal();
			router.reload({ only: ["subscription"] });
		} catch (error) {
			setPaymentError(error?.message || "Could not save this card.");
		} finally {
			setPaymentSaving(false);
		}
	};
	const cancelSubscription = async () => {
		setCancelBusy(true);
		setCancelError(null);
		try {
			const response = await billing.cancelSubscription();
			setStatusMessage(response?.message || "Subscription cancellation scheduled.");
			setCancelModalOpen(false);
			router.reload({ only: ["subscription"] });
		} catch (error) {
			setCancelError(error?.message || "We could not cancel your subscription. Please try again.");
		} finally {
			setCancelBusy(false);
		}
	};
	const reactivateSubscription = async () => {
		setReactivateBusy(true);
		try {
			const response = await billing.reactivateSubscription();
			setStatusMessage(response?.message || "Subscription reactivated.");
			router.reload({ only: ["subscription"] });
		} finally {
			setReactivateBusy(false);
		}
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(Head, { title: "Subscription · Brand Beacon" }),
		/* @__PURE__ */ jsxs(SettingsShell, {
			section: "subscription",
			children: [
				statusMessage && /* @__PURE__ */ jsx("div", {
					className: "card",
					style: { marginBottom: 16 },
					children: /* @__PURE__ */ jsx("div", {
						className: "card__p",
						children: /* @__PURE__ */ jsx("p", {
							style: {
								fontWeight: 700,
								color: "var(--ok)"
							},
							children: statusMessage
						})
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "card subx",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "subx-plan",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "subx-plan__id",
								children: [/* @__PURE__ */ jsxs("div", {
									className: "subx-plan__name-row",
									children: [/* @__PURE__ */ jsx("span", {
										className: "subx-plan__name",
										children: planName
									}), /* @__PURE__ */ jsxs("span", {
										className: `pill ${cancelAtPeriodEnd ? "pill--warn" : isTrialing ? "pill--run" : active ? "pill--ok" : "pill--off"}`,
										children: [/* @__PURE__ */ jsx("i", {}), cancelAtPeriodEnd ? "Scheduled to cancel" : isTrialing ? "Trialing" : active ? "Active" : status]
									})]
								}), /* @__PURE__ */ jsxs("p", {
									className: "subx-plan__price",
									children: [price > 0 ? /* @__PURE__ */ jsxs(Fragment$1, { children: [
										/* @__PURE__ */ jsxs("b", { children: ["$", price] }),
										" / ",
										interval
									] }) : /* @__PURE__ */ jsx("b", { children: "Free plan" }), cancelAtPeriodEnd && cancelsAt ? /* @__PURE__ */ jsxs(Fragment$1, { children: [" · Access ends ", /* @__PURE__ */ jsx("b", { children: cancelsAt })] }) : isTrialing && trialEnds ? /* @__PURE__ */ jsxs(Fragment$1, { children: [" · Trial ends ", /* @__PURE__ */ jsx("b", { children: trialEnds })] }) : renews ? /* @__PURE__ */ jsxs(Fragment$1, { children: [" · Renews ", /* @__PURE__ */ jsx("b", { children: renews })] }) : ""]
								})]
							}), /* @__PURE__ */ jsx(Link, {
								href: "/plans",
								className: "btn btn--y",
								children: active ? "Change plan" : "Upgrade"
							})]
						}),
						cancelAtPeriodEnd && /* @__PURE__ */ jsxs("div", {
							className: "subx-notice",
							role: "status",
							"aria-live": "polite",
							children: [/* @__PURE__ */ jsx("div", {
								className: "subx-notice__icon",
								"aria-hidden": true,
								children: /* @__PURE__ */ jsxs("svg", {
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "2",
									strokeLinecap: "round",
									strokeLinejoin: "round",
									children: [
										/* @__PURE__ */ jsx("path", { d: "M12 8v4" }),
										/* @__PURE__ */ jsx("path", { d: "M12 16h.01" }),
										/* @__PURE__ */ jsx("path", { d: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" })
									]
								})
							}), /* @__PURE__ */ jsxs("div", {
								className: "subx-notice__copy",
								children: [
									/* @__PURE__ */ jsx("p", {
										className: "subx-notice__eyebrow",
										children: "Cancellation scheduled"
									}),
									/* @__PURE__ */ jsxs("p", {
										className: "subx-notice__title",
										children: [
											"Your plan stays active",
											cancelsAt ? /* @__PURE__ */ jsxs(Fragment$1, { children: [" until ", /* @__PURE__ */ jsx("b", { children: cancelsAt })] }) : "",
											"."
										]
									}),
									/* @__PURE__ */ jsx("p", {
										className: "subx-notice__text",
										children: "Renewal has been turned off, so the subscription will end automatically at the close of this billing period."
									}),
									/* @__PURE__ */ jsx("div", {
										className: "subx-notice__actions",
										children: /* @__PURE__ */ jsx("button", {
											type: "button",
											className: "btn btn--y btn--sm",
											onClick: reactivateSubscription,
											disabled: reactivateBusy,
											children: reactivateBusy ? "Reactivating…" : "Reactivate subscription"
										})
									})
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "subx-usage-hd",
							children: [/* @__PURE__ */ jsx("h3", { children: "Usage this cycle" }), isTrialing && trialEnds ? /* @__PURE__ */ jsxs("span", { children: ["Trial ends ", trialEnds] }) : renews ? /* @__PURE__ */ jsxs("span", { children: ["Resets ", renews] }) : null]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "subx-usage",
							children: [
								/* @__PURE__ */ jsx(UsageMeter, {
									icon: METER_ICONS.search,
									label: "Searches",
									used: searchUsed,
									limit: searchLimit,
									note: searchLimit > 0 ? `${searchesLeft} left this cycle` : null
								}),
								/* @__PURE__ */ jsx(UsageMeter, {
									icon: METER_ICONS.analysis,
									label: "Video analysis",
									used: videoAnalysisUsed,
									limit: videoAnalysisLimit,
									note: analysisUnlimited ? "No cap on your plan" : `${Math.max(0, videoAnalysisLimit - videoAnalysisUsed)} left this cycle`
								}),
								/* @__PURE__ */ jsx(UsageMeter, {
									icon: METER_ICONS.videoBookmark,
									label: "Video bookmarks",
									used: videoBookmarkUsed,
									limit: videoBookmarkLimit,
									note: videoBookmarksUnlimited ? "No cap on your plan" : `${Math.max(0, videoBookmarkLimit - videoBookmarkUsed)} left`
								}),
								/* @__PURE__ */ jsx(UsageMeter, {
									icon: METER_ICONS.searchBookmark,
									label: "Search bookmarks",
									used: searchBookmarkUsed,
									limit: searchBookmarkLimit,
									note: searchBookmarksUnlimited ? "No cap on your plan" : `${Math.max(0, searchBookmarkLimit - searchBookmarkUsed)} left`
								})
							]
						}),
						/* @__PURE__ */ jsx("hr", { className: "subx-divider" }),
						paymentMethod ? /* @__PURE__ */ jsxs("div", {
							className: "subx-pm",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "subx-pm__brand",
									children: (paymentMethod.brand || "Card").toUpperCase()
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "subx-pm__copy",
									children: [/* @__PURE__ */ jsx("div", {
										className: "subx-pm__line num",
										children: formatPaymentMethod(paymentMethod)
									}), /* @__PURE__ */ jsx("div", {
										className: "subx-pm__sub",
										children: "Update your card details"
									})]
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									className: "btn btn--g btn--sm",
									onClick: openPaymentMethodModal,
									children: "Update card"
								})
							]
						}) : /* @__PURE__ */ jsxs("div", {
							className: "subx-pm subx-pm--empty",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "subx-pm__add",
									"aria-hidden": true,
									children: /* @__PURE__ */ jsxs("svg", {
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2",
										strokeLinecap: "round",
										strokeLinejoin: "round",
										children: [/* @__PURE__ */ jsx("rect", {
											x: "2.5",
											y: "5",
											width: "19",
											height: "14",
											rx: "2.5"
										}), /* @__PURE__ */ jsx("path", { d: "M2.5 9.5h19M12 13.5v4M10 15.5h4" })]
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "subx-pm__copy",
									children: [/* @__PURE__ */ jsx("div", {
										className: "subx-pm__line",
										children: "No card on file"
									}), /* @__PURE__ */ jsxs("div", {
										className: "subx-pm__sub subx-pm__sub--warn",
										children: [
											"Add a card",
											isTrialing && trialEnds ? ` before your trial ends ${trialEnds}` : "",
											" to keep access."
										]
									})]
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									className: "btn btn--y btn--sm",
									onClick: openPaymentMethodModal,
									children: [/* @__PURE__ */ jsx("svg", {
										viewBox: "0 0 24 24",
										fill: "none",
										stroke: "currentColor",
										strokeWidth: "2.2",
										strokeLinecap: "round",
										children: /* @__PURE__ */ jsx("path", { d: "M12 5v14M5 12h14" })
									}), "Add card"]
								})
							]
						}),
						(active || isTrialing) && !cancelAtPeriodEnd && /* @__PURE__ */ jsxs("div", {
							className: "subx-foot",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "subx-foot__q",
								children: [/* @__PURE__ */ jsx("b", { children: "Need to cancel?" }), " Keep access through the end of your billing period."]
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								className: "subx-cancel-link",
								onClick: () => setCancelModalOpen(true),
								children: "Cancel subscription"
							})]
						})
					]
				}),
				invoices.length > 0 && /* @__PURE__ */ jsx("div", {
					className: "card subx",
					style: { marginTop: 16 },
					id: "billing-history",
					children: /* @__PURE__ */ jsxs("div", {
						className: "card__p",
						children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", { children: "Payment history" }), /* @__PURE__ */ jsx("p", {
							className: "muted",
							style: {
								fontSize: ".84rem",
								marginTop: 6
							},
							children: "Your recent Stripe invoices and receipts."
						})] }), /* @__PURE__ */ jsx("div", {
							className: "subx-inv",
							children: invoices.map((inv, i) => /* @__PURE__ */ jsxs("div", {
								className: "subx-inv__row",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "subx-inv__date num",
										children: formatDate(inv.date) ?? inv.date
									}),
									/* @__PURE__ */ jsxs("span", {
										className: "subx-inv__meta",
										children: [
											planName,
											" · ",
											billingCycle === "annual" ? "annual" : "monthly",
											/* @__PURE__ */ jsx("span", {
												className: `subx-inv__tag${inv.status === "paid" ? " is-paid" : ""}`,
												children: inv.status
											})
										]
									}),
									/* @__PURE__ */ jsx("b", {
										className: "subx-inv__amt num",
										children: inv.amount
									}),
									inv.id && /* @__PURE__ */ jsx("a", {
										href: `/settings/subscription/receipt/${encodeURIComponent(inv.id)}`,
										className: "btn btn--g btn--sm",
										target: "_blank",
										rel: "noreferrer",
										children: "Receipt"
									})
								]
							}, inv.id || i))
						})]
					})
				})
			]
		}),
		/* @__PURE__ */ jsx(PaymentMethodModal, {
			open: paymentModalOpen,
			busy: paymentLoading,
			saving: paymentSaving,
			error: paymentError,
			onClose: closePaymentMethodModal,
			onSubmit: savePaymentMethod
		}),
		/* @__PURE__ */ jsx(CancelConfirmModal, {
			open: cancelModalOpen,
			busy: cancelBusy,
			error: cancelError,
			planName,
			periodEnd: renews || trialEnds,
			onConfirm: cancelSubscription,
			onClose: () => {
				if (cancelBusy) return;
				setCancelError(null);
				setCancelModalOpen(false);
			}
		})
	] });
}
//#endregion
//#region resources/js/Pages/Support.jsx
var Support_exports = /* @__PURE__ */ __exportAll({ default: () => Support });
var csrfToken = () => document.querySelector("meta[name=\"csrf-token\"]")?.getAttribute("content") ?? "";
function Support({ sessionAvailable, retryAfter = 0, commonQuestions = [] }) {
	const [messages, setMessages] = useState([]);
	const [question, setQuestion] = useState("");
	const [sending, setSending] = useState(false);
	const [error, setError] = useState("");
	const [quickOpen, setQuickOpen] = useState(false);
	const inputRef = useRef(null);
	const ask = async (rawQuestion) => {
		const cleanQuestion = String(rawQuestion).trim();
		if (!cleanQuestion || sending || !sessionAvailable) return;
		setSending(true);
		setError("");
		setQuestion("");
		setMessages((current) => [...current, {
			role: "user",
			text: cleanQuestion
		}]);
		try {
			const response = await fetch("/support/chat", {
				method: "POST",
				credentials: "same-origin",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"X-Requested-With": "XMLHttpRequest",
					"X-CSRF-TOKEN": csrfToken()
				},
				body: JSON.stringify({ question: cleanQuestion })
			});
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.message || "The support assistant could not answer right now.");
			setMessages((current) => [...current, {
				role: "assistant",
				text: payload.answer,
				needsContact: Boolean(payload.needsContact)
			}]);
		} catch (caught) {
			setError(caught.message || "The support assistant could not answer right now.");
		} finally {
			setSending(false);
		}
	};
	const submit = (event) => {
		event.preventDefault();
		ask(question);
	};
	const answerCommonQuestion = (entry) => {
		if (sending || !sessionAvailable) return;
		setError("");
		setMessages((current) => [
			...current,
			{
				role: "user",
				text: entry.question
			},
			{
				role: "assistant",
				text: entry.answer,
				needsContact: entry.question.includes("contact")
			}
		]);
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Seo, {
		title: "Product Support | Brand Beacon",
		description: "Get help using Brand Beacon's search, video analysis, bookmarks, and plans.",
		noIndex: true
	}), /* @__PURE__ */ jsxs("div", {
		className: "bbh support-page",
		children: [
			/* @__PURE__ */ jsx(Nav, { homeHref: "/" }),
			/* @__PURE__ */ jsxs("main", {
				className: "support-main wrap",
				children: [/* @__PURE__ */ jsxs("section", {
					className: "support-hero",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "support-hero__mark",
							children: /* @__PURE__ */ jsx(Comment, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ jsx("p", {
							className: "eyebrow",
							children: "Brand Beacon support"
						}),
						/* @__PURE__ */ jsx("h1", { children: "Quick answers for getting the most out of Brand Beacon." }),
						/* @__PURE__ */ jsx("p", { children: "Ask about searches, video analysis, bookmarks, plans, or how to use the product. This chat is not saved." })
					]
				}), sessionAvailable ? /* @__PURE__ */ jsxs("section", {
					className: "support-chat",
					"aria-label": "Beacon support assistant",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "support-chat__head",
							children: /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("i", {}), " Beacon"] })
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "support-chat__body",
							"aria-live": "polite",
							children: [
								messages.length === 0 && /* @__PURE__ */ jsxs("div", {
									className: "support-welcome",
									children: [/* @__PURE__ */ jsx("b", { children: "Hi, I'm Beacon. What can I help with?" }), /* @__PURE__ */ jsx("p", { children: "Choose a common question for an instant answer, or ask your own below." })]
								}),
								messages.map((message, index) => /* @__PURE__ */ jsxs("div", {
									className: `support-message support-message--${message.role}`,
									children: [/* @__PURE__ */ jsx("p", { children: message.text }), message.needsContact && /* @__PURE__ */ jsxs(Link, {
										href: "/contact",
										children: ["Contact the Brand Beacon team ", /* @__PURE__ */ jsx(Arrow, { className: "h-3.5 w-3.5" })]
									})]
								}, `${message.role}-${index}`)),
								sending && /* @__PURE__ */ jsxs("div", {
									className: "support-message support-message--assistant support-message--loading",
									children: [
										/* @__PURE__ */ jsx("span", {}),
										/* @__PURE__ */ jsx("span", {}),
										/* @__PURE__ */ jsx("span", {})
									]
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "support-quick-wrap",
							children: [/* @__PURE__ */ jsxs("button", {
								type: "button",
								className: "support-quick__toggle",
								"aria-expanded": quickOpen,
								"aria-controls": "support-quick-list",
								onClick: () => setQuickOpen((open) => !open),
								children: ["Common questions", /* @__PURE__ */ jsx(Chevron, { className: "h-4 w-4" })]
							}), /* @__PURE__ */ jsx("div", {
								id: "support-quick-list",
								className: `support-quick${quickOpen ? "" : " support-quick--collapsed"}`,
								"aria-label": "Common support questions",
								children: commonQuestions.map((entry) => /* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => answerCommonQuestion(entry),
									disabled: sending,
									children: entry.question
								}, entry.question))
							})]
						}),
						/* @__PURE__ */ jsxs("form", {
							className: "support-chat__form",
							onSubmit: submit,
							children: [
								/* @__PURE__ */ jsx("label", {
									className: "sr-only",
									htmlFor: "support-question",
									children: "Ask a product question"
								}),
								/* @__PURE__ */ jsx("input", {
									ref: inputRef,
									id: "support-question",
									maxLength: 600,
									value: question,
									onChange: (event) => setQuestion(event.target.value),
									placeholder: "Ask a product question...",
									disabled: sending
								}),
								/* @__PURE__ */ jsxs("button", {
									type: "submit",
									className: "btn btn--primary",
									disabled: sending || question.trim().length < 2,
									children: ["Send ", /* @__PURE__ */ jsx(Arrow, { className: "h-3.5 w-3.5" })]
								})
							]
						}),
						error && /* @__PURE__ */ jsxs("p", {
							className: "support-error",
							role: "status",
							children: [
								error,
								" ",
								/* @__PURE__ */ jsx(Link, {
									href: "/contact",
									children: "Contact us instead."
								})
							]
						})
					]
				}) : /* @__PURE__ */ jsxs("section", {
					className: "support-limit",
					role: "status",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "eyebrow",
							children: "Please pause a moment"
						}),
						/* @__PURE__ */ jsx("h2", { children: "Support chat opens twice per minute." }),
						/* @__PURE__ */ jsxs("p", { children: [
							"Try again in about ",
							Math.max(1, Math.ceil(retryAfter / 60)),
							" minute",
							retryAfter > 60 ? "s" : "",
							", or contact the Brand Beacon team now."
						] }),
						/* @__PURE__ */ jsxs(Link, {
							href: "/contact",
							className: "btn btn--primary",
							children: ["Contact us ", /* @__PURE__ */ jsx(Arrow, { className: "h-3.5 w-3.5" })]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(Footer, { homeHref: "/" })
		]
	})] });
}
//#endregion
//#region resources/js/Pages/TermsOfService.jsx
var TermsOfService_exports = /* @__PURE__ */ __exportAll({ default: () => TermsOfService });
var sections = [
	{
		heading: "1. Acceptance of These Terms",
		paragraphs: ["These Terms of Service govern your access to and use of Brand Beacon, including our website, applications, search workflows, analytics tools, subscriptions, and related services. By using Brand Beacon, you agree to these Terms.", "If you are using Brand Beacon on behalf of a company or other organization, you represent that you have authority to bind that organization to these Terms."]
	},
	{
		heading: "2. Eligibility and Accounts",
		paragraphs: ["You must provide accurate account information and keep your login credentials secure. You are responsible for activity that occurs under your account and for promptly notifying us of any unauthorized use.", "We may suspend or terminate accounts that violate these Terms, create risk for Brand Beacon or others, or are used in a fraudulent, abusive, or unlawful manner."]
	},
	{
		heading: "3. The Service",
		paragraphs: ["Brand Beacon helps users discover, monitor, and analyze short-form video trends, related search results, and associated performance signals. Features may change over time, and some features may depend on third-party platforms or service providers.", "We may add, modify, limit, or discontinue features at any time. We do not guarantee uninterrupted availability of every feature or data source."]
	},
	{
		heading: "4. Subscriptions, Trials, and Billing",
		paragraphs: [
			"Paid features may require a subscription, trial enrollment, or other fee-based access. By purchasing a plan, you authorize us and our billing providers to charge the applicable fees, taxes, and renewal amounts using your selected payment method.",
			"Unless otherwise stated, subscriptions renew automatically until canceled. Trial eligibility, feature limits, usage caps, and pricing are determined by the plan presented at the time of purchase.",
			"You are responsible for reviewing plan details before purchase. Except where required by law, fees are non-refundable once charged."
		]
	},
	{
		heading: "5. Acceptable Use",
		paragraphs: ["You may not use Brand Beacon to violate law, infringe others’ rights, attempt unauthorized access, interfere with the service, reverse engineer protected parts of the product except where prohibited by law, or use automated means to extract or republish the service in a way that competes with, harms, or overloads Brand Beacon.", "You may not use the service to store or transmit malicious code, evade plan limits, resell access without permission, or misuse third-party data surfaced through the product."]
	},
	{
		heading: "6. Customer Content and Inputs",
		paragraphs: ["You retain rights in the content and inputs you submit to the service, such as searches, keywords, account information, and support communications. You grant Brand Beacon a non-exclusive right to host, process, transmit, and use that information as needed to operate and improve the service.", "You are responsible for ensuring that your inputs and use of the service comply with applicable law and do not violate third-party rights."]
	},
	{
		heading: "7. Data Sources and Results",
		paragraphs: ["Brand Beacon may rely on third-party platforms, infrastructure providers, and data-processing services. Search results, analytics, rankings, media availability, and other outputs may vary over time and may be incomplete, delayed, removed, or unavailable.", "You understand that outputs are provided for business insight and workflow support, not as legal, financial, or professional advice."]
	},
	{
		heading: "8. Intellectual Property",
		paragraphs: ["Brand Beacon and its related software, design, content, trademarks, and service materials are owned by us or our licensors and are protected by law. Except for the limited right to use the service under these Terms, no rights are granted to you."]
	},
	{
		heading: "9. Termination",
		paragraphs: ["You may stop using the service at any time. We may suspend or terminate your access if you violate these Terms, create legal or operational risk, fail to pay applicable fees, or if we discontinue the service.", "Sections that by their nature should survive termination will survive, including provisions on payment obligations, intellectual property, disclaimers, limitation of liability, indemnity, and dispute-related terms."]
	},
	{
		heading: "10. Disclaimers",
		paragraphs: ["Brand Beacon is provided on an “as is” and “as available” basis. To the fullest extent permitted by law, we disclaim warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, title, and non-infringement."]
	},
	{
		heading: "11. Limitation of Liability",
		paragraphs: ["To the fullest extent permitted by law, Brand Beacon and its affiliates, officers, employees, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, revenues, goodwill, data, or business opportunities arising from or related to the service.", "To the fullest extent permitted by law, our total liability for claims arising out of or relating to Brand Beacon will not exceed the amount you paid us for the service during the 12 months before the event giving rise to the claim, or one hundred U.S. dollars if you have not made any payments."]
	},
	{
		heading: "12. Indemnity",
		paragraphs: ["You agree to defend, indemnify, and hold harmless Brand Beacon and its affiliates, officers, employees, and agents from and against claims, liabilities, damages, losses, and expenses arising out of or related to your use of the service, your content or inputs, or your violation of these Terms or applicable law."]
	},
	{
		heading: "13. Changes to These Terms",
		paragraphs: ["We may update these Terms from time to time. If we make material changes, we will post the updated Terms and may provide additional notice through the service or by email. Your continued use of Brand Beacon after the updated Terms take effect means you accept the revised Terms."]
	},
	{
		heading: "14. Contact",
		paragraphs: ["Questions about these Terms may be sent to hello@brandbeacon.com."]
	}
];
function TermsOfService() {
	return /* @__PURE__ */ jsx(LegalPage, {
		title: "Terms of Service",
		effectiveDate: "August 29, 2026",
		sections
	});
}
//#endregion
//#region resources/js/landing/flow/screens/TrialScreen.jsx
function TrialScreen({ onBack, backLabel = "Back to results" }) {
	const { pricingPlans = [], auth = {} } = usePage().props;
	const [billingCycle, setBillingCycle] = useState("monthly");
	const plans = (pricingPlans.length > 0 ? [...pricingPlans] : [...PRICING.monthly, ...PRICING.annual]).sort((a, b) => {
		const aKey = a.slug ?? a.name?.toLowerCase();
		const bKey = b.slug ?? b.name?.toLowerCase();
		const aIndex = PRICING_PLAN_ORDER.indexOf(aKey);
		const bIndex = PRICING_PLAN_ORDER.indexOf(bKey);
		return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
	});
	const tiers = plans.filter((t) => t.price > 0 && (t.duration ?? "monthly") === billingCycle);
	const trialTier = tiers.find((t) => t.popular) || tiers[0];
	const annualBanner = useMemo(() => {
		const percents = plans.filter((plan) => plan.price > 0 && (plan.duration ?? "monthly") === "annual").map((plan) => Number(plan.annualSavingsPercent ?? 0)).filter((value) => value > 0);
		return percents.length > 0 ? Math.max(...percents) : 0;
	}, [plans]);
	const startCheckout = (slug, cycle = billingCycle) => {
		if (!auth.signedIn) {
			window.location.assign(`/login?redirect=trial_checkout&plan=${encodeURIComponent(slug)}&trial=1&cycle=${encodeURIComponent(cycle)}`);
			return;
		}
		billing.trialCheckout(slug, cycle);
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
					children: "Start on an 8-day trial. Growth includes 100 searches, 100 viral breakout video analyses, weekly + monthly scheduling, virality alerts, and unlimited bookmarks. Scale lifts those limits with unlimited searches and unlimited viral breakout video analysis."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "toggle mx-auto mt-6",
					children: [/* @__PURE__ */ jsx("button", {
						className: billingCycle === "monthly" ? "is-on" : "",
						type: "button",
						onClick: () => setBillingCycle("monthly"),
						children: "Monthly"
					}), /* @__PURE__ */ jsxs("button", {
						className: billingCycle === "annual" ? "is-on" : "",
						type: "button",
						onClick: () => setBillingCycle("annual"),
						children: ["Annual", annualBanner > 0 ? ` · save up to ${annualBanner}%` : ""]
					})]
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
								children: [displayedMonthlyRate(t), /* @__PURE__ */ jsx("span", {
									className: "ml-1 text-[13px] font-medium tracking-normal faint",
									children: "/mo"
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 min-h-[32px] text-[11.5px] leading-[1.35] faint",
								children: billingCycle === "annual" ? annualBillingNote(t) : "$0 for 8 days"
							}),
							/* @__PURE__ */ jsxs("p", {
								className: "mt-4 text-[12px] faint",
								children: [
									t.searchCreditsLimit === -1 ? "Unlimited" : t.searchCreditsLimit,
									" searches",
									" · ",
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
										children: /* @__PURE__ */ jsx(Check$1, { className: "h-2.5 w-2.5" })
									}), f]
								}, f))
							}),
							/* @__PURE__ */ jsxs("button", {
								onClick: () => startCheckout(t.slug, billingCycle),
								className: `mt-6 h-11 w-full text-sm ${t.popular ? "btn-accent" : "btn-ghost"}`,
								children: ["Try free for 8 days ", /* @__PURE__ */ jsx(Arrow, {})]
							})
						]
					}, t.name))
				}),
				/* @__PURE__ */ jsxs("button", {
					onClick: () => startCheckout(trialTier.slug, billingCycle),
					className: "btn-accent mx-auto mt-9 h-[52px] px-8 text-[15px]",
					children: ["Try free for 8 days ", /* @__PURE__ */ jsx(Arrow, {})]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-4 text-xs faint",
					children: "Card details are collected up front, and billing starts after 8 days unless you cancel."
				})
			]
		})]
	});
}
//#endregion
//#region resources/js/Pages/Trial.jsx
var Trial_exports = /* @__PURE__ */ __exportAll({ default: () => Trial });
function Trial() {
	const { billing: billing$1 = {} } = usePage().props;
	const [trialPromptOpen, setTrialPromptOpen] = useState(Boolean(billing$1.hasUsedTrial) && !billing$1.hasPaidPlan);
	const canOfferTrial = billing$1.trialEligible ?? true;
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Seo, {
		title: "Start Your 8-Day Trial | Brand Beacon",
		description: "Start an 8-day Brand Beacon trial to track TikTok trends and brand mentions.",
		noIndex: true
	}), /* @__PURE__ */ jsx(AppLayout, {
		pill: {
			text: "Trial",
			tone: "accent"
		},
		width: "max-w-4xl",
		children: canOfferTrial ? /* @__PURE__ */ jsx(TrialScreen, {
			backLabel: "Back to home",
			onBack: () => router.visit("/")
		}) : /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
			className: "surface p-8 text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "font-display text-[28px] font-bold tracking-[-.03em]",
					children: "Trial unavailable"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 text-[14px] muted",
					children: "This account already used its 8-day trial, so the next step is a paid upgrade."
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: () => router.visit("/plans"),
					className: "btn-accent mx-auto mt-6 h-11 px-5 text-[13px]",
					children: "View plans"
				})
			]
		}), /* @__PURE__ */ jsx(UpgradePromptModal, {
			open: trialPromptOpen,
			eyebrow: "Trial already used",
			title: "Your 8-day trial has already been used",
			body: "This account already finished its free trial, so the next step is a paid upgrade.",
			detail: "Upgrade to Growth to turn scheduled tracking, bookmarks, and analysis back on.",
			primaryLabel: "Upgrade to Growth",
			onPrimary: () => billing.checkout("growth"),
			secondaryLabel: "Maybe later",
			onSecondary: () => setTrialPromptOpen(false),
			onClose: () => setTrialPromptOpen(false)
		})] })
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
	window.location.assign("/home");
}
function Show({ video, analysis: initialAnalysis, tabs }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(Head, { title: `Video Analysis · ${video.handle ?? video.creator_name ?? "TikTok"}` }), /* @__PURE__ */ jsx(AppLayout, {
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
//#region resources/js/Pages/components/SearchLauncher.jsx
var SearchLauncher_exports = /* @__PURE__ */ __exportAll({ default: () => SearchLauncher });
/**
* Step one of the search flow — pick a subject.
*
* Redesigned to match the flat "Brand Beacon — Start a search" mockup:
*   - a segmented mode pill (Your brand / A product) with a
*     yellow sliding indicator behind the active tab,
*   - one unified pill-shaped search bar with the Continue button inline,
*   - a "Popular" row of fill-in chips that only *populate* the input
*     (they never fire a search — a search costs a credit).
*/
var TYPES = [{
	key: "brand",
	label: "Brand",
	icon: Store,
	placeholder: "Enter your brand name…",
	sample: "rhode skin",
	suggestions: [
		"rhode skin",
		"skims",
		"lip oil"
	]
}, {
	key: "product",
	label: "A product",
	icon: Search,
	placeholder: "Enter a product to track…",
	sample: "lip oil",
	suggestions: [
		"lip oil",
		"hair oil",
		"sunscreen stick"
	]
}];
function SearchLauncher({ initialType = "brand", initialQuery = "", onSubmit, suggestionsByType = {}, showProgress = true }) {
	const [type, setType] = useState(initialType);
	const [value, setValue] = useState(initialQuery);
	const [liveSuggestions, setLiveSuggestions] = useState([]);
	const [activeSuggestion, setActiveSuggestion] = useState(-1);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef(null);
	const fieldRef = useRef(null);
	const segRef = useRef(null);
	const [indStyle, setIndStyle] = useState({
		width: 0,
		transform: "translateX(0px)"
	});
	const baseConfig = TYPES.find((t) => t.key === type) ?? TYPES[0];
	const dynamic = (suggestionsByType?.[type] ?? []).map((s) => typeof s === "string" ? s : s?.name).filter(Boolean).slice(0, 3);
	const chips = dynamic.length > 0 ? dynamic : baseConfig.suggestions;
	const query = value.trim().replace(/\s+/g, " ");
	useEffect(() => {
		const controller = new AbortController();
		const term = value.trim();
		fetchKeywordSuggestions(type, term, { signal: controller.signal }).then((payload) => {
			setLiveSuggestions(Array.isArray(payload?.suggestions) ? payload.suggestions : []);
			setActiveSuggestion(-1);
		}).catch(() => {});
		return () => controller.abort();
	}, [type, value]);
	useEffect(() => {
		const close = (event) => {
			if (!fieldRef.current?.contains(event.target)) {
				setShowSuggestions(false);
				setActiveSuggestion(-1);
			}
		};
		document.addEventListener("mousedown", close);
		return () => document.removeEventListener("mousedown", close);
	}, []);
	useEffect(() => {
		const seg = segRef.current;
		if (!seg) return void 0;
		const place = () => {
			const btn = seg.querySelector(`[data-mode="${type}"]`);
			if (!btn) return;
			setIndStyle({
				width: `${btn.offsetWidth}px`,
				transform: `translateX(${btn.offsetLeft - 4}px)`
			});
		};
		place();
		window.addEventListener("resize", place);
		if (document.fonts?.ready) document.fonts.ready.then(place).catch(() => {});
		return () => window.removeEventListener("resize", place);
	}, [type]);
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
	const visibleSuggestions = liveSuggestions.filter((suggestion) => suggestion.label?.trim());
	const applySuggestion = (label) => {
		setValue(label);
		setShowSuggestions(false);
		setActiveSuggestion(-1);
		window.requestAnimationFrame(() => inputRef.current?.focus());
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "hero",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "hero__head",
				children: [/* @__PURE__ */ jsx("h2", { children: "What do you want to scan?" }), showProgress && /* @__PURE__ */ jsxs("div", {
					className: "prog",
					children: [
						/* @__PURE__ */ jsxs("span", {
							className: "seg3",
							children: [
								/* @__PURE__ */ jsx("span", { className: "on" }),
								/* @__PURE__ */ jsx("span", {}),
								/* @__PURE__ */ jsx("span", {})
							]
						}),
						" ",
						/* @__PURE__ */ jsx("b", { children: "Step 1" }),
						"\xA0of 3",
						/* @__PURE__ */ jsx("span", {
							className: "prog__detail",
							children: " · Subject"
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "seg",
				ref: segRef,
				role: "tablist",
				"aria-label": "What to research",
				children: [/* @__PURE__ */ jsx("span", {
					className: "seg__ind",
					style: indStyle,
					"aria-hidden": true
				}), TYPES.map((option) => {
					const Icon = option.icon;
					const active = option.key === type;
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						role: "tab",
						"aria-selected": active,
						"data-mode": option.key,
						onClick: () => setType(option.key),
						className: "seg__b",
						children: [/* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }), option.label]
					}, option.key);
				})]
			}),
			/* @__PURE__ */ jsxs("form", {
				className: "bar",
				onSubmit: submit,
				ref: fieldRef,
				children: [
					/* @__PURE__ */ jsxs("svg", {
						className: "bar__q",
						viewBox: "0 0 24 24",
						fill: "none",
						stroke: "currentColor",
						strokeWidth: "2",
						strokeLinecap: "round",
						children: [/* @__PURE__ */ jsx("circle", {
							cx: "11",
							cy: "11",
							r: "7"
						}), /* @__PURE__ */ jsx("path", { d: "m20 20-3.5-3.5" })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "bar__field",
						children: [/* @__PURE__ */ jsx("input", {
							ref: inputRef,
							id: "dashboard-search-subject",
							type: "text",
							autoComplete: "off",
							value,
							onChange: (e) => {
								setValue(e.target.value);
								setShowSuggestions(true);
							},
							onFocus: () => setShowSuggestions(true),
							onKeyDown: (event) => {
								if (!visibleSuggestions.length) return;
								if (event.key === "ArrowDown") {
									event.preventDefault();
									setShowSuggestions(true);
									setActiveSuggestion((current) => (current + 1) % visibleSuggestions.length);
								}
								if (event.key === "ArrowUp") {
									event.preventDefault();
									setShowSuggestions(true);
									setActiveSuggestion((current) => current <= 0 ? visibleSuggestions.length - 1 : current - 1);
								}
								if (event.key === "Enter" && activeSuggestion >= 0 && visibleSuggestions[activeSuggestion]) {
									event.preventDefault();
									applySuggestion(visibleSuggestions[activeSuggestion].label);
								}
								if (event.key === "Escape") {
									setShowSuggestions(false);
									setActiveSuggestion(-1);
								}
							},
							placeholder: baseConfig.placeholder,
							"aria-label": baseConfig.placeholder,
							"aria-expanded": showSuggestions && visibleSuggestions.length > 0,
							"aria-haspopup": "listbox"
						}), showSuggestions && visibleSuggestions.length > 0 && /* @__PURE__ */ jsxs("div", {
							className: "hero-suggest",
							role: "listbox",
							"aria-label": `${type} suggestions`,
							children: [/* @__PURE__ */ jsxs("div", {
								className: "hero-suggest__head",
								children: [/* @__PURE__ */ jsxs("span", { children: ["Suggested ", type === "brand" ? "brands" : "products"] }), /* @__PURE__ */ jsx("span", { children: visibleSuggestions.length })]
							}), /* @__PURE__ */ jsx("div", {
								className: "hero-suggest__list",
								children: visibleSuggestions.map((suggestion, index) => /* @__PURE__ */ jsx("button", {
									type: "button",
									className: `hero-suggest__item${index === activeSuggestion ? " is-active" : ""}`,
									onMouseEnter: () => setActiveSuggestion(index),
									onMouseDown: (event) => event.preventDefault(),
									onClick: () => applySuggestion(suggestion.label),
									children: /* @__PURE__ */ jsxs("span", {
										className: "hero-suggest__text",
										children: [/* @__PURE__ */ jsx("strong", { children: suggestion.label }), suggestion.sector && /* @__PURE__ */ jsx("em", { children: suggestion.sector })]
									})
								}, `${suggestion.type}-${suggestion.id}`))
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "submit",
						className: "btn btn--y",
						disabled: !query,
						children: ["Continue", /* @__PURE__ */ jsx("span", {
							className: "btn__a",
							children: /* @__PURE__ */ jsx(Arrow, {})
						})]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "hero__foot",
				children: [/* @__PURE__ */ jsx("span", {
					className: "hero__hint",
					children: "One subject per search keeps every result tight."
				}), /* @__PURE__ */ jsxs("div", {
					className: "pop",
					children: [/* @__PURE__ */ jsx("span", {
						className: "pop__l",
						children: "Popular"
					}), chips.map((chip) => /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "chip",
						onClick: () => {
							setValue(chip);
							inputRef.current?.focus();
						},
						children: chip
					}, chip))]
				})]
			})
		]
	});
}
//#endregion
//#region resources/js/ssr.jsx
createServer((page) => createInertiaApp({
	page,
	render: renderToString,
	resolve: (name) => {
		return (/* @__PURE__ */ Object.assign({
			"./Pages/Admin/ActivityLog.jsx": ActivityLog_exports,
			"./Pages/Admin/Blogs/Articles.jsx": Articles_exports,
			"./Pages/Admin/Blogs/Editor.jsx": Editor_exports,
			"./Pages/Admin/Blogs/Featured.jsx": Featured_exports,
			"./Pages/Admin/Blogs/Taxonomy.jsx": Taxonomy_exports,
			"./Pages/Admin/Blogs/shared.jsx": shared_exports,
			"./Pages/Admin/CriticalErrors.jsx": CriticalErrors_exports,
			"./Pages/Admin/Dashboard.jsx": Dashboard_exports,
			"./Pages/Admin/Listing.jsx": Listing_exports,
			"./Pages/Admin/Login.jsx": Login_exports$1,
			"./Pages/Admin/components/AcquisitionTable.jsx": AcquisitionTable_exports,
			"./Pages/Admin/components/AdminLayout.jsx": AdminLayout_exports,
			"./Pages/Auth/Login.jsx": Login_exports,
			"./Pages/Auth/Register.jsx": Register_exports,
			"./Pages/Blog/Index.jsx": Index_exports$1,
			"./Pages/Blog/Show.jsx": Show_exports$2,
			"./Pages/Blog/components.jsx": components_exports,
			"./Pages/Brands.jsx": Brands_exports,
			"./Pages/ComingSoon.jsx": ComingSoon_exports,
			"./Pages/Contact.jsx": Contact_exports,
			"./Pages/DataProcessingAddendum.jsx": DataProcessingAddendum_exports,
			"./Pages/Errors/NotFound.jsx": NotFound_exports,
			"./Pages/Feed.jsx": Feed_exports,
			"./Pages/Home.jsx": Home_exports,
			"./Pages/Landing.jsx": Landing_exports,
			"./Pages/LandingContact.jsx": LandingContact_exports,
			"./Pages/LandingSolution.jsx": LandingSolution_exports,
			"./Pages/LegalPage.jsx": LegalPage_exports,
			"./Pages/Plans.jsx": Plans_exports,
			"./Pages/PrivacyPolicy.jsx": PrivacyPolicy_exports,
			"./Pages/Products.jsx": Products_exports,
			"./Pages/SavedSearches/Index.jsx": Index_exports,
			"./Pages/SavedSearches/Show.jsx": Show_exports$1,
			"./Pages/SavedSearches/detail/Badges.jsx": Badges_exports,
			"./Pages/SavedSearches/detail/DetailScreen.jsx": DetailScreen_exports,
			"./Pages/SavedSearches/detail/InsightPanels.jsx": InsightPanels_exports,
			"./Pages/SavedSearches/detail/OutlierVideos.jsx": OutlierVideos_exports,
			"./Pages/SavedSearches/detail/TrendPanels.jsx": TrendPanels_exports,
			"./Pages/Search/Free.jsx": Free_exports,
			"./Pages/Search/Running.jsx": Running_exports,
			"./Pages/SecurityPage.jsx": SecurityPage_exports,
			"./Pages/Settings/Account.jsx": Account_exports,
			"./Pages/Settings/Appearance.jsx": Appearance_exports,
			"./Pages/Settings/Receipt.jsx": Receipt_exports,
			"./Pages/Settings/SettingsShell.jsx": SettingsShell_exports,
			"./Pages/Settings/Subscription.jsx": Subscription_exports,
			"./Pages/Support.jsx": Support_exports,
			"./Pages/TermsOfService.jsx": TermsOfService_exports,
			"./Pages/Trial.jsx": Trial_exports,
			"./Pages/VideoAnalysis/AnalysisModal.jsx": AnalysisModal_exports,
			"./Pages/VideoAnalysis/Show.jsx": Show_exports,
			"./Pages/components/AppFooter.jsx": AppFooter_exports,
			"./Pages/components/AppLayout.jsx": AppLayout_exports,
			"./Pages/components/BrandInlineFlow.jsx": BrandInlineFlow_exports,
			"./Pages/components/BreakoutVideoCard.jsx": BreakoutVideoCard_exports,
			"./Pages/components/DuplicateSearchModal.jsx": DuplicateSearchModal_exports,
			"./Pages/components/EntitlementsBar.jsx": EntitlementsBar_exports,
			"./Pages/components/MyFeed.jsx": MyFeed_exports,
			"./Pages/components/SavedSearchRow.jsx": SavedSearchRow_exports,
			"./Pages/components/SearchCreditConfirmModal.jsx": SearchCreditConfirmModal_exports,
			"./Pages/components/SearchFlashModals.jsx": SearchFlashModals_exports,
			"./Pages/components/SearchHistoryTab.jsx": SearchHistoryTab_exports,
			"./Pages/components/SearchLauncher.jsx": SearchLauncher_exports,
			"./Pages/components/SearchListScreen.jsx": SearchListScreen_exports,
			"./Pages/components/UpgradePromptModal.jsx": UpgradePromptModal_exports,
			"./Pages/components/VideoAnalysisGate.jsx": VideoAnalysisGate_exports
		}))[`./Pages/${name}.jsx`];
	},
	setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
}));
//#endregion
export {};
