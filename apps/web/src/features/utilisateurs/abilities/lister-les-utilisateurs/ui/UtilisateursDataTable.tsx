import {
  coordinateurDe,
  type Jalon,
  type LigneUtilisateur,
  mediateurDe,
} from '@app/web/features/utilisateurs/domain'
import { BadgeStatutCompte } from '@app/web/features/utilisateurs/ui'
import CopyToClipboardButton from '@app/web/libs/clipboard/CopyToClipboardButton'
import type {
  DataTableColumn,
  DataTableConfiguration,
  DataTableSearchParams,
} from '@app/web/libs/data-table/DataTableConfiguration'
import {
  dateAsDayAndTime,
  dateAsDayAndTimeInTimeZone,
} from '@app/web/utils/dateAsDayAndTime'
import { optionalNumberToString } from '@app/web/utils/formatNumber'
import Tag from '@codegouvfr/react-dsfr/Tag'

export type ColonneTriable =
  | 'creation'
  | 'derniereConnexion'
  | 'derniereVisite'
  | 'nom'
  | 'courriel'
  | 'accompagnements'
  | 'lieuxActivite'
  | 'beneficiaires'

type ColonneDeLaListe = DataTableColumn<LigneUtilisateur> &
  (
    | { name: ColonneTriable; sortable: true }
    | { name: ColonneTriable; defaultSortable: true }
    | { sortable?: undefined; defaultSortable?: undefined }
  )

const dateAParis = (jalon: Jalon): string =>
  jalon._tag === 'Le'
    ? dateAsDayAndTimeInTimeZone(jalon.date, 'Europe/Paris')
    : '-'

const compteurDuMediateur =
  (compteur: 'accompagnements' | 'beneficiaires' | 'lieuxActivite') =>
  ({ rattachements }: LigneUtilisateur) =>
    optionalNumberToString(mediateurDe(rattachements)?.[compteur], null)

const Roles = ({ role, rattachements }: LigneUtilisateur) => (
  <div className="fr-flex fr-flex-gap-2v">
    {role === 'Admin' && <Tag small>Administrateur</Tag>}
    {role === 'Support' && <Tag small>Support</Tag>}
    {mediateurDe(rattachements) !== null && <Tag small>Médiateur</Tag>}
    {coordinateurDe(rattachements) !== null && <Tag small>Coordinateur</Tag>}
  </div>
)

const Courriel = ({ courriel }: LigneUtilisateur) => (
  <div className="fr-position-relative fr-pl-11v">
    {courriel}
    <CopyToClipboardButton
      size="small"
      value={courriel}
      style={{ zIndex: 10, position: 'absolute', left: 0 }}
    />
  </div>
)

export const UtilisateursDataTable = {
  rowKey: ({ id }) => id,
  rowLink: ({ id }) => ({ href: `/administration/utilisateurs/${id}` }),
  columns: [
    {
      name: 'statut',
      header: 'Statut',
      cell: ({ statut }) => <BadgeStatutCompte statut={statut} />,
    },
    {
      name: 'creation',
      header: 'Créé',
      defaultSortable: true,
      defaultSortableDirection: 'desc',
      cell: ({ creeLe }) => dateAsDayAndTime(creeLe),
    },
    {
      name: 'derniereConnexion',
      header: 'Dernière connexion',
      sortable: true,
      cell: ({ derniereConnexion }) => dateAParis(derniereConnexion),
    },
    {
      name: 'derniereVisite',
      header: 'Dernière visite',
      sortable: true,
      cell: ({ derniereVisite }) => dateAParis(derniereVisite),
    },
    {
      name: 'nom',
      header: 'Nom',
      sortable: true,
      cell: ({ nomComplet }) => nomComplet,
    },
    {
      name: 'courriel',
      header: 'Email',
      sortable: true,
      cell: (ligne) => <Courriel {...ligne} />,
    },
    {
      name: 'accompagnements',
      header: 'Accompagnements',
      sortable: true,
      cell: compteurDuMediateur('accompagnements'),
    },
    {
      name: 'lieuxActivite',
      header: 'Lieux d’activité',
      sortable: true,
      cell: compteurDuMediateur('lieuxActivite'),
    },
    {
      name: 'beneficiaires',
      header: 'Bénéficiaires suivis',
      sortable: true,
      cell: compteurDuMediateur('beneficiaires'),
    },
    {
      name: 'roles',
      header: 'Rôles',
      cell: (ligne) => <Roles {...ligne} />,
    },
    {
      name: 'dispositif',
      header: 'Dispositif',
      cell: ({ dispositif }) =>
        dispositif === 'ConseillerNumerique' ? (
          <Tag small>Conseiller numérique</Tag>
        ) : (
          ''
        ),
    },
    {
      name: 'departement',
      header: 'Département',
      cell: ({ employeuse }) => employeuse?.codeInsee?.slice(0, 2),
    },
    {
      name: 'structureEmployeuse',
      header: 'Structure employeuse',
      cell: ({ employeuse }) => employeuse?.nom,
    },
  ],
} satisfies DataTableConfiguration<LigneUtilisateur> & {
  columns: ColonneDeLaListe[]
}

export type UtilisateursDataTableSearchParams = DataTableSearchParams<
  DataTableConfiguration<LigneUtilisateur>
>
