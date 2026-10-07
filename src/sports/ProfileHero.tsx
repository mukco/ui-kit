import { useState, type ReactNode } from "react"
import { cn } from "../cn"

/**
 * The head of a player's or a team's page, for every sport: a face (headshot
 * or crest), the name, a line under it (position · number · team, or league ·
 * record), and then the detail — facts as chips (HT 6' 6", DRAFT 2018…),
 * links out to the reference sites, and the awards, grouped with their count
 * and years.
 *
 * On a phone the detail runs full width under the face and name rather than
 * in the column beside the face, which at 390px is a few words wide; on a
 * wider screen it sits beside the face.
 */
export interface ProfileFact {
  label: string
  value: ReactNode
}

export interface ProfileLink {
  label: string
  href: string
}

export interface ProfileAward {
  name: string
  /** The seasons won, as given ("2019", 2022). */
  seasons: Array<string | number>
  /** Times won, when the source counts more than it lists seasons for. */
  count?: number
}

export interface ProfileHeroProps {
  name: ReactNode
  /** Headshot or crest URL. */
  image?: string | null
  /** A crest is shown whole on no ground; a headshot is cropped in a frame. */
  imageKind?: "photo" | "logo"
  /** Shown when there is no image, or it fails: initials of this. */
  initials?: string
  /** Beside the name: a compare toggle. */
  nameAside?: ReactNode
  /** Under the name: position · number · team, or league · record. */
  line?: ReactNode
  /** At the end of the line: an injury badge, a depth badge. */
  status?: ReactNode
  /** Top right: a season picker, a follow star. */
  actions?: ReactNode
  facts?: ProfileFact[]
  links?: ProfileLink[]
  awards?: ProfileAward[]
  /** Under the detail, inside the card — a team's record and lineup. */
  children?: ReactNode
  className?: string
}

const AWARDS_PREVIEW = 6
const yy = (s: string | number) => `’${String(s).slice(-2)}`

function Face({ image, imageKind, initials }: Pick<ProfileHeroProps, "image" | "imageKind" | "initials">) {
  const [broken, setBroken] = useState(false)
  const cls = cn("ui-profilehero-face", imageKind === "logo" && "ui-profilehero-face--logo")
  if (!image || broken) return <span className={cn(cls, "ui-profilehero-face--initials")} aria-hidden="true">{initials}</span>
  return <img className={cls} src={image} alt="" onError={() => setBroken(true)} />
}

function Awards({ awards }: { awards: ProfileAward[] }) {
  const [all, setAll] = useState(false)
  const hidden = Math.max(0, awards.length - AWARDS_PREVIEW)
  return (
    <div className="ui-profilehero-chips">
      {awards.map((a, i) => (
        <span key={a.name} className={cn("ui-profilehero-award", !all && i >= AWARDS_PREVIEW && "ui-profilehero-award--more")} title={a.seasons.join(", ")}>
          {a.name}
          {(a.count ?? a.seasons.length) > 1 && <span className="ui-profilehero-award-count">×{a.count ?? a.seasons.length}</span>}
          {a.seasons.length > 0 && <span className="ui-profilehero-award-years">{a.seasons.map(yy).join(" ")}</span>}
        </span>
      ))}
      {hidden > 0 && (
        <button type="button" className="ui-profilehero-awards-toggle" onClick={() => setAll((v) => !v)}>
          {all ? "Show fewer" : `+${hidden} more`}
        </button>
      )}
    </div>
  )
}

export function ProfileHero({ name, image, imageKind = "photo", initials, nameAside, line, status, actions, facts, links, awards, children, className }: ProfileHeroProps) {
  const shownFacts = (facts ?? []).filter((f) => f.value != null && f.value !== "")
  const detail = shownFacts.length > 0 || (links?.length ?? 0) > 0 || (awards?.length ?? 0) > 0
  return (
    <div className={cn("ui-card ui-profilehero", className)}>
      <div className="ui-profilehero-bar" aria-hidden="true" />
      <div className="ui-profilehero-body">
        <Face image={image} imageKind={imageKind} initials={initials} />
        <div className="ui-profilehero-top">
          <h1 className="ui-profilehero-name">{name}{nameAside && <span className="ui-profilehero-aside">{nameAside}</span>}</h1>
          {line && <div className="ui-profilehero-line">{line}</div>}
        </div>
        {/* Its own row: an injured-list banner beside a headshot on a phone
            had a column a few words wide to fit in. */}
        {status && <div className="ui-profilehero-status">{status}</div>}
        {/* Its own grid cell: beside the name on a wide screen, but on a
            phone a season picker there squeezed the team onto two lines. */}
        {actions && <div className="ui-profilehero-actions">{actions}</div>}
        {detail && (
          <div className="ui-profilehero-detail">
            {shownFacts.length > 0 && (
              <div className="ui-profilehero-chips">
                {shownFacts.map((f) => <span key={f.label} className="ui-profilehero-fact"><span className="ui-profilehero-fact-k">{f.label}</span> {f.value}</span>)}
              </div>
            )}
            {links && links.length > 0 && (
              <div className="ui-profilehero-chips">
                {links.map((l) => <a key={l.label} className="ui-profilehero-link" href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}
              </div>
            )}
            {awards && awards.length > 0 && <Awards awards={awards} />}
          </div>
        )}
      </div>
      {children != null && <div className="ui-profilehero-extra">{children}</div>}
    </div>
  )
}
