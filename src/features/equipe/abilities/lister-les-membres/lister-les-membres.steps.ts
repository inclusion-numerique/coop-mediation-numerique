import assert from 'node:assert'
import { Page, PageSize } from '@arckit/resultset'
import { Given, Then, When } from '@cucumber/cucumber'
import { type MembresDeLEquipe } from '@/features/equipe/abilities/lister-les-membres/domain/index'
import { listerLesMembres as listerLesMembresAvec } from '@/features/equipe/abilities/lister-les-membres/domain/lister-les-membres'
import { lireLaCommuneDuCoordinateur } from '@/features/equipe/abilities/lister-les-membres/implementations/prisma/commune-du-coordinateur.query'
import { lireLesMembres } from '@/features/equipe/abilities/lister-les-membres/implementations/prisma/lister-les-membres.query'
import { CoordinateurId, type Lecteur } from '@/features/equipe/domain'
import {
  type CoordinateurSeme,
  type MediateurSeme,
  semerUnCoordinateur,
  semerUneAdhesion,
  semerUneInvitation,
  semerUnMediateurDEquipe,
} from '@/features/equipe/equipe.cucumber'
import { lireLeCoordinateur } from '@/features/equipe/implementations/prisma/coordinateur.query'
import { criteresDeLEquipe } from '@/features/equipe/ui/filtres/equipe.filtre'
import { subDays } from '@/libraries/date'

const listerLesMembres = listerLesMembresAvec({
  lireLeCoordinateur,
  lireLaCommuneDuCoordinateur,
  lireLesMembres,
})

const contexte: {
  coordinateur?: CoordinateurSeme
  actif?: MediateurSeme
  revenu?: MediateurSeme
  issue?: Awaited<ReturnType<typeof listerLesMembres>>
} = {}

const coordinateur = (): CoordinateurSeme => {
  assert.ok(contexte.coordinateur)
  return contexte.coordinateur
}

const membres = (): MembresDeLEquipe => {
  assert.ok(contexte.issue?.success)
  return contexte.issue.data
}

const rattacher = async (
  mediateur: MediateurSeme,
  adhesions: readonly boolean[],
) =>
  Promise.all(
    adhesions.map((archivee) =>
      semerUneAdhesion({
        coordinateurId: coordinateur().coordinateurId,
        mediateurId: mediateur.mediateurId,
        archivee,
      }),
    ),
  )

const consulter = async (
  lecteur: Lecteur,
  parametres: Parameters<typeof criteresDeLEquipe>[0] = {},
) => {
  contexte.issue = await listerLesMembres({
    coordinateurId: CoordinateurId(coordinateur().coordinateurId),
    lecteur,
    criteres: criteresDeLEquipe(parametres),
    page: Page(1),
    pageSize: PageSize(50),
    maintenant: new Date(),
  })
}

const parLeCoordinateur = (): Lecteur => ({
  gestionnaire: {
    type: 'Coordinateur',
    coordinateurId: CoordinateurId(coordinateur().coordinateurId),
  },
  membreActifDeLEquipe: false,
})

Given(
  "une équipe composée d'un membre actif, d'un membre inactif, d'un ancien membre revenu, d'un ancien membre et d'une invitation en attente",
  async () => {
    contexte.coordinateur = await semerUnCoordinateur()
    contexte.actif = await semerUnMediateurDEquipe({
      derniereActivite: new Date(),
    })
    contexte.revenu = await semerUnMediateurDEquipe({
      derniereActivite: new Date(),
    })
    const inactif = await semerUnMediateurDEquipe({
      derniereActivite: subDays(new Date(), 90),
    })
    const ancien = await semerUnMediateurDEquipe()
    await rattacher(contexte.actif, [false])
    await rattacher(contexte.revenu, [true, false])
    await rattacher(inactif, [false])
    await rattacher(ancien, [true])
    await semerUneInvitation({
      coordinateurId: coordinateur().coordinateurId,
      email: `liste-${coordinateur().coordinateurId}@example.com`,
    })
  },
)

Given('un membre dont le profil a été supprimé', async () => {
  const supprime = await semerUnMediateurDEquipe({ profilSupprime: true })
  await rattacher(supprime, [false])
})

When('le coordinateur consulte son équipe', async () => {
  await consulter(parLeCoordinateur())
})

When('le coordinateur consulte les archives de son équipe', async () => {
  await consulter(parLeCoordinateur(), { statut: 'archives' })
})

When(
  'le coordinateur cherche {string} dans son équipe',
  async (recherche: string) => {
    await consulter(parLeCoordinateur(), { recherche })
  },
)

When(
  "le coordinateur cherche l'email du membre actif dans son équipe",
  async () => {
    assert.ok(contexte.actif)
    await consulter(parLeCoordinateur(), { recherche: contexte.actif.email })
  },
)

When('le membre actif consulte son équipe', async () => {
  await consulter({
    gestionnaire: { type: 'Autre' },
    membreActifDeLEquipe: true,
  })
})

When("le coordinateur d'une autre équipe consulte cette équipe", async () => {
  const autre = await semerUnCoordinateur()
  await consulter({
    gestionnaire: {
      type: 'Coordinateur',
      coordinateurId: CoordinateurId(autre.coordinateurId),
    },
    membreActifDeLEquipe: false,
  })
})

Then('la liste compte {int} ligne(s)', (nombre: number) => {
  assert.strictEqual(membres().items.length, nombre)
  assert.strictEqual(membres().totalItems, nombre)
})

Then("le médiateur revenu n'apparaît qu'une fois, comme membre actif", () => {
  const lignes = membres().items.filter(
    ({ personne }) =>
      personne.type === 'Inscrite' &&
      personne.mediateurId === contexte.revenu?.mediateurId,
  )
  assert.strictEqual(lignes.length, 1)
  assert.strictEqual(lignes[0]?.statut.type, 'Actif')
})

Then(
  "l'équipe compte {int} membres, dont {int} actifs et {int} inactif(s)",
  (total: number, actifs: number, inactifs: number) => {
    const { statistiques } = membres()
    assert.strictEqual(statistiques.total, total)
    assert.strictEqual(statistiques.actifs, actifs)
    assert.strictEqual(statistiques.inactifs, inactifs)
  },
)

Then('{int} invitation est en attente', (nombre: number) => {
  assert.strictEqual(membres().statistiques.invitations, nombre)
})

Then('{int} personnes sont aux archives', (nombre: number) => {
  assert.strictEqual(membres().statistiques.archives, nombre)
})

Then('cette ligne est un ancien membre', () => {
  assert.strictEqual(membres().items[0]?.statut.type, 'AncienMembre')
})

Then('la consultation réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('la consultation est refusée', () => {
  assert.strictEqual(contexte.issue?.success, false)
})
