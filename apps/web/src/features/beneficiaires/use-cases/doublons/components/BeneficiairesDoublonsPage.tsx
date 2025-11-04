import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { BeneficiairesDoublonsPageData } from '@app/web/features/beneficiaires/use-cases/doublons/getBeneficiairesDoublonsPageData'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import Alert from '@codegouvfr/react-dsfr/Alert'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import BeneficiaireFusionDoublons from './BeneficiaireFusionDoublons'

const BeneficiairesDoublonsPage = ({
  data,
}: {
  data: BeneficiairesDoublonsPageData
}) => {
  const { count } = data

  return (
    <div className="fr-container fr-container--medium fr-mb-32v">
      <SkipLinksPortal />
      <CoopBreadcrumbs
        parents={[
          {
            label: `Mes bénéficiaires`,
            linkProps: { href: '/coop/mes-beneficiaires' },
          },
        ]}
        currentPage="Gérer les doublons"
        className="fr-mb-12v"
      />
      <main id={contentId}>
        <BackButton href="/coop/mes-beneficiaires">
          Retour à mes bénéficiaires
        </BackButton>
        <h1 className="fr-h3 fr-text-title--blue-france fr-mb-2v">
          Gérer les doublons de bénéficiaires
        </h1>
        <p className="fr-text-mention--grey">
          Retrouvez sur cette page vos doublons de bénéficiaires. En fusionnant
          2 bénéficiaires, leurs informations et leur historique
          d’accompagnement seront fusionnés en une seul fiche.{' '}
          <a
            href="https://docs.numerique.gouv.fr/docs/b8b9de2c-6ac4-4119-b6c4-0cb0b3b738d0/"
            className="fr-link fr-link--sm wip"
            target="_blank"
          >
            En savoir plus
          </a>
        </p>

        <div className="fr-p-12v fr-mt-12v fr-border fr-border-radius--8">
          {count === 0 ? (
            <>
              <Notice
                className="fr-notice--success"
                title={<>Aucun doublon de bénéficiaires n’a été détecté</>}
              ></Notice>
              <div className="fr-btns-group fr-mt-10v fr-mb-0">
                <Button
                  priority="secondary"
                  className="fr-mb-0"
                  linkProps={{
                    href: '/coop/mes-beneficiaires',
                  }}
                >
                  Retour à mes bénéficiaires
                </Button>
              </div>
            </>
          ) : (
            <>
              <Notice
                className="fr-notice--info"
                title={
                  <>
                    <strong>{numberToString(count)}</strong> doublon
                    {sPluriel(count)} de bénéficiaire{sPluriel(count)} détecté
                    {sPluriel(count)}
                  </>
                }
              ></Notice>
              <p className="fr-mt-6v">
                Sélectionnez les bénéficiaires que vous souhaitez fusionner
                ainsi que les informations à conserver sur la fiche bénéficiaire
                fusionnée.
              </p>
              <BeneficiaireFusionDoublons data={data} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default BeneficiairesDoublonsPage
