import { filtreDeRecherche } from '@/libraries/filtres/definition/filtre-de-recherche'
import { CodeInsee } from '@/libraries/insee'
import { LignesParPage, NumeroDePage, Recherche } from '../../domain'

export const filtreDesCommunesDuReseau = filtreDeRecherche({
  titre: 'Communes',
  prefixe: 'Commune : ',
  cle: 'communes',
  schema: CodeInsee.schema,
})

export type ParametresDuReseau = Readonly<
  Record<string, string | readonly string[] | undefined>
>

export const premiere = (
  valeur: string | readonly string[] | undefined,
): string | undefined => (typeof valeur === 'string' ? valeur : valeur?.at(0))

export const etatDeLaListeDuReseau = (parametres: ParametresDuReseau) => ({
  recherche: Recherche.safe(premiere(parametres.recherche) ?? ''),
  page: NumeroDePage(premiere(parametres.page)),
  lignes: LignesParPage(premiere(parametres.lignes)),
})
