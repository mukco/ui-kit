import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "../cn";
/**
 * Dense label/value pairs — what a thing *is*, as against how it is doing.
 *
 * Exists because the alternative keeps happening: the same facts get joined
 * with commas into a sentence, which reads as prose, cannot be scanned, and
 * gives the eye nowhere to land. A grid gives every value the same starting
 * column, so "which image is this on" is answered by looking rather than
 * reading.
 */
export function FactGrid({ facts, className }) {
    const shown = facts.filter((f) => f.value != null && f.value !== "");
    if (shown.length === 0)
        return null;
    return (_jsx("dl", { className: cn("ui-facts", className), children: shown.map((fact) => (_jsxs("div", { className: "ui-facts-row", children: [_jsx("dt", { children: fact.label }), _jsx("dd", { className: cn(fact.mono && "ui-facts-mono"), children: fact.value })] }, fact.label))) }));
}
