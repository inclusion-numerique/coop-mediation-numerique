import { prismaClient } from '@/configuration/prisma'

const getAccompagnementsDesBeneficiairesSuivis = async () => {
  const { _count, _sum } = await prismaClient.beneficiaire.aggregate({
    where: {
      anonyme: false,
      v1Imported: null,
      accompagnementsCount: { gt: 0 },
    },
    _count: true,
    _sum: { accompagnementsCount: true },
  })
  return {
    totalBeneficiairesSuivis: _count,
    totalAccompagnements: _sum.accompagnementsCount ?? 0,
  }
}

const getMediateursAvecBeneficiairesCount = async () =>
  (
    await prismaClient.beneficiaire.groupBy({
      by: ['mediateurId'],
      where: {
        anonyme: false,
        v1Imported: null,
        accompagnementsCount: { gt: 0 },
      },
    })
  ).length

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

export const suiviDesBeneficiaires = async () => {
  const [
    { totalAccompagnements, totalBeneficiairesSuivis },
    totalMediateurs,
    mediateursAvecBeneficiairesCount,
  ] = await Promise.all([
    getAccompagnementsDesBeneficiairesSuivis(),
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
