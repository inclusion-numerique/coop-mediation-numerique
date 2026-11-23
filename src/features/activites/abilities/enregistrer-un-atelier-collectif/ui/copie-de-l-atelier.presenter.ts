type AtelierCopiable = {
  readonly participantsAnonymes?: object | null
  readonly [champ: string]: unknown
}

export const copieDeLAtelier = <T extends AtelierCopiable>(valeurs: T) => ({
  ...valeurs,
  id: undefined,
  rdvServicePublicId: undefined,
  participantsAnonymes: valeurs.participantsAnonymes
    ? { ...valeurs.participantsAnonymes, id: undefined }
    : undefined,
})
