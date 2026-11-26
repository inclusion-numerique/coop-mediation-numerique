import {
  type CompteRdv,
  type CompteRdvUtilisable,
  estUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import {
  CompteNonLie,
  RdvIntrouvable,
  RdvNonAutorise,
} from '@/features/rdvsp/domain/errors'
import type { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import type { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type {
  StatutPresence,
  StatutPresenceModifiable,
} from '@/features/rdvsp/domain/rdv/statut-presence'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeMettreAJourStatutRdv } from './errors'
import type { MettreAJourStatutRdvPorts } from './ports'
import type {
  StatutRdvEnregistre,
  StatutRdvMisAJour,
} from './statut-rdv-enregistre'

const verifierAcces = ({
  compte,
  agentIdDuRdv,
  rdvId,
}: {
  compte: CompteRdv | null
  agentIdDuRdv: RdvAgentId | null
  rdvId: RdvId
}): Result<CompteRdvUtilisable, EchecDeMettreAJourStatutRdv> => {
  if (compte === null) {
    return failure(CompteNonLie(null))
  }

  if (!estUtilisable(compte)) {
    return failure(CompteNonLie(compte.agentId))
  }

  if (agentIdDuRdv === null) {
    return failure(RdvIntrouvable(rdvId))
  }

  if (agentIdDuRdv !== compte.agentId) {
    return failure(RdvNonAutorise(rdvId))
  }

  return success(compte)
}

const statutRdvMisAJour = (
  statutConfirme: StatutPresence,
): StatutRdvMisAJour => ({
  statutPresence: statutConfirme,
  compteRenduRegle: statutConfirme === 'seen',
})

export const mettreAJourStatutRdv =
  ({ contexte, changerStatutRdv, enregistrer }: MettreAJourStatutRdvPorts) =>
  async ({
    utilisateurId,
    rdvId,
    statut,
  }: {
    readonly utilisateurId: UtilisateurCoopId
    readonly rdvId: RdvId
    readonly statut: StatutPresenceModifiable
  }): Promise<Result<StatutRdvEnregistre, EchecDeMettreAJourStatutRdv>> => {
    const { compte, agentIdDuRdv } = await contexte({ utilisateurId, rdvId })

    const acces = verifierAcces({ compte, agentIdDuRdv, rdvId })

    if (!acces.success) {
      return acces
    }

    const confirmation = await changerStatutRdv(acces.data, rdvId, statut)

    if (!confirmation.success) {
      return confirmation
    }

    const enregistrement: StatutRdvEnregistre = {
      rdvId,
      statut: statutRdvMisAJour(confirmation.data),
    }

    await enregistrer(enregistrement)

    return success(enregistrement)
  }
