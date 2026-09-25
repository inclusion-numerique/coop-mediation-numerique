import { reprise, reprisesRetenues } from './reprise'

const surLesColonnes = (...colonnes: string[]) =>
  reprise<null>({
    colonnes,
    constater: () => null,
    mentions: () => [],
    appliquer: async () => undefined,
  })

describe('les reprises qu’un passage retient', () => {
  const horaires = surLesColonnes('horaires')
  const listes = surLesColonnes('services', 'typologies')
  const complement = surLesColonnes('complementAdresse')
  const toutes = [horaires, listes, complement]

  it('les retient toutes quand on n’en demande aucune', () => {
    expect(reprisesRetenues(toutes, undefined)).toEqual(toutes)
  })

  it('ne retient que celles des colonnes demandées', () => {
    expect(reprisesRetenues(toutes, ['complementAdresse'])).toEqual([
      complement,
    ])
  })

  it('retient une reprise qui porte sur plusieurs colonnes dès qu’on en demande une', () => {
    expect(reprisesRetenues(toutes, ['typologies'])).toEqual([listes])
  })

  it('refuse une colonne qu’aucune reprise ne porte', () => {
    expect(() => reprisesRetenues(toutes, ['complement'])).toThrow(
      'Reprise inconnue : complement',
    )
  })
})
