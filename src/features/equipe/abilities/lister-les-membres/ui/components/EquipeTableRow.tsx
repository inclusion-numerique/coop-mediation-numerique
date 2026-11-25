import Badge from '@codegouvfr/react-dsfr/Badge'
import classNames from 'classnames'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { LigneEquipe } from '../../../../domain'
import type { LigneAffichee } from '../presenters/lister-les-membres.presenter'
import { BadgeActivite } from './BadgeActivite'

const largeurMaximale = { maxWidth: 300 }

const Icone = ({ icone }: Pick<LigneAffichee, 'icone'>) => {
  if (icone === 'invitation')
    return (
      <span className="ri-mail-line fr-text-label--blue-france" aria-hidden />
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
      className="ri-account-circle-line fr-text-label--blue-france"
      aria-hidden
    />
  )
}

const Membre = ({
  nomComplet,
  role,
}: Pick<LigneAffichee, 'nomComplet' | 'role'>) =>
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

const Statut = ({
  activite,
  libelleStatut,
  severite,
}: Pick<LigneAffichee, 'activite' | 'libelleStatut' | 'severite'>) =>
  activite === null ? (
    <Badge
      small
      noIcon
      {...(severite === 'neutre' ? {} : { severity: severite })}
    >
      {libelleStatut}
    </Badge>
  ) : (
    <BadgeActivite activite={activite} libelle={libelleStatut} />
  )

const LienVersLeProfil = ({
  lienProfil,
  nomComplet,
  email,
}: Pick<LigneAffichee, 'lienProfil' | 'nomComplet' | 'email'>) =>
  lienProfil === null ? null : (
    <Link href={lienProfil}>
      <span className="fr-sr-only">
        Voir le profil de {nomComplet ?? email}
      </span>
    </Link>
  )

export const EquipeTableRow = ({
  ligne,
  actions,
}: {
  ligne: LigneAffichee
  actions: ((ligne: LigneEquipe) => ReactNode) | null
}) => (
  <tr
    className={classNames(
      ligne.lienProfil !== null && 'fr-enlarge-link fr-table-row--link',
    )}
  >
    <td className="fr-cell--data">
      <Icone icone={ligne.icone} />
    </td>
    <td className="fr-cell--data" style={largeurMaximale}>
      <Membre nomComplet={ligne.nomComplet} role={ligne.role} />
    </td>
    <td className="fr-cell--data fr-whitespace-normal" style={largeurMaximale}>
      <Email email={ligne.email} />
    </td>
    <td className="fr-cell--data fr-whitespace-normal" style={largeurMaximale}>
      {ligne.structureEmployeuse}
    </td>
    <td className="fr-cell--data">
      <Statut
        activite={ligne.activite}
        libelleStatut={ligne.libelleStatut}
        severite={ligne.severite}
      />
    </td>
    {actions !== null && (
      <td className="fr-cell--data">{actions(ligne.ligne)}</td>
    )}
    <td className="fr-p-0">
      <LienVersLeProfil
        lienProfil={ligne.lienProfil}
        nomComplet={ligne.nomComplet}
        email={ligne.email}
      />
    </td>
  </tr>
)
