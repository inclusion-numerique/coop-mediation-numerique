import {
  type CriteresDesStatistiques,
  Jour,
  PERIMETRE_NATIONAL,
} from '@/features/activites/domain'
import { fenetresNationales } from '@/features/activites/domain/fenetre-des-graphiques'
import { dateAsIsoDay } from '@/libraries/date'
import type { RendezVousAuxStatuts } from './criteres-des-statistiques.sql'
import type { LancerLesStatistiques } from './statistiques-en-cours.query'

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
      ...fenetresNationales({
        du: criteres.periode.du,
        au: criteres.periode.au,
        aujourdhui,
      }),
    },
    { territoires: false, tags },
  )
}
