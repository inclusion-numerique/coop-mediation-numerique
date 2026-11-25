import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'
import { marquerLOnboardingCommeVu } from './implementations/prisma/marquer-l-onboarding-comme-vu.mutation'

const onboarding: { utilisateurId?: string } = {}

const date = (jour: string): Date => {
  const [j, m, a] = jour.split('/')
  return new Date(Date.UTC(Number(a), Number(m) - 1, Number(j)))
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
