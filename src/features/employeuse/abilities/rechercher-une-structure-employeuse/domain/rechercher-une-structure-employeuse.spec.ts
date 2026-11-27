import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { failure, success } from '@/libraries/result'
import { AnnuaireIndisponible } from './errors'
import type { RechercherUneStructureEmployeusePorts } from './ports'
import { rechercherUneStructureEmployeuse } from './rechercher-une-structure-employeuse'

type Structure = { readonly nom: string; readonly siret: Siret }

const coop = (nom: string, siret: string): Structure => ({
  nom,
  siret: Siret(siret),
})

const croixRouge = coop('Croix Rouge', '12345678901234')

const croixRougeAuSiege = coop('Croix Rouge siège', '12345678901234')

const secoursPopulaire = coop('Secours populaire', '43210987654321')

const croixRougeDansLAnnuaire = coop('CROIX ROUGE', '12345678901234')

const emmaus = coop('Emmaüs', '11111111111111')

const ports: RechercherUneStructureEmployeusePorts<Structure, Structure> = {
  lireLesStructuresDeLaCoop: async () => ({
    structures: [croixRouge, croixRougeAuSiege, secoursPopulaire],
    total: 30,
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

  it('propose d’abord les structures de la coop, une par SIRET, puis celles de l’annuaire qu’elle ne connaît pas', async () => {
    expect(
      await rechercherUneStructureEmployeuse(ports)({ recherche: 'Croix' }),
    ).toEqual(
      success({
        structures: [croixRouge, secoursPopulaire, emmaus],
        totalCount: 3,
        moreResults: 37,
        apiUnavailable: false,
      }),
    )
  })

  it('propose les structures de la coop quand l’annuaire est indisponible, et le signale', async () => {
    expect(
      await rechercherUneStructureEmployeuse({
        ...ports,
        lireLAnnuaireDesEntreprises: async () =>
          failure(AnnuaireIndisponible()),
      })({ recherche: 'Croix' }),
    ).toEqual(
      success({
        structures: [croixRouge, secoursPopulaire],
        totalCount: 2,
        moreResults: 27,
        apiUnavailable: true,
      }),
    )
  })

  it('plafonne les propositions à cinquante', async () => {
    expect(
      await rechercherUneStructureEmployeuse({
        lireLesStructuresDeLaCoop: async () => ({ structures: [], total: 0 }),
        lireLAnnuaireDesEntreprises: async () =>
          success({
            structures: new Array<Structure>(60).fill(emmaus),
            total: 60,
          }),
      })({ recherche: 'Emmaüs' }),
    ).toEqual(
      success({
        structures: new Array<Structure>(50).fill(emmaus),
        totalCount: 60,
        moreResults: 0,
        apiUnavailable: false,
      }),
    )
  })
})
