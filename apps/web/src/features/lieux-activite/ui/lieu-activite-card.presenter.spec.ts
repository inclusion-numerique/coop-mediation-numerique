import { NomAffiche } from '@app/web/libraries/nom-affiche'
import { Adresse, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { IdentifiantCartographie } from '../domain/ids-cartographie-nationale'
import type { LieuEnListe } from '../domain/lieu-en-liste'
import { LieuId } from '../domain/lieu-id'
import { NombreDeMediateurs } from '../domain/nombres'
import { SourceCartographie } from '../domain/tracabilite'
import { VisibiliteCartographie } from '../domain/visibilite-cartographie'
import { carteDuLieu } from './lieu-activite-card.presenter'

const maintenant = new Date('2026-11-09T12:00:00Z')
const modifieLe = new Date('2026-10-01T12:00:00Z')

const lieu: LieuEnListe = {
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
  nom: Nom('Espace numérique'),
  nomUsage: null,
  adresse: Adresse({
    voie: '12 rue de la Paix',
    commune: 'Reims',
    code_postal: '51100',
  }),
  adresseAPreciser: false,
  derniereModification: { _tag: 'Inconnue', date: modifieLe },
  visibilite: VisibiliteCartographie('NonPublie'),
  identifiantCartographie: null,
  mediateurs: NombreDeMediateurs(1),
}

describe('la carte d’un lieu d’activité', () => {
  it('date une mise à jour récente et nomme son auteur', () => {
    expect(
      carteDuLieu(
        {
          ...lieu,
          derniereModification: {
            _tag: 'ParUtilisateur',
            date: modifieLe,
            auteur: NomAffiche('Édith Piaf'),
          },
        },
        maintenant,
      ).miseAJour,
    ).toEqual({
      _tag: 'Recente',
      texte: 'Mis à jour le 01.10.2026 par Édith Piaf',
    })
  })

  it('nomme la source de l’import quand aucune personne n’a modifié la fiche', () => {
    expect(
      carteDuLieu(
        {
          ...lieu,
          derniereModification: {
            _tag: 'ParSource',
            date: modifieLe,
            source: SourceCartographie('dora'),
          },
        },
        maintenant,
      ).miseAJour.texte,
    ).toMatch(/^Mis à jour le 01\.10\.2026 par .+/)
  })

  it('ne nomme personne quand la fiche n’a ni auteur ni source', () => {
    expect(carteDuLieu(lieu, maintenant).miseAJour.texte).toBe(
      'Mis à jour le 01.10.2026',
    )
  })

  it('signale une fiche qui n’a pas bougé depuis plus d’un an', () => {
    expect(
      carteDuLieu(
        {
          ...lieu,
          derniereModification: {
            _tag: 'Inconnue',
            date: new Date('2025-10-01T12:00:00Z'),
          },
        },
        maintenant,
      ).miseAJour,
    ).toEqual({
      _tag: 'TropAncienne',
      texte: 'Dernière mise à jour il y a plus d’un an',
    })
  })

  it('écrit l’adresse avec son complément quand il y en a un', () => {
    expect(carteDuLieu(lieu, maintenant).adresse).toBe(
      '12 rue de la Paix, 51100 Reims',
    )
    expect(
      carteDuLieu(
        {
          ...lieu,
          adresse: Adresse({
            voie: '12 rue de la Paix',
            commune: 'Reims',
            code_postal: '51100',
            complement_adresse: 'Bâtiment B',
          }),
        },
        maintenant,
      ).adresse,
    ).toBe('12 rue de la Paix (Bâtiment B), 51100 Reims')
  })

  it('dit qu’une adresse que le standard ne reconnaît pas manque', () => {
    expect(carteDuLieu({ ...lieu, adresse: null }, maintenant).adresse).toBe(
      'Adresse non renseignée',
    )
  })

  it.each([
    [0, '0 médiateur numérique référencé'],
    [1, '1 médiateur numérique référencé'],
    [2, '2 médiateurs numériques référencés'],
  ])('compte %i médiateur(s)', (nombre, attendu) => {
    expect(
      carteDuLieu(
        { ...lieu, mediateurs: NombreDeMediateurs(nombre) },
        maintenant,
      ).mediateurs,
    ).toBe(attendu)
  })

  it('annonce une mise à jour en cours sur la cartographie le lendemain d’une modification', () => {
    expect(
      carteDuLieu(
        {
          ...lieu,
          visibilite: VisibiliteCartographie('Publie'),
          identifiantCartographie: IdentifiantCartographie('carto-1'),
          derniereModification: {
            _tag: 'Inconnue',
            date: new Date('2026-11-09T08:00:00Z'),
          },
        },
        maintenant,
      ).statutCartographie,
    ).toBe('updating')
  })
})
