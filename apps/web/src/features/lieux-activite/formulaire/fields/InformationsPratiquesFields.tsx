'use client'

import { rdvWebsiteLink } from '@app/web/features/rdvsp/urls'
import { withForm } from '@app/web/libs/form/use-app-form'
import Link from 'next/link'
import { creerLieuActiviteFormOptions } from '../creerLieuActiviteFormData'
import { OpeningHoursFields } from './OpeningHoursFields'

export const InformationsPratiquesFields = withForm({
  ...creerLieuActiviteFormOptions,
  props: {} as { isPending: boolean },
  render: ({ form, isPending }) => (
    <>
      <p className="fr-mb-4w fr-text--sm fr-text-mention--grey">
        Ces champs sont optionnels
      </p>

      <form.AppField name="siteWeb">
        {(field) => (
          <field.Input
            isPending={isPending}
            label="Site internet du lieu"
            hintText="Exemple: https://mastructure.fr"
          />
        )}
      </form.AppField>

      <form.AppField name="ficheAccesLibre">
        {(field) => (
          <field.Input
            isPending={isPending}
            label="Accessibilité du lieu"
            hintText={
              <>
                Retrouvez les informations d’accessibilité sur ce lieu via la
                plateforme{' '}
                <Link
                  href="https://acceslibre.beta.gouv.fr"
                  target="_blank"
                  rel="noreferrer"
                  className="fr-link fr-link--xs"
                  title="Site d’accès libre (nouvel onglet)"
                >
                  accès libre
                </Link>{' '}
                et copiez le lien ici.
              </>
            }
            nativeInputProps={{
              placeholder: 'https://acceslibre.beta.gouv.fr/...',
            }}
          />
        )}
      </form.AppField>

      <form.AppField name="priseRdv">
        {(field) => (
          <field.Input
            isPending={isPending}
            label="Prise de rendez-vous en ligne"
            hintText={
              <>
                Si ce lieu dispose d’un outil de prise de rendez-vous en ligne
                (ex :{' '}
                <Link
                  href={rdvWebsiteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="fr-link fr-link--xs"
                  title="Site de RDV Service Public (nouvel onglet)"
                >
                  RDV Service Public
                </Link>
                ), ajoutez le lien ici.
              </>
            }
            nativeInputProps={{ placeholder: 'https://...' }}
          />
        )}
      </form.AppField>

      <hr className="fr-separator fr-separator-8v" />

      <p>Horaires d’ouverture du lieu</p>
      <OpeningHoursFields form={form} isPending={isPending} />

      <form.AppField name="horairesComment">
        {(field) => (
          <field.Input
            isPending={isPending}
            label="Détail horaires"
            hintText="Vous pouvez renseigner ici des informations spécifiques concernant les horaires."
          />
        )}
      </form.AppField>
    </>
  ),
})
