import { composerLEtat, filtreDePeriode } from '@/libraries/etat-d-url'
import {
  filtreDeLaSource,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDesEmployeuses,
  filtreDesLieux,
  filtreDesTags,
  filtreDesThematiquesAdministratives,
  filtreDesThematiquesDeMediation,
  filtreDuStatutDeRendezVous,
  filtreDuTypeDActivite,
} from '../../../../ui/filtres/activites.filtre'

export const filtresDeMesActivites = composerLEtat(
  filtreDePeriode,
  filtreDesLieux,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDuTypeDActivite,
  filtreDuStatutDeRendezVous,
  filtreDeLaSource,
  filtreDesEmployeuses,
  filtreDesThematiquesDeMediation,
  filtreDesThematiquesAdministratives,
  filtreDesTags,
)

export type ValeursDeMesActivites = ReturnType<
  typeof filtresDeMesActivites.charger
>
