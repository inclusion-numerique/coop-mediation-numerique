import { libelleStatutMembre } from './statut-membre'

const date = new Date('2026-03-04T10:00:00Z')

describe('libellé du statut d’un membre', () => {
  it.each([
    [
      { type: 'Invitation', envoyeeLe: date },
      'Invitation envoyée le 04.03.2026',
    ],
    [{ type: 'Actif', derniereActivite: date }, 'Actif'],
    [{ type: 'Inactif', derniereActivite: { type: 'Aucune' } }, 'Inactif'],
    [
      { type: 'Inactif', derniereActivite: { type: 'Le', date } },
      'Inactif depuis le 04.03.2026',
    ],
    [
      { type: 'AncienMembre', depuis: new Date('2025-01-01'), jusquA: date },
      'Ancien membre depuis le 04.03.2026',
    ],
    [{ type: 'ProfilSupprime', le: date }, 'Profil supprimé le 04.03.2026'],
  ] as const)('%o', (statut, libelle) => {
    expect(libelleStatutMembre(statut)).toBe(libelle)
  })
})
