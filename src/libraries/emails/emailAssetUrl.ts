import { getServerBaseUrl } from '@/configuration/projet/baseUrl'

export const emailAssetUrl = (assetPath: string): string =>
  `${getServerBaseUrl()}${assetPath}`
