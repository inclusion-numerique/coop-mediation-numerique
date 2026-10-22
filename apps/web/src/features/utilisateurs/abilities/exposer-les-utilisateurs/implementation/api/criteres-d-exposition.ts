import {
  type CriteresDExposition,
  IdentifiantConseillerNumerique,
  IdentifiantDataspace,
  SelectionDesConseillers,
  SelectionDesSupprimes,
} from '../../domain'

type Drapeau = '0' | '1'

const identifiants =
  <T>(lire: (valeur: string) => T | null) =>
  (valeurs: readonly string[] | undefined): readonly T[] =>
    (valeurs ?? []).flatMap((valeur) => {
      const identifiant = lire(valeur)
      return identifiant === null ? [] : [identifiant]
    })

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
  identifiantsConseillerNumerique: identifiants(
    IdentifiantConseillerNumerique.safe,
  )(conseiller_numerique_id_pg),
  identifiantsDataspace: identifiants(IdentifiantDataspace.safe)(dataspace_id),
})
