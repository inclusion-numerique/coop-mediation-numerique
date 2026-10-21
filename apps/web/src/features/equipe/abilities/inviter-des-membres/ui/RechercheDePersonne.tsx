import { Options } from '@app/ui/components/Primitives/Options'
import type { ComboBoxProps } from '@app/web/libs/form/fields-components/ComboBox'
import { Input } from '@app/web/libs/form/fields-components/Input'
import Button from '@codegouvfr/react-dsfr/Button'
import type { EtatDeLaRecherche } from './mediateurs-a-inviter.presenter'
import { messagesDe } from './mediateurs-a-inviter.presenter'
import type { PersonneAInviter } from './personne-a-inviter'
import { PersonneAInviterOptions } from './personne-a-inviter-combo-box'

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
