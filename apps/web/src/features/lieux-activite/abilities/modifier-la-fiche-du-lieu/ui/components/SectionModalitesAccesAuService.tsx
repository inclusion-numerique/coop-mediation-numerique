'use client'

import EditCardTanStack from '@app/web/components/EditCardTanStack'
import { fraisAChargeOptions } from '@app/web/features/structures/fraisACharge'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useStore } from '@tanstack/react-form'
import type { z } from 'zod'
import { ModalitesAccesAuServiceSaisie } from '../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../enregistrer-une-section'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import { EtatVide } from './EtatVide'
import { useEnregistrementDeSection } from './useEnregistrementDeSection'
import { VueModalitesAccesAuService } from './vues/VueModalitesAccesAuService'

export const SectionModalitesAccesAuService = ({
  id,
  modalitesAccesAuService,
  enregistrer,
}: {
  id: string
  modalitesAccesAuService: FicheAffichee['modalitesAccesAuService']
  enregistrer: EnregistrerUneSection
}) => {
  const soumettre = useEnregistrementDeSection(id, enregistrer)

  const defaultValues: z.input<typeof ModalitesAccesAuServiceSaisie> = {
    section: 'ModalitesAccesAuService',
    surPlace: modalitesAccesAuService.surPlace,
    parTelephone: modalitesAccesAuService.parTelephone,
    numeroTelephone: modalitesAccesAuService.numeroTelephone,
    parMail: modalitesAccesAuService.parMail,
    adresseMail: modalitesAccesAuService.adresseMail,
    fraisACharge: [...modalitesAccesAuService.fraisACharge],
  }

  const form = useAppForm({
    validators: { onSubmit: ModalitesAccesAuServiceSaisie },
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
        <>
          <form.AppField name="surPlace">
            {(field) => (
              <field.Checkbox
                legend="Comment accéder au service ?"
                isPending={isPending}
                isTiled={false}
                options={[{ label: 'Se présenter', value: true }]}
              />
            )}
          </form.AppField>
          <form.AppField name="parTelephone">
            {(field) => (
              <field.Checkbox
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
                  label="Numéro de téléphone"
                  isPending={isPending}
                />
              )}
            </form.AppField>
          )}
          <form.AppField name="parMail">
            {(field) => (
              <field.Checkbox
                isPending={isPending}
                isTiled={false}
                options={[{ label: 'Contacter par mail', value: true }]}
              />
            )}
          </form.AppField>
          {parMail && (
            <form.AppField name="adresseMail">
              {(field) => (
                <field.Input label="Adresse email" isPending={isPending} />
              )}
            </form.AppField>
          )}
          <form.AppField name="fraisACharge">
            {(field) => (
              <field.Checkbox
                legend="Frais à charge"
                isPending={isPending}
                isTiled={false}
                options={fraisAChargeOptions}
              />
            )}
          </form.AppField>
        </>
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
