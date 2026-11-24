import Button from '@codegouvfr/react-dsfr/Button'
import { lienDExport } from '../search-params/requete-de-l-export.search-params'

const BoutonExporter = ({
  coordinateurId,
  parametres,
}: {
  coordinateurId: string
  parametres: Readonly<Record<string, string | undefined>>
}) => (
  <Button
    title="Exporter la liste des membres de mon équipe"
    priority="secondary"
    iconId="fr-icon-download-line"
    iconPosition="right"
    linkProps={{
      href: lienDExport(coordinateurId, parametres),
      download: true,
    }}
  >
    Exporter
  </Button>
)

export default BoutonExporter
