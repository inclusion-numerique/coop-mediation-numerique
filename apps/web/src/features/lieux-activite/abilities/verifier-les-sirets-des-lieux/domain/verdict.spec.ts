import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import type { LieuAVerifier } from './lieu-a-verifier'
import { dejaVerifie, verdictDuSiret } from './verdict'

const lieu = (champs: Partial<LieuAVerifier> = {}): LieuAVerifier => ({
  id: LieuId('11111111-1111-4111-8111-111111111111'),
  siret: '13002603200016',
  nom: 'Maison France Services de Reims',
  adresse: '12 rue de la Paix',
  synchronisation: null,
  ...champs,
})

describe('dejaVerifie', () => {
  const hier = new Date('2026-09-03T00:00:00Z')

  it('laisse de côté un lieu confronté après la date de fraîcheur', () => {
    expect(
      dejaVerifie(
        lieu({ synchronisation: new Date('2026-09-04T00:00:00Z') }),
        hier,
      ),
    ).toBe(true)
  })

  it('reprend un lieu confronté avant la date de fraîcheur', () => {
    expect(
      dejaVerifie(
        lieu({ synchronisation: new Date('2026-09-01T00:00:00Z') }),
        hier,
      ),
    ).toBe(false)
  })

  it('reprend un lieu jamais confronté', () => {
    expect(dejaVerifie(lieu({ synchronisation: null }), hier)).toBe(false)
  })
})

describe('verdictDuSiret', () => {
  it('vérifie un SIRET dont le nom et l’adresse concordent', () => {
    expect(
      verdictDuSiret(lieu(), {
        connu: true,
        nom: 'Maison France Services de Reims',
        adresse: '12 rue de la Paix',
      }),
    ).toBe('verifie')
  })

  it('tolère les écarts de graphie', () => {
    expect(
      verdictDuSiret(lieu(), {
        connu: true,
        nom: 'MAISON FRANCE SERVICES DE REIMS',
        adresse: '12 RUE DE LA PAIX',
      }),
    ).toBe('verifie')
  })

  it('efface un SIRET enregistré sous un autre nom', () => {
    expect(
      verdictDuSiret(lieu(), {
        connu: true,
        nom: 'Boulangerie du Centre',
        adresse: '12 rue de la Paix',
      }),
    ).toBe('efface')
  })

  it('efface un SIRET enregistré à une autre adresse', () => {
    expect(
      verdictDuSiret(lieu(), {
        connu: true,
        nom: 'Maison France Services de Reims',
        adresse: '87 avenue Jean Jaurès',
      }),
    ).toBe('efface')
  })

  it('efface un SIRET que SIRENE ne connaît pas', () => {
    expect(verdictDuSiret(lieu(), { connu: false })).toBe('efface')
  })
})
