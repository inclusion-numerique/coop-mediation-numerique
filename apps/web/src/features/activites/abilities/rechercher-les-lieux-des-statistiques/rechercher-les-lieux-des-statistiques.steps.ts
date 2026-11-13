import assert from 'node:assert'
import { CodeDepartement, CodeInsee } from '@app/web/libraries/insee'
import { Then, When } from '@cucumber/cucumber'
import { LieuActiviteId } from '../../domain'
import { lieuSeme, perimetreDe } from '../../statistiques.cucumber'
import {
  GenreDeLieu,
  type LieuDesStatistiques,
  nommerLesLieuxChoisis,
  rechercherLesLieuxDesStatistiques,
} from '.'
import { optionDeLieu } from './ui'

let proposes: readonly LieuDesStatistiques[] = []

const GENRES: Readonly<Record<string, GenreDeLieu>> = {
  communes: GenreDeLieu('Commune'),
  départements: GenreDeLieu('Departement'),
}

When(
  '{string} cherche {string} parmi les {word} de ses statistiques',
  async (nom: string, recherche: string, genre: string) => {
    const genreDeLieu = GENRES[genre]
    assert.ok(genreDeLieu, `Genre inconnu : ${genre}`)
    proposes = await rechercherLesLieuxDesStatistiques({
      perimetre: perimetreDe(nom),
      genre: genreDeLieu,
      recherche,
    })
  },
)

When(
  "{string} cherche {string} parmi les lieux d'activité de ses statistiques",
  async (nom: string, recherche: string) => {
    proposes = await rechercherLesLieuxDesStatistiques({
      perimetre: perimetreDe(nom),
      genre: GenreDeLieu('LieuDActivite'),
      recherche,
    })
  },
)

When(
  '{string} nomme le lieu {string}, la commune {string} et le département {string}',
  async (nom: string, lieu: string, commune: string, departement: string) => {
    proposes = await nommerLesLieuxChoisis(
      {
        lieux: [LieuActiviteId(lieuSeme(lieu))],
        communes: [CodeInsee(commune)],
        departements: [CodeDepartement(departement)],
      },
      perimetreDe(nom),
    )
  },
)

When('{string} nomme le lieu {string}', async (nom: string, lieu: string) => {
  proposes = await nommerLesLieuxChoisis(
    { lieux: [LieuActiviteId(lieuSeme(lieu))], communes: [], departements: [] },
    perimetreDe(nom),
  )
})

Then('les lieux proposés sont {string}', (attendus: string) => {
  assert.strictEqual(
    proposes.map((lieu) => optionDeLieu(lieu).label).join(', '),
    attendus,
  )
})
