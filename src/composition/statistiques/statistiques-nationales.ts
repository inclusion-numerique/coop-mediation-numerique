import { fenetreDe } from '@app/web/features/activites/abilities/compter-les-accompagnements-par-periode'
import {
  type CriteresDesStatistiques,
  Jour,
  PERIMETRE_NATIONAL,
} from '@app/web/features/activites/domain'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { rendezVousAuxStatutsSql } from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { rassembler, statistiquesEnCours } from './statistiques-fournies'

export const statistiquesNationalesEnCours = (
  criteres: CriteresDesStatistiques,
  { tags }: { readonly tags: boolean },
) => {
  const aujourdhui = Jour(dateAsIsoDay(new Date()))
  return statistiquesEnCours(
    {
      perimetre: PERIMETRE_NATIONAL,
      criteres,
      conseillersNumeriques: conseillerNumeriqueSql,
      rendezVousAuxStatuts: rendezVousAuxStatutsSql,
      parJour: fenetreDe({
        debut: criteres.periode.du,
        fin: criteres.periode.au ?? aujourdhui,
      }),
      parMois: fenetreDe({ debut: null, fin: aujourdhui }),
    },
    { territoires: false, tags },
  )
}

export const statistiquesNationales = (
  criteres: CriteresDesStatistiques,
  options: { readonly tags: boolean },
) => rassembler(statistiquesNationalesEnCours(criteres, options))
