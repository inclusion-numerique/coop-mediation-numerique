import {
  type CriteresDesStatistiques,
  Jour,
  PERIMETRE_NATIONAL,
} from '@/features/activites/domain'
import { fenetreDe } from '@/features/activites/domain/fenetre-des-graphiques'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'
import type { RendezVousAuxStatuts } from './prisma/statistiques/criteres-des-statistiques.sql'
import type { LancerLesStatistiques } from './statistiques-en-cours.binding'

export const statistiquesNationalesEnCours = <E>(
  lancer: LancerLesStatistiques<E>,
  criteres: CriteresDesStatistiques,
  {
    tags,
    rendezVousAuxStatuts,
  }: {
    readonly tags: boolean
    readonly rendezVousAuxStatuts: RendezVousAuxStatuts
  },
) => {
  const aujourdhui = Jour(dateAsIsoDay(new Date()))
  return lancer(
    {
      perimetre: PERIMETRE_NATIONAL,
      criteres,
      rendezVousAuxStatuts,
      parJour: fenetreDe({
        debut: criteres.periode.du,
        fin: criteres.periode.au ?? aujourdhui,
      }),
      parMois: fenetreDe({ debut: null, fin: aujourdhui }),
    },
    { territoires: false, tags },
  )
}
