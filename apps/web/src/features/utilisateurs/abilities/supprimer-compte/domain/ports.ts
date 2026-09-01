import type {
  AdresseCourriel,
  MediateurId,
  RattachementsDuCompte,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'

export type AnonymiserPortefeuille = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly anonymises: number }>

export type EffacerNotes = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{ readonly effacees: number }>

export type EffacerEmpreinteRdv = (input: {
  readonly utilisateurId: UtilisateurId
}) => Promise<{
  readonly compteDelie: boolean
  readonly rdvsExpurges: number
  readonly usagersSupprimes: number
}>

export type DetacherDesEquipes = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{
  readonly invitationsSupprimees: number
  readonly appartenancesSupprimees: number
  readonly tagsTransferes: number
  readonly tagsSupprimes: number
}>

export type RetirerDesLieux = (input: {
  readonly mediateurId: MediateurId
}) => Promise<{ readonly rattachementsSupprimes: number }>

export type RevoquerPartageStatistiques = (input: {
  readonly rattachements: RattachementsDuCompte
}) => Promise<{ readonly partagesRevoques: number }>

export type RetirerDesListesDeDiffusion = (
  courriel: AdresseCourriel,
) => Promise<boolean>

export type Hash = (
  seed: string,
) => import('@app/web/features/utilisateurs/domain').CourrielHash

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
