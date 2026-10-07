import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { cn } from "../cn";
const AWARDS_PREVIEW = 6;
const yy = (s) => `’${String(s).slice(-2)}`;
function Face({ image, imageKind, initials }) {
    const [broken, setBroken] = useState(false);
    const cls = cn("ui-profilehero-face", imageKind === "logo" && "ui-profilehero-face--logo");
    if (!image || broken)
        return _jsx("span", { className: cn(cls, "ui-profilehero-face--initials"), "aria-hidden": "true", children: initials });
    return _jsx("img", { className: cls, src: image, alt: "", onError: () => setBroken(true) });
}
function Awards({ awards }) {
    const [all, setAll] = useState(false);
    const hidden = Math.max(0, awards.length - AWARDS_PREVIEW);
    return (_jsxs("div", { className: "ui-profilehero-chips", children: [awards.map((a, i) => (_jsxs("span", { className: cn("ui-profilehero-award", !all && i >= AWARDS_PREVIEW && "ui-profilehero-award--more"), title: a.seasons.join(", "), children: [a.name, (a.count ?? a.seasons.length) > 1 && _jsxs("span", { className: "ui-profilehero-award-count", children: ["\u00D7", a.count ?? a.seasons.length] }), a.seasons.length > 0 && _jsx("span", { className: "ui-profilehero-award-years", children: a.seasons.map(yy).join(" ") })] }, a.name))), hidden > 0 && (_jsx("button", { type: "button", className: "ui-profilehero-awards-toggle", onClick: () => setAll((v) => !v), children: all ? "Show fewer" : `+${hidden} more` }))] }));
}
export function ProfileHero({ name, image, imageKind = "photo", initials, nameAside, line, status, actions, wideActions, facts, links, awards, art, accent, children, className }) {
    const shownFacts = (facts ?? []).filter((f) => f.value != null && f.value !== "");
    const detail = shownFacts.length > 0 || (links?.length ?? 0) > 0 || (awards?.length ?? 0) > 0;
    return (_jsxs("div", { className: cn("ui-card ui-profilehero", wideActions && "ui-profilehero--wideactions", className), children: [art && (_jsxs(_Fragment, { children: [_jsx("div", { "aria-hidden": "true", className: "ui-profilehero-art", style: { backgroundImage: `url(${art})` } }), _jsx("div", { "aria-hidden": "true", className: "ui-matchup-scrim" })] })), _jsx("div", { className: "ui-profilehero-bar", "aria-hidden": "true", style: accent ? { background: accent } : undefined }), _jsxs("div", { className: "ui-profilehero-body", children: [_jsx(Face, { image: image, imageKind: imageKind, initials: initials }), _jsxs("div", { className: "ui-profilehero-top", children: [_jsxs("h1", { className: "ui-profilehero-name", children: [name, nameAside && _jsx("span", { className: "ui-profilehero-aside", children: nameAside })] }), line && _jsx("div", { className: "ui-profilehero-line", children: line })] }), status && _jsx("div", { className: "ui-profilehero-status", children: status }), actions && _jsx("div", { className: "ui-profilehero-actions", children: actions }), detail && (_jsxs("div", { className: "ui-profilehero-detail", children: [shownFacts.length > 0 && (_jsx("div", { className: "ui-profilehero-chips", children: shownFacts.map((f) => _jsxs("span", { className: "ui-profilehero-fact", children: [_jsx("span", { className: "ui-profilehero-fact-k", children: f.label }), " ", f.value] }, f.label)) })), links && links.length > 0 && (_jsx("div", { className: "ui-profilehero-chips", children: links.map((l) => _jsxs("a", { className: "ui-profilehero-link", href: l.href, target: "_blank", rel: "noopener noreferrer", children: [l.label, " \u2197"] }, l.label)) })), awards && awards.length > 0 && _jsx(Awards, { awards: awards })] }))] }), children != null && _jsx("div", { className: "ui-profilehero-extra", children: children })] }));
}
