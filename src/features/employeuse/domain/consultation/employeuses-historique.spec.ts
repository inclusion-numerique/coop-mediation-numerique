import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { AdresseEmployeuse } from '../adresse-employeuse'
import { type Affectation } from '../affectation/affectation'
import { type Contrat } from '../affectation/contrat'
import { PeriodeEmploi } from '../affectation/periode-emploi'
import { SourceAffectation } from '../affectation/source-affectation'
import { DenominationEmployeuse } from '../denomination-employeuse'
import { type Employeuse } from '../employeuse'
import { EmployeuseId } from '../employeuse-id'
import { employeusesHistorique } from './employeuses-historique'

const employeuse = (
  id: number,
  overrides: Partial<Employeuse> = {},
): Employeuse => ({
  id: EmployeuseId(id),
  denomination: DenominationEmployeuse(`Structure ${id}`),
  denominationSirene: DenominationEmployeuse(`Structure ${id}`),
  siret: Siret(`${id}`.padStart(14, '9')),
  rna: null,
  adresse: AdresseEmployeuse({
    voie: '12 rue des Tests',
    codePostal: '44000',
    codeInsee: '44109',
    commune: 'Nantes',
  }),
  contactReferent: { _tag: 'nonRenseigne' },
  creation: null,
  modification: null,
  suppression: null,
  ...overrides,
})

const affectation = (
  source: string,
  employeuseId: number,
  depuis: Date | null = new Date('2026-01-01'),
): Affectation => ({
  employeuse: employeuse(employeuseId),
  source: SourceAffectation(source),
  active: true,
  depuis,
})

const contrat = (
  employeuseId: number,
  dates: {
    debut?: Date | null
    fin?: Date | null
    rupture?: Date | null
    maintenant?: Date
  } = {},
): Contrat => ({
  employeuse: employeuse(employeuseId),
  periode: PeriodeEmploi({
    debut: dates.debut ?? null,
    fin: dates.fin ?? null,
    rupture: dates.rupture ?? null,
    maintenant: dates.maintenant ?? new Date('2100-01-01'),
  }),
})

describe('employeusesHistorique', () => {
  it('retient les employeuses en cours comme passées', () => {
    const historique = employeusesHistorique(
      [affectation('coop', 1), { ...affectation('idposte', 2), active: false }],
      [],
    )

    expect(
      historique.map(({ employeuse, affectationActive }) => [
        employeuse.id,
        affectationActive,
      ]),
    ).toEqual([
      [1, true],
      [2, false],
    ])
  })

  // Une personne peut être rattachée deux fois à la même structure — une par le
  // dispositif, une par le déclaratif — et l'admin doit y voir un seul employeur.
  it('ne fait qu’une entrée d’une employeuse rattachée par deux sources', () => {
    const historique = employeusesHistorique(
      [
        { ...affectation('coop', 1, new Date('2025-01-01')), active: false },
        affectation('idposte', 1, new Date('2026-01-01')),
      ],
      [],
    )

    expect(historique).toHaveLength(1)
    // En cours dès qu'un des rattachements l'est, depuis le plus ancien des deux.
    expect(historique[0]?.affectationActive).toBe(true)
    expect(historique[0]?.depuis).toEqual(new Date('2025-01-01'))
  })

  it('rattache la période du contrat à son employeuse', () => {
    const historique = employeusesHistorique(
      [affectation('coop', 1), affectation('coop', 2)],
      [contrat(2, { debut: new Date('2026-01-01') })],
    )

    expect(historique[0]?.periode).toEqual({ _tag: 'inconnue' })
    expect(historique[1]?.periode).toEqual({
      _tag: 'enCours',
      debut: new Date('2026-01-01'),
      finPrevue: null,
    })
  })

  it('est vide sans aucun rattachement', () => {
    expect(employeusesHistorique([], [])).toEqual([])
  })

  it('ne date pas l’entrée chez une employeuse dont aucun rattachement n’est daté', () => {
    expect(
      employeusesHistorique([affectation('coop', 1, null)], []),
    ).toMatchObject([{ depuis: null }])
  })

  it('retient la période du contrat le plus récemment commencé chez l’employeuse', () => {
    expect(
      employeusesHistorique(
        [affectation('coop', 1)],
        [
          contrat(1),
          contrat(1, {
            debut: new Date('2020-01-01'),
            fin: new Date('2021-12-31'),
          }),
          contrat(1, { debut: new Date('2024-01-01') }),
          contrat(1),
          contrat(2, { debut: new Date('2026-01-01') }),
        ],
      ),
    ).toMatchObject([
      {
        periode: {
          _tag: 'enCours',
          debut: new Date('2024-01-01'),
          finPrevue: null,
        },
      },
    ])
  })
})
