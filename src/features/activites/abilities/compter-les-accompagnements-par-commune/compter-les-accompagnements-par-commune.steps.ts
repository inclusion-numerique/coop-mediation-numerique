import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import type { CommuneComptee } from '../../domain'
import { demandeDeStatistiques } from '../../statistiques.cucumber'
import { type AccompagnementsParCommune } from './domain/index'
import { compterLesAccompagnementsParCommune } from './implementations/prisma/accompagnements-par-commune.query'

let parCommune: AccompagnementsParCommune | undefined

const enTexte = (commune: CommuneComptee): string =>
  commune.type === 'NonCommuniquee'
    ? 'Non communiquée'
    : `${commune.commune.nom} · ${commune.commune.codePostal}`

When(
  'je compte les accompagnements de {string} par commune',
  async (nom: string) => {
    parCommune = await compterLesAccompagnementsParCommune(
      demandeDeStatistiques(nom),
    )
  },
)

Then('les communes comptées sont {string}', (attendues: string) => {
  assert.ok(parCommune, 'Aucun compte par commune')
  assert.strictEqual(
    parCommune
      .map(({ commune, nombre }) => `${enTexte(commune)} ${nombre}`)
      .join(', '),
    attendues,
  )
})
