import {
  Email,
  type LigneEquipe,
  MediateurId,
  Nom,
  type PersonneDeLEquipe,
  Prenom,
  roleMembre,
  type StatutMembre,
  type StructureEmployeuseMembre,
  Telephone,
  type TypeDeStatut,
  UtilisateurId,
} from '../domain'
import type { LigneEquipeRow } from './ligne-equipe.sql'
import { lue } from './lue'

const statuts: Readonly<
  Record<TypeDeStatut, (row: LigneEquipeRow) => StatutMembre>
> = {
  Invitation: ({ depuis }) => ({ type: 'Invitation', envoyeeLe: depuis }),
  Actif: ({ derniere_activite }) =>
    derniere_activite === null
      ? { type: 'Inactif', derniereActivite: { type: 'Aucune' } }
      : { type: 'Actif', derniereActivite: derniere_activite },
  Inactif: ({ derniere_activite }) => ({
    type: 'Inactif',
    derniereActivite:
      derniere_activite === null
        ? { type: 'Aucune' }
        : { type: 'Le', date: derniere_activite },
  }),
  AncienMembre: ({ depuis, archivee_le }) => ({
    type: 'AncienMembre',
    depuis,
    jusquA: archivee_le ?? depuis,
  }),
  ProfilSupprime: ({ depuis, supprime_le }) => ({
    type: 'ProfilSupprime',
    le: supprime_le ?? depuis,
  }),
}

const estUnStatut = (statut: string): statut is TypeDeStatut =>
  Object.hasOwn(statuts, statut)

const toPersonne = (row: LigneEquipeRow): PersonneDeLEquipe => {
  const utilisateurId =
    row.user_id === null ? null : UtilisateurId.safe(row.user_id)
  const mediateurId =
    row.mediateur_id === null ? null : MediateurId.safe(row.mediateur_id)
  return utilisateurId === null || mediateurId === null
    ? { type: 'SansCompte' }
    : {
        type: 'Inscrite',
        mediateurId,
        profil: {
          utilisateurId,
          prenom: lue(Prenom, row.first_name),
          nom: lue(Nom, row.last_name),
          telephone: lue(Telephone, row.phone),
          role: roleMembre(row.is_conseiller_numerique === true),
        },
      }
}

const renseigne = (valeur: string | null): string | null =>
  valeur === null || valeur.trim() === '' ? null : valeur

const toStructureEmployeuse = (
  row: LigneEquipeRow,
): StructureEmployeuseMembre => {
  const structure = {
    nom: renseigne(row.structure_employeuse),
    adresse: renseigne(row.structure_employeuse_adresse),
    commune: renseigne(row.structure_employeuse_commune),
    codePostal: renseigne(row.structure_employeuse_code_postal),
    codeInsee: renseigne(row.structure_employeuse_code_insee),
  }
  return Object.values(structure).every((valeur) => valeur === null)
    ? { type: 'Inconnue' }
    : { type: 'Connue', ...structure }
}

export const toLigneEquipe = (row: LigneEquipeRow): LigneEquipe | null => {
  const email = Email.safe(row.email)
  return email !== null && estUnStatut(row.statut)
    ? {
        email,
        statut: statuts[row.statut](row),
        personne: toPersonne(row),
        structureEmployeuse: toStructureEmployeuse(row),
      }
    : null
}

export const toLignesEquipe = (
  rows: readonly LigneEquipeRow[],
): readonly LigneEquipe[] =>
  rows.flatMap((row) => {
    const ligne = toLigneEquipe(row)
    return ligne === null ? [] : [ligne]
  })
