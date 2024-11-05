import { notFound } from 'next/navigation'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
import Tag from '@codegouvfr/react-dsfr/Tag'
import type { Structure } from '@prisma/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { metadataTitle } from '@app/web/app/metadataTitle'
import AdministrationBreadcrumbs from '@app/web/app/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/app/administration/AdministrationTitle'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import AdministrationInfoCard from '@app/web/app/administration/AdministrationInfoCard'
import AdministrationInlineLabelsValues, {
  LabelAndValue,
} from '@app/web/app/administration/AdministrationInlineLabelsValues'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsDayAndTime } from '@app/web/utils/dateAsDayAndTime'
import AdministrationMailtoLink from '@app/web/app/administration/AdministrationMailtoLink'
import { getUserDisplayName } from '@app/web/utils/user'
import { getUserLifecycleBadge } from '@app/web/app/administration/utilisateurs/getUserLifecycleBadge'
import { numberToString } from '@app/web/utils/formatNumber'
import { findConseillerNumeriqueV1 } from '@app/web/external-apis/conseiller-numerique/searchConseillerNumeriqueV1'
import { isUserInscriptionEnCours } from '@app/web/auth/isUserInscriptionEnCours'

export const metadata = {
  title: metadataTitle('Utilisateurs - Détails'),
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

const Page = async ({ params: { id } }: { params: { id: string } }) => {
  const user = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      mediateur: {
        include: {
          conseillerNumerique: {
            include: {
              _count: {
                select: {
                  crasV1: true,
                },
              },
            },
          },
          coordinations: {
            include: {
              coordinateur: {
                include: {
                  user: true,
                },
              },
            },
          },
          enActivite: {
            include: {
              structure: true,
            },
          },
          _count: {
            select: {
              activites: true,
              beneficiaires: true,
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
                  user: true,
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
      },
      usurpateur: true,
    },
  })

  if (!user) {
    notFound()
    return null
  }

  const name = getUserDisplayName(user)

  const {
    role,
    mediateur,
    coordinateur,
    inscriptionValidee,
    firstName,
    lastName,
    email,
    phone,
    created,
    lastLogin,
    profilInscription,
    accounts,
    sessions,
    mutations,
    uploads,
    emplois,
  } = user

  const enActivite = mediateur ? mediateur.enActivite : []

  const isMediateur = !!mediateur
  const isCoordinateur = !!coordinateur
  const inscriptionEnCours = isUserInscriptionEnCours(user)

  // Sort sessions and other lists by most recent first
  const sortedSessions = sessions.sort(
    (a, b) => b.expires.getTime() - a.expires.getTime(),
  )

  const sortedMutations = mutations.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  )

  const sortedUploads = uploads.sort(
    (a, b) => b.created.getTime() - a.created.getTime(),
  )

  const conseillerNumeriqueInfo = await findConseillerNumeriqueV1({
    email: user.email,
    includeDeleted: true,
  })

  return (
    <CoopPageContainer>
      <AdministrationBreadcrumbs
        currentPage={`${name}`}
        parents={[
          {
            label: 'Utilisateurs',
            linkProps: { href: '/administration/utilisateurs' },
          },
        ]}
      />
      <AdministrationTitle icon="fr-icon-user-line">
        {name} <span className="fr-mx-1v" />{' '}
        {getUserLifecycleBadge(user, { small: false })}
      </AdministrationTitle>
      {inscriptionEnCours && !isMediateur && !isCoordinateur && (
        <Notice
          className="fr-notice--warning fr-mb-8v"
          title="Inscription restée à la première étape"
        />
      )}

      <div className="fr-flex fr-flex-gap-2v fr-mb-6v">
        {role === 'Admin' && <Tag small>Administrateur</Tag>}
        {role === 'Support' && <Tag small>Support</Tag>}
        {isMediateur && <Tag small>Médiateur</Tag>}
        {mediateur?.conseillerNumerique && (
          <Tag small>Conseiller numérique</Tag>
        )}
        {isCoordinateur && <Tag small>Coordinateur</Tag>}
      </div>
      {conseillerNumeriqueInfo ? (
        <Notice
          className="fr-notice--success fr-mb-8v"
          title={
            <>
              Trouvé dans la base de données des conseillers numériques V1{' '}
              <Button
                size="small"
                className="fr-ml-2v"
                priority="tertiary no outline"
                iconId="fr-icon-arrow-right-line"
                linkProps={{
                  href: `/administration/conseillers-v1/${conseillerNumeriqueInfo.conseiller.id}`,
                }}
              >
                Voir les détails du conseiller V1
              </Button>
            </>
          }
        />
      ) : (
        <Notice
          className="fr-notice--info fr-mb-8v"
          title="Inexistant dans la base de données des conseillers numériques V1"
        />
      )}
      <AdministrationInfoCard title="Détails de l'utilisateur">
        <AdministrationInlineLabelsValues
          items={[
            {
              label: 'Id',
              value: id,
            },
            {
              label: 'Prénom',
              value: firstName || 'Non renseigné',
            },
            {
              label: 'Nom de famille',
              value: lastName || 'Non renseigné',
            },
            {
              label: 'Email',
              value: email ? (
                <AdministrationMailtoLink email={email} />
              ) : (
                'Non renseigné'
              ),
            },
            {
              label: 'Téléphone',
              value: phone || 'Non renseigné',
            },
            {
              label: 'Rôle sécurité',
              value: role,
            },
            {
              label: 'Créé le',
              value: dateAsDay(created),
            },
            {
              label: 'Dernière connexion',
              value: lastLogin ? dateAsDayAndTime(lastLogin) : 'Jamais',
            },
            {
              label: 'Profil d’inscription',
              value: profilInscription || 'Non renseigné',
            },
            {
              label: 'Inscription validée',
              value: inscriptionValidee
                ? dateAsDayAndTime(inscriptionValidee)
                : 'Non',
            },
          ]}
        />
      </AdministrationInfoCard>
      {isMediateur && mediateur && (
        <AdministrationInfoCard title="Infos médiateur">
          <AdministrationInlineLabelsValues
            items={[
              {
                label: 'ID Médiateur',
                value: mediateur.id,
              },
              {
                label: 'Créé le',
                value: dateAsDay(mediateur.creation),
              },
              {
                label: 'Modifié le',
                value: dateAsDay(mediateur.modification),
              },
              {
                label: 'Nombre de bénéficiaires',
                value: numberToString(mediateur._count.beneficiaires),
              },
              {
                label: 'Nombre d’activités',
                value: numberToString(mediateur._count.activites),
              },
              {
                label: 'Lieux d’activité',
                value: mediateur.enActivite.length,
              },
            ]}
          />
        </AdministrationInfoCard>
      )}
      {isMediateur && mediateur?.conseillerNumerique && (
        <AdministrationInfoCard title="Infos conseiller numérique">
          <AdministrationInlineLabelsValues
            items={[
              {
                label: 'ID Conseiller Numérique',
                value: (
                  <Link
                    className="fr-link"
                    href={`/administration/conseillers-v1/${mediateur.conseillerNumerique.id}`}
                    target="_blank"
                  >
                    {mediateur.conseillerNumerique.id}
                  </Link>
                ),
              },
              {
                label: 'Dernier import de CRAs v1',
                value: mediateur.conseillerNumerique.dernierImportCrasV1
                  ? dateAsDay(mediateur.conseillerNumerique.dernierImportCrasV1)
                  : 'Jamais',
              },
              {
                label: 'CRAs v1 date début',
                value: mediateur.conseillerNumerique.crasV1DateDebut
                  ? dateAsDay(mediateur.conseillerNumerique.crasV1DateDebut)
                  : '-',
              },
              {
                label: 'CRAs v1 date fin',
                value: mediateur.conseillerNumerique.crasV1DateFin
                  ? dateAsDay(mediateur.conseillerNumerique.crasV1DateFin)
                  : '-',
              },
              {
                label: 'Nombre de CRAs v1 importés',
                value: numberToString(
                  mediateur.conseillerNumerique._count.crasV1,
                ),
              },
            ]}
          />
        </AdministrationInfoCard>
      )}
      {coordinateur && (
        <AdministrationInfoCard title="Infos coordinateur">
          <AdministrationInlineLabelsValues
            items={[
              {
                label: 'ID Coordinateur',
                value: coordinateur.id,
              },
              {
                label: 'Conseiller Numérique ID',
                value: coordinateur.conseillerNumeriqueId,
              },
              {
                label: 'Créé le',
                value: dateAsDay(coordinateur.creation),
              },
              {
                label: 'Modifié le',
                value: dateAsDay(coordinateur.modification),
              },
              {
                label: 'Nombre de médiateurs coordonnés',
                value: numberToString(coordinateur.mediateursCoordonnes.length),
              },
            ]}
          />
        </AdministrationInfoCard>
      )}
      {emplois.length > 0 ? (
        <AdministrationInfoCard title="Structures employeuses">
          {emplois.map((emploi) => (
            <div key={emploi.id}>
              <p className="fr-text--lg fr-text--medium fr-mb-4v fr-mt-8v">
                {emploi.structure.nom}
              </p>
              <AdministrationInlineLabelsValues
                items={[
                  ...getStructuresInfos(emploi.structure),
                  {
                    label: 'Lien d’emploi créé le',
                    value: dateAsDay(emploi.creation),
                  },
                  {
                    label: 'Lien d’emploi supprimé le',
                    value: emploi.suppression
                      ? dateAsDay(emploi.suppression)
                      : '-',
                  },
                ]}
              />
            </div>
          ))}
        </AdministrationInfoCard>
      ) : (
        (!!coordinateur || !!mediateur) && (
          <Notice
            className="fr-notice--alert fr-mb-6v"
            title={<>Aucune structure employeuse</>}
          />
        )
      )}
      {enActivite.length > 0 ? (
        <AdministrationInfoCard title="Lieux d’activité">
          {enActivite.map((activite) => (
            <div key={activite.id}>
              <p className="fr-text--lg fr-text--medium fr-mb-4v fr-mt-8v">
                {activite.structure.nom}
              </p>
              <AdministrationInlineLabelsValues
                items={[
                  ...getStructuresInfos(activite.structure),
                  {
                    label: 'Lien d’activité créé le',
                    value: dateAsDay(activite.creation),
                  },
                  {
                    label: 'Lien d’activité supprimé le',
                    value: activite.suppression
                      ? dateAsDay(activite.suppression)
                      : '-',
                  },
                ]}
              />
            </div>
          ))}
        </AdministrationInfoCard>
      ) : (
        !!mediateur && (
          <Notice
            className="fr-notice--alert fr-mb-6v"
            title={<>Aucun lieu d’activité</>}
          />
        )
      )}

      <AdministrationInfoCard title="Sessions et comptes liés">
        <AdministrationInlineLabelsValues
          items={[
            ...(accounts.length > 0
              ? accounts.map((account) => ({
                  label: `Sub ID ${account.provider}`,
                  value: `${account.providerAccountId}`,
                }))
              : [
                  {
                    label: 'Compte',
                    value: "Aucun provider d'authentification lié",
                  },
                ]),
            ...(sortedSessions.length > 0
              ? sortedSessions.map((session) => ({
                  label: `Session ${session.id}`,
                  value: `Expire le ${dateAsDayAndTime(session.expires)}`,
                }))
              : [{ label: 'Session', value: 'Aucune session active' }]),
          ]}
        />
      </AdministrationInfoCard>
      <AdministrationInfoCard title="Mutations">
        {sortedMutations.length > 0 ? (
          <AdministrationInlineLabelsValues
            items={sortedMutations.map((mutation) => ({
              label: `${mutation.nom}`,
              value: `Date: ${dateAsDayAndTime(mutation.timestamp)}`,
            }))}
          />
        ) : (
          <p className="fr-mb-0">Aucune mutation enregistrée.</p>
        )}
      </AdministrationInfoCard>
      {sortedUploads.length > 0 && (
        <AdministrationInfoCard title="Uploads">
          <AdministrationInlineLabelsValues
            items={sortedUploads.map((upload) => ({
              label: `Fichier ${upload.name}`,
              value: `Uploadé le: ${dateAsDayAndTime(upload.created)}`,
            }))}
          />
        </AdministrationInfoCard>
      )}
    </CoopPageContainer>
  )
}

export default Page
