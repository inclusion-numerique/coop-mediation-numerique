import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import { conseillerNumerique } from '@app/fixtures/users/conseillerNumerique'
import { mediateurSansActivites } from '@app/fixtures/users/mediateurSansActivites'
import { rattacherAUneEmployeuseDepuisSiret } from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/implementation/prisma/rattacher-depuis-siret.mutation'
import { prismaClient } from '@app/web/prismaClient'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { importStructureEmployeuseFromProConnect } from './importStructureEmployeuseFromProConnect'

const PROCONNECT_SIRET = '11111111111111'
const OTHER_SIRET = '22222222222222'

const importer = importStructureEmployeuseFromProConnect(
  rattacherAUneEmployeuseDepuisSiret({
    geocoder: async () => null,
    signaler: () => undefined,
    etablissementDepuisSiret: async (siret) =>
      siret === PROCONNECT_SIRET
        ? {
            siret,
            raisonSociale: 'Structure ProConnect',
            ferme: false,
            voie: '1 rue du Test',
            commune: 'Paris',
            codePostal: '75001',
            codeInsee: '75101',
          }
        : null,
  }),
)

const employeusesActivesDe = async (userId: string) =>
  (
    await prismaClient.personneAffectationEmploiMain.findMany({
      where: { personne: { coopId: userId }, estActive: true },
      select: { structureAdministrativeId: true },
    })
  ).map(({ structureAdministrativeId }) => structureAdministrativeId)

describe('importStructureEmployeuseFromProConnect', () => {
  const state = { proconnectMainId: 0, otherMainId: 0 }

  beforeAll(async () => {
    await seedStructures(prismaClient)

    // Résidu d'un run précédent interrompu : la clé (siret, dénomination) est unique.
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: {
        structureAdministrative: {
          siret: { in: [PROCONNECT_SIRET, OTHER_SIRET] },
        },
      },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret: { in: [PROCONNECT_SIRET, OTHER_SIRET] } },
    })

    const proconnect = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: PROCONNECT_SIRET,
        denominationSirene: 'Structure ProConnect',
        denominationAntenne: 'Structure ProConnect',
      },
      select: { id: true },
    })
    const other = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: OTHER_SIRET,
        denominationSirene: 'Autre structure',
        denominationAntenne: 'Autre structure',
      },
      select: { id: true },
    })
    state.proconnectMainId = proconnect.id
    state.otherMainId = other.id
  })

  // Nettoyage par appartenance à la personne de test, et non par structure : les fixtures lui
  // posent aussi des affectations vers d'autres employeuses, qui empêchaient la suppression de la
  // personne — et laissaient alors les employeuses de test derrière elles, faisant échouer le
  // `beforeAll` du run suivant sur la clé (siret, dénomination).
  const nettoyerPersonnesDeTest = async () => {
    const deNosPersonnes = {
      personne: {
        coopId: { in: [mediateurSansActivites.id, conseillerNumerique.id] },
      },
    }
    await prismaClient.contratMain.deleteMany({ where: deNosPersonnes })
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: deNosPersonnes,
    })
    await prismaClient.personneMain.deleteMany({
      where: {
        coopId: { in: [mediateurSansActivites.id, conseillerNumerique.id] },
      },
    })
  }

  afterAll(async () => {
    await nettoyerPersonnesDeTest()
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: {
        structureAdministrativeId: {
          in: [state.proconnectMainId, state.otherMainId],
        },
      },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { id: { in: [state.proconnectMainId, state.otherMainId] } },
    })
  })

  beforeEach(async () => {
    await resetFixtureUser(mediateurSansActivites, false)
    // Personne + affectations réinitialisées entre chaque test (FK : affectations avant personne).
    await nettoyerPersonnesDeTest()
  })

  test('non-CN + SIRET : rattache à l’employeuse du SIRET fourni', async () => {
    const result = await importer({
      userId: mediateurSansActivites.id,
      siret: PROCONNECT_SIRET,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(false)
    expect(await employeusesActivesDe(mediateurSansActivites.id)).toEqual([
      state.proconnectMainId,
    ])
  })

  test('conseiller numerique : no-op, aucun rattachement au SIRET fourni', async () => {
    await resetFixtureUser(conseillerNumerique, false)

    const result = await importer({
      userId: conseillerNumerique.id,
      siret: PROCONNECT_SIRET,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(await employeusesActivesDe(conseillerNumerique.id)).not.toContain(
      state.proconnectMainId,
    )
  })

  test('aucun SIRET fourni : no-op', async () => {
    const result = await importer({
      userId: mediateurSansActivites.id,
      siret: null,
    })

    expect(result.success).toBe(true)
    expect(result.noOp).toBe(true)
    expect(await employeusesActivesDe(mediateurSansActivites.id)).toEqual([])
  })
})
