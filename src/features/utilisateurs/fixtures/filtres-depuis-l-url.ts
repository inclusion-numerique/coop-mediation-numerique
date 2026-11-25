import {
  filtresDesUtilisateurs,
  filtresUtilisateursDesFiltres,
} from '../ui/filtres/utilisateurs.filtre'

export const filtresUtilisateursDepuisLURL = (
  parametres: Readonly<Record<string, string | readonly string[] | undefined>>,
) => filtresUtilisateursDesFiltres(filtresDesUtilisateurs.charger(parametres))
