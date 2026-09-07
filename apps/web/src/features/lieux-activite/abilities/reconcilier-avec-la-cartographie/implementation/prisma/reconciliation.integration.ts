import { deleteAll } from '@app/fixtures/seeds'
import { IdsCartographieNationale } from '@app/web/features/lieux-activite/domain/ids-cartographie-nationale'
import { SourceCartographie } from '@app/web/features/lieux-activite/domain/tracabilite'
import { prismaClient } from '@app/web/prismaClient'
import { lieuxCoopReunis } from '../../domain'
import { appliquerLaReconciliation } from './reconciliation.mutation'

const COMMON_STRUCTURE_FIELDS = {
  adresse: '12 Rue Louise Leclercq',
  codePostal: '62100',
  commune: 'Calais',
  nom: 'Anonymal',
}

const createStructureWithStaff =
  (email: string) =>
  async (
    structure: { id: string } & Partial<typeof COMMON_STRUCTURE_FIELDS>,
  ) => {
    await prismaClient.lieuInclusion.create({
      data: { ...COMMON_STRUCTURE_FIELDS, ...structure },
    })

    // Rôle employeuse (split 1a.2) : employeStructure / activite.structureEmployeuseId
    // pointent structure_administrative. SA même id que la structure (double-rôle).
    await prismaClient.structureAdministrative.create({
      data: { ...COMMON_STRUCTURE_FIELDS, ...structure, source: 'coop' },
    })

    const user = await prismaClient.user.create({ data: { email } })

    await prismaClient.employeStructure.create({
      data: { userId: user.id, structureId: structure.id, debut: new Date() },
    })

    const mediateur = await prismaClient.mediateur.create({
      data: { userId: user.id },
    })

    await prismaClient.mediateurEnActivite.create({
      data: {
        mediateurId: mediateur.id,
        structureId: structure.id,
        debut: new Date(),
      },
    })

    await prismaClient.activite.create({
      data: {
        type: 'Individuel',
        typeLieu: 'ADistance',
        mediateurId: mediateur.id,
        date: new Date(),
        duree: 60,
        structureId: structure.id,
        structureEmployeuseId: structure.id,
        accompagnementsCount: 1,
      },
    })

    return { mediateurId: mediateur.id }
  }

/** La commande, avec la lecture de l'Entrepôt remplacée par des lieux donnés. */
const reconcilier = (lieux: Parameters<typeof lieuxCoopReunis>[0]) =>
  appliquerLaReconciliation()(lieuxCoopReunis(lieux))

