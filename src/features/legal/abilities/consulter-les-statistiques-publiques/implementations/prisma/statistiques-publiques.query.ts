import type { MesureDesUtilisateursActifs } from '../../domain/ports'
import { lireLesAccompagnements } from './accompagnements.query'
import { lireLesBeneficiaires } from './beneficiaires.query'
import { suiviDesBeneficiaires } from './suivi-des-beneficiaires.query'
import { lireLesUtilisateursActifs } from './utilisateurs-actifs.query'

export const statistiquesPubliques = async (
  mesure: MesureDesUtilisateursActifs,
) => {
  const mesureDuJour = mesure.mesurerLesUtilisateursActifs(new Date())

  const [
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs,
  ] = await Promise.all([
    mesureDuJour,
    lireLesAccompagnements(),
    lireLesBeneficiaires(),
    suiviDesBeneficiaires(),
    lireLesUtilisateursActifs({
      ...mesure,
      mesurerLesUtilisateursActifs: () => mesureDuJour,
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
