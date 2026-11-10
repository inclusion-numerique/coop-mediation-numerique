import assert from 'node:assert'
import {
  type ActiviteEnregistree,
  type EchecDEnregistrement,
  enregistrerUneActiviteDeCoordination,
  type SaisieDeCoordination,
  type TagsUtilisables,
} from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
  DateDActivite,
  DureeEnMinutes,
  Effectif,
  NomDeTag,
  Organisateur,
  TagId,
  ThematiqueDAnimation,
  TypeDAnimation,
  TypeDEvenement,
  UtilisateurId,
} from '@app/web/features/activites/domain'
import type { Result } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

type Coordinateur = { readonly userId: string; readonly coordinateurId: string }

type Semis = {
  readonly auteur: Coordinateur
  readonly autre: Coordinateur
  readonly tags: ReadonlyMap<string, string>
  readonly evenementId: string | null
}

let semis: Semis | undefined
let resultat: Result<ActiviteEnregistree, EchecDEnregistrement> | undefined

const semerUnCoordinateur = async (): Promise<Coordinateur> => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `saisie-coordination-${userId}@example.com` },
  })
  const { id } = await prismaClient.coordinateur.create({
    data: { userId },
    select: { id: true },
  })
  return { userId, coordinateurId: id }
}

const semisCourant = (): Semis => {
  if (!semis) throw new Error('Aucun coordinateur semé')
  return semis
}

const tagsDuCoordinateur =
  (coordinateurId: string): TagsUtilisables =>
  async (tagIds) =>
    (
      await prismaClient.tag.findMany({
        where: { id: { in: [...tagIds] }, coordinateurId, suppression: null },
        select: { id: true, nom: true },
      })
    ).map(({ id, nom }) => ({ id: TagId(id), nom: NomDeTag(nom) }))

const animation = (
  tags: readonly string[],
  date = '2026-11-10',
): SaisieDeCoordination => ({
  _tag: 'Animation',
  id: null,
  date: DateDActivite(date),
  tags: tags.map(TagId),
  notes: null,
  duree: DureeEnMinutes(90),
  typeDAnimation: { _tag: 'Liste', valeur: TypeDAnimation('Webinaire') },
  thematiques: { valeurs: [ThematiqueDAnimation('Reseau')], autre: null },
  initiative: null,
  intervenants: {
    mediateurs: Effectif(3),
    structures: Effectif(0),
    autresActeurs: Effectif(0),
  },
})

const evenement = (
  id: string | null,
  participants: number,
): SaisieDeCoordination => ({
  _tag: 'Evenement',
  id: id === null ? null : ActiviteDeCoordinationId(id),
  date: DateDActivite('2026-11-10'),
  tags: [],
  notes: null,
  nom: null,
  typeDEvenement: { _tag: 'Liste', valeur: TypeDEvenement('NecLocal') },
  organisateurs: { valeurs: [Organisateur('Commune')], autre: null },
  echelon: null,
  participants: Effectif(participants),
})

const enregistrerPar = async (
  coordinateur: Coordinateur | null,
  saisie: SaisieDeCoordination,
) => {
  resultat = await enregistrerUneActiviteDeCoordination({
    saisie,
    coordinateurId:
      coordinateur === null
        ? null
        : CoordinateurId(coordinateur.coordinateurId),
    auteurId: UtilisateurId(
      coordinateur?.userId ?? semisCourant().auteur.userId,
    ),
    tagsUtilisables: tagsDuCoordinateur(coordinateur?.coordinateurId ?? ''),
  })
}

const semerLesCoordinateurs = async () => {
  const [auteur, autre] = await Promise.all([
    semerUnCoordinateur(),
    semerUnCoordinateur(),
  ])
  return { auteur, autre }
}

const evenementSeme = (): string => {
  const { evenementId } = semisCourant()
  if (evenementId === null) throw new Error('Aucun évènement semé')
  return evenementId
}

Given('un coordinateur disposant du tag {string}', async (nom: string) => {
  const { auteur, autre } = await semerLesCoordinateurs()
  const tag = await prismaClient.tag.create({
    data: { nom: `${nom} ${v4()}`, coordinateurId: auteur.coordinateurId },
    select: { id: true },
  })
  semis = { auteur, autre, tags: new Map([[nom, tag.id]]), evenementId: null }
})

