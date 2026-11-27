import type {
  CompteASupprimer,
  CourrielHash,
  IdentifiantsRattaches,
  IdentiteAnonyme,
  MediateurId,
  PortsDuRetraitDuContact,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { EchecTechnique, Result } from '@/libraries/result'
import type { CompteSupprime } from './autoriser-la-suppression'

type AnonymiserPortefeuille = (input: {
  readonly mediateurId: MediateurId
  readonly maintenant: Date
}) => Promise<Result<{ readonly anonymises: number }, EchecTechnique>>

type EffacerNotes = (
  input: IdentifiantsRattaches,
) => Promise<Result<{ readonly effacees: number }, EchecTechnique>>

type EffacerEmpreinteRdv = (input: {
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

type RetirerLesTagsDUnCompte = (input: EffacementDatee) => Promise<
  Result<
    {
      readonly transferes: number
      readonly supprimes: number
    },
    EchecTechnique
  >
>

type DetacherDesEquipes = (input: EffacementDatee) => Promise<
  Result<
    {
      readonly invitationsSupprimees: number
      readonly appartenancesRetirees: number
    },
    EchecTechnique
  >
>

type RetirerDesLieux = (input: {
  readonly mediateurId: MediateurId
}) => Promise<
  Result<{ readonly rattachementsSupprimes: number }, EchecTechnique>
>

type RevoquerPartageStatistiques = (
  input: EffacementDatee,
) => Promise<Result<{ readonly partagesRevoques: number }, EchecTechnique>>

export type Hash = (seed: string) => CourrielHash

type LireLeCompteASupprimer = (
  utilisateurId: UtilisateurId,
) => Promise<CompteASupprimer | null>

type CouperLAcces = (input: {
  readonly utilisateurId: UtilisateurId
  readonly identite: IdentiteAnonyme
  readonly supprimeLe: Date
  readonly dejaAnonymise: boolean
}) => Promise<Result<void, EchecTechnique>>

type JournaliserLEffacement = (compte: CompteSupprime) => void

export type EffacementsDuCompte = PortsDuRetraitDuContact & {
  readonly anonymiserPortefeuille: AnonymiserPortefeuille
  readonly effacerNotes: EffacerNotes
  readonly effacerEmpreinteRdv: EffacerEmpreinteRdv
  readonly retirerLesTagsDUnCompte: RetirerLesTagsDUnCompte
  readonly detacherDesEquipes: DetacherDesEquipes
  readonly retirerDesLieux: RetirerDesLieux
  readonly revoquerPartageStatistiques: RevoquerPartageStatistiques
}

export type SupprimerComptePorts = EffacementsDuCompte & {
  readonly hash: Hash
  readonly lireLeCompteASupprimer: LireLeCompteASupprimer
  readonly couperLAcces: CouperLAcces
  readonly journaliserLEffacement: JournaliserLEffacement
}
