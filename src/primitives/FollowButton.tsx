import { BellOff, BellRing } from "pixelarticons/react"
import { IconBell, IconBellOff } from "./Icon"
import { Skin } from "./Pixel"

interface Props {
  on: boolean
  onToggle: () => void
  /** Tooltip for each state, in the sport's words ("…each inning and the final"). */
  title: { on: string; off: string }
}

/**
 * Follow a game: its start, periods and final reach this user's devices. One
 * line, bell and word together; the pixel bell under Phosphor. The app shows
 * it only where push is set up and the game isn't over.
 */
export function FollowButton({ on, onToggle, title }: Props) {
  return (
    <button type="button" className={`ui-btn ui-btn--sm ui-follow${on ? " ui-follow--on" : ""}`} aria-pressed={on} onClick={onToggle} title={on ? title.on : title.off}>
      <Skin px={on ? <BellRing className="px-icon" /> : <BellOff className="px-icon" />}>
        {on ? <IconBell size={14} /> : <IconBellOff size={14} />}
      </Skin>
      <span>{on ? "Following" : "Follow"}</span>
    </button>
  )
}
