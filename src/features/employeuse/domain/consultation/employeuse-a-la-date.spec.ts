import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { AdresseEmployeuse } from '../adresse-employeuse'
import type { Contrat } from '../affectation/contrat'
import { PeriodeEmploi } from '../affectation/periode-emploi'
import { ContactReferent } from '../contact-referent'
import { DenominationEmployeuse } from '../denomination-employeuse'
import type { Employeuse } from '../employeuse'
import { EmployeuseId } from '../employeuse-id'
import { employeuseALaDate } from './employeuse-a-la-date'

const actuelle: Employeuse = {
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

const structure10: Employeuse = {
  ...actuelle,
  id: EmployeuseId(10),
  denomination: DenominationEmployeuse('Structure 10'),
  denominationSirene: DenominationEmployeuse('Structure 10'),
  siret: Siret('99999999999910'),
}

const structure11: Employeuse = {
  ...actuelle,
  id: EmployeuseId(11),
  denomination: DenominationEmployeuse('Structure 11'),
  denominationSirene: DenominationEmployeuse('Structure 11'),
  siret: Siret('99999999999911'),
}

const structure12: Employeuse = {
  ...actuelle,
  id: EmployeuseId(12),
  denomination: DenominationEmployeuse('Structure 12'),
  denominationSirene: DenominationEmployeuse('Structure 12'),
  siret: Siret('99999999999912'),
}

const lointain = new Date('2100-01-01')

const contrat2025ChezStructure10: Contrat = {
  employeuse: structure10,
  periode: PeriodeEmploi({
    debut: new Date('2025-01-01'),
    fin: new Date('2025-12-31'),
    rupture: null,
    maintenant: lointain,
  }),
}

const contratOuvertDepuis2024ChezStructure10: Contrat = {
  employeuse: structure10,
  periode: PeriodeEmploi({
    debut: new Date('2024-01-01'),
    fin: null,
    rupture: null,
    maintenant: lointain,
  }),
}

const contratOuvertDepuis2025ChezStructure11: Contrat = {
  employeuse: structure11,
  periode: PeriodeEmploi({
    debut: new Date('2025-01-01'),
    fin: null,
    rupture: null,
    maintenant: lointain,
  }),
}

const contratOuvertDepuis2026ChezStructure11: Contrat = {
  employeuse: structure11,
  periode: PeriodeEmploi({
    debut: new Date('2026-01-01'),
    fin: null,
    rupture: null,
    maintenant: lointain,
  }),
}

const contratOuvertDepuisMars2026ChezStructure12: Contrat = {
  employeuse: structure12,
  periode: PeriodeEmploi({
    debut: new Date('2026-03-01'),
    fin: null,
    rupture: null,
    maintenant: lointain,
  }),
}

const juin2026 = new Date('2026-06-01')

describe('employeuseALaDate', () => {
  it('retient l’employeuse du contrat qui couvre la date plutôt que l’affectation active', () => {
    expect(
      employeuseALaDate(
        actuelle,
        [contrat2025ChezStructure10, contratOuvertDepuis2026ChezStructure11],
        new Date('2025-06-01'),
      ),
    ).toEqual(structure10)
  })

  it('retient le contrat toujours ouvert pour une date postérieure à son début', () => {
    expect(
      employeuseALaDate(
        actuelle,
        [contratOuvertDepuis2026ChezStructure11],
        juin2026,
      ),
    ).toEqual(structure11)
  })

  it('retombe sur l’employeuse courante quand aucun contrat ne couvre la date', () => {
    expect(employeuseALaDate(actuelle, [], juin2026)).toEqual(actuelle)
  })

  it('retombe sur l’employeuse courante pour une date antérieure à tout contrat', () => {
    expect(
      employeuseALaDate(
        actuelle,
        [contratOuvertDepuis2026ChezStructure11],
        new Date('2020-06-01'),
      ),
    ).toEqual(actuelle)
  })

  it('n’a pas d’employeuse sans affectation ni contrat', () => {
    expect(employeuseALaDate(null, [], juin2026)).toBeNull()
  })

  it('retient le contrat le plus récemment commencé quand plusieurs couvrent la date', () => {
    expect(
      employeuseALaDate(
        actuelle,
        [
          contratOuvertDepuis2024ChezStructure10,
          contratOuvertDepuisMars2026ChezStructure12,
          contratOuvertDepuis2025ChezStructure11,
        ],
        juin2026,
      ),
    ).toEqual(structure12)
  })
})
