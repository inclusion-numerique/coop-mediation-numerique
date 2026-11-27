import {
  CodeInsee,
  CodePostal,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { BanId } from '@/features/lieux-activite/domain/identifiants/ban-id'
import { success } from '@/libraries/result'
import type { DestinationDuLieu, LieuCandidatCoop } from './destination-du-lieu'
import { destinationDuLieuDecrit } from './destination-du-lieu-decrit'
import { LieuId } from './identifiants/lieu-id'
import type { LieuDecrit } from './lieu-decrit'

const CANDIDAT = LieuId('8d9e2f4a-5b6c-4d7e-8f90-1a2b3c4d5e6f')
const NOUVEAU = LieuId('6f1e2d3c-4b5a-4987-8a6b-5c4d3e2f1a0b')
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

const annexe: LieuDecrit = {
  ...decrit,
  nom: Nom('Association du numérique Annexe'),
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

describe('la destination d’un lieu décrit', () => {
  it.each<{
    cas: string
    candidats: readonly LieuCandidatCoop[]
    lieu: LieuDecrit
    destination: DestinationDuLieu<LieuDecrit>
  }>([
    {
      cas: 'est un lieu à créer quand la coop ne connaît rien au même endroit',
      candidats: [],
      lieu: decrit,
      destination: { _tag: 'LieuACreer', id: NOUVEAU, creation: decrit },
    },
    {
      cas: 'est un lieu à créer pour un lieu déclaré sans voie ni position que la coop ne connaît pas',
      candidats: [],
      lieu: declare,
      destination: { _tag: 'LieuACreer', id: NOUVEAU, creation: declare },
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
