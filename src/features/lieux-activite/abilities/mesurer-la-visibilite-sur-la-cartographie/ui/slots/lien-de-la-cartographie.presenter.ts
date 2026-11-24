import { getCartographieDepartementLink } from '@/features/lieux-activite/domain/cartographie-nationale/liens'
import { departementsRegionByCode } from '@/libraries/departement/departementsRegion'
import type { CodeDepartement } from '@/libraries/insee'

const CARTOGRAPHIE_NATIONALE =
  'https://cartographie.societenumerique.gouv.fr/cartographie'

export const lienDeLaCartographie = (
  departement: CodeDepartement,
): `https://${string}` => {
  const departementRegion = departementsRegionByCode.get(departement)

  return departementRegion
    ? getCartographieDepartementLink({
        region: departementRegion.region,
        departement: departementRegion.nom,
      })
    : CARTOGRAPHIE_NATIONALE
}
