import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import { AdresseEmployeuse } from '../../../domain/adresse-employeuse'
import { SourceAffectation } from '../../../domain/affectation/source-affectation'
import type { ContratLu } from '../../../domain/consultation/emploi-lu'
import type { AffectationActuelle } from '../../../domain/consultation/employeuse-actuelle'
import { ContactReferent } from '../../../domain/contact-referent'
import { DenominationEmployeuse } from '../../../domain/denomination-employeuse'
import type { Employeuse } from '../../../domain/employeuse'
import { EmployeuseId } from '../../../domain/employeuse-id'
import { UtilisateurId } from '../../../domain/utilisateur-id'
import { consulterEmployeuseAUneDate } from './consulter-employeuse-a-une-date'

const actuelle: Employeuse = {
  id: EmployeuseId(1),
  denomination: DenominationEmployeuse('Structure 1'),
  denominationSirene: DenominationEmployeuse('Structure 1'),
  siret: null,
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
  siret: null,
}

const structure11: Employeuse = {
  ...actuelle,
  id: EmployeuseId(11),
  denomination: DenominationEmployeuse('Structure 11'),
  denominationSirene: DenominationEmployeuse('Structure 11'),
  siret: null,
}

const structure12: Employeuse = {
  ...actuelle,
  id: EmployeuseId(12),
  denomination: DenominationEmployeuse('Structure 12'),
  denominationSirene: DenominationEmployeuse('Structure 12'),
  siret: null,
}

const lointain = new Date('2100-01-01')

const utilisateurId = UtilisateurId('0927f824-b84d-4840-ae2e-e4a96a7a519b')

const affectationActuelle: AffectationActuelle = {
  employeuse: actuelle,
  source: SourceAffectation('coop'),
}

const consulter = (
  affectationActuelle: AffectationActuelle | null,
  contrats: readonly ContratLu[],
  date: Date,
) =>
  consulterEmployeuseAUneDate({
    lireLEmploiActuel: async () => ({
      affectationActuelle,
      contrats,
    }),
  })({ utilisateurId, date, maintenant: lointain })

const contrat2025ChezStructure10: ContratLu = {
  employeuse: structure10,
  debut: new Date('2025-01-01'),
  fin: new Date('2025-12-31'),
  rupture: null,
}

const contratOuvertDepuis2024ChezStructure10: ContratLu = {
  employeuse: structure10,
  debut: new Date('2024-01-01'),
  fin: null,
  rupture: null,
}

const contratOuvertDepuis2025ChezStructure11: ContratLu = {
  employeuse: structure11,
  debut: new Date('2025-01-01'),
  fin: null,
  rupture: null,
}

const contratOuvertDepuis2026ChezStructure11: ContratLu = {
  employeuse: structure11,
  debut: new Date('2026-01-01'),
  fin: null,
  rupture: null,
}

const contratOuvertDepuisMars2026ChezStructure12: ContratLu = {
  employeuse: structure12,
  debut: new Date('2026-03-01'),
  fin: null,
  rupture: null,
}

const juin2026 = new Date('2026-06-01')

describe('consulter l’employeuse à une date', () => {
  it('retient l’employeuse du contrat qui couvre la date plutôt que l’affectation active', async () => {
    expect(
      await consulter(
        affectationActuelle,
        [contrat2025ChezStructure10, contratOuvertDepuis2026ChezStructure11],
        new Date('2025-06-01'),
      ),
    ).toEqual(success(structure10))
  })

  it('retient le contrat toujours ouvert pour une date postérieure à son début', async () => {
    expect(
      await consulter(
        affectationActuelle,
        [contratOuvertDepuis2026ChezStructure11],
        juin2026,
      ),
    ).toEqual(success(structure11))
  })

  it('retombe sur l’employeuse courante quand aucun contrat ne couvre la date', async () => {
    expect(await consulter(affectationActuelle, [], juin2026)).toEqual(
      success(actuelle),
    )
  })

  it('retombe sur l’employeuse courante pour une date antérieure à tout contrat', async () => {
    expect(
      await consulter(
        affectationActuelle,
        [contratOuvertDepuis2026ChezStructure11],
        new Date('2020-06-01'),
      ),
    ).toEqual(success(actuelle))
  })

  it('n’a pas d’employeuse pour un utilisateur sans personne connue', async () => {
    expect(
      await consulterEmployeuseAUneDate({
        lireLEmploiActuel: async () => null,
      })({ utilisateurId, date: juin2026, maintenant: lointain }),
    ).toEqual(success(null))
  })

  it('n’a pas d’employeuse sans affectation ni contrat', async () => {
    expect(await consulter(null, [], juin2026)).toEqual(success(null))
  })

  it('retient le contrat le plus récemment commencé quand plusieurs couvrent la date', async () => {
    expect(
      await consulter(
        affectationActuelle,
        [
          contratOuvertDepuis2024ChezStructure10,
          contratOuvertDepuisMars2026ChezStructure12,
          contratOuvertDepuis2025ChezStructure11,
        ],
        juin2026,
      ),
    ).toEqual(success(structure12))
  })
})
