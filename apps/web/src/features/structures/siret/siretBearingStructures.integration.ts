import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { clearSiret, getSiretBearingStructures } from './siretBearingStructures'

// ADR-002 échange final : l'outillage SIRET ne couvre plus que les LIEUX (la qualité SIRET des
// employeurs est le job de l'Entrepôt). SIRET de test improbable en prod pour isoler notre ligne.
const LIEU_SIRET = '00000000000017'

const lieuId = v4()

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
}

const cleanup = async () => {
  await prismaClient.lieuInclusion.deleteMany({ where: { id: lieuId } })
}

describe('siretBearingStructures (lieux uniquement)', () => {
  beforeAll(async () => {
    await cleanup()
    await seed()
  })
  afterAll(cleanup)

  it('remonte un lieu portant un SIRET, source lieu', async () => {
    const structures = await getSiretBearingStructures()
    const byId = new Map(structures.map((s) => [s.id, s]))

    const lieu = byId.get(lieuId)

    expect(lieu?.source).toBe('lieu')
    expect(lieu?.siret).toBe(LIEU_SIRET)
    expect(lieu?.activitesCount).toBe(0)
  })

  it('clearSiret efface le SIRET du lieu', async () => {
    await clearSiret({ id: lieuId })

    const lieu = await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuId },
      select: { siret: true },
    })

    expect(lieu.siret).toBeNull()
  })
})
