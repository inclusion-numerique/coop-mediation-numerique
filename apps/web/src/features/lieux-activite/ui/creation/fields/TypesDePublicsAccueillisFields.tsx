'use client'

import {
  priseEnChargeSpecifiqueOptions,
  publicSpecifiquementAdresseOptions,
} from '@app/web/features/lieux-activite/ui/options'
import { withForm } from '@app/web/libs/form/use-app-form'
import { type PublicSpecifiquementAdresse } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { creerLieuActiviteFormOptions } from '../creer-lieu-activite.form-options'

const tousLesPublics: PublicSpecifiquementAdresse[] =
  publicSpecifiquementAdresseOptions.map(({ value }) => value)

const sontTousCoches = (publics: PublicSpecifiquementAdresse[]) =>
  publics.length === tousLesPublics.length

export const TypesDePublicsAccueillisFields = withForm({
  ...creerLieuActiviteFormOptions,
  props: {} as { isPending: boolean },
  render: ({ form, isPending }) => (
    <>
      <p className="fr-mb-1v fr-mt-1w">
        Précisez les publics accueillis dans ce lieu
      </p>
      <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
        Par défaut, un lieu d’inclusion numérique est inclusif et peut
        accueillir tout public. Malgré tout, certains lieux sont habilités à
        recevoir exclusivement certains publics. Vous pouvez le préciser ici.
      </p>

      <form.AppField
        name="toutPublic"
        listeners={{
          onChange: ({ value }) => {
            const publics = form.state.values.publicsSpecifiquementAdresses
            if (value === true)
              return form.setFieldValue(
                'publicsSpecifiquementAdresses',
                tousLesPublics,
              )
            if (sontTousCoches(publics))
              form.setFieldValue('publicsSpecifiquementAdresses', [])
          },
        }}
      >
        {(field) => (
          <field.Checkbox
            className="fr-mb-2v fr-mt-4v"
            isPending={isPending}
            isTiled={false}
            options={[
              { label: 'Tout public (tout sélectionner)', value: true },
            ]}
          />
        )}
      </form.AppField>

      <form.AppField
        name="publicsSpecifiquementAdresses"
        listeners={{
          onChange: ({ value }) => {
            const toutPublic = form.state.values.toutPublic === true
            if (sontTousCoches(value) && !toutPublic)
              return form.setFieldValue('toutPublic', true)
            if (!sontTousCoches(value) && toutPublic)
              form.setFieldValue('toutPublic', null)
          },
        }}
      >
        {(field) => (
          <field.Checkbox
            className="fr-mb-0 fr-ml-4v fr-mt-3v"
            classes={{ content: 'fr-checkboxes-compact' }}
            small
            isPending={isPending}
            isTiled={false}
            options={publicSpecifiquementAdresseOptions}
          />
        )}
      </form.AppField>

      <form.AppField name="priseEnChargeSpecifique">
        {(field) => (
          <field.Checkbox
            className="fr-mb-0 fr-mt-6v"
            classes={{ content: 'fr-checkboxes-compact' }}
            isPending={isPending}
            isTiled={false}
            legend="Prise en charge spécifique"
            hintText="Indiquez si le lieu est en mesure d’accompagner et soutenir des publics ayant des besoins particuliers."
            options={priseEnChargeSpecifiqueOptions}
          />
        )}
      </form.AppField>
    </>
  ),
})
