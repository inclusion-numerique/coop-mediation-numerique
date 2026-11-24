import { lienDuDepartementDansLaCartographie } from '@/features/lieux-activite/ui/presenters/liens-de-la-cartographie.presenter'
import { departementsRegionByCode } from '@/libraries/departement/departements-region'
import type { CodeDepartement } from '@/libraries/insee'

const CARTOGRAPHIE_NATIONALE =
  'https://cartographie.societenumerique.gouv.fr/cartographie'

export const lienDeLaCartographie = (
  departement: CodeDepartement,
): `https://${string}` => {
  const departementRegion = departementsRegionByCode.get(departement)

  return departementRegion
    ? lienDuDepartementDansLaCartographie({
        region: departementRegion.region,
        departement: departementRegion.nom,
      })
    : CARTOGRAPHIE_NATIONALE
}
