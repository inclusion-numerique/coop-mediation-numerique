export const getActeurPageUrl = ({
  departementCode,
  userId,
  anchor,
}: {
  departementCode: string
  userId: string
  anchor?: string
}) => {
  const anchorString = anchor ? `#${anchor}` : ''
  const base = `/coop/mon-reseau/${departementCode}/acteurs/${userId}`

  return `${base}${anchorString}`
}
