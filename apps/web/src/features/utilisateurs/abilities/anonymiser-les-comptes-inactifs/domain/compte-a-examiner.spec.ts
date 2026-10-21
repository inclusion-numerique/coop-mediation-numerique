import {
  AdresseCourriel,
  JAMAIS,
  jalon,
  Prenom,
  rattachements,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import {
  type CompteAExaminer,
  derniereActivite,
  type PresenceCoordinateur,
  type PresenceMediateur,
} from './compte-a-examiner'

const compte = (
  mediateur: PresenceMediateur | null,
  coordinateur: PresenceCoordinateur | null,
): CompteAExaminer => ({
  id: UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'),
  courriel: AdresseCourriel('jeanne.martin@example.com'),
  prenom: Prenom('Jeanne'),
  inscritLe: new Date('2024-01-01'),
  presence: rattachements(mediateur, coordinateur),
  avertiLe: JAMAIS,
})

const le = (date: string) => jalon(new Date(date))

describe('dernière activité', () => {
  it('retient le dernier compte rendu ou la dernière connexion d’un médiateur', () => {
    expect(
      derniereActivite(
        compte(
          {
            dernierCompteRendu: le('2025-03-01'),
            derniereConnexion: le('2025-05-01'),
          },
          null,
        ),
      ),
    ).toEqual(new Date('2025-05-01'))
  })

  it('retient la dernière visite d’un coordinateur', () => {
    expect(
      derniereActivite(compte(null, { derniereVisite: le('2026-01-01') })),
    ).toEqual(new Date('2026-01-01'))
  })

  it('retient la plus récente des deux pour un médiateur coordinateur', () => {
    expect(
      derniereActivite(
        compte(
          { dernierCompteRendu: le('2026-02-01'), derniereConnexion: JAMAIS },
          { derniereVisite: le('2026-01-01') },
        ),
      ),
    ).toEqual(new Date('2026-02-01'))
  })

  it('se rabat sur l’inscription validée sans aucune autre trace', () => {
    expect(
      derniereActivite(
        compte({ dernierCompteRendu: JAMAIS, derniereConnexion: JAMAIS }, null),
      ),
    ).toEqual(new Date('2024-01-01'))
  })
})
