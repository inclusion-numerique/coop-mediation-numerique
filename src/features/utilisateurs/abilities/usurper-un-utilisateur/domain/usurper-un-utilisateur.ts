import {
  type UtilisateurId,
  UtilisateurIntrouvable,
} from '@/features/utilisateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDUsurperUnUtilisateur } from './errors'
import type { UsurperUnUtilisateurPorts } from './ports'
import {
  autoriserUsurpation,
  type PorteeUsurpation,
  type UsurpationOuverte,
} from './usurpation'

export const usurperUnUtilisateur =
  ({ lireLaCible, ouvrirLUsurpation }: UsurperUnUtilisateurPorts) =>
  async ({
    utilisateurId,
    usurpateurId,
    jetonDeSession,
    portee,
  }: {
    readonly utilisateurId: UtilisateurId | null
    readonly usurpateurId: UtilisateurId
    readonly jetonDeSession: string
    readonly portee: PorteeUsurpation
  }): Promise<Result<UsurpationOuverte, EchecDUsurperUnUtilisateur>> => {
    if (utilisateurId === null) return failure(UtilisateurIntrouvable())

    const cible = await lireLaCible(utilisateurId)
    if (cible === null) return failure(UtilisateurIntrouvable())

    const autorisation = autoriserUsurpation(cible, portee)
    if (!autorisation.success) return autorisation

    await ouvrirLUsurpation({ jetonDeSession, cibleId: cible.id, usurpateurId })

    return success({ jetonDeSession, cible, usurpateurId })
  }
