import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import Contract from '@app/web/components/conseiller-numerique/Contract'
import IconInSquare from '@app/web/components/IconInSquare'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import ActeurIdentity from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurIdentity'
import ActeurLieuxActivites from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurLieuxActivites'
import ActeurStatistiques from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurStatistiques'
import ActeurStructureEmployeuse from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurStructureEmployeuse'
import type { ActeurDetailPageData } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDetailPageData'
import { getActeurDisplayName } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDisplayName'
import { contentId } from '@app/web/utils/skipLinks'
import classNames from 'classnames'
import { getMonReseauBreadcrumbParents } from '../../getMonReseauBreadcrumbParents'

export const ActeurDetailPage = ({
  data,
  departementCode,
}: {
  data: ActeurDetailPageData
  departementCode: string
}) => {
  const {
    mediateurId,
    acteur,
    activityDates,
    statistiques,
    emploi,
    contract,
    lieuxActivites,
    coordinationFeatures,
  } = data

  const displayName = getActeurDisplayName(acteur)

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--medium">
        <CoopBreadcrumbs
          parents={[
            ...getMonReseauBreadcrumbParents({ code: departementCode }),
            {
              label: 'Annuaire des acteurs',
              linkProps: {
                href: `/coop/mon-reseau/${departementCode}/acteurs`,
              },
            },
          ]}
          currentPage={displayName}
        />
        <main id={contentId} className="fr-mb-16w">
          <section className="fr-mt-8v">
            <ActeurIdentity
              departementCode={departementCode}
              displayName={displayName}
              acteur={acteur}
              coordinationFeatures={coordinationFeatures}
              creation={activityDates.created}
              lastActivityDate={activityDates.lastActivity}
            />
          </section>

          {coordinationFeatures &&
            coordinationFeatures.showStats &&
            mediateurId && (
              <section
                className={classNames(
                  'fr-p-8v fr-border-radius--16',
                  coordinationFeatures.acteurIsMediateurCoordonnne
                    ? 'fr-background-alt--brown-caramel'
                    : 'fr-background-alt--grey',
                )}
              >
                <ActeurStatistiques
                  mediateurId={mediateurId}
                  coordinationEnd={
                    coordinationFeatures.coordinationDetails?.coordinations
                      .coordinationEnded?.suppression ?? undefined
                  }
                  {...statistiques}
                />
              </section>
            )}
          {coordinationFeatures &&
            coordinationFeatures.showContract &&
            contract && (
              <section className="fr-mt-6v">
                <Contract isCoordinateur={false} {...contract} />
              </section>
            )}
          {emploi != null && (
            <section className="fr-mt-6v" id="structure-employeuse">
              <ActeurStructureEmployeuse
                emploi={emploi}
                showIsLieuActiviteNotice={false}
                showReferentStructure={
                  coordinationFeatures?.showReferentStructure ?? false
                }
                showReferentStructureConseillerNumeriqueSupportNotice={
                  acteur.isConseillerNumerique
                }
                title={
                  <div className="fr-flex fr-flex-gap-3v fr-align-items-center fr-mb-6v">
                    <IconInSquare iconId="ri-home-smile-2-line" size="small" />
                    <h2 className="fr-text-title--blue-france fr-h6 fr-m-0">
                      Structure employeuse
                    </h2>
                  </div>
                }
              />
            </section>
          )}
          {mediateurId && (
            <section className="fr-mt-6v" id="lieux-activite">
              <ActeurLieuxActivites lieux={lieuxActivites} />
            </section>
          )}
        </main>
      </div>
    </>
  )
}
