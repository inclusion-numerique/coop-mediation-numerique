import {
  AdresseCourriel,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { type CompteAExaminer, derniereActivite } from './compte-a-examiner'

const compte = (surcharge: Partial<CompteAExaminer>): CompteAExaminer => ({
  id: UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'),
  courriel: AdresseCourriel('jeanne.martin@example.com'),
  prenom: 'Jeanne',
  inscriptionValidee: new Date('2024-01-01'),
  mediateur: null,
  estCoordinateur: false,
  derniereConnexion: null,
  derniereVisite: null,
  avertiLe: null,
  ...surcharge,
})

describe('dernière activité', () => {
  it('retient le dernier compte rendu ou la dernière connexion d’un médiateur', () => {
    expect(
      derniereActivite(
        compte({
          mediateur: { dernierCompteRendu: new Date('2025-03-01') },
          derniereConnexion: new Date('2025-05-01'),
          derniereVisite: new Date('2026-01-01'),
        }),
      ),
    ).toEqual(new Date('2025-05-01'))
  })

  it('retient la dernière visite d’un coordinateur', () => {
    expect(
      derniereActivite(
        compte({
          estCoordinateur: true,
          derniereConnexion: new Date('2025-05-01'),
          derniereVisite: new Date('2026-01-01'),
        }),
      ),
    ).toEqual(new Date('2026-01-01'))
  })

  it('retient la plus récente des deux pour un médiateur coordinateur', () => {
    expect(
      derniereActivite(
        compte({
          mediateur: { dernierCompteRendu: new Date('2026-02-01') },
          estCoordinateur: true,
          derniereVisite: new Date('2026-01-01'),
        }),
      ),
    ).toEqual(new Date('2026-02-01'))
  })

  it('se rabat sur l’inscription validée sans aucune autre trace', () => {
    expect(
      derniereActivite(compte({ mediateur: { dernierCompteRendu: null } })),
    ).toEqual(new Date('2024-01-01'))
  })
})
