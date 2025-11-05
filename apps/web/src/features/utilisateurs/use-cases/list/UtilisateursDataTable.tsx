import CopyToClipboardButton from '@app/web/libs/clipboard/CopyToClipboardButton'
import type {
  DataTableConfiguration,
  DataTableFilterValues,
  DataTableSearchParams,
} from '@app/web/libs/data-table/DataTableConfiguration'
import { dateAsDayAndTime } from '@app/web/utils/dateAsDayAndTime'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { optionalNumberToString } from '@app/web/utils/formatNumber'
import { booleanToYesNo } from '@app/web/utils/yesNoBooleanOptions'
import Tag from '@codegouvfr/react-dsfr/Tag'
import type { Prisma } from '@prisma/client'
import { getUserAccountStatus } from './getUserAccountStatus'
import { getUserAccountStatusBadge } from './getUserAccountStatusBadge'
import { getUserLifecycle } from './getUserLifecycle'
import { getUserLifecycleBadge } from './getUserLifecycleBadge'
import { UtilisateurForList } from './queryUtilisateursForList'

export type UtilisateursDataTableConfiguration = DataTableConfiguration<
  UtilisateurForList,
  Prisma.UserWhereInput,
  Prisma.UserOrderByWithRelationInput
>

export const UtilisateursDataTable = {
  csvFilename: () => `coop-${dateAsIsoDay(new Date())}-utilisateurs`,
  rowKey: ({ id }) => id,
  rowLink: ({ id }) => ({ href: `/administration/utilisateurs/${id}` }),
  columns: [
    {
      name: 'statut',
      header: 'Statut',
      csvHeaders: ['Statut'],
      csvValues: (user) => [getUserLifecycle(user)],
      cell: (user) => getUserLifecycleBadge(user),
    },
    {
      name: 'statut-compte',
      header: 'Statut compte',
      csvHeaders: ['Statut compte'],
      csvValues: (user) => [getUserAccountStatus(user)],
      cell: (user) => getUserAccountStatusBadge(user),
    },
    {
      name: 'creation',
      header: 'Créé',
      csvHeaders: ['Créé'],
      defaultSortable: true,
      defaultSortableDirection: 'desc',
      csvValues: ({ created }) => [created.toISOString()],
      cell: ({ created }) => dateAsDayAndTime(created),
      orderBy: (direction) => [
        {
          created: direction,
        },
      ],
    },
    {
      name: 'lastLogin',
      header: 'Dernière connexion',
      csvHeaders: ['Dernière connexion'],
      defaultSortable: true,
      defaultSortableDirection: 'desc',
      csvValues: ({ lastLogin }) => [lastLogin?.toISOString()],
      cell: ({ lastLogin }) => dateAsDayAndTime(lastLogin),
      orderBy: (direction) => [
        {
          lastLogin: direction,
        },
      ],
    },
    {
      name: 'lastCra',
      csvHeaders: ['Dernière complétion d’un CRA'],
      csvValues: ({ mediateur }) => [
        mediateur?.activites.at(0)?.creation.toISOString(),
      ],
    },
    {
      name: 'lastBeneficiaire',
      csvHeaders: ['Dernier ajout de bénéficiaire'],
      csvValues: ({ mediateur }) => [
        mediateur?.beneficiaires.at(0)?.creation.toISOString(),
      ],
    },
    {
      name: 'nom',
      header: 'Nom',
      cell: ({ name }) => name,
      orderBy: (direction) => [{ name: direction }],
    },
    {
      name: 'prenom',
      csvHeaders: ['Prénom'],
      csvValues: ({ firstName }) => [firstName],
    },
    {
      name: 'nom',
      csvHeaders: ['Nom'],
      csvValues: ({ lastName }) => [lastName],
    },
    {
      name: 'email',
      header: 'Email',
      csvHeaders: ['Email'],
      csvValues: ({ email }) => [email],
      cell: ({ email }) => (
        <div className="fr-position-relative fr-pl-11v">
          {email}
          <CopyToClipboardButton
            size="small"
            value={email}
            style={{ zIndex: 10, position: 'absolute', left: 0 }}
          />
        </div>
      ),
      orderBy: (direction) => [
        {
          email: direction,
        },
      ],
    },
    {
      name: 'accompagnements',
      header: 'Accompagnements',
      csvHeaders: ['Accompagnements'],
      csvValues: ({ mediateur }) => [mediateur?.accompagnementsCount],
      cell: ({ mediateur }) =>
        optionalNumberToString(mediateur?.accompagnementsCount, null),
      orderBy: (direction) => [
        {
          mediateur: {
            accompagnementsCount: direction,
          },
        },
      ],
    },
    {
      name: 'lieux-activite',
      header: 'Lieux d’activité',
      csvHeaders: ['Lieux d’activité'],
      csvValues: ({ mediateur }) => [mediateur?._count.enActivite],
      cell: ({ mediateur }) =>
        optionalNumberToString(mediateur?._count.enActivite, null),
      orderBy: (direction) => [
        {
          mediateur: {
            enActivite: { _count: direction },
          },
        },
      ],
    },
    {
      name: 'beneficiaires',
      header: 'Bénéficiaires suivis',
      csvHeaders: ['Bénéficiaires'],
      csvValues: ({ mediateur }) => [mediateur?.beneficiairesCount],
      cell: ({ mediateur }) =>
        optionalNumberToString(mediateur?.beneficiairesCount, null),
      orderBy: (direction) => [
        {
          mediateur: {
            beneficiairesCount: direction,
          },
        },
      ],
    },
    {
      name: 'mediateursCoordonnes',
      csvHeaders: ['Médiateurs coordonnés'],
      csvValues: ({ coordinateur }) => [
        coordinateur?._count.mediateursCoordonnes,
      ],
    },
    {
      name: 'roles',
      header: 'Rôles',
      csvHeaders: ['Rôle', 'Médiateur', 'Conseiller numérique', 'Coordinateur'],
      csvValues: ({ role, mediateur, coordinateur }) => [
        role,
        booleanToYesNo(!!mediateur),
        booleanToYesNo(!!mediateur?.conseillerNumerique),
        booleanToYesNo(!!coordinateur),
      ],
      cell: ({ role, mediateur, coordinateur }) => (
        <div className="fr-flex fr-flex-gap-2v">
          {role === 'Admin' && <Tag small>Administrateur</Tag>}
          {role === 'Support' && <Tag small>Support</Tag>}
          {!!mediateur && <Tag small>Médiateur</Tag>}
          {!!mediateur?.conseillerNumerique && (
            <Tag small>Conseiller numérique</Tag>
          )}
          {!!coordinateur && <Tag small>Coordinateur</Tag>}
        </div>
      ),
    },
    {
      name: 'departement',
      header: 'Département',
      csvHeaders: ['Département'],
      csvValues: ({ emplois }) => [
        emplois[0]?.structure?.codeInsee?.slice(0, 2),
      ],
      cell: ({ emplois }) => emplois[0]?.structure?.codeInsee?.slice(0, 2),
    },
    {
      name: 'structure-employeuse',
      header: 'Structure employeuse',
      csvHeaders: ['Structure employeuse'],
      csvValues: ({ emplois }) => [emplois?.[0]?.structure?.nom],
      cell: ({ emplois }) => emplois?.[0]?.structure?.nom,
    },
  ],
} satisfies UtilisateursDataTableConfiguration

export type UtilisateursDataTableSearchParams =
  DataTableSearchParams<UtilisateursDataTableConfiguration>

export type UtilisateursDataTableFilterValues =
  DataTableFilterValues<UtilisateursDataTableConfiguration>
