export const utilisateurDuPartage = <
  Utilisateur extends { readonly coordinateur: unknown },
>(
  proprietaire: { readonly _tag: string },
  utilisateur: Utilisateur,
) => ({
  ...utilisateur,
  emplois: [],
  rdvAccount: null,
  coordinateur:
    proprietaire._tag === 'Coordinateur' ? utilisateur.coordinateur : null,
})
