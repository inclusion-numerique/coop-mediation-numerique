import { retraitCoop, signatureCoop } from './signature-coop'

const maintenant = new Date('2026-09-11T16:00:00Z')

describe('la marque que la coop laisse sur une inscription', () => {
  it('annonce la coop comme source et comme auteur', () => {
    expect(signatureCoop(maintenant)).toEqual({
      source: 'Coop numérique',
      editedBy: 'coop',
      updatedAtCoop: maintenant,
    })
  })

  it('retire sans effacer, en datant la suppression', () => {
    expect(retraitCoop(maintenant)).toEqual({
      deletedAt: maintenant,
      editedBy: 'coop',
      updatedAtCoop: maintenant,
    })
  })
})
