import { Service } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import type { Aidant } from '../../domain/lieu-publie'
import { LieuPublieSchema } from '../../domain/lieu-publie'
import { lieuPublieExpose } from './lieu-publie.transfer'

const lieu = LieuPublieSchema.parse({
  id: 'e4b5f0d4-5a1f-4a5a-9a4e-2e1c9f0b1d2c',
  nom: 'Espace numérique de Reims',
  adresse: {
    voie: '12 rue de la Paix',
    code_postal: '51100',
    code_insee: '51454',
    commune: 'Reims',
  },
  services: [Service.AideAuxDemarchesAdministratives],
})

const aidant: Aidant = {
  id: '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8',
  nom: 'Jeanne Martin',
  courriel: 'jeanne@example.com',
  telephone: '+33612345678',
}

const expose = {
  id: 'e4b5f0d4-5a1f-4a5a-9a4e-2e1c9f0b1d2c',
  nom: 'Espace numérique de Reims',
  adresse: '12 rue de la Paix',
  code_postal: '51100',
  code_insee: '51454',
  commune: 'Reims',
  services: 'Aide aux démarches administratives',
}

describe('lieu publié exposé à la cartographie nationale', () => {
  it.each([
    ['sans aidant déclaré', lieu],
    ['sans aidant', { ...lieu, aidants: [] }],
  ])('expose un lieu au schéma du standard %s', (_, publie) => {
    expect(lieuPublieExpose(publie)).toEqual(expose)
  })

  it('expose les aidants du lieu', () => {
    expect(lieuPublieExpose({ ...lieu, aidants: [aidant] })).toEqual({
      ...expose,
      aidants: [aidant],
    })
  })
})
