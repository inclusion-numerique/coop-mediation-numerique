import {
  coordinateurDe,
  type Jalon,
  type LigneUtilisateur,
  mediateurDe,
} from '@app/web/features/utilisateurs/domain'
import { libelleDuStatut } from '@app/web/features/utilisateurs/ui'

type Cellule = string | number | null

type Colonne = {
  readonly entete: string
  readonly valeur: (ligne: LigneUtilisateur) => Cellule
}

const iso = (jalon: Jalon): Cellule =>
  jalon._tag === 'Le' ? jalon.date.toISOString() : null

const ouiNon = (vrai: boolean): string => (vrai ? 'Oui' : 'Non')

export const colonnesDeLExport: readonly Colonne[] = [
  { entete: 'ID utilisateur', valeur: ({ id }) => id },
  { entete: 'Statut', valeur: ({ statut }) => libelleDuStatut(statut) },
  { entete: 'Créé', valeur: ({ creeLe }) => creeLe.toISOString() },
  {
    entete: 'Dernière connexion',
    valeur: ({ derniereConnexion }) => iso(derniereConnexion),
  },
  {
    entete: 'Dernière visite',
    valeur: ({ derniereVisite }) => iso(derniereVisite),
  },
  {
    entete: 'Dernière complétion d’un CRA',
    valeur: ({ rattachements }) => {
      const mediateur = mediateurDe(rattachements)
      return mediateur === null ? null : iso(mediateur.derniereActivite)
    },
  },
  {
    entete: 'Dernier ajout de bénéficiaire',
    valeur: ({ rattachements }) => {
      const mediateur = mediateurDe(rattachements)
      return mediateur === null ? null : iso(mediateur.dernierBeneficiaire)
    },
  },
  { entete: 'Prénom', valeur: ({ prenom }) => prenom },
  { entete: 'Nom', valeur: ({ nom }) => nom },
  { entete: 'Email', valeur: ({ courriel }) => courriel },
  {
    entete: 'Accompagnements',
    valeur: ({ rattachements }) =>
      mediateurDe(rattachements)?.accompagnements ?? null,
  },
  {
    entete: 'Lieux d’activité',
    valeur: ({ rattachements }) =>
      mediateurDe(rattachements)?.lieuxActivite ?? null,
  },
  {
    entete: 'Bénéficiaires',
    valeur: ({ rattachements }) =>
      mediateurDe(rattachements)?.beneficiaires ?? null,
  },
  {
    entete: 'Médiateurs coordonnés',
    valeur: ({ rattachements }) =>
      coordinateurDe(rattachements)?.mediateursCoordonnes ?? null,
  },
  { entete: 'Rôle', valeur: ({ role }) => role },
  {
    entete: 'Médiateur',
    valeur: ({ rattachements }) => ouiNon(mediateurDe(rattachements) !== null),
  },
  {
    entete: 'Coordinateur',
    valeur: ({ rattachements }) =>
      ouiNon(coordinateurDe(rattachements) !== null),
  },
  {
    entete: 'Dispositif',
    valeur: ({ dispositif }) =>
      dispositif === 'ConseillerNumerique' ? 'Conseiller numérique' : '',
  },
  {
    entete: 'Département',
    valeur: ({ employeuse }) => employeuse?.codeInsee?.slice(0, 2) ?? null,
  },
  {
    entete: 'Structure employeuse',
    valeur: ({ employeuse }) => employeuse?.nom ?? null,
  },
]
