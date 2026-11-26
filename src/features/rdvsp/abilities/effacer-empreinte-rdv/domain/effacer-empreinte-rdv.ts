import { type Result, success } from '@/libraries/result'
import type { JetonsOAuth } from '../../../domain/compte/jetons-oauth'
import type { ErreurRdvApi } from '../../../domain/errors'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type { UsagerId } from '../../../domain/identifiants/usager-id'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { RevoquerJetons } from '../../../domain/ports'
import type { EffacerEmpreinteRdvPorts } from './ports'

export type RevocationDesJetons =
  | { readonly _tag: 'sansJetons' }
  | { readonly _tag: 'revoques' }
  | { readonly _tag: 'echouee'; readonly erreur: ErreurRdvApi }

export type EmpreinteRdvEffacee =
  | { readonly _tag: 'aucunCompte' }
  | {
      readonly _tag: 'effacee'
      readonly agentId: RdvAgentId
      readonly revocation: RevocationDesJetons
      readonly rdvIds: readonly RdvId[]
      readonly usagersSupprimes: readonly UsagerId[]
    }

const revoquer = async (
  revoquerJetons: RevoquerJetons,
  jetons: JetonsOAuth | null,
): Promise<RevocationDesJetons> => {
  if (jetons === null) return { _tag: 'sansJetons' }

  const resultat = await revoquerJetons(jetons)

  return resultat.success
    ? { _tag: 'revoques' }
    : { _tag: 'echouee', erreur: resultat.error }
}

export const effacerEmpreinteRdv =
  ({
    compteAEffacer,
    revoquerJetons,
    signalerLaRevocationEchouee,
    rendezVousDuCompte,
    supprimerLeCompte,
    usagersOrphelinsParmi,
    supprimerLesUsagers,
  }: EffacerEmpreinteRdvPorts) =>
  async ({
    utilisateurId,
  }: {
    readonly utilisateurId: UtilisateurCoopId
  }): Promise<Result<EmpreinteRdvEffacee, never>> => {
    const compte = await compteAEffacer(utilisateurId)

    if (compte === null) return success({ _tag: 'aucunCompte' })

    const revocation = await revoquer(revoquerJetons, compte.jetons)

    if (revocation._tag === 'echouee')
      signalerLaRevocationEchouee({
        agentId: compte.agentId,
        erreur: revocation.erreur,
      })

    const { rdvIds, usagerIds } = await rendezVousDuCompte(compte.agentId)

    await supprimerLeCompte(compte.agentId)

    const usagersSupprimes = await usagersOrphelinsParmi(usagerIds)

    await supprimerLesUsagers(usagersSupprimes)

    return success({
      _tag: 'effacee',
      agentId: compte.agentId,
      revocation,
      rdvIds,
      usagersSupprimes,
    })
  }
