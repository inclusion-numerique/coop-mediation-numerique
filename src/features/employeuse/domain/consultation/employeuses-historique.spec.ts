import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { AdresseEmployeuse } from '../adresse-employeuse'
import type { Affectation } from '../affectation/affectation'
import type { Contrat } from '../affectation/contrat'
import { PeriodeEmploi } from '../affectation/periode-emploi'
import { SourceAffectation } from '../affectation/source-affectation'
import { ContactReferent } from '../contact-referent'
import { DenominationEmployeuse } from '../denomination-employeuse'
import type { Employeuse } from '../employeuse'
import { EmployeuseId } from '../employeuse-id'
import { employeusesHistorique } from './employeuses-historique'

const structure1: Employeuse = {
  id: EmployeuseId(1),
  denomination: DenominationEmployeuse('Structure 1'),
  denominationSirene: DenominationEmployeuse('Structure 1'),
  siret: Siret('99999999999991'),
  rna: null,
  adresse: AdresseEmployeuse({
    voie: '12 rue des Tests',
    codePostal: '44000',
    codeInsee: '44109',
    commune: 'Nantes',
  }),
  contactReferent: ContactReferent(null),
  creation: null,
  modification: null,
  suppression: null,
}

const structure2: Employeuse = {
  ...structure1,
  id: EmployeuseId(2),
  denomination: DenominationEmployeuse('Structure 2'),
  denominationSirene: DenominationEmployeuse('Structure 2'),
  siret: Siret('99999999999992'),
}

const janvier2025 = new Date('2025-01-01')
const janvier2026 = new Date('2026-01-01')
const lointain = new Date('2100-01-01')

const affectationCoopActiveChezStructure1: Affectation = {
  employeuse: structure1,
  source: SourceAffectation('coop'),
  active: true,
  depuis: janvier2026,
}

const affectationCoopActiveChezStructure2: Affectation = {
  ...affectationCoopActiveChezStructure1,
  employeuse: structure2,
}

const contratSansDateChezStructure1: Contrat = {
  employeuse: structure1,
  periode: PeriodeEmploi({
    debut: null,
    fin: null,
    rupture: null,
    maintenant: lointain,
  }),
}

const contratOuvertDepuis2024ChezStructure1: Contrat = {
  employeuse: structure1,
  periode: PeriodeEmploi({
    debut: new Date('2024-01-01'),
    fin: null,
    rupture: null,
    maintenant: lointain,
  }),
}

const contratDe2020a2021ChezStructure1: Contrat = {
  employeuse: structure1,
  periode: PeriodeEmploi({
    debut: new Date('2020-01-01'),
    fin: new Date('2021-12-31'),
    rupture: null,
    maintenant: lointain,
  }),
}

const contratOuvertDepuis2026ChezStructure2: Contrat = {
  employeuse: structure2,
  periode: PeriodeEmploi({
    debut: janvier2026,
    fin: null,
    rupture: null,
    maintenant: lointain,
  }),
}

describe('employeusesHistorique', () => {
  it('retient les employeuses en cours comme passées', () => {
    expect(
      employeusesHistorique(
        [
          affectationCoopActiveChezStructure1,
          {
            employeuse: structure2,
            source: SourceAffectation('idposte'),
            active: false,
            depuis: janvier2026,
          },
        ],
        [],
      ),
    ).toEqual([
      {
        employeuse: structure1,
        affectationActive: true,
        periode: { _tag: 'inconnue' },
        depuis: janvier2026,
      },
      {
        employeuse: structure2,
        affectationActive: false,
        periode: { _tag: 'inconnue' },
        depuis: janvier2026,
      },
    ])
  })

  it('ne fait qu’une entrée, en cours depuis le plus ancien rattachement, d’une employeuse rattachée par le dispositif et par le déclaratif', () => {
    expect(
      employeusesHistorique(
        [
          {
            employeuse: structure1,
            source: SourceAffectation('coop'),
            active: false,
            depuis: janvier2025,
          },
          {
            employeuse: structure1,
            source: SourceAffectation('idposte'),
            active: true,
            depuis: janvier2026,
          },
        ],
        [],
      ),
    ).toEqual([
      {
        employeuse: structure1,
        affectationActive: true,
        periode: { _tag: 'inconnue' },
        depuis: janvier2025,
      },
    ])
  })

  it('rattache la période du contrat à son employeuse', () => {
    expect(
      employeusesHistorique(
        [
          affectationCoopActiveChezStructure1,
          affectationCoopActiveChezStructure2,
        ],
        [contratOuvertDepuis2026ChezStructure2],
      ),
    ).toEqual([
      {
        employeuse: structure1,
        affectationActive: true,
        periode: { _tag: 'inconnue' },
        depuis: janvier2026,
      },
      {
        employeuse: structure2,
        affectationActive: true,
        periode: { _tag: 'enCours', debut: janvier2026, finPrevue: null },
        depuis: janvier2026,
      },
    ])
  })

  it('est vide sans aucun rattachement', () => {
    expect(employeusesHistorique([], [])).toEqual([])
  })

  it('ne date pas l’entrée chez une employeuse dont aucun rattachement n’est daté', () => {
    expect(
      employeusesHistorique(
        [{ ...affectationCoopActiveChezStructure1, depuis: null }],
        [],
      ),
    ).toEqual([
      {
        employeuse: structure1,
        affectationActive: true,
        periode: { _tag: 'inconnue' },
        depuis: null,
      },
    ])
  })

  it('retient la période du contrat le plus récemment commencé chez l’employeuse', () => {
    expect(
      employeusesHistorique(
        [affectationCoopActiveChezStructure1],
        [
          contratSansDateChezStructure1,
          contratDe2020a2021ChezStructure1,
          contratOuvertDepuis2024ChezStructure1,
          contratSansDateChezStructure1,
          contratOuvertDepuis2026ChezStructure2,
        ],
      ),
    ).toEqual([
      {
        employeuse: structure1,
        affectationActive: true,
        periode: {
          _tag: 'enCours',
          debut: new Date('2024-01-01'),
          finPrevue: null,
        },
        depuis: janvier2026,
      },
    ])
  })
})
