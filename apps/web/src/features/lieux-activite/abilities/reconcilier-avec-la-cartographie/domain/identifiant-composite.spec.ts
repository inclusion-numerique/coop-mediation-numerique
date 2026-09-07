import { IdsCartographieNationale } from '../../../domain/ids-cartographie-nationale'
import { SourceCartographie } from '../../../domain/tracabilite'
import { identifiantsCoop, lieuxCoopReunis } from './identifiant-composite'

const ABC = '00efad2c-0d71-43e3-a174-9e0c2defa083'
const DEF = 'f98724ab-93d2-46cd-bff6-1821dd6a6da7'

describe('identifiants coop portés par un identifiant composite', () => {
  it('lit l’identifiant d’un lieu que seule la coop décrit', () => {
    expect(
      identifiantsCoop(IdsCartographieNationale(`Coop-numérique_${ABC}`)),
    ).toEqual([ABC])
  })

  it('lit les identifiants coop d’un lieu que plusieurs sources décrivent', () => {
    expect(
      identifiantsCoop(
        IdsCartographieNationale(
          `Hinaura_Fablab__Coop-numérique_${ABC}__Coop-numérique_${DEF}`,
        ),
      ),
    ).toEqual([ABC, DEF])
  })

  it('ignore les tokens des autres sources', () => {
    expect(
      identifiantsCoop(IdsCartographieNationale('Hinaura_Fablab__Res-in_1234')),
    ).toEqual([])
  })

  it('ne compte qu’une fois un identifiant répété', () => {
    expect(
      identifiantsCoop(
        IdsCartographieNationale(
          `Coop-numérique_${ABC}__Coop-numérique_${ABC}`,
        ),
      ),
    ).toEqual([ABC])
  })

  /**
   * La cartographie agrège des producteurs qui ne garantissent rien de la forme
   * des tokens. Un suffixe qui n'est pas un identifiant ne désigne aucun lieu.
   */
  it('écarte un token coop dont le suffixe n’est pas un identifiant', () => {
    expect(
      identifiantsCoop(IdsCartographieNationale('Coop-numérique_obsolete')),
    ).toEqual([])
  })
})

describe('lieux carto réunis', () => {
  const lieu = {
    source: SourceCartographie('Coop numérique'),
    dateMaj: null,
  }

  it('écarte les lieux qu’aucun token coop ne désigne', () => {
    expect(
      lieuxCoopReunis([
        {
          ...lieu,
          identifiantCartographie: IdsCartographieNationale('Hinaura_Fablab'),
        },
        {
          ...lieu,
          identifiantCartographie: IdsCartographieNationale(
            `Coop-numérique_${ABC}`,
          ),
        },
      ]),
    ).toEqual([
      {
        ...lieu,
        identifiantCartographie: IdsCartographieNationale(
          `Coop-numérique_${ABC}`,
        ),
        coopIds: [ABC],
      },
    ])
  })
})
