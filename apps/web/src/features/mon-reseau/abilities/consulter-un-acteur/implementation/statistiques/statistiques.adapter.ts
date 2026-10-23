import { getTotalCountsStats } from '@app/web/features/statistiques/db/getTotalCountsStats'
import { format, subDays } from 'date-fns'
import { Effectif } from '../../../../domain'
import {
  FENETRE_DES_STATISTIQUES_EN_JOURS,
  type LireLesStatistiquesSur30Jours,
} from '../../domain'

const jour = (date: Date): string => format(date, 'yyyy-MM-dd')

export const lireLesStatistiquesSur30Jours: LireLesStatistiquesSur30Jours =
  async (coordinateurId, mediateurId, maintenant) => {
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
        du: jour(subDays(maintenant, FENETRE_DES_STATISTIQUES_EN_JOURS)),
        au: jour(maintenant),
      },
    })
    return {
      beneficiairesAccompagnes: Effectif(beneficiaires.total),
      accompagnements: Effectif(accompagnements.total),
    }
  }
