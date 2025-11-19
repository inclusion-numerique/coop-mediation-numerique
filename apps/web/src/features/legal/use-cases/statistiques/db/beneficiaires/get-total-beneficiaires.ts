import { computeProportion } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/allocatePercentages'
import { prismaClient } from '@app/web/prismaClient'

const countBeneficiaires = async (anonyme: boolean) =>
  prismaClient.beneficiaire.count({
    where: {
      anonyme,
      accompagnements: {
        some: { activite: { suppression: null } },
      },
    },
  })

export const getTotalBeneficiaires = async () => {
  const [beneficiairesSuivis, beneficiairesAnonymes] = await Promise.all([
    countBeneficiaires(false),
    countBeneficiaires(true),
  ])

  const totalBeneficiaires = beneficiairesSuivis + beneficiairesAnonymes

  return {
    byBeneficiairesSuivis: {
      value: beneficiairesSuivis,
      percentage: computeProportion(beneficiairesSuivis, totalBeneficiaires),
    },
    byBeneficiairesAnonymes: {
      value: beneficiairesAnonymes,
      percentage: computeProportion(beneficiairesAnonymes, totalBeneficiaires),
    },
    total: totalBeneficiaires,
  }
}
