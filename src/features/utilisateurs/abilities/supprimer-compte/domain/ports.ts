import type {
  AdresseCourriel,
  CompteASupprimer,
  IdentifiantsRattaches,
  IdentiteAnonyme,
  MediateurId,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { CompteSupprime } from './autoriser-la-suppression'

type AnonymiserPortefeuille = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly anonymises: number }>

type EffacerNotes = (
  input: IdentifiantsRattaches,
) => Promise<{ readonly effacees: number }>

type EffacerEmpreinteRdv = (input: {
  readonly utilisateurId: UtilisateurId
}) => Promise<{
  readonly compteDelie: boolean
  readonly rdvsExpurges: number
  readonly usagersSupprimes: number
}>

type RetirerLesTagsDUnCompte = (input: IdentifiantsRattaches) => Promise<{
  readonly transferes: number
  readonly supprimes: number
}>

type DetacherDesEquipes = (input: IdentifiantsRattaches) => Promise<{
  readonly invitationsSupprimees: number
  readonly appartenancesRetirees: number
}>

type RetirerDesLieux = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly rattachementsSupprimes: number }>

type RevoquerPartageStatistiques = (
  input: IdentifiantsRattaches,
) => Promise<{ readonly partagesRevoques: number }>

export type RetirerDesListesDeDiffusion = (
  courriel: AdresseCourriel,
) => Promise<boolean>

export type Hash = (
  seed: string,
) => import('@/features/utilisateurs/domain').CourrielHash

export type SupprimerComptePorts = {
  readonly anonymiserPortefeuille: AnonymiserPortefeuille
  readonly effacerNotes: EffacerNotes
  readonly effacerEmpreinteRdv: EffacerEmpreinteRdv
  readonly retirerLesTagsDUnCompte: RetirerLesTagsDUnCompte
  readonly detacherDesEquipes: DetacherDesEquipes
  readonly retirerDesLieux: RetirerDesLieux
  readonly revoquerPartageStatistiques: RevoquerPartageStatistiques
  readonly retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion
  readonly hash: Hash
}

type LireLeCompteASupprimer = (
  utilisateurId: UtilisateurId,
) => Promise<CompteASupprimer | null>

type CouperLAcces = (input: {
  readonly utilisateurId: UtilisateurId
  readonly identite: IdentiteAnonyme
  readonly supprimeLe: Date
  readonly dejaAnonymise: boolean
}) => Promise<void>

type JournaliserLEffacement = (compte: CompteSupprime) => void

export type SupprimerCompteDependances = SupprimerComptePorts & {
  readonly lireLeCompteASupprimer: LireLeCompteASupprimer
  readonly couperLAcces: CouperLAcces
  readonly journaliserLEffacement: JournaliserLEffacement
}

export type EffacementsDesAutresFeatures = Omit<
  SupprimerComptePorts,
  'hash' | 'retirerDesListesDeDiffusion'
>
