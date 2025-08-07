import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { formOptions } from '@tanstack/react-form'

export const roleCount = ({
  conseiller_numerique,
}: {
  conseiller_numerique?: '0' | '1'
}) => {
  return conseiller_numerique === '1' ? 1 : 0
}

export const updateRolesParams =
  (params: URLSearchParams) =>
  (data: { value: { conseiller_numerique?: '0' | '1' } }) => {
    data.value.conseiller_numerique !== '0' &&
    data.value.conseiller_numerique !== '1'
      ? params.delete('conseiller_numerique')
      : params.set('conseiller_numerique', data.value.conseiller_numerique)
  }

const conseillerNumeriqueOptions = [
  { label: 'Tous les rôles', value: '' },
  { label: 'Conseillers numériques', value: '1' },
  { label: 'Médiateurs numériques', value: '0' },
]

const options = formOptions({
  defaultValues: {} as DefaultValues<{
    conseiller_numerique: '0' | '1' | undefined
  }>,
})

export const RolesField = withForm({
  ...options,
  props: {} as {
    isPending: boolean
  },
  render: ({ form, isPending }) => (
    <form.AppField name="conseiller_numerique">
      {(field) => (
        <field.RadioButtons
          isPending={isPending}
          isTiled={false}
          legend={<h2 className="fr-h6 fr-mb-0">Filtrer par rôle&nbsp;:</h2>}
          options={conseillerNumeriqueOptions}
        />
      )}
    </form.AppField>
  ),
})
