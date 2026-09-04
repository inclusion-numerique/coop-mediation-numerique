'use client'

import EditCardTanStack from '@app/web/components/EditCardTanStack'
import {
  priseEnChargeSpecifiqueOptions,
  publicSpecifiquementAdresseOptions,
} from '@app/web/features/lieux-activite/vocabulaire/options'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useStore } from '@tanstack/react-form'
import type { z } from 'zod'
import { TypesDePublicsAccueillisSaisie } from '../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../enregistrer-une-section'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import { EtatVide } from './EtatVide'
import { useEnregistrementDeSection } from './useEnregistrementDeSection'
import { VueTypesDePublicsAccueillis } from './vues/VueTypesDePublicsAccueillis'

export const SectionTypesDePublicsAccueillis = ({
  id,
  typesDePublicsAccueillis,
  enregistrer,
}: {
  id: string
  typesDePublicsAccueillis: FicheAffichee['typesDePublicsAccueillis']
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
        <>
          <form.AppField name="toutPublic">
            {(field) => (
              <field.Checkbox
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
                legend="Prise en charge spécifique"
                isPending={isPending}
                isTiled={false}
                options={priseEnChargeSpecifiqueOptions}
              />
            )}
          </form.AppField>
        </>
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
