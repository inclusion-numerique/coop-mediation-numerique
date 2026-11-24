import Tag from '@codegouvfr/react-dsfr/Tag'
import type { ReactNode } from 'react'
import {
  coordinateurDe,
  type Jalon,
  type LigneUtilisateur,
  mediateurDe,
} from '@/features/utilisateurs/domain'
import { BadgeStatutCompte } from '@/features/utilisateurs/ui/components/BadgeStatutCompte'
import {
  dateAsDayAndTime,
  dateAsDayAndTimeInTimeZone,
} from '@/libraries/date/date-as-day-and-time'
import { optionalNumberToString } from '@/libraries/nombre/format-number'
import CopyToClipboardButton from '@/libraries/ui/components/CopyToClipboardButton'
import type { ColonneTriable } from '../../domain/index'

export type ColonneDesUtilisateurs = {
  readonly cle: string
  readonly libelle: string
  readonly tri?: ColonneTriable
  readonly cellule: (ligne: LigneUtilisateur) => ReactNode
}

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

export const colonnesDesUtilisateurs: readonly ColonneDesUtilisateurs[] = [
  {
    cle: 'statut',
    libelle: 'Statut',
    cellule: ({ statut }) => <BadgeStatutCompte statut={statut} />,
  },
  {
    cle: 'creation',
    libelle: 'Créé',
    tri: 'creation',
    cellule: ({ creeLe }) => dateAsDayAndTime(creeLe),
  },
  {
    cle: 'derniereConnexion',
    libelle: 'Dernière connexion',
    tri: 'derniereConnexion',
    cellule: ({ derniereConnexion }) => dateAParis(derniereConnexion),
  },
  {
    cle: 'derniereVisite',
    libelle: 'Dernière visite',
    tri: 'derniereVisite',
    cellule: ({ derniereVisite }) => dateAParis(derniereVisite),
  },
  {
    cle: 'nom',
    libelle: 'Nom',
    tri: 'nom',
    cellule: ({ nomAffiche }) => nomAffiche,
  },
  {
    cle: 'courriel',
    libelle: 'Email',
    tri: 'courriel',
    cellule: (ligne) => <Courriel {...ligne} />,
  },
  {
    cle: 'accompagnements',
    libelle: 'Accompagnements',
    tri: 'accompagnements',
    cellule: compteurDuMediateur('accompagnements'),
  },
  {
    cle: 'lieuxActivite',
    libelle: 'Lieux d’activité',
    tri: 'lieuxActivite',
    cellule: compteurDuMediateur('lieuxActivite'),
  },
  {
    cle: 'beneficiaires',
    libelle: 'Bénéficiaires suivis',
    tri: 'beneficiaires',
    cellule: compteurDuMediateur('beneficiaires'),
  },
  {
    cle: 'roles',
    libelle: 'Rôles',
    cellule: (ligne) => <Roles {...ligne} />,
  },
  {
    cle: 'dispositif',
    libelle: 'Dispositif',
    cellule: ({ dispositif }) =>
      dispositif === 'ConseillerNumerique' ? (
        <Tag small>Conseiller numérique</Tag>
      ) : (
        ''
      ),
  },
  {
    cle: 'departement',
    libelle: 'Département',
    cellule: ({ employeuse }) => employeuse?.codeInsee?.slice(0, 2),
  },
  {
    cle: 'structureEmployeuse',
    libelle: 'Structure employeuse',
    cellule: ({ employeuse }) => employeuse?.nom,
  },
]
