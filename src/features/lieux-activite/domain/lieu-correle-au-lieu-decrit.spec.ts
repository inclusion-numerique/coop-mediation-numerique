import {
  CodeInsee,
  CodePostal,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { BanId } from '@/features/lieux-activite/domain/identifiants/ban-id'
import { success } from '@/libraries/result'
import type { LieuCandidatCoop } from './destination-du-lieu'
import { LieuId } from './identifiants/lieu-id'
import { lieuCorreleAuLieuDecrit } from './lieu-correle-au-lieu-decrit'
import type { LieuDecrit } from './lieu-decrit'

const CANDIDAT = LieuId('8d9e2f4a-5b6c-4d7e-8f90-1a2b3c4d5e6f')
const supprimeLe = new Date('2026-01-15T10:00:00Z')

const decrit: LieuDecrit = {
  nom: Nom('Association du numérique'),
  adresse: {
    _tag: 'AdresseGeocodee',
    voie: '4 Rue de la Rue',
    commune: 'Lyon',
    codePostal: CodePostal('69001'),
    codeInsee: CodeInsee('69381'),
    banId: BanId('69381_1234_00004'),
    latitude: 45.767,
    longitude: 4.834,
  },
  siret: null,
  synchronisationSiret: null,
  rna: null,
  nomReferent: null,
  courrielReferent: null,
  telephoneReferent: null,
}

const declare: LieuDecrit = {
  ...decrit,
  adresse: {
    _tag: 'AdresseDeclaree',
    voie: null,
    commune: 'Lyon',
    codePostal: CodePostal('69001'),
    codeInsee: CodeInsee('69381'),
  },
}

const candidat = (suppression: Date | null): LieuCandidatCoop => ({
  id: CANDIDAT,
  nom: 'Association du numérique',
  adresse: '4 Rue de la Rue',
  commune: 'Lyon',
  codePostal: CodePostal('69001'),
  codeInsee: CodeInsee('69381'),
  latitude: 45.767,
  longitude: 4.834,
  suppression,
})

describe('le lieu de la coop corrélé à un lieu décrit', () => {
  it.each<{
    cas: string
    candidats: readonly LieuCandidatCoop[]
    lieu: LieuDecrit
    correle: LieuId | null
  }>([
    {
      cas: 'n’existe pas quand la coop ne connaît rien au même endroit',
      candidats: [],
      lieu: decrit,
      correle: null,
    },
    {
      cas: 'n’existe pas pour un lieu déclaré sans voie ni position, que rien ne rapproche',
      candidats: [candidat(null)],
      lieu: declare,
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
      lieu: { ...decrit, nom: Nom('Association du numérique Annexe') },
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
