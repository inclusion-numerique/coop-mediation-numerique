import {
  type CriteresDesStatistiques,
  Jour,
  type PerimetreDesStatistiques,
} from '@/features/activites/domain'
import { fenetresDuPerimetre } from '@/features/activites/domain/fenetre-des-graphiques'
import { dateAsIsoDay } from '@/libraries/date'
import type { RendezVousAuxStatuts } from './criteres-des-statistiques.sql'
import type { LancerLesStatistiques } from './statistiques-en-cours.query'

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
  }) =>
    lancer(
      {
        perimetre,
        criteres,
        rendezVousAuxStatuts,
        ...fenetresDuPerimetre({
          du: criteres.periode.du,
          fin: Jour(dateAsIsoDay(fin)),
        }),
      },
      { territoires: true, tags: true },
    )
