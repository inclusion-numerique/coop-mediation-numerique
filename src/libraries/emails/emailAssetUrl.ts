import { getServerBaseUrl } from '@/utils/baseUrl'

export const emailAssetUrl = (assetPath: string): string =>
  `${getServerBaseUrl()}${assetPath}`
