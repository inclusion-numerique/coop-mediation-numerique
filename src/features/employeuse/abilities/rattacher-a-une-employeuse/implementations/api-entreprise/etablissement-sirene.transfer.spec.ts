import { describe, expect, it } from 'vitest'
import { IdentiteEmployeuse } from '@/features/employeuse/domain/identite-employeuse'
import type { SiretApiResponse } from '@/features/employeuse/implementations/api-entreprise/siret.payload'
import { etablissementSireneDepuis } from './etablissement-sirene.transfer'

const etablissementOuvert: SiretApiResponse['data'] = {
  siret: '12345678901234',
  siege_social: true,
  etat_administratif: 'A',
  activite_principale: { code: '94.99Z', nomenclature: 'NAFRev2' },
  unite_legale: {
    siren: '123456789',
    type: 'personne_morale',
    nom_complet: 'ASSOCIATION DES TESTS',
    personne_morale_attributs: { raison_sociale: 'ASSOCIATION DES TESTS' },
    forme_juridique: { code: '9220' },
  },
  adresse: {
    numero_voie: '12',
    indice_repetition_voie: null,
    type_voie: 'RUE',
    libelle_voie: 'DES TESTS',
    complement_adresse: 'null',
    code_commune: '44109',
    code_postal: '44000',
    libelle_commune: 'Nantes',
  },
}

describe('établissement SIRENE', () => {
  it('tire une identité complète d’un établissement ouvert', () => {
    expect(etablissementSireneDepuis(etablissementOuvert)).toEqual({
      _tag: 'Ouvert',
      identite: IdentiteEmployeuse({
        siret: '12345678901234',
        denomination: 'ASSOCIATION DES TESTS',
        adresse: {
          voie: '12 RUE DES TESTS',
          commune: 'Nantes',
          codePostal: '44000',
          codeInsee: '44109',
        },
      }),
    })
  })

  it('reconnaît un établissement fermé, qui n’emploie plus personne', () => {
    expect(
      etablissementSireneDepuis({
        ...etablissementOuvert,
        etat_administratif: 'F',
      }),
    ).toEqual({ _tag: 'Ferme' })
  })

  it('n’en tire aucune identité sans commune, car il n’y a rien à soumettre à la BAN', () => {
    expect(
      etablissementSireneDepuis({
        ...etablissementOuvert,
        adresse: {
          numero_voie: '12',
          libelle_voie: 'DES TESTS',
          code_commune: '44109',
          code_postal: '44000',
        },
      }),
    ).toEqual({ _tag: 'Ouvert', identite: null })
  })

  it('tolère l’absence de raison sociale', () => {
    expect(
      etablissementSireneDepuis({
        ...etablissementOuvert,
        unite_legale: {
          siren: '123456789',
          type: 'personne_morale',
          nom_complet: 'ASSOCIATION DES TESTS',
          forme_juridique: { code: '9220' },
        },
      }),
    ).toEqual({
      _tag: 'Ouvert',
      identite: IdentiteEmployeuse({
        siret: '12345678901234',
        denomination: null,
        adresse: {
          voie: '12 RUE DES TESTS',
          commune: 'Nantes',
          codePostal: '44000',
          codeInsee: '44109',
        },
      }),
    })
  })

  it('tolère l’absence de voie, de code postal et de code INSEE', () => {
    expect(
      etablissementSireneDepuis({
        ...etablissementOuvert,
        adresse: {
          numero_voie: null,
          libelle_voie: '',
          code_postal: '',
          code_commune: '',
          libelle_commune: 'Nantes',
        },
      }),
    ).toEqual({
      _tag: 'Ouvert',
      identite: IdentiteEmployeuse({
        siret: '12345678901234',
        denomination: 'ASSOCIATION DES TESTS',
        adresse: {
          voie: null,
          commune: 'Nantes',
          codePostal: null,
          codeInsee: null,
        },
      }),
    })
  })

  it('écarte un SIRET hors format', () => {
    expect(
      etablissementSireneDepuis({
        ...etablissementOuvert,
        siret: 'pas-un-siret',
      }),
    ).toEqual({ _tag: 'Ouvert', identite: null })
  })
})
