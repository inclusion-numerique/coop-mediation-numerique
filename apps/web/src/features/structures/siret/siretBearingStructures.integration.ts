import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import {
  alignEmployeuseIdentity,
  clearSiret,
  getSiretBearingStructures,
} from './siretBearingStructures'

// SIRET de test improbables en prod, pour isoler nos lignes dans la vue unifiée.
const LIEU_SIRET = '00000000000017'
const EMPLOYEUSE_SIRET = '00000000000024'

const lieuId = v4()
const employeuseId = v4()

const seed = async () => {
  await prismaClient.lieuInclusion.create({
    data: {
      id: lieuId,
      nom: 'Lieu Test SIRET',
      adresse: '1 rue du Lieu',
      commune: 'Paris',
      codePostal: '75001',
      codeInsee: '75056',
      siret: LIEU_SIRET,
    },
  })
  await prismaClient.structureAdministrative.create({
    data: {
      id: employeuseId,
      nom: 'Employeuse Test SIRET',
      adresse: '2 rue de l’Employeuse',
      commune: 'Lyon',
      codePostal: '69001',
      codeInsee: '69381',
      siret: EMPLOYEUSE_SIRET,
      source: 'coop',
    },
  })
}

const cleanup = async () => {
  await prismaClient.lieuInclusion.deleteMany({ where: { id: lieuId } })
  await prismaClient.structureAdministrative.deleteMany({
    where: { id: employeuseId },
  })
}

describe('siretBearingStructures (vue unifiée lieu + employeuse)', () => {
  beforeAll(async () => {
    await cleanup()
    await seed()
  })
  afterAll(cleanup)

  it('remonte un lieu ET une employeuse, chacun avec sa source', async () => {
    const structures = await getSiretBearingStructures()
    const byId = new Map(structures.map((s) => [s.id, s]))

    const lieu = byId.get(lieuId)
    const employeuse = byId.get(employeuseId)

    expect(lieu?.source).toBe('lieu')
    expect(lieu?.siret).toBe(LIEU_SIRET)
    // Contexte lieu présent, concepts lieu renseignés (0 par défaut ici).
    expect(lieu?.activitesCount).toBe(0)

    expect(employeuse?.source).toBe('employeuse')
    expect(employeuse?.siret).toBe(EMPLOYEUSE_SIRET)
    // Concepts lieu absents côté employeuse.
    expect(employeuse?.activitesCount).toBeNull()
    expect(employeuse?.mediateursCount).toBeNull()
  })

  it('clearSiret efface le SIRET dans la bonne table selon la source', async () => {
    await clearSiret({ id: lieuId, source: 'lieu' })

    const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuId },
      select: { siret: true },
    })
    const employeuse =
      await prismaClient.structureAdministrative.findUniqueOrThrow({
        where: { id: employeuseId },
        select: { siret: true },
      })

    expect(lieu.siret).toBeNull()
    // L'employeuse n'est pas touchée par un clear ciblé sur le lieu.
    expect(employeuse.siret).toBe(EMPLOYEUSE_SIRET)
  })

  it("alignEmployeuseIdentity écrit l'identité légale sur l'employeuse", async () => {
    await alignEmployeuseIdentity(employeuseId, {
      nom: 'RAISON SOCIALE SIRENE',
      adresse: '10 avenue Légale',
      commune: 'Lyon',
      codePostal: '69002',
      codeInsee: '69382',
    })

    const employeuse =
      await prismaClient.structureAdministrative.findUniqueOrThrow({
        where: { id: employeuseId },
        select: { nom: true, adresse: true, synchronisationSiret: true },
      })

    expect(employeuse.nom).toBe('RAISON SOCIALE SIRENE')
    expect(employeuse.adresse).toBe('10 avenue Légale')
    expect(employeuse.synchronisationSiret).not.toBeNull()
  })
})
