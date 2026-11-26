import { contientSansAccent } from '@/libraries/texte'
import { type DepartementDuReferentiel, departements } from './departements'

type DepartementRecherche = {
  readonly code: string
  readonly nom: string
}

const sansSeparateur = (texte: string): string =>
  texte.replace(/[-'’\s]+/g, ' ').trim()

export const correspondALaRecherche =
  (recherche: string) =>
  ({ code, nom }: DepartementRecherche): boolean =>
    code.startsWith(recherche.trim().toUpperCase()) ||
    contientSansAccent(sansSeparateur(nom), sansSeparateur(recherche))

export const rechercherDesDepartements = (
  recherche: string,
): DepartementDuReferentiel[] =>
  departements.filter(correspondALaRecherche(recherche))
