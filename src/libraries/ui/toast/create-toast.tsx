import Button, { ButtonProps } from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { JSX } from 'react'
import { toast } from 'react-hot-toast'

export type ToastPriority = 'info' | 'warning' | 'error' | 'success'

const variantes: { [key in ToastPriority]: string } = {
  info: 'notification--information',
  warning: 'notification--avertissement',
  error: 'notification--erreur',
  success: 'notification--succes',
}

const icons: { [key in ToastPriority]: string } = {
  info: 'fr-icon-info-fill',
  warning: 'fr-icon-warning-fill',
  error: 'fr-icon-error-fill',
  success: 'fr-icon-checkbox-circle-fill',
}

export const createToast = ({
  priority,
  message,
  action,
  duration,
}: {
  priority: ToastPriority
  message: JSX.Element | string | null
  action?: ButtonProps | undefined
  duration?: number | undefined
}) => {
  toast(
    action ? (
      <div className="fr-no-print">
        <span>{message}</span>
        <Button
          className="fr-ml-1w notification__action"
          priority="tertiary no outline"
          size="small"
          {...action}
        />
      </div>
    ) : (
      <span className="fr-no-print">{message}</span>
    ),
    {
      ...(duration === undefined ? {} : { duration }),
      className: classNames('notification', variantes[priority]),
      icon: (
        <span className={classNames('notification__icone', icons[priority])} />
      ),
    },
  )
}
