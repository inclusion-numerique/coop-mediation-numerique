import type {
  AdresseCourriel,
  EtatCompte,
  NomAffiche,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'

export type CompteTrouve = {
  readonly id: UtilisateurId
  readonly nom: NomAffiche
  readonly courriel: AdresseCourriel
  readonly etat: EtatCompte
}
