'use client'

import { priseEnChargeSpecifiqueOptions } from '@app/web/features/structures/priseEnChargeSpecifique'
import { publicSpecifiquementAdresseOptions } from '@app/web/features/structures/publicSpecifiquementAdresse'
import { withForm } from '@app/web/libs/form/use-app-form'
import type { PublicSpecifiquementAdresse } from '@prisma/client'
import { creerLieuActiviteFormOptions } from '../creerLieuActiviteFormData'

const tousLesPublics = publicSpecifiquementAdresseOptions.map(
  ({ value }) => value,
) as PublicSpecifiquementAdresse[]

const sontTousCoches = (publics: PublicSpecifiquementAdresse[]) =>
  publics.length === tousLesPublics.length

/**
 * « Tout public » et la liste des publics restent d'accord : cocher la case
 * sélectionne tout, la décocher ne vide la liste que si elle était complète —
 * décocher un public isolé ne doit pas emporter les autres avec lui.
 */
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
            className="fr-mb-0 fr-ml-4v"
            style={{ marginTop: -16 }}
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
            className="fr-mb-0"
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
