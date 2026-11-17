import { enErreur } from '../en-erreur'
import { errorReporter } from '.'

export const signaler = (erreur: unknown): void => {
  errorReporter.captureException({ error: enErreur(erreur) })
}
