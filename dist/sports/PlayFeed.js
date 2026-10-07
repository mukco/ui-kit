import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { cn } from "../cn";
import { Tabs } from "../primitives/Tabs";
import { SegmentedControl } from "../primitives/SegmentedControl";
import { TeamIcon } from "./TeamIcon";
const GAME = "__game";
export function PlayFeed({ plays, periods, newestFirst, defaultAll, className }) {
    const [period, setPeriod] = useState(GAME);
    const [mode, setMode] = useState(defaultAll ? "all" : "scoring");
    const anyScoring = plays.some((p) => p.scoring);
    const effectiveMode = anyScoring ? mode : "all";
    const shown = useMemo(() => {
        const rows = plays.filter((p) => (period === GAME || String(p.period) === period) && (effectiveMode === "all" || p.scoring));
        return newestFirst ? [...rows].reverse() : rows;
    }, [plays, period, effectiveMode, newestFirst]);
    if (plays.length === 0)
        return null;
    const present = new Set(plays.map((p) => String(p.period)));
    const tabs = [{ id: GAME, label: "Game" }, ...periods.filter((p) => present.has(String(p.key))).map((p) => ({ id: String(p.key), label: p.label }))];
    return (_jsxs("div", { className: cn("ui-playfeed", className), children: [_jsxs("div", { className: "ui-playfeed-controls", children: [_jsx(Tabs, { tabs: tabs, active: period, onChange: setPeriod }), anyScoring && (_jsx(SegmentedControl, { options: [{ id: "scoring", label: "Scoring" }, { id: "all", label: "All" }], active: mode, onChange: setMode }))] }), shown.length === 0 ? (_jsxs("p", { className: "ui-playfeed-empty", children: ["No ", effectiveMode === "scoring" ? "scoring plays" : "plays", " in this period."] })) : (_jsx("ol", { className: "ui-playfeed-list", children: shown.map((p) => (_jsxs("li", { className: cn("ui-playfeed-play", p.scoring && "ui-playfeed-play--scoring"), children: [_jsx("span", { className: "ui-playfeed-when", children: p.when }), _jsx("span", { className: "ui-playfeed-team", children: (p.teamId != null || p.teamName) && _jsx(TeamIcon, { teamId: p.teamId, name: p.teamName, size: 18 }) }), _jsx("span", { className: "ui-playfeed-head", children: p.head }), _jsx("span", { className: "ui-playfeed-score", children: p.score ? `${p.score.away}–${p.score.home}` : "" }), _jsxs("span", { className: "ui-playfeed-text", children: [p.text, p.flags && _jsxs(_Fragment, { children: [" ", p.flags] })] })] }, p.id))) }))] }));
}
/** A small mark for a play's head or flags: "TD +6", "2 RBI", "TO". */
export function PlayTag({ children, tone }) {
    return _jsx("span", { className: cn("ui-playtag", tone && `ui-playtag--${tone}`), children: children });
}
