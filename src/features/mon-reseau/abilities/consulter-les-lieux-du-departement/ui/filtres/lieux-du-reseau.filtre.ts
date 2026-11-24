import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import {
  etatDeLaListeDuReseau,
  filtreDesCommunesDuReseau,
  type ParametresDuReseau,
  premiere,
} from '../../../../ui/filtres/reseau.filtre'
import { type CriteresDesLieux, TriDesLieuxAffiche } from '../../domain'

export const filtresDesLieuxDuReseau = composerLesFiltres(
  filtreDesCommunesDuReseau,
)

export const criteresDesLieuxDuReseau = (
  parametres: ParametresDuReseau,
): CriteresDesLieux => ({
  ...etatDeLaListeDuReseau(parametres),
  communes: filtresDesLieuxDuReseau.charger(parametres).communes,
  tri: TriDesLieuxAffiche(premiere(parametres.tri)),
})
