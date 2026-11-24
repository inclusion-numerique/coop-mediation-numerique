import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import { filtreDePeriode } from '@/libraries/filtres/definition/filtre-de-periode'
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

export const filtresDeToutesLesActivites = composerLesFiltres(
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
