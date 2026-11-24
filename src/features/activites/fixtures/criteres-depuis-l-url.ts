import {
  criteresDesFiltres,
  criteresDesStatistiquesDesFiltres,
} from '../ui/filtres/activites.filtre'
import {
  criteresDesFiltresDeCoordination,
  filtresDesCoordinations,
} from '../ui/filtres/coordinations.filtre'
import { filtresDeToutesLesActivites } from '../ui/filtres/toutes-les-activites.filtre'

type ParametresDUrl = Readonly<Record<string, string | undefined>>

export const criteresDesActivitesDepuisLURL = (parametres: ParametresDUrl) =>
  criteresDesFiltres(filtresDeToutesLesActivites.charger(parametres))

export const criteresDesStatistiquesDepuisLURL = (parametres: ParametresDUrl) =>
  criteresDesStatistiquesDesFiltres(
    filtresDeToutesLesActivites.charger(parametres),
  )

export const criteresDesCoordinationsDepuisLURL = (
  parametres: ParametresDUrl,
) =>
  criteresDesFiltresDeCoordination(filtresDesCoordinations.charger(parametres))
