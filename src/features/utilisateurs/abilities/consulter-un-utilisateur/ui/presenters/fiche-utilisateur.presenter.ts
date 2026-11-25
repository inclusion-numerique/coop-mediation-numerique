import {
  coordinateurDe,
  inscription,
  mediateurDe,
} from '@/features/utilisateurs/domain'
import { telephoneDisplayString } from '@/libraries/telephone'
import type { FicheUtilisateur } from '../../domain'

const NON_RENSEIGNE = 'Non renseigné'

export const etiquettesDuCompte = (
  fiche: FicheUtilisateur,
): readonly string[] =>
  [
    fiche.role === 'Admin' ? 'Administrateur' : null,
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

export const dateDInscription = (fiche: FicheUtilisateur): Date | null => {
  const jalon = inscription(fiche.cycle)
  return jalon._tag === 'Le' ? jalon.date : null
}

export const etatDeLInscription = (fiche: FicheUtilisateur) => {
  const mediateur = mediateurDe(fiche.rattachements)
  const coordinateur = coordinateurDe(fiche.rattachements)
  return {
    role: fiche.role,
    inscriptionValidee: dateDInscription(fiche),
    mediateur: mediateur === null ? null : { id: mediateur.id },
    coordinateur: coordinateur === null ? null : { id: coordinateur.id },
  }
}

export const rolesModifiables = (fiche: FicheUtilisateur) => {
  const mediateur = mediateurDe(fiche.rattachements)
  const coordinateur = coordinateurDe(fiche.rattachements)
  return {
    mediateur: {
      actuel: mediateur !== null,
      retirable: mediateur?.retirable ?? true,
    },
    coordinateur: {
      actuel: coordinateur !== null,
      retirable: coordinateur?.retirable ?? true,
    },
  }
}

export const compteSupprime = (fiche: FicheUtilisateur): boolean =>
  fiche.cycle._tag === 'Supprime'
