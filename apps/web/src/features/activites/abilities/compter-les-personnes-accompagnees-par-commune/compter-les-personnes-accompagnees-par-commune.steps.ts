import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import type { CommuneComptee } from '../../domain'
import { demandeDeStatistiques } from '../../statistiques.cucumber'
import {
  compterLesPersonnesAccompagneesParCommune,
  type PersonnesParCommune,
} from '.'

let parCommune: PersonnesParCommune | undefined

const enTexte = (commune: CommuneComptee): string =>
  commune.type === 'NonCommuniquee'
    ? 'Non communiquée'
    : `${commune.commune.nom} · ${commune.commune.codePostal}`

When(
  'je compte les personnes accompagnées par {string} par commune',
  async (nom: string) => {
    parCommune = await compterLesPersonnesAccompagneesParCommune(
      demandeDeStatistiques(nom),
    )
  },
)

Then(
  'les communes de résidence comptées sont {string}',
  (attendues: string) => {
    assert.ok(parCommune, 'Aucun compte par commune de résidence')
    assert.strictEqual(
      parCommune
        .map(({ commune, nombre }) => `${enTexte(commune)} ${nombre}`)
        .join(', '),
      attendues,
    )
  },
)
