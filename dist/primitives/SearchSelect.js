import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { cn } from "../cn";
/**
 * Generic search-and-pick combobox: debounced async results in a dropdown,
 * selected value shown as a chip with a clear button. Bring your own search
 * endpoint; the kit owns none.
 */
export function SearchSelect({ value, onChange, fetcher, getLabel, getHint, renderLeading, placeholder = "Search…", className }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const rootRef = useRef(null);
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        setBusy(true);
        const t = setTimeout(() => {
            fetcher(query.trim())
                .then(setResults)
                .catch(() => setResults([]))
                .finally(() => setBusy(false));
        }, 250);
        return () => clearTimeout(t);
    }, [query, fetcher]);
    useEffect(() => {
        const onDown = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);
    if (value != null) {
        return (_jsxs("div", { className: cn("ui-search-chip", className), children: [renderLeading?.(value), _jsx("span", { className: "ui-search-chip-label", children: getLabel(value) }), getHint && _jsx("span", { className: "ui-search-hint", children: getHint(value) }), _jsx("button", { type: "button", className: "ui-search-clear", "aria-label": "Clear selection", onClick: () => onChange(null), children: "\u00D7" })] }));
    }
    return (_jsxs("div", { ref: rootRef, className: cn("ui-search", className), children: [_jsx("input", { className: "ui-search-input", value: query, placeholder: placeholder, onChange: (e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }, onFocus: () => setOpen(true) }), open && query.trim().length >= 2 && (_jsxs("ul", { className: "ui-search-results", children: [busy && _jsx("li", { className: "ui-search-note", children: "Searching\u2026" }), !busy && results.length === 0 && _jsx("li", { className: "ui-search-note", children: "No matches." }), !busy &&
                        results.map((r, i) => (_jsx("li", { children: _jsxs("button", { type: "button", className: "ui-search-option", onClick: () => {
                                    onChange(r);
                                    setQuery("");
                                    setOpen(false);
                                }, children: [renderLeading?.(r), _jsx("span", { className: "ui-search-option-label", children: getLabel(r) }), getHint && _jsx("span", { className: "ui-search-hint", children: getHint(r) })] }) }, i)))] }))] }));
}
