/** "1st", "2nd", "3rd", "4th", … — standings seeds, draft slots, anything
    ranked. Both baseball and football hand-rolled this identically. */
export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
