export const getStructureCartographieLink = ({
  structureCartographieNationaleId,
}: {
  structureCartographieNationaleId: string
}): string => {
  return `https://cartographie.societenumerique.gouv.fr/cartographie/${structureCartographieNationaleId}/details`
}
