import {
  type CompteRdv,
  type CompteRdvUtilisable,
  estUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import { CompteNonLie, RdvIntrouvable } from '@/features/rdvsp/domain/errors'
import type { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import type { RdvId } from '@/features/rdvsp/domain/identifiants/rdv-id'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type {
  StatutPresence,
  StatutPresenceModifiable,
} from '@/features/rdvsp/domain/rdv/statut-presence'
import { failure, type Result, success } from '@/libraries/result'
import { type EchecDeMettreAJourStatutRdv, RdvNonAutorise } from './errors'
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

/**
 * État à enregistrer une fois le statut confirmé par RDV Service Public.
 *
 * `compteRenduRegle` dit que le compte rendu n'est plus attendu, quelle qu'en
 * soit la raison : le médiateur en a rédigé un, ou il a explicitement décliné
 * l'invitation depuis la modale. Les deux chemins mènent ici et le drapeau
 * empêche l'invitation de revenir — c'est lui que lisent la liste d'activités
 * et le compteur de l'accueil. Les autres statuts le lèvent : un rendez-vous
 * annulé n'appelle aucun compte rendu.
 */
const statutRdvMisAJour = (
  statutConfirme: StatutPresence,
): StatutRdvMisAJour => ({
  statutPresence: statutConfirme,
  compteRenduRegle: statutConfirme === 'seen',
})

/**
 * RDV Service Public est prévenu avant que La Coop n'écrive quoi que ce soit, et
 * c'est le statut qu'il renvoie qui est enregistré, jamais celui demandé : lui
 * seul fait autorité sur ses rendez-vous. Un échec de son côté laisse donc la
 * base intacte plutôt que d'y inscrire une valeur qu'il ignore.
 */
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
