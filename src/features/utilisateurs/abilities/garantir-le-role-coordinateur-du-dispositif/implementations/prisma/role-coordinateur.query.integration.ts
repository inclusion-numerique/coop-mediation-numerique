import { v4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { enPosteWhere } from '@/features/utilisateurs/implementations/prisma/conseiller-numerique-en-poste.where'
import { garantirLeRoleCoordinateurDuDispositif } from '../../domain/garantir-le-role-coordinateur-du-dispositif'
import { creerLeRoleCoordinateur } from './creer-le-role-coordinateur.mutation'
import {
  aLeRoleCoordinateur,
  coordonneDansLeDispositif,
} from './role-coordinateur.query'

const garantir = (utilisateurId: string) =>
  garantirLeRoleCoordinateurDuDispositif({
    aLeRoleCoordinateur,
    coordonneDansLeDispositif,
    creerLeRoleCoordinateur: creerLeRoleCoordinateur(async () => undefined),
  })({ utilisateurId })

describe('le rôle coordinateur et le filtre en poste, lus dans le dispositif', () => {
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

  describe('la garantie du rôle coordinateur', () => {
    it('crée la ligne coop, puis ne la recrée pas', async () => {
      expect(await garantir(coordinateur)).toEqual({
        success: true,
        data: { _tag: 'RoleCree', utilisateurId: coordinateur },
      })
      expect(await garantir(coordinateur)).toEqual({
        success: true,
        data: { _tag: 'DejaCoordinateur' },
      })
    })

    it('ne crée rien pour qui ne coordonne pas dans le dispositif', async () => {
      expect(await garantir(conseiller)).toEqual({
        success: true,
        data: { _tag: 'HorsDuDispositif' },
      })
      expect(await garantir(horsDispositif)).toEqual({
        success: true,
        data: { _tag: 'HorsDuDispositif' },
      })
    })
  })

  it('le filtre range chaque compte d’un seul côté', async () => {
    const dans = await prismaClient.user.findMany({
      where: { id: { in: tous }, ...enPosteWhere(true) },
      select: { id: true },
    })
    const hors = await prismaClient.user.findMany({
      where: { id: { in: tous }, ...enPosteWhere(false) },
      select: { id: true },
    })

    expect([...dans, ...hors].map(({ id }) => id).toSorted()).toEqual(
      tous.toSorted(),
    )
    expect(dans.map(({ id }) => id).toSorted()).toEqual(
      [conseiller, coordinateur].toSorted(),
    )
  })
})
