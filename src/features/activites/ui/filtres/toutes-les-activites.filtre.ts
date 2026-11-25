import { composerLEtat, filtreDePeriode } from '@/libraries/etat-d-url'
import {
  filtreDeLaDemarche,
  filtreDeLaSource,
  filtreDeLOrigine,
  filtreDesBeneficiaires,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDesEmployeuses,
  filtreDesLieux,
  filtreDesMediateurs,
  filtreDesTags,
  filtreDesThematiquesAdministratives,
  filtreDesThematiquesDeMediation,
  filtreDuDispositif,
  filtreDuStatutDeRendezVous,
  filtreDuTypeDActivite,
} from './activites.filtre'

export const filtresDeToutesLesActivites = composerLEtat(
  filtreDePeriode,
  filtreDuTypeDActivite,
  filtreDuStatutDeRendezVous,
  filtreDesMediateurs,
  filtreDesBeneficiaires,
  filtreDesLieux,
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDuDispositif,
  filtreDeLaDemarche,
  filtreDeLOrigine,
  filtreDesThematiquesDeMediation,
  filtreDesThematiquesAdministratives,
  filtreDesTags,
  filtreDesEmployeuses,
  filtreDeLaSource,
)

export type ValeursDeToutesLesActivites = ReturnType<
  typeof filtresDeToutesLesActivites.charger
>
