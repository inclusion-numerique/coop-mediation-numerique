import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
import { appliquerLePlan } from '@/features/utilisateurs/implementations/prisma/appliquer-le-plan.mutation'
import { compteAReaffecter } from '@/features/utilisateurs/implementations/prisma/compte-a-reaffecter.query'
import { journaliserLeChangement } from '@/features/utilisateurs/implementations/prisma/journaliser-le-changement.mutation'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'
import { changerLesRoles } from './domain/changer-les-roles'

const changerLesRolesAvec = (synchroniserLaPersonne: SynchroniserLaPersonne) =>
  changerLesRoles({
    lireLeCompteAReaffecter: compteAReaffecter,
    appliquerLePlan: appliquerLePlan(synchroniserLaPersonne),
    journaliserLeChangement,
  })

const changement: {
  utilisateurId?: string
  tagId?: string
  resultat?: Awaited<ReturnType<ReturnType<typeof changerLesRolesAvec>>>
} = {}

const UN_JOUR = 24 * 60 * 60 * 1000

const utilisateurId = (): string => {
  assert.ok(changement.utilisateurId, 'Aucun compte semé')
  return changement.utilisateurId
}

const semer = async ({
  mediateur,
  coordinateur,
  role,
}: {
  mediateur: boolean
  coordinateur: boolean
  role: 'User' | 'Admin'
}) => {
  changement.utilisateurId = await semerUnCompteDeListe({
    prenom: 'Romane',
    marqueur: `Roles${v4().slice(0, 8)}`,
    role,
    creeLe: new Date(Date.now() - 2 * UN_JOUR),
    inscritLe: new Date(Date.now() - UN_JOUR),
    mediateur: mediateur
      ? { derniereActivite: null, dernierBeneficiaire: null }
      : null,
    coordinateur: coordinateur
      ? { aUneEquipe: false, aCoordonne: false }
      : null,
  })
}

const roles = async () =>
  prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurId() },
    select: {
      mediateur: { select: { id: true } },
      coordinateur: { select: { id: true } },
    },
  })

const changer = async (mediateur: boolean, coordinateur: boolean) => {
  const administrateurId = await semerUnCompteDeListe({
    prenom: 'Ada',
    marqueur: `Roles${v4().slice(0, 8)}`,
    role: 'Admin',
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-01'),
  })
  changement.resultat = await changerLesRolesAvec(async () => undefined)({
    utilisateurId: UtilisateurId.safe(utilisateurId()),
    mediateur,
    coordinateur,
    auteur: {
      _tag: 'administrateur',
      administrateurId: AuteurId(administrateurId),
    },
  })
}

Given('un médiateur dont on change les rôles', async () => {
  await semer({ mediateur: true, coordinateur: false, role: 'User' })
})

Given('un médiateur coordinateur dont on change les rôles', async () => {
  await semer({ mediateur: true, coordinateur: true, role: 'User' })
})

Given('un administrateur dont on change les rôles', async () => {
  await semer({ mediateur: false, coordinateur: false, role: 'Admin' })
})

Given('son rôle médiateur porte un tag', async () => {
  const { mediateur } = await roles()
  assert.ok(mediateur)
  const tag = await prismaClient.tag.create({
    data: { nom: `Tag ${v4().slice(0, 8)}`, mediateurId: mediateur.id },
    select: { id: true },
  })
  changement.tagId = tag.id
})

Given('son rôle médiateur a une activité', async () => {
  const { mediateur } = await roles()
  assert.ok(mediateur)
  await prismaClient.activite.create({
    data: {
      mediateurId: mediateur.id,
      type: 'Individuel',
      date: new Date('2026-06-01'),
      duree: 60,
      typeLieu: 'Autre',
    },
  })
})

Given('son rôle coordinateur a une activité de coordination', async () => {
  const { coordinateur } = await roles()
  assert.ok(coordinateur)
  await prismaClient.activiteCoordination.create({
    data: {
      coordinateurId: coordinateur.id,
      type: 'Animation',
      date: new Date('2026-06-01'),
    },
  })
})

When(
  "l'administration lui donne les rôles médiateur et coordinateur",
  async () => {
    await changer(true, true)
  },
)

When("l'administration ne lui laisse que le rôle coordinateur", async () => {
  await changer(false, true)
})

When("l'administration ne lui laisse que le rôle médiateur", async () => {
  await changer(true, false)
})

When("l'administration lui retire tous ses rôles", async () => {
  await changer(false, false)
})

Then('le changement de rôles aboutit', () => {
  assert.ok(changement.resultat?.success, 'Le changement a échoué')
})

Then(
  "le changement de rôles échoue avec l'erreur {string}",
  (attendu: string) => {
    const { resultat } = changement
    assert.ok(resultat && !resultat.success, 'Le changement a abouti')
    assert.strictEqual(resultat.error._tag, attendu)
  },
)

Then('ce compte est médiateur et coordinateur', async () => {
  const { mediateur, coordinateur } = await roles()
  assert.ok(mediateur && coordinateur)
})

Then("ce compte n'est plus que coordinateur", async () => {
  const { mediateur, coordinateur } = await roles()
  assert.strictEqual(mediateur, null)
  assert.ok(coordinateur)
})

Then('le tag appartient désormais à son rôle coordinateur', async () => {
  const { coordinateur } = await roles()
  assert.ok(coordinateur && changement.tagId)
  const tag = await prismaClient.tag.findUniqueOrThrow({
    where: { id: changement.tagId },
    select: { mediateurId: true, coordinateurId: true },
  })
  assert.deepStrictEqual(tag, {
    mediateurId: null,
    coordinateurId: coordinateur.id,
  })
})
