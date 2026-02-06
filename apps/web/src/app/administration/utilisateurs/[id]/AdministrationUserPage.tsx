import AdministrationInfoCard from '@app/web/app/administration/AdministrationInfoCard'
import AdministrationInlineLabelsValues, {
  type LabelAndValue,
} from '@app/web/app/administration/AdministrationInlineLabelsValues'
import AdministrationMailtoLink from '@app/web/app/administration/AdministrationMailtoLink'
import ResetUserInscriptionButton from '@app/web/app/administration/utilisateurs/[id]/ResetUserInscriptionButton'
import UpdateUserDataFromDataspaceButton from '@app/web/app/administration/utilisateurs/[id]/UpdateUserDataFromDataspaceButton'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { isUserInscriptionEnCours } from '@app/web/auth/isUserInscriptionEnCours'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { getMediateurFromDataspaceApi } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { getInvitationStatusBadge } from '@app/web/features/utilisateurs/use-cases/list/getInvitationStatusBadge'
import { getUserAccountStatusBadge } from '@app/web/features/utilisateurs/use-cases/list/getUserAccountStatusBadge'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import { dateAsDayAndTime } from '@app/web/utils/dateAsDayAndTime'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import { getUserDisplayName } from '@app/web/utils/user'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Tag from '@codegouvfr/react-dsfr/Tag'
import type { Structure } from '@prisma/client'
import Link from 'next/link'
import UsurpUserButton from '../../usurpation/UsurpUserButton'
import { type AdministrationUserPageData } from './getAdministrationUserPageData'
import RenvoyerInvitationButton from './RenvoyerInvitationButton'
import UtilisateurSetFeatureFlagsForm from './UtilisateurSetFeatureFlagsForm'

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
      <Link
        href={`/administration/structures/${id}/modifier`}
        target="_blank"
        rel="noreferrer"
      >
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
    label: 'Structure supprimée le',
    value: suppression ? dateAsDay(suppression) : '-',
  },
]

