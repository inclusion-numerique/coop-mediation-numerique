export type AccueilRafraichi<Widget> =
  | { readonly _tag: 'inchange' }
  | {
      readonly _tag: 'rafraichi'
      readonly derive: number
      readonly widget: Widget
    }
