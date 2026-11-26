import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import {
  CoordinateurId,
  MediateurId,
  PERIMETRE_NATIONAL,
  type PerimetreDesStatistiques,
} from '../../../domain'
import type { MediateurAvecCrasV1 } from './ports'
import { PresenceDeCrasV1 } from './presence-de-cras-v1'
import { verifierLaPresenceDeCrasV1 } from './verifier-la-presence-de-cras-v1'

const mediateur = MediateurId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e01')

describe('vérifier la présence de CRA v1', () => {
  it.each<{
    readonly cas: string
    readonly perimetre: PerimetreDesStatistiques
    readonly mediateurAvecCrasV1: MediateurAvecCrasV1
    readonly attendue: PresenceDeCrasV1
  }>([
    {
      cas: 'en trouve chez un médiateur qui a importé des CRA v1',
      perimetre: { type: 'Mediateur', mediateur },
      mediateurAvecCrasV1: async () => true,
      attendue: PresenceDeCrasV1('Presents'),
    },
    {
      cas: 'n’en trouve pas chez un médiateur qui n’en a pas importé',
      perimetre: { type: 'Mediateur', mediateur },
      mediateurAvecCrasV1: async () => false,
      attendue: PresenceDeCrasV1('Absents'),
    },
    {
      cas: 'en présume dans une équipe, sans regarder ses membres',
      perimetre: {
        type: 'Equipe',
        coordinateur: CoordinateurId('9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d'),
        membres: [mediateur],
      },
      mediateurAvecCrasV1: async () => false,
      attendue: PresenceDeCrasV1('Presents'),
    },
    {
      cas: 'en présume à l’échelle nationale',
      perimetre: PERIMETRE_NATIONAL,
      mediateurAvecCrasV1: async () => false,
      attendue: PresenceDeCrasV1('Presents'),
    },
  ])('$cas', async ({ perimetre, mediateurAvecCrasV1, attendue }) => {
    expect(
      await verifierLaPresenceDeCrasV1({ mediateurAvecCrasV1 })({ perimetre }),
    ).toEqual(success(attendue))
  })
})
