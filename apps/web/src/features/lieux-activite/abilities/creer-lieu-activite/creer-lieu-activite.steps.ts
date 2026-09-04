import assert from 'node:assert'
import { emptyOpeningHours } from '@app/web/components/structure/fields/openingHoursHelpers'
import { creerLieuActivite } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite'
import { nouveauLieu } from '@app/web/features/lieux-activite/abilities/creer-lieu-activite/action/depuis-la-saisie'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import { ficheSemee } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import type { CreerLieuActiviteData } from '@app/web/features/structures/CreerLieuActiviteValidation'
import { prismaClient } from '@app/web/prismaClient'
import { After, Then, When } from '@cucumber/cucumber'
import { PublicSpecifiquementAdresse, Typologie } from '@prisma/client'

type Issue = Awaited<ReturnType<typeof creerLieuActivite>>

const dernier: { creation?: Issue; lieuxCreesIds: string[] } = {
  lieuxCreesIds: [],
}

const saisie: CreerLieuActiviteData = {
  nom: 'Tiers-lieu du Port',
  adresseBan: {
    id: '17300_0123_00012',
    label: '12 quai du Port, 17300 Rochefort',
    nom: '12 quai du Port',
    commune: 'Rochefort',
    codePostal: '17300',
    codeInsee: '17299',
    contexte: '17, Charente-Maritime',
    latitude: 45.94,
    longitude: -0.96,
  },
  complementAdresse: null,
  lieuItinerant: null,
  typologies: [Typologie.BIB],
  visiblePourCartographieNationale: false,
  presentationResume: null,
  presentationDetail: null,
  formationsLabels: [],
  siteWeb: null,
  ficheAccesLibre: null,
  priseRdv: null,
  horaires: null,
  horairesComment: null,
  openingHours: emptyOpeningHours,
  modalitesAcces: null,
  fraisACharge: [],
  services: [],
  modalitesAccompagnement: [],
  priseEnChargeSpecifique: [],
  toutPublic: true,
  publicsSpecifiquementAdresses: [PublicSpecifiquementAdresse.Jeunes],
}

const creer = async (mediateurId: string | null) => {
  dernier.creation = await creerLieuActivite({
    lieu: nouveauLieu(
      saisie,
      UserId(ficheSemee().userIds[0] ?? ''),
      new Date(),
    ),
    mediateurId: mediateurId == null ? null : MediateurId(mediateurId),
  })

  if (dernier.creation.success)
    dernier.lieuxCreesIds = [...dernier.lieuxCreesIds, dernier.creation.data.id]
}

/** L'identifiant rendu par la création de rang `rang`, la première valant 1. */
const lieuCree = (rang: number): string | undefined =>
  dernier.lieuxCreesIds[rang - 1]

When('ce médiateur crée un lieu « Tiers-lieu du Port »', async () => {
  await creer(ficheSemee().mediateurRattacheId)
})

When('ce médiateur ressaisit le même lieu', async () => {
  await creer(ficheSemee().mediateurRattacheId)
})

When("quelqu'un sans médiateur tente de créer un lieu", async () => {
  await creer(null)
})

Then('le lieu créé existe', async () => {
  assert.strictEqual(
    await prismaClient.lieuInclusion.count({
      where: { id: lieuCree(1) },
    }),
    1,
  )
})

Then('ce médiateur exerce dans le lieu créé', async () => {
  assert.strictEqual(
    await prismaClient.mediateurEnActivite.count({
      where: {
        structureId: lieuCree(1),
        mediateurId: ficheSemee().mediateurRattacheId,
        fin: null,
      },
    }),
    1,
  )
})

Then('la création est refusée', () => {
  assert.strictEqual(dernier.creation?.success, false)
})

Then('le lieu créé ne vise aucun public en particulier', async () => {
  const lieu = await prismaClient.lieuInclusion.findUnique({
    where: { id: lieuCree(1) },
    select: { publicsSpecifiquementAdresses: true },
  })

  assert.deepStrictEqual(lieu?.publicsSpecifiquementAdresses, [])
})

Then('les deux créations désignent le même lieu', () => {
  assert.strictEqual(dernier.lieuxCreesIds.length, 2)
  assert.strictEqual(lieuCree(1), lieuCree(2))
})

Then("ce médiateur n'exerce qu'une fois dans le lieu créé", async () => {
  assert.strictEqual(
    await prismaClient.mediateurEnActivite.count({
      where: {
        structureId: lieuCree(1),
        mediateurId: ficheSemee().mediateurRattacheId,
        fin: null,
      },
    }),
    1,
  )
})

// Les lieux créés par les scénarios ne sont pas semés : ils se nettoient ici.
After(async () => {
  const ids = dernier.lieuxCreesIds
  dernier.lieuxCreesIds = []
  dernier.creation = undefined
  if (ids.length === 0) return

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { structureId: { in: ids } },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: { in: ids } } })
})
