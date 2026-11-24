'use client'

import Checkbox from '@codegouvfr/react-dsfr/Checkbox'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { BadgeDePortee } from '@/features/activites/ui/components/BadgeDePortee'
import { FilterFooter } from '@/libraries/filtres/FilterFooter'
import TriggerButton from '@/libraries/filtres/TriggerButton'
import { handleSubmit } from '@/libraries/formulaire/handle-submit'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { requeteAvec } from '@/libraries/parametres-d-url'
import { Popover } from '@/libraries/ui/components/Primitives/Popover'
import type { OptionDeTag } from '../presenters/options-de-filtre.presenter'
import {
  listeChoisie,
  listeEnParametres,
} from '../search-params/filtres-des-coordinations.search-params'

export const FiltreDeTags = ({
  tagOptions,
}: {
  tagOptions: readonly OptionDeTag[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)

  const tags = listeChoisie(searchParams, 'tags')

  const setFilters = () => {
    const choisis = [form.state.values.tags ?? []].flat()
    router.replace(
      requeteAvec(searchParams, listeEnParametres('tags', choisis)),
      { scroll: false },
    )
  }

  const clearFilters = () => {
    form.reset()
    router.replace(requeteAvec(searchParams, listeEnParametres('tags', [])), {
      scroll: false,
    })
    setIsOpen(false)
  }

  const form = useAppForm({
    defaultValues: { tags: tagOptions.length === 1 ? tags.join() : tags },
    onSubmit: setFilters,
  })

  return (
    <Popover
      open={isOpen}
      onOpenChange={(openState) => {
        openState && form.reset({ tags })
        setIsOpen(openState)
      }}
      onEscapeKeyDown={() => form.handleSubmit()}
      onInteractOutside={() => form.handleSubmit()}
      trigger={
        <TriggerButton isOpen={isOpen} isFilled={tags.length > 0}>
          Tags
          {tags.length > 0 && ` · ${tags.length}`}
        </TriggerButton>
      }
    >
      <form
        style={{ width: 384 }}
        onSubmit={(e) => handleSubmit(form)(e).then(() => setIsOpen(false))}
      >
        <form.AppForm>
          <form.AppField name="tags">
            {(field) => (
              <>
                <span className="fr-label fr-text--medium fr-mb-4v">
                  Filtrer par tags&nbsp;:
                </span>
                {tagOptions.length > 1 && (
                  <Checkbox
                    className="fr-mb-6v"
                    options={[
                      {
                        label: 'Tous les tags',
                        nativeInputProps: {
                          checked:
                            field.state.value?.length === tagOptions.length,
                          onChange: (value) => {
                            field.setValue(
                              value.target.checked
                                ? tagOptions.map(({ value }) => value)
                                : [],
                            )
                          },
                        },
                      },
                    ]}
                  />
                )}
                <field.Checkbox
                  isPending={false}
                  isTiled={false}
                  options={tagOptions.map(({ value, label, portee }) => ({
                    label: (
                      <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
                        {label}
                        <BadgeDePortee portee={portee} />
                      </span>
                    ),
                    value,
                  }))}
                />
              </>
            )}
          </form.AppField>
        </form.AppForm>
        <FilterFooter onClearFilters={clearFilters} />
      </form>
    </Popover>
  )
}
