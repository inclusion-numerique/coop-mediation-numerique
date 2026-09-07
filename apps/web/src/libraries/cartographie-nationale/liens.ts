export const getStructureCartographieLink = ({
  structureCartographieNationaleId,
}: {
  structureCartographieNationaleId: string
}): string => {
  return `https://cartographie.societenumerique.gouv.fr/cartographie/${structureCartographieNationaleId}/details`
}

export const getCartographieDepartementLink = ({
  region,
  departement,
}: {
  region: string
  departement: string
}): string => {
  return `https://cartographie.societenumerique.gouv.fr/cartographie/regions/${region}/${departement}`
}
