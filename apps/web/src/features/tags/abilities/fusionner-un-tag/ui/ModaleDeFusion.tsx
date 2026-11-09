'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { Options } from '@app/ui/components/Primitives/Options'
import { useModalVisibility } from '@app/ui/hooks/useModalVisibility'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { pluriel } from '@app/web/libraries/pluriel'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { inject } from '@app/web/libs/injection/client'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useStore } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { TypeDePortee } from '../../../domain'
import { BadgeDePortee, LigneDuTag, type TagAffiche } from '../../../ui'
import { FUSIONNER_UN_TAG_ACTION_KEY } from '../action/fusionner-un-tag.key'
import { RECHERCHER_DES_DESTINATIONS_ACTION_KEY } from '../action/rechercher-des-destinations.key'
import type { DestinationAffichee } from './destination-affichee'

export type TagAFusionner = {
  readonly tag: TagAffiche
  readonly accompagnements: number
}

export const FusionDUnTag = createDynamicModal<TagAFusionner | null>({
  id: 'merge-tag-modal',
  isOpenedByDefault: false,
  initialState: null,
})

const DESTINATIONS_POSSIBLES: Partial<
  Record<TypeDePortee, { titre: string; portees: readonly TypeDePortee[] }>
> = {
  Equipe: {
    titre: 'Un tag d’équipe peut fusionner uniquement vers',
    portees: ['Equipe', 'Departemental', 'National'],
  },
  Departemental: {
    titre: 'Un tag départemental peut fusionner uniquement vers',
    portees: ['Departemental', 'National'],
  },
}

const rechercher =
  (sourceId: string) =>
  async (recherche: string): Promise<{ items: DestinationAffichee[] }> => {
    const resultat = await inject(RECHERCHER_DES_DESTINATIONS_ACTION_KEY)({
      sourceId,
      recherche,
    })
    return { items: resultat.success ? [...resultat.data] : [] }
  }

const cleDeLaDestination = ({ tag }: DestinationAffichee): string => tag.id

const destinationEnLigne = ({ item }: { item: DestinationAffichee }) => (
  <LigneDuTag tag={item.tag} accompagnements={item.accompagnements} small />
)

const comboBoxDesDestinations = (
  sourceId: string,
): ComboBoxData<DestinationAffichee> => ({
  itemToString: (destination) => destination?.tag.nom ?? '',
  itemToKey: cleDeLaDestination,
  loadSuggestions: rechercher(sourceId),
})

type Etape = 'selection' | 'confirmation'

