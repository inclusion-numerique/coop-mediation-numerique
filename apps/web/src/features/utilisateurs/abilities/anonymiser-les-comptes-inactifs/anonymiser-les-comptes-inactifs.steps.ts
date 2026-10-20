import assert from 'node:assert'
import {
  anonymiserLesComptesInactifs,
  type CompteExamine,
} from '@app/web/features/utilisateurs/abilities/anonymiser-les-comptes-inactifs'
import {
  type CompteInactifSeme,
  semerUnCompteInactif,
} from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

const maintenant = new Date('2026-10-20T01:00:00.000Z')

const date = (jour: string): Date => {
  const [j, m, a] = jour.split('/').map(Number)
  return new Date(Date.UTC(a, m - 1, j))
}

const etat: {
  compte?: CompteInactifSeme
  avertissements: { courriel: string; dateDeSuppression: Date }[]
  suppressions: string[]
  examines: readonly CompteExamine[]
} = { avertissements: [], suppressions: [], examines: [] }

const compte = (): CompteInactifSeme => {
  assert.ok(etat.compte, 'Aucun compte semé')
  return etat.compte
}

const examiner = async (simuler: boolean) => {
  etat.avertissements = []
  etat.suppressions = []
  etat.examines = await anonymiserLesComptesInactifs({
    maintenant,
    simuler,
    ports: {
      avertirDeLaSuppression: async ({ courriel, dateDeSuppression }) => {
        etat.avertissements.push({ courriel, dateDeSuppression })
      },
      supprimerLeCompte: async (utilisateurId) => {
        etat.suppressions.push(utilisateurId)
      },
    },
  })
}

Given(
  /^un médiateur inscrit le (\d{2}\/\d{2}\/\d{4}) dont le dernier compte rendu date du (\d{2}\/\d{2}\/\d{4})$/,
  async (inscription: string, compteRendu: string) => {
    etat.compte = await semerUnCompteInactif({
      role: 'mediateur',
      inscriptionValidee: date(inscription),
      dernierCompteRendu: date(compteRendu),
    })
  },
)

Given(
  /^un coordinateur inscrit le (\d{2}\/\d{2}\/\d{4}) dont la dernière visite date du (\d{2}\/\d{2}\/\d{4})$/,
  async (inscription: string, visite: string) => {
    etat.compte = await semerUnCompteInactif({
      role: 'coordinateur',
      inscriptionValidee: date(inscription),
      derniereVisite: date(visite),
    })
  },
)

Given(
  /^ce compte s'est connecté le (\d{2}\/\d{2}\/\d{4})$/,
  async (jour: string) => {
    await prismaClient.user.update({
      where: { id: compte().userId },
      data: { lastLogin: date(jour) },
    })
  },
)

Given(
  /^ce compte a été averti le (\d{2}\/\d{2}\/\d{4})$/,
  async (jour: string) => {
    await prismaClient.user.update({
      where: { id: compte().userId },
      data: { avertissementInactiviteLe: date(jour) },
    })
  },
)

When('les comptes inactifs sont examinés', async () => {
  await examiner(false)
})

When('les comptes inactifs sont examinés en simulation', async () => {
  await examiner(true)
})

const avertissementsDuCompte = () =>
  etat.avertissements.filter(({ courriel }) => courriel === compte().courriel)

Then("ce compte n'est pas averti", () => {
  assert.deepStrictEqual(avertissementsDuCompte(), [])
})

Then(
  /^ce compte est averti d'une suppression le (\d{2}\/\d{2}\/\d{4})$/,
  (jour: string) => {
    const [avertissement] = avertissementsDuCompte()
    assert.ok(avertissement, "Ce compte n'a pas été averti")
    assert.strictEqual(
      avertissement.dateDeSuppression.toISOString().slice(0, 10),
      date(jour).toISOString().slice(0, 10),
    )
  },
)

Then(
  /^l'avertissement de ce compte est daté du (\d{2}\/\d{2}\/\d{4})$/,
  async (jour: string) => {
    const { avertissementInactiviteLe } =
      await prismaClient.user.findUniqueOrThrow({
        where: { id: compte().userId },
        select: { avertissementInactiviteLe: true },
      })
    assert.strictEqual(
      avertissementInactiviteLe?.toISOString().slice(0, 10),
      date(jour).toISOString().slice(0, 10),
    )
  },
)

Then('ce compte est supprimé', () => {
  assert.ok(etat.suppressions.includes(compte().userId))
})

Then("ce compte n'est pas supprimé", () => {
  assert.ok(!etat.suppressions.includes(compte().userId))
})

Then('ce compte est signalé comme à avertir', () => {
  const examine = etat.examines.find(
    ({ utilisateurId }) => utilisateurId === compte().userId,
  )
  assert.deepStrictEqual(
    { etape: examine?.etape, issue: examine?.issue },
    { etape: 'aAvertir', issue: 'simule' },
  )
})
