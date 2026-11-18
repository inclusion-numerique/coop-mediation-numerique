import { unstable_cache } from 'next/cache'
import { getUtilisateursActifs } from '@/features/legal/use-cases/statistiques/db/utilisateurs/get-utilisateurs-actifs'
import { mesurerLesUtilisateursActifs } from '@/features/utilisateurs/abilities/mesurer-les-utilisateurs-actifs'
import { getAccompagnements } from './db/accompagnements/get-accompagnements'
import { getBeneficiaires } from './db/beneficiaires/get-beneficiaires'
import { getSuiviBeneficiaires } from './db/beneficiaires/get-suivi-beneficiaires'

const getStatistiquesPubliquesPageDataUncached = async () => {
  const [
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs,
  ] = await Promise.all([
    mesurerLesUtilisateursActifs(new Date()),
    getAccompagnements(),
    getBeneficiaires(),
    getSuiviBeneficiaires(),
    getUtilisateursActifs(),
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
