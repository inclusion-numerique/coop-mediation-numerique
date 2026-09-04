import { pluriel } from '@app/web/libraries/pluriel'
import type { LieuActiviteSearchResult } from '@app/web/structure/searchLieuActiviteCombined'
import Button from '@codegouvfr/react-dsfr/Button'
import type { ReactNode } from 'react'

/**
 * Une entrée de la liste de suggestions.
 *
 * Le libellé est un nœud React, parce que c'en est un : `react-select` les rend
 * très bien mais les type en chaînes. La conversion est faite une seule fois,
 * au branchement du composant, plutôt que répandue sur chaque entrée.
 */
export type OptionDeRecherche = { label: ReactNode; value: string }

/** Une entrée qui informe sans se sélectionner : en-tête, pied, invitation. */
const mention = (label: ReactNode): OptionDeRecherche => ({ label, value: '' })

export const rechercheTropCourte = (): readonly OptionDeRecherche[] => [
  mention('La recherche doit contenir au moins 3 caractères'),
]

export const nombreDeResultats = (
  matchesCount: number,
): readonly OptionDeRecherche[] => [
  mention(`${matchesCount} ${pluriel(matchesCount, 'résultat', 'résultats')}`),
]

/** Un lieu trouvé : sa dénomination, puis ce qui permet de le situer. */
export const optionDeStructure = (
  structure: LieuActiviteSearchResult,
): OptionDeRecherche => ({
  label: (
    <>
      <div className="fr-width-full fr-text--sm fr-mb-0">{structure.nom}</div>
      <div className="fr-width-full fr-text--xs fr-text-mention--grey fr-mb-0">
        {structure.typologie ? `${structure.typologie} · ` : null}
        {structure.adresse}
        {structure.adresse && (structure.codePostal || structure.commune)
          ? ', '
          : null}
        {structure.codePostal}
        {structure.codePostal && structure.commune ? ' ' : null}
        {structure.commune}
      </div>
    </>
  ),
  value: structure.id,
})

/**
 * Le pied de liste dit l'une ou l'autre chose, jamais les deux : ou bien la
 * recherche déborde et il faut la préciser, ou bien elle est complète et le
 * lieu manquant reste à créer.
 */
export const piedDeListe = (
  nonAffiches: number,
  onCreer: () => void,
): readonly OptionDeRecherche[] =>
  nonAffiches > 0
    ? [
        mention(
          `Veuillez préciser votre recherche - ${nonAffiches} ${pluriel(
            nonAffiches,
            'structure n’est pas affichée',
            'structures ne sont pas affichées',
          )}`,
        ),
      ]
    : [
        mention(
          <div style={{ marginBottom: -16 }}>
            Vous ne trouvez pas votre lieu d’activité ?
          </div>,
        ),
        mention(
          <div className="fr-btns-group">
            <Button
              type="button"
              priority="secondary"
              className="fr-width-full fr-mb-0"
              onClick={onCreer}
            >
              Créer un lieu d’activité
            </Button>
          </div>,
        ),
      ]
