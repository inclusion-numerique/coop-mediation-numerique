import type {
  DataTableConfiguration,
  DataTableFilterValues,
  DataTableSearchParams,
} from '@app/web/libs/data-table/DataTableConfiguration'
import { dateAsDayAndTime } from '@app/web/utils/dateAsDayAndTime'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { optionalNumberToString } from '@app/web/utils/formatNumber'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Tag from '@codegouvfr/react-dsfr/Tag'
import type { Prisma } from '@prisma/client'
import { StructureForList } from './queryStructuresForList'

export type StructuresDataTableConfiguration = DataTableConfiguration<
  StructureForList,
  Prisma.StructureWhereInput,
  Prisma.StructureOrderByWithRelationInput
>

export const StructuresDataTable = {
  csvFilename: () => `coop-${dateAsIsoDay(new Date())}-structures`,
  rowKey: ({ id }) => id,
  rowLink: ({ id }) => ({ href: `/administration/structures/${id}/modifier` }),
  columns: [
    {
      name: 'nom',
      header: 'Nom',
      csvHeaders: ['Nom'],
      csvValues: ({ nom }) => [nom],
      cell: ({ nom }) => nom,
      defaultSortable: true,
      defaultSortableDirection: 'asc',
      orderBy: (direction) => [{ nom: direction }],
    },
    {
      name: 'type',
      header: 'Type',
      csvHeaders: ["Lieu d'activité", 'Structure employeuse'],
      csvValues: ({ _count }) => [
        _count.mediateursEnActivite > 0 ? 'Oui' : 'Non',
        _count.emplois > 0 ? 'Oui' : 'Non',
      ],
      cell: ({ _count }) => (
        <div className="fr-flex fr-flex-gap-2v">
          {_count.mediateursEnActivite > 0 && <Tag small>Lieu d'activité</Tag>}
          {_count.emplois > 0 && <Tag small>Employeuse</Tag>}
        </div>
      ),
    },
    {
      name: 'adresse',
      header: 'Adresse',
      csvHeaders: ['Adresse', 'Code postal', 'Commune'],
      csvValues: ({ adresse, codePostal, commune }) => [
        adresse,
        codePostal,
        commune,
      ],
      cell: ({ adresse, codePostal, commune }) => (
        <div>
          <div className="fr-text--sm fr-mb-0">{adresse}</div>
          <div className="fr-text--xs fr-text-mention--grey fr-mb-0">
            {codePostal} {commune}
          </div>
        </div>
      ),
    },
    {
      name: 'siret',
      header: 'SIRET',
      csvHeaders: ['SIRET'],
      csvValues: ({ siret }) => [siret],
      cell: ({ siret }) => siret,
    },
    {
      name: 'typologies',
      header: 'Typologies',
      csvHeaders: ['Typologies'],
      csvValues: ({ typologies }) => [typologies.join(', ')],
      cell: ({ typologies }) =>
        typologies.length > 0 ? typologies.join(', ') : null,
    },
    {
      name: 'visibleCarto',
      header: 'Visible carto',
      csvHeaders: ['Visible carto'],
      csvValues: ({ visiblePourCartographieNationale }) => [
        visiblePourCartographieNationale ? 'Oui' : 'Non',
      ],
      cell: ({ visiblePourCartographieNationale }) =>
        visiblePourCartographieNationale ? (
          <Badge small severity="success">
            Oui
          </Badge>
        ) : (
          <Badge small severity="warning">
            Non
          </Badge>
        ),
    },
    {
      name: 'creation',
      header: 'Cr\u00e9ation',
      csvHeaders: ['Cr\u00e9ation'],
      defaultSortable: true,
      defaultSortableDirection: 'desc',
      csvValues: ({ creation }) => [creation.toISOString()],
      cell: ({ creation }) => dateAsDayAndTime(creation),
      orderBy: (direction) => [{ creation: direction }],
    },
    {
      name: 'modification',
      header: 'Modification',
      csvHeaders: ['Modification'],
      defaultSortable: true,
      defaultSortableDirection: 'desc',
      csvValues: ({ modification }) => [modification.toISOString()],
      cell: ({ modification }) => dateAsDayAndTime(modification),
      orderBy: (direction) => [{ modification: direction }],
    },
    {
      name: 'employes',
      header: 'Employ\u00e9s',
      csvHeaders: ['Employ\u00e9s'],
      csvValues: ({ _count }) => [_count.emplois],
      cell: ({ _count }) => optionalNumberToString(_count.emplois, null),
      orderBy: (direction) => [{ emplois: { _count: direction } }],
    },
    {
      name: 'mediateursEnActivite',
      header: 'M\u00e9diateurs en activit\u00e9',
      csvHeaders: ['M\u00e9diateurs en activit\u00e9'],
      csvValues: ({ _count }) => [_count.mediateursEnActivite],
      cell: ({ _count }) =>
        optionalNumberToString(_count.mediateursEnActivite, null),
      orderBy: (direction) => [{ mediateursEnActivite: { _count: direction } }],
    },
  ],
} satisfies StructuresDataTableConfiguration

export type StructuresDataTableSearchParams =
  DataTableSearchParams<StructuresDataTableConfiguration>

export type StructuresDataTableFilterValues =
  DataTableFilterValues<StructuresDataTableConfiguration>
