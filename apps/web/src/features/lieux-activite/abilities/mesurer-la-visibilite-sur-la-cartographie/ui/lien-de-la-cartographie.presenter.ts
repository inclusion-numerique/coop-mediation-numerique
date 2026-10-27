import { departementsRegionByCode } from '@app/web/data/collectivites-territoriales/departementsRegion'
import { getCartographieDepartementLink } from '@app/web/libraries/cartographie-nationale'
import type { CodeDepartement } from '@app/web/libraries/departement'

const CARTOGRAPHIE_NATIONALE =
  'https://cartographie.societenumerique.gouv.fr/cartographie'

export const lienDeLaCartographie = (departement: CodeDepartement): string => {
  const departementRegion = departementsRegionByCode.get(departement)

  return departementRegion
    ? getCartographieDepartementLink({
        region: departementRegion.region,
        departement: departementRegion.nom,
      })
    : CARTOGRAPHIE_NATIONALE
}
