import type { CompteRdv } from './compte-rdv'

export type SanteCompteRdv =
  | { readonly _tag: 'operationnel' }
  | { readonly _tag: 'jetonExpire'; readonly depuis: Date }
  | { readonly _tag: 'enErreur'; readonly message: string }
  | { readonly _tag: 'jamaisLie' }
  | { readonly _tag: 'deconnecteParUtilisateur'; readonly quand: Date }

export const santeDuCompte = (
  compte: CompteRdv,
  maintenant: Date,
): SanteCompteRdv => {
  if (compte._tag === 'deconnecte') {
    return {
      _tag: 'deconnecteParUtilisateur',
      quand: compte.deconnexion,
    }
  }

  if (compte._tag === 'nonLie') {
    return { _tag: 'jamaisLie' }
  }

  if (compte._tag === 'enErreur') {
    return { _tag: 'enErreur', message: compte.erreur }
  }

  const { expiration } = compte.jetons

  return expiration !== null && expiration <= maintenant
    ? { _tag: 'jetonExpire', depuis: expiration }
    : { _tag: 'operationnel' }
}

export const peutEtreSynchronise = (sante: SanteCompteRdv): boolean =>
  sante._tag === 'operationnel' || sante._tag === 'jetonExpire'

export type StatutIntegration =
  | 'jamaisConnecte'
  | 'connecte'
  | 'deconnecte'
  | 'enPanne'

export const statutIntegration = (sante: SanteCompteRdv): StatutIntegration => {
  if (sante._tag === 'deconnecteParUtilisateur') {
    return 'deconnecte'
  }

  return sante._tag === 'enErreur' || sante._tag === 'jamaisLie'
    ? 'enPanne'
    : 'connecte'
}

export type CompteDeLaSession = {
  readonly deconnexion: string | null
  readonly jetonDAcces: boolean
  readonly error: string | null
}

const enErreur = (error: string | null): boolean =>
  error !== null && error.trim() !== ''

export const statutDuCompteDeLaSession = (
  compte: CompteDeLaSession | null,
): StatutIntegration => {
  if (compte === null) return 'jamaisConnecte'
  if (compte.deconnexion !== null) return 'deconnecte'
  return !compte.jetonDAcces || enErreur(compte.error) ? 'enPanne' : 'connecte'
}
