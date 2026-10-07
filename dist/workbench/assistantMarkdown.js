import { jsx as _jsx } from "react/jsx-runtime";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * react-markdown's `components` for an assistant answer: the kit's
 * .ui-fa-md-* classes on every element, so answers read the same in every
 * app. Each app had its own copy of this map, and they had drifted — one
 * sent links to the app's own pages off to a new tab.
 *
 *   <ReactMarkdown components={assistantMarkdown} rehypePlugins={…}>{text}</ReactMarkdown>
 *
 * The plugins (syntax highlighting, math) stay the app's: they are its
 * dependencies, not the kit's.
 */
export const assistantMarkdown = {
    p: ({ children }) => _jsx("p", { className: "ui-fa-md-p", children: children }),
    h1: ({ children }) => _jsx("h3", { className: "ui-fa-md-h1", children: children }),
    h2: ({ children }) => _jsx("h3", { className: "ui-fa-md-h2", children: children }),
    h3: ({ children }) => _jsx("h4", { className: "ui-fa-md-h3", children: children }),
    code: ({ className, children }) => _jsx("code", { className: className ? `ui-fa-md-codeblock ${className}` : "ui-fa-md-code", children: children }),
    pre: ({ children }) => _jsx("pre", { className: "ui-fa-md-pre", children: children }),
    ul: ({ children }) => _jsx("ul", { className: "ui-fa-md-ul", children: children }),
    ol: ({ children }) => _jsx("ol", { className: "ui-fa-md-ol", children: children }),
    li: ({ children }) => _jsx("li", { className: "ui-fa-md-li", children: children }),
    strong: ({ children }) => _jsx("strong", { className: "ui-fa-md-strong", children: children }),
    em: ({ children }) => _jsx("em", { className: "ui-fa-md-em", children: children }),
    hr: () => _jsx("hr", { className: "ui-fa-md-hr" }),
    blockquote: ({ children }) => _jsx("blockquote", { className: "ui-fa-md-quote", children: children }),
    // The app's own pages (/player/…) open in place; anything else in a new tab.
    a: ({ href, children }) => (_jsx("a", { href: href, className: "ui-fa-md-link", target: href?.startsWith("/") ? undefined : "_blank", rel: "noreferrer", children: children })),
};
