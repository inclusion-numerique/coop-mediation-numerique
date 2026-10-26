'use client'

import { createToast } from '@app/ui/toast/createToast'
import {
  type EtatDeMaintenance,
  MESSAGE_DE_MAINTENANCE_PAR_DEFAUT,
  type PeriodeDeMaintenance,
} from '@app/web/features/maintenance-mode/domain'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import Input from '@codegouvfr/react-dsfr/Input'
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { REGLER_LA_MAINTENANCE_ACTION_KEY } from '../action/regler-la-maintenance.key'

const formatDeDate = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Paris',
})

export const ReglageDeLaMaintenance = ({
  etat,
  historique,
}: {
  etat: EtatDeMaintenance
  historique: readonly PeriodeDeMaintenance[]
}) => {
  const router = useRouter()
  const [enCours, demarrer] = useTransition()
  const [message, setMessage] = useState<string>(
    etat._tag === 'Active' ? (etat.message ?? '') : '',
  )
  const active = etat._tag === 'Active'

  const regler = (activer: boolean) =>
    demarrer(async () => {
      const resultat = await inject(REGLER_LA_MAINTENANCE_ACTION_KEY)(
        activer
          ? {
              _tag: 'Activer',
              message: message.trim() === '' ? null : message,
            }
          : { _tag: 'Desactiver' },
      )

      if (!resultat.success) {
        createToast({
          priority: 'error',
          message: 'Échec de la mise à jour du mode maintenance',
        })
        return
      }

      createToast({
        priority: 'success',
        message:
          resultat.data._tag === 'Active'
            ? 'Mode maintenance activé'
            : 'Mode maintenance désactivé',
      })
      router.refresh()
    })

  return (
    <div className="fr-flex fr-direction-column fr-flex-gap-4v">
      <p className="fr-text--sm fr-mb-0">
        Lorsque le mode maintenance est activé, les médiateurs et coordinateurs
        ne peuvent plus modifier leurs données (la consultation reste possible).
        Les administrateurs et le support conservent leur accès. Chaque
        maintenance est enregistrée dans l’historique ci-dessous.
      </p>
      <Input
        textArea
        label="Message affiché aux utilisateurs"
        hintText="Laissez vide pour utiliser le message par défaut."
        nativeTextAreaProps={{
          value: message,
          onChange: (event) => setMessage(event.target.value),
          rows: 3,
          placeholder: MESSAGE_DE_MAINTENANCE_PAR_DEFAUT,
          disabled: enCours,
        }}
      />
      <div className="fr-flex fr-flex-gap-4v fr-align-items-center">
        <ToggleSwitch
          label={
            active ? 'Mode maintenance activé' : 'Mode maintenance désactivé'
          }
          checked={active}
          showCheckedHint={false}
          disabled={enCours}
          onChange={regler}
        />
        {active && (
          <Button
            type="button"
            priority="secondary"
            size="small"
            disabled={enCours}
            onClick={() => regler(true)}
          >
            Mettre à jour le message
          </Button>
        )}
      </div>
      {historique.length > 0 && (
        <div>
          <h4 className="fr-h6 fr-mb-1v">Historique des maintenances</h4>
          <ul className="fr-text--sm fr-mb-0">
            {historique.map(
              ({ id, debut, fin, message: messageDeLaPeriode }) => (
                <li key={id}>
                  {formatDeDate.format(debut)}
                  {' → '}
                  {fin == null ? 'EN COURS' : formatDeDate.format(fin)}
                  {messageDeLaPeriode == null ? '' : ` : ${messageDeLaPeriode}`}
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
