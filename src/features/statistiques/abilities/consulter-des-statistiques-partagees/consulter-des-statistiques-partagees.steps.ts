import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { utilisateurDuPartage } from '@/features/statistiques/domain/utilisateur-du-partage'

const personne = {
  mediateur: { id: 'mediateur' },
  coordinateur: { id: 'coordinateur' },
  emplois: [{ structure: { codeInsee: '69123' } }],
  rdvAccount: { id: 1 },
}

type Personne = typeof personne

const proprietaires: Readonly<Record<string, { readonly _tag: string }>> = {
  médiateur: { _tag: 'Mediateur' },
  coordinateur: { _tag: 'Coordinateur' },
}

type StatistiquesPartagees = {
  readonly coordinateur: unknown
  readonly emplois: readonly unknown[]
  readonly rdvAccount: unknown
}

const partage: {
  personne?: Personne
  partagee?: StatistiquesPartagees
} = {}

const partagee = (): StatistiquesPartagees => {
  assert.ok(partage.partagee, "Aucune statistique n'a été partagée")
  return partage.partagee
}

Given('une personne à la fois médiatrice et coordinatrice', () => {
  partage.personne = personne
})

When(
  'elle partage ses statistiques depuis son profil de {string}',
  (profil: string) => {
    assert.ok(partage.personne, "Aucune personne n'a été décrite")
    const proprietaire = proprietaires[profil]
    assert.ok(proprietaire, `Profil inconnu : ${profil}`)
    partage.partagee = utilisateurDuPartage(proprietaire, partage.personne)
  },
)

Then('les statistiques partagées ne comprennent pas son équipe', () => {
  assert.strictEqual(partagee().coordinateur, null)
})

Then('les statistiques partagées comprennent son équipe', () => {
  assert.deepStrictEqual(partagee().coordinateur, personne.coordinateur)
})

Then(
  'les statistiques partagées ne livrent ni ses emplois ni son compte de rendez-vous',
  () => {
    assert.deepStrictEqual(
      { emplois: partagee().emplois, rdvAccount: partagee().rdvAccount },
      { emplois: [], rdvAccount: null },
    )
  },
)
