import { depublicationCoop, retraitCoop, signatureCoop } from './signature-coop'

const maintenant = new Date('2026-09-11T16:00:00Z')

describe('la marque que la coop laisse sur une inscription', () => {
  it('annonce la coop comme source et comme auteur', () => {
    expect(signatureCoop(maintenant)).toEqual({
      source: 'Coop numérique',
      deletedAt: null,
      editedBy: 'coop',
      updatedAtCoop: maintenant,
    })
  })

  it('relève une inscription qu’une autre source avait éteinte', () => {
    expect(signatureCoop(maintenant).deletedAt).toBeNull()
  })

  it('retire sans effacer, en datant la suppression', () => {
    expect(retraitCoop(maintenant)).toEqual({
      deletedAt: maintenant,
      editedBy: 'coop',
      updatedAtCoop: maintenant,
    })
  })

  it('dépublie sans toucher au partage déclaré ailleurs', () => {
    expect(depublicationCoop(maintenant)).toEqual({
      visiblePourCartographieNationale: false,
      editedBy: 'coop',
      updatedAtCoop: maintenant,
    })
  })

  it('ne réattribue la source que sur une écriture de valeurs métier', () => {
    expect(retraitCoop(maintenant)).not.toHaveProperty('source')
    expect(depublicationCoop(maintenant)).not.toHaveProperty('source')
  })
})
