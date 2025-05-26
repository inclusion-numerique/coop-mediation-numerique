import { getUtilisateursActifs } from '@app/web/features/legal/use-cases/statistiques/db/utilisateurs/get-utilisateurs-actifs'
import { getAccompagnements } from './db/accompagnements/get-accompagnements'
import { getBeneficiaires } from './db/beneficiaires/get-beneficiaires'
import { getSuiviBeneficiaires } from './db/beneficiaires/get-suivi-beneficiaires'
import { getTotalUtilisateursActifs } from './db/utilisateurs/get-total-utilisateurs-actifs'

export const getMesStatistiquesPageData = async () => ({
  chiffresCles: await getTotalUtilisateursActifs(),
  accompagnements: await getAccompagnements(),
  beneficiaires: await getBeneficiaires(),
  suiviBeneficiaires: await getSuiviBeneficiaires(),
  utilisateursActifs: await getUtilisateursActifs(),
})
