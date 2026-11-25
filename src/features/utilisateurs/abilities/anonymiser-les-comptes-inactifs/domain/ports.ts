import type {
  AdresseCourriel,
  Prenom,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { CompteAExaminer } from './compte-a-examiner'

export type AvertirDeLaSuppression = (avertissement: {
  readonly courriel: AdresseCourriel
  readonly prenom: Prenom | null
  readonly dateDeSuppression: Date
}) => Promise<void>

type SupprimerLeCompte = (utilisateurId: UtilisateurId) => Promise<void>

type AnonymiserLesComptesInactifsPorts = {
  readonly avertirDeLaSuppression: AvertirDeLaSuppression
  readonly supprimerLeCompte: SupprimerLeCompte
}

type LireLesComptesAExaminer = (
  maintenant: Date,
) => Promise<readonly CompteAExaminer[]>

type NoterLAvertissement = (
  utilisateurId: UtilisateurId,
  avertiLe: Date,
) => Promise<void>

export type AnonymiserLesComptesInactifsDependances =
  AnonymiserLesComptesInactifsPorts & {
    readonly lireLesComptesAExaminer: LireLesComptesAExaminer
    readonly noterLAvertissement: NoterLAvertissement
  }
