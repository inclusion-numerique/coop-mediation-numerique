import Button from '@codegouvfr/react-dsfr/Button'
import AdministrationBreadcrumbs from '@/libs/ui/administration/AdministrationBreadcrumbs'
import { toTitleCase } from '@/utils/toTitleCase'

export const EnteteDeLaFicheEnAdministration = ({
  nom,
  fusionHref,
}: {
  nom: string
  fusionHref: string
}) => (
  <div className="fr-flex fr-flex-gap-lg-4v fr-direction-column fr-direction-lg-row fr-justify-content-space-between">
    <AdministrationBreadcrumbs
      parents={[
        {
          label: 'Structures',
          linkProps: { href: `/administration/lieux-activite` },
        },
      ]}
      currentPage={toTitleCase(nom, { noUpper: true })}
    />
    <div>
      <Button
        iconId="fr-icon-git-merge-line"
        priority="tertiary"
        size="small"
        linkProps={{ href: fusionHref }}
      >
        Fusionner avec un autre lieu d’activité
      </Button>
    </div>
  </div>
)
