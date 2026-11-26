import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { usagerFromDomain } from '../../../../implementations/prisma/entourage.transfer'
import type {
  AnonymiserEtSupprimerUsager,
  BeneficiairesLiesAUsager,
  MettreAJourUsager,
} from '../../domain/ports'
import { garderUnSeulCodePostal } from './un-seul-code-postal.mutation'

export const beneficiairesLiesAUsager: BeneficiairesLiesAUsager = async (
  usagerId,
) =>
  await prismaClient.beneficiaire.findMany({
    where: { rdvUserId: usagerId, suppression: null },
    select: { id: true },
  })

export const mettreAJourUsager: MettreAJourUsager = async (usager) => {
  await prismaClient.rdvUser.update({
    where: { id: usager.id },
    data: usagerFromDomain(usager),
  })
}

/**
 * L'anonymisation efface l'identité et marque la suppression, sans détruire la
 * fiche : les statistiques du médiateur reposent sur des données anonymes —
 * tranche d'âge, genre — qui doivent survivre au départ de la personne.
 */
export const anonymiserEtSupprimerUsager: AnonymiserEtSupprimerUsager = async ({
  usagerId,
  beneficiaires,
}) => {
  await prismaClient.$transaction(async (transaction) => {
    if (beneficiaires.length > 0) {
      await transaction.beneficiaire.updateMany({
        where: { id: { in: beneficiaires.map(({ id }) => id) } },
        data: {
          anonyme: true,
          suppression: new Date(),
          modification: new Date(),
          rdvUserId: null,
          prenom: null,
          nom: null,
          telephone: null,
          email: null,
          notes: null,
          adresse: null,
          pasDeTelephone: null,
        },
      })
      await garderUnSeulCodePostal(
        transaction,
        Prisma.sql`id = ANY(${beneficiaires.map(({ id }) => id)}::uuid[])`,
      )
    }

    // Les fiches déjà supprimées gardent le rattachement : il faut le rompre
    // avant que l'usager ne disparaisse.
    await transaction.beneficiaire.updateMany({
      where: { rdvUserId: usagerId },
      data: { rdvUserId: null },
    })

    await transaction.rdvUser.deleteMany({ where: { id: usagerId } })
  })
}
