'use client'

import { useStore } from '@tanstack/react-form'
import type { z } from 'zod'
import {
  priseEnChargeSpecifiqueOptions,
  publicSpecifiquementAdresseOptions,
} from '@/features/lieux-activite/ui/labels/options-du-lieu.labels'
import { EditCardTanStack } from '@/libraries/formulaire/form-components'
import { useAppForm } from '@/libraries/formulaire/hooks'
import { TypesDePublicsAccueillisSaisie } from '../../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../../hooks/use-enregistrement-de-section'
import { useEnregistrementDeSection } from '../../hooks/use-enregistrement-de-section'
import type { TypesDePublicsAccueillisAffiches } from '../../presenters/types-de-publics-accueillis.presenter'
import { EtatVide } from '../EtatVide'
import { VueTypesDePublicsAccueillis } from '../vues/VueTypesDePublicsAccueillis'

export const SectionTypesDePublicsAccueillis = ({
  id,
  typesDePublicsAccueillis,
  enregistrer,
}: {
  id: string
  typesDePublicsAccueillis: TypesDePublicsAccueillisAffiches
  enregistrer: EnregistrerUneSection
}) => {
  const soumettre = useEnregistrementDeSection(id, enregistrer)

  const defaultValues: z.input<typeof TypesDePublicsAccueillisSaisie> = {
    section: 'TypesDePublicsAccueillis',
    toutPublic: typesDePublicsAccueillis.toutPublic,
    publicsSpecifiquementAdresses: [
      ...typesDePublicsAccueillis.publicsSpecifiquementAdresses,
    ],
    priseEnChargeSpecifique: [
      ...typesDePublicsAccueillis.priseEnChargeSpecifique,
    ],
  }

  const form = useAppForm({
    validators: { onSubmit: TypesDePublicsAccueillisSaisie },
    defaultValues,
    onSubmit: async ({ value }) =>
      soumettre(TypesDePublicsAccueillisSaisie.parse(value)),
  })

  const isPending = useStore(form.store, (etat) => etat.isSubmitting)
  const toutPublic = useStore(form.store, (etat) => etat.values.toutPublic)

  return (
    <EditCardTanStack
      noBorder
      contentSeparator={false}
      id="types-de-publics-accueillis"
      title="Types de publics accueillis"
      form={form}
      isPending={isPending}
      isEmpty={typesDePublicsAccueillis.estVide}
      emptyState={
        <EtatVide titre="Précisez les publics accueillis si ce lieu s’adresse à certains d’entre eux en particulier." />
      }
      edition={
        <div className="fr-flex fr-direction-column fr-flex-gap-6v">
          <form.AppField name="toutPublic">
            {(field) => (
              <field.Checkbox
                className="fr-mb-0"
                legend="Publics accueillis"
                isPending={isPending}
                isTiled={false}
                options={[
                  { label: 'Ce lieu accueille tout public', value: true },
                ]}
              />
            )}
          </form.AppField>
          {!toutPublic && (
            <form.AppField name="publicsSpecifiquementAdresses">
              {(field) => (
                <field.Checkbox
                  className="fr-mb-0"
                  classes={{ content: 'fr-checkboxes-compact' }}
                  legend="Publics spécifiquement adressés"
                  isPending={isPending}
                  isTiled={false}
                  options={publicSpecifiquementAdresseOptions}
                />
              )}
            </form.AppField>
          )}
          <form.AppField name="priseEnChargeSpecifique">
            {(field) => (
              <field.Checkbox
                className="fr-mb-0"
                classes={{ content: 'fr-checkboxes-compact' }}
                legend="Prise en charge spécifique"
                isPending={isPending}
                isTiled={false}
                options={priseEnChargeSpecifiqueOptions}
              />
            )}
          </form.AppField>
        </div>
      }
      view={
        <VueTypesDePublicsAccueillis
          toutPublic={typesDePublicsAccueillis.toutPublic}
          publicsSpecifiquementAdresses={[
            ...typesDePublicsAccueillis.publicsSpecifiquementAdresses,
          ]}
          priseEnChargeSpecifique={[
            ...typesDePublicsAccueillis.priseEnChargeSpecifique,
          ]}
        />
      }
    />
  )
}
