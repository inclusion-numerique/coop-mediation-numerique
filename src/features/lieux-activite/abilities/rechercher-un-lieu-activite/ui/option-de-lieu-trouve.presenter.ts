import type { LieuActiviteTrouve } from '../domain'

export type OptionDeLieuTrouve = {
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly lePlusUtilise: boolean
}

export const optionDeLieuTrouve = ({
  id,
  nom,
  adresse,
  lePlusUtilise,
}: LieuActiviteTrouve): OptionDeLieuTrouve => ({
  id,
  nom,
  adresse:
    adresse == null
      ? ''
      : `${adresse.voie}, ${adresse.code_postal} ${adresse.commune}`,
  lePlusUtilise,
})
