import AdministrationInfoCard from '@app/web/app/administration/AdministrationInfoCard'
import AdministrationInlineLabelsValues, {
  type LabelAndValue,
} from '@app/web/app/administration/AdministrationInlineLabelsValues'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { getMediateurFromDataspaceApi } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { getUserLifecycleBadge } from '@app/web/features/utilisateurs/use-cases/list/getUserLifecycleBadge'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { contentId } from '@app/web/utils/skipLinks'
import { getUserDisplayName } from '@app/web/utils/user'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import type { Structure } from '@prisma/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Utilisateurs - Structure employeuse'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const getStructuresInfos = ({
  id,
  commune,
  adresse,
  codeInsee,
  codePostal,
  siret,
  rna,
  nom,
  creation,
  suppression,
}: Structure): LabelAndValue[] => [
  {
    label: 'Nom',
    value: nom,
  },
  {
    label: 'Id',
    value: (
      <Link href={`/administration/structures/${id}`} target="_blank">
        {id}
      </Link>
    ),
  },
  {
    label: 'Adresse',
    value: adresse || 'Non renseignée',
  },
  {
    label: 'Siret',
    value: siret || 'Non renseigné',
  },
  {
    label: 'Rna',
    value: rna || 'Non renseigné',
  },
  {
    label: 'Commune',
    value: commune || 'Non renseignée',
  },
  {
    label: 'Code Insee',
    value: codeInsee || 'Non renseigné',
  },
  {
    label: 'Code postal',
    value: codePostal || 'Non renseigné',
  },
  {
    label: 'Créé le',
    value: dateAsDay(creation),
  },
  {
    label: 'Supprimée le',
    value: suppression ? dateAsDay(suppression) : '-',
  },
]

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  const { id } = params

  const user = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      mediateur: {
        include: {
          conseillerNumerique: true,
          coordinations: {
            include: {
              coordinateur: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          enActivite: {
            include: {
              structure: true,
            },
          },
        },
      },
      coordinateur: {
        include: {
          mediateursCoordonnes: {
            include: {
              mediateur: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      accounts: true,
      sessions: true,
      uploads: true,
      mutations: true,
      emplois: {
        include: {
          structure: true,
        },
        orderBy: {
          creation: 'desc',
        },
      },
      usurpateur: true,
    },
  })

  if (!user) {
    notFound()
    return null
  }

  const name = getUserDisplayName(user)

  const { emplois } = user

  const dataspaceInfo = await getMediateurFromDataspaceApi({
    email: user.email,
  })

  // TODO use helper after annuaire mon-reseau feature merge
  const isConseillerNumerique =
    user.mediateur?.conseillerNumerique !== null ||
    user.coordinateur?.conseillerNumeriqueId !== null

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs
        currentPage="Structure employeuse"
        parents={[
          {
            label: 'Utilisateurs',
            linkProps: { href: '/administration/utilisateurs' },
          },
          {
            label: name,
            linkProps: { href: `/administration/utilisateurs/${id}` },
          },
        ]}
      />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-user-line">
          {name} - Structures employeuses <span className="fr-mx-1v" />{' '}
          {getUserLifecycleBadge(user, { small: false })}
        </AdministrationTitle>

        <AdministrationInfoCard
          title="Structures employeuses"
          actions={
            <Button
              className="fr-mt-0 fr-mb-0"
              size="small"
              priority="primary"
              linkProps={{
                href: `/administration/utilisateurs/${user.id}/emplois/creer`,
              }}
              iconId="fr-icon-add-line"
            >
              Ajouter une structure employeuse
            </Button>
          }
        >
          <span>
            Siret ProConnect : <b>{user.siret || '-'}</b>
          </span>
          {emplois.length === 0 && (
            <Notice
              title={<>Aucune structure employeuse.</>}
              className="fr-notice--alert"
            />
          )}
          <div className="fr-flex" />
          {emplois.map((emploi) => (
            <div key={emploi.id}>
              <hr className="fr-separator-1px fr-mt-4v" />
              <p className="fr-text--bold fr-mb-0 fr-mt-6v">
                <span className="fr-mr-2w">{emploi.structure.nom}</span>
                {emploi.suppression ? (
                  <Badge as="span" small severity="warning">
                    Emploi terminé
                  </Badge>
                ) : (
                  <Badge as="span" small severity="success">
                    Emploi en cours
                  </Badge>
                )}
              </p>

              <AdministrationInlineLabelsValues
                className="fr-mt-4v"
                items={[
                  {
                    label: 'Début de l’emploi',
                    value: dateAsDay(emploi.creation),
                  },
                  {
                    label: 'Fin de l’emploi',
                    value: emploi.suppression
                      ? dateAsDay(emploi.suppression)
                      : '-',
                  },
                ]}
              />
              {!isConseillerNumerique && (
                <div className="fr-flex">
                  <Button
                    className="fr-mt-4v fr-mb-0"
                    size="small"
                    priority="tertiary"
                    linkProps={{
                      href: `/administration/utilisateurs/${user.id}/emplois/${emploi.id}/modifier`,
                    }}
                    iconId="fr-icon-edit-line"
                  >
                    Modifier
                  </Button>
                </div>
              )}

              <p className="fr-mb-0 fr-mt-6v">
                Informations sur la structure&nbsp;:
              </p>
              <AdministrationInlineLabelsValues
                className="fr-mt-4v"
                items={[...getStructuresInfos(emploi.structure)]}
              />
            </div>
          ))}
        </AdministrationInfoCard>

        <AdministrationInfoCard title="API Dataspace">
          {!dataspaceInfo && (
            <Notice
              className="fr-notice--warning fr-mb-6v"
              title={<>Utilisateur non trouvé dans l’API Dataspace</>}
            />
          )}
          {dataspaceInfo && (
            <div className="fr-border-radius--8 fr-p-4v fr-background-alt--grey">
              <pre
                className="fr-text--sm fr-mb-0"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {JSON.stringify(dataspaceInfo, null, 2)}
              </pre>
            </div>
          )}
        </AdministrationInfoCard>
      </main>
    </CoopPageContainer>
  )
}

export default Page
