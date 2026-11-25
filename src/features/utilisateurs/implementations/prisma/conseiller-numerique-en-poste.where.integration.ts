import { v4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { enPosteWhere } from './conseiller-numerique-en-poste.where'

describe('enPosteWhere', () => {
  const avecIdposteActive = v4()
  const avecIdposteDesactivee = v4()
  const avecCoopSeulement = v4()
  const sansPersonne = v4()

  const tous = [
    avecIdposteActive,
    avecIdposteDesactivee,
    avecCoopSeulement,
    sansPersonne,
  ]

  const state = { employeuseId: 0 }

  const seedUtilisateur = (id: string) =>
    prismaClient.user.create({
      data: { id, email: `dispositif+${id}@test.gouv.fr`, isFixture: true },
      select: { id: true },
    })

  const seedAffectation = async (
    coopId: string,
    source: string,
    estActive: boolean,
  ) => {
    const personne = await prismaClient.personneMain.create({
      data: { coopId },
      select: { id: true },
    })
    await prismaClient.personneAffectationEmploiMain.create({
      data: {
        personneId: personne.id,
        structureAdministrativeId: state.employeuseId,
        source,
        estActive,
      },
    })
  }

  const filtres = async (releveDuDispositif: boolean): Promise<string[]> => {
    const users = await prismaClient.user.findMany({
      where: {
        id: { in: tous },
        ...enPosteWhere(releveDuDispositif),
      },
      select: { id: true },
      orderBy: { email: 'asc' },
    })
    return users.map(({ id }) => id)
  }

  beforeAll(async () => {
    const employeuse = await prismaClient.structureAdministrativeMain.create({
      data: { denominationAntenne: `Dispositif ${v4()}` },
      select: { id: true },
    })
    state.employeuseId = employeuse.id

    await Promise.all(tous.map((id) => seedUtilisateur(id)))

    await seedAffectation(avecIdposteActive, 'idposte', true)
    await seedAffectation(avecIdposteDesactivee, 'idposte', false)
    await seedAffectation(avecCoopSeulement, 'coop', true)
  })

  afterAll(async () => {
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

  it('ne retient que l’affectation idposte active', async () => {
    expect(await filtres(true)).toEqual([avecIdposteActive])
  })
  it('exclut une affectation idposte désactivée', async () => {
    expect(await filtres(true)).not.toContain(avecIdposteDesactivee)
  })

  it('ne confond pas le déclaratif coop avec le dispositif', async () => {
    expect(await filtres(true)).not.toContain(avecCoopSeulement)
  })

  it('range tout le reste hors dispositif, personne absente comprise', async () => {
    const horsDispositif = await filtres(false)

    expect(horsDispositif).toContain(sansPersonne)
    expect(horsDispositif).toContain(avecIdposteDesactivee)
    expect(horsDispositif).toContain(avecCoopSeulement)
    expect(horsDispositif).not.toContain(avecIdposteActive)
  })
  it('partitionne l’ensemble des comptes', async () => {
    const dans = await filtres(true)
    const hors = await filtres(false)

    expect([...dans, ...hors].toSorted()).toEqual(tous.toSorted())
  })
})
