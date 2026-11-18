import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import pRetry from 'p-retry'

const premierStatutServeur = 500

export const meriteUneNouvelleTentative = (erreur: unknown): boolean =>
  axios.isAxiosError(erreur) &&
  (erreur.response === undefined ||
    erreur.response.status >= premierStatutServeur)

export const getAvecNouvellesTentatives = <T>(
  client: AxiosInstance,
  url: string,
  config?: AxiosRequestConfig,
) =>
  pRetry(() => client.get<T>(url, config), {
    retries: 3,
    minTimeout: 3000,
    factor: 2,
    shouldRetry: ({ error }) => meriteUneNouvelleTentative(error),
  })
