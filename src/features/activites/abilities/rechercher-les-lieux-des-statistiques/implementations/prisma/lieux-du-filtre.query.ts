import type { PerimetreDesStatistiques } from '../../../../domain'
import { GenreDeLieu, type LieuxChoisis } from '../../domain'
import { nommerLesLieuxChoisis } from './lieux-choisis.query'
import { rechercherLesLieuxDesStatistiques } from './lieux-des-statistiques.query'

const lesPlusUtilises = (
  perimetre: PerimetreDesStatistiques,
  genre: 'LieuDActivite' | 'Commune' | 'Departement',
) =>
  rechercherLesLieuxDesStatistiques({
    perimetre,
    genre: GenreDeLieu(genre),
    recherche: '',
  })

export const lieuxDuFiltre = async (
  perimetre: PerimetreDesStatistiques,
  choisis: LieuxChoisis,
) => {
  const [lieux, communes, departements, nommes] = await Promise.all([
    lesPlusUtilises(perimetre, 'LieuDActivite'),
    lesPlusUtilises(perimetre, 'Commune'),
    lesPlusUtilises(perimetre, 'Departement'),
    nommerLesLieuxChoisis(choisis, perimetre),
  ])
  return { suggestions: { lieux, communes, departements }, choisis: nommes }
}
