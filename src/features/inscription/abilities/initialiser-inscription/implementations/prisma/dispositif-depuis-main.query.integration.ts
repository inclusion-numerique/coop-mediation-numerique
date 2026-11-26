import { v4 } from 'uuid'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import {
  profilDepuisDispositif,
  UtilisateurId,
} from '@/features/inscription/domain'
import { dispositifDepuisMain } from './dispositif-depuis-main.query'

describe('le profil d’inscription déduit du dispositif', () => {
  const conseiller = UtilisateurId(v4())
  const horsDispositif = UtilisateurId(v4())
  const coordinateur = UtilisateurId(v4())

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

  it('déduit conseiller numérique', async () => {
    const dispositif = await dispositifDepuisMain(conseiller)

    expect(dispositif).toEqual({
      connue: true,
      estConseillerNumerique: true,
      estCoordinateur: false,
    })
    expect(profilDepuisDispositif(dispositif)).toBe('ConseillerNumerique')
  })

  it('déduit coordinateur conseiller numérique', async () => {
    expect(
      profilDepuisDispositif(await dispositifDepuisMain(coordinateur)),
    ).toBe('CoordinateurConseillerNumerique')
  })

  it('ne tient pas pour connue une ligne déclarée par la Coop seule', async () => {
    const dispositif = await dispositifDepuisMain(horsDispositif)

    expect(dispositif.connue).toBe(false)
    expect(profilDepuisDispositif(dispositif)).toBeNull()
  })

  it('ne déduit aucun profil d’une personne inconnue de main', async () => {
    const dispositif = await dispositifDepuisMain(UtilisateurId(v4()))

    expect(dispositif.connue).toBe(false)
    expect(profilDepuisDispositif(dispositif)).toBeNull()
  })

  it('distingue le coordinateur du dispositif du simple conseiller', async () => {
    const duCoordinateur = await dispositifDepuisMain(coordinateur)
    const duConseiller = await dispositifDepuisMain(conseiller)

    expect(profilDepuisDispositif(duCoordinateur)).toBe(
      'CoordinateurConseillerNumerique',
    )
    expect(profilDepuisDispositif(duConseiller)).toBe('ConseillerNumerique')
  })
})
