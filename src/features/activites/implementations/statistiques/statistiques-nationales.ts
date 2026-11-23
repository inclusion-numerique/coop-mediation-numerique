import { fenetreDe } from '@/features/activites/abilities/compter-les-accompagnements-par-periode/domain/index'
import {
  type CriteresDesStatistiques,
  Jour,
  PERIMETRE_NATIONAL,
} from '@/features/activites/domain'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'
import type { RendezVousAuxStatuts } from '../prisma/criteres-des-statistiques.sql'
import { rassembler, statistiquesEnCours } from './statistiques-fournies'

export const statistiquesNationalesEnCours = (
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
  return statistiquesEnCours(
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

export const statistiquesNationales = (
  criteres: CriteresDesStatistiques,
  options: Parameters<typeof statistiquesNationalesEnCours>[1],
) => rassembler(statistiquesNationalesEnCours(criteres, options))
