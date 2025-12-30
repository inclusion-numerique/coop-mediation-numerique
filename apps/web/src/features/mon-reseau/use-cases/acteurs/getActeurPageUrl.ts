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
    const retourWithAnchor = anchor ? `${retour}#${anchor}` : retour
    return `${base}?retour=${encodeURIComponent(retourWithAnchor)}${anchorString}`
  }
  return `${base}${anchorString}`
}
