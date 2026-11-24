import { composerLEtat } from '@/libraries/etat-d-url/definition/composition'
import { filtreDePeriode } from '@/libraries/etat-d-url/definition/filtre-de-periode'
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
