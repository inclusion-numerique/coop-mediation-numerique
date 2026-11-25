export const lienDuLieuDansLaCartographie = ({
  structureCartographieNationaleId,
}: {
  structureCartographieNationaleId: string
}) => {
  return `https://cartographie.societenumerique.gouv.fr/cartographie/${structureCartographieNationaleId}/details` as const
}

export const lienDuDepartementDansLaCartographie = ({
  region,
  departement,
}: {
  region: string
  departement: string
}) => {
  return `https://cartographie.societenumerique.gouv.fr/cartographie/regions/${region}/${departement}` as const
}
