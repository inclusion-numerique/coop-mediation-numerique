import {
  type EtablissementSirene,
  identiteDepuisEtablissement,
} from './identite-employeuse'

const etablissement = (
  overrides: Partial<EtablissementSirene> = {},
): EtablissementSirene => ({
  siret: '12345678901234',
  raisonSociale: 'ASSOCIATION DES TESTS',
  ferme: false,
  voie: '12 rue des Tests',
  commune: 'Nantes',
  codePostal: '44000',
  codeInsee: '44109',
  ...overrides,
})

describe('identiteDepuisEtablissement', () => {
  it('tire une identité complète d’un établissement ouvert', () => {
    expect(identiteDepuisEtablissement(etablissement())).toEqual({
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

  it('n’en tire aucune d’un établissement fermé — il n’emploie plus personne', () => {
    expect(
      identiteDepuisEtablissement(etablissement({ ferme: true })),
    ).toBeNull()
  })

  it('n’en tire aucune sans commune — il n’y a rien à soumettre à la BAN', () => {
    expect(
      identiteDepuisEtablissement(etablissement({ commune: null })),
    ).toBeNull()
  })

  it('tolère l’absence de raison sociale — l’établissement reste rattachable', () => {
    // Règle métier : un SIRET valide suffit à enregistrer une employeuse. 14
    // employeuses de production n'ont aucune dénomination (entreprises
    // individuelles, établissements non diffusibles) ; l'exiger ici les rendait
    // lisibles mais non enregistrables.
    expect(
      identiteDepuisEtablissement(etablissement({ raisonSociale: null })),
    ).toMatchObject({ siret: '12345678901234', denomination: null })
  })

  it('tolère l’absence de voie, de code postal et de code INSEE', () => {
    expect(
      identiteDepuisEtablissement(
        etablissement({ voie: null, codePostal: '', codeInsee: '' }),
      ),
    ).toMatchObject({
      adresse: { voie: null, codePostal: null, codeInsee: null },
    })
  })

  it('écarte un SIRET hors format', () => {
    expect(
      identiteDepuisEtablissement(etablissement({ siret: 'pas-un-siret' })),
    ).toBeNull()
  })
})
