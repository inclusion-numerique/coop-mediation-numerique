export type EtatDesSuggestions<TItem, TPayload> = {
  readonly saisie: string
  readonly items: TItem[]
  readonly payload: TPayload
}

export const saisieEnCours =
  <TItem, TPayload>(saisie: string, payload: Partial<TPayload> = {}) =>
  (
    etat: EtatDesSuggestions<TItem, TPayload>,
  ): EtatDesSuggestions<TItem, TPayload> => ({
    ...etat,
    saisie,
    payload: { ...etat.payload, ...payload },
  })

export const reponseRecue =
  <TItem, TPayload>(
    saisie: string,
    reponse: { readonly items: TItem[]; readonly payload: TPayload },
  ) =>
  (
    etat: EtatDesSuggestions<TItem, TPayload>,
  ): EtatDesSuggestions<TItem, TPayload> =>
    etat.saisie === saisie
      ? { ...etat, items: reponse.items, payload: reponse.payload }
      : etat
