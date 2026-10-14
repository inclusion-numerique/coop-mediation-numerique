import { contratEnCours, type LigneContrat } from './contratConseillerNumerique'

const maintenant = new Date('2026-10-14')

const ligne = (contrat: Partial<LigneContrat>): LigneContrat => ({
  type: 'CDD',
  dateDebut: new Date('2026-01-01'),
  dateFin: new Date('2027-12-31'),
  dateRupture: null,
  ...contrat,
})

describe('contratEnCours', () => {
  it('ne donne aucun contrat sans ligne', () => {
    expect(contratEnCours([], maintenant)).toBeNull()
  })

  it('retient le contrat le plus récent', () => {
    expect(
      contratEnCours(
        [
          ligne({ type: 'CDD', dateDebut: new Date('2022-01-01') }),
          ligne({ type: 'CDI', dateDebut: new Date('2025-01-01') }),
        ],
        maintenant,
      )?.type,
    ).toBe('CDI')
  })

  it('affiche le contrat de projet en toutes lettres', () => {
    expect(contratEnCours([ligne({ type: 'CDP' })], maintenant)?.type).toBe(
      'Contrat de projet',
    )
  })

  it('ne donne aucun contrat quand la rupture est passée', () => {
    expect(
      contratEnCours(
        [ligne({ dateRupture: new Date('2026-06-30') })],
        maintenant,
      ),
    ).toBeNull()
  })

  it('termine le contrat à la rupture quand elle est à venir', () => {
    expect(
      contratEnCours(
        [ligne({ dateRupture: new Date('2026-11-30') })],
        maintenant,
      )?.fin,
    ).toEqual(new Date('2026-11-30'))
  })

  it('garde le terme du contrat quand il précède la rupture', () => {
    expect(
      contratEnCours(
        [
          ligne({
            dateFin: new Date('2026-11-30'),
            dateRupture: new Date('2027-01-31'),
          }),
        ],
        maintenant,
      )?.fin,
    ).toEqual(new Date('2026-11-30'))
  })

  it('garde un contrat dont le terme est passé, sans rupture', () => {
    expect(
      contratEnCours([ligne({ dateFin: new Date('2026-06-30') })], maintenant)
        ?.fin,
    ).toEqual(new Date('2026-06-30'))
  })
})
