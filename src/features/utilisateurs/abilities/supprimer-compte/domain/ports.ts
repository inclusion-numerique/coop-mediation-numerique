import type {
  AdresseCourriel,
  CompteASupprimer,
  CourrielHash,
  IdentifiantsRattaches,
  IdentiteAnonyme,
  MediateurId,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { EchecTechnique, Result } from '@/libraries/result'
import type { CompteSupprime } from './autoriser-la-suppression'

export type AnonymiserPortefeuille = (input: {
  readonly mediateurId: MediateurId
}) => Promise<Result<{ readonly anonymises: number }, EchecTechnique>>

export type EffacerNotes = (
  input: IdentifiantsRattaches,
) => Promise<Result<{ readonly effacees: number }, EchecTechnique>>

export type EffacerEmpreinteRdv = (input: {
  readonly utilisateurId: UtilisateurId
}) => Promise<
  Result<
    {
      readonly compteDelie: boolean
      readonly rdvsExpurges: number
      readonly usagersSupprimes: number
    },
    EchecTechnique
  >
>

export type EffacementDatee = IdentifiantsRattaches & {
  readonly maintenant: Date
}

export type RetirerLesTagsDUnCompte = (input: EffacementDatee) => Promise<
  Result<
    {
      readonly transferes: number
      readonly supprimes: number
    },
    EchecTechnique
  >
>

export type DetacherDesEquipes = (input: EffacementDatee) => Promise<
  Result<
    {
      readonly invitationsSupprimees: number
      readonly appartenancesRetirees: number
    },
    EchecTechnique
  >
>

export type RetirerDesLieux = (input: {
  readonly mediateurId: MediateurId
}) => Promise<
  Result<{ readonly rattachementsSupprimes: number }, EchecTechnique>
>

export type RevoquerPartageStatistiques = (
  input: EffacementDatee,
) => Promise<Result<{ readonly partagesRevoques: number }, EchecTechnique>>

export type RetirerDesListesDeDiffusion = (
  courriel: AdresseCourriel,
) => Promise<Result<boolean, EchecTechnique>>

export type Hash = (seed: string) => CourrielHash

export type LireLeCompteASupprimer = (
  utilisateurId: UtilisateurId,
) => Promise<CompteASupprimer | null>

export type CouperLAcces = (input: {
  readonly utilisateurId: UtilisateurId
  readonly identite: IdentiteAnonyme
  readonly supprimeLe: Date
  readonly dejaAnonymise: boolean
}) => Promise<Result<void, EchecTechnique>>

export type JournaliserLEffacement = (compte: CompteSupprime) => void

export type EffacementsDuCompte = {
  readonly anonymiserPortefeuille: AnonymiserPortefeuille
  readonly effacerNotes: EffacerNotes
  readonly effacerEmpreinteRdv: EffacerEmpreinteRdv
  readonly retirerLesTagsDUnCompte: RetirerLesTagsDUnCompte
  readonly detacherDesEquipes: DetacherDesEquipes
  readonly retirerDesLieux: RetirerDesLieux
  readonly revoquerPartageStatistiques: RevoquerPartageStatistiques
  readonly retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion
}

export type SupprimerComptePorts = EffacementsDuCompte & {
  readonly hash: Hash
  readonly lireLeCompteASupprimer: LireLeCompteASupprimer
  readonly couperLAcces: CouperLAcces
  readonly journaliserLEffacement: JournaliserLEffacement
}
