import assert from 'node:assert'
import { ajouterDesLieuxActivite } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite'
import type {
  LieuACreer,
  LieuDemande,
  LieuExistant,
} from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/domain'
import { lireLieuxDejaRattaches } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { UserId } from '@app/web/features/lieux-activite/domain/user-id'
import { lieuxSemes } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'

type Issue = Awaited<ReturnType<typeof ajouterDesLieuxActivite>>

const dernier: { ajout?: Issue; lieuReference?: string } = {}
const lieuxDeTest: string[] = []

/** L'Entrepôt n'est pas joignable en test : le port existe pour cela. */
const ports = {
  lireLieuxDejaRattaches,
  trouverStructuresCarto: async () => [],
}

const ajouter = async (
  demandes: readonly LieuDemande[],
  mediateurId: string | null,
) => {
  dernier.ajout = await ajouterDesLieuxActivite({
    demandes,
    userId: UserId(lieuxSemes().userId),
    mediateurId: mediateurId == null ? null : MediateurId(mediateurId),
    ports,
  })
}

/**
 * Un lieu à créer porte toujours une adresse validée par la BAN : c'est la
 * condition pour qu'il soit créé du tout. Les scénarios qui mettent en scène un
 * lieu déjà connu passent son `id` et n'ont pas d'adresse à valider.
 */
const lieuSaisi = (partie: Partial<LieuACreer> = {}): LieuACreer => ({
  nom: 'Tiers-lieu du Port',
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  banId: '17299_0123_00012',
  latitude: 45.94,
  longitude: -0.96,
  ...partie,
})

const lieuConnu = (
  id: string,
  partie: Partial<LieuExistant> = {},
): LieuExistant => ({
  nom: 'Tiers-lieu du Port',
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  id,
  ...partie,
})

const lieuxDuMediateur = async () =>
  prismaClient.mediateurEnActivite.count({
    where: {
      mediateurId: lieuxSemes().mediateurId,
      fin: null,
      suppression: null,
    },
  })

Given('un lieu référencé dans la coop', async () => {
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: 'Médiathèque du Centre',
      adresse: '5 place de la Mairie',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
    },
    select: { id: true },
  })

  dernier.lieuReference = lieu.id
  lieuxDeTest.push(lieu.id)
})

When('ce médiateur ajoute ce lieu référencé', async () => {
  await ajouter(
    [lieuConnu(dernier.lieuReference ?? '', { nom: 'Médiathèque du Centre' })],
    lieuxSemes().mediateurId,
  )
})

When('ce médiateur ajoute deux fois ce lieu référencé', async () => {
  const demande = lieuConnu(dernier.lieuReference ?? '', {
    nom: 'Médiathèque du Centre',
  })

  await ajouter([demande, demande], lieuxSemes().mediateurId)
})

When('ce médiateur ajoute un lieu saisi « Tiers-lieu du Port »', async () => {
  await ajouter([lieuSaisi()], lieuxSemes().mediateurId)
})

When('ce médiateur ajoute un lieu où il exerce déjà', async () => {
  await ajouter(
    [lieuConnu(lieuxSemes().lieuIds[0] ?? '', { nom: 'Espace numérique 1' })],
    lieuxSemes().mediateurId,
  )
})

When(
  'ce médiateur saisit un lieu à la même adresse que ce lieu référencé',
  async () => {
    // Ni id ni carto : seule la corrélation peut le rattacher à l'existant.
    await ajouter(
      [
        lieuSaisi({
          nom: 'Mediatheque du centre',
          adresse: '5 place de la Mairie',
        }),
      ],
      lieuxSemes().mediateurId,
    )
  },
)

When("quelqu'un sans médiateur tente d'ajouter un lieu", async () => {
  await ajouter([lieuSaisi()], null)
})

When('ce médiateur valide un panier vide', async () => {
  await ajouter([], lieuxSemes().mediateurId)
})

Then('ce médiateur exerce dans ce lieu référencé', async () => {
  const rattachement = await prismaClient.mediateurEnActivite.findFirst({
    where: {
      mediateurId: lieuxSemes().mediateurId,
      structureId: dernier.lieuReference,
      fin: null,
    },
  })

  assert.ok(rattachement, 'aucun rattachement au lieu référencé')
})

Then('le lieu « Tiers-lieu du Port » existe', async () => {
  const lieu = await prismaClient.lieuInclusion.findFirst({
    where: { nom: 'Tiers-lieu du Port' },
    select: { id: true },
  })

  assert.ok(lieu, 'le lieu saisi n’a pas été créé')
  lieuxDeTest.push(lieu.id)
})

Then('ce médiateur exerce dans le lieu « Tiers-lieu du Port »', async () => {
  const rattachement = await prismaClient.mediateurEnActivite.findFirst({
    where: {
      mediateurId: lieuxSemes().mediateurId,
      lieuInclusion: { nom: 'Tiers-lieu du Port' },
      fin: null,
    },
  })

  assert.ok(rattachement, 'aucun rattachement au lieu saisi')
})

Then("ce médiateur n'exerce toujours que dans deux lieux", async () => {
  assert.strictEqual(await lieuxDuMediateur(), 2)
})

Then('ce médiateur exerce dans trois lieux', async () => {
  assert.strictEqual(await lieuxDuMediateur(), 3)
})

/**
 * On cherche la dénomination SOUMISE, pas une absence globale : la base locale
 * porte des données restaurées, et compter les lieux d'une commune y mesurerait
 * la production plutôt que le scénario.
 */
Then("aucun lieu n'a été créé", async () => {
  const doublon = await prismaClient.lieuInclusion.count({
    where: { nom: 'Mediatheque du centre' },
  })

  assert.strictEqual(doublon, 0, 'la saisie a créé un doublon')
})

Then("l'ajout est refusé", () => {
  assert.strictEqual(dernier.ajout?.success, false)
})

After(async () => {
  const ids = [...lieuxDeTest]
  lieuxDeTest.length = 0
  dernier.ajout = undefined
  dernier.lieuReference = undefined
  if (ids.length === 0) return

  await prismaClient.mediateurEnActivite.deleteMany({
    where: { structureId: { in: ids } },
  })
  await prismaClient.lieuInclusion.deleteMany({ where: { id: { in: ids } } })
})
