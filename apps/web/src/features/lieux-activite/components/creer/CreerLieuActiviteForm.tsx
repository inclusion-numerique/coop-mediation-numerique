'use client'

import { CompleteFields } from '@app/web/components/form/CompleteFields'
import { DisplayOnCartography } from '@app/web/components/structure/DisplayOnCartography'
import { LieuAccueillantPublicTitle } from '@app/web/components/structure/titles/LieuAccueillantPublicTitle'
import { ServiceInclusionNumeriqueTitle } from '@app/web/components/structure/titles/ServiceInclusionNumeriqueTitle'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import Button from '@codegouvfr/react-dsfr/Button'
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import { useStore } from '@tanstack/react-form'
import { useEffect } from 'react'
import {
  type CreerLieuActiviteFormData,
  CreerLieuActiviteFormValidation,
  creerLieuActiviteDefaultValues,
} from './creerLieuActiviteFormData'
import { DescriptionFields } from './fields/DescriptionFields'
import { InformationsGeneralesFields } from './fields/InformationsGeneralesFields'
import { InformationsPratiquesFields } from './fields/InformationsPratiquesFields'
import { ModalitesAccesAuServiceFields } from './fields/ModalitesAccesAuServiceFields'
import { ServicesEtAccompagnementFields } from './fields/ServicesEtAccompagnementFields'
import { TypesDePublicsAccueillisFields } from './fields/TypesDePublicsAccueillisFields'

/**
 * Formulaire de création d'un lieu d'activité, partagé par les deux parcours qui
 * y mènent : l'inscription et la gestion des lieux. La saisie et sa validation
 * vivent ici ; l'enregistrement est injecté par la route (`onCreer`), chacune
 * gardant sa propre commande.
 */
const CreerLieuActiviteForm = ({
  nom,
  annulerHref,
  onCreer,
  onVisiblePourCartographieNationaleChange,
}: {
  nom?: string
  annulerHref: string
  onCreer: (data: CreerLieuActiviteFormData) => Promise<void>
  onVisiblePourCartographieNationaleChange?: (visible: boolean) => void
}) => {
  const form = useAppForm({
    defaultValues: creerLieuActiviteDefaultValues(nom),
    validators: { onSubmit: CreerLieuActiviteFormValidation },
    onSubmit: ({ value }) => onCreer(value),
  })

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)
  const isHydrated = useHydrated()
  const isPending = isSubmitting || !isHydrated

  const visiblePourCartographieNationale = useStore(
    form.store,
    (state) => state.values.visiblePourCartographieNationale,
  )

  useEffect(() => {
    onVisiblePourCartographieNationaleChange?.(visiblePourCartographieNationale)
  }, [
    onVisiblePourCartographieNationaleChange,
    visiblePourCartographieNationale,
  ])

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <div className="fr-border fr-border-radius--8">
          <h2
            id="informations-generales"
            className="fr-text-title--blue-france fr-h4 fr-p-4w fr-mb-0"
          >
            Informations générales
          </h2>
          <hr className="fr-separator fr-separator-1px" />
          <InformationsGeneralesFields
            form={form}
            isPending={isPending}
            className="fr-p-4w"
          />
        </div>

        <div className="fr-border fr-border-radius--8 fr-mt-6v fr-mb-6v">
          <DisplayOnCartography />
          <hr className="fr-separator fr-separator-1px" />
          <div className="fr-px-4w fr-pt-4w">
            <ToggleSwitch
              inputTitle="Visibilité du lieu sur la cartographie"
              className="fr-m-0"
              disabled={isPending}
              checked={visiblePourCartographieNationale}
              label={
                <span className="fr-text--medium">
                  Rendre mon lieu d’activité visible sur la cartographie
                </span>
              }
              labelPosition="left"
              onChange={(checked) =>
                form.setFieldValue('visiblePourCartographieNationale', checked)
              }
            />
          </div>

          {visiblePourCartographieNationale && (
            <>
              <hr className="fr-separator-1px" />
              <LieuAccueillantPublicTitle />
              <hr className="fr-separator-1px" />
              <div className="fr-px-4w">
                <CompleteFields
                  id="description"
                  title="Description du lieu"
                  description="Décrivez ici le lieu et les activités qu’il propose."
                >
                  <DescriptionFields form={form} isPending={isPending} />
                </CompleteFields>
                <hr className="fr-separator-1px" />
                <CompleteFields
                  id="informations-pratiques"
                  title="Informations pratiques"
                  description="Horaires, accès et site internet du lieu."
                >
                  <InformationsPratiquesFields
                    form={form}
                    isPending={isPending}
                  />
                </CompleteFields>
              </div>
              <hr className="fr-separator-1px" />
              <ServiceInclusionNumeriqueTitle />
              <hr className="fr-separator-1px" />
              <div className="fr-px-4w">
                <CompleteFields
                  id="services-et-accompagnement"
                  defaultCanComplete
                  title="Services & types d’accompagnement"
                  description="Renseignez ici les services et les types d’accompagnements proposés dans ce lieu."
                >
                  <ServicesEtAccompagnementFields
                    form={form}
                    isPending={isPending}
                  />
                </CompleteFields>
                <hr className="fr-separator-1px" />
                <CompleteFields
                  id="modalites-acces-au-service"
                  title="Modalités d’accès au service"
                  description="Indiquez comment bénéficier des services d’inclusion numérique."
                >
                  <ModalitesAccesAuServiceFields
                    form={form}
                    isPending={isPending}
                  />
                </CompleteFields>
                <hr className="fr-separator-1px" />
                <CompleteFields
                  id="types-publics-accueillis"
                  title="Types de publics accueillis"
                  description="Indiquez si ce lieu accueille des publics spécifiques."
                >
                  <TypesDePublicsAccueillisFields
                    form={form}
                    isPending={isPending}
                  />
                </CompleteFields>
              </div>
            </>
          )}
        </div>

        <div className="fr-btns-group">
          <form.Submit
            isPending={isPending}
            className="fr-display-block fr-width-full fr-mt-12v fr-mb-4v"
          >
            Créer le lieu d’activité
          </form.Submit>
          <Button
            className="fr-display-block fr-width-full fr-text--center fr-mb-20v"
            priority="secondary"
            linkProps={{ href: annulerHref, 'aria-disabled': isPending }}
          >
            Annuler
          </Button>
        </div>
      </form>
    </form.AppForm>
  )
}

export default CreerLieuActiviteForm
