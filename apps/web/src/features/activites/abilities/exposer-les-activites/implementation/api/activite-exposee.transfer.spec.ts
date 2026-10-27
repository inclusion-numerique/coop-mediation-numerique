import { beneficiairesComptes } from './activite-exposee.transfer'

describe('beneficiairesComptes', () => {
  it('rend des compteurs à zéro sans accompagnement', () => {
    expect(beneficiairesComptes([])).toEqual({
      total: 0,
      genres: { masculin: 0, feminin: 0, non_communique: 0 },
      tranches_age: {
        moins_de_douze: 0,
        douze_dix_huit: 0,
        dix_huit_vingt_quatre: 0,
        vingt_cinq_trente_neuf: 0,
        quarante_cinquante_neuf: 0,
        soixante_soixante_neuf: 0,
        soixante_dix_plus: 0,
        non_communique: 0,
      },
      statuts: {
        scolarise: 0,
        sans_emploi: 0,
        en_emploi: 0,
        retraite: 0,
        non_communique: 0,
      },
    })
  })

  it('compte chaque bénéficiaire, une valeur absente comptant pour non communiqué', () => {
    const compte = beneficiairesComptes([
      {
        beneficiaire: {
          genre: 'Feminin',
          trancheAge: 'DouzeDixHuit',
          statutSocial: 'Scolarise',
        },
      },
      {
        beneficiaire: {
          genre: 'Feminin',
          trancheAge: null,
          statutSocial: 'NonCommunique',
        },
      },
      {
        beneficiaire: { genre: null, trancheAge: null, statutSocial: null },
      },
    ])

    expect(compte.total).toBe(3)
    expect(compte.genres).toEqual({
      masculin: 0,
      feminin: 2,
      non_communique: 1,
    })
    expect(compte.tranches_age.douze_dix_huit).toBe(1)
    expect(compte.tranches_age.non_communique).toBe(2)
    expect(compte.statuts).toEqual({
      scolarise: 1,
      sans_emploi: 0,
      en_emploi: 0,
      retraite: 0,
      non_communique: 2,
    })
  })
})
