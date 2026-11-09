import { confirmationDuPartageManquante } from './confirmation-du-partage'

describe('confirmer la modification d’un lieu partagé', () => {
  it('est exigée quand le lieu est partagé et la case n’est pas cochée', () => {
    expect(
      confirmationDuPartageManquante({ partage: true, confirmation: null }),
    ).toBe(true)
  })

  it('est acquise quand la case est cochée', () => {
    expect(
      confirmationDuPartageManquante({ partage: true, confirmation: true }),
    ).toBe(false)
  })

  it('n’est pas demandée pour un lieu que personne d’autre n’utilise', () => {
    expect(
      confirmationDuPartageManquante({ partage: false, confirmation: null }),
    ).toBe(false)
  })
})
