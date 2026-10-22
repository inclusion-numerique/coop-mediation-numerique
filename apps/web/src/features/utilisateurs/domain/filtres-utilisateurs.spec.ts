import {
  AUCUN_FILTRE,
  filtresUtilisateurs,
  parametresDesFiltres,
} from './filtres-utilisateurs'

describe('filtres de la liste des utilisateurs', () => {
  it('ne filtre rien sans paramètre', () => {
    expect(filtresUtilisateurs({})).toEqual(AUCUN_FILTRE)
  })

  it('lit les listes séparées par des virgules', () => {
    expect(
      filtresUtilisateurs({
        roles: 'mediateur, coordinateur',
        departements: '75,2A',
        communes: ['75056'],
        employeuses: '12,34',
        lieux: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f',
      }),
    ).toEqual({
      ...AUCUN_FILTRE,
      roles: ['mediateur', 'coordinateur'],
      departements: ['75', '2A'],
      communes: ['75056'],
      employeuses: [12, 34],
      lieux: ['0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'],
    })
  })

  it('écarte les valeurs invalides sans perdre les autres', () => {
    expect(
      filtresUtilisateurs({
        roles: 'mediateur,pirate',
        employeuses: 'abc,7',
        lieux: 'pas-un-uuid',
        statut: 'inconnu',
      }),
    ).toEqual({ ...AUCUN_FILTRE, roles: ['mediateur'], employeuses: [7] })
  })

  it.each([
    ['1', 'ConseillerNumerique'],
    ['0', 'HorsDispositif'],
    ['2', null],
  ])('conseiller_numerique=%s donne le dispositif %s', (valeur, dispositif) => {
    expect(
      filtresUtilisateurs({ conseiller_numerique: valeur }).dispositif,
    ).toBe(dispositif)
  })

  it('se réécrit en paramètres d’URL à l’identique', () => {
    const parametres = {
      roles: 'mediateur',
      statut: 'actif',
      conseiller_numerique: '1',
      employeuses: '12',
      departements: '75',
    }

    expect(parametresDesFiltres(filtresUtilisateurs(parametres))).toEqual(
      parametres,
    )
  })
})
