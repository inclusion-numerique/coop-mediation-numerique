import {
  type UtilisateurId,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import {
  autoriserUsurpation,
  type CibleUsurpation,
  type PorteeUsurpation,
  type UsurpationHorsFixtures,
} from './usurpation'

export type UsurperUnUtilisateurPorts = {
  readonly lireLaCible: (
    utilisateurId: string,
  ) => Promise<CibleUsurpation | null>
  readonly ouvrirLUsurpation: (usurpation: {
    readonly jetonDeSession: string
    readonly cibleId: UtilisateurId
    readonly usurpateurId: string
  }) => Promise<void>
}

export const usurperUnUtilisateur =
  ({ lireLaCible, ouvrirLUsurpation }: UsurperUnUtilisateurPorts) =>
  async ({
    utilisateurId,
    usurpateurId,
    jetonDeSession,
    portee,
  }: {
    readonly utilisateurId: string
    readonly usurpateurId: string
    readonly jetonDeSession: string
    readonly portee: PorteeUsurpation
  }): Promise<
    Result<CibleUsurpation, UtilisateurIntrouvable | UsurpationHorsFixtures>
  > => {
    const cible = await lireLaCible(utilisateurId)
    if (cible === null) return failure(UtilisateurIntrouvable(utilisateurId))

    const autorisation = autoriserUsurpation(cible, portee)
    if (!autorisation.success) return autorisation

    await ouvrirLUsurpation({ jetonDeSession, cibleId: cible.id, usurpateurId })

    return success(cible)
  }
