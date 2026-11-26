import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { type Acteur, TagId } from '@/features/tags/domain'
import {
  acteurMediateur,
  semerUnMediateur,
  semerUnTag,
} from '@/features/tags/tags.cucumber'
import { lireUnTagActif } from '../../implementations/prisma/tag-actif.query'
import type { DestinationDeFusion } from './domain'
import { rechercherDesDestinations } from './domain/rechercher-des-destinations'
import { lireLesCandidatesALaFusion } from './implementations/prisma/destinations-de-fusion.query'

const rechercherEnBase = rechercherDesDestinations({
  lireUnTagActif,
  lireLesCandidates: lireLesCandidatesALaFusion,
})

const contexte: {
  acteur?: Acteur
  sourceId?: string
  candidatId?: string
  autreTagId?: string
  proposees?: readonly DestinationDeFusion[]
} = {}

const valeur = <T>(valeur: T | undefined): T => {
  assert.ok(valeur)
  return valeur
}

Given('un médiateur dont le tag personnel est à fusionner', async () => {
  const { mediateurId } = await semerUnMediateur()
  contexte.acteur = acteurMediateur({ mediateurId })
  contexte.sourceId = await semerUnTag({ mediateurId })
})

Given('un tag national candidat à la fusion', async () => {
  contexte.candidatId = await semerUnTag({})
})

Given("un tag personnel d'un autre médiateur", async () => {
  const { mediateurId } = await semerUnMediateur()
  contexte.autreTagId = await semerUnTag({ mediateurId })
})

When('ce médiateur cherche où fusionner son tag', async () => {
  const proposees = await rechercherEnBase({
    acteur: valeur(contexte.acteur),
    sourceId: TagId(valeur(contexte.sourceId)),
    recherche: '',
    limite: 1000,
  })
  contexte.proposees = proposees.data
})

const proposes = (): readonly string[] =>
  valeur(contexte.proposees).map(({ tag }) => tag.id)

Then('le tag candidat est proposé', () => {
  assert.ok(proposes().includes(valeur(contexte.candidatId)))
})

Then(
  "ni le tag à fusionner ni le tag de l'autre médiateur ne sont proposés",
  () => {
    assert.ok(!proposes().includes(valeur(contexte.sourceId)))
    assert.ok(!proposes().includes(valeur(contexte.autreTagId)))
  },
)
