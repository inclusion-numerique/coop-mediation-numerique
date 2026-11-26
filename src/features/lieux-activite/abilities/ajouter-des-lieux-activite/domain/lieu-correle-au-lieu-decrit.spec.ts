import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import type { LieuAMaterialiser } from '../../../domain/lieu-identite'
import type { LieuCandidatCoop } from './destination-du-lieu'
import { lieuCorreleAuLieuDecrit } from './lieu-correle-au-lieu-decrit'

const CANDIDAT = LieuId('8d9e2f4a-5b6c-4d7e-8f90-1a2b3c4d5e6f')
const supprimeLe = new Date('2026-01-15T10:00:00Z')

const decrit: LieuAMaterialiser = {
  nom: 'Association du numérique',
  adresse: '4 Rue de la Rue',
  commune: 'Lyon',
  codePostal: '69001',
  codeInsee: '69381',
  latitude: 45.767,
  longitude: 4.834,
}

const candidat = (suppression: Date | null): LieuCandidatCoop => ({
  id: CANDIDAT,
  nom: 'Association du numérique',
  adresse: '4 Rue de la Rue',
  commune: 'Lyon',
  codePostal: '69001',
  codeInsee: '69381',
  latitude: 45.767,
  longitude: 4.834,
  suppression,
})

describe('le lieu de la coop corrélé à un lieu décrit', () => {
  it.each<{
    cas: string
    candidats: readonly LieuCandidatCoop[]
    lieu: LieuAMaterialiser
    correle: LieuId | null
  }>([
    {
      cas: 'n’existe pas quand la coop ne connaît rien au même endroit',
      candidats: [],
      lieu: decrit,
      correle: null,
    },
    {
      cas: 'n’est pas cherché faute de code INSEE',
      candidats: [candidat(null)],
      lieu: { ...decrit, codeInsee: null },
      correle: null,
    },
    {
      cas: 'est le lieu actif qui désigne le même endroit',
      candidats: [candidat(null)],
      lieu: decrit,
      correle: CANDIDAT,
    },
    {
      cas: 'est aussi un lieu supprimé dont la dénomination n’est que proche',
      candidats: [candidat(supprimeLe)],
      lieu: { ...decrit, nom: 'Association du numérique Annexe' },
      correle: CANDIDAT,
    },
  ])('$cas', async ({ candidats, lieu, correle }) => {
    expect(
      await lieuCorreleAuLieuDecrit({
        lieuxAuMemeEndroit: async () => candidats,
      })({ lieu }),
    ).toEqual(success(correle))
  })
})
