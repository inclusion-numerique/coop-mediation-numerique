export type LieuDuCra = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly lePlusUtilise: boolean
}

export type LieuTrouveParLeCra = {
  readonly id: string
  readonly nom: string
  readonly adresse: {
    readonly voie: string
    readonly code_postal: string
    readonly commune: string
  } | null
  readonly lePlusUtilise: boolean
}

export const lieuDuCra = ({
  id,
  nom,
  adresse,
  lePlusUtilise,
}: LieuTrouveParLeCra): LieuDuCra => ({
  id,
  nom,
  adresse:
    adresse == null
      ? ''
      : `${adresse.voie}, ${adresse.code_postal} ${adresse.commune}`,
  lePlusUtilise,
})

export const lieuLePlusUtilise = (
  lieux: readonly LieuDuCra[],
): LieuDuCra | undefined => lieux.find(({ lePlusUtilise }) => lePlusUtilise)
