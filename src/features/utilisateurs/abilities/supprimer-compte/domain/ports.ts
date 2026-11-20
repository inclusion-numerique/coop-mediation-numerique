import type {
  AdresseCourriel,
  IdentifiantsRattaches,
  MediateurId,
  UtilisateurId,
} from '@/features/utilisateurs/domain'

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
