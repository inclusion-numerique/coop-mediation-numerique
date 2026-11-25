import { composerLEtat, filtreDePeriode } from '@/libraries/etat-d-url'
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
