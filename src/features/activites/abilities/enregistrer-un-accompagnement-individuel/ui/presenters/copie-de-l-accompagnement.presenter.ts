export const copieDeLAccompagnement = <T extends object>(valeurs: T) => ({
  ...valeurs,
  id: undefined,
  rdvServicePublicId: undefined,
})
