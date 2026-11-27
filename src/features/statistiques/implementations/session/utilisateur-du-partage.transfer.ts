export type ProprietaireDuPartage = {
  readonly _tag: 'Mediateur' | 'Coordinateur'
}

export const utilisateurDuPartage = <
  Utilisateur extends { readonly coordinateur: unknown },
>(
  proprietaire: ProprietaireDuPartage,
  utilisateur: Utilisateur,
) => ({
  ...utilisateur,
  emplois: [],
  rdvAccount: null,
  coordinateur:
    proprietaire._tag === 'Coordinateur' ? utilisateur.coordinateur : null,
})
