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

export const ActeurDetailPage = ({
  data,
  departementCode,
}: {
  data: ActeurDetailPageData
  departementCode: string | null
}) => {
  const {
    mediateurId,
    acteur,
    activityDates,
    conseillerNumerique,
    statistiques,
    emploi,
    contract,
    lieuxActivites,
    retourHref,
    retourLabel,
    coordinationFeatures,
  } = data

  const displayName = getActeurDisplayName(acteur)

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--800">
        <CoopBreadcrumbs
          parents={[{ label: retourLabel, linkProps: { href: retourHref } }]}
          currentPage={displayName}
        />
        <main id={contentId} className="fr-mb-16w">
          <section className="fr-mt-8v">
            <ActeurIdentity
              displayName={displayName}
              acteur={acteur}
              coordinationFeatures={coordinationFeatures}
              creation={activityDates.created}
              lastActivityDate={activityDates.lastActivity}
              retourHref={retourHref}
              retourLabel={retourLabel}
              removeFromTeamSuccessHref={null}
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
                <Contract
                  isCoordinateur={false}
                  {...contract}
                  idPGConum={conseillerNumerique?.idPg ?? null}
                />
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
                  conseillerNumerique?.id != null
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
              <ActeurLieuxActivites
                lieux={lieuxActivites}
                departementCode={departementCode}
                lieuPageRetourHref={retourHref}
              />
            </section>
          )}
        </main>
      </div>
    </>
  )
}
