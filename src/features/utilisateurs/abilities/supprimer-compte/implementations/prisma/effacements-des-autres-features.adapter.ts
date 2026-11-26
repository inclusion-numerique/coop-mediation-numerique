import {
  EchecTechnique,
  type IdentifiantsRattaches,
  type MediateurId,
  type UtilisateurId,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EffacementsDuCompte } from '../../domain/ports'

export type EffacementsDesAutresFeatures = {
  readonly anonymiserPortefeuille: (input: {
    readonly mediateurId: MediateurId
  }) => Promise<{ readonly anonymises: number }>
  readonly effacerNotes: (
    input: IdentifiantsRattaches,
  ) => Promise<{ readonly effacees: number }>
  readonly effacerEmpreinteRdv: (input: {
    readonly utilisateurId: UtilisateurId
  }) => Promise<{
    readonly compteDelie: boolean
    readonly rdvsExpurges: number
    readonly usagersSupprimes: number
  }>
  readonly retirerLesTagsDUnCompte: (input: IdentifiantsRattaches) => Promise<{
    readonly transferes: number
    readonly supprimes: number
  }>
  readonly detacherDesEquipes: (input: IdentifiantsRattaches) => Promise<{
    readonly invitationsSupprimees: number
    readonly appartenancesRetirees: number
  }>
  readonly retirerDesLieux: (input: {
    readonly mediateurId: MediateurId
  }) => Promise<{ readonly rattachementsSupprimes: number }>
  readonly revoquerPartageStatistiques: (
    input: IdentifiantsRattaches,
  ) => Promise<{ readonly partagesRevoques: number }>
}

const attraper =
  <Entree, Sortie>(effacer: (entree: Entree) => Promise<Sortie>) =>
  async (entree: Entree): Promise<Result<Sortie, EchecTechnique>> => {
    try {
      return success(await effacer(entree))
    } catch (erreur) {
      return failure(
        EchecTechnique(
          erreur instanceof Error ? erreur.message : String(erreur),
        ),
      )
    }
  }

export const effacementsAttrapes = (
  effacements: EffacementsDesAutresFeatures,
): Omit<EffacementsDuCompte, 'retirerDesListesDeDiffusion'> => ({
  anonymiserPortefeuille: attraper(effacements.anonymiserPortefeuille),
  effacerNotes: attraper(effacements.effacerNotes),
  effacerEmpreinteRdv: attraper(effacements.effacerEmpreinteRdv),
  retirerLesTagsDUnCompte: attraper(effacements.retirerLesTagsDUnCompte),
  detacherDesEquipes: attraper(effacements.detacherDesEquipes),
  retirerDesLieux: attraper(effacements.retirerDesLieux),
  revoquerPartageStatistiques: attraper(
    effacements.revoquerPartageStatistiques,
  ),
})
