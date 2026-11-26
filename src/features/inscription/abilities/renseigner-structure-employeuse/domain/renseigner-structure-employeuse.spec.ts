import { describe, expect, it } from 'vitest'
import {
  Franchissement,
  type InscriptionEtat,
  Role,
  UtilisateurId,
} from '@/features/inscription/domain'
import { renseignerStructureEmployeuse } from './renseigner-structure-employeuse'
import type { StructureEmployeuseInput } from './structure-employeuse-input'

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

const structureEmployeuse: StructureEmployeuseInput = {
  siret: '13002526500013',
  nom: 'Association du numérique',
  adresse: '4 rue de la Rue',
  commune: 'Lyon',
  codePostal: '69001',
  codeInsee: '69381',
}

const renseigner = ({
  etat,
  rattachement,
}: {
  readonly etat: InscriptionEtat | null
  readonly rattachement: string
}) =>
  renseignerStructureEmployeuse({
    lireLEtat: async () => etat,
    rattacherEmployeuse: async () => ({ _tag: rattachement }),
    projeterEtapeFranchie: async () => undefined,
  })({ command: { userId, structureEmployeuse }, maintenant })

describe('renseignerStructureEmployeuse', () => {
  it('franchit l’étape quand l’employeuse est rattachée', async () => {
    expect(
      await renseigner({ etat: enCours, rattachement: 'rattachee' }),
    ).toEqual({ success: true, data: undefined })
  })

  it.each<{
    cas: string
    etat: InscriptionEtat | null
    rattachement: string
    erreur: string
  }>([
    {
      cas: 'refuse un utilisateur inconnu',
      etat: null,
      rattachement: 'rattachee',
      erreur: 'InscriptionIntrouvable',
    },
    {
      cas: 'refuse tant que le profil n’est pas choisi',
      etat: { _tag: 'NonDemarree', userId },
      rattachement: 'rattachee',
      erreur: 'ProfilNonChoisi',
    },
    {
      cas: 'refuse une inscription déjà validée',
      etat: validee,
      rattachement: 'rattachee',
      erreur: 'InscriptionDejaValidee',
    },
    {
      cas: 'refuse quand l’employeuse n’a pas pu être rattachée',
      etat: enCours,
      rattachement: 'indisponible',
      erreur: 'EmployeuseIndisponible',
    },
  ])('$cas', async ({ etat, rattachement, erreur }) => {
    expect(await renseigner({ etat, rattachement })).toEqual({
      success: false,
      error: { _tag: erreur, userId },
    })
  })
})
