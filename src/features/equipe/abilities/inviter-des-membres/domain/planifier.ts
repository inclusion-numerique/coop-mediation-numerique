import { failure, type Result, success } from '@/libraries/result'
import {
  type CoordinateurId,
  type Courriel,
  type Invitation,
  type InvitationEnAttente,
  type MediateurId,
  ReferenceInvitation,
} from '../../../domain'
import { type Ecart } from './ecart'
import { AucuneInvitationAEnvoyer } from './errors'
import { RaisonDEcart } from './raison-d-ecart'

export type Existant = {
  readonly invitations: readonly Invitation[]
  readonly membresActifs: ReadonlySet<Courriel>
  readonly mediateursConnus: ReadonlyMap<Courriel, MediateurId>
}

export type Planification = {
  readonly aEnvoyer: readonly InvitationEnAttente[]
  readonly ecartes: readonly Ecart[]
}

const raisonDEcart =
  ({ invitations, membresActifs }: Existant) =>
  (email: Courriel): RaisonDEcart | null => {
    if (membresActifs.has(email)) return RaisonDEcart('DejaMembre')
    return invitations.some(
      (invitation) =>
        invitation.reference.email === email &&
        invitation.statut === 'EnAttente',
    )
      ? RaisonDEcart('DejaInvitee')
      : null
  }

const nouvelleInvitation =
  (
    coordinateurId: CoordinateurId,
    { mediateursConnus }: Existant,
    maintenant: Date,
  ) =>
  (email: Courriel): InvitationEnAttente => {
    const mediateurId = mediateursConnus.get(email)
    return {
      reference: ReferenceInvitation({ email, coordinateurId }),
      invite:
        mediateurId === undefined
          ? { type: 'SansCompte' }
          : { type: 'MediateurInscrit', mediateurId },
      envoyeeLe: maintenant,
      renvoyeeLe: null,
      statut: 'EnAttente',
    }
  }

export const planifier = ({
  coordinateurId,
  candidats,
  existant,
  maintenant,
}: {
  coordinateurId: CoordinateurId
  candidats: readonly Courriel[]
  existant: Existant
  maintenant: Date
}): Result<Planification, AucuneInvitationAEnvoyer> => {
  const uniques = [...new Set(candidats)]
  const ecarter = raisonDEcart(existant)

  const ecartes = uniques.flatMap((email): Ecart[] => {
    const raison = ecarter(email)
    return raison === null ? [] : [{ email, raison }]
  })

  const aEnvoyer = uniques
    .filter((email) => ecarter(email) === null)
    .map(nouvelleInvitation(coordinateurId, existant, maintenant))

  return aEnvoyer.length === 0
    ? failure(AucuneInvitationAEnvoyer(ecartes))
    : success({ aEnvoyer, ecartes })
}
