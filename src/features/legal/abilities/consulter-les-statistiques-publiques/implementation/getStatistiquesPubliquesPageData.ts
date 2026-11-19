import { unstable_cache } from 'next/cache'
import { mesurerLesUtilisateursActifs } from '@/features/utilisateurs/abilities/mesurer-les-utilisateurs-actifs'
import { getAccompagnements } from './prisma/get-accompagnements'
import { getBeneficiaires } from './prisma/get-beneficiaires'
import { getSuiviBeneficiaires } from './prisma/get-suivi-beneficiaires'
import { getUtilisateursActifs } from './prisma/get-utilisateurs-actifs'

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
  { revalidate: 3600 },
)
