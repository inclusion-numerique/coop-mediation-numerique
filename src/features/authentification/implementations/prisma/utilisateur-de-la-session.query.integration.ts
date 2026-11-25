import { v4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { serializePrismaSessionUser } from '../session/serialize-prisma-session-user.transfer'
import { utilisateurDeLaSessionSelect } from './utilisateur-de-la-session.select'

describe('le drapeau conseiller numérique de la session', () => {
  const conseiller = v4()
  const horsDispositif = v4()
  const coordinateur = v4()

  const tous = [conseiller, horsDispositif, coordinateur]
  const state = { employeuseId: 0 }

  const seedUtilisateur = (id: string) =>
    prismaClient.user.create({
      data: { id, email: `dispositif+${id}@test.gouv.fr`, isFixture: true },
      select: { id: true },
    })

  const seedPersonne = (coopId: string, estCoordinateur: boolean) =>
    prismaClient.personneMain.create({
      data: { coopId, isCoordinateur: estCoordinateur },
      select: { id: true },
    })

  const seedAffectation = (personneId: number, source: string) =>
    prismaClient.personneAffectationEmploiMain.create({
      data: {
        personneId,
        structureAdministrativeId: state.employeuseId,
        source,
        estActive: true,
      },
    })

  beforeAll(async () => {
    const employeuse = await prismaClient.structureAdministrativeMain.create({
      data: { denominationAntenne: `Dispositif ${v4()}` },
      select: { id: true },
    })
    state.employeuseId = employeuse.id

    await Promise.all(tous.map((id) => seedUtilisateur(id)))

    const personneConseiller = await seedPersonne(conseiller, false)
    await seedAffectation(personneConseiller.id, 'idposte')

    const personneHors = await seedPersonne(horsDispositif, false)
    await seedAffectation(personneHors.id, 'coop')

    const personneCoordinateur = await seedPersonne(coordinateur, true)
    await seedAffectation(personneCoordinateur.id, 'idposte')
  })

  afterAll(async () => {
    await prismaClient.mediateur.deleteMany({ where: { userId: { in: tous } } })
    await prismaClient.coordinateur.deleteMany({
      where: { userId: { in: tous } },
    })
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: { structureAdministrativeId: state.employeuseId },
    })
    await prismaClient.personneMain.deleteMany({
      where: { coopId: { in: tous } },
    })
    await prismaClient.user.deleteMany({ where: { id: { in: tous } } })
    await prismaClient.structureAdministrativeMain.delete({
      where: { id: state.employeuseId },
    })
  })

  const sessionDe = async (userId: string) =>
    serializePrismaSessionUser(
      await prismaClient.user.findUniqueOrThrow({
        where: { id: userId },
        select: utilisateurDeLaSessionSelect,
      }),
    )

  it('est vrai pour une affectation idposte active', async () => {
    expect((await sessionDe(conseiller)).isConseillerNumerique).toBe(true)
  })

  it('est faux pour une affectation coop seule', async () => {
    expect((await sessionDe(horsDispositif)).isConseillerNumerique).toBe(false)
  })
})