const AdministrationUserPage = async ({
  data: { user },
}: {
  data: AdministrationUserPageData & { user: { statutCompte: string } }
}) => {
  const name = getUserDisplayName(user)

  const {
    role,
    mediateur,
    coordinateur,
    inscriptionValidee,
    siret,
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
    statutCompte,
  } = user

  // V1 CRA count removed - no longer using V1 data

  const enActivite = mediateur ? mediateur.enActivite : []

  const isMediateur = !!mediateur
  const isCoordinateur = !!coordinateur
  const inscriptionEnCours = isUserInscriptionEnCours(user)

  const coordinations = mediateur?.coordinations?.filter(
    ({ suppression }) => !suppression,
  )

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

  const dataspaceInfo = await getMediateurFromDataspaceApi({
    email: user.email,
  })

  return (
    <CoopPageContainer size={64}>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs
        currentPage={`${name}`}
        parents={[
          {
            label: 'Utilisateurs',
            linkProps: { href: '/administration/utilisateurs' },
          },
        ]}
      />
      <main id={contentId}>
        <AdministrationTitle
          icon="fr-icon-user-line"
          actions={<ResetUserInscriptionButton userId={user.id} />}
        >
          {name} <span className="fr-mx-1v" />{' '}
          {getUserAccountStatusBadge(statutCompte)}
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
          {user.isConseillerNumerique && <Tag small>Conseiller numérique</Tag>}
          {isCoordinateur && <Tag small>Coordinateur</Tag>}
        </div>

        <AdministrationInfoCard
          title="Détails de l'utilisateur"
          actions={
            <div>
              {ServerWebAppConfig.Sudo.usurpation && (
                <UsurpUserButton
                  userId={user.id}
                  size="small"
                  className="fr-mr-2v"
                />
              )}
              <Button
                iconId="fr-icon-git-merge-line"
                priority="tertiary"
                size="small"
                linkProps={{
                  href: `/administration/utilisateurs/${user.id}/merge`,
                }}
              >
                Fusionner avec un autre utilisateur
              </Button>
            </div>
          }
        >
          <AdministrationInlineLabelsValues
            items={[
              {
                label: 'Id',
                value: user.id,
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
              { label: 'Siret ProConnect', value: siret || '-' },
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
        <AdministrationInfoCard title="Feature flags">
          <UtilisateurSetFeatureFlagsForm user={user} />
        </AdministrationInfoCard>
        {isMediateur && mediateur && (
          <AdministrationInfoCard title="Rôle médiateur">
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
                  value: numberToString(mediateur.beneficiairesCount),
                },
                {
                  label: 'Nombre d’activités',
                  value: numberToString(mediateur.activitesCount),
                },
                {
                  label: 'Lieux d’activité',
                  value: mediateur.enActivite.length,
                },
                {
                  label: 'Coordoné(e) par',
                  value:
                    !!coordinations && coordinations.length > 0 ? (
                      coordinations.map((coordination) => (
                        <Link
                          key={coordination.id}
                          href={`/administration/utilisateurs/${coordination.coordinateur.user.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {coordination.coordinateur.user.name}
                        </Link>
                      ))
                    ) : (
                      <Badge severity="warning">Aucune coordination</Badge>
                    ),
                },
              ]}
            />
          </AdministrationInfoCard>
        )}
        {isMediateur && user.isConseillerNumerique && (
          <AdministrationInfoCard title="Rôle conseiller numérique">
            <AdministrationInlineLabelsValues
              items={[
                {
                  label: 'Est Conseiller Numérique',
                  value: 'Oui',
                },
              ]}
            />
          </AdministrationInfoCard>
        )}
        {coordinateur && (
          <AdministrationInfoCard title="Rôle coordinateur" id="coordinateur">
            <AdministrationInlineLabelsValues
              items={[
                {
                  label: 'ID Coordinateur',
                  value: coordinateur.id,
                },
                {
                  label: 'Est Conseiller Numérique',
                  value: user.isConseillerNumerique ? 'Oui' : 'Non',
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
                  value: numberToString(
                    coordinateur.mediateursCoordonnes.length,
                  ),
                },
              ]}
            />
            <div className="fr-flex fr-mt-8v fr-mb-6v fr-align-items-center fr-justify-content-space-between">
              <h5 className="fr-mb-0">
                Équipe{' '}
                {coordinateur.mediateursCoordonnes.length > 0 &&
                  ` · ${numberToString(coordinateur.mediateursCoordonnes.length)}`}
              </h5>
              <Button
                iconId="fr-icon-user-add-line"
                priority="secondary"
                size="small"
                linkProps={{
                  href: `/administration/utilisateurs/${user.id}/equipe-coordonnee/ajouter`,
                }}
              >
                Ajouter un membre
              </Button>
            </div>
            {coordinateur.mediateursCoordonnes.length === 0 ? (
              <Badge severity="warning" className="fr-mb-8v">
                Aucun médiateur coordonné
              </Badge>
            ) : (
              <div className="fr-table" data-fr-js-table="true">
                <div className="fr-table__wrapper">
                  <div className="fr-table__container">
                    <div className="fr-table__content">
                      <table data-fr-js-table-element="true">
                        <thead>
                          <tr>
                            <th scope="col">Médiateur</th>
                            <th scope="col">Satut utilisateur</th>
                            <th scope="col">Membre depuis</th>
                            <th scope="col">Membre jusqu'à</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coordinateur.mediateursCoordonnes.map(
                            ({ mediateur, creation, suppression }) => (
                              <tr key={mediateur.id}>
                                <td>
                                  <a
                                    href={`/administration/utilisateurs/${mediateur.userId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="fr-link"
                                  >
                                    <span className="fr-text--sm fr-text--medium fr-mb-0">
                                      {mediateur.user.name}
                                    </span>
                                  </a>
                                  <br />
                                  <span className="fr-text--xs fr-text-mention--grey">
                                    {mediateur.user.email}
                                  </span>
                                </td>
                                <td>
                                  {mediateur.user.deleted ? (
                                    <Badge small severity="warning">
                                      Supprimé le{' '}
                                      {dateAsDay(mediateur.user.deleted)}
                                    </Badge>
                                  ) : (
                                    getUserAccountStatusBadge(statutCompte)
                                  )}
                                </td>
                                <td>{dateAsDayAndTime(creation)}</td>
                                <td>
                                  {suppression
                                    ? dateAsDayAndTime(suppression)
                                    : '-'}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <h5 className="fr-mt-8v">
              Invitations{' '}
              {coordinateur.invitations.length > 0 &&
                ` · ${numberToString(coordinateur.invitations.length)}`}
            </h5>
            {coordinateur.invitations.length === 0 ? (
              <Badge severity="info">Aucune invitation envoyée</Badge>
            ) : (
              <div className="fr-table fr-mb-0" data-fr-js-table="true">
                <div className="fr-table__wrapper">
                  <div className="fr-table__container">
                    <div className="fr-table__content">
                      <table data-fr-js-table-element="true">
                        <thead>
                          <tr>
                            <th scope="col">Invité</th>
                            <th scope="col">Statut utilisateur</th>
                            <th scope="col">Statut invitation</th>
                            <th scope="col">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {coordinateur.invitations.map((invitation) => {
                            const displayName =
                              invitation.mediateurInvite?.user?.name ||
                              'Utilisateur non inscrit'

                            const utilisateurInvite = invitation.mediateurInvite
                              ?.user
                              ? {
                                  ...invitation.mediateurInvite?.user,
                                  mediateur: invitation.mediateurInvite,
                                }
                              : null

                            return (
                              <tr
                                key={`${invitation.email}-${invitation.coordinateurId}`}
                              >
                                <td>
                                  {utilisateurInvite ? (
                                    <>
                                      <a
                                        href={`/administration/utilisateurs/${utilisateurInvite?.mediateur?.userId ?? ''}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="fr-link"
                                      >
                                        <span className="fr-text--sm fr-text--medium fr-mb-0">
                                          {displayName}
                                        </span>{' '}
                                      </a>
                                      <br />
                                      <span className="fr-text--xs fr-text-mention--grey">
                                        {invitation.email}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="fr-text--sm fr-text--medium fr-mb-0">
                                        {displayName}
                                      </span>
                                      <br />
                                      <span className="fr-text--xs fr-text-mention--grey">
                                        {invitation.email}
                                      </span>
                                    </>
                                  )}
                                </td>
                                <td>
                                  {!utilisateurInvite ? (
                                    <Badge small severity="warning">
                                      Utilisateur non inscrit
                                    </Badge>
                                  ) : utilisateurInvite.deleted ? (
                                    <Badge small severity="warning">
                                      Supprimé le{' '}
                                      {dateAsDay(
                                        invitation.mediateurInvite?.user
                                          ?.deleted,
                                      )}
                                    </Badge>
                                  ) : (
                                    getUserAccountStatusBadge(statutCompte)
                                  )}
                                </td>
                                <td>
                                  <span className="fr-text--xs fr-text-mention--grey">
                                    Envoyée le{' '}
                                    {dateAsDayAndTime(invitation.creation)}
                                  </span>
                                  {!!invitation.renvoyee && (
                                    <>
                                      <br />
                                      <span className="fr-text--xs fr-text-mention--grey">
                                        Renvoyée le{' '}
                                        {dateAsDayAndTime(invitation.renvoyee)}
                                      </span>
                                    </>
                                  )}
                                  <br />
                                  {getInvitationStatusBadge({
                                    acceptee: invitation.acceptee,
                                    refusee: invitation.refusee,
                                  })}
                                </td>

                                <td>
                                  {!invitation.acceptee ? (
                                    <RenvoyerInvitationButton
                                      email={invitation.email}
                                      coordinateurId={invitation.coordinateurId}
                                    />
                                  ) : (
                                    '-'
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AdministrationInfoCard>
        )}
        {emplois.length > 0 ? (
          <AdministrationInfoCard
            title="Contrats - Structures employeuses"
            actions={
              <Button
                iconId="fr-icon-settings-5-line"
                priority="tertiary"
                size="small"
                linkProps={{
                  href: `/administration/utilisateurs/${user.id}/emplois`,
                }}
              >
                Modifier
              </Button>
            }
          >
            {emplois.map((emploi) => (
              <div key={emploi.id}>
                <p className="fr-text--lg fr-text--medium fr-mb-4v fr-mt-8v">
                  {emploi.structure.nom}{' '}
                  {!!emploi.fin && emploi.fin < new Date() && (
                    <Badge className="fr-ml-2w" severity="warning" small>
                      Emploi terminé
                    </Badge>
                  )}
                </p>
                <AdministrationInlineLabelsValues
                  items={[
                    {
                      label: 'Début',
                      value: dateAsDay(emploi.debut),
                    },
                    {
                      label: 'Fin',
                      value: emploi.fin ? dateAsDay(emploi.fin) : '-',
                    },
                    {
                      label: 'Créé le',
                      value: dateAsDay(emploi.creation),
                    },
                    {
                      label: 'Supprimé le',
                      value: emploi.suppression
                        ? dateAsDay(emploi.suppression)
                        : '-',
                    },
                    ...getStructuresInfos(emploi.structure),
                  ]}
                />
              </div>
            ))}
          </AdministrationInfoCard>
        ) : (
          (!!coordinateur || !!mediateur) && (
            <AdministrationInfoCard
              title="Structure employeuse"
              actions={
                <Button
                  iconId="fr-icon-settings-5-line"
                  priority="tertiary"
                  size="small"
                  linkProps={{
                    href: `/administration/utilisateurs/${user.id}/emplois`,
                  }}
                >
                  Paramétrer les structures employeuses
                </Button>
              }
            >
              <Notice
                className="fr-notice--alert fr-mt-4v fr-mb-0"
                title={<>Aucune structure employeuse</>}
              />
            </AdministrationInfoCard>
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
        <AdministrationInfoCard
          title="API Dataspace"
          actions={<UpdateUserDataFromDataspaceButton userId={user.id} />}
        >
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

        <AdministrationInfoCard title="Sessions de connexion et comptes liés">
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
      </main>
    </CoopPageContainer>
  )
}

export default AdministrationUserPage
