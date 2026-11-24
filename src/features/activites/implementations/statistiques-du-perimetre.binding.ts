import {
  type CriteresDesStatistiques,
  Jour,
  type PerimetreDesStatistiques,
} from '@/features/activites/domain'
import { fenetreDe } from '@/features/activites/domain/fenetre-des-graphiques'
import { dateAsIsoDay } from '@/libraries/date/date-as-iso-day'
import type { RendezVousAuxStatuts } from './prisma/statistiques/criteres-des-statistiques.sql'
import type { LancerLesStatistiques } from './statistiques-en-cours.binding'

export const statistiquesDuPerimetre =
  <EnCours>(
    lancer: LancerLesStatistiques<EnCours>,
    rendezVousAuxStatuts: RendezVousAuxStatuts,
  ) =>
  ({
    perimetre,
    criteres,
    fin,
  }: {
    readonly perimetre: PerimetreDesStatistiques
    readonly criteres: CriteresDesStatistiques
    readonly fin: Date
  }) => {
    const fenetre = fenetreDe({
      debut: criteres.periode.du,
      fin: Jour(dateAsIsoDay(fin)),
    })

    return lancer(
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
