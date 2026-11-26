import { describe, expect, it } from 'vitest'
import {
  Franchissement,
  type InscriptionEtat,
  Role,
  UtilisateurId,
} from '@/features/inscription/domain'
import { failure, success } from '@/libraries/result'
import type { RenseignerStructureEmployeusePorts } from './ports'
import { renseignerStructureEmployeuse } from './renseigner-structure-employeuse'
import type { SaisieEmployeuse } from './saisie-employeuse'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')

const acceptationCgu = new Date('2026-01-01T10:00:00.000Z')

const maintenant = new Date('2026-02-02T09:00:00.000Z')

const enCours: InscriptionEtat = {
  _tag: 'EnCours',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(null),
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

const saisie: SaisieEmployeuse = {
  siret: '13002526500013',
  denomination: 'Association du numérique',
  adresse: {
    voie: '4 rue de la Rue',
    commune: 'Lyon',
    codePostal: '69001',
    codeInsee: '69381',
  },
}

const ports: RenseignerStructureEmployeusePorts = {
  lireLEtat: async () => enCours,
  rattacherEmployeuse: async () => ({ success: true }),
  projeterEtapeFranchie: async () => undefined,
}

describe('renseigner la structure employeuse', () => {
  it('rattache l’employeuse saisie et franchit l’étape à l’instant du renseignement', async () => {
    expect(
      await renseignerStructureEmployeuse(ports)({
        command: { userId, saisie },
        maintenant,
      }),
    ).toEqual(
      success({
        saisie,
        etatFranchi: {
          _tag: 'EnCours',
          userId,
          role: Role('Mediateur'),
          conseillerNumerique: false,
          acceptationCgu,
          progression: {
            structureEmployeuse: Franchissement(maintenant),
            lieuxActivite: Franchissement(null),
          },
        },
      }),
    )
  })

  it.each<{ cas: string; etat: InscriptionEtat | null; erreur: string }>([
    {
      cas: 'refuse un utilisateur inconnu',
      etat: null,
      erreur: 'InscriptionIntrouvable',
    },
    {
      cas: 'refuse tant que le profil n’est pas choisi',
      etat: { _tag: 'NonDemarree', userId },
      erreur: 'ProfilNonChoisi',
    },
    {
      cas: 'refuse une inscription déjà validée',
      etat: validee,
      erreur: 'InscriptionDejaValidee',
    },
  ])('$cas', async ({ etat, erreur }) => {
    expect(
      await renseignerStructureEmployeuse({
        ...ports,
        lireLEtat: async () => etat,
      })({ command: { userId, saisie }, maintenant }),
    ).toEqual(failure({ _tag: erreur, userId }))
  })

  it('refuse quand l’employeuse n’a pas pu être rattachée', async () => {
    expect(
      await renseignerStructureEmployeuse({
        ...ports,
        rattacherEmployeuse: async () => ({ success: false }),
      })({ command: { userId, saisie }, maintenant }),
    ).toEqual(failure({ _tag: 'EmployeuseIndisponible', userId }))
  })
})
