import { fenetreDe } from '@/features/activites/abilities/compter-les-accompagnements-par-periode'
import {
  type CriteresDesStatistiques,
  Jour,
  PERIMETRE_NATIONAL,
} from '@/features/activites/domain'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'
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
