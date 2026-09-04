import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { lireLesLieuxASiret } from './lieux-a-siret.query'
import { effacerLeSiret, marquerLeSiretVerifie } from './siret-du-lieu.mutation'

// La lecture balaie toute la table : un SIRET improbable en production isole
// notre ligne au milieu des autres.
const SIRET = '00000000000017'

const lieuId = v4()

const lieuSeme = async () => {
  const lieux = await lireLesLieuxASiret()
  return lieux.find(({ id }) => id === lieuId)
}

const nettoyer = () =>
  prismaClient.lieuInclusion.deleteMany({ where: { id: lieuId } })

describe('les lieux qui portent un SIRET', () => {
  beforeAll(async () => {
    await nettoyer()
    await prismaClient.lieuInclusion.create({
      data: {
        id: lieuId,
        nom: 'Lieu Test SIRET',
        adresse: '1 rue du Lieu',
        commune: 'Paris',
        codePostal: '75001',
        codeInsee: '75056',
        siret: SIRET,
      },
    })
  })

  afterAll(nettoyer)

  it('remonte un lieu portant un SIRET, jamais confronté', async () => {
    const lieu = await lieuSeme()

    expect(lieu?.siret).toBe(SIRET)
    expect(lieu?.nom).toBe('Lieu Test SIRET')
    expect(lieu?.adresse).toBe('1 rue du Lieu')
    expect(lieu?.synchronisation).toBeNull()
  })

  it('date la confrontation sans toucher au SIRET ni au nom', async () => {
    const lieu = await lieuSeme()
    if (lieu == null) throw new Error('Le lieu semé devrait être lisible')

    await marquerLeSiretVerifie(lieu)

    const apres = await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuId },
      select: { siret: true, nom: true, synchronisationSiret: true },
    })

    expect(apres.siret).toBe(SIRET)
    expect(apres.nom).toBe('Lieu Test SIRET')
    expect(apres.synchronisationSiret).not.toBeNull()
  })

  it('efface le SIRET et la date de confrontation avec lui', async () => {
    const lieu = await lieuSeme()
    if (lieu == null) throw new Error('Le lieu semé devrait être lisible')

    await effacerLeSiret(lieu)

    const apres = await prismaClient.lieuInclusion.findUniqueOrThrow({
      where: { id: lieuId },
      select: { siret: true, nom: true, synchronisationSiret: true },
    })

    expect(apres.siret).toBeNull()
    expect(apres.synchronisationSiret).toBeNull()
    expect(apres.nom).toBe('Lieu Test SIRET')
  })

  it('ne remonte plus un lieu dont le SIRET a été effacé', async () => {
    expect(await lieuSeme()).toBeUndefined()
  })
})