const Fusion = ({ source }: { source: TagAFusionner }) => {
  const [etape, setEtape] = useState<Etape>('selection')
  const [suggestions, setSuggestions] = useState<DestinationAffichee[]>([])
  const conteneurRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const valeursInitiales: { destination: DestinationAffichee | null } = {
    destination: null,
  }

  const form = useAppForm({
    defaultValues: valeursInitiales,
    onSubmit: async ({ value }) => {
      if (value.destination === null) return

      const resultat = await inject(FUSIONNER_UN_TAG_ACTION_KEY)({
        sourceId: source.tag.id,
        destinationId: value.destination.tag.id,
      })

      if (!resultat.success) {
        createToast({
          priority: 'error',
          message: 'Une erreur est survenue lors de la fusion du tag.',
        })
        return
      }

      FusionDUnTag.close()
      createToast({
        priority: 'success',
        message: `Le tag "${source.tag.nom}" a bien été fusionné`,
      })
      router.refresh()
    },
  })

  const destination = useStore(form.store, (state) => state.values.destination)
  const enCours = useStore(form.store, (state) => state.isSubmitting)

  const reinitialiser = useCallback(() => {
    setEtape('selection')
    form.reset()
  }, [form])

  useModalVisibility(FusionDUnTag.id, { onClosed: reinitialiser })

  useEffect(() => {
    reinitialiser()
    rechercher(source.tag.id)('').then(({ items }) => setSuggestions(items))
  }, [reinitialiser, source.tag.id])

  const destinationsPossibles = DESTINATIONS_POSSIBLES[source.tag.portee]

  return (
    <form.AppForm>
      <FusionDUnTag.Component
        title={
          etape === 'selection' ? 'Fusion de tag' : 'Confirmation de la fusion'
        }
        buttons={
          etape === 'selection'
            ? [
                {
                  children: 'Annuler',
                  priority: 'secondary',
                  disabled: enCours,
                  type: 'button',
                  onClick: reinitialiser,
                },
                {
                  children: 'Continuer',
                  type: 'button',
                  disabled: destination === null,
                  onClick: () => setEtape('confirmation'),
                  doClosesModal: false,
                },
              ]
            : [
                {
                  children: 'Retour',
                  priority: 'secondary',
                  disabled: enCours,
                  type: 'button',
                  onClick: () => setEtape('selection'),
                  doClosesModal: false,
                },
                {
                  children: 'Confirmer la fusion',
                  type: 'button',
                  onClick: () => form.handleSubmit(),
                  ...buttonLoadingClassname(enCours),
                  doClosesModal: false,
                },
              ]
        }
      >
        {etape === 'selection' && (
          <>
            <p>
              En fusionnant ce tag, les activités qui lui sont liées seront
              ajoutées au tag de destination que vous allez sélectionner.
            </p>
            <div className="fr-px-4v fr-py-6v fr-border fr-border-radius--8">
              <LigneDuTag
                tag={source.tag}
                accompagnements={source.accompagnements}
                small
              />
            </div>
            <hr className="fr-separator-8v" />
            <form.AppField name="destination">
              {(field) => (
                <field.ComboBox
                  isPending={enCours}
                  defaultItems={suggestions}
                  {...comboBoxDesDestinations(source.tag.id)}
                >
                  {({
                    getLabelProps,
                    getInputProps,
                    getToggleButtonProps,
                    ...options
                  }) => (
                    <>
                      <div ref={conteneurRef}>
                        <field.Input
                          addonEnd={
                            <Button
                              title="Voir la liste des tags"
                              className="fr-border-left-0 fr-py-7v fr-pl-4v"
                              iconId="fr-icon-search-line"
                              {...getToggleButtonProps({ type: 'button' })}
                            />
                          }
                          addinEnd={
                            field.state.value != null && (
                              <Button
                                title="Désélectionner le tag"
                                type="button"
                                size="large"
                                iconId="fr-icon-close-line"
                                priority="tertiary no outline"
                                onClick={() => {
                                  field.setValue(null)
                                  options.setInputValue('')
                                }}
                              />
                            )
                          }
                          isConnected={false}
                          isPending={enCours}
                          nativeLabelProps={getLabelProps()}
                          classes={{ nativeInputOrTextArea: 'fr-input--tall' }}
                          nativeInputProps={{
                            ...getInputProps(),
                            placeholder: 'Rechercher un tag de destination',
                          }}
                          label="Sélectionner le tag de destination&nbsp;:"
                        />
                      </div>
                      <Options
                        {...options}
                        itemToKey={cleDeLaDestination}
                        renderItem={destinationEnLigne}
                        anchorRef={conteneurRef}
                        className="fr-index-2000"
                      />
                    </>
                  )}
                </field.ComboBox>
              )}
            </form.AppField>
            {destination !== null && (
              <div className="fr-px-4v fr-py-6v fr-border fr-border-radius--8 fr-mt-3v">
                {destinationEnLigne({ item: destination })}
              </div>
            )}
            {destination === null && destinationsPossibles !== undefined && (
              <div className="fr-mt-4v fr-background-alt--blue-france fr-px-6v fr-py-4v fr-border-radius--8">
                <div className="fr-mb-3v fr-text--sm">
                  {destinationsPossibles.titre}&nbsp;:
                </div>
                <div className="fr-flex fr-flex-gap-2v">
                  {destinationsPossibles.portees.map((portee) => (
                    <BadgeDePortee key={portee} portee={portee} small />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {etape === 'confirmation' && destination !== null && (
          <div className="fr-flex fr-direction-column fr-flex-gap-4v">
            <Notice
              className="fr-notice--info fr-my-4v"
              title={
                <span className="fr-text--regular fr-text-default--grey">
                  La fusion des tags est définitive.
                </span>
              }
            />
            <div className="fr-px-4v fr-py-6v fr-border fr-border-radius--8">
              <LigneDuTag
                tag={source.tag}
                accompagnements={source.accompagnements}
                small
              />
            </div>
            <span className="fr-flex fr-flex-gap-2v fr-align-items-center fr-justify-content-center">
              <span
                className="ri-arrow-down-line ri-xl fr-text-label--blue-france fr-text--center"
                aria-hidden
              />
              <Badge
                severity="info"
                noIcon
                className="fr-text-label--blue-france"
              >
                <span className="ri-service-line" aria-hidden />
                &nbsp;
                <span className="ri-add-line" aria-hidden />{' '}
                {source.accompagnements}{' '}
                {pluriel(
                  source.accompagnements,
                  'accompagnement',
                  'accompagnements',
                )}
              </Badge>
            </span>
            <div className="fr-px-4v fr-py-6v fr-border fr-border-radius--8">
              {destinationEnLigne({ item: destination })}
            </div>
          </div>
        )}
      </FusionDUnTag.Component>
    </form.AppForm>
  )
}

export const ModaleDeFusion = () => {
  const source = FusionDUnTag.useState()
  return source === null ? null : <Fusion source={source} />
}
