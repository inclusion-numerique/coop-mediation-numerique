import Button from '@codegouvfr/react-dsfr/Button'
import type { EquipeSearchParams } from '../searchMediateursCoordonneBy'

const exportParamKeys = ['recherche', 'statut', 'role', 'tri', 'ordre'] as const

const buildExportUrl = (
  coordinateurId: string,
  searchParams: EquipeSearchParams,
): string => {
  const params = exportParamKeys.reduce((acc, key) => {
    const value = searchParams[key]
    if (value) acc.set(key, value)
    return acc
  }, new URLSearchParams())

  const queryString = params.toString()
  const basePath = `/coop/mes-equipes/${coordinateurId}/export`

  return queryString ? `${basePath}?${queryString}` : basePath
}

export const Exporter = ({
  coordinateurId,
  searchParams = {},
}: {
  coordinateurId: string
  searchParams?: EquipeSearchParams
}) => (
  <Button
    title="Exporter la liste des membres de mon équipe"
    priority="secondary"
    iconId="fr-icon-download-line"
    iconPosition="right"
    linkProps={{
      href: buildExportUrl(coordinateurId, searchParams),
      download: true,
    }}
  >
    Exporter
  </Button>
)
