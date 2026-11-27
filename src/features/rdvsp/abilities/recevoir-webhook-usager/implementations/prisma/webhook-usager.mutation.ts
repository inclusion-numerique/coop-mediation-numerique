import { prismaClient } from '@/configuration/prisma'
import { Prisma } from '@/generated/prisma/client'
import { usagerFromDomain } from '../../../../implementations/prisma/entourage.transfer'
import type {
  AnonymiserEtSupprimerUsager,
  MettreAJourUsager,
} from '../../domain/ports'
import { garderUnSeulCodePostal } from './un-seul-code-postal.mutation'

export const mettreAJourUsager: MettreAJourUsager = async (usager) => {
  await prismaClient.rdvUser.update({
    where: { id: usager.id },
    data: usagerFromDomain(usager),
  })
}

export const anonymiserEtSupprimerUsager: AnonymiserEtSupprimerUsager = async ({
  usagerId,
  beneficiaires,
  anonymiseLe,
}) => {
  await prismaClient.$transaction(async (transaction) => {
    if (beneficiaires.length > 0) {
      await transaction.beneficiaire.updateMany({
        where: { id: { in: beneficiaires.map(({ id }) => id) } },
        data: {
          anonyme: true,
          suppression: anonymiseLe,
          modification: anonymiseLe,
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

    await transaction.beneficiaire.updateMany({
      where: { rdvUserId: usagerId },
      data: { rdvUserId: null },
    })

    await transaction.rdvUser.deleteMany({ where: { id: usagerId } })
  })
}
