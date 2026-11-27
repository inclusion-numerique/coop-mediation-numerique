import {
  coordinationDuPartage,
  type ProprietaireDuPartage,
} from '../../domain/proprietaire-du-partage'

export const utilisateurDuPartage = <
  Utilisateur extends { readonly coordinateur: unknown },
>(
  proprietaire: ProprietaireDuPartage,
  utilisateur: Utilisateur,
) => ({
  ...utilisateur,
  emplois: [],
  rdvAccount: null,
  coordinateur: coordinationDuPartage(proprietaire, utilisateur.coordinateur),
})
