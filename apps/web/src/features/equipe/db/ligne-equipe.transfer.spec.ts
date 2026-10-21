import type { LigneEquipeRow } from './ligne-equipe.sql'
import { toLigneEquipe } from './ligne-equipe.transfer'

const depuis = new Date('2026-01-01T09:00:00Z')

const invitationSansCompte: LigneEquipeRow = {
  statut: 'Invitation',
  email: 'invite@example.com',
  mediateur_id: null,
  user_id: null,
  first_name: null,
  last_name: null,
  name: null,
  phone: null,
  is_conseiller_numerique: false,
  depuis,
  archivee_le: null,
  supprime_le: null,
  derniere_activite: null,
  structure_employeuse: null,
  structure_employeuse_adresse: '',
  structure_employeuse_commune: null,
  structure_employeuse_code_postal: null,
  structure_employeuse_code_insee: null,
}

const ancienMembreComplet: LigneEquipeRow = {
  statut: 'AncienMembre',
  email: 'ancien@example.com',
  mediateur_id: '550e8400-e29b-41d4-a716-446655440051',
  user_id: '550e8400-e29b-41d4-a716-446655440052',
  first_name: 'Camille',
  last_name: 'Martin',
  name: 'Camille Martin',
  phone: '+33102030405',
  is_conseiller_numerique: true,
  depuis,
  archivee_le: new Date('2026-05-01T09:00:00Z'),
  supprime_le: null,
  derniere_activite: new Date('2026-04-01T09:00:00Z'),
  structure_employeuse: 'Médiathèque',
  structure_employeuse_adresse: '1 rue de la Paix',
  structure_employeuse_commune: 'Lyon',
  structure_employeuse_code_postal: '69001',
  structure_employeuse_code_insee: '69381',
}

describe('lecture d’une ligne de l’équipe', () => {
  it('une invitation sans compte, sans structure connue', () => {
    expect(toLigneEquipe(invitationSansCompte)).toEqual({
      email: 'invite@example.com',
      statut: { type: 'Invitation', envoyeeLe: depuis },
      personne: { type: 'SansCompte' },
      structureEmployeuse: { type: 'Inconnue' },
    })
  })

  it('un ancien membre au profil complet', () => {
    expect(toLigneEquipe(ancienMembreComplet)).toEqual({
      email: 'ancien@example.com',
      statut: {
        type: 'AncienMembre',
        depuis,
        jusquA: new Date('2026-05-01T09:00:00Z'),
      },
      personne: {
        type: 'Inscrite',
        mediateurId: '550e8400-e29b-41d4-a716-446655440051',
        profil: {
          utilisateurId: '550e8400-e29b-41d4-a716-446655440052',
          prenom: 'Camille',
          nom: 'Martin',
          telephone: '+33102030405',
          role: 'ConseillerNumerique',
        },
      },
      structureEmployeuse: {
        type: 'Connue',
        nom: 'Médiathèque',
        adresse: '1 rue de la Paix',
        commune: 'Lyon',
        codePostal: '69001',
        codeInsee: '69381',
      },
    })
  })

  it('un membre inactif qui n’a jamais saisi d’activité', () => {
    expect(
      toLigneEquipe({
        ...ancienMembreComplet,
        statut: 'Inactif',
        derniere_activite: null,
      })?.statut,
    ).toEqual({ type: 'Inactif', derniereActivite: { type: 'Aucune' } })
  })

  it('ramène le téléphone au format E.164', () => {
    const ligne = toLigneEquipe({
      ...ancienMembreComplet,
      phone: '01 02 03 04 05',
    })

    expect(
      ligne?.personne.type === 'Inscrite' && ligne.personne.profil.telephone,
    ).toBe('+33102030405')
  })

  it('tient pour absents un téléphone inexploitable et un nom vide', () => {
    const ligne = toLigneEquipe({
      ...ancienMembreComplet,
      phone: 'inconnu',
      first_name: '  ',
    })

    expect(
      ligne?.personne.type === 'Inscrite' && ligne.personne.profil,
    ).toMatchObject({ prenom: null, telephone: null })
  })

  it('écarte une ligne dont l’email est inexploitable', () => {
    expect(
      toLigneEquipe({ ...invitationSansCompte, email: 'pas-un-email' }),
    ).toBeNull()
  })

  it('écarte un statut inconnu', () => {
    expect(
      toLigneEquipe({ ...invitationSansCompte, statut: 'Autre' }),
    ).toBeNull()
  })
})
