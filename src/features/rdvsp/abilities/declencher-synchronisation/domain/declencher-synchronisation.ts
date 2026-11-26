import {
  type CompteRdv,
  estUtilisable,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import {
  CompteRdvIntrouvable,
  diagnosticErreur,
  type EchecDeSynchronisation,
} from '@/features/rdvsp/domain/errors'
import type { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import type { Result } from '@/libraries/result'
import { failure, success } from '@/libraries/result'
import {
  type EchecDeDeclencherSynchronisation,
  type MarquageDEchec,
  NonAutorise,
  SynchronisationEchouee,
} from './errors'
import type { DeclencherSynchronisationPorts } from './ports'

type RoleDemandeur = 'User' | 'Admin'

export type Demandeur = {
  readonly id: UtilisateurCoopId
  readonly role: RoleDemandeur
}

export type SynchronisationDeclenchee = {
  readonly derive: number
  readonly synchroniseeLe: Date | null
}

/**
 * Qui peut déclencher une synchronisation pour qui.
 *
 * Chacun pour soi, l'assistance pour tous : la synchronisation est aussi un
 * geste de dépannage, et l'écran d'administration existe pour cela. La règle
 * vivait dans le routeur, mêlée à la résolution de l'utilisateur.
 */
const peutDeclencherPour = (
  demandeur: Demandeur,
  cible: UtilisateurCoopId,
): boolean => demandeur.id === cible || demandeur.role === 'Admin'

/**
 * Ce que la passe a effectivement à parcourir.
 *
 * `sansObjet` couvre les deux cas où il n'y a rien à faire — compte sans jetons,
 * ou rattrapage demandé alors que tous les webhooks sont posés — et les sépare de
 * `organisations`, qui restreint la passe. Une liste vide ne doit jamais valoir
 * « tout resynchroniser » : c'est la confusion qu'évite ce type (DM-5).
 */
type PorteeDeclenchement =
  | { readonly _tag: 'sansObjet' }
  | { readonly _tag: 'toutesOrganisations' }
  | {
      readonly _tag: 'organisations'
      readonly organisationIds: readonly OrganisationId[]
    }

const porteePour = (
  compte: CompteRdv,
  seulementSansWebhook: boolean,
  relanceAutorisee: boolean,
): PorteeDeclenchement => {
  if (compte._tag === 'enErreur' && (seulementSansWebhook || !relanceAutorisee))
    return { _tag: 'sansObjet' }

  if (!seulementSansWebhook) return { _tag: 'toutesOrganisations' }

  return compte.organisationIdsSansWebhook.length === 0
    ? { _tag: 'sansObjet' }
    : {
        _tag: 'organisations',
        organisationIds: compte.organisationIdsSansWebhook,
      }
}

/**
 * Message consigné sur le compte, repris tel quel par l'écran d'administration.
 * Il reste volontairement générique : l'erreur technique part vers Sentry, pas
 * vers un médiateur.
 */
export const MESSAGE_ECHEC =
  'Impossible de récupérer les données du compte RDV Service Public'

const motifsDefinitifs: readonly EchecDeSynchronisation['_tag'][] = [
  'JetonRevoque',
  'AccesRefuse',
  'AgentSupprime',
]

const causeASignaler = (echec: EchecDeSynchronisation): unknown =>
  echec._tag === 'ErreurTechnique'
    ? echec.erreur
    : new Error(
        `Impossible de synchroniser le compte RDV (${diagnosticErreur(echec)})`,
      )

/**
 * Déclenche une passe de synchronisation à la demande.
 *
 * Le contrôle d'accès précède la lecture du compte : refuser avant de regarder
 * évite de révéler par le message d'erreur qu'un compte existe.
 *
 * Un échec de la passe est signalé, puis consigné sur le compte quand un nouvel
 * essai ne le résoudra pas : le drapeau déclenche l'alerte de reconnexion chez le
 * médiateur, et une API momentanément injoignable ne doit pas la lui adresser.
 */
export const declencherSynchronisation =
  ({
    compteACible,
    synchroniser,
    marquerEchec,
    signaler,
  }: DeclencherSynchronisationPorts) =>
  async ({
    demandeur,
    utilisateurId,
    seulementSansWebhook,
    maintenant,
  }: {
    readonly demandeur: Demandeur
    readonly utilisateurId: UtilisateurCoopId
    readonly seulementSansWebhook: boolean
    readonly maintenant: Date
  }): Promise<
    Result<SynchronisationDeclenchee, EchecDeDeclencherSynchronisation>
  > => {
    if (!peutDeclencherPour(demandeur, utilisateurId)) {
      return failure(NonAutorise())
    }

    const cible = await compteACible(utilisateurId)

    if (cible === null) {
      return failure(CompteRdvIntrouvable(utilisateurId))
    }

    const { compte, mediateurId } = cible

    if (!estUtilisable(compte)) {
      return success({ derive: 0, synchroniseeLe: null })
    }

    const portee = porteePour(
      compte,
      seulementSansWebhook,
      demandeur.role === 'Admin',
    )

    if (portee._tag === 'sansObjet') {
      return success({ derive: 0, synchroniseeLe: null })
    }

    const synchronisation = await synchroniser({
      compte,
      mediateurId,
      maintenant,
      ...(portee._tag === 'organisations'
        ? { organisationIds: portee.organisationIds }
        : {}),
    })

    if (synchronisation.success) {
      return success({
        derive: synchronisation.data.derive,
        synchroniseeLe: maintenant,
      })
    }

    signaler(causeASignaler(synchronisation.error))

    const marquage: MarquageDEchec | null = motifsDefinitifs.includes(
      synchronisation.error._tag,
    )
      ? { agentId: compte.agentId, message: MESSAGE_ECHEC, le: maintenant }
      : null

    if (marquage !== null) await marquerEchec(marquage)

    return failure(SynchronisationEchouee(marquage))
  }
