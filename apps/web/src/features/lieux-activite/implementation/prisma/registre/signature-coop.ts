const EDITE_PAR = 'coop'
const SOURCE_COOP = 'Coop numérique'

export const signatureCoop = (maintenant: Date) => ({
  source: SOURCE_COOP,
  editedBy: EDITE_PAR,
  updatedAtCoop: maintenant,
})

export const retraitCoop = (maintenant: Date) => ({
  deletedAt: maintenant,
  editedBy: EDITE_PAR,
  updatedAtCoop: maintenant,
})
