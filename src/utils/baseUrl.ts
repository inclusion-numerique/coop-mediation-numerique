import { environnementServeur } from '@/configuration/environnement/serveur'
import { isBrowser } from '@/utils/isBrowser'

export type GetServerUrlOptions = {
  absolutePath?: boolean // Force absolute path including protocol and hostname instead of relative path
}

export const getServerBaseUrl = (options?: GetServerUrlOptions) => {
  if (isBrowser && !options?.absolutePath) {
    // browser can use relative path
    return ''
  }
  if (environnementServeur.BASE_URL) {
    return `https://${environnementServeur.BASE_URL}`
  }

  // assume localhost
  return `http://localhost:${environnementServeur.PORT}`
}

export const getServerUrl = (path: string, options?: GetServerUrlOptions) =>
  `${getServerBaseUrl(options)}${path}`
