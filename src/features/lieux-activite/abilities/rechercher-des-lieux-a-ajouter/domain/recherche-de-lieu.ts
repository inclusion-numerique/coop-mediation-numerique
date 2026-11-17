import { defineModel } from '@app/web/libraries/model'
import { z } from 'zod'
import { TermeDeRecherche } from './terme-de-recherche'

export type RechercheDeLieu =
  | { readonly _tag: 'TropCourte' }
  | { readonly _tag: 'ParNumeroDEntreprise'; readonly terme: TermeDeRecherche }
  | { readonly _tag: 'ParNom'; readonly terme: TermeDeRecherche }

const SIREN_OU_SIRET = /^\d{9,14}$/

const sansEspaces = (texte: string): string => texte.replace(/\s/g, '')

const rechercheDeLieu = (texte: string): RechercheDeLieu => {
  const terme = TermeDeRecherche.safe(texte)

  if (terme == null) return { _tag: 'TropCourte' }

  return SIREN_OU_SIRET.test(sansEspaces(terme))
    ? {
        _tag: 'ParNumeroDEntreprise',
        terme: TermeDeRecherche(sansEspaces(terme)),
      }
    : { _tag: 'ParNom', terme }
}

export const RechercheDeLieu = defineModel(
  z.string().transform(rechercheDeLieu),
)
