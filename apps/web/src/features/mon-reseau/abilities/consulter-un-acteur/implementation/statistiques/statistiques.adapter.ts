import { getTotalCountsStats } from '@app/web/features/statistiques/db/getTotalCountsStats'
import { format, subDays } from 'date-fns'
import { Effectif } from '../../../../domain'
import {
  type LireLesStatistiquesSur30Jours,
  SEUIL_D_INACTIVITE_EN_JOURS,
} from '../../domain'

const jour = (date: Date): string => format(date, 'yyyy-MM-dd')

export const lireLesStatistiquesSur30Jours: LireLesStatistiquesSur30Jours =
  async (coordinateurId, mediateurId) => {
    const maintenant = new Date()
    const { beneficiaires, accompagnements } = await getTotalCountsStats({
      user: {
        coordinateur: {
          id: coordinateurId,
          mediateursCoordonnes: [],
          ancienMediateursCoordonnes: [],
        },
      },
      mediateurIds: [mediateurId],
      activitesFilters: {
        du: jour(subDays(maintenant, SEUIL_D_INACTIVITE_EN_JOURS)),
        au: jour(maintenant),
      },
    })
    return {
      beneficiairesAccompagnes: Effectif(beneficiaires.total),
      accompagnements: Effectif(accompagnements.total),
    }
  }
