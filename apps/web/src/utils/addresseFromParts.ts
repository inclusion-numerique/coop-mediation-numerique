/**
 * Adresse d'une seule pièce, à partir de composantes dont chacune peut manquer.
 *
 * Aucune n'est garantie : un établissement non diffusible n'a ni voie ni code
 * postal — seule sa commune est sûre — et `main.adresse` laisse la voie
 * facultative. Les gabarits fixes du type « voie, code postal commune »
 * rendaient alors des « , 66300 Thuir » ou « , Trelissac ».
 *
 * On assemble donc les morceaux présents. Le résultat est une chaîne vide quand
 * il n'y a rien à montrer : aux appelants de ne pas afficher la ligne du tout.
 */
export const addresseFromParts = ({
  adresse,
  codePostal,
  commune,
}: {
  adresse?: string | null // Voie seule (ex. « 123 rue de la plage »)
  commune?: string | null
  codePostal?: string | null
}): string =>
  [adresse, [codePostal, commune].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')
