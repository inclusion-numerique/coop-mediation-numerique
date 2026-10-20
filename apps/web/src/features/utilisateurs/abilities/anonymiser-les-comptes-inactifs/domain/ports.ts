import type {
  AdresseCourriel,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'

export type AvertirDeLaSuppression = (avertissement: {
  readonly courriel: AdresseCourriel
  readonly prenom: string | null
  readonly dateDeSuppression: Date
}) => Promise<void>

export type SupprimerLeCompte = (utilisateurId: UtilisateurId) => Promise<void>

export type AnonymiserLesComptesInactifsPorts = {
  readonly avertirDeLaSuppression: AvertirDeLaSuppression
  readonly supprimerLeCompte: SupprimerLeCompte
}
