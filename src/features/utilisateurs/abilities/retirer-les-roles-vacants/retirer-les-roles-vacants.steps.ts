import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'
import { rolesVacants } from './implementations/prisma/roles-vacants.query'

const recherche: {
  utilisateurId?: string
  vacants?: Awaited<ReturnType<typeof rolesVacants>>
} = {}

const UN_JOUR = 24 * 60 * 60 * 1000

const utilisateurId = (): string => {
  assert.ok(recherche.utilisateurId, 'Aucun compte semé')
  return recherche.utilisateurId
}

const semerUnDoubleRole = async ({
  inscritIlYA,
  conseillerNumerique,
  coordinateurDeclare,
}: {
  inscritIlYA: number
  conseillerNumerique: boolean
  coordinateurDeclare: boolean
}) => {
  recherche.utilisateurId = await semerUnCompteDeListe({
    prenom: 'Romane',
    marqueur: `Vacants${v4().slice(0, 8)}`,
    creeLe: new Date(Date.now() - (inscritIlYA + 1) * UN_JOUR),
    inscritLe: new Date(Date.now() - inscritIlYA * UN_JOUR),
    mediateur: { derniereActivite: null, dernierBeneficiaire: null },
    coordinateur: { aUneEquipe: false, aCoordonne: false },
    conseillerNumerique,
    coordinateurDeclare,
  })
}

const estCeCompte = (id: string) => id === utilisateurId()

Given(
  'un médiateur coordinateur hors dispositif inscrit depuis {int} jours',
  async (jours: number) => {
    await semerUnDoubleRole({
      inscritIlYA: jours,
      conseillerNumerique: false,
      coordinateurDeclare: false,
    })
  },
)

Given(
  'un médiateur coordinateur conseiller numérique inscrit depuis {int} jours',
  async (jours: number) => {
    await semerUnDoubleRole({
      inscritIlYA: jours,
      conseillerNumerique: true,
      coordinateurDeclare: false,
    })
  },
)

Given(
  'un coordinateur du dispositif médiateur inscrit depuis {int} jours',
  async (jours: number) => {
    await semerUnDoubleRole({
      inscritIlYA: jours,
      conseillerNumerique: true,
      coordinateurDeclare: true,
    })
  },
)

Given(
  'un médiateur coordinateur déclaré coordinateur sans affectation au dispositif inscrit depuis {int} jours',
  async (jours: number) => {
    await semerUnDoubleRole({
      inscritIlYA: jours,
      conseillerNumerique: false,
      coordinateurDeclare: true,
    })
  },
)

Given('son rôle médiateur a déjà servi', async () => {
  const { mediateur } = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurId() },
    select: { mediateur: { select: { id: true } } },
  })
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

When('le système cherche les rôles vacants', async () => {
  recherche.vacants = await rolesVacants(new Date())
})

Then('le rôle coordinateur de ce compte est repéré comme vacant', () => {
  assert.ok(recherche.vacants?.coordinateursVacants.some(estCeCompte))
})

Then("le rôle coordinateur de ce compte n'est pas repéré comme vacant", () => {
  assert.ok(!recherche.vacants?.coordinateursVacants.some(estCeCompte))
})

Then("aucun rôle de ce compte n'est repéré comme vacant", () => {
  assert.ok(!recherche.vacants?.coordinateursVacants.some(estCeCompte))
  assert.ok(!recherche.vacants?.mediateursVacants.some(estCeCompte))
})

Then("son rôle médiateur n'est pas repéré comme vacant", () => {
  assert.ok(!recherche.vacants?.mediateursVacants.some(estCeCompte))
})
