'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { fraisAChargeOptions } from '@app/web/features/structures/fraisACharge'
import { withForm } from '@app/web/libs/form/use-app-form'
import { useStore } from '@tanstack/react-form'
import { creerLieuActiviteFormOptions } from '../creerLieuActiviteFormData'

export const ModalitesAccesAuServiceFields = withForm({
  ...creerLieuActiviteFormOptions,
  props: {} as { isPending: boolean },
  render: ({ form, isPending }) => {
    const parTelephone = useStore(
      form.store,
      (state) => state.values.modalitesAcces.parTelephone === true,
    )
    const parMail = useStore(
      form.store,
      (state) => state.values.modalitesAcces.parMail === true,
    )

    return (
      <>
        <p className="fr-mb-4w fr-text--sm fr-text-mention--grey">
          Ces champs sont optionnels
        </p>
        <p className="fr-mb-1v">Modalités d’accès</p>
        <p className="fr-text-mention--grey fr-text--sm fr-mb-4v">
          Indiquez comment bénéficier de ses services. Sélectionnez un ou
          plusieurs choix.
        </p>

        <div className="fr-flex fr-direction-column fr-flex-gap-4v">
          <div>
            <form.AppField name="modalitesAcces.surPlace">
              {(field) => (
                <field.Checkbox
                  className="fr-mb-0"
                  isPending={isPending}
                  isTiled={false}
                  options={[{ label: 'Se présenter sur place', value: true }]}
                />
              )}
            </form.AppField>

            <form.AppField name="modalitesAcces.parTelephone">
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
              <form.AppField name="modalitesAcces.numeroTelephone">
                {(field) => (
                  <field.Input
                    className="fr-mb-8v fr-mt-4v"
                    isPending={isPending}
                    label={
                      <>
                        Précisez le téléphone de contact <RedAsterisk />
                      </>
                    }
                    hintText="Exemples : 06 00 00 00 00 ou 0600000000"
                  />
                )}
              </form.AppField>
            )}

            <form.AppField name="modalitesAcces.parMail">
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
              <form.AppField name="modalitesAcces.adresseMail">
                {(field) => (
                  <field.Input
                    className="fr-my-4v"
                    isPending={isPending}
                    label={
                      <>
                        Précisez l’adresse mail de contact <RedAsterisk />
                      </>
                    }
                    hintText="Format attendu : nom@domaine.fr"
                  />
                )}
              </form.AppField>
            )}
          </div>

          <form.AppField name="fraisACharge">
            {(field) => (
              <field.Checkbox
                isPending={isPending}
                isTiled={false}
                legend="Frais à charge"
                hintText="Indiquez les conditions financières d’accès aux services."
                options={fraisAChargeOptions}
              />
            )}
          </form.AppField>
        </div>
      </>
    )
  },
})
