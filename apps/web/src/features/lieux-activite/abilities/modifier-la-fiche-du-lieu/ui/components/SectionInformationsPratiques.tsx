'use client'

import EditCardTanStack from '@app/web/components/EditCardTanStack'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useStore } from '@tanstack/react-form'
import { InformationsPratiquesSaisie } from '../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../enregistrer-une-section'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import { ChampsHoraires } from './ChampsHoraires'
import { EtatVide } from './EtatVide'
import {
  type InformationsPratiquesFormData,
  informationsPratiquesFormOptions,
} from './informationsPratiquesFormData'
import { useEnregistrementDeSection } from './useEnregistrementDeSection'
import { VueInformationsPratiques } from './vues/VueInformationsPratiques'

export const SectionInformationsPratiques = ({
  id,
  informationsPratiques,
  enregistrer,
}: {
  id: string
  informationsPratiques: FicheAffichee['informationsPratiques']
  enregistrer: EnregistrerUneSection
}) => {
  const soumettre = useEnregistrementDeSection(id, enregistrer)

  const defaultValues: InformationsPratiquesFormData = {
    section: 'InformationsPratiques',
    siteWeb: informationsPratiques.siteWeb,
    ficheAccesLibre: informationsPratiques.ficheAccesLibre,
    priseRdv: informationsPratiques.priseRdv,
    openingHours: informationsPratiques.openingHours,
    horairesComment: informationsPratiques.horairesComment,
  }

  const form = useAppForm({
    ...informationsPratiquesFormOptions,
    validators: { onSubmit: InformationsPratiquesSaisie },
    defaultValues,
    onSubmit: async ({ value }) =>
      soumettre(InformationsPratiquesSaisie.parse(value)),
  })

  const isPending = useStore(form.store, (etat) => etat.isSubmitting)

  return (
    <EditCardTanStack
      noBorder
      contentSeparator={false}
      id="informations-pratiques"
      title="Informations pratiques"
      form={form}
      isPending={isPending}
      isEmpty={informationsPratiques.estVide}
      emptyState={
        <EtatVide titre="Ajoutez les informations pratiques pour aider les personnes à se rendre dans ce lieu." />
      }
      edition={
        <>
          <form.AppField name="siteWeb">
            {(field) => (
              <field.Input
                label="Site internet"
                hintText="Plusieurs adresses peuvent être séparées par « | »"
                isPending={isPending}
              />
            )}
          </form.AppField>
          <fieldset className="fr-fieldset fr-mb-0">
            <legend className="fr-fieldset__legend fr-text--regular fr-mb-2w">
              Horaires d’ouverture
            </legend>
            <form.AppForm>
              <ChampsHoraires form={form} isPending={isPending} />
            </form.AppForm>
          </fieldset>
          <form.AppField name="horairesComment">
            {(field) => (
              <field.Input
                label="Précision sur les horaires"
                hintText="Par exemple : fermé les jours fériés"
                isPending={isPending}
              />
            )}
          </form.AppField>
          <form.AppField name="ficheAccesLibre">
            {(field) => (
              <field.Input
                label="Fiche Acceslibre"
                hintText="https://acceslibre.beta.gouv.fr/..."
                isPending={isPending}
              />
            )}
          </form.AppField>
          <form.AppField name="priseRdv">
            {(field) => (
              <field.Input
                label="Prise de rendez-vous en ligne"
                isPending={isPending}
              />
            )}
          </form.AppField>
        </>
      }
      view={
        <VueInformationsPratiques
          sitesWeb={informationsPratiques.sitesWeb}
          ficheAccesLibre={informationsPratiques.ficheAccesLibre}
          priseRdv={informationsPratiques.priseRdv}
          horaires={informationsPratiques.horaires}
        />
      }
    />
  )
}
