import type {
  AdresseCourriel,
  Prenom,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { EchecTechnique, Result } from '@/libraries/result'
import type { CompteAExaminer } from './compte-a-examiner'

export type AvertirDeLaSuppression = (avertissement: {
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly dateDeSuppression: Date
}) => Promise<Result<void, EchecTechnique>>

export type SuppressionRefusee = { readonly _tag: string }

export type SupprimerLeCompte = (suppression: {
  readonly utilisateurId: UtilisateurId
  readonly maintenant: Date
}) => Promise<Result<unknown, SuppressionRefusee>>

export type LireLesComptesAExaminer = (
  maintenant: Date,
) => Promise<readonly CompteAExaminer[]>

export type NoterLAvertissement = (
  utilisateurId: UtilisateurId,
  avertiLe: Date,
) => Promise<Result<void, EchecTechnique>>

export type AnonymiserLesComptesInactifsPorts = {
  readonly lireLesComptesAExaminer: LireLesComptesAExaminer
  readonly avertirDeLaSuppression: AvertirDeLaSuppression
  readonly noterLAvertissement: NoterLAvertissement
  readonly supprimerLeCompte: SupprimerLeCompte
}
