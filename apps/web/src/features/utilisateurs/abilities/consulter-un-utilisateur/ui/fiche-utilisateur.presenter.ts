import {
  coordinateurDe,
  mediateurDe,
} from '@app/web/features/utilisateurs/domain'
import { telephoneDisplayString } from '@app/web/libraries/telephone'
import type { FicheUtilisateur } from '../domain'

const NON_RENSEIGNE = 'Non renseigné'

export const etiquettesDuCompte = (
  fiche: FicheUtilisateur,
): readonly string[] =>
  [
    fiche.role === 'Admin' ? 'Administrateur' : null,
    fiche.role === 'Support' ? 'Support' : null,
    mediateurDe(fiche.rattachements) === null ? null : 'Médiateur',
    fiche.dispositif === 'ConseillerNumerique' ? 'Conseiller numérique' : null,
    coordinateurDe(fiche.rattachements) === null ? null : 'Coordinateur',
  ].filter((etiquette) => etiquette !== null)

export const renseigne = (valeur: string | null): string =>
  valeur === null || valeur === '' ? NON_RENSEIGNE : valeur

export const telephoneAffiche = (fiche: FicheUtilisateur): string =>
  fiche.telephone === null
    ? NON_RENSEIGNE
    : telephoneDisplayString(fiche.telephone)
