import { unstable_cache } from 'next/cache'
import type { MesureDesUtilisateursActifs } from '../domain/ports'
import { getAccompagnements } from './prisma/get-accompagnements'
import { getBeneficiaires } from './prisma/get-beneficiaires'
import { getSuiviBeneficiaires } from './prisma/get-suivi-beneficiaires'
import { getUtilisateursActifs } from './prisma/get-utilisateurs-actifs'

const getStatistiquesPubliquesPageDataUncached = async (
  mesure: MesureDesUtilisateursActifs,
) => {
  const [
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs,
  ] = await Promise.all([
    mesure.mesurerLesUtilisateursActifs(new Date()),
    getAccompagnements(),
    getBeneficiaires(),
    getSuiviBeneficiaires(),
    getUtilisateursActifs(mesure),
  ])

  return {
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs,
  }
}

export const getStatistiquesPubliquesPageData = (
  mesure: MesureDesUtilisateursActifs,
) =>
  unstable_cache(
    () => getStatistiquesPubliquesPageDataUncached(mesure),
    ['statistiques-publiques'],
    { revalidate: 3600 },
  )()
