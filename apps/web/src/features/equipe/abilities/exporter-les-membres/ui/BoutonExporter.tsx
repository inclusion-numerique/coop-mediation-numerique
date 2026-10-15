import Button from '@codegouvfr/react-dsfr/Button'

const parametresExportes = ['recherche', 'statut', 'role', 'tri', 'ordre']

const lienDExport = (
  coordinateurId: string,
  parametres: Readonly<Record<string, string | undefined>>,
): string => {
  const recherche = new URLSearchParams(
    parametresExportes.flatMap((cle) => {
      const valeur = parametres[cle]
      return valeur ? [[cle, valeur]] : []
    }),
  ).toString()
  const chemin = `/coop/mes-equipes/${coordinateurId}/export`
  return recherche ? `${chemin}?${recherche}` : chemin
}

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
