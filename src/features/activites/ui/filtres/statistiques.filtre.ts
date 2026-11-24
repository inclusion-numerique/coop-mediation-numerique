import { composerLEtat } from '@/libraries/etat-d-url/definition/composition'
import { filtreDePeriode } from '@/libraries/etat-d-url/definition/filtre-de-periode'
import {
  filtreDeLaSource,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDesEmployeuses,
  filtreDesLieux,
  filtreDesMediateurs,
  filtreDesTags,
  filtreDesThematiquesAdministratives,
  filtreDesThematiquesDeMediation,
  filtreDuDispositif,
  filtreDuTypeDActivite,
} from './activites.filtre'

export const filtresDesStatistiques = composerLEtat(
  filtreDePeriode,
  filtreDesMediateurs,
  filtreDesLieux,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDuTypeDActivite,
  filtreDuDispositif,
  filtreDeLaSource,
  filtreDesEmployeuses,
  filtreDesThematiquesDeMediation,
  filtreDesThematiquesAdministratives,
  filtreDesTags,
)

export type ValeursDesStatistiques = ReturnType<
  typeof filtresDesStatistiques.charger
>
