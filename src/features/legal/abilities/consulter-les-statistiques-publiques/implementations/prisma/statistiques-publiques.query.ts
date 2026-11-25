import type { MesureDesUtilisateursActifs } from '../../domain/ports'
import { lireLesAccompagnements } from './accompagnements.query'
import { lireLesBeneficiaires } from './beneficiaires.query'
import { suiviDesBeneficiaires } from './suivi-des-beneficiaires.query'
import { lireLesUtilisateursActifs } from './utilisateurs-actifs.query'

export const statistiquesPubliques = async (
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
