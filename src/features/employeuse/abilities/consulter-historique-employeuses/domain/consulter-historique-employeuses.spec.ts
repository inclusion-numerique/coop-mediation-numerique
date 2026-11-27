import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import { AdresseEmployeuse } from '../../../domain/adresse-employeuse'
import type { Affectation } from '../../../domain/affectation/affectation'
import { SourceAffectation } from '../../../domain/affectation/source-affectation'
import type { ContratLu } from '../../../domain/consultation/emploi-lu'
import { ContactReferent } from '../../../domain/contact-referent'
import { DenominationEmployeuse } from '../../../domain/denomination-employeuse'
import type { Employeuse } from '../../../domain/employeuse'
import { EmployeuseId } from '../../../domain/employeuse-id'
import { UtilisateurId } from '../../../domain/utilisateur-id'
import { consulterHistoriqueEmployeuses } from './consulter-historique-employeuses'

const structure1: Employeuse = {
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

const structure2: Employeuse = {
  ...structure1,
  id: EmployeuseId(2),
  denomination: DenominationEmployeuse('Structure 2'),
  denominationSirene: DenominationEmployeuse('Structure 2'),
  siret: null,
}

const janvier2025 = new Date('2025-01-01')
const janvier2026 = new Date('2026-01-01')
const lointain = new Date('2100-01-01')

const utilisateurId = UtilisateurId('0927f824-b84d-4840-ae2e-e4a96a7a519b')

const consulter = (
  affectations: readonly Affectation[],
  contrats: readonly ContratLu[],
) =>
  consulterHistoriqueEmployeuses({
    lireLHistoriqueDEmploi: async () => ({ affectations, contrats }),
  })({ utilisateurId, maintenant: lointain })

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

const contratSansDateChezStructure1: ContratLu = {
  employeuse: structure1,
  debut: null,
  fin: null,
  rupture: null,
}

const contratOuvertDepuis2024ChezStructure1: ContratLu = {
  employeuse: structure1,
  debut: new Date('2024-01-01'),
  fin: null,
  rupture: null,
}

const contratDe2020a2021ChezStructure1: ContratLu = {
  employeuse: structure1,
  debut: new Date('2020-01-01'),
  fin: new Date('2021-12-31'),
  rupture: null,
}

const contratOuvertDepuis2026ChezStructure2: ContratLu = {
  employeuse: structure2,
  debut: janvier2026,
  fin: null,
  rupture: null,
}

describe('consulter l’historique des employeuses', () => {
  it('retient les employeuses en cours comme passées', async () => {
    expect(
      await consulter(
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
    ).toEqual(
      success([
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
      ]),
    )
  })

  it('ne fait qu’une entrée, en cours depuis le plus ancien rattachement, d’une employeuse rattachée par le dispositif et par le déclaratif', async () => {
    expect(
      await consulter(
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
    ).toEqual(
      success([
        {
          employeuse: structure1,
          affectationActive: true,
          periode: { _tag: 'inconnue' },
          depuis: janvier2025,
        },
      ]),
    )
  })

  it('rattache la période du contrat à son employeuse', async () => {
    expect(
      await consulter(
        [
          affectationCoopActiveChezStructure1,
          affectationCoopActiveChezStructure2,
        ],
        [contratOuvertDepuis2026ChezStructure2],
      ),
    ).toEqual(
      success([
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
      ]),
    )
  })

  it('est vide sans aucun rattachement', async () => {
    expect(await consulter([], [])).toEqual(success([]))
  })

  it('ne date pas l’entrée chez une employeuse dont aucun rattachement n’est daté', async () => {
    expect(
      await consulter(
        [{ ...affectationCoopActiveChezStructure1, depuis: null }],
        [],
      ),
    ).toEqual(
      success([
        {
          employeuse: structure1,
          affectationActive: true,
          periode: { _tag: 'inconnue' },
          depuis: null,
        },
      ]),
    )
  })

  it('retient la période du contrat le plus récemment commencé chez l’employeuse', async () => {
    expect(
      await consulter(
        [affectationCoopActiveChezStructure1],
        [
          contratSansDateChezStructure1,
          contratDe2020a2021ChezStructure1,
          contratOuvertDepuis2024ChezStructure1,
          contratSansDateChezStructure1,
          contratOuvertDepuis2026ChezStructure2,
        ],
      ),
    ).toEqual(
      success([
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
      ]),
    )
  })

  it('est vide pour un utilisateur sans personne connue', async () => {
    expect(
      await consulterHistoriqueEmployeuses({
        lireLHistoriqueDEmploi: async () => null,
      })({ utilisateurId, maintenant: lointain }),
    ).toEqual(success([]))
  })
})
