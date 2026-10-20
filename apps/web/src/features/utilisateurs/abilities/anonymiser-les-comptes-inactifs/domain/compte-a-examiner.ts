import type {
  AdresseCourriel,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { max } from 'date-fns'

export type CompteAExaminer = {
  readonly id: UtilisateurId
  readonly courriel: AdresseCourriel
  readonly prenom: string | null
  readonly inscriptionValidee: Date
  readonly mediateur: { readonly dernierCompteRendu: Date | null } | null
  readonly estCoordinateur: boolean
  readonly derniereConnexion: Date | null
  readonly derniereVisite: Date | null
  readonly avertiLe: Date | null
}

export const derniereActivite = (compte: CompteAExaminer): Date =>
  max(
    [
      compte.inscriptionValidee,
      ...(compte.mediateur == null
        ? []
        : [compte.mediateur.dernierCompteRendu, compte.derniereConnexion]),
      ...(compte.estCoordinateur ? [compte.derniereVisite] : []),
    ].filter((date) => date != null),
  )
