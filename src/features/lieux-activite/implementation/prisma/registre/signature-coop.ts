const EDITE_PAR = 'coop'
const SOURCE_COOP = 'Coop numérique'

const editionCoop = (maintenant: Date) => ({
  editedBy: EDITE_PAR,
  updatedAtCoop: maintenant,
})

export const signatureCoop = (maintenant: Date) => ({
  source: SOURCE_COOP,
  deletedAt: null,
  ...editionCoop(maintenant),
})

export const retraitCoop = (maintenant: Date) => ({
  deletedAt: maintenant,
  ...editionCoop(maintenant),
})

export const depublicationCoop = (maintenant: Date) => ({
  visiblePourCartographieNationale: false,
  ...editionCoop(maintenant),
})
