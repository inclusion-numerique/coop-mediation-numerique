import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import { AdresseEmployeuse } from '../../../domain/adresse-employeuse'
import { SourceAffectation } from '../../../domain/affectation/source-affectation'
import type {
  ContratLu,
  EmploiActuelLu,
} from '../../../domain/consultation/emploi-lu'
import { ContactReferent } from '../../../domain/contact-referent'
import { DenominationEmployeuse } from '../../../domain/denomination-employeuse'
import type { Employeuse } from '../../../domain/employeuse'
import { EmployeuseId } from '../../../domain/employeuse-id'
import { UtilisateurId } from '../../../domain/utilisateur-id'
import { consulterEmployeuseActuelle } from './consulter-employeuse-actuelle'

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
  siret: null,
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
  siret: null,
}

const lointain = new Date('2100-01-01')

const utilisateurId = UtilisateurId('0927f824-b84d-4840-ae2e-e4a96a7a519b')

const consulter = (emploi: EmploiActuelLu | null) =>
  consulterEmployeuseActuelle({ lireLEmploiActuel: async () => emploi })({
    utilisateurId,
    maintenant: lointain,
  })

const contratOuvertChezStructure1: ContratLu = {
  employeuse: structure1,
  debut: new Date('2020-01-01'),
  fin: null,
  rupture: null,
}

const contratTermineChezStructure2: ContratLu = {
  employeuse: structure2,
  debut: new Date('2026-03-01'),
  fin: new Date('2026-09-01'),
  rupture: null,
}

const contratOuvertChezStructure2: ContratLu = {
  employeuse: structure2,
  debut: new Date('2026-03-01'),
  fin: null,
  rupture: null,
}

describe('consulter l’employeuse actuelle', () => {
  it('retient l’employeuse, la source et la période du contrat de l’employeuse actuelle', async () => {
    expect(
      await consulter({
        affectationActuelle: {
          employeuse: structure2,
          source: SourceAffectation('idposte'),
        },
        contrats: [contratOuvertChezStructure1, contratTermineChezStructure2],
      }),
    ).toEqual(
      success({
        employeuse: structure2,
        source: 'idposte',
        periode: {
          _tag: 'terminee',
          debut: new Date('2026-03-01'),
          fin: new Date('2026-09-01'),
        },
      }),
    )
  })

  it('rend la période inconnue, et non un emploi commencé à une date nulle, quand aucun contrat ne couvre l’employeuse', async () => {
    expect(
      await consulter({
        affectationActuelle: {
          employeuse: structure1,
          source: SourceAffectation('coop'),
        },
        contrats: [],
      }),
    ).toEqual(
      success({
        employeuse: structure1,
        source: 'coop',
        periode: { _tag: 'inconnue' },
      }),
    )
  })

  it('ignore un contrat qui vise une autre employeuse', async () => {
    expect(
      await consulter({
        affectationActuelle: {
          employeuse: structure1,
          source: SourceAffectation('coop'),
        },
        contrats: [contratOuvertChezStructure2],
      }),
    ).toEqual(
      success({
        employeuse: structure1,
        source: 'coop',
        periode: { _tag: 'inconnue' },
      }),
    )
  })

  it('n’a pas d’employeuse sans affectation active', async () => {
    expect(
      await consulter({ affectationActuelle: null, contrats: [] }),
    ).toEqual(success(null))
  })

  it('n’a pas d’employeuse pour un utilisateur sans personne connue', async () => {
    expect(await consulter(null)).toEqual(success(null))
  })
})
