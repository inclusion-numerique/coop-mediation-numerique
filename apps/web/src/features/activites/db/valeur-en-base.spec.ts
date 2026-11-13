import {
  GENRES,
  MATERIELS,
  STATUTS_SOCIAUX,
  THEMATIQUES_RECHERCHEES,
  TRANCHES_D_AGE,
  TYPES_D_ACTIVITE,
  TYPES_DE_LIEU,
} from '../domain'
import { valeurEnBase } from './valeur-en-base'

describe('valeur en base', () => {
  it.each([
    ['ADistance', 'a_distance'],
    ['LieuActivite', 'lieu_activite'],
    ['DixHuitVingtQuatre', 'dix_huit_vingt_quatre'],
    ['NonCommunique', 'non_communique'],
    ['PapiersElectionsCitoyennete', 'papiers_elections_citoyennete'],
  ])('%s est stocké %s', (valeur, enBase) => {
    expect(valeurEnBase(valeur)).toBe(enBase)
  })

  it.each([
    ['types d’activité', TYPES_D_ACTIVITE],
    ['types de lieu', TYPES_DE_LIEU],
    ['matériels', MATERIELS],
    ['thématiques', THEMATIQUES_RECHERCHEES],
    ['genres', GENRES],
    ['tranches d’âge', TRANCHES_D_AGE],
    ['statuts sociaux', STATUTS_SOCIAUX],
  ])('deux %s ne partagent jamais la même valeur en base', (_, valeurs) => {
    expect(new Set(valeurs.map(valeurEnBase)).size).toBe(valeurs.length)
  })
})
