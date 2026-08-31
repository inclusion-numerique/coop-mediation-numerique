import {
  CauseTechnique,
  constat,
  NomCharge,
  type nomsCharge,
  VolumeEfface,
} from './constat-effacement'

type Charge = (typeof nomsCharge)[number]

const effacee = (charge: Charge, volume = 3) =>
  ({
    _tag: 'effacee',
    charge: NomCharge(charge),
    volume: VolumeEfface(volume),
  }) as const

const echouee = (charge: Charge) =>
  ({
    _tag: 'echouee',
    charge: NomCharge(charge),
    cause: CauseTechnique('API injoignable'),
  }) as const

describe('constat', () => {
  it('est complet quand aucune charge n’a échoué', () => {
    expect(
      constat([effacee('PortefeuilleBeneficiaires'), effacee('EmpreinteRdv')]),
    ).toEqual({
      _tag: 'complet',
      resultats: expect.any(Array),
    })
  })

  it('est complet quand une charge est sans objet', () => {
    expect(
      constat([{ _tag: 'sansObjet', charge: NomCharge('LieuxActivite') }])._tag,
    ).toBe('complet')
  })

  it('nomme les charges en échec quand il est partiel', () => {
    const resultat = constat([
      effacee('PortefeuilleBeneficiaires'),
      echouee('ListesDeDiffusion'),
    ])

    expect(resultat._tag).toBe('partiel')
    expect(resultat._tag === 'partiel' && resultat.enEchec).toEqual([
      'ListesDeDiffusion',
    ])
  })
})
