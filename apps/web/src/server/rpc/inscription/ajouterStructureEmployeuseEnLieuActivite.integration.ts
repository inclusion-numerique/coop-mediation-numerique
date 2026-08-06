import { prismaClient } from '@app/web/prismaClient'
import { inscriptionRouter } from '@app/web/server/rpc/inscription/inscriptionRouter'
import { createTestContext } from '@app/web/test/createTestContext'
import { testSessionUser } from '@app/web/test/testSessionUser'
import { v4 } from 'uuid'

describe('inscriptionRouter.ajouterStructureEmployeuseEnLieuActivite', () => {
  const utilisateurId = v4()
  const collegueId = v4()
  const mediateurId = v4()
  const mediateurCollegueId = v4()

  // L'employeuse est une `main.structure_administrative` (ADR-002) : le lieu est matérialisé
  // depuis ses données main (nom via la denomination, adresse via la relation `main.adresse`).
  const employeuse = {
    nom: 'Employeuse lieu d’activité',
    adresse: '12 rue de la Réconciliation',
    commune: 'Nantes',
    codePostal: '44000',
    codeInsee: '44109',
    siret: '13002526500013',
  }

  // Le lieu matérialisé ne porte aucun lien vers l'employeuse : on le retrouve par la
  // clé de corrélation de l'application (nom + adresse + code INSEE).
  const lieuCorrele = {
    nom: employeuse.nom,
    adresse: employeuse.adresse,
    codeInsee: employeuse.codeInsee,
  }

  // Ids main auto-incrémentés, captés à la création (pas de `let`).
  const main: { adresseId: number; structureId: number } = {
    adresseId: 0,
    structureId: 0,
  }

  const utilisateur = (id: string) => ({
    id,
    email: `test+${id}@inclusion-numerique.anct.gouv.fr`,
    profilInscription: 'Mediateur' as const,
    acceptationCgu: new Date(),
    structureEmployeuseRenseignee: new Date(),
  })

  beforeAll(async () => {
    await prismaClient.user.createMany({
      data: [utilisateur(utilisateurId), utilisateur(collegueId)],
    })
    await prismaClient.mediateur.createMany({
      data: [
        { id: mediateurId, userId: utilisateurId },
        { id: mediateurCollegueId, userId: collegueId },
      ],
    })

    const adresse = await prismaClient.adresseMain.create({
      data: {
        numeroVoie: 12,
        nomVoie: 'rue de la Réconciliation',
        nomCommune: employeuse.commune,
        codePostal: employeuse.codePostal,
        codeInsee: employeuse.codeInsee,
      },
      select: { id: true },
    })
    main.adresseId = adresse.id

    const structure = await prismaClient.structureAdministrativeMain.create({
      data: {
        denominationSirene: employeuse.nom,
        siret: employeuse.siret,
        adresseId: adresse.id,
      },
      select: { id: true },
    })
    main.structureId = structure.id
  })

  afterAll(async () => {
    await prismaClient.mediateurEnActivite.deleteMany({
      where: { mediateurId: { in: [mediateurId, mediateurCollegueId] } },
    })
    await prismaClient.lieuInclusion.deleteMany({ where: lieuCorrele })
    await prismaClient.structureAdministrativeMain.delete({
      where: { id: main.structureId },
    })
    await prismaClient.adresseMain.delete({ where: { id: main.adresseId } })
    await prismaClient.mediateur.deleteMany({
      where: { id: { in: [mediateurId, mediateurCollegueId] } },
    })
    await prismaClient.mutation.deleteMany({
      where: { userId: { in: [utilisateurId, collegueId] } },
    })
    await prismaClient.user.deleteMany({
      where: { id: { in: [utilisateurId, collegueId] } },
    })
  })

  const declarerPour = (userId: string) => (estLieuActivite: boolean) =>
    inscriptionRouter
      .createCaller(
        createTestContext({
          user: {
            ...testSessionUser,
            id: userId,
            emailVerified: new Date().toISOString(),
          },
        }),
      )
      .ajouterStructureEmployeuseEnLieuActivite({
        userId,
        estLieuActivite,
        structureEmployeuseId: main.structureId,
      })

  const declarer = declarerPour(utilisateurId)

  it('matérialise un lieu portant les données main de l’employeuse, sans en reprendre l’id', async () => {
    await declarer(true)

    const lieu = await prismaClient.lieuInclusion.findFirstOrThrow({
      where: lieuCorrele,
      select: {
        nom: true,
        adresse: true,
        commune: true,
        codePostal: true,
        codeInsee: true,
        siret: true,
      },
    })

    expect(lieu).toMatchObject({
      nom: employeuse.nom,
      adresse: employeuse.adresse,
      commune: employeuse.commune,
      codePostal: employeuse.codePostal,
      codeInsee: employeuse.codeInsee,
      siret: employeuse.siret,
    })
  })

  it('ne recrée ni le lieu ni le rattachement quand la déclaration est rejouée', async () => {
    const premier = await declarer(true)
    const second = await declarer(true)

    expect(second).toEqual(premier)

    const lieux = await prismaClient.lieuInclusion.count({
      where: lieuCorrele,
    })
    const rattachements = await prismaClient.mediateurEnActivite.count({
      where: { mediateurId, suppression: null, fin: null },
    })

    expect(lieux).toBe(1)
    expect(rattachements).toBe(1)
  })

  it('partage le même lieu entre deux médiateurs de la même employeuse', async () => {
    await declarer(true)
    await declarerPour(collegueId)(true)

    const lieux = await prismaClient.lieuInclusion.count({
      where: lieuCorrele,
    })
    const rattachements = await prismaClient.mediateurEnActivite.findMany({
      where: {
        mediateurId: { in: [mediateurId, mediateurCollegueId] },
        suppression: null,
        fin: null,
      },
      select: { structureId: true },
    })

    expect(lieux).toBe(1)
    expect(rattachements).toHaveLength(2)
    expect(
      new Set(rattachements.map(({ structureId }) => structureId)).size,
    ).toBe(1)
  })

  it('clôture le rattachement quand l’employeuse n’est plus déclarée lieu d’activité', async () => {
    await declarer(true)
    await declarer(false)

    const actifs = await prismaClient.mediateurEnActivite.count({
      where: { mediateurId, suppression: null, fin: null },
    })

    expect(actifs).toBe(0)
  })
})
