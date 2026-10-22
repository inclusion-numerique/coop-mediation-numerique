import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { usurperUnUtilisateur } from './commands/usurper-un-utilisateur'
import { PorteeUsurpation } from './domain'

const usurpation: {
  administrateurId?: string
  cibleId?: string
  jeton?: string
  resultat?: Awaited<ReturnType<typeof usurperUnUtilisateur>>
} = {}

const exiger = (valeur: string | undefined): string => {
  assert.ok(valeur, 'Contexte incomplet')
  return valeur
}

const semer = async (fixture: boolean) => {
  const marqueur = `Usurpation${v4().slice(0, 8)}`
  usurpation.administrateurId = await semerUnCompteDeListe({
    prenom: 'Ada',
    marqueur,
    role: 'Admin',
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-01'),
  })
  usurpation.cibleId = await semerUnCompteDeListe({
    prenom: 'Cible',
    marqueur,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
    mediateur: { derniereActivite: null, dernierBeneficiaire: null },
  })
  await prismaClient.user.update({
    where: { id: usurpation.cibleId },
    data: { isFixture: fixture },
  })
  usurpation.jeton = v4()
  await prismaClient.session.create({
    data: {
      sessionToken: usurpation.jeton,
      userId: usurpation.administrateurId,
      expires: new Date(Date.now() + 86_400_000),
    },
  })
}

const usurper = async (portee: PorteeUsurpation) => {
  usurpation.resultat = await usurperUnUtilisateur({
    utilisateurId: exiger(usurpation.cibleId),
    usurpateurId: exiger(usurpation.administrateurId),
    jetonDeSession: exiger(usurpation.jeton),
    portee,
  })
}

const session = () =>
  prismaClient.session.findUniqueOrThrow({
    where: { sessionToken: exiger(usurpation.jeton) },
    select: { userId: true, usurperId: true },
  })

Given('un administrateur connecté et un compte de test à usurper', async () => {
  await semer(true)
})

Given('un administrateur connecté et un compte réel à usurper', async () => {
  await semer(false)
})

When(
  "l'administrateur usurpe ce compte, usurpation limitée aux comptes de test",
  async () => {
    await usurper(PorteeUsurpation('FixturesSeulement'))
  },
)

When(
  "l'administrateur usurpe ce compte, usurpation ouverte à tous les comptes",
  async () => {
    await usurper(PorteeUsurpation('TousLesComptes'))
  },
)

Then("l'usurpation aboutit", () => {
  assert.ok(usurpation.resultat?.success, "L'usurpation a échoué")
})

Then("l'usurpation échoue avec l'erreur {string}", (attendu: string) => {
  const { resultat } = usurpation
  assert.ok(resultat && !resultat.success, "L'usurpation a abouti")
  assert.strictEqual(resultat.error._tag, attendu)
})

Then('la session est celle du compte usurpé', async () => {
  assert.strictEqual((await session()).userId, usurpation.cibleId)
})

Then("la session retient l'administrateur usurpateur", async () => {
  assert.strictEqual((await session()).usurperId, usurpation.administrateurId)
})
