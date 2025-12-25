export const getStructureLink = ({
  structureId,
}: {
  structureId: string
}): string => {
  // TODO: Replace with actual structure detail page URL when implemented
  return `https://externaltodo/${structureId}`
}

export const getStructureCartographieLink = ({
  structureCartographieNationaleId,
}: {
  structureCartographieNationaleId: string
}): string => {
  return `https://cartographie.societenumerique.gouv.fr/cartographie/${structureCartographieNationaleId}/details`
}
