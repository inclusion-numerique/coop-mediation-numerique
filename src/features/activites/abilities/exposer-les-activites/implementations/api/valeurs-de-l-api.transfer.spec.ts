import { describe, expect, it } from 'vitest'
import {
  AUTONOMIES,
  MATERIELS,
  NIVEAUX_D_ATELIER,
  STRUCTURES_DE_REDIRECTION,
  THEMATIQUES_ADMINISTRATIVES,
  THEMATIQUES_DE_MEDIATION,
  TYPES_D_ACTIVITE,
  TYPES_DE_LIEU,
} from '../../../../domain'
import {
  autonomieApiValues,
  materielApiValues,
  niveauAtelierApiValues,
  structureDeRedirectionApiValues,
  thematiqueApiValues,
  typeActiviteApiValues,
  typeLieuApiValues,
} from './valeurs-de-l-api.transfer'

const TABLES = [
  {
    nom: 'matériel',
    table: materielApiValues,
    domaine: [...MATERIELS, 'Aucun'],
  },
  { nom: 'type de lieu', table: typeLieuApiValues, domaine: TYPES_DE_LIEU },
  { nom: 'autonomie', table: autonomieApiValues, domaine: AUTONOMIES },
  {
    nom: 'niveau d’atelier',
    table: niveauAtelierApiValues,
    domaine: NIVEAUX_D_ATELIER,
  },
  {
    nom: 'structure de redirection',
    table: structureDeRedirectionApiValues,
    domaine: STRUCTURES_DE_REDIRECTION,
  },
  {
    nom: 'type d’activité',
    table: typeActiviteApiValues,
    domaine: TYPES_D_ACTIVITE,
  },
  {
    nom: 'thématique',
    table: thematiqueApiValues,
    domaine: [
      ...THEMATIQUES_DE_MEDIATION,
      'AideAuxDemarchesAdministratives',
      ...THEMATIQUES_ADMINISTRATIVES,
    ],
  },
]

const SNAKE_CASE = /^[a-z]+(_[a-z]+)*$/

describe('valeurs de l’API', () => {
  it.each(TABLES)(
    'traduit chaque valeur du domaine pour $nom',
    ({ table, domaine }) => {
      expect(new Set(Object.keys(table))).toEqual(new Set(domaine))
    },
  )

  it.each(TABLES)(
    'donne une valeur d’API distincte à chaque valeur de $nom',
    ({ table }) => {
      expect(new Set(Object.values(table)).size).toBe(
        Object.values(table).length,
      )
    },
  )

  it.each(TABLES)('écrit les valeurs de $nom en snake_case', ({ table }) => {
    expect(
      Object.values(table).filter((valeur) => !SNAKE_CASE.test(valeur)),
    ).toEqual([])
  })

  it('traduit l’aide aux démarches administratives en thématique', () => {
    expect(thematiqueApiValues.AideAuxDemarchesAdministratives).toBe(
      'aide_aux_demarches_administratives',
    )
  })

  it('traduit une thématique administrative', () => {
    expect(thematiqueApiValues.PapiersElectionsCitoyennete).toBe(
      'papiers_elections_citoyennete',
    )
  })

  it('traduit l’absence de matériel', () => {
    expect(materielApiValues.Aucun).toBe('aucun')
  })

  it('traduit l’accompagnement à distance', () => {
    expect(typeLieuApiValues.ADistance).toBe('a_distance')
  })
})
