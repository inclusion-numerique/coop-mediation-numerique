'use client'

import { Popover } from '@app/ui/components/Primitives/Popover'
import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import { FilterFooter } from '@app/web/libs/filters/FilterFooter'
import TriggerButton from '@app/web/libs/filters/TriggerButton'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Checkbox from '@codegouvfr/react-dsfr/Checkbox'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export const ActiviteCoordinationTagFilter = ({
  tagOptions,
}: {
  tagOptions: { value: string; label: string; scope: TagScope }[]
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const [isOpen, setIsOpen] = useState(false)

  const tags = searchParams.get('tags')?.split(',').filter(Boolean) ?? []

  const setFilters = () => {
    if (Array.isArray(form.state.values.tags)) {
      form.state.values.tags.length > 0
        ? params.set('tags', form.state.values.tags.join(','))
        : params.delete('tags')
    } else {
      form.state.values.tags
        ? params.set('tags', form.state.values.tags)
        : params.delete('tags')
    }

    router.replace(`?${params}`, { scroll: false })
  }

  const clearFilters = () => {
    form.reset()
    params.delete('tags')
    router.replace(`?${params}`, { scroll: false })
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
                  options={tagOptions.map(({ value, label, scope }) => ({
                    label: (
                      <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
                        {label}{' '}
                        <Badge
                          className={classNames(
                            'fr-text--nowrap',
                            scope === TagScope.Personnel
                              ? 'fr-text-mention--grey'
                              : undefined,
                          )}
                          severity={
                            scope === TagScope.Personnel ? undefined : 'info'
                          }
                          noIcon
                        >
                          Tag {scope}
                        </Badge>
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
