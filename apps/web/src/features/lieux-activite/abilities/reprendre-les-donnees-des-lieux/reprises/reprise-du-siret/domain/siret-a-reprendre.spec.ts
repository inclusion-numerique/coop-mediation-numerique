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
  voieRetenue: '12 rue de la Paix',
  inseeRetenu: '51454',
  adresseDuLieuALaVoie: false,
  adresseSirene: ADRESSE_SIRENE,
  reponsesPourSirene: [ADRESSE_SIRENE],
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

const sireneA = (voie: string, codeInsee: string) =>
  ({
    etat: 'ouvert',
    etablissement: {
      nom: 'Espace numérique de Reims',
      voie,
      codePostal: '51100',
      commune: 'REIMS',
      codeInsee,
    },
  }) as const

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
        sirene: sireneA('14 RUE DE LA PAIX', '51454'),
        adresseSirene: { ...ADRESSE_SIRENE, banId: '51454_7160_00014' },
        reponsesPourSirene: [{ ...ADRESSE_SIRENE, banId: '51454_7160_00014' }],
      }),
    ).toEqual({
      verdict: 'a-effacer',
      efface: SIRET,
      motif: MOTIFS_SIRET.autreNumero,
    })
  })

  it('garde un SIRET dont l’adresse SIRENE, mal écrite, mène à celle du lieu', () => {
    expect(
      verdict({
        adresseSirene: null,
        reponsesPourSirene: [{ ...ADRESSE_SIRENE, score: 0.73 }],
      }),
    ).toBeNull()
  })

  it('garde un SIRET dont l’adresse SIRENE, normalisée, est celle du lieu', () => {
    expect(
      verdict({
        sirene: sireneA('4 RUE DE BIANKOUMA ET SIPILOU', '70550'),
        voieRetenue: '4 Rue de Biankouma et Sipilou',
        inseeRetenu: '70550',
        adresseSirene: null,
        reponsesPourSirene: [],
      }),
    ).toBeNull()
  })

  it('garde un SIRET dont la voie SIRENE a les mêmes mots dans un autre ordre', () => {
    expect(
      verdict({
        sirene: sireneA('4 RUE DE BIANKOUMA ET SIPILOU', '70550'),
        voieRetenue: '4 Rue de Sipilou et Biankouma',
        inseeRetenu: '70550',
        adresseSirene: null,
        reponsesPourSirene: [],
      }),
    ).toBeNull()
  })

  it('ne confond pas deux numéros de la même voie', () => {
    expect(
      verdict({
        sirene: sireneA('14 RUE DE BIANKOUMA ET SIPILOU', '70550'),
        voieRetenue: '4 Rue de Biankouma et Sipilou',
        inseeRetenu: '70550',
        adresseSirene: null,
        reponsesPourSirene: [],
      }),
    ).toEqual({
      verdict: 'a-effacer',
      efface: SIRET,
      motif: MOTIFS_SIRET.adresseSireneIntrouvable,
    })
  })

  it('reconnaît un suffixe écrit autrement', () => {
    expect(
      verdict({
        sirene: sireneA('16 bis RUE ROGER SALENGRO', '30032'),
        voieRetenue: '16bis Rue Roger Salengro',
        inseeRetenu: '30032',
        adresseSirene: null,
        reponsesPourSirene: [],
      }),
    ).toBeNull()
  })

  it('efface un SIRET à la même adresse dans une autre commune', () => {
    expect(
      verdict({
        sirene: sireneA('11 RUE DE LA MAIRIE', '56188'),
        voieRetenue: '11 Rue de la Mairie',
        inseeRetenu: '56128',
        adresseSirene: { ...ADRESSE_SIRENE, banId: '56188_0010_00011' },
        reponsesPourSirene: [{ ...ADRESSE_SIRENE, banId: '56188_0010_00011' }],
      })?.verdict,
    ).toBe('a-effacer')
  })

  it('efface un SIRET dont SIRENE ne situe que la voie du lieu', () => {
    expect(
      verdict({
        sirene: sireneA('PLACE DE LA PAIX', '51454'),
        adresseSirene: {
          ...ADRESSE_SIRENE,
          type: 'street',
          banId: '51454_7160',
        },
        reponsesPourSirene: [
          { ...ADRESSE_SIRENE, type: 'street', banId: '51454_7160' },
        ],
      }),
    ).toEqual({
      verdict: 'a-effacer',
      efface: SIRET,
      motif: MOTIFS_SIRET.adresseSireneALaVoie,
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
      'la BAN ne reconnaît pas l’adresse SIRENE',
      {
        sirene: sireneA('MAISON DES SERVICES', '51454'),
        adresseSirene: null,
        reponsesPourSirene: [],
      },
      MOTIFS_SIRET.adresseSireneIntrouvable,
    ],
    [
      'le lieu n’est situé qu’à la voie que SIRENE numérote',
      {
        adresseRetenue: '51454_7160',
        voieRetenue: 'rue de la Paix',
        adresseDuLieuALaVoie: true,
      },
      MOTIFS_SIRET.adresseALaVoie,
    ],
  ])('efface le SIRET quand %s', (_cas, champs, motif) => {
    expect(verdict(champs)).toEqual({
      verdict: 'a-effacer',
      efface: SIRET,
      motif,
    })
  })

  it('efface le SIRET quand la reprise de l’adresse ne fixe pas celle du lieu', () => {
    expect(verdict({ adresseRetenue: null })).toEqual({
      verdict: 'a-effacer',
      efface: SIRET,
      motif: MOTIFS_SIRET.adresseNonFixee,
    })
  })

  it('garde le SIRET à revérifier quand SIRENE n’a pas répondu', () => {
    expect(verdict({ sirene: { etat: 'injoignable' } })).toEqual({
      verdict: 'a-reverifier',
      motif: MOTIFS_SIRET.injoignable,
    })
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
