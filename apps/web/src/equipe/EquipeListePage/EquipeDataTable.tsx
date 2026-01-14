import UserPublicActivityStatusBadge from '@app/web/features/utilisateurs/components/UserPublicActivityStatusBadge'
import { getUserPublicActivityStatus } from '@app/web/features/utilisateurs/utils/getUserPublicActivityStatus'
import type { DataTableConfiguration } from '@app/web/libs/data-table/DataTableConfiguration'
import Badge from '@codegouvfr/react-dsfr/Badge'
import { Invitation } from './actions/Invitation'
import { RetirerDeMonEquipe } from './actions/RetirerDeMonEquipe'
import { SupprimerDefinitivement } from './actions/SupprimerDefinitivement'
import type { MemberStatus } from './getEquipePageData'
import type { MediateurListProps } from './MediateurList'

const getSeverityFromStatus = (
  memberStatus: MemberStatus,
): 'info' | 'success' | 'warning' | undefined => {
  const severityMap: Record<
    MemberStatus,
    'info' | 'success' | 'warning' | undefined
  > = {
    invitation: 'info',
    actif: 'success',
    inactif: 'warning',
    autre: undefined,
    supprime: undefined,
  }
  return severityMap[memberStatus]
}

export type EquipeDataTableConfiguration =
  DataTableConfiguration<MediateurListProps>

export const EquipeDataTable = (coordinateurView: boolean) =>
  ({
    rowKey: ({ email }) => email,
    rowLink: ({ userId, type, departementCode }) =>
      type === 'coordinated' && userId
        ? { href: `/coop/mon-reseau/${departementCode}/acteurs/${userId}` }
        : undefined,
    columns: [
      {
        name: 'role',
        header: '',
        cell: ({ type, isConseillerNumerique }) => {
          if (type === 'invited') {
            return (
              <span
                className="ri-mail-line ri-xl fr-text-label--blue-france"
                aria-hidden
              />
            )
          }
          if (isConseillerNumerique) {
            return (
              <div className="fr-flex fr-align-items-center">
                <img
                  alt="Conseiller numérique"
                  src="/images/illustrations/role/conseillers-numerique.svg"
                  width={24}
                  height={24}
                />
              </div>
            )
          }
          return (
            <span
              className="ri-account-circle-line ri-xl fr-text-label--blue-france"
              aria-hidden
            />
          )
        },
      },
      {
        name: 'membre',
        header: 'Membre',
        sortable: true,
        cellStyle: { maxWidth: 300 },
        cell: ({ firstName, lastName, type, isConseillerNumerique }) => {
          if (type === 'invited') {
            return firstName && lastName ? (
              <>
                <div className="fr-text--bold fr-whitespace-normal">{`${firstName} ${lastName}`}</div>
                <div className="fr-text--xs fr-text-mention--grey fr-mb-0">
                  Invitation en attente
                </div>
              </>
            ) : (
              <b>Invitation en attente</b>
            )
          }
          return (
            <>
              <div className="fr-text--bold fr-whitespace-normal">{`${firstName} ${lastName}`}</div>
              <div className="fr-text--xs fr-text-mention--grey fr-mb-0">
                {isConseillerNumerique
                  ? 'Conseiller numérique'
                  : 'Médiateur numérique'}
              </div>
            </>
          )
        },
      },
      {
        name: 'email',
        header: 'Adresse email',
        cellClassName: 'fr-whitespace-normal',
        cellStyle: { maxWidth: 300 },
        cell: ({ email, memberStatus }) =>
          memberStatus === 'supprime' ? '/' : email,
      },
      {
        name: 'structureEmployeuse',
        header: 'Structure employeuse',
        sortable: true,
        cellClassName: 'fr-whitespace-normal',
        cellStyle: { maxWidth: 300 },
        cell: ({ structureEmployeuse }) => structureEmployeuse ?? '/',
      },
      {
        name: 'statut',
        header: 'Statut',
        sortable: true,
        defaultSortable: true,
        cell: ({ status, memberStatus, lastActivityDate }) =>
          memberStatus === 'actif' || memberStatus === 'inactif' ? (
            <UserPublicActivityStatusBadge
              status={getUserPublicActivityStatus({ lastActivityDate })}
              size="sm"
            />
          ) : (
            <Badge small noIcon severity={getSeverityFromStatus(memberStatus)}>
              {status}
            </Badge>
          ),
      },
      ...(coordinateurView
        ? [
            {
              name: 'action',
              header: '',
              cell: ({
                id,
                firstName,
                lastName,
                email,
                memberStatus,
                coordinateurId,
                sentAt,
                archivedFrom,
                archivedTo,
              }: MediateurListProps) => (
                <>
                  {memberStatus === 'invitation' && (
                    <Invitation
                      email={email}
                      coordinateurId={coordinateurId}
                      sentAt={sentAt}
                    />
                  )}
                  {(memberStatus === 'actif' || memberStatus === 'inactif') &&
                    id && (
                      <RetirerDeMonEquipe
                        mediateurId={id}
                        displayName={`${firstName} ${lastName}`}
                      />
                    )}
                  {(memberStatus === 'autre' || memberStatus === 'supprime') &&
                    id &&
                    archivedTo && (
                      <SupprimerDefinitivement
                        mediateurId={id}
                        coordinateurId={coordinateurId}
                        displayName={`${firstName} ${lastName}`}
                        archivedFrom={archivedFrom}
                        archivedTo={archivedTo}
                      />
                    )}
                </>
              ),
            },
          ]
        : []),
    ],
  }) satisfies EquipeDataTableConfiguration
