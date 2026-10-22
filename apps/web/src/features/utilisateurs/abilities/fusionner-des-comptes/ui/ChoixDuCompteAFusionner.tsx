'use client'

import {
  Options,
  type OptionsData,
} from '@app/ui/components/Primitives/Options'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import { inject } from '@app/web/libs/injection/client'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import Badge from '@codegouvfr/react-dsfr/Badge'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY } from '../action/fusionner-des-comptes.key'
import type { CompteTrouve } from '../domain'

const cleDe = ({ id }: CompteTrouve): string => id

const Compte = ({ item }: { item: CompteTrouve }) => (
  <span className="fr-flex fr-direction-column">
    <span>
      {item.nom}{' '}
      {item.etat._tag === 'supprime' && (
        <Badge small severity="warning">
          Supprimé le {dateAsDay(item.etat.depuis)}
        </Badge>
      )}
    </span>
    <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
      {item.courriel}
    </span>
  </span>
)

const optionsDesComptes: OptionsData<CompteTrouve> = {
  itemToKey: cleDe,
  renderItem: Compte,
}

const compteComboBox = (cibleId: string): ComboBoxData<CompteTrouve> => ({
  itemToString: (compte) =>
    compte ? `${compte.nom} (${compte.courriel})` : '',
  itemToKey: cleDe,
  loadSuggestions: async (recherche) => {
    if (recherche.trim().length < 2) return { items: [] }
    const resultat = await inject(
      RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY,
    )({
      recherche,
      cibleId,
    })
    return { items: resultat.success ? [...resultat.data] : [] }
  },
})

const aucun = (): CompteTrouve | null => null

export const ChoixDuCompteAFusionner = ({
  cibleId,
  compteChoisi,
}: {
  cibleId: string
  compteChoisi: CompteTrouve | null
}) => {
  const router = useRouter()
  const champRef = useRef<HTMLDivElement>(null)
  const enAttente = !useHydrated()
  const form = useAppForm({
    defaultValues: { compte: compteChoisi ?? aucun() },
  })

  return (
    <div className="fr-border-radius--8 fr-border fr-p-8v fr-mb-6v">
      <h2 className="fr-h6">Rechercher l’utilisateur avec lequel fusionner</h2>
      <form.AppForm>
        <form.AppField name="compte">
          {(field) => (
            <field.ComboBox
              isPending={enAttente}
              onSelect={({ id }) =>
                router.push(
                  `/administration/utilisateurs/${cibleId}/merge/${id}`,
                )
              }
              {...compteComboBox(cibleId)}
            >
              {({
                getLabelProps,
                getInputProps,
                getToggleButtonProps: _,
                ...optionsProps
              }) => (
                <>
                  <div ref={champRef}>
                    <field.Input
                      isConnected={false}
                      isPending={enAttente}
                      nativeLabelProps={getLabelProps()}
                      nativeInputProps={{
                        ...getInputProps(),
                        placeholder: 'Nom ou adresse e-mail',
                      }}
                      label="Compte à fusionner"
                    />
                  </div>
                  <Options
                    {...optionsProps}
                    {...optionsDesComptes}
                    anchorRef={champRef}
                    className="fr-index-2000"
                  />
                </>
              )}
            </field.ComboBox>
          )}
        </form.AppField>
      </form.AppForm>
    </div>
  )
}
