import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import type { LieuAMaterialiser } from '../../../domain/lieu-identite'
import type { DestinationDuLieu, LieuCandidatCoop } from './destination-du-lieu'
import { destinationDuLieuDecrit } from './destination-du-lieu-decrit'

const CANDIDAT = LieuId('8d9e2f4a-5b6c-4d7e-8f90-1a2b3c4d5e6f')
const NOUVEAU = LieuId('6f1e2d3c-4b5a-4987-8a6b-5c4d3e2f1a0b')
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

const sansCodeInsee: LieuAMaterialiser = { ...decrit, codeInsee: null }

const annexe: LieuAMaterialiser = {
  ...decrit,
  nom: 'Association du numérique Annexe',
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

describe('la destination d’un lieu décrit', () => {
  it.each<{
    cas: string
    candidats: readonly LieuCandidatCoop[]
    lieu: LieuAMaterialiser
    destination: DestinationDuLieu<LieuAMaterialiser>
  }>([
    {
      cas: 'est un lieu à créer quand la coop ne connaît rien au même endroit',
      candidats: [],
      lieu: decrit,
      destination: { _tag: 'LieuACreer', id: NOUVEAU, creation: decrit },
    },
    {
      cas: 'est un lieu à créer, sans chercher au même endroit, faute de code INSEE',
      candidats: [candidat(null)],
      lieu: sansCodeInsee,
      destination: {
        _tag: 'LieuACreer',
        id: NOUVEAU,
        creation: sansCodeInsee,
      },
    },
    {
      cas: 'est le lieu actif de la coop qui désigne le même endroit',
      candidats: [candidat(null)],
      lieu: decrit,
      destination: { _tag: 'LieuActif', id: CANDIDAT },
    },
    {
      cas: 'est le lieu supprimé à relever quand sa dénomination est identique',
      candidats: [candidat(supprimeLe)],
      lieu: decrit,
      destination: { _tag: 'LieuARelever', id: CANDIDAT },
    },
    {
      cas: 'est un lieu à créer quand le lieu supprimé n’a qu’une dénomination proche',
      candidats: [candidat(supprimeLe)],
      lieu: annexe,
      destination: { _tag: 'LieuACreer', id: NOUVEAU, creation: annexe },
    },
  ])('$cas', async ({ candidats, lieu, destination }) => {
    expect(
      await destinationDuLieuDecrit({
        lieuxAuMemeEndroit: async () => candidats,
        nouvelIdentifiantDeLieu: () => NOUVEAU,
      })({ lieu }),
    ).toEqual(success(destination))
  })
})
