import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import type { LieuDataspaceResponse } from './LieuDataspaceResponse'
import { toLieuStandardMediationNumerique } from './toLieuStandardMediationNumerique'

const cartographieNationaleDataspaceUrl =
  'https://api.inclusion-numerique.anct.gouv.fr/carto'

export const fetchCartographieNationaleStructures = async () => {
  const apiKey = ServerWebAppConfig.Dataspace.apiKey
  if (!apiKey) {
    throw new Error(
      'DATASPACE_API_KEY is not configured, cannot download cartographie nationale structures',
    )
  }

  const url = new URL(cartographieNationaleDataspaceUrl)
  url.searchParams.set('adresse->>code_insee', 'not.is.null')

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/vnd.pgrst.array+json;nulls=stripped',
    },
    signal: AbortSignal.timeout(5 * 60 * 1000),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(
      `Failed to download cartographie structures: ${response.status} ${response.statusText}`,
    )
  }

  const lieuxDataspace: LieuDataspaceResponse[] = await response.json()

  return lieuxDataspace.map(toLieuStandardMediationNumerique)
}
