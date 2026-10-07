import { type ReactNode } from "react";
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
    label: string;
    value: ReactNode;
}
export interface ProfileLink {
    label: string;
    href: string;
}
export interface ProfileAward {
    name: string;
    /** The seasons won, as given ("2019", 2022). */
    seasons: Array<string | number>;
    /** Times won, when the source counts more than it lists seasons for. */
    count?: number;
}
export interface ProfileHeroProps {
    name: ReactNode;
    /** Headshot or crest URL. */
    image?: string | null;
    /** A crest is shown whole on no ground; a headshot is cropped in a frame. */
    imageKind?: "photo" | "logo";
    /** Shown when there is no image, or it fails: initials of this. */
    initials?: string;
    /** Beside the name: a compare toggle. */
    nameAside?: ReactNode;
    /** Under the name: position · number · team, or league · record. */
    line?: ReactNode;
    /** At the end of the line: an injury badge, a depth badge. */
    status?: ReactNode;
    /** Top right: a season picker, a follow star. */
    actions?: ReactNode;
    /** The actions are wide (a season picker): on a phone they take a row of
        their own rather than squeezing the name's column. */
    wideActions?: boolean;
    facts?: ProfileFact[];
    links?: ProfileLink[];
    awards?: ProfileAward[];
    /** A photograph behind the card (the team's arena), under a scrim. */
    art?: string | null;
    /** The top bar's colour — a team's own; the brand gradient otherwise. */
    accent?: string | null;
    /** Under the detail, inside the card — a team's record and lineup. */
    children?: ReactNode;
    className?: string;
}
export declare function ProfileHero({ name, image, imageKind, initials, nameAside, line, status, actions, wideActions, facts, links, awards, art, accent, children, className }: ProfileHeroProps): import("react").JSX.Element;
