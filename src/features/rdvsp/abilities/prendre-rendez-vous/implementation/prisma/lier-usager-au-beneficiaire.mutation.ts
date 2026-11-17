import { prismaClient } from '@app/web/prismaClient'
import type { LierUsagerAuBeneficiaire } from '../../domain/prendre-rendez-vous'

/**
 * L'usager rendu par RDV Service Public vient d'être créé chez eux et n'est
 * rattaché à aucune organisation : son profil n'est pas encore consultable par
 * l'API. On l'enregistre donc avec ce que La Coop sait déjà, le webhook le
 * complétera. D'où les valeurs de repli sur les noms, obligatoires en base.
 *
 * L'ensemble est transactionnel : un usager créé sans que le bénéficiaire lui
 * soit rattaché conduirait à en recréer un au rendez-vous suivant.
 */
export const lierUsagerAuBeneficiaire: LierUsagerAuBeneficiaire = async ({
  beneficiaire,
  usagerId,
}) => {
  await prismaClient.$transaction(async (transaction) => {
    await transaction.rdvUser.upsert({
      where: { id: usagerId },
      create: {
        id: usagerId,
        firstName: beneficiaire.prenom ?? '-',
        lastName: beneficiaire.nom ?? '-',
        email: beneficiaire.email,
        phoneNumber: beneficiaire.telephone,
        notifyByEmail: false,
        notifyBySms: false,
      },
      update: {},
    })

    await transaction.beneficiaire.update({
      where: { id: beneficiaire.id },
      data: { rdvUserId: usagerId },
    })
  })
}
