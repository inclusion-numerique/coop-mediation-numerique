import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { failure, success } from '@/libraries/result'
import { ContactReferent } from '../../../domain/contact-referent'
import { DenominationEmployeuse } from '../../../domain/denomination-employeuse'
import type { Employeuse } from '../../../domain/employeuse'
import { EmployeuseId } from '../../../domain/employeuse-id'
import { AnnuaireIndisponible } from './errors'
import type { RechercherUneStructureEmployeusePorts } from './ports'
import { rechercherUneStructureEmployeuse } from './rechercher-une-structure-employeuse'

type Etablissement = { readonly nom: string; readonly siret: Siret }

const employeuse = (
  id: number,
  nom: string,
  siret: Siret | null,
): Employeuse => ({
  id: EmployeuseId(id),
  denomination: DenominationEmployeuse(nom),
  denominationSirene: null,
  siret,
  rna: null,
  adresse: null,
  contactReferent: ContactReferent(null),
  creation: null,
  modification: null,
  suppression: null,
})

const SIRET_CROIX_ROUGE = Siret('12345678901234')

const croixRouge = employeuse(1, 'Croix Rouge', SIRET_CROIX_ROUGE)

const croixRougeAuSiege = employeuse(2, 'Croix Rouge siège', SIRET_CROIX_ROUGE)

const secoursPopulaire = employeuse(
  3,
  'Secours populaire',
  Siret('43210987654321'),
)

const sansSiret = employeuse(4, 'Association sans SIRET', null)

const croixRougeDansLAnnuaire: Etablissement = {
  nom: 'CROIX ROUGE',
  siret: SIRET_CROIX_ROUGE,
}

const emmaus: Etablissement = { nom: 'Emmaüs', siret: Siret('11111111111111') }

const ports: RechercherUneStructureEmployeusePorts<Etablissement> = {
  lireLesStructuresDeLaCoop: async () => ({
    employeuses: [croixRouge, croixRougeAuSiege, sansSiret, secoursPopulaire],
    total: 31,
  }),
  lireLAnnuaireDesEntreprises: async () =>
    success({ structures: [croixRougeDansLAnnuaire, emmaus], total: 12 }),
}

describe('rechercher une structure employeuse', () => {
  it('ne cherche rien en deçà de trois caractères', async () => {
    expect(
      await rechercherUneStructureEmployeuse(ports)({ recherche: 'Cr' }),
    ).toEqual(
      success({
        structures: [],
        totalCount: 0,
        moreResults: 0,
        apiUnavailable: false,
      }),
    )
  })

  it('propose d’abord les employeuses de la coop au SIRET connu, une par SIRET, puis celles de l’annuaire qu’elle ne connaît pas', async () => {
    expect(
      await rechercherUneStructureEmployeuse(ports)({ recherche: 'Croix' }),
    ).toEqual(
      success({
        structures: [
          { _tag: 'DeLaCoop', employeuse: croixRouge },
          { _tag: 'DeLaCoop', employeuse: secoursPopulaire },
          { _tag: 'DeLAnnuaire', etablissement: emmaus },
        ],
        totalCount: 3,
        moreResults: 38,
        apiUnavailable: false,
      }),
    )
  })

  it('propose les employeuses de la coop quand l’annuaire est indisponible, et le signale', async () => {
    expect(
      await rechercherUneStructureEmployeuse({
        ...ports,
        lireLAnnuaireDesEntreprises: async () =>
          failure(AnnuaireIndisponible()),
      })({ recherche: 'Croix' }),
    ).toEqual(
      success({
        structures: [
          { _tag: 'DeLaCoop', employeuse: croixRouge },
          { _tag: 'DeLaCoop', employeuse: secoursPopulaire },
        ],
        totalCount: 2,
        moreResults: 28,
        apiUnavailable: true,
      }),
    )
  })

  it('plafonne les propositions à cinquante', async () => {
    expect(
      await rechercherUneStructureEmployeuse({
        lireLesStructuresDeLaCoop: async () => ({ employeuses: [], total: 0 }),
        lireLAnnuaireDesEntreprises: async () =>
          success({
            structures: Array.from({ length: 60 }, () => emmaus),
            total: 60,
          }),
      })({ recherche: 'Emmaüs' }),
    ).toEqual(
      success({
        structures: Array.from({ length: 50 }, () => ({
          _tag: 'DeLAnnuaire',
          etablissement: emmaus,
        })),
        totalCount: 60,
        moreResults: 0,
        apiUnavailable: false,
      }),
    )
  })
})
