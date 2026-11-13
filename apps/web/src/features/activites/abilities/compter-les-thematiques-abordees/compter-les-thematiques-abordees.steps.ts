import assert from 'node:assert'
import type { Thematique } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import {
  BeneficiaireId,
  compterLesThematiquesAbordees,
  MediateurId,
  type ThematiqueAbordee,
} from '.'

type Semis = {
  readonly userIds: readonly string[]
  readonly mediateurIds: readonly string[]
  readonly beneficiaireId: string
}

let semis: Semis | undefined
let abordees: readonly ThematiqueAbordee[] = []

const THEMATIQUES: Readonly<Record<string, Thematique>> = {
  AideAuxDemarchesAdministratives: 'AideAuxDemarchesAdministratives',
  Bureautique: 'Bureautique',
  Email: 'Email',
  Justice: 'Justice',
  Logement: 'Logement',
  Parentalite: 'Parentalite',
  Sante: 'Sante',
}

const thematiquesDe = (texte: string): Thematique[] =>
  texte.split(', ').flatMap((cle) => {
    const thematique = THEMATIQUES[cle]
    return thematique === undefined ? [] : [thematique]
  })

const semerUnMediateur = async () => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `thematiques-abordees-${userId}@example.com` },
  })
  const { id: mediateurId } = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  return { userId, mediateurId }
}

const semisCourant = (): Semis => {
  if (!semis) throw new Error('Aucun bénéficiaire semé')
  return semis
}

const semerUneActivite = ({
  mediateurId,
  beneficiaireId,
  thematiques,
  suppression = null,
}: {
  mediateurId: string
  beneficiaireId: string
  thematiques: string
  suppression?: Date | null
}) =>
  prismaClient.activite.create({
    data: {
      mediateurId,
      type: 'Individuel',
      typeLieu: 'ADistance',
      date: new Date('2026-03-03'),
      duree: 60,
      thematiques: thematiquesDe(thematiques),
      accompagnementsCount: 1,
      suppression,
      accompagnements: { create: { beneficiaireId } },
    },
    select: { id: true },
  })

const semerUnBeneficiaire = async () => {
  const { userId, mediateurId } = await semerUnMediateur()
  const { id: beneficiaireId } = await prismaClient.beneficiaire.create({
    data: { mediateurId, prenom: 'Ada', nom: 'Lovelace' },
    select: { id: true },
  })
  semis = { userIds: [userId], mediateurIds: [mediateurId], beneficiaireId }
  return { mediateurId, beneficiaireId }
}

Given(
  'un bénéficiaire accompagné sur les thématiques {string}, puis {string}, puis {string}',
  async (premieres: string, deuxiemes: string, troisiemes: string) => {
    const { mediateurId, beneficiaireId } = await semerUnBeneficiaire()
    await Promise.all(
      [premieres, deuxiemes, troisiemes].map((thematiques) =>
        semerUneActivite({ mediateurId, beneficiaireId, thematiques }),
      ),
    )
  },
)

Given('un bénéficiaire jamais accompagné', async () => {
  await semerUnBeneficiaire()
})

Given(
  "une activité supprimée l'avait accompagné sur la thématique {string}",
  async (thematiques: string) => {
    const { mediateurIds, beneficiaireId } = semisCourant()
    await semerUneActivite({
      mediateurId: mediateurIds[0] ?? '',
      beneficiaireId,
      thematiques,
      suppression: new Date(),
    })
  },
)

Given(
  'un autre bénéficiaire du médiateur a été accompagné sur la thématique {string}',
  async (thematiques: string) => {
    const mediateurId = semisCourant().mediateurIds[0] ?? ''
    const { id: beneficiaireId } = await prismaClient.beneficiaire.create({
      data: { mediateurId, anonyme: true },
      select: { id: true },
    })
    await semerUneActivite({ mediateurId, beneficiaireId, thematiques })
  },
)

Given(
  "un autre médiateur l'a accompagné sur la thématique {string}",
  async (thematiques: string) => {
    const courant = semisCourant()
    const autre = await semerUnMediateur()
    semis = {
      ...courant,
      userIds: [...courant.userIds, autre.userId],
      mediateurIds: [...courant.mediateurIds, autre.mediateurId],
    }
    await semerUneActivite({
      mediateurId: autre.mediateurId,
      beneficiaireId: courant.beneficiaireId,
      thematiques,
    })
  },
)

When('je compte les thématiques abordées avec ce bénéficiaire', async () => {
  const { mediateurIds, beneficiaireId } = semisCourant()
  abordees = await compterLesThematiquesAbordees({
    mediateurId: MediateurId(mediateurIds[0] ?? ''),
    beneficiaireId: BeneficiaireId(beneficiaireId),
  })
})

Then('les thématiques abordées sont {string}', (attendues: string) => {
  assert.strictEqual(
    abordees
      .map(({ thematique, nombre }) => `${thematique}: ${nombre}`)
      .join(', '),
    attendues,
  )
})

Then("aucune thématique n'a été abordée", () => {
  assert.deepStrictEqual(abordees, [])
})

After(async () => {
  const seme = semis
  semis = undefined
  abordees = []
  if (!seme) return
  const mediateurIds = [...seme.mediateurIds]
  await prismaClient.accompagnement.deleteMany({
    where: { activite: { mediateurId: { in: mediateurIds } } },
  })
  await prismaClient.activite.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.beneficiaire.deleteMany({
    where: { mediateurId: { in: mediateurIds } },
  })
  await prismaClient.mediateur.deleteMany({
    where: { id: { in: mediateurIds } },
  })
  await prismaClient.user.deleteMany({
    where: { id: { in: [...seme.userIds] } },
  })
})
