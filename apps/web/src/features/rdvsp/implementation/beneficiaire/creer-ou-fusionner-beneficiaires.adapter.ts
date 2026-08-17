import {
  creerOuFusionnerBeneficiairesDepuisUsagersExternes,
  type ExternalUserToMerge,
  type MergedBeneficiaire,
} from '@app/web/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe'
import { prismaClient } from '@app/web/prismaClient'
import type { RdvUser } from '@prisma/client'

// Adaptateur (anti-corruption côté rdvsp) : traduit un usager RDV Service Public
// en primitifs pour le port bénéficiaire. rdvsp ne connaît ni les value objects
// ni la persistance du bénéficiaire — il ne lit que sa propre table `rdv_users`.
export type RdvUserForMerge = Pick<
  RdvUser,
  | 'id'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phoneNumber'
  | 'address'
  | 'birthDate'
>

export type { MergedBeneficiaire } from '@app/web/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe'

const toExternalUser = (rdvUser: RdvUserForMerge): ExternalUserToMerge => ({
  rdvUserId: rdvUser.id,
  nom: rdvUser.lastName,
  prenom: rdvUser.firstName,
  telephone: rdvUser.phoneNumber,
  email: rdvUser.email,
  adresse: rdvUser.address,
  birthDate: rdvUser.birthDate,
})

/**
 * Crée ou fusionne les bénéficiaires des usagers RDV fournis (données déjà en
 * mémoire) et renvoie les fiches mergées — consommées par la construction des
 * CRA.
 */
export const createOrMergeBeneficiairesFromRdvUsers = async ({
  rdvUsers,
  mediateurId,
}: {
  rdvUsers: RdvUserForMerge[]
  mediateurId: string
}): Promise<MergedBeneficiaire[]> => {
  const { merges } = await creerOuFusionnerBeneficiairesDepuisUsagersExternes({
    usagers: rdvUsers.map(toExternalUser),
    mediateurId,
  })
  return merges
}

/**
 * Variante par ids : charge les usagers depuis la table `rdv_users` puis délègue
 * au port. Renvoie aussi les usagers écartés (donnée d'infra en échec) pour
 * l'observabilité du job, sans jamais interrompre la synchro.
 */
export const createOrMergeBeneficiairesFromRdvUserIds = async ({
  rdvUsers,
  mediateurId,
}: {
  rdvUsers: { id: number }[]
  mediateurId: string
}): Promise<{
  merges: MergedBeneficiaire[]
  skipped: { readonly rdvUserId: number; readonly reason: unknown }[]
}> => {
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

  return creerOuFusionnerBeneficiairesDepuisUsagersExternes({
    usagers: users.map(toExternalUser),
    mediateurId,
  })
}
