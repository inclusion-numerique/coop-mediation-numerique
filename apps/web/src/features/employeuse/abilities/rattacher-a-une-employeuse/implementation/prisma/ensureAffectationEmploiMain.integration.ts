import { prismaClient } from '@app/web/prismaClient'
import {
  deactivateCoopAffectationsExcept,
  ensureAffectationEmploiMain,
} from './ensureAffectationEmploiMain'

describe('ensureAffectationEmploiMain', () => {
  const ids = { personneId: 0, structureA: 0, structureB: 0 }

  beforeAll(async () => {
    const personne = await prismaClient.personneMain.create({
      data: {},
      select: { id: true },
    })
    ids.personneId = personne.id

    const structureA = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: '11111111111111',
        denominationAntenne: 'A test affectation',
        denominationSirene: 'Employeuse A test affectation',
      },
      select: { id: true },
    })
    ids.structureA = structureA.id

    const structureB = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: '22222222222222',
        denominationAntenne: 'B test affectation',
        denominationSirene: 'Employeuse B test affectation',
      },
      select: { id: true },
    })
    ids.structureB = structureB.id
  })

  afterAll(async () => {
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: { personneId: ids.personneId },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { id: { in: [ids.structureA, ids.structureB] } },
    })
    await prismaClient.personneMain.delete({ where: { id: ids.personneId } })
  })

  it('crée une affectation active puis reste idempotent (même ligne)', async () => {
    const first = await ensureAffectationEmploiMain({
      personneId: ids.personneId,
      structureAdministrativeId: ids.structureA,
    })
    const second = await ensureAffectationEmploiMain({
      personneId: ids.personneId,
      structureAdministrativeId: ids.structureA,
    })

    expect(second.id).toBe(first.id)
    const count = await prismaClient.personneAffectationEmploiMain.count({
      where: {
        personneId: ids.personneId,
        structureAdministrativeId: ids.structureA,
      },
    })
    expect(count).toBe(1)
  })

  it('désactive puis réactive la même ligne selon estActive', async () => {
    await ensureAffectationEmploiMain({
      personneId: ids.personneId,
      structureAdministrativeId: ids.structureA,
      estActive: false,
    })
    const desactivee =
      await prismaClient.personneAffectationEmploiMain.findFirstOrThrow({
        where: {
          personneId: ids.personneId,
          structureAdministrativeId: ids.structureA,
        },
        select: { estActive: true },
      })
    expect(desactivee.estActive).toBe(false)

    await ensureAffectationEmploiMain({
      personneId: ids.personneId,
      structureAdministrativeId: ids.structureA,
      estActive: true,
    })
    const reactivee =
      await prismaClient.personneAffectationEmploiMain.findFirstOrThrow({
        where: {
          personneId: ids.personneId,
          structureAdministrativeId: ids.structureA,
        },
        select: { estActive: true },
      })
    expect(reactivee.estActive).toBe(true)
  })

  it('deactivateCoopAffectationsExcept ne garde active que la structure conservée', async () => {
    await ensureAffectationEmploiMain({
      personneId: ids.personneId,
      structureAdministrativeId: ids.structureA,
      estActive: true,
    })
    await ensureAffectationEmploiMain({
      personneId: ids.personneId,
      structureAdministrativeId: ids.structureB,
      estActive: true,
    })

    await deactivateCoopAffectationsExcept({
      personneId: ids.personneId,
      keepStructureAdministrativeIds: [ids.structureB],
    })

    const actives = await prismaClient.personneAffectationEmploiMain.findMany({
      where: { personneId: ids.personneId, estActive: true },
      select: { structureAdministrativeId: true },
    })
    expect(actives).toHaveLength(1)
    expect(actives[0]?.structureAdministrativeId).toBe(ids.structureB)
  })
})
