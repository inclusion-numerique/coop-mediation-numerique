const EDITE_PAR = 'coop'
const SOURCE_COOP = 'Coop numérique'

/** Qui a agi, et quand. Ce que toute écriture de la coop laisse au registre. */
const editionCoop = (maintenant: Date) => ({
  editedBy: EDITE_PAR,
  updatedAtCoop: maintenant,
})

/**
 * Une écriture de valeurs métier : la coop devient le producteur de ce que la
 * ligne dit désormais.
 */
export const signatureCoop = (maintenant: Date) => ({
  source: SOURCE_COOP,
  ...editionCoop(maintenant),
})

/**
 * Un retrait n'écrit aucune valeur métier : `source` continue de nommer le
 * producteur de celles qui restent dans la ligne, et `edited_by` dit seul qui a
 * agi.
 */
export const retraitCoop = (maintenant: Date) => ({
  deletedAt: maintenant,
  ...editionCoop(maintenant),
})

/**
 * Une dépublication non plus : elle ne touche qu'au partage, dont la coop est
 * l'auteur.
 */
export const depublicationCoop = (maintenant: Date) => ({
  visiblePourCartographieNationale: false,
  ...editionCoop(maintenant),
})
