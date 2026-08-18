import type { WidgetRdvAccueil } from './widget-rdv'

/**
 * Ce qu'une passe de rattrapage rend à l'accueil déjà affiché.
 *
 * `inchange` dit « rien n'a dérivé, garde ce que tu montres » ; il ne doit pas se
 * confondre avec un widget devenu masqué ou en alerte. L'ancien contrat ramenait
 * les trois cas à `donnees: null` : un compte tombé en panne pendant la passe —
 * des jetons révoqués, par exemple — laissait alors des compteurs périmés à
 * l'écran sans un mot, jusqu'au rechargement complet de la page.
 */
export type RafraichissementAccueil =
  | { readonly _tag: 'inchange' }
  | {
      readonly _tag: 'rafraichi'
      readonly derive: number
      readonly widget: WidgetRdvAccueil
    }
