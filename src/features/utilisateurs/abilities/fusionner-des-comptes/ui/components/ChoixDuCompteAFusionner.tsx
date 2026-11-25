'use client'

import Badge from '@codegouvfr/react-dsfr/Badge'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { hrefDuCompteAFusionner } from '@/features/utilisateurs/ui/presenters/liens.presenter'
import { dateAsDay } from '@/libraries/date'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components'
import { useAppForm, useHydrated } from '@/libraries/formulaire/hooks'
import { inject } from '@/libraries/nextjs/injection'
import { Options, type OptionsData } from '@/libraries/ui/primitives'
import { RECHERCHER_DES_COMPTES_A_FUSIONNER_ACTION_KEY } from '../../action/fusionner-des-comptes.key'
import type { CompteTrouve } from '../../domain'

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
                router.push(hrefDuCompteAFusionner(cibleId, id))
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
