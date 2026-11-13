import { allocatePercentages } from '@app/web/libraries/proportions'
import { anonymes, type TotauxDesAccompagnements } from '../domain'

export const totauxPresentes = (totaux: TotauxDesAccompagnements) => {
  const [activitesIndividuelles = 0, activitesCollectives = 0] =
    allocatePercentages([
      totaux.activites.individuelles,
      totaux.activites.collectives,
    ])
  const [accompagnementsIndividuels = 0, accompagnementsCollectifs = 0] =
    allocatePercentages([
      totaux.activites.individuelles,
      totaux.accompagnements.collectifs,
    ])
  return {
    activites: {
      total: totaux.activites.total,
      individuels: {
        total: totaux.activites.individuelles,
        proportion: activitesIndividuelles,
      },
      collectifs: {
        total: totaux.activites.collectives,
        proportion: activitesCollectives,
        participants: totaux.accompagnements.collectifs,
      },
    },
    accompagnements: {
      total: totaux.accompagnements.total,
      individuels: {
        total: totaux.activites.individuelles,
        proportion: accompagnementsIndividuels,
      },
      collectifs: {
        total: totaux.accompagnements.collectifs,
        proportion: accompagnementsCollectifs,
      },
    },
    beneficiaires: {
      total: totaux.personnes.total,
      nouveaux: totaux.personnes.nouvelles,
      suivis: totaux.personnes.suivies,
      anonymes: anonymes(totaux),
    },
  }
}

export type TotauxPresentes = ReturnType<typeof totauxPresentes>
