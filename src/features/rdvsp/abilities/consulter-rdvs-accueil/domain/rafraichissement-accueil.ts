import type { WidgetRdvAccueil } from './widget-rdv'

export type RafraichissementAccueil =
  | { readonly _tag: 'inchange' }
  | {
      readonly _tag: 'rafraichi'
      readonly derive: number
      readonly widget: WidgetRdvAccueil
    }
