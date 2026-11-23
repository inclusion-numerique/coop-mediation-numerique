import { fenetreDe } from '@/features/activites/abilities/compter-les-accompagnements-par-periode'
import {
  criteresDesStatistiques,
  Jour,
  type PerimetreDesStatistiques,
} from '@/features/activites/domain'
import { dateAsIsoDay } from '@/libraries/date/dateAsIsoDay'
import type { RendezVousAuxStatuts } from '../../db/criteres-des-statistiques.sql'
import { statistiquesEnCours } from './statistiques-fournies'

export const statistiquesDuPerimetre =
  (rendezVousAuxStatuts: RendezVousAuxStatuts) =>
  ({
    perimetre,
    filtres,
    fin,
  }: {
    readonly perimetre: PerimetreDesStatistiques
    readonly filtres: Parameters<typeof criteresDesStatistiques>[0]
    readonly fin: Date
  }) => {
    const criteres = criteresDesStatistiques(filtres)
    const fenetre = fenetreDe({
      debut: criteres.periode.du,
      fin: Jour(dateAsIsoDay(fin)),
    })

    return statistiquesEnCours(
      {
        perimetre,
        criteres,
        rendezVousAuxStatuts,
        parJour: fenetre,
        parMois: fenetre,
      },
      { territoires: true, tags: true },
    )
  }
