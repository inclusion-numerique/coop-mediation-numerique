import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  detacherDuLieuDecrit,
  type LieuDecrit,
  rattacherAuLieuDecrit,
} from './abilities/ajouter-des-lieux-activite/implementations/prisma/rattacher-au-lieu-decrit'
import {
  effacerDuRegistre,
  suivreLeLieu,
  utilisateurCourant,
} from './lieux-activite.cucumber'

const etat: {
  nom: string
  utilisateurs: string[]
  lieuConnuId?: string
  commune?: string
} = { nom: '', utilisateurs: [] }

const lieuDecrit = (nom: string): LieuDecrit => ({
  nom,
  adresse: '1 Rue de la Paix',
  commune: 'Paris',
  codePostal: '75001',
  codeInsee: '75101',
  banId: '75101_7038_00001',
  latitude: 48.869_36,
  longitude: 2.331_08,
  complementAdresse: null,
  siret: null,
  synchronisationSiret: null,
  rna: null,
  nomReferent: null,
  courrielReferent: null,
  telephoneReferent: null,
})

const semerUnMediateur = async (): Promise<string> => {
  const utilisateurId = v4()
  await prismaClient.user.create({
    data: {
      id: utilisateurId,
      email: `lieu-decrit-${utilisateurId}@example.com`,
    },
  })
  await prismaClient.mediateur.create({ data: { userId: utilisateurId } })
  etat.utilisateurs.push(utilisateurId)
  return utilisateurId
}

const rattacher = async (utilisateurId: string, nom = etat.nom) =>
  rattacherAuLieuDecrit({
    userId: utilisateurId,
    lieu: lieuDecrit(nom),
    trace: { userId: utilisateurId },
  })

const rattachementsActifs = (utilisateurId: string) =>
  prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: utilisateurId },
      lieuInclusion: { nom: etat.nom },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })

const lieuxNommes = () =>
  prismaClient.lieuInclusion.findMany({
    where: { nom: etat.nom, suppression: null },
    select: { id: true },
  })

Given('je me suis déjà rattaché au lieu décrit', async () => {
  etat.nom = etat.nom || `Lieu décrit ${v4()}`
  await rattacher(utilisateurCourant())
})

Given('un collègue médiateur', async () => {
  await semerUnMediateur()
})

Given(
  'la coop connaît sous le nom de la commune un lieu décrit comme sa mairie',
  async () => {
    etat.commune = v4()
    const { id } = await prismaClient.lieuInclusion.create({
      data: {
        nom: `COMMUNE DE ${etat.commune}`,
        typologies: ['MUNI'],
        adresse: '1 rue de la Paix',
        commune: 'Paris',
        codePostal: '75001',
        codeInsee: '75101',
        banId: '75101_0001_00001',
      },
      select: { id: true },
    })
    etat.lieuConnuId = id
    suivreLeLieu(id)
  },
)

When('je me rattache au lieu décrit', async () => {
  etat.nom = etat.nom || `Lieu décrit ${v4()}`
  await rattacher(utilisateurCourant())
})

When('je me rattache au lieu décrit comme la mairie', async () => {
  etat.nom = `Mairie de ${etat.commune}`
  await rattacher(utilisateurCourant())
})

When('mon collègue se rattache au même lieu décrit', async () => {
  const collegue = etat.utilisateurs.at(-1)
  assert.ok(collegue, 'Aucun collègue semé')
  await rattacher(collegue)
})

When('je me détache du lieu décrit', async () => {
  const utilisateurId = utilisateurCourant()
  await detacherDuLieuDecrit({
    userId: utilisateurId,
    lieu: lieuDecrit(etat.nom),
    trace: { userId: utilisateurId },
  })
})

Then('je suis rattaché au lieu décrit', async () => {
  assert.strictEqual(
    (await rattachementsActifs(utilisateurCourant())).length,
    1,
  )
})

Then(
  'le lieu décrit n’existe qu’une fois et je n’y suis rattaché qu’une fois',
  async () => {
    assert.strictEqual((await lieuxNommes()).length, 1)
    assert.strictEqual(
      (await rattachementsActifs(utilisateurCourant())).length,
      1,
    )
  },
)

Then('nous sommes rattachés au même lieu', async () => {
  const collegue = etat.utilisateurs.at(-1) ?? ''
  const [miens, siens] = await Promise.all([
    rattachementsActifs(utilisateurCourant()),
    rattachementsActifs(collegue),
  ])
  assert.strictEqual((await lieuxNommes()).length, 1)
  assert.deepStrictEqual(miens, siens)
})

Then('je suis rattaché au lieu que la coop connaissait déjà', async () => {
  const actifs = await prismaClient.mediateurEnActivite.findMany({
    where: {
      mediateur: { userId: utilisateurCourant() },
      suppression: null,
      fin: null,
    },
    select: { structureId: true },
  })
  assert.deepStrictEqual(
    actifs.map(({ structureId }) => structureId),
    [etat.lieuConnuId],
  )
})

Then('ce lieu n’a pas été recréé', async () => {
  const lieux = await prismaClient.lieuInclusion.count({
    where: {
      suppression: null,
      OR: [
        { nom: `COMMUNE DE ${etat.commune}` },
        { nom: `Mairie de ${etat.commune}` },
      ],
    },
  })
  assert.strictEqual(lieux, 1)
})

Then('je ne suis plus rattaché au lieu décrit', async () => {
  assert.strictEqual(
    (await rattachementsActifs(utilisateurCourant())).length,
    0,
  )
})

Then('le lieu décrit est inscrit au registre', async () => {
  const [lieu] = await lieuxNommes()
  assert.ok(lieu, 'Le lieu décrit n’a pas été matérialisé')
  const inscription =
    await prismaClient.lieuInclusionRegistreMain.findUniqueOrThrow({
      where: { structureCoopId: lieu.id },
      select: { nom: true, source: true, editedBy: true, updatedAtCoop: true },
    })
  assert.strictEqual(inscription.nom, etat.nom)
  assert.strictEqual(inscription.source, 'Coop numérique')
  assert.strictEqual(inscription.editedBy, 'coop')
  assert.notStrictEqual(inscription.updatedAtCoop, null)
})

After(async () => {
  const utilisateurs = etat.utilisateurs
  const noms = [etat.nom, `COMMUNE DE ${etat.commune}`].filter(
    (nom) => nom !== '' && nom !== 'COMMUNE DE undefined',
  )
  etat.nom = ''
  etat.utilisateurs = []
  etat.lieuConnuId = undefined
  etat.commune = undefined
  if (noms.length === 0 && utilisateurs.length === 0) return

  const lieux = await prismaClient.lieuInclusion.findMany({
    where: { nom: { in: noms } },
    select: { id: true },
  })
  const ids = lieux.map(({ id }) => id)
  await prismaClient.mediateurEnActivite.deleteMany({
    where: {
      OR: [
        { structureId: { in: ids } },
        { mediateur: { userId: { in: utilisateurs } } },
      ],
    },
  })
  await prismaClient.mediateur.deleteMany({
    where: { userId: { in: utilisateurs } },
  })
  await prismaClient.user.deleteMany({ where: { id: { in: utilisateurs } } })
  await effacerDuRegistre(ids)
  await prismaClient.lieuInclusion.deleteMany({ where: { id: { in: ids } } })
})
