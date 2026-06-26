import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import type { AdressBanFormFieldOption } from '@app/web/components/form/AdresseBanFormField'
import IconInSquare from '@app/web/components/IconInSquare'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import BeneficiaireForm, {
  type EnregistrerBeneficiaire,
} from '@app/web/features/beneficiaire/forms/BeneficiaireForm'
import type { BeneficiaireData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { contentId } from '@app/web/utils/skipLinks'
import Link from 'next/link'
import type { DefaultValues } from 'react-hook-form'

/**
 * Composant de page pur : rend le formulaire de modification et son chrome.
 * L'orchestration (auth, lecture du bénéficiaire, construction des valeurs par
 * défaut, liaison de l'action) vit dans la route Next. L'action `save` est
 * injectée ; l'identifiant à modifier transite par les valeurs du formulaire.
 */
export const ModifierBeneficiairePage = ({
  beneficiaireId,
  displayName,
  defaultValues,
  save,
  retour,
  communeResidenceDefaultOptions,
}: {
  beneficiaireId: string
  displayName: string
  defaultValues: DefaultValues<BeneficiaireData> & {
    id: string
    mediateurId: string
  }
  save: EnregistrerBeneficiaire
  retour?: string
  communeResidenceDefaultOptions?: AdressBanFormFieldOption[]
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
        communeResidenceDefaultOptions={communeResidenceDefaultOptions}
        edit
      />
    </main>
  </div>
)
