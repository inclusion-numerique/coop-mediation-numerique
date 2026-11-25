import Link from 'next/link'
import type { VueDeModificationDuBeneficiaire } from '@/features/beneficiaire/abilities/modifier-beneficiaire/ui/presenters/modifier-beneficiaire.presenter'
import BeneficiaireForm, {
  type EnregistrerBeneficiaire,
} from '@/features/beneficiaire/ui/forms/BeneficiaireForm'
import { hrefDuBeneficiaire } from '@/features/beneficiaire/ui/presenters/liens.presenter'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  BackButton,
  CoopBreadcrumbs,
  IconInSquare,
} from '@/libraries/ui/components'

export const ModifierBeneficiairePage = ({
  view: { beneficiaireId, displayName, defaultValues },
  save,
  retour,
}: {
  view: VueDeModificationDuBeneficiaire
  save: EnregistrerBeneficiaire
  retour?: string | undefined
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
          linkProps: { href: hrefDuBeneficiaire(beneficiaireId) },
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
