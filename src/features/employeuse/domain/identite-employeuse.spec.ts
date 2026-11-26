import { describe, expect, it } from 'vitest'
import {
  type EtablissementSirene,
  identiteDepuisEtablissement,
} from './identite-employeuse'

const etablissementOuvert: EtablissementSirene = {
  siret: '12345678901234',
  raisonSociale: 'ASSOCIATION DES TESTS',
  ferme: false,
  voie: '12 rue des Tests',
  commune: 'Nantes',
  codePostal: '44000',
  codeInsee: '44109',
}

describe('identiteDepuisEtablissement', () => {
  it('tire une identité complète d’un établissement ouvert', () => {
    expect(identiteDepuisEtablissement(etablissementOuvert)).toEqual({
      siret: '12345678901234',
      denomination: 'ASSOCIATION DES TESTS',
      adresse: {
        voie: '12 rue des Tests',
        commune: 'Nantes',
        codePostal: '44000',
        codeInsee: '44109',
      },
    })
  })

  it('n’en tire aucune d’un établissement fermé, qui n’emploie plus personne', () => {
    expect(
      identiteDepuisEtablissement({ ...etablissementOuvert, ferme: true }),
    ).toBeNull()
  })

  it('n’en tire aucune sans commune, car il n’y a rien à soumettre à la BAN', () => {
    expect(
      identiteDepuisEtablissement({ ...etablissementOuvert, commune: null }),
    ).toBeNull()
  })

  it('tolère l’absence de raison sociale, car un SIRET valide suffit à rendre l’établissement rattachable', () => {
    expect(
      identiteDepuisEtablissement({
        ...etablissementOuvert,
        raisonSociale: null,
      }),
    ).toEqual({
      siret: '12345678901234',
      denomination: null,
      adresse: {
        voie: '12 rue des Tests',
        commune: 'Nantes',
        codePostal: '44000',
        codeInsee: '44109',
      },
    })
  })

  it('tolère l’absence de voie, de code postal et de code INSEE', () => {
    expect(
      identiteDepuisEtablissement({
        ...etablissementOuvert,
        voie: null,
        codePostal: '',
        codeInsee: '',
      }),
    ).toEqual({
      siret: '12345678901234',
      denomination: 'ASSOCIATION DES TESTS',
      adresse: {
        voie: null,
        commune: 'Nantes',
        codePostal: null,
        codeInsee: null,
      },
    })
  })

  it('écarte un SIRET hors format', () => {
    expect(
      identiteDepuisEtablissement({
        ...etablissementOuvert,
        siret: 'pas-un-siret',
      }),
    ).toBeNull()
  })
})
