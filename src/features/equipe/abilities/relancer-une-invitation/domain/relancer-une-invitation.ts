import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  CoordinateurIntrouvable,
  EnvoiEchoue,
  type EnvoyerUneInvitation,
  exigerEnAttente,
  exigerUneRelancePossible,
  type Gestionnaire,
  type InvitationDejaTraitee,
  InvitationIntrouvable,
  type LireLeCoordinateur,
  type LireUneInvitation,
  peutGererLEquipe,
  type ReferenceInvitation,
  type RelanceTropRecente,
  type Signaler,
  type UtilisateurId,
} from '../../../domain'

export type EchecDeRelance =
  | ActionNonAutorisee
  | InvitationIntrouvable
  | InvitationDejaTraitee
  | RelanceTropRecente
  | CoordinateurIntrouvable
  | EnvoiEchoue

export type EnregistrerLaRelance<Cle> = (relance: {
  readonly cle: Cle
  readonly reference: ReferenceInvitation
  readonly auteurId: UtilisateurId
  readonly maintenant: Date
}) => Promise<void>

export const relancerUneInvitation =
  <Cle>({
    lireUneInvitation,
    lireLeCoordinateur,
    envoyerUneInvitation,
    signaler,
    enregistrerLaRelance,
  }: {
    readonly lireUneInvitation: LireUneInvitation<Cle>
    readonly lireLeCoordinateur: LireLeCoordinateur
    readonly envoyerUneInvitation: EnvoyerUneInvitation
    readonly signaler: Signaler
    readonly enregistrerLaRelance: EnregistrerLaRelance<Cle>
  }) =>
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
  }): Promise<Result<void, EchecDeRelance>> => {
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

    const envoyee = await envoyerUneInvitation({
      invitation: relancable.data,
      de: coordinateur.nom,
    }).then(
      () => true,
      (erreur: unknown) => {
        signaler(erreur)
        return false
      },
    )
    if (!envoyee) return failure(EnvoiEchoue())

    await enregistrerLaRelance({
      cle: lue.cle,
      reference,
      auteurId,
      maintenant,
    })

    return success(undefined)
  }
