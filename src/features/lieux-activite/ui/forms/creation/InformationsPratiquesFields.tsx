'use client'

import { withForm } from '@/libraries/formulaire/hooks'
import { creerLieuActiviteFormOptions } from '../creer-lieu-activite.form-options'
import { OpeningHoursFields } from './OpeningHoursFields'

const proprietes: { isPending: boolean; lienDePriseDeRendezVous: string } = {
  isPending: false,
  lienDePriseDeRendezVous: '',
}

export const InformationsPratiquesFields = withForm({
  ...creerLieuActiviteFormOptions,
  props: proprietes,
  render: ({ form, isPending, lienDePriseDeRendezVous }) => (
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
                <a
                  href="https://acceslibre.beta.gouv.fr"
                  target="_blank"
                  rel="noreferrer"
                  className="fr-link fr-link--xs"
                  title="Site d’accès libre (nouvel onglet)"
                >
                  accès libre
                </a>{' '}
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
                <a
                  href={lienDePriseDeRendezVous}
                  target="_blank"
                  rel="noreferrer"
                  className="fr-link fr-link--xs"
                  title="Site de RDV Service Public (nouvel onglet)"
                >
                  RDV Service Public
                </a>
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
