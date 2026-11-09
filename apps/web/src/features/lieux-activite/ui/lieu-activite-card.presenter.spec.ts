import {
  carteDuLieu,
  type LieuEnActivite,
} from './lieu-activite-card.presenter'

const maintenant = new Date('2026-11-09T12:00:00Z')

const lieu: LieuEnActivite = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  nom: 'Espace numérique',
  nomUsage: null,
  adresse: '12 rue de la Paix',
  complementAdresse: null,
  commune: 'Reims',
  codePostal: '51100',
  modification: new Date('2026-10-01T12:00:00Z'),
  derniereModificationSource: null,
  visiblePourCartographieNationale: false,
  structureCartographieNationaleId: null,
  adresseAPreciser: false,
  _count: { mediateursEnActivite: 1 },
}

describe('la carte d’un lieu d’activité', () => {
  it('date une mise à jour récente et nomme son auteur', () => {
    expect(carteDuLieu(lieu, 'Édith Piaf', maintenant).miseAJour).toEqual({
      _tag: 'Recente',
      texte: 'Mis à jour le 01.10.2026 par Édith Piaf',
    })
  })

  it('nomme la source de l’import quand aucune personne n’a modifié la fiche', () => {
    expect(
      carteDuLieu(
        { ...lieu, derniereModificationSource: 'dora' },
        null,
        maintenant,
      ).miseAJour.texte,
    ).toMatch(/^Mis à jour le 01\.10\.2026 par .+/)
  })

  it('ne nomme personne quand la fiche n’a ni auteur ni source', () => {
    expect(carteDuLieu(lieu, null, maintenant).miseAJour.texte).toBe(
      'Mis à jour le 01.10.2026',
    )
  })

  it('signale une fiche qui n’a pas bougé depuis plus d’un an', () => {
    expect(
      carteDuLieu(
        { ...lieu, modification: new Date('2025-10-01T12:00:00Z') },
        null,
        maintenant,
      ).miseAJour,
    ).toEqual({
      _tag: 'TropAncienne',
      texte: 'Dernière mise à jour il y a plus d’un an',
    })
  })

  it('écrit l’adresse avec son complément quand il y en a un', () => {
    expect(carteDuLieu(lieu, null, maintenant).adresse).toBe(
      '12 rue de la Paix, 51100 Reims',
    )
    expect(
      carteDuLieu(
        { ...lieu, complementAdresse: 'Bâtiment B' },
        null,
        maintenant,
      ).adresse,
    ).toBe('12 rue de la Paix (Bâtiment B), 51100 Reims')
  })

  it.each([
    [0, '0 médiateur numérique référencé'],
    [1, '1 médiateur numérique référencé'],
    [2, '2 médiateurs numériques référencés'],
  ])('compte %i médiateur(s)', (nombre, attendu) => {
    expect(
      carteDuLieu(
        { ...lieu, _count: { mediateursEnActivite: nombre } },
        null,
        maintenant,
      ).mediateurs,
    ).toBe(attendu)
  })

  it('annonce une mise à jour en cours sur la cartographie le lendemain d’une modification', () => {
    expect(
      carteDuLieu(
        {
          ...lieu,
          visiblePourCartographieNationale: true,
          structureCartographieNationaleId: 'carto-1',
          modification: new Date('2026-11-09T08:00:00Z'),
        },
        null,
        maintenant,
      ).statutCartographie,
    ).toBe('updating')
  })
})
