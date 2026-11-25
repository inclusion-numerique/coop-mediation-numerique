import type { Route } from 'next'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { cheminInterne } from '@/libraries/chemin-interne'
import { isBrowser } from '@/libraries/navigateur'

export type GetServerUrlOptions = {
  absolutePath?: boolean // Force absolute path including protocol and hostname instead of relative path
}

export const getServerBaseUrl = (options?: GetServerUrlOptions) => {
  if (isBrowser && !options?.absolutePath) {
    // browser can use relative path
    return ''
  }
  if (environnementServeur().BASE_URL) {
    return `https://${environnementServeur().BASE_URL}`
  }

  // assume localhost
  return `http://localhost:${environnementServeur().PORT}`
}

export const getServerUrl = (
  path: string,
  options?: GetServerUrlOptions,
): Route => `${getServerBaseUrl(options)}${cheminInterne(path)}` as Route
