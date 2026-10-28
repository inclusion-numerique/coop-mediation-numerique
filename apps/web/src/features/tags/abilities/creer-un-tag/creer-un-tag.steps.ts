import assert from 'node:assert'
import {
  type Acteur,
  CoordinateurId,
  NomDuTag,
  type VisibiliteChoisie,
} from '@app/web/features/tags/domain'
import {
  acteurCoordinateur,
  acteurMediateur,
  coordonner,
  retenirLeTag,
  semerUnCoordinateur,
  semerUnMediateur,
  tagEnBase,
} from '@app/web/features/tags/tags.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'
import { creerUnTag } from './implementation'

const contexte: {
  acteur?: Acteur
  mediateurId?: string
  coordinateurId?: string
  issue?: Awaited<ReturnType<typeof creerUnTag>>
} = {}

const acteur = (): Acteur => {
  assert.ok(contexte.acteur)
  return contexte.acteur
}

const creer = async (nom: string, visibilite: VisibiliteChoisie) => {
  contexte.issue = await creerUnTag({
    acteur: acteur(),
    nom: NomDuTag(nom),
    description: null,
    visibilite,
  })
  if (contexte.issue.success) retenirLeTag(contexte.issue.data.id)
}

const tagCree = async (nom: string) => {
  assert.ok(contexte.issue?.success)
  assert.strictEqual(contexte.issue.data.nom, nom)
  const tag = await tagEnBase(contexte.issue.data.id)
  assert.ok(tag)
  return tag
}

Given('un médiateur qui veut créer un tag', async () => {
  const { mediateurId } = await semerUnMediateur()
  contexte.mediateurId = mediateurId
  contexte.acteur = acteurMediateur({ mediateurId, departement: '69' })
})

Given('un médiateur coordonné qui veut créer un tag', async () => {
  const { mediateurId } = await semerUnMediateur()
  const { coordinateurId } = await semerUnCoordinateur()
  await coordonner({ coordinateurId, mediateurId })
  contexte.mediateurId = mediateurId
  contexte.coordinateurId = coordinateurId
  contexte.acteur = acteurMediateur({
    mediateurId,
    equipes: [coordinateurId],
  })
})

Given(
  'un coordinateur du département {int} qui veut créer un tag',
  async (departement: number) => {
    const { coordinateurId } = await semerUnCoordinateur()
    contexte.coordinateurId = coordinateurId
    contexte.acteur = acteurCoordinateur({
      coordinateurId,
      departement: String(departement),
    })
  },
)

When('il crée le tag {string} visible par lui seul', async (nom: string) => {
  await creer(nom, { _tag: 'Personnel' })
})

When('il crée le tag {string} visible par son équipe', async (nom: string) => {
  assert.ok(contexte.coordinateurId)
  await creer(nom, {
    _tag: 'Equipe',
    coordinateurId: CoordinateurId(contexte.coordinateurId),
  })
})

When(
  'il crée le tag {string} visible par une autre équipe',
  async (nom: string) => {
    const { coordinateurId } = await semerUnCoordinateur()
    await creer(nom, {
      _tag: 'Equipe',
      coordinateurId: CoordinateurId(coordinateurId),
    })
  },
)

When(
  'il crée le tag {string} visible par son département',
  async (nom: string) => {
    await creer(nom, { _tag: 'Departemental' })
  },
)

Then('la création du tag réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('la création du tag est refusée', () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then(
  'le tag {string} est un tag personnel de ce médiateur',
  async (nom: string) => {
    const tag = await tagCree(nom)
    assert.strictEqual(tag.mediateurId, contexte.mediateurId)
    assert.strictEqual(tag.coordinateurId, null)
    assert.strictEqual(tag.equipe, null)
  },
)

Then(
  "le tag {string} est un tag de l'équipe de son coordinateur",
  async (nom: string) => {
    const tag = await tagCree(nom)
    assert.strictEqual(tag.mediateurId, null)
    assert.strictEqual(tag.coordinateurId, contexte.coordinateurId)
    assert.strictEqual(tag.equipe, true)
  },
)

Then(
  'le tag {string} est un tag départemental du {int}',
  async (nom: string, departement: number) => {
    const tag = await tagCree(nom)
    assert.strictEqual(tag.mediateurId, null)
    assert.strictEqual(tag.coordinateurId, null)
    assert.strictEqual(tag.departement, String(departement))
  },
)
