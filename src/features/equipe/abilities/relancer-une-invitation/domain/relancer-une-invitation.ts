import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  CoordinateurIntrouvable,
  type EnvoiDInvitation,
  exigerEnAttente,
  exigerUneRelancePossible,
  type Gestionnaire,
  InvitationIntrouvable,
  peutGererLEquipe,
  type ReferenceInvitation,
  type UtilisateurId,
} from '../../../domain'
import type { EchecDeRelancerUneInvitation } from './errors'
import type { RelancerUneInvitationPorts } from './ports'
import type { Relance, RelanceEnvoyee } from './relance'

export const relancerUneInvitation =
  <Cle>({
    lireUneInvitation,
    lireLeCoordinateur,
    envoyerUneInvitation,
    enregistrerLaRelance,
  }: RelancerUneInvitationPorts<Cle>) =>
  async ({
    reference,
    gestionnaire,
    auteurId,
    maintenant,
  }: {
    readonly reference: ReferenceInvitation
    readonly gestionnaire: Gestionnaire
    readonly auteurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<RelanceEnvoyee, EchecDeRelancerUneInvitation>> => {
    if (!peutGererLEquipe(gestionnaire)(reference.coordinateurId))
      return failure(ActionNonAutorisee())

    const lue = await lireUneInvitation(reference)
    if (lue === null) return failure(InvitationIntrouvable())

    const enAttente = exigerEnAttente(lue.invitation)
    if (!enAttente.success) return enAttente

    const relancable = exigerUneRelancePossible(enAttente.data, maintenant)
    if (!relancable.success) return relancable

    const coordinateur = await lireLeCoordinateur(reference.coordinateurId)
    if (coordinateur === null) return failure(CoordinateurIntrouvable())

    const envoi: EnvoiDInvitation = {
      invitation: relancable.data,
      de: coordinateur.nom,
    }
    const envoye = await envoyerUneInvitation(envoi)
    if (!envoye.success) return envoye

    const relance: Relance = { reference, auteurId, renvoyeeLe: maintenant }

    await enregistrerLaRelance({ cle: lue.cle, ...relance })

    return success({ envoi, relance })
  }
