'use client'

import { Options } from '@app/ui/components/Primitives/Options'
import { pluriel } from '@app/web/libraries/pluriel'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import Button from '@codegouvfr/react-dsfr/Button'
import {
  LieuAFusionnerOptions,
  type LieuChoisi,
  lieuAFusionnerComboBox,
  type RechercheDeFusion,
  rechercheMinimum,
} from './lieu-a-fusionner-combo-box'

/**
 * Le champ qui désigne le lieu avec lequel fusionner.
 *
 * Rien n'est soumis : choisir SUFFIT, l'écran navigue aussitôt vers l'aperçu de
 * la fusion. Le champ n'existe donc que le temps d'une sélection.
 */
export const RechercheDUnLieu = ({
  excludeStructureIds = [],
  defaultStructure,
  onSelect,
}: {
  excludeStructureIds?: string[]
  defaultStructure?: LieuChoisi
  onSelect: (lieu: LieuChoisi) => void
}) => {
  const form = useAppForm({
    defaultValues: { lieu: (defaultStructure ?? null) as LieuChoisi | null },
  })

  const isPending = !useHydrated()

  return (
    <form.AppForm>
      <form.AppField name="lieu">
        {(field) => (
          <field.ComboBox
            isPending={isPending}
            onSelect={onSelect}
            {...lieuAFusionnerComboBox(excludeStructureIds)}
          >
            {({
              getLabelProps,
              getInputProps,
              getToggleButtonProps,
              payload,
              ...optionsProps
            }) => {
              const { recherche, enCours, nonAffiches } =
                payload as RechercheDeFusion
              const rechercheFaite =
                !enCours && (recherche?.trim().length ?? 0) >= rechercheMinimum

              const sansResultat =
                rechercheFaite && optionsProps.items.length === 0

              const tronquee =
                rechercheFaite &&
                optionsProps.items.length > 0 &&
                nonAffiches > 0

              return (
                <>
                  <field.Input
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
                    nativeInputProps={{
                      ...getInputProps(),
                      placeholder: 'Rechercher une structure...',
                    }}
                    label=""
                  />
                  <Options
                    {...optionsProps}
                    {...LieuAFusionnerOptions}
                    showEmpty={sansResultat}
                    footer={
                      tronquee ? (
                        <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
                          Précisez votre recherche&nbsp;: {nonAffiches}{' '}
                          {pluriel(
                            nonAffiches,
                            'structure n’est pas affichée',
                            'structures ne sont pas affichées',
                          )}
                        </p>
                      ) : null
                    }
                  >
                    {sansResultat ? (
                      <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
                        Aucun lieu ne correspond à votre recherche.
                      </p>
                    ) : null}
                  </Options>
                </>
              )
            }}
          </field.ComboBox>
        )}
      </form.AppField>
    </form.AppForm>
  )
}

export default RechercheDUnLieu
