import { prismaClient } from '@app/web/prismaClient'

const getTotalAccompagnements = async () =>
  await prismaClient.accompagnement.count({
    where: {
      beneficiaire: {
        AND: {
          suppression: null,
          anonyme: false,
        },
      },
    },
  })

const getTotalBeneficiairesSuivis = async () =>
  await prismaClient.beneficiaire.count({
    where: {
      AND: {
        suppression: null,
        anonyme: false,
      },
    },
  })

const getMediateursAvecBeneficiairesCount = async () => {
  const activitesAvecBeneficiaires = await prismaClient.activite.findMany({
    where: {
      accompagnements: {
        some: {
          beneficiaire: {
            anonyme: false,
          },
        },
      },
    },
    select: {
      mediateurId: true,
    },
  })

  return new Set(
    activitesAvecBeneficiaires.map(({ mediateurId }) => mediateurId),
  ).size
}

const getTotalMediateurs = async () =>
  await prismaClient.mediateur.count({
    where: {
      user: {
        deleted: null,
        inscriptionValidee: { not: null },
      },
    },
  })

const moyenneAccompagnements = (
  totalBeneficiairesSuivis: number,
  totalAccompagnements: number,
) =>
  totalBeneficiairesSuivis === 0
    ? 0
    : Math.round((totalAccompagnements / totalBeneficiairesSuivis) * 10) / 10

const getPercentage = (
  totalMediateurs: number,
  mediateursAvecBeneficiairesCount: number,
) =>
  totalMediateurs === 0
    ? 0
    : Math.round((mediateursAvecBeneficiairesCount / totalMediateurs) * 1000) /
      10

export const getSuiviBeneficiaires = async () => {
  const [
    totalAccompagnements,
    totalBeneficiairesSuivis,
    totalMediateurs,
    mediateursAvecBeneficiairesCount,
  ] = await Promise.all([
    getTotalAccompagnements(),
    getTotalBeneficiairesSuivis(),
    getTotalMediateurs(),
    getMediateursAvecBeneficiairesCount(),
  ])

  return {
    moyenneAccompagnements: {
      value: moyenneAccompagnements(
        totalBeneficiairesSuivis,
        totalAccompagnements,
      ),
      total: totalBeneficiairesSuivis,
    },
    mediateursAvecBeneficiaires: {
      value: mediateursAvecBeneficiairesCount,
      percentage: getPercentage(
        totalMediateurs,
        mediateursAvecBeneficiairesCount,
      ),
      total: totalMediateurs,
    },
  }
}
