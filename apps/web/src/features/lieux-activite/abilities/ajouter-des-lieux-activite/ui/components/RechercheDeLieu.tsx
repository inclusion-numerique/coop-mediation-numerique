import { Options } from '@app/ui/components/Primitives/Options'
import type { LieuActiviteSearchResult } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation/searchLieuActiviteCombined'
import type { ComboBoxProps } from '@app/web/libs/form/fields-components/ComboBox'
import { Input } from '@app/web/libs/form/fields-components/Input'
import Button from '@codegouvfr/react-dsfr/Button'
import {
  LieuAAjouterOptions,
  type RechercheLieuAAjouter,
  rechercheMinimum,
} from './lieu-a-ajouter-combo-box'

/**
 * Ce que le ComboBox rend à qui l'affiche. Repris de sa signature plutôt que
 * réécrit : ces propriétés voyagent telles quelles depuis downshift.
 */
type RenduDuComboBox = Parameters<
  ComboBoxProps<LieuActiviteSearchResult, RechercheLieuAAjouter>['children']
>[0]

/**
 * La recherche d'un lieu à ajouter : le champ, la liste, et l'issue offerte à
 * qui n'y trouve pas son lieu.
 *
 * Le champ se branche seul sur le formulaire — `AppField` fournit le contexte
 * de champ à tout son sous-arbre, dont ce composant fait partie.
 */
export const RechercheDeLieu = ({
  isPending,
  onCreer,
  getLabelProps,
  getInputProps,
  getToggleButtonProps,
  payload,
  ...optionsProps
}: RenduDuComboBox & {
  isPending: boolean
  onCreer: () => void
}) => {
  const { recherche, enCours, enEchec, nonAffiches } = payload
  const rechercheFaite =
    !enCours && (recherche?.trim().length ?? 0) >= rechercheMinimum
  const rechercheAboutie = rechercheFaite && optionsProps.items.length === 0
  const sansResultat = rechercheAboutie && !enEchec
  const rechercheEnEchec = rechercheAboutie && enEchec

  const boutonCreer = (
    <Button
      type="button"
      priority="secondary"
      className="fr-width-full fr-justify-content-center fr-mb-0"
      disabled={isPending}
      onClick={onCreer}
    >
      Créer un lieu d’activité
    </Button>
  )

  /**
   * Trouver des résultats n'est pas trouver le bon : une recherche qui propose
   * dix lieux sans proposer CELUI qu'on a en tête enfermerait autant qu'une
   * recherche vide. La création reste donc offerte sous la liste, tant qu'il y
   * a une liste — le cas sans résultat porte déjà le sien, avec son explication.
   */
  const issue =
    rechercheFaite && optionsProps.items.length > 0 ? (
      <div>
        {nonAffiches > 0 && (
          <p className="fr-text--sm fr-text-mention--grey fr-mb-2v">
            Précisez votre recherche : {nonAffiches} structures ne sont pas
            affichées.
          </p>
        )}
        {boutonCreer}
      </div>
    ) : null

  // Un seul enfant, `null` quand il n'y a rien à dire : `Options` teste
  // `children &&` pour ouvrir son élément de liste, et une paire de conditions
  // serait un tableau toujours truthy — le menu s'ouvrirait vide dès le premier
  // clic dans le champ.
  const proposition = sansResultat ? (
    <div>
      <p className="fr-text--sm fr-text-mention--grey fr-mb-2v">
        Aucun lieu ne correspond à votre recherche.
      </p>
      {boutonCreer}
    </div>
  ) : rechercheEnEchec ? (
    <p className="fr-text--sm fr-text-default--error fr-mb-0">
      La recherche n’a pas abouti, veuillez réessayer.
    </p>
  ) : null

  return (
    <>
      <Input
        addonEnd={
          <Button
            title="Rechercher"
            className="fr-border-left-0"
            iconId="fr-icon-search-line"
            {...getToggleButtonProps({ type: 'button' })}
          />
        }
        isConnected={false}
        isPending={isPending}
        nativeLabelProps={getLabelProps()}
        nativeInputProps={getInputProps()}
        label="Rechercher un lieu d’activité par nom, adresse ou SIRET"
      />
      <Options
        {...optionsProps}
        {...LieuAAjouterOptions}
        showEmpty={proposition != null}
        footer={issue}
      >
        {proposition}
      </Options>
    </>
  )
}
