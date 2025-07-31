import RequiredFieldsDisclamer from '@app/ui/components/Form/RequiredFieldsDisclamer'
import BeneficiaireForm from '@app/web/app/coop/(full-width-layout)/mes-beneficiaires/BeneficiaireForm'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import BackButton from '@app/web/components/BackButton'
import IconInSquare from '@app/web/components/IconInSquare'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import {
  type EncodedState,
  decodeSerializableState,
} from '@app/web/utils/encodeSerializableState'
import { contentId } from '@app/web/utils/skipLinks'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
import type { DefaultValues } from 'react-hook-form'

const PageCreerBeneficiaire = async ({
  searchParams,
}: {
  searchParams: Promise<{
    cra?: EncodedState<DefaultValues<CraIndividuelData>>
    retour?: string
  }>
}) => {
  const { retour, cra } = await searchParams
  const user = await authenticateMediateur()

  const parsedCra = cra ? decodeSerializableState(cra, {}) : undefined

  return (
    <div className="fr-container fr-container--medium">
      <SkipLinksPortal />
      <CoopBreadcrumbs
        currentPage="Nouveau bénéficiaire"
        parents={[
          {
            label: 'Mes bénéficiaires',
            linkProps: {
              href: '/coop/mes-beneficiaires',
            },
          },
        ]}
      />
      <main id={contentId}>
        <BackButton href="/coop/mes-beneficiaires">
          Retour à mes bénéficiaires
        </BackButton>
        <div className="fr-flex fr-flex-gap-6v fr-align-items-start fr-mb-12v">
          <IconInSquare iconId="fr-icon-user-add-line" size="large" />
          <div className="fr-flex-grow-1">
            <h1 className="fr-text-title--blue-france fr-mb-2v">
              Nouveau bénéficiaire
            </h1>
            <RequiredFieldsDisclamer className="fr-my-0" />
          </div>
        </div>
        <Notice
          className="fr-notice--hint fr-notice--no-icon fr-notice--flex fr-border-radius--16 fr-mb-8v"
          title={
            <span className="fr-flex fr-align-items-center fr-flex-gap-8v fr-py-1w">
              <span
                className="ri-admin-line ri-xl fr-mx-1w fr-text--regular"
                aria-hidden
              />

              <span>
                <span className="fr-notice__title fr-text--md fr-text-title--blue-france fr-mb-1w fr-display-block">
                  N’oubliez pas d’informer vos bénéficiaires sur leurs droits
                  lorsque vous collectez leurs données personnelles.
                </span>
                <span className="fr-mb-1w fr-text--regular fr-text--sm fr-text-default--grey fr-display-block">
                  Un modèle de mention d’information à destination des
                  bénéficiaires que vous accompagnez est à votre disposition
                  dans notre centre d’aide.{' '}
                  <Link
                    className="fr-link fr-text--sm"
                    href="https://incubateurdesterritoires.notion.site/Mod-le-de-mention-d-information-destination-des-b-n-ficiaires-accompagn-s-par-les-m-diateurs-num-r-1cf744bf03dd81f9845cd8a08112eecd"
                    target="_blank"
                  >
                    Consulter via ce lien
                  </Link>
                </span>
              </span>
            </span>
          }
        />
        <BeneficiaireForm
          defaultValues={{
            mediateurId: user.mediateur.id,
          }}
          retour={retour}
          cra={parsedCra}
        />
      </main>
    </div>
  )
}

export default PageCreerBeneficiaire
