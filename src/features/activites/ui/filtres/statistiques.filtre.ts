import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import { filtreDePeriode } from '@/libraries/filtres/definition/filtre-de-periode'
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

export const filtresDesStatistiques = composerLesFiltres(
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
