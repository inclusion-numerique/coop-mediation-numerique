import TagScopeBadge from '@app/web/features/activites/use-cases/tags/components/TagScopeBadge'
import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import Checkbox from '@codegouvfr/react-dsfr/Checkbox'
import { formOptions } from '@tanstack/react-form'

export const tagToArray = (tagsOptions: { id: string }[]) => (tags: string[]) =>
  tags.length === 1 && tagsOptions.length === 1 ? tags.at(0) : tags

export const updateTagsParams =
  (params: URLSearchParams) =>
  (data: { value: { tags?: string | string[] } }) => {
    const tags: string[] =
      (data.value.tags == null || Array.isArray(data.value.tags)
        ? data.value.tags
        : [data.value.tags]) ?? []

    tags.length > 0 ? params.set('tags', tags.join(',')) : params.delete('tags')
  }

const options = formOptions({
  defaultValues: {} as DefaultValues<{
    tags: string[]
  }>,
})

export const TagsField = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    tagsOptions: { id: string; nom: string; scope: TagScope }[]
  },
  render: ({ form, isPending, tagsOptions }) => (
    <form.AppField name="tags">
      {(field) => (
        <>
          {tagsOptions.length > 1 && (
            <Checkbox
              className="fr-mb-6v"
              options={[
                {
                  label: 'Tous les tags',
                  nativeInputProps: {
                    checked: field.state.value?.length === tagsOptions.length,
                    onChange: (value) => {
                      field.setValue(
                        value.target.checked
                          ? tagsOptions.map(({ id }) => id)
                          : [],
                      )
                    },
                  },
                },
              ]}
            />
          )}
          <field.Checkbox
            isPending={isPending}
            isTiled={false}
            options={tagsOptions.map(({ id, nom, scope }) => {
              return {
                label: (
                  <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
                    {nom}
                    <TagScopeBadge scope={scope} />
                  </span>
                ),
                value: id,
              }
            })}
          />
        </>
      )}
    </form.AppField>
  ),
})
