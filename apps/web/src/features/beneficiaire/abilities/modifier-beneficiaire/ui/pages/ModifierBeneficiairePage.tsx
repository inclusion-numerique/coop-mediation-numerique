import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import IconInSquare from '@app/web/components/IconInSquare'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { ModifierBeneficiaireView } from '@app/web/features/beneficiaire/abilities/modifier-beneficiaire/ui/components/modifier-beneficiaire.presenter'
import BeneficiaireForm, {
  type EnregistrerBeneficiaire,
} from '@app/web/features/beneficiaire/forms/BeneficiaireForm'
import { contentId } from '@app/web/utils/skipLinks'
import Link from 'next/link'

/**
 * Composant de page pur : rend le formulaire de modification et son chrome à
 * partir de la vue déjà calculée. L'orchestration (auth, lecture via l'ability,
 * presenter) vit dans la route Next. L'action `save` est injectée ;
 * l'identifiant à modifier transite par les valeurs du formulaire.
 */
export const ModifierBeneficiairePage = ({
  view: { beneficiaireId, displayName, defaultValues },
  save,
  retour,
}: {
  view: ModifierBeneficiaireView
  save: EnregistrerBeneficiaire
  retour?: string
}) => (
  <div className="fr-container fr-container--medium">
    <SkipLinksPortal />
    <CoopBreadcrumbs
      currentPage="Modifier"
      parents={[
        {
          label: 'Mes bénéficiaires',
          linkProps: {
            href: '/coop/mes-beneficiaires',
          },
        },
        {
          label: displayName,
          linkProps: { href: `/coop/mes-beneficiaires/${beneficiaireId}` },
        },
      ]}
    />
    <main id={contentId}>
      <BackButton />
      <div className="fr-flex fr-flex-gap-6v fr-align-items-start fr-mb-12v">
        <IconInSquare iconId="fr-icon-user-setting-line" size="large" />
        <div className="fr-flex-grow-1">
          <h1 className="fr-text-title--blue-france fr-mb-2v">{displayName}</h1>
          <Link
            className="fr-link"
            target="_blank"
            rel="noreferrer"
            href="https://docs.numerique.gouv.fr/docs/3d5bad76-8e02-4abc-b83a-c2f2965ae5d9/"
          >
            En savoir plus sur l’usage et la protection des données de mes
            bénéficiaires.
          </Link>
        </div>
      </div>
      <BeneficiaireForm
        defaultValues={defaultValues}
        save={save}
        retour={retour}
        edit
      />
    </main>
  </div>
)
