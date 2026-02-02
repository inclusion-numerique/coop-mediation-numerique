import { CommunicationConum } from '@app/web/app/coop/(sidemenu-layout)/(accueil-coop)/_components/CommunicationConum'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import Card from '@app/web/components/Card'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { Departement } from '@app/web/data/collectivites-territoriales/departements'
import MonReseauCountStatCard from '@app/web/features/mon-reseau/components/MonReseauCountStatCard'
import DepartementComboBox from '@app/web/features/mon-reseau/DepartementComboBox'
import { getInclusionNumeriqueDepartementDataUrl } from '@app/web/features/mon-reseau/getInclusionNumeriqueDepartementDataUrl'
import { contentId } from '@app/web/utils/skipLinks'
import Image from 'next/image'
import Link from 'next/link'
import { getMonReseauBreadcrumbLabel } from '../getMonReseauBreadcrumbParents'

const mattermostHref = 'https://discussion.coop-numerique.anct.gouv.fr'

const MonReseauPage = ({
  departement,
  acteursCount,
  lieuxCount,
  isConseillerNumerique,
}: {
  departement: Departement
  acteursCount: number
  lieuxCount: number
  isConseillerNumerique: boolean
}) => (
  <CoopPageContainer size={49}>
    <SkipLinksPortal />
    <CoopBreadcrumbs
      currentPage={getMonReseauBreadcrumbLabel({ code: departement.code })}
    />
    <main id={contentId}>
      <div className="fr-flex fr-flex-wrap fr-align-items-center fr-justify-content-space-between fr-flex-gap-4v fr-mt-8v fr-mb-4v">
        <h1 className="fr-text-title--blue-france fr-mb-0">Mon réseau</h1>
        <div style={{ minWidth: '280px' }}>
          <DepartementComboBox defaultDepartement={departement} />
        </div>
      </div>

      <p className="fr-text--lg fr-text-mention--grey fr-mt-6v">
        Retrouvez les acteurs, les lieux et les statistiques d'activités
        référencées sur La Coop de la médiation numérique, par département.
      </p>

      <div className="fr-grid-row fr-grid-row--gutters fr-my-12v">
        <div className="fr-col-lg-6 fr-col-12">
          <MonReseauCountStatCard
            count={acteursCount}
            label="Acteurs de l'inclusion numérique"
            iconId="fr-icon-account-line"
            href={`/coop/mon-reseau/${departement.code}/acteurs`}
            linkLabel="Voir l’annuaire des acteurs"
          />
        </div>
        <div className="fr-col-lg-6 fr-col-12">
          <MonReseauCountStatCard
            count={lieuxCount}
            label="Lieux d'inclusion numérique"
            iconId="ri-home-office-line"
            href={`/coop/mon-reseau/${departement.code}/lieux`}
            linkLabel="Voir l’annuaire des lieux"
          />
        </div>
      </div>

      {isConseillerNumerique ? (
        <section className="fr-mb-8v">
          <CommunicationConum />
        </section>
      ) : (
        <section className="fr-mb-8v">
          <div className="fr-flex fr-align-items-center fr-mb-6v">
            <span
              className="fr-text-mention--grey fr-icon-chat-3-line ri-lg fr-mr-2v"
              aria-hidden
            />
            <h2 className="fr-h6 fr-mb-0 fr-text-mention--grey fr-flex fr-align-items-center">
              Les canaux de discussion
            </h2>
          </div>
          <Card
            noBorder
            arrowTop
            arrowSm
            className="fr-border fr-border-radius--16"
            classes={{
              content: 'fr-p-0 fr-text--sm fr-text--medium fr-mb-0',
            }}
            title={
              <span className="fr-inline-flex fr-align-items-center">
                <Image
                  className="fr-mr-3v"
                  width={24}
                  height={24}
                  src="/images/services/mattermost.svg"
                  alt=""
                />
                <span className="fr-text--uppercase fr-text--xs fr-mb-0 fr-text-default--grey">
                  Mattermost
                </span>
              </span>
            }
            href={mattermostHref}
            isExternal
          >
            <p className="fr-text--bold fr-mb-2v">
              Échangez avec des acteurs de l'inclusion numérique&nbsp;!
            </p>
            <p className="fr-text--sm fr-mb-0 fr-text-mention--grey">
              Mattermost est un service de messagerie instantanée, mis à
              disposition des médiateurs numériques par l'ANCT et animé par la
              Mednum.
            </p>
          </Card>
        </section>
      )}

      <section className="fr-mb-8v fr-mt-12v">
        <div className="fr-flex fr-align-items-center fr-mb-6v">
          <span
            className="fr-text-mention--grey fr-icon-france-line ri-lg fr-mr-2v"
            aria-hidden
          />
          <h2 className="fr-text-mention--grey fr-h6 fr-mb-0 fr-flex fr-align-items-center">
            Les données publiques de l'inclusion numérique sur votre département
          </h2>
        </div>
        <div className="fr-p-8v fr-border-radius--16 fr-background-alt--brown-caramel">
          <div className="fr-flex fr-flex-gap-12v fr-align-items-center">
            <img
              src="/images/services/mon-inclusion-numerique.svg"
              alt=""
              width={140}
            />
            <div>
              <p className="fr-mb-4v">
                Vos statistiques d'activités contribuent à valoriser et
                comprendre l'impact de l'inclusion numérique sur votre
                territoire.
              </p>
              <Link
                className="fr-btn fr-btn--secondary"
                href={getInclusionNumeriqueDepartementDataUrl(departement.code)}
                target="_blank"
                rel="noreferrer"
              >
                Voir les données de mon département
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  </CoopPageContainer>
)

export default MonReseauPage
