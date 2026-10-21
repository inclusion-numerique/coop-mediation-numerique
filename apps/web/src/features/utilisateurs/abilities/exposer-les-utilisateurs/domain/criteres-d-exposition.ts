export type CriteresDExposition = {
  readonly supprimes: 'Exclus' | 'Seuls' | 'Inclus'
  readonly conseillerNumerique: boolean | null
  readonly identifiantsConseillerNumerique: readonly number[]
  readonly identifiantsDataspace: readonly number[]
}

const entiers = (valeurs: readonly string[] | undefined): readonly number[] =>
  (valeurs ?? [])
    .map((valeur) => Number.parseInt(valeur, 10))
    .filter((valeur) => !Number.isNaN(valeur))

const supprimesSelon: Record<'0' | '1', CriteresDExposition['supprimes']> = {
  '0': 'Exclus',
  '1': 'Seuls',
}

export const criteresDExposition = ({
  soft_deleted,
  conseiller_numerique,
  conseiller_numerique_id_pg,
  dataspace_id,
}: {
  readonly soft_deleted?: '0' | '1'
  readonly conseiller_numerique?: '0' | '1'
  readonly conseiller_numerique_id_pg?: readonly string[]
  readonly dataspace_id?: readonly string[]
}): CriteresDExposition => ({
  supprimes:
    soft_deleted === undefined ? 'Inclus' : supprimesSelon[soft_deleted],
  conseillerNumerique:
    conseiller_numerique === undefined ? null : conseiller_numerique === '1',
  identifiantsConseillerNumerique: entiers(conseiller_numerique_id_pg),
  identifiantsDataspace: entiers(dataspace_id),
})
