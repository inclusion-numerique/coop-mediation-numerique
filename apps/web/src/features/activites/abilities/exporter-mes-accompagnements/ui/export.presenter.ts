import type { OptionsDeLaBarre } from '../../../ui/filtres/BarreDeFiltres'
import type { FiltresDeLaListe } from '../../../ui/filtres/filtres-de-la-liste'
import {
  type ActivitesFiltersLabels,
  generateActivitesFiltersLabels,
} from '../../../ui/filtres/libelles-des-filtres'
import { optionsDesSources } from '../../../ui/libelles/source-de-l-activite'

export const libellesDeLExport = (
  filtres: FiltresDeLaListe,
  options: OptionsDeLaBarre,
): ActivitesFiltersLabels =>
  generateActivitesFiltersLabels(filtres, {
    communesOptions: options.communes,
    departementsOptions: options.departements,
    lieuxActiviteOptions: options.lieux,
    structuresEmployeusesOptions: options.employeuses.map(({ id, nom }) => ({
      id,
      nom,
    })),
    tagsOptions: options.tags.map(({ id, nom }) => ({ id, nom })),
    beneficiairesOptions: [],
    mediateursOptions: [],
    optionsDesSources: options.importsV1 ? [...optionsDesSources] : [],
  })

export const requeteDeLExport = (filtres: FiltresDeLaListe): string =>
  new URLSearchParams(
    Object.entries(filtres).flatMap(([cle, valeur]) => {
      const texte = Array.isArray(valeur) ? valeur.join(',') : (valeur ?? '')
      return texte === '' ? [] : [[cle, texte]]
    }),
  ).toString()

export const cheminAvecRequete = (chemin: string, requete: string): string =>
  requete === '' ? chemin : `${chemin}?${requete}`
