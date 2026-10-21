import {
  CodeInsee,
  CodePostal,
  Commune,
  Email,
  MediateurId,
  Nom,
  NomStructure,
  Prenom,
  RoleMembre,
  Telephone,
  UtilisateurId,
} from '../../../../domain'
import { membreExporte } from './membre-exporte'

const depuis = new Date('2026-01-01T09:00:00Z')

describe('membre exporté', () => {
  it('une invitation sans compte n’a ni nom ni structure', () => {
    expect(
      membreExporte(
        {
          email: Email('invite@example.com'),
          statut: { type: 'Invitation', envoyeeLe: depuis },
          personne: { type: 'SansCompte' },
          structureEmployeuse: { type: 'Inconnue' },
        },
        null,
      ),
    ).toEqual({
      prenom: null,
      nom: null,
      role: 'Médiateur numérique',
      contrat: null,
      email: 'invite@example.com',
      telephone: null,
      structureEmployeuse: null,
      statut: 'Invitation envoyée le 01.01.2026',
    })
  })

  it('un conseiller numérique porte son rôle, son contrat et sa structure', () => {
    const contrat = { type: 'CDD', debut: depuis, fin: null }
    expect(
      membreExporte(
        {
          email: Email('camille@example.com'),
          statut: { type: 'Actif', derniereActivite: depuis },
          personne: {
            type: 'Inscrite',
            mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440081'),
            profil: {
              utilisateurId: UtilisateurId(
                '550e8400-e29b-41d4-a716-446655440082',
              ),
              prenom: Prenom('Camille'),
              nom: Nom('Martin'),
              telephone: Telephone('+33102030405'),
              role: RoleMembre('ConseillerNumerique'),
            },
          },
          structureEmployeuse: {
            type: 'Connue',
            nom: NomStructure('Médiathèque'),
            adresse: {
              type: 'Connue',
              voie: null,
              commune: Commune('Lyon'),
              codePostal: CodePostal('69001'),
              codeInsee: CodeInsee('69381'),
            },
          },
        },
        contrat,
      ),
    ).toEqual(
      expect.objectContaining({
        prenom: 'Camille',
        role: 'Conseiller numérique',
        contrat,
        telephone: '+33102030405',
        structureEmployeuse: expect.objectContaining({ nom: 'Médiathèque' }),
        statut: 'Actif',
      }),
    )
  })
})
