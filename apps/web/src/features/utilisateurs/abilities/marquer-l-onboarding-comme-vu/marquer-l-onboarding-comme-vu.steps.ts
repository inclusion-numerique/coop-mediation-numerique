import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { marquerLOnboardingCommeVu } from './implementation'

const onboarding: { utilisateurId?: string } = {}

const date = (jour: string): Date => {
  const [j, m, a] = jour.split('/').map(Number)
  return new Date(Date.UTC(a, m - 1, j))
}

const utilisateurId = (): string => {
  assert.ok(onboarding.utilisateurId, 'Aucun compte semé')
  return onboarding.utilisateurId
}

const semer = async (vueLe: Date | null) => {
  onboarding.utilisateurId = await semerUnCompteDeListe({
    prenom: 'Odile',
    marqueur: `Onboarding${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
  })
  await prismaClient.user.update({
    where: { id: utilisateurId() },
    data: { hasSeenOnboarding: vueLe },
  })
}

Given("un compte qui n'a jamais vu la présentation", async () => {
  await semer(null)
})

Given(
  /^un compte qui a vu la présentation le (\d{2}\/\d{2}\/\d{4})$/,
  async (jour: string) => {
    await semer(date(jour))
  },
)

When(
  /^il marque la présentation comme vue le (\d{2}\/\d{2}\/\d{4})$/,
  async (jour: string) => {
    await marquerLOnboardingCommeVu({
      utilisateurId: utilisateurId(),
      maintenant: date(jour),
    })
  },
)

Then(
  /^la présentation est vue depuis le (\d{2}\/\d{2}\/\d{4})$/,
  async (jour: string) => {
    const { hasSeenOnboarding } = await prismaClient.user.findUniqueOrThrow({
      where: { id: utilisateurId() },
      select: { hasSeenOnboarding: true },
    })
    assert.strictEqual(
      hasSeenOnboarding?.toISOString(),
      date(jour).toISOString(),
    )
  },
)
