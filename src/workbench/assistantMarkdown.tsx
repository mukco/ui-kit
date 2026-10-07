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
export const assistantMarkdown: Record<string, (props: any) => any> = {
  p: ({ children }: any) => <p className="ui-fa-md-p">{children}</p>,
  h1: ({ children }: any) => <h3 className="ui-fa-md-h1">{children}</h3>,
  h2: ({ children }: any) => <h3 className="ui-fa-md-h2">{children}</h3>,
  h3: ({ children }: any) => <h4 className="ui-fa-md-h3">{children}</h4>,
  code: ({ className, children }: any) =>
    <code className={className ? `ui-fa-md-codeblock ${className}` : "ui-fa-md-code"}>{children}</code>,
  pre: ({ children }: any) => <pre className="ui-fa-md-pre">{children}</pre>,
  ul: ({ children }: any) => <ul className="ui-fa-md-ul">{children}</ul>,
  ol: ({ children }: any) => <ol className="ui-fa-md-ol">{children}</ol>,
  li: ({ children }: any) => <li className="ui-fa-md-li">{children}</li>,
  strong: ({ children }: any) => <strong className="ui-fa-md-strong">{children}</strong>,
  em: ({ children }: any) => <em className="ui-fa-md-em">{children}</em>,
  hr: () => <hr className="ui-fa-md-hr" />,
  blockquote: ({ children }: any) => <blockquote className="ui-fa-md-quote">{children}</blockquote>,
  // The app's own pages (/player/…) open in place; anything else in a new tab.
  a: ({ href, children }: any) => (
    <a href={href} className="ui-fa-md-link" target={href?.startsWith("/") ? undefined : "_blank"} rel="noreferrer">{children}</a>
  ),
}
