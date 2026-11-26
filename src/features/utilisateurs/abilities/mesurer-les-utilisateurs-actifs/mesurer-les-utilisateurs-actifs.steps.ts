import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'
import type { UtilisateursActifs } from './domain'
import { mesurerLesUtilisateursActifs } from './implementations/prisma/utilisateurs-actifs.query'
import { utilisateursActifsParMois } from './implementations/prisma/utilisateurs-actifs-par-mois.query'

const mesure: {
  avant?: UtilisateursActifs
  apres?: UtilisateursActifs
} = {}

type ActifsParMois = Awaited<ReturnType<typeof utilisateursActifsParMois>>

const mesureParMois: { avant?: ActifsParMois; apres?: ActifsParMois } = {}

const ilYaTreizeMois = (): Date => {
  const maintenant = new Date()
  return new Date(maintenant.getFullYear(), maintenant.getMonth() - 13, 15)
}

const activites: Readonly<
  Record<string, { readonly date: () => Date; readonly supprimee: boolean }>
> = {
  'qui a saisi une activité ce mois-ci': {
    date: () => new Date(),
    supprimee: false,
  },
  'dont la seule activité de ce mois-ci est supprimée': {
    date: () => new Date(),
    supprimee: true,
  },
  'qui a saisi une activité il y a treize mois': {
    date: ilYaTreizeMois,
    supprimee: false,
  },
}

const mediateursActifsParMois = (
  mesure: ActifsParMois | undefined,
): readonly number[] => {
  assert.ok(mesure, 'Les utilisateurs actifs par mois ne sont pas mesurés')
  return mesure.map(({ mediateursActifs }) => mediateursActifs)
}

const semer = (
  compte: Omit<
    Parameters<typeof semerUnCompteDeListe>[0],
    'prenom' | 'marqueur' | 'creeLe' | 'inscritLe'
  >,
) =>
  semerUnCompteDeListe({
    prenom: 'Mesure',
    marqueur: `Actifs${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
    ...compte,
  })

Given('les utilisateurs actifs déjà mesurés', async () => {
  mesure.avant = await mesurerLesUtilisateursActifs(new Date())
})

Given(
  'un médiateur hors dispositif qui vient de créer un bénéficiaire',
  async () => {
    await semer({
      mediateur: { derniereActivite: null, dernierBeneficiaire: new Date() },
    })
  },
)

Given(
  'un coordinateur sans équipe ni coordination qui vient de se connecter',
  async () => {
    await semer({
      derniereVisite: new Date(),
      coordinateur: { aUneEquipe: false, aCoordonne: false },
    })
  },
)

Given(
  'un médiateur coordinateur sans équipe qui vient de saisir une activité',
  async () => {
    await semer({
      mediateur: { derniereActivite: new Date(), dernierBeneficiaire: null },
      coordinateur: { aUneEquipe: false, aCoordonne: false },
    })
  },
)

Given('les utilisateurs actifs par mois déjà mesurés', async () => {
  mesureParMois.avant = await utilisateursActifsParMois()
})

Given(
  /^un médiateur (hors dispositif|coordinateur) (qui a saisi une activité ce mois-ci|dont la seule activité de ce mois-ci est supprimée|qui a saisi une activité il y a treize mois)$/,
  async (profil: string, activite: string) => {
    const semee = activites[activite]
    assert.ok(semee, `Activité inconnue : ${activite}`)
    await semer({
      mediateur: { derniereActivite: null, dernierBeneficiaire: null },
      activites: [
        {
          date: semee.date(),
          supprimeeLe: semee.supprimee ? new Date() : null,
        },
      ],
      ...(profil === 'coordinateur'
        ? { coordinateur: { aUneEquipe: false, aCoordonne: false } }
        : {}),
    })
  },
)

When('les utilisateurs actifs par mois sont mesurés de nouveau', async () => {
  mesureParMois.apres = await utilisateursActifsParMois()
})

When('les utilisateurs actifs sont mesurés de nouveau', async () => {
  mesure.apres = await mesurerLesUtilisateursActifs(new Date())
})

Then(
  /^les (mediateurs|médiateurs|coordinateurs) comptent (\d+) actifs? et (\d+) profils? de plus$/,
  (categorie: string, actifs: string, profils: string) => {
    const cle = categorie === 'coordinateurs' ? 'coordinateurs' : 'mediateurs'
    assert.ok(mesure.avant && mesure.apres)
    assert.strictEqual(
      mesure.apres[cle].value - mesure.avant[cle].value,
      Number(actifs),
    )
    assert.strictEqual(
      mesure.apres[cle].total - mesure.avant[cle].total,
      Number(profils),
    )
  },
)

Then(
  'les médiateurs actifs du mois en cours ont augmenté de {int}',
  (attendu: number) => {
    assert.strictEqual(
      (mediateursActifsParMois(mesureParMois.apres).at(-1) ?? 0) -
        (mediateursActifsParMois(mesureParMois.avant).at(-1) ?? 0),
      attendu,
    )
  },
)

Then('aucun mois affiché ne compte de médiateur actif de plus', () => {
  assert.deepStrictEqual(
    mediateursActifsParMois(mesureParMois.apres),
    mediateursActifsParMois(mesureParMois.avant),
  )
})
