import { MediateurId, UtilisateurId } from '../../../domain'
import { lignesAffichees } from './lister-les-membres.presenter'

const profil = {
  utilisateurId: UtilisateurId('550e8400-e29b-41d4-a716-446655440061'),
  prenom: 'Camille',
  nom: 'Martin',
  telephone: null,
  role: 'ConseillerNumerique' as const,
}

describe('affichage d’une ligne de l’équipe', () => {
  it('une invitation ne mène à aucun profil', () => {
    const [ligne] = lignesAffichees(
      [
        {
          email: 'invite@example.com',
          statut: { type: 'Invitation', envoyeeLe: new Date('2026-01-02') },
          personne: { type: 'SansCompte' },
          structureEmployeuse: { type: 'Inconnue' },
        },
      ],
      '69',
    )

    expect(ligne).toEqual(
      expect.objectContaining({
        icone: 'invitation',
        role: 'Invitation en attente',
        lienProfil: null,
        severite: 'info',
        structureEmployeuse: '/',
      }),
    )
  })

  it('un membre actif mène à sa fiche dans le réseau du département', () => {
    const [ligne] = lignesAffichees(
      [
        {
          email: 'camille@example.com',
          statut: { type: 'Actif', derniereActivite: new Date() },
          personne: {
            type: 'Inscrite',
            mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440062'),
            profil,
          },
          structureEmployeuse: {
            type: 'Connue',
            nom: 'Médiathèque',
            adresse: null,
            commune: null,
            codePostal: null,
            codeInsee: null,
          },
        },
      ],
      '69',
    )

    expect(ligne).toEqual(
      expect.objectContaining({
        icone: 'conseiller-numerique',
        nomComplet: 'Camille Martin',
        role: 'Conseiller numérique',
        activite: 'actif',
        lienProfil: `/coop/mon-reseau/69/acteurs/${profil.utilisateurId}`,
        structureEmployeuse: 'Médiathèque',
      }),
    )
  })

  it('un profil supprimé ne montre plus son email', () => {
    const [ligne] = lignesAffichees(
      [
        {
          email: 'supprime@example.com',
          statut: { type: 'ProfilSupprime', le: new Date('2026-01-02') },
          personne: {
            type: 'Inscrite',
            mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440063'),
            profil,
          },
          structureEmployeuse: { type: 'Inconnue' },
        },
      ],
      '69',
    )

    expect(ligne?.email).toBeNull()
    expect(ligne?.severite).toBe('neutre')
  })
})
