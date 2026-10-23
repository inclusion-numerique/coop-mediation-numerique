import assert from 'node:assert'
import { AuteurId } from '@app/web/features/utilisateurs/domain'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { changerLesRoles } from './commands/changer-les-roles'
import { rolesVacants } from './implementation'

const changement: {
  utilisateurId?: string
  tagId?: string
  resultat?: Awaited<ReturnType<typeof changerLesRoles>>
  vacants?: Awaited<ReturnType<typeof rolesVacants>>
} = {}

const UN_JOUR = 24 * 60 * 60 * 1000

const utilisateurId = (): string => {
  assert.ok(changement.utilisateurId, 'Aucun compte semé')
  return changement.utilisateurId
}

const semer = async ({
  mediateur,
  coordinateur,
  role = 'User',
  inscritIlYA = 1,
  conseillerNumerique = false,
  coordinateurDeclare = false,
}: {
  mediateur: boolean
  coordinateur: boolean
  role?: 'User' | 'Admin'
  inscritIlYA?: number
  conseillerNumerique?: boolean
  coordinateurDeclare?: boolean
}) => {
  changement.utilisateurId = await semerUnCompteDeListe({
    prenom: 'Romane',
    marqueur: `Roles${v4().slice(0, 8)}`,
    role,
    creeLe: new Date(Date.now() - (inscritIlYA + 1) * UN_JOUR),
    inscritLe: new Date(Date.now() - inscritIlYA * UN_JOUR),
    mediateur: mediateur
      ? { derniereActivite: null, dernierBeneficiaire: null }
      : null,
    coordinateur: coordinateur
      ? { aUneEquipe: false, aCoordonne: false }
      : null,
    conseillerNumerique,
    coordinateurDeclare,
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
  changement.resultat = await changerLesRoles({
    utilisateurId: utilisateurId(),
    mediateur,
    coordinateur,
    auteur: {
      _tag: 'administrateur',
      administrateurId: AuteurId(administrateurId),
    },
  })
}

Given('un médiateur dont on change les rôles', async () => {
  await semer({ mediateur: true, coordinateur: false })
})

Given('un médiateur coordinateur dont on change les rôles', async () => {
  await semer({ mediateur: true, coordinateur: true })
})

Given('un administrateur dont on change les rôles', async () => {
  await semer({ mediateur: false, coordinateur: false, role: 'Admin' })
})

Given(
  'un médiateur coordinateur hors dispositif inscrit depuis {int} jours',
  async (jours: number) => {
    await semer({ mediateur: true, coordinateur: true, inscritIlYA: jours })
  },
)

Given(
  'un médiateur coordinateur conseiller numérique inscrit depuis {int} jours',
  async (jours: number) => {
    await semer({
      mediateur: true,
      coordinateur: true,
      inscritIlYA: jours,
      conseillerNumerique: true,
    })
  },
)

Given(
  'un coordinateur du dispositif médiateur inscrit depuis {int} jours',
  async (jours: number) => {
    await semer({
      mediateur: true,
      coordinateur: true,
      inscritIlYA: jours,
      conseillerNumerique: true,
      coordinateurDeclare: true,
    })
  },
)

Given(
  'un médiateur coordinateur déclaré coordinateur sans affectation au dispositif inscrit depuis {int} jours',
  async (jours: number) => {
    await semer({
      mediateur: true,
      coordinateur: true,
      inscritIlYA: jours,
      coordinateurDeclare: true,
    })
  },
)

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
      accompagnementsCount: 0,
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

When('le système cherche les rôles vacants', async () => {
  changement.vacants = await rolesVacants(new Date())
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

Then('le rôle coordinateur de ce compte est repéré comme vacant', () => {
  assert.ok(
    changement.vacants?.coordinateursVacants.some(
      (id) => id === utilisateurId(),
    ),
  )
})

Then("le rôle coordinateur de ce compte n'est pas repéré comme vacant", () => {
  assert.ok(
    !changement.vacants?.coordinateursVacants.some(
      (id) => id === utilisateurId(),
    ),
  )
})

Then("aucun rôle de ce compte n'est repéré comme vacant", () => {
  const estCeCompte = (id: string) => id === utilisateurId()
  assert.ok(!changement.vacants?.coordinateursVacants.some(estCeCompte))
  assert.ok(!changement.vacants?.mediateursVacants.some(estCeCompte))
})

Then("son rôle médiateur n'est pas repéré comme vacant", () => {
  assert.ok(
    !changement.vacants?.mediateursVacants.some((id) => id === utilisateurId()),
  )
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
