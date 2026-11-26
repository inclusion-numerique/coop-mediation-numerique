import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { prismaClient } from '@/configuration/prisma'
import { consulterLeRecapitulatif } from '@/features/inscription/abilities/consulter-le-recapitulatif/domain/consulter-le-recapitulatif'
import type { Recapitulatif } from '@/features/inscription/abilities/consulter-le-recapitulatif/domain/recapitulatif'
import { lireLInscritARecapituler } from '@/features/inscription/abilities/consulter-le-recapitulatif/implementations/prisma/inscrit-a-recapituler.query'
import { compterLesMediateursCoordonnes } from '@/features/inscription/abilities/consulter-le-recapitulatif/implementations/prisma/mediateurs-coordonnes.query'
import {
  seedMediateurCoordonne,
  utilisateurDeLInscriptionEnCours,
} from '@/features/inscription/inscription.cucumber'

const LIEU_DU_MEDIATEUR = 'Lieu d’activité du médiateur'

const consultation: { recapitulatif?: Recapitulatif<string> } = {}

const recapitulatif = (): Recapitulatif<string> => {
  assert.ok(consultation.recapitulatif, 'Le récapitulatif n’a pas été consulté')
  return consultation.recapitulatif
}

const monCoordinateur = async (): Promise<string> => {
  const { id } = await prismaClient.coordinateur.findUniqueOrThrow({
    where: { userId: utilisateurDeLInscriptionEnCours() },
    select: { id: true },
  })
  return id
}

Given('je coordonne {int} médiateurs', async (nombre: number) => {
  const coordinateurId = await monCoordinateur()
  await Promise.all(
    Array.from({ length: nombre }, () =>
      seedMediateurCoordonne({ coordinateurId, suppression: null }),
    ),
  )
})

Given('un médiateur que je coordonnais a quitté mon équipe', async () => {
  await seedMediateurCoordonne({
    coordinateurId: await monCoordinateur(),
    suppression: new Date(),
  })
})

Given('mes lieux d’activité ont été importés depuis le Dataspace', async () => {
  await prismaClient.user.update({
    where: { id: utilisateurDeLInscriptionEnCours() },
    data: { importedLieuxFromDataspace: new Date() },
  })
})

When('je consulte le récapitulatif de mon inscription', async () => {
  const resultat = await consulterLeRecapitulatif({
    lireLInscritARecapituler,
    listerLesLieux: async () => [LIEU_DU_MEDIATEUR],
    compterLesMediateursCoordonnes,
  })({ utilisateurId: utilisateurDeLInscriptionEnCours() })
  consultation.recapitulatif = resultat.data
})

Then('le récapitulatif liste mes lieux d’activité', () => {
  assert.deepStrictEqual(recapitulatif().lieuxActivite, [LIEU_DU_MEDIATEUR])
})

Then('le récapitulatif ne liste aucun lieu d’activité', () => {
  assert.deepStrictEqual(recapitulatif().lieuxActivite, [])
})

Then(
  'le récapitulatif compte {int} médiateurs coordonnés',
  (nombre: number) => {
    assert.strictEqual(recapitulatif().nombreDeMediateursCoordonnes, nombre)
  },
)

Then('le récapitulatif ne compte pas de médiateurs coordonnés', () => {
  assert.strictEqual(recapitulatif().nombreDeMediateursCoordonnes, null)
})

Then(
  'le récapitulatif rapporte l’import de mes lieux depuis le Dataspace',
  () => {
    assert.ok(
      recapitulatif().lieuxImportesLe,
      'L’import des lieux depuis le Dataspace n’a pas été rapporté',
    )
  },
)
