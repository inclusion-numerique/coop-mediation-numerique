'use client'

import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { defaultMaintenanceMessage } from '@app/web/features/maintenance-mode/domain/maintenanceMessage'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import Input from '@codegouvfr/react-dsfr/Input'
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import { useState } from 'react'

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const MaintenanceMode = () => {
  const status = trpc.maintenance.status.useQuery()
  const history = trpc.maintenance.history.useQuery()
  const mutation = trpc.maintenance.set.useMutation()

  // `null` => non édité, on affiche la valeur serveur ; sinon la saisie de l’admin.
  const [editedMessage, setEditedMessage] = useState<string | null>(null)

  const active = status.data?.active ?? false
  const message = editedMessage ?? status.data?.message ?? ''
  const pending = mutation.isPending || status.isLoading

  const apply = async (nextActive: boolean) => {
    try {
      const result = await mutation.mutateAsync({
        active: nextActive,
        message: message.trim() === '' ? null : message,
      })
      await Promise.all([status.refetch(), history.refetch()])
      setEditedMessage(null)

      createToast({
        priority: 'success',
        message: result.active
          ? 'Mode maintenance activé'
          : 'Mode maintenance désactivé',
      })
    } catch {
      createToast({
        priority: 'error',
        message: 'Échec de la mise à jour du mode maintenance',
      })
    }
  }

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
          onChange: (event) => setEditedMessage(event.target.value),
          rows: 3,
          placeholder: defaultMaintenanceMessage,
          disabled: pending,
        }}
      />
      <div className="fr-flex fr-flex-gap-4v fr-align-items-center">
        <ToggleSwitch
          label={
            active ? 'Mode maintenance activé' : 'Mode maintenance désactivé'
          }
          checked={active}
          showCheckedHint={false}
          disabled={pending}
          onChange={(checked) => apply(checked)}
        />
        {active && (
          <Button
            type="button"
            priority="secondary"
            size="small"
            disabled={pending}
            onClick={() => apply(true)}
          >
            Mettre à jour le message
          </Button>
        )}
      </div>
      {history.data && history.data.length > 0 && (
        <div>
          <h4 className="fr-h6 fr-mb-1v">Historique des maintenances</h4>
          <ul className="fr-text--sm fr-mb-0">
            {history.data.map((entry) => (
              <li key={entry.id}>
                {dateFormat.format(new Date(entry.startedAt))}
                {' → '}
                {entry.endedAt
                  ? dateFormat.format(new Date(entry.endedAt))
                  : 'EN COURS'}
                {entry.message ? ` : ${entry.message}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default withTrpc(MaintenanceMode)
