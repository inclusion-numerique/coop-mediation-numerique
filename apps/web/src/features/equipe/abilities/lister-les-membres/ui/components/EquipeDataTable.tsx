import type { DataTableConfiguration } from '@app/web/libs/data-table/DataTableConfiguration'
import Badge from '@codegouvfr/react-dsfr/Badge'
import type { ReactNode } from 'react'
import type { LigneEquipe } from '../../../../domain'
import type { LigneAffichee } from '../lister-les-membres.presenter'
import { BadgeActivite } from './BadgeActivite'

const Icone = ({ icone }: Pick<LigneAffichee, 'icone'>) => {
  if (icone === 'invitation')
    return (
      <span
        className="ri-mail-line ri-xl fr-text-label--blue-france"
        aria-hidden
      />
    )
  if (icone === 'conseiller-numerique')
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
  return (
    <span
      className="ri-account-circle-line ri-xl fr-text-label--blue-france"
      aria-hidden
    />
  )
}

const Membre = ({ nomComplet, role }: LigneAffichee) =>
  nomComplet === null ? (
    <div className="fr-mt-2v fr-mb-3v">
      <b>{role}</b>
    </div>
  ) : (
    <>
      <div className="fr-text--bold fr-whitespace-normal">{nomComplet}</div>
      <div className="fr-text--xs fr-text-mention--grey fr-mb-0">{role}</div>
    </>
  )

const Email = ({ email }: Pick<LigneAffichee, 'email'>) =>
  email === null ? (
    '/'
  ) : (
    <span className="fr-position-relative fr-index-10" title={email}>
      {email.length > 30 ? `${email.slice(0, 30)}…` : email}
    </span>
  )

const Statut = ({ activite, libelleStatut, severite }: LigneAffichee) =>
  activite === null ? (
    <Badge small noIcon severity={severite === 'neutre' ? undefined : severite}>
      {libelleStatut}
    </Badge>
  ) : (
    <BadgeActivite activite={activite} libelle={libelleStatut} />
  )

export const EquipeDataTable = (
  actions: ((ligne: LigneEquipe) => ReactNode) | null,
) =>
  ({
    rowKey: ({ cle }) => cle,
    rowLink: ({ lienProfil }) =>
      lienProfil === null ? undefined : { href: lienProfil },
    columns: [
      { name: 'role', header: '', cell: (ligne) => <Icone {...ligne} /> },
      {
        name: 'membre',
        header: 'Membre',
        sortable: true,
        cellStyle: { maxWidth: 300 },
        cell: (ligne) => <Membre {...ligne} />,
      },
      {
        name: 'email',
        header: 'Adresse email',
        cellClassName: 'fr-whitespace-normal',
        cellStyle: { maxWidth: 300 },
        cell: (ligne) => <Email {...ligne} />,
      },
      {
        name: 'structureEmployeuse',
        header: 'Structure employeuse',
        sortable: true,
        cellClassName: 'fr-whitespace-normal',
        cellStyle: { maxWidth: 300 },
        cell: ({ structureEmployeuse }) => structureEmployeuse,
      },
      {
        name: 'statut',
        header: 'Statut',
        sortable: true,
        defaultSortable: true,
        cell: (ligne) => <Statut {...ligne} />,
      },
      ...(actions === null
        ? []
        : [
            {
              name: 'action',
              header: '',
              cell: ({ ligne }: LigneAffichee) => actions(ligne),
            },
          ]),
    ],
  }) satisfies DataTableConfiguration<LigneAffichee>
