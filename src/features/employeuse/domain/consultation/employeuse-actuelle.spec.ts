import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { AdresseEmployeuse } from '../adresse-employeuse'
import type { Contrat } from '../affectation/contrat'
import { PeriodeEmploi } from '../affectation/periode-emploi'
import { SourceAffectation } from '../affectation/source-affectation'
import { ContactReferent } from '../contact-referent'
import { DenominationEmployeuse } from '../denomination-employeuse'
import type { Employeuse } from '../employeuse'
import { EmployeuseId } from '../employeuse-id'
import { employeuseActuelle } from './employeuse-actuelle'

const nantes = AdresseEmployeuse({
  voie: '12 rue des Tests',
  codePostal: '44000',
  codeInsee: '44109',
  commune: 'Nantes',
})

const structure1: Employeuse = {
  id: EmployeuseId(1),
  denomination: DenominationEmployeuse('Structure 1'),
  denominationSirene: DenominationEmployeuse('Structure 1'),
  siret: Siret('99999999999991'),
  rna: null,
  adresse: nantes,
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

const lointain = new Date('2100-01-01')

const contratOuvertChezStructure1: Contrat = {
  employeuse: structure1,
  periode: PeriodeEmploi({
    debut: new Date('2020-01-01'),
    fin: null,
    rupture: null,
    maintenant: lointain,
  }),
}

const contratTermineChezStructure2: Contrat = {
  employeuse: structure2,
  periode: PeriodeEmploi({
    debut: new Date('2026-03-01'),
    fin: new Date('2026-09-01'),
    rupture: null,
    maintenant: lointain,
  }),
}

const contratOuvertChezStructure2: Contrat = {
  employeuse: structure2,
  periode: PeriodeEmploi({
    debut: new Date('2026-03-01'),
    fin: null,
    rupture: null,
    maintenant: lointain,
  }),
}

describe('employeuseActuelle', () => {
  it('retient l’employeuse, la source et la période du contrat de l’employeuse actuelle', () => {
    expect(
      employeuseActuelle(
        { employeuse: structure2, source: SourceAffectation('idposte') },
        [contratOuvertChezStructure1, contratTermineChezStructure2],
      ),
    ).toEqual({
      employeuse: structure2,
      source: 'idposte',
      periode: {
        _tag: 'terminee',
        debut: new Date('2026-03-01'),
        fin: new Date('2026-09-01'),
      },
    })
  })

  it('rend la période inconnue, et non un emploi commencé à une date nulle, quand aucun contrat ne couvre l’employeuse', () => {
    expect(
      employeuseActuelle(
        { employeuse: structure1, source: SourceAffectation('coop') },
        [],
      ),
    ).toEqual({
      employeuse: structure1,
      source: 'coop',
      periode: { _tag: 'inconnue' },
    })
  })

  it('ignore un contrat qui vise une autre employeuse', () => {
    expect(
      employeuseActuelle(
        { employeuse: structure1, source: SourceAffectation('coop') },
        [contratOuvertChezStructure2],
      ),
    ).toEqual({
      employeuse: structure1,
      source: 'coop',
      periode: { _tag: 'inconnue' },
    })
  })

  it('n’a pas d’employeuse sans affectation active', () => {
    expect(employeuseActuelle(null, [])).toBeNull()
  })
})
