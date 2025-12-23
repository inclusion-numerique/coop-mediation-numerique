export const getActeurPageUrl = ({
  userId,
  retour,
  anchor,
}: {
  userId: string
  retour?: string
  anchor?: string
}) => {
  const anchorString = anchor ? `#${anchor}` : ''
  const base = `/coop/mon-reseau/acteurs/${userId}`
  if (retour) {
    return `${base}?retour=${retour}${anchorString}`
  }
  return `${base}${anchorString}`
}
