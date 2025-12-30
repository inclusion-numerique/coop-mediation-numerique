import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import Contract from '@app/web/components/conseiller-numerique/Contract'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { ReferentStructure } from '@app/web/components/structure/ReferentStructure'
import { StructureEmployeuse } from '@app/web/components/structure/StructureEmployeuse'
import ActeurIdentity from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurIdentity'
import ActeurLieuxActivites from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurLieuxActivites'
import ActeurStatistiques from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurStatistiques'
import type { ActeurDetailPageData } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDetailPageData'
import { getActeurDisplayName } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDisplayName'
import { contentId } from '@app/web/utils/skipLinks'
import classNames from 'classnames'
import Link from 'next/link'

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
    structureEmployeuse,
    contract,
    lieuxActivites,
    retourHref,
    retourLabel,
    coordinationFeatures,
  } = data

  const displayName = getActeurDisplayName(acteur)

  const { showStats, showContract, showReferentStructure } =
    coordinationFeatures

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

          {showStats && mediateurId && (
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
          {showContract && contract && (
            <section className="fr-mt-6v">
              <Contract
                isCoordinateur={false}
                {...contract}
                idPGConum={conseillerNumerique?.idPg ?? null}
              />
            </section>
          )}
          {structureEmployeuse != null && (
            <section className="fr-mt-6v">
              <StructureEmployeuse
                isLieuActivite={false}
                id={structureEmployeuse.id}
                {...structureEmployeuse.structure}
              >
                {showReferentStructure &&
                  structureEmployeuse.structure.nomReferent != null && (
                    <>
                      <ReferentStructure {...structureEmployeuse.structure} />
                      {conseillerNumerique?.id != null && (
                        <em className="fr-text--xs fr-text-mention--grey fr-mb-0 fr-mt-6v">
                          Si vous constatez une erreur sur les informations
                          concernant cette structure, veuillez contacter le
                          support du dispositif conseiller
                          numérique&nbsp;:&nbsp;
                          <Link href="mailto:conseiller-numerique@anct.gouv.fr">
                            conseiller-numerique@anct.gouv.fr
                          </Link>
                        </em>
                      )}
                    </>
                  )}
              </StructureEmployeuse>
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
