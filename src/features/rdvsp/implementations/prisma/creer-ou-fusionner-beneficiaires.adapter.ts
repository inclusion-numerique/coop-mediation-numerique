import { prismaClient } from '@/configuration/prisma'
import type { RdvUser } from '@/generated/prisma/client'
import type { CreerOuFusionnerDepuisUsagersExternes } from '../../domain/ports'

// Adaptateur (anti-corruption côté rdvsp) : traduit un usager RDV Service Public
// en primitifs pour le port bénéficiaire. rdvsp ne connaît ni les value objects
// ni la persistance du bénéficiaire — il ne lit que sa propre table `rdv_users`.
type RdvUserForMerge = Pick<
  RdvUser,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phoneNumber'
  | 'address'
  | 'birthDate'
>

const toExternalUser = (rdvUser: RdvUserForMerge) => ({
  rdvUserId: rdvUser.id,
  nom: rdvUser.lastName,
  prenom: rdvUser.firstName,
  telephone: rdvUser.phoneNumber,
  email: rdvUser.email,
  adresse: rdvUser.address,
  birthDate: rdvUser.birthDate,
})

/**
 * Variante par ids : charge les usagers depuis la table `rdv_users` puis délègue
 * au port. Renvoie aussi les usagers écartés (donnée d'infra en échec) pour
 * l'observabilité du job, sans jamais interrompre la synchro.
 */
export const creerOuFusionnerLesBeneficiaires =
  (creerOuFusionner: CreerOuFusionnerDepuisUsagersExternes) =>
  async ({
    rdvUsers,
    mediateurId,
  }: {
    rdvUsers: { id: number }[]
    mediateurId: string
  }) => {
    const users = await prismaClient.rdvUser.findMany({
      where: { id: { in: rdvUsers.map((rdvUser) => rdvUser.id) } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        address: true,
        birthDate: true,
      },
    })

    return creerOuFusionner({
      usagers: users.map(toExternalUser),
      mediateurId,
    })
  }
