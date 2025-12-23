import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import Contract from '@app/web/components/conseiller-numerique/Contract'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { ReferentStructure } from '@app/web/components/structure/ReferentStructure'
import { StructureEmployeuse } from '@app/web/components/structure/StructureEmployeuse'
import Identity from '@app/web/equipe/MediateurDetailPage/Identity'
import { LieuxActivites } from '@app/web/equipe/MediateurDetailPage/LieuxActivites'
import { Statistiques } from '@app/web/equipe/MediateurDetailPage/Statistiques'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { contentId } from '@app/web/utils/skipLinks'
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import classNames from 'classnames'
import Link from 'next/link'
import type { ActeurDetailPageData } from './getActeurDetailPageData'

const acteurRoleConfig = {
  coordinateur: {
    icon: '/images/iconographie/profil-coordinateur-conseiller-numerique.svg',
    label: 'Coordinateur',
  },
  conseiller_numerique: {
    icon: '/images/illustrations/role/conseillers-numerique.svg',
    label: 'Conseiller numérique',
  },
  mediateur: {
    icon: null, // Uses generic icon
    label: 'Médiateur numérique',
  },
} as const

export const ActeurDetailPage = ({ data }: { data: ActeurDetailPageData }) => {
  const {
    mediateurId,
    user,
    acteurRole,
    conseillerNumerique,
    statistiques,
    structureEmployeuse,
    contract,
    lieuxActivites,
    retourHref,
    retourLabel,
    coordinationEnd,
    showStats,
    showContract,
    showReferentStructure,
    showTeamActions,
    showTeamView,
  } = data

  const isCoordinateurOnly = acteurRole === 'coordinateur' && !mediateurId

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--800">
        <CoopBreadcrumbs
          parents={[{ label: retourLabel, linkProps: { href: retourHref } }]}
          currentPage={user.name ?? 'Acteur'}
        />
        <main id={contentId} className="fr-mb-16w">
          {mediateurId && (
            <section className="fr-my-10v">
              <Identity
                {...user}
                coordinationEnd={coordinationEnd}
                mediateurId={mediateurId}
                isConseillerNumerique={conseillerNumerique?.id != null}
                href={retourHref}
                coordinateurView={showTeamActions}
              />
            </section>
          )}
          {isCoordinateurOnly && (
            <section className="fr-my-10v">
              <BackButton href={retourHref}>Retour</BackButton>
              {user.created && (
                <p className="fr-text--xs fr-text-mention--grey fr-mb-2v">
                  Profil créé le {dateAsDay(user.created)}
                </p>
              )}
              <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-mb-6v">
                <span
                  className="fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-4v fr-m-0 fr-border-radius--8"
                  aria-hidden
                >
                  <img
                    width="40px"
                    height="40px"
                    src={acteurRoleConfig.coordinateur.icon}
                    alt=""
                  />
                </span>
                <div className="fr-flex fr-direction-column">
                  <h1 className="fr-h2 fr-page-title fr-m-0">{user.name}</h1>
                  <p className="fr-text--sm fr-mb-0 fr-mt-1v fr-flex fr-align-items-center">
                    <span
                      className="ri-community-line fr-mr-1w fr-text-label--blue-france"
                      aria-hidden
                    />
                    {acteurRoleConfig.coordinateur.label}
                  </p>
                  <p className="fr-text-mention--grey fr-text--sm fr-mb-0 fr-mt-1v">
                    {user.phone && (
                      <>
                        <span className="ri-phone-line fr-mr-1v" aria-hidden />
                        {user.phone}
                        {' · '}
                      </>
                    )}
                    <span className="ri-mail-line fr-mr-1v" aria-hidden />
                    {user.email}
                  </p>
                </div>
              </div>
              <ButtonsGroup
                buttonsSize="small"
                buttons={[
                  {
                    className: 'fr-mb-0',
                    children: (
                      <span className="fr-flex fr-flex-gap-2v">
                        <span className="ri-mail-line" aria-hidden />
                        Contacter par mail
                      </span>
                    ),
                    title: 'Contacter par mail - client mail',
                    linkProps: { href: `mailto:${user.email}` },
                    priority: 'tertiary',
                  },
                ]}
                inlineLayoutWhen="md and up"
              />
            </section>
          )}
          {!mediateurId && !isCoordinateurOnly && (
            <section className="fr-my-10v">
              <h1 className="fr-h2 fr-page-title fr-m-0">
                {user.name ?? 'Acteur'}
              </h1>
              <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
                {user.email}
                {user.phone && ` · ${user.phone}`}
              </p>
            </section>
          )}
          {showStats && mediateurId && (
            <section
              className={classNames(
                'fr-p-8v fr-border-radius--16',
                coordinationEnd == null
                  ? 'fr-background-alt--brown-caramel'
                  : 'fr-background-alt--grey',
              )}
            >
              <Statistiques
                mediateurId={mediateurId}
                coordinationEnd={coordinationEnd}
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
              <LieuxActivites
                lieuxActivites={lieuxActivites}
                mediateurId={mediateurId}
                coordinateurView={showTeamView}
              />
            </section>
          )}
        </main>
      </div>
    </>
  )
}
