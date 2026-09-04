'use client'

import EditCardTanStack from '@app/web/components/EditCardTanStack'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useStore } from '@tanstack/react-form'
import { immatriculationSaisie } from '../../../../domain/saisie'
import type { EnregistrerUneSection } from '../enregistrer-une-section'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import { InformationsGeneralesEditionFields } from './InformationsGeneralesEditionFields'
import {
  type InformationsGeneralesFormData,
  InformationsGeneralesFormValidation,
  informationsGeneralesFormOptions,
} from './informationsGeneralesFormData'
import { useEnregistrementDeSection } from './useEnregistrementDeSection'
import { VueInformationsGenerales } from './vues/VueInformationsGenerales'

export const SectionInformationsGenerales = ({
  id,
  informationsGenerales,
  enregistrer,
}: {
  id: string
  informationsGenerales: FicheAffichee['informationsGenerales']
  enregistrer: EnregistrerUneSection
}) => {
  const soumettre = useEnregistrementDeSection(id, enregistrer)

  const defaultValues: InformationsGeneralesFormData = {
    id,
    nom: informationsGenerales.nom,
    adresseBan: informationsGenerales.adresseBan,
    lieuItinerant: informationsGenerales.lieuItinerant,
    complementAdresse: informationsGenerales.complementAdresse,
    siretSearch: informationsGenerales.siretSearch,
    rna: informationsGenerales.rna,
    nomUsage: informationsGenerales.nomUsage,
    noSiret: informationsGenerales.siret == null,
    typologies: [...informationsGenerales.typologies],
  }

  const form = useAppForm({
    ...informationsGeneralesFormOptions,
    defaultValues,
    validators: { onSubmit: InformationsGeneralesFormValidation },
    onSubmit: async ({ value }) => {
      if (!value.adresseBan) return

      const { noSiret, siretSearch, ...saisie } = value
      const siret = noSiret ? null : (siretSearch?.siret ?? null)

      await soumettre({
        section: 'InformationsGenerales',
        nom: saisie.nom,
        adresseBan: value.adresseBan,
        complementAdresse: saisie.complementAdresse,
        // L'itinérance ne se déclare que pour un lieu sans immatriculation.
        lieuItinerant: noSiret ? saisie.lieuItinerant : null,
        typologies: saisie.typologies,
        nomUsage: saisie.nomUsage,
        ...immatriculationSaisie(siret),
      })
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
          rna={informationsGenerales.rna}
          nomUsage={informationsGenerales.nomUsage}
          typologies={[...informationsGenerales.typologies]}
        />
      }
    />
  )
}
