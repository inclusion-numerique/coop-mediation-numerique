import type {
  AdresseCourriel,
  MediateurId,
  RattachementsDuCompte,
  UtilisateurId,
} from '@/features/utilisateurs/domain'

type AnonymiserPortefeuille = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly anonymises: number }>

type EffacerNotes = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{ readonly effacees: number }>

type EffacerEmpreinteRdv = (input: {
  readonly utilisateurId: UtilisateurId
}) => Promise<{
  readonly compteDelie: boolean
  readonly rdvsExpurges: number
  readonly usagersSupprimes: number
}>

type DetacherDesEquipes = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{
  readonly invitationsSupprimees: number
  readonly appartenancesRetirees: number
  readonly tagsTransferes: number
  readonly tagsSupprimes: number
}>

type RetirerDesLieux = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly rattachementsSupprimes: number }>

type RevoquerPartageStatistiques = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{ readonly partagesRevoques: number }>

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
  readonly detacherDesEquipes: DetacherDesEquipes
  readonly retirerDesLieux: RetirerDesLieux
  readonly revoquerPartageStatistiques: RevoquerPartageStatistiques
  readonly retirerDesListesDeDiffusion: RetirerDesListesDeDiffusion
  readonly hash: Hash
}
