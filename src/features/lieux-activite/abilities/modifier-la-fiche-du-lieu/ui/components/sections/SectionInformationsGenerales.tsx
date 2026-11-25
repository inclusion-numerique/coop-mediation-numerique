'use client'

import Alert from '@codegouvfr/react-dsfr/Alert'
import { useStore } from '@tanstack/react-form'
import type { Route } from 'next'
import Link from 'next/link'
import { EditCardTanStack } from '@/libraries/formulaire/form-components'
import { useAppForm } from '@/libraries/formulaire/hooks'
import {
  CONFIRMATION_DU_PARTAGE_MANQUANTE,
  confirmationDuPartageManquante,
} from '../../forms/confirmation-du-partage.validation'
import { InformationsGeneralesEditionFields } from '../../forms/InformationsGeneralesEditionFields'
import {
  type InformationsGeneralesFormData,
  InformationsGeneralesFormValidation,
  informationsGeneralesFormOptions,
} from '../../forms/informations-generales.form-data'
import { informationsGeneralesSoumises } from '../../forms/informations-generales-soumises.form-data'
import type { EnregistrerUneSection } from '../../hooks/use-enregistrement-de-section'
import { useEnregistrementDeSection } from '../../hooks/use-enregistrement-de-section'
import type { PartageAffiche } from '../../presenters/fiche-du-lieu.presenter'
import type { InformationsGeneralesAffichees } from '../../presenters/informations-generales.presenter'
import { VueInformationsGenerales } from '../vues/VueInformationsGenerales'

export const SectionInformationsGenerales = ({
  id,
  informationsGenerales,
  enregistrer,
  partage,
  creerUnLieuHref,
}: {
  id: string
  informationsGenerales: InformationsGeneralesAffichees
  enregistrer: EnregistrerUneSection
  partage: PartageAffiche | null
  creerUnLieuHref?: Route | undefined
}) => {
  const soumettre = useEnregistrementDeSection(id, enregistrer)

  const defaultValues: InformationsGeneralesFormData = {
    id,
    nom: informationsGenerales.nom,
    adresseBan: informationsGenerales.adresseBan,
    lieuItinerant: informationsGenerales.lieuItinerant,
    complementAdresse: informationsGenerales.complementAdresse,
    siretSearch: informationsGenerales.siretSearch,
    nomUsage: informationsGenerales.nomUsage,
    noSiret: informationsGenerales.siret == null,
    typologies: [...informationsGenerales.typologies],
    confirmationDuPartage: null,
  }

  const form = useAppForm({
    ...informationsGeneralesFormOptions,
    defaultValues,
    validators: {
      onSubmit: InformationsGeneralesFormValidation.superRefine(
        ({ confirmationDuPartage }, context) => {
          if (
            confirmationDuPartageManquante({
              partage: partage != null,
              confirmation: confirmationDuPartage,
            })
          )
            context.addIssue({
              code: 'custom',
              path: ['confirmationDuPartage'],
              message: CONFIRMATION_DU_PARTAGE_MANQUANTE,
            })
        },
      ),
    },
    onSubmit: async ({ value }) => {
      if (!value.adresseBan) return

      await soumettre(
        informationsGeneralesSoumises({
          ...value,
          adresseBan: value.adresseBan,
        }),
      )
    },
  })

  const isPending = useStore(form.store, (etat) => etat.isSubmitting)

  return (
    <EditCardTanStack
      noBorder
      id="informations-generales"
      title={
        <span className="fr-text-label--blue-france">
          Informations générales
        </span>
      }
      titleAs="h2"
      form={form}
      isPending={isPending}
      edition={
        <form.AppForm>
          <InformationsGeneralesEditionFields
            form={form}
            isPending={isPending}
          />
          {partage != null && (
            <div className="fr-mt-6v">
              <Alert
                severity="warning"
                small
                description={
                  <>
                    {partage.message} Votre modification s’appliquera pour tous.{' '}
                    {creerUnLieuHref != null && (
                      <Link href={creerUnLieuHref} className="fr-link">
                        Ce n’est plus le même lieu ? Créez un nouveau lieu
                      </Link>
                    )}
                  </>
                }
              />
              <form.AppField name="confirmationDuPartage">
                {(field) => (
                  <field.Checkbox
                    className="fr-mt-4v fr-mb-0"
                    isPending={isPending}
                    isTiled={false}
                    options={[
                      {
                        label:
                          'Je confirme que cette modification vaut pour toutes les personnes qui travaillent sur ce lieu',
                        value: true,
                      },
                    ]}
                  />
                )}
              </form.AppField>
            </div>
          )}
        </form.AppForm>
      }
      view={
        <VueInformationsGenerales
          nom={informationsGenerales.nom}
          adresse={informationsGenerales.adresse ?? ''}
          commune={informationsGenerales.commune ?? ''}
          codePostal={informationsGenerales.codePostal ?? ''}
          lieuItinerant={informationsGenerales.lieuItinerant}
          complementAdresse={informationsGenerales.complementAdresse}
          siret={informationsGenerales.siret}
          nomUsage={informationsGenerales.nomUsage}
          typologies={[...informationsGenerales.typologies]}
        />
      }
    />
  )
}
