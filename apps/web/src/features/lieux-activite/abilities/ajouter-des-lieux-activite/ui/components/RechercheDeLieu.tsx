import { Options } from '@app/ui/components/Primitives/Options'
import type { SuggestionDeLieu } from '@app/web/features/lieux-activite/domain/suggestion-de-lieu'
import type { ComboBoxProps } from '@app/web/libs/form/fields-components/ComboBox'
import { Input } from '@app/web/libs/form/fields-components/Input'
import Button from '@codegouvfr/react-dsfr/Button'
import {
  LieuAAjouterOptions,
  type RechercheLieuAAjouter,
  rechercheMinimum,
} from './lieu-a-ajouter-combo-box'

type RenduDuComboBox = Parameters<
  ComboBoxProps<SuggestionDeLieu, RechercheLieuAAjouter>['children']
>[0]

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
