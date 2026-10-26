import { dernierContrat, type LigneDeContrat } from './contrat'
import { TypeDeContrat } from './type-de-contrat'

const maintenant = new Date('2026-10-14')

const ligne = (contrat: Partial<LigneDeContrat>): LigneDeContrat => ({
  type: TypeDeContrat('CDD'),
  debut: new Date('2026-01-01'),
  fin: new Date('2027-12-31'),
  rupture: null,
  ...contrat,
})

describe('dernierContrat', () => {
  it('ne donne aucun contrat sans ligne', () => {
    expect(dernierContrat([], maintenant)).toBeNull()
  })

  it('retient le contrat le plus récent', () => {
    expect(
      dernierContrat(
        [
          ligne({ type: TypeDeContrat('CDD'), debut: new Date('2022-01-01') }),
          ligne({ type: TypeDeContrat('CDI'), debut: new Date('2025-01-01') }),
        ],
        maintenant,
      )?.type,
    ).toBe('CDI')
  })

  it('ne donne aucun contrat quand la rupture est passée', () => {
    expect(
      dernierContrat([ligne({ rupture: new Date('2026-06-30') })], maintenant),
    ).toBeNull()
  })

  it('termine le contrat à la rupture quand elle est à venir', () => {
    expect(
      dernierContrat([ligne({ rupture: new Date('2027-03-31') })], maintenant)
        ?.fin,
    ).toEqual(new Date('2027-03-31'))
  })

  it('garde le terme du contrat quand il précède la rupture', () => {
    expect(
      dernierContrat(
        [
          ligne({
            fin: new Date('2027-03-31'),
            rupture: new Date('2027-06-30'),
          }),
        ],
        maintenant,
      )?.fin,
    ).toEqual(new Date('2027-03-31'))
  })

  it.each([
    ['sans terme', null, 'EnCours'],
    [
      'dont le terme est à plus de trois mois',
      new Date('2027-12-31'),
      'EnCours',
    ],
    [
      'dont le terme est à moins de trois mois',
      new Date('2026-12-31'),
      'FinProchaine',
    ],
    ['dont le terme est passé', new Date('2026-06-30'), 'Termine'],
  ])('donne l’échéance d’un contrat %s', (_, fin, echeance) => {
    expect(dernierContrat([ligne({ fin })], maintenant)?.echeance).toBe(
      echeance,
    )
  })

  it('annonce la fin prochaine d’un contrat rompu dans moins de trois mois', () => {
    expect(
      dernierContrat([ligne({ rupture: new Date('2026-11-30') })], maintenant)
        ?.echeance,
    ).toBe('FinProchaine')
  })
})
