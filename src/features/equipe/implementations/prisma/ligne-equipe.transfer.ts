import { CodePostal } from '@/libraries/code-postal'
import { CodeInsee } from '@/libraries/insee'
import { Telephone } from '@/libraries/telephone'
import {
  type AdresseStructure,
  Commune,
  Courriel,
  type LigneEquipe,
  MediateurId,
  Nom,
  NomStructure,
  type PersonneDeLEquipe,
  Prenom,
  roleMembre,
  type StatutMembre,
  type StructureEmployeuseMembre,
  TypeDeStatut,
  UtilisateurId,
  Voie,
} from '../../domain'
import type { LigneEquipeRow } from './ligne-equipe.sql'
import { facultative, lue } from './lue.transfer'

const statuts: Readonly<
  Record<StatutMembre['type'], (row: LigneEquipeRow) => StatutMembre>
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

const toPersonne = (row: LigneEquipeRow): PersonneDeLEquipe =>
  row.user_id === null || row.mediateur_id === null
    ? { type: 'SansCompte' }
    : {
        type: 'Inscrite',
        mediateurId: MediateurId(row.mediateur_id),
        profil: {
          utilisateurId: UtilisateurId(row.user_id),
          prenom: facultative(Prenom, row.first_name),
          nom: facultative(Nom, row.last_name),
          telephone: facultative(Telephone, row.phone),
          role: roleMembre(row.is_conseiller_numerique === true),
        },
      }

const toAdresse = (row: LigneEquipeRow): AdresseStructure => {
  const commune = lue(Commune, row.structure_employeuse_commune)
  const codePostal = lue(CodePostal, row.structure_employeuse_code_postal)
  const codeInsee = lue(CodeInsee, row.structure_employeuse_code_insee)
  return commune === null || codePostal === null || codeInsee === null
    ? { type: 'Inconnue' }
    : {
        type: 'Connue',
        voie: lue(Voie, row.structure_employeuse_adresse),
        commune,
        codePostal,
        codeInsee,
      }
}

const toStructureEmployeuse = (
  row: LigneEquipeRow,
): StructureEmployeuseMembre => {
  const nom = lue(NomStructure, row.structure_employeuse)
  const adresse = toAdresse(row)
  return nom === null && adresse.type === 'Inconnue'
    ? { type: 'Inconnue' }
    : { type: 'Connue', nom, adresse }
}

const toStatut = (row: LigneEquipeRow): StatutMembre => {
  const type: StatutMembre['type'] = TypeDeStatut(row.statut)
  return statuts[type](row)
}

export const toLigneEquipe = (row: LigneEquipeRow): LigneEquipe => ({
  email: Courriel(row.email),
  statut: toStatut(row),
  personne: toPersonne(row),
  structureEmployeuse: toStructureEmployeuse(row),
})
