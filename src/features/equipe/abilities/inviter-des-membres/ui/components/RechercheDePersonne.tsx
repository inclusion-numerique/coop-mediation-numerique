import Button from '@codegouvfr/react-dsfr/Button'
import type { ComboBoxProps } from '@/libraries/formulaire/fields-components/ComboBox'
import { Input } from '@/libraries/formulaire/fields-components/Input'
import { Options } from '@/libraries/ui/primitives/Options'
import { PersonneAInviterOptions } from '../forms/PersonneAInviterComboBox'
import type { PersonneAInviter } from '../forms/personne-a-inviter.form-data'
import type { EtatDeLaRecherche } from '../presenters/mediateurs-a-inviter.presenter'
import { messagesDe } from '../presenters/mediateurs-a-inviter.presenter'

type RenduDuComboBox = Parameters<
  ComboBoxProps<PersonneAInviter, EtatDeLaRecherche>['children']
>[0]

export const RechercheDePersonne = ({
  isPending,
  getLabelProps,
  getInputProps,
  getToggleButtonProps,
  payload,
  ...optionsProps
}: RenduDuComboBox & { isPending: boolean }) => {
  const messages = payload.recherche == null ? [] : messagesDe(payload)

  const etat =
    messages.length > 0 ? (
      <div>
        {messages.map((message) => (
          <p
            key={message}
            className="fr-text--sm fr-text-mention--grey fr-mb-1v"
          >
            {message}
          </p>
        ))}
      </div>
    ) : null

  return (
    <>
      <Input
        addonEnd={
          <Button
            title="Rechercher"
            className="fr-border-left-0"
            iconId="fr-icon-search-line"
            {...getToggleButtonProps({ type: 'button' })}
          />
        }
        isConnected={false}
        isPending={isPending}
        nativeLabelProps={getLabelProps()}
        nativeInputProps={getInputProps({
          placeholder: 'Nom ou adresse e-mail',
        })}
        label="Rechercher par nom ou adresse e-mail"
      />
      <Options
        {...optionsProps}
        {...PersonneAInviterOptions}
        showEmpty={etat != null}
        footer={optionsProps.items.length > 0 ? etat : null}
      >
        {optionsProps.items.length === 0 ? etat : null}
      </Options>
    </>
  )
}
