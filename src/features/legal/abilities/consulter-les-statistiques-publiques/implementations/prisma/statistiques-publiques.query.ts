import { unstable_cache } from 'next/cache'
import type { MesureDesUtilisateursActifs } from '../../domain/ports'
import { lireLesAccompagnements } from './accompagnements.query'
import { lireLesBeneficiaires } from './beneficiaires'
import { suiviDesBeneficiaires } from './suivi-des-beneficiaires.query'
import { lireLesUtilisateursActifs } from './utilisateurs-actifs'

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
    lireLesAccompagnements(),
    lireLesBeneficiaires(),
    suiviDesBeneficiaires(),
    lireLesUtilisateursActifs(mesure),
  ])

  return {
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs,
  }
}

export const statistiquesPubliques = (mesure: MesureDesUtilisateursActifs) =>
  unstable_cache(
    () => getStatistiquesPubliquesPageDataUncached(mesure),
    ['statistiques-publiques'],
    { revalidate: 3600 },
  )()
