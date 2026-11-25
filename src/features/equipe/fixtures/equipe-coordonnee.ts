import { mergeUuids } from '@/libraries/fixtures'

type MembresDeLEquipe = {
  readonly inviteEnAttente: string
  readonly conseillerNumeriqueActif: string
  readonly mediateurActif: string
  readonly conseillerNumeriqueInactif: string
  readonly mediateurInactif: string
  readonly mediateurAQuitte: string
  readonly conseillerNumeriqueAQuitte: string
  readonly mediateurProfilSupprime: string
  readonly conseillerNumeriqueProfilSupprime: string
}

export type EquipeDeDemonstration = {
  readonly coordinateurId: string
  readonly membres: MembresDeLEquipe
}

export const coordinationDeLEquipe = ({
  coordinateurId,
  membres,
}: EquipeDeDemonstration) => ({
  coordinateurId,
  mediateurIds: [
    membres.conseillerNumeriqueActif,
    membres.mediateurActif,
    membres.conseillerNumeriqueInactif,
    membres.mediateurInactif,
    membres.mediateurProfilSupprime,
    membres.conseillerNumeriqueProfilSupprime,
  ],
})

const depart = (coordinateurId: string, mediateurId: string) => ({
  id: mergeUuids(coordinateurId, mediateurId),
  coordinateurId,
  mediateurId,
  suppression: new Date(),
})

export const departsDeLEquipe = ({
  coordinateurId,
  membres,
}: EquipeDeDemonstration) => [
  depart(coordinateurId, membres.mediateurAQuitte),
  depart(coordinateurId, membres.conseillerNumeriqueAQuitte),
]

export const invitationsDeLEquipe = ({
  coordinateurId,
  membres,
}: EquipeDeDemonstration) => [
  {
    email: 'invitation-attente@test.fr',
    coordinateurId,
    mediateurId: membres.inviteEnAttente,
  },
  {
    email: 'personne.sans-compte@test.fr',
    coordinateurId,
    mediateurId: null,
  },
]
