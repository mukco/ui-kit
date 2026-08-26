import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../cn";
/**
 * Generic search-and-pick combobox: debounced async results in a dropdown,
 * selected value shown as a chip with a clear button. Bring your own search
 * endpoint; the kit owns none.
 *
 * It was called a combobox and was not one. No role, no aria-expanded, no
 * arrow keys, no Escape, no Enter — and the options were buttons, so Tab
 * walked through every result one at a time. A screen reader user got a bare
 * text field that silently grew a list they were never told about; a keyboard
 * user got a list they could only leave by tabbing through all of it.
 *
 * The real pattern: the input keeps focus throughout and aria-activedescendant
 * points at the highlighted option. That is why the options are divs rather
 * than buttons — focus must never leave the input, or typing stops working
 * half way through choosing.
 */
export function SearchSelect({ value, onChange, fetcher, getLabel, getHint, renderLeading, placeholder = "Search…", minChars = 2, className }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    // -1 is "nothing highlighted", which is the honest state before the reader
    // has arrowed: pre-selecting the first result means Enter picks something
    // nobody chose.
    const [active, setActive] = useState(-1);
    const rootRef = useRef(null);
    const listId = useId();
    useEffect(() => {
        if (query.trim().length < minChars) {
            // With minChars 0 an empty query is a real query — "show me everything" —
            // so it goes to the fetcher rather than being short-circuited to nothing.
            if (minChars > 0) {
                setResults([]);
                return;
            }
        }
        setBusy(true);
        const t = setTimeout(() => {
            fetcher(query.trim())
                .then((rows) => {
                setResults(rows);
                // A new result set invalidates the old highlight — index 3 of the
                // previous search is not index 3 of this one.
                setActive(-1);
            })
                .catch(() => setResults([]))
                .finally(() => setBusy(false));
        }, 250);
        return () => clearTimeout(t);
    }, [query, fetcher, minChars]);
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
    const listOpen = open && query.trim().length >= minChars;
    function choose(item) {
        onChange(item);
        setQuery("");
        setOpen(false);
        setActive(-1);
    }
    function onKeyDown(event) {
        if (event.key === "Escape") {
            // Closes the list, keeps what was typed. Clearing the query too would
            // throw away work on a key people press to mean "not that".
            setOpen(false);
            setActive(-1);
            return;
        }
        if (!listOpen || busy || results.length === 0)
            return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const step = event.key === "ArrowDown" ? 1 : -1;
            setActive((was) => {
                const next = was + step;
                if (next < 0)
                    return results.length - 1;
                if (next >= results.length)
                    return 0;
                return next;
            });
            return;
        }
        if (event.key === "Enter" && active >= 0) {
            // Only when something is highlighted, so Enter in a form with nothing
            // chosen still submits the form rather than being quietly eaten.
            event.preventDefault();
            choose(results[active]);
        }
    }
    return (_jsxs("div", { ref: rootRef, className: cn("ui-search", className), children: [_jsx("input", { className: "ui-search-input", value: query, placeholder: placeholder, role: "combobox", "aria-expanded": listOpen, "aria-controls": listId, "aria-autocomplete": "list", "aria-activedescendant": active >= 0 ? `${listId}-${active}` : undefined, onChange: (e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setActive(-1);
                }, onFocus: () => setOpen(true), onKeyDown: onKeyDown }), listOpen && (_jsxs("ul", { className: "ui-search-results", id: listId, role: "listbox", children: [busy && (_jsx("li", { className: "ui-search-note", role: "status", children: "Searching\u2026" })), !busy && results.length === 0 && (_jsx("li", { className: "ui-search-note", role: "status", children: "No matches." })), !busy &&
                        results.map((r, i) => (_jsxs("li", { id: `${listId}-${i}`, role: "option", "aria-selected": i === active, className: cn("ui-search-option", i === active && "is-active"), 
                            // Mouse and keyboard end up in the same place; the pointer
                            // moves the highlight so the two never disagree about which
                            // row Enter would take.
                            onMouseEnter: () => setActive(i), onMouseDown: (e) => e.preventDefault(), onClick: () => choose(r), children: [renderLeading?.(r), _jsx("span", { className: "ui-search-option-label", children: getLabel(r) }), getHint && _jsx("span", { className: "ui-search-hint", children: getHint(r) })] }, i)))] }))] }));
}
