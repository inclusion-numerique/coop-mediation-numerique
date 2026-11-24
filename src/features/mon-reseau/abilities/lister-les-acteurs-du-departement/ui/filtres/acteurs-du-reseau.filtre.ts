import { composerLEtat } from '@/libraries/etat-d-url/definition/composition'
import { filtreDeChoixUnique } from '@/libraries/etat-d-url/definition/filtre-de-choix'
import {
  etatDeLaListeDuReseau,
  filtreDesCommunesDuReseau,
  type ParametresDuReseau,
  premiere,
} from '../../../../ui/filtres/reseau.filtre'
import { type CriteresActeurs, FiltreRole, TriActeurs } from '../../domain'
import { LIBELLE_DU_ROLE } from '../presenters/acteurs.presenter'

export const filtreDuRoleDeLActeur = filtreDeChoixUnique({
  titre: 'Rôle',
  cle: 'role',
  choix: LIBELLE_DU_ROLE,
})

export const filtresDesActeursDuReseau = composerLEtat(
  filtreDesCommunesDuReseau,
  filtreDuRoleDeLActeur,
)

export const criteresDesActeursDuReseau = (
  parametres: ParametresDuReseau,
): CriteresActeurs => {
  const { communes, role } = filtresDesActeursDuReseau.charger(parametres)
  return {
    ...etatDeLaListeDuReseau(parametres),
    communes,
    role: role === null ? null : FiltreRole(role),
    tri: TriActeurs(premiere(parametres.tri)),
  }
}
