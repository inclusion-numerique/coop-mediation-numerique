import {
  type CriteresDExposition,
  SelectionDesConseillers,
  SelectionDesSupprimes,
} from '../../domain'

type Drapeau = '0' | '1'

const entiers = (valeurs: readonly string[] | undefined): readonly number[] =>
  (valeurs ?? [])
    .map((valeur) => Number.parseInt(valeur, 10))
    .filter((valeur) => !Number.isNaN(valeur))

const supprimesSelon = (drapeau: Drapeau | undefined): SelectionDesSupprimes =>
  SelectionDesSupprimes(
    drapeau === undefined ? 'Inclus' : drapeau === '1' ? 'Seuls' : 'Exclus',
  )

const conseillersSelon = (
  drapeau: Drapeau | undefined,
): SelectionDesConseillers =>
  SelectionDesConseillers(
    drapeau === undefined
      ? 'Indifferent'
      : drapeau === '1'
        ? 'Seuls'
        : 'Exclus',
  )

export const criteresDExposition = ({
  soft_deleted,
  conseiller_numerique,
  conseiller_numerique_id_pg,
  dataspace_id,
}: {
  readonly soft_deleted?: Drapeau
  readonly conseiller_numerique?: Drapeau
  readonly conseiller_numerique_id_pg?: readonly string[]
  readonly dataspace_id?: readonly string[]
}): CriteresDExposition => ({
  supprimes: supprimesSelon(soft_deleted),
  conseillersNumeriques: conseillersSelon(conseiller_numerique),
  identifiantsConseillerNumerique: entiers(conseiller_numerique_id_pg),
  identifiantsDataspace: entiers(dataspace_id),
})