describe('réconciliation avec la cartographie nationale', () => {
  beforeEach(async () => {
    await deleteAll(prismaClient)
  })

  it('relie la structure coop dont l’id apparaît dans l’id composite, et remet à null les liens absents', async () => {
    const linkedId = '00efad2c-0d71-43e3-a174-9e0c2defa083'
    const staleId = 'f98724ab-93d2-46cd-bff6-1821dd6a6da7'

    await prismaClient.lieuInclusion.createMany({
      data: [
        { id: linkedId, ...COMMON_STRUCTURE_FIELDS },
        {
          id: staleId,
          ...COMMON_STRUCTURE_FIELDS,
          structureCartographieNationaleId: 'Coop-numérique_obsolete',
        },
      ],
    })

    await reconcilier([
      {
        identifiantCartographie: IdsCartographieNationale(
          `Coop-numérique_${linkedId}`,
        ),
        source: SourceCartographie('Coop numérique'),
        dateMaj: new Date('2026-01-01'),
      },
    ])

    const linked = await prismaClient.lieuInclusion.findUnique({
      where: { id: linkedId },
    })
    const stale = await prismaClient.lieuInclusion.findUnique({
      where: { id: staleId },
    })

    expect(linked?.structureCartographieNationaleId).toBe(
      `Coop-numérique_${linkedId}`,
    )
    expect(stale?.structureCartographieNationaleId).toBeNull()
  })

  it('fusionne les structures coop partageant un même id composite (relations déplacées, doublons supprimés)', async () => {
    const survivorId = '0927f824-b84d-4840-ae2e-e4a96a7a519b'
    const mergedAwayId = 'f98724ab-93d2-46cd-bff6-1821dd6a6da7'
    const compositeId = `Coop-numérique_${survivorId}__Coop-numérique_${mergedAwayId}`

    await createStructureWithStaff('survivor@coop.com')({ id: survivorId })
    await createStructureWithStaff('merged@coop.com')({ id: mergedAwayId })

    await reconcilier([
      {
        identifiantCartographie: IdsCartographieNationale(compositeId),
        source: SourceCartographie('Coop numérique'),
        dateMaj: new Date('2026-01-01'),
      },
    ])

    const structures = await prismaClient.lieuInclusion.findMany()
    const employes = await prismaClient.employeStructure.findMany()
    const activites = await prismaClient.mediateurEnActivite.findMany()

    expect(structures).toHaveLength(1)
    expect(structures[0]).toEqual(
      expect.objectContaining({
        id: survivorId,
        structureCartographieNationaleId: compositeId,
      }),
    )
    expect(employes.every((e) => e.structureId === survivorId)).toBe(true)
    expect(activites.every((a) => a.structureId === survivorId)).toBe(true)
  })

  /**
   * Le cas que la fusion précédente ne produit pas : là-bas chaque lieu a son
   * propre médiateur, donc rien à dédoublonner. Ici le même médiateur exerce
   * dans les deux lieux réunis — il s'y retrouverait deux fois.
   */
  it('ne laisse qu’un rattachement et un emploi quand la même personne fréquentait les deux lieux', async () => {
    const survivorId = '0927f824-b84d-4840-ae2e-e4a96a7a519b'
    const mergedAwayId = 'f98724ab-93d2-46cd-bff6-1821dd6a6da7'

    await prismaClient.lieuInclusion.createMany({
      data: [
        { id: survivorId, ...COMMON_STRUCTURE_FIELDS },
        { id: mergedAwayId, ...COMMON_STRUCTURE_FIELDS },
      ],
    })

    const user = await prismaClient.user.create({
      data: { email: 'des-deux-cotes@coop.com' },
    })
    const mediateur = await prismaClient.mediateur.create({
      data: { userId: user.id },
    })

    await prismaClient.employeStructure.createMany({
      data: [survivorId, mergedAwayId].map((structureId) => ({
        userId: user.id,
        structureId,
        debut: new Date(),
      })),
    })

    await prismaClient.mediateurEnActivite.createMany({
      data: [survivorId, mergedAwayId].map((structureId) => ({
        mediateurId: mediateur.id,
        structureId,
        debut: new Date(),
      })),
    })

    await reconcilier([
      {
        identifiantCartographie: IdsCartographieNationale(
          `Coop-numérique_${survivorId}__Coop-numérique_${mergedAwayId}`,
        ),
        source: SourceCartographie('Coop numérique'),
        dateMaj: new Date('2026-01-01'),
      },
    ])

    expect(await prismaClient.mediateurEnActivite.findMany()).toHaveLength(1)
    expect(await prismaClient.employeStructure.findMany()).toHaveLength(1)
  })

  it('trace la source de modification externe quand la source n’est pas coop et la date est plus récente', async () => {
    const structureId = 'a6648fed-4d21-4ca4-a25b-d5a44d8ca38a'

    await prismaClient.lieuInclusion.create({
      data: { id: structureId, ...COMMON_STRUCTURE_FIELDS },
    })

    await reconcilier([
      {
        identifiantCartographie: IdsCartographieNationale(
          `Hinaura_FablabVichy__Coop-numérique_${structureId}`,
        ),
        source: SourceCartographie('Hinaura'),
        dateMaj: new Date('2999-01-01'),
      },
    ])

    const structure = await prismaClient.lieuInclusion.findUnique({
      where: { id: structureId },
    })

    expect(structure).toEqual(
      expect.objectContaining({
        structureCartographieNationaleId: `Hinaura_FablabVichy__Coop-numérique_${structureId}`,
        derniereModificationSource: 'Hinaura',
      }),
    )
  })
})
