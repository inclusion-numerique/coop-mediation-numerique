import { describe, expect, it } from 'vitest'
import {
  EtapeDInscription,
  Franchissement,
  type InscriptionEtat,
  Role,
  UtilisateurId,
} from '@/features/inscription/domain'
import { failure, success } from '@/libraries/result'
import { choisirProfil } from './choisir-profil'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')

const acceptationCgu = new Date('2026-01-01T10:00:00.000Z')

const maintenant = new Date('2026-02-02T09:00:00.000Z')

const nonDemarree: InscriptionEtat = { _tag: 'NonDemarree', userId }

const enCours: InscriptionEtat = {
  _tag: 'EnCours',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(acceptationCgu),
    lieuxActivite: Franchissement(null),
  },
}

const validee: InscriptionEtat = {
  _tag: 'Validee',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(acceptationCgu),
    lieuxActivite: Franchissement(acceptationCgu),
  },
  inscriptionValidee: acceptationCgu,
}

const choisirDepuis = (etat: InscriptionEtat | null) =>
  choisirProfil({
    lireLEtat: async () => etat,
    enregistrerProfilChoisi: async () => undefined,
  })

describe('choisir son profil', () => {
  it('mène un coordinateur au récapitulatif, avec un compte coordinateur et les CGU datées du choix', async () => {
    expect(
      await choisirDepuis(nonDemarree)({
        userId,
        role: Role('Coordinateur'),
        maintenant,
      }),
    ).toEqual(
      success({
        role: Role('Coordinateur'),
        etapeSuivante: EtapeDInscription('recapitulatif'),
        aEnregistrer: {
          roles: { mediateur: false, coordinateur: true },
          etat: {
            _tag: 'EnCours',
            userId,
            role: Role('Coordinateur'),
            conseillerNumerique: false,
            acceptationCgu: maintenant,
            progression: {
              structureEmployeuse: Franchissement(null),
              lieuxActivite: Franchissement(null),
            },
          },
        },
      }),
    )
  })

  it('mène un médiateur à la vérification de ses informations, avec un compte médiateur', async () => {
    expect(
      await choisirDepuis(nonDemarree)({
        userId,
        role: Role('Mediateur'),
        maintenant,
      }),
    ).toEqual(
      success({
        role: Role('Mediateur'),
        etapeSuivante: EtapeDInscription('verifier-informations'),
        aEnregistrer: {
          roles: { mediateur: true, coordinateur: false },
          etat: {
            _tag: 'EnCours',
            userId,
            role: Role('Mediateur'),
            conseillerNumerique: false,
            acceptationCgu: maintenant,
            progression: {
              structureEmployeuse: Franchissement(null),
              lieuxActivite: Franchissement(null),
            },
          },
        },
      }),
    )
  })

  it('conserve les étapes déjà franchies lors d’un nouveau choix', async () => {
    expect(
      await choisirDepuis(enCours)({
        userId,
        role: Role('Mediateur'),
        maintenant,
      }),
    ).toEqual(
      success({
        role: Role('Mediateur'),
        etapeSuivante: EtapeDInscription('lieux-activite'),
        aEnregistrer: {
          roles: { mediateur: true, coordinateur: false },
          etat: {
            _tag: 'EnCours',
            userId,
            role: Role('Mediateur'),
            conseillerNumerique: false,
            acceptationCgu: maintenant,
            progression: {
              structureEmployeuse: Franchissement(acceptationCgu),
              lieuxActivite: Franchissement(null),
            },
          },
        },
      }),
    )
  })

  it('refuse un utilisateur inconnu', async () => {
    expect(
      await choisirDepuis(null)({
        userId,
        role: Role('Mediateur'),
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'InscriptionIntrouvable', userId }))
  })

  it('refuse de choisir à nouveau un rôle sur une inscription validée', async () => {
    expect(
      await choisirDepuis(validee)({
        userId,
        role: Role('Coordinateur'),
        maintenant,
      }),
    ).toEqual(failure({ _tag: 'InscriptionDejaValidee', userId }))
  })
})
