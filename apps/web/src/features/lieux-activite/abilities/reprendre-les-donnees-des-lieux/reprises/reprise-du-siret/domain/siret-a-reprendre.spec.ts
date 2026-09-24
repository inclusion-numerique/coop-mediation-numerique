import { lieuAReprendre } from '../../../domain/lieu-a-reprendre.fixture'
import type { AdresseGeocodee } from '../../reprise-de-l-adresse/domain/adresse-a-reprendre'
import { ressemblanceDesNoms } from './nom-ressemblant'
import {
  type Confrontation,
  MOTIFS_SIRET,
  siretAReprendre,
} from './siret-a-reprendre'

const SIRET = '35600000000048'

const BAN_DU_LIEU = '51454_7160_00012'

const ADRESSE_SIRENE: AdresseGeocodee = {
  type: 'housenumber',
  score: 0.96,
  banId: BAN_DU_LIEU,
  voie: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  ancienCodeInsee: '',
  latitude: 49.25,
  longitude: 4.03,
  libelle: '12 rue de la Paix 51100 Reims',
}

const confrontation = (champs: Partial<Confrontation> = {}): Confrontation => ({
  siret: SIRET,
  sirene: {
    etat: 'ouvert',
    etablissement: {
      nom: 'Espace numérique de Reims',
      voie: '12 RUE DE LA PAIX',
      codePostal: '51100',
      commune: 'REIMS',
      codeInsee: '51454',
    },
  },
  adresseRetenue: BAN_DU_LIEU,
  adresseDuLieuALaVoie: false,
  adresseSirene: ADRESSE_SIRENE,
  ...champs,
})

const verdict = (
  champs: Partial<Confrontation> = {},
  lieu: Parameters<typeof lieuAReprendre>[0] = {},
) =>
  siretAReprendre(
    lieuAReprendre({ siret: SIRET, ...lieu }),
    confrontation(champs),
  )

const ailleurs = (nom: string) =>
  confrontation({
    sirene: {
      etat: 'ouvert',
      etablissement: {
        nom,
        voie: '12 RUE DE LA PAIX',
        codePostal: '51100',
        commune: 'REIMS',
        codeInsee: '51454',
      },
    },
  }).sirene

describe('le SIRET, confronté à SIRENE et à la Base Adresse Nationale', () => {
  it('ne concerne pas un lieu sans SIRET', () => {
    expect(
      siretAReprendre(lieuAReprendre({ siret: null }), undefined),
    ).toBeNull()
  })

  it('garde un SIRET légitime sous le même nom', () => {
    expect(verdict()).toBeNull()
  })

  it.each([
    ['vide', '', MOTIFS_SIRET.vide],
    ['refusé par la clé de contrôle', '12345678901234', MOTIFS_SIRET.invalide],
  ])('efface un SIRET %s', (_cas, siret, motif) => {
    expect(siretAReprendre(lieuAReprendre({ siret }), undefined)).toEqual({
      verdict: 'a-effacer',
      efface: siret,
      motif,
    })
  })

  it('efface un SIRET inconnu de SIRENE', () => {
    expect(verdict({ sirene: { etat: 'inconnu' } })?.verdict).toBe('a-effacer')
  })

  it('efface le SIRET d’un établissement fermé', () => {
    expect(verdict({ sirene: { etat: 'ferme' } })).toEqual({
      verdict: 'a-effacer',
      efface: SIRET,
      motif: MOTIFS_SIRET.ferme,
    })
  })

  it('efface un SIRET que SIRENE situe à un autre numéro', () => {
    expect(
      verdict({
        adresseSirene: { ...ADRESSE_SIRENE, banId: '51454_7160_00014' },
      }),
    ).toEqual({
      verdict: 'a-effacer',
      efface: SIRET,
      motif: MOTIFS_SIRET.autreAdresse,
    })
  })

  it('efface un SIRET dont SIRENE donne un tout autre nom', () => {
    expect(verdict({ sirene: ailleurs('BOULANGERIE DUPONT') })).toEqual({
      verdict: 'a-effacer',
      efface: SIRET,
      motif: MOTIFS_SIRET.autreNom,
    })
  })

  it('reprend le nom SIRENE et garde celui du lieu en nom d’usage', () => {
    expect(verdict({ sirene: ailleurs('ESPACE NUMERIQUE DE REIMS') })).toEqual({
      verdict: 'a-renommer',
      siret: SIRET,
      nom: 'ESPACE NUMERIQUE DE REIMS',
      nomUsage: 'Espace numérique de Reims',
    })
  })

  it('retire les espaces d’un SIRET légitime', () => {
    expect(verdict({}, { siret: '356 000 000 00048' })).toEqual({
      verdict: 'a-corriger',
      corrige: SIRET,
    })
  })

  it.each([
    [
      'l’adresse du lieu n’est pas fixée',
      { adresseRetenue: null },
      MOTIFS_SIRET.adresseNonFixee,
    ],
    [
      'la BAN ne reconnaît pas l’adresse SIRENE',
      { adresseSirene: null },
      MOTIFS_SIRET.adresseSireneIntrouvable,
    ],
    [
      'SIRENE n’a pas répondu',
      { sirene: { etat: 'injoignable' } as const },
      MOTIFS_SIRET.injoignable,
    ],
    [
      'le lieu n’est situé qu’à la voie que SIRENE numérote',
      {
        adresseRetenue: '51454_7160',
        adresseDuLieuALaVoie: true,
      },
      MOTIFS_SIRET.adresseALaVoie,
    ],
  ])('garde le SIRET à revérifier quand %s', (_cas, champs, motif) => {
    expect(verdict(champs)).toEqual({ verdict: 'a-reverifier', motif })
  })
})

describe('la ressemblance des noms, indépendante de l’ordre des mots', () => {
  it('reconnaît les mêmes mots dans un autre ordre', () => {
    expect(
      ressemblanceDesNoms('Adéquat centre social', 'CENTRE SOCIAL ADEQUAT'),
    ).toBe(100)
  })

  it('distingue deux structures différentes', () => {
    expect(
      ressemblanceDesNoms('Espace numérique de Reims', 'BOULANGERIE DUPONT'),
    ).toBeLessThan(65)
  })
})
