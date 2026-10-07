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
export declare const assistantMarkdown: Record<string, (props: any) => any>;
