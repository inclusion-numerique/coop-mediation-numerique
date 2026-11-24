import Checkbox from '@codegouvfr/react-dsfr/Checkbox'
import { withForm } from '@/libraries/formulaire/use-app-form'
import type { MotDuVocabulaire } from '../../labels/barre.labels'
import { plusDeFiltresFormOptions } from '../plus-de-filtres.form-options'

export const ThematiqueAdministrativesFiled = withForm({
  ...plusDeFiltresFormOptions,
  props: {} as {
    mots: readonly MotDuVocabulaire[]
    isPending: boolean
  },
  render: ({ form, isPending, mots }) => (
    <form.AppField name="thematiqueAdministratives">
      {(field) => (
        <>
          <Checkbox
            className="fr-mb-3v"
            options={[
              {
                label: 'Toutes les thématiques de démarches administrative',
                nativeInputProps: {
                  checked: field.state.value?.length === mots.length,
                  onChange: (value) => {
                    field.setValue(
                      value.target.checked
                        ? mots.map(({ value }) => value)
                        : [],
                    )
                  },
                },
              },
            ]}
          />
          <field.Checkbox
            classes={{
              content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-0',
            }}
            isPending={isPending}
            isTiled={false}
            options={[...mots]}
          />
        </>
      )}
    </form.AppField>
  ),
})
