'use client'

import EditCardTanStack from '@app/web/components/EditCardTanStack'
import { fraisAChargeOptions } from '@app/web/features/lieux-activite/ui/options'
import { telephoneDisplayString } from '@app/web/libraries/telephone'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useStore } from '@tanstack/react-form'
import type { z } from 'zod'
import {
  ModalitesAccesAuServiceFormValidation,
  ModalitesAccesAuServiceSaisie,
} from '../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../enregistrer-une-section'
import type { ModalitesAccesAuServiceAffichees } from '../fiche-affichee/modalites-acces-au-service'
import { EtatVide } from './EtatVide'
import { useEnregistrementDeSection } from './useEnregistrementDeSection'
import { VueModalitesAccesAuService } from './vues/VueModalitesAccesAuService'

export const SectionModalitesAccesAuService = ({
  id,
  modalitesAccesAuService,
  enregistrer,
}: {
  id: string
  modalitesAccesAuService: ModalitesAccesAuServiceAffichees
  enregistrer: EnregistrerUneSection
}) => {
  const soumettre = useEnregistrementDeSection(id, enregistrer)

  const defaultValues: z.input<typeof ModalitesAccesAuServiceSaisie> = {
    section: 'ModalitesAccesAuService',
    surPlace: modalitesAccesAuService.surPlace,
    parTelephone: modalitesAccesAuService.parTelephone,
    numeroTelephone:
      modalitesAccesAuService.numeroTelephone == null
        ? null
        : telephoneDisplayString(modalitesAccesAuService.numeroTelephone),
    parMail: modalitesAccesAuService.parMail,
    adresseMail: modalitesAccesAuService.adresseMail,
    fraisACharge: [...modalitesAccesAuService.fraisACharge],
  }

  const form = useAppForm({
    validators: { onSubmit: ModalitesAccesAuServiceFormValidation },
    defaultValues,
    onSubmit: async ({ value }) =>
      soumettre(ModalitesAccesAuServiceSaisie.parse(value)),
  })

  const isPending = useStore(form.store, (etat) => etat.isSubmitting)
  const parTelephone = useStore(form.store, (etat) => etat.values.parTelephone)
  const parMail = useStore(form.store, (etat) => etat.values.parMail)

  return (
    <EditCardTanStack
      noBorder
      contentSeparator={false}
      id="modalites-d-acces-au-service"
      title="Modalités d’accès au service"
      form={form}
      isPending={isPending}
      isEmpty={modalitesAccesAuService.estVide}
      emptyState={
        <EtatVide titre="Indiquez comment les personnes peuvent accéder à ce lieu et à ses services." />
      }
      edition={
        <div className="fr-flex fr-direction-column fr-flex-gap-6v">
          <div className="fr-flex fr-direction-column fr-flex-gap-3v">
            <p className="fr-label fr-text--medium fr-mb-0">
              Comment accéder au service ?
            </p>
            <form.AppField name="surPlace">
              {(field) => (
                <field.Checkbox
                  className="fr-mb-0"
                  isPending={isPending}
                  isTiled={false}
                  options={[{ label: 'Se présenter', value: true }]}
                />
              )}
            </form.AppField>
            <form.AppField name="parTelephone">
              {(field) => (
                <field.Checkbox
                  className="fr-mb-0"
                  isPending={isPending}
                  isTiled={false}
                  options={[{ label: 'Téléphoner', value: true }]}
                />
              )}
            </form.AppField>
            {parTelephone && (
              <form.AppField name="numeroTelephone">
                {(field) => (
                  <field.Input
                    className="fr-mb-0"
                    label="Numéro de téléphone"
                    isPending={isPending}
                  />
                )}
              </form.AppField>
            )}
            <form.AppField name="parMail">
              {(field) => (
                <field.Checkbox
                  className="fr-mb-0"
                  isPending={isPending}
                  isTiled={false}
                  options={[{ label: 'Contacter par mail', value: true }]}
                />
              )}
            </form.AppField>
            {parMail && (
              <form.AppField name="adresseMail">
                {(field) => (
                  <field.Input
                    className="fr-mb-0"
                    label="Adresse email"
                    isPending={isPending}
                  />
                )}
              </form.AppField>
            )}
          </div>
          <form.AppField name="fraisACharge">
            {(field) => (
              <field.Checkbox
                className="fr-mb-0"
                classes={{ content: 'fr-checkboxes-compact' }}
                legend="Frais à charge"
                isPending={isPending}
                isTiled={false}
                options={fraisAChargeOptions}
              />
            )}
          </form.AppField>
        </div>
      }
      view={
        <VueModalitesAccesAuService
          fraisACharge={[...modalitesAccesAuService.fraisACharge]}
          modalitesAcces={{
            surPlace: modalitesAccesAuService.surPlace,
            parTelephone: modalitesAccesAuService.parTelephone,
            numeroTelephone: modalitesAccesAuService.numeroTelephone,
            parMail: modalitesAccesAuService.parMail,
            adresseMail: modalitesAccesAuService.adresseMail,
          }}
        />
      }
    />
  )
}
