import { getUtilisateursActifs } from '@app/web/features/legal/use-cases/statistiques/db/utilisateurs/get-utilisateurs-actifs'
import { debugPromiseTiming } from '@app/web/utils/debugPromiseTiming'
import { unstable_cache } from 'next/cache'
import { getAccompagnements } from './db/accompagnements/get-accompagnements'
import { getBeneficiaires } from './db/beneficiaires/get-beneficiaires'
import { getSuiviBeneficiaires } from './db/beneficiaires/get-suivi-beneficiaires'
import { getTotalUtilisateursActifs } from './db/utilisateurs/get-total-utilisateurs-actifs'

const getStatistiquesPubliquesPageDataUncached = async () => {
  const [
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs,
  ] = await Promise.all([
    debugPromiseTiming(getTotalUtilisateursActifs(), {
      name: 'getTotalUtilisateursActifs',
    }),
    debugPromiseTiming(getAccompagnements(), {
      name: 'getAccompagnements',
    }),
    debugPromiseTiming(getBeneficiaires(), {
      name: 'getBeneficiaires',
    }),
    debugPromiseTiming(getSuiviBeneficiaires(), {
      name: 'getSuiviBeneficiaires',
    }),
    debugPromiseTiming(getUtilisateursActifs(), {
      name: 'getUtilisateursActifs',
    }),
  ])

  return {
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs,
  }
}

export const getStatistiquesPubliquesPageData = unstable_cache(
  getStatistiquesPubliquesPageDataUncached,
  ['statistiques-publiques'],
  { revalidate: 3600 }, // 1 hour cache
)
