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
    // Le numéro se stocke en E.164 et se relit en clair : le champ accepte
    // toutes les formes, la normalisation a lieu à l'enregistrement.
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
        /**
         * Deux groupes, deux respirations, comme partout ailleurs dans les
         * formulaires de la coop : les options d'un même groupe se suivent à
         * `gap-3v`, les groupes eux-mêmes se séparent à `gap-6v`. Les trois
         * moyens de contact sont des champs distincts, donc autant de fieldsets
         * qu'il faut regrouper à la main — sans quoi ils se collent, alors que
         * « Frais à charge », aéré par ses hints, paraissait mieux traité.
         */
        <div className="fr-flex fr-direction-column fr-flex-gap-6v">
          <div className="fr-flex fr-direction-column fr-flex-gap-3v">
            {/* Le titre couvre les trois moyens de contact, qui sont trois
                champs distincts. Porté en `legend`, il n'appartenait qu'à la
                première case et rendait son fieldset plus haut que ses voisins,
                d'où un écart plus large après « Se présenter ». */}
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