Given(
  'un coordinateur ayant enregistré un évènement de {int} participants',
  async (participants: number) => {
    const { auteur, autre } = await semerLesCoordinateurs()
    const { id } = await prismaClient.activiteCoordination.create({
      data: {
        coordinateurId: auteur.coordinateurId,
        type: 'Evenement',
        date: new Date('2026-11-01'),
        typeEvenement: 'NecLocal',
        organisateurs: ['Commune'],
        participants,
      },
      select: { id: true },
    })
    semis = { auteur, autre, tags: new Map(), evenementId: id }
  },
)

When(
  'le coordinateur enregistre une animation de {int} minutes taguée {string}',
  async (_: number, nom: string) => {
    const tagId = semisCourant().tags.get(nom)
    assert.ok(tagId)
    await enregistrerPar(semisCourant().auteur, animation([tagId]))
  },
)

When(
  'le coordinateur modifie cet évènement pour {int} participants',
  async (participants: number) => {
    await enregistrerPar(
      semisCourant().auteur,
      evenement(evenementSeme(), participants),
    )
  },
)

When(
  'un autre coordinateur modifie cet évènement pour {int} participants',
  async (participants: number) => {
    await enregistrerPar(
      semisCourant().autre,
      evenement(evenementSeme(), participants),
    )
  },
)

When(
  'le coordinateur enregistre cet évènement comme une animation',
  async () => {
    await enregistrerPar(semisCourant().auteur, {
      ...animation([]),
      id: ActiviteDeCoordinationId(evenementSeme()),
    })
  },
)

When(
  'une personne sans profil de coordinateur enregistre une animation',
  async () => {
    await enregistrerPar(null, animation([]))
  },
)

When(
  'le coordinateur enregistre une animation taguée avec un tag qui ne lui est pas accessible',
  async () => {
    const etranger = await prismaClient.tag.create({
      data: {
        nom: `Étranger ${v4()}`,
        coordinateurId: semisCourant().autre.coordinateurId,
      },
      select: { id: true },
    })
    semis = {
      ...semisCourant(),
      tags: new Map([...semisCourant().tags, ['étranger', etranger.id]]),
    }
    await enregistrerPar(semisCourant().auteur, animation([etranger.id]))
  },
)

When(
  'le coordinateur enregistre une animation datée du 1er janvier 2525',
  async () => {
    await enregistrerPar(semisCourant().auteur, animation([], '2525-01-01'))
  },
)

Then("l'enregistrement de l'activité de coordination réussit", () => {
  assert.strictEqual(resultat?.success, true)
})

Then(
  "l'enregistrement de l'activité de coordination échoue avec {string}",
  (attendu: string) => {
    assert.strictEqual(
      resultat?.success === false ? resultat.error._tag : null,
      attendu,
    )
  },
)

Then(
  "l'activité de coordination enregistrée est une animation de {int} minutes taguée {string}",
  async (duree: number, nom: string) => {
    assert.ok(resultat?.success)
    const activite = await prismaClient.activiteCoordination.findUniqueOrThrow({
      where: { id: resultat.data.id },
      select: {
        type: true,
        duree: true,
        coordinateurId: true,
        tags: { select: { tagId: true } },
      },
    })
    assert.deepStrictEqual(activite, {
      type: 'Animation',
      duree,
      coordinateurId: semisCourant().auteur.coordinateurId,
      tags: [{ tagId: semisCourant().tags.get(nom) }],
    })
  },
)

Then("l'évènement compte {int} participants", async (attendu: number) => {
  const activite = await prismaClient.activiteCoordination.findUniqueOrThrow({
    where: { id: evenementSeme() },
    select: { participants: true },
  })
  assert.strictEqual(activite.participants, attendu)
})

After(async () => {
  const seme = semis
  semis = undefined
  resultat = undefined
  if (!seme) return

  const coordinateurIds = [
    seme.auteur.coordinateurId,
    seme.autre.coordinateurId,
  ]
  await prismaClient.activitesCoordinationTags.deleteMany({
    where: {
      activiteCoordination: { coordinateurId: { in: coordinateurIds } },
    },
  })
  await prismaClient.activiteCoordination.deleteMany({
    where: { coordinateurId: { in: coordinateurIds } },
  })
  await prismaClient.tag.deleteMany({
    where: { coordinateurId: { in: coordinateurIds } },
  })
  await prismaClient.coordinateur.deleteMany({
    where: { id: { in: coordinateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [seme.auteur.userId, seme.autre.userId] } },
  })
})
