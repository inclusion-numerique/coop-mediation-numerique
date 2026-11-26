import { describe, expect, it } from 'vitest'
import { CodeDepartement } from '@/libraries/insee'
import {
  CoordinateurId,
  DescriptionDuTag,
  MediateurId,
  NomDuTag,
  TagId,
} from '../../../domain'
import type { TagDuCoordinateur, TagsDetenus, TagsDuCompte } from './ports'
import { retirerLesTagsDUnCompte } from './retirer-les-tags-d-un-compte'
import { bilanDuRetrait, type RetraitDesTags } from './retrait-des-tags'

const maintenant = new Date('2026-11-26T10:00:00Z')

const coordinateurId = CoordinateurId('11111111-1111-4111-8111-111111111111')
const partant = MediateurId('22222222-2222-4222-8222-222222222222')
const ada = MediateurId('33333333-3333-4333-8333-333333333333')
const grace = MediateurId('44444444-4444-4444-8444-444444444444')

const tagDuPartant = TagId('55555555-5555-4555-8555-555555555551')
const tagDAda = TagId('55555555-5555-4555-8555-555555555552')

const accesAuxDroits: TagDuCoordinateur = {
  id: TagId('66666666-6666-4666-8666-666666666661'),
  nom: NomDuTag('Accès aux droits'),
  description: DescriptionDuTag('Démarches sociales'),
  departement: CodeDepartement('69'),
  utilisateurs: [ada, grace, ada],
}

const accesAuxDroitsBis: TagDuCoordinateur = {
  id: TagId('66666666-6666-4666-8666-666666666662'),
  nom: NomDuTag('ACCÈS AUX DROITS'),
  description: null,
  departement: null,
  utilisateurs: [ada],
}

const inutilise: TagDuCoordinateur = {
  id: TagId('66666666-6666-4666-8666-666666666663'),
  nom: NomDuTag('Jamais servi'),
  description: null,
  departement: null,
  utilisateurs: [],
}

const retirer = ({
  tags,
  detenus,
  mediateurId,
}: {
  readonly tags: TagsDuCompte
  readonly detenus: readonly TagsDetenus[]
  readonly mediateurId: MediateurId | null
}) =>
  retirerLesTagsDUnCompte({
    lireLesTagsDuCompte: async () => tags,
    lireLesTagsDetenus: async () => detenus,
    appliquerLeRetrait: async () => undefined,
  })({ mediateurId, coordinateurId, maintenant })

describe('retirer les tags d’un compte', () => {
  it('supprime les tags personnels d’un médiateur partant', async () => {
    expect(
      await retirer({
        tags: { duMediateur: [tagDuPartant], duCoordinateur: [] },
        detenus: [],
        mediateurId: partant,
      }),
    ).toEqual({
      success: true,
      data: {
        supprimeLe: maintenant,
        supprimes: [tagDuPartant],
        copies: [],
        reprises: [],
      },
    })
  })

  it('supprime sans l’essaimer un tag de coordinateur que personne n’a employé', async () => {
    expect(
      await retirer({
        tags: { duMediateur: [], duCoordinateur: [inutilise] },
        detenus: [],
        mediateurId: null,
      }),
    ).toEqual({
      success: true,
      data: {
        supprimeLe: maintenant,
        supprimes: [inutilise.id],
        copies: [],
        reprises: [],
      },
    })
  })

  it('copie une seule fois le tag du coordinateur chez chaque médiateur qui s’en est servi', async () => {
    expect(
      await retirer({
        tags: { duMediateur: [], duCoordinateur: [accesAuxDroits] },
        detenus: [
          { mediateurId: ada, tags: [] },
          { mediateurId: grace, tags: [] },
        ],
        mediateurId: null,
      }),
    ).toEqual({
      success: true,
      data: {
        supprimeLe: maintenant,
        supprimes: [accesAuxDroits.id],
        copies: [
          {
            mediateurId: ada,
            nom: 'Accès aux droits',
            description: 'Démarches sociales',
            departement: '69',
            depuis: [accesAuxDroits.id],
          },
          {
            mediateurId: grace,
            nom: 'Accès aux droits',
            description: 'Démarches sociales',
            departement: '69',
            depuis: [accesAuxDroits.id],
          },
        ],
        reprises: [],
      },
    })
  })

  it('reprend le tag de même nom qu’un médiateur détient déjà, sans tenir compte de la casse', async () => {
    expect(
      await retirer({
        tags: { duMediateur: [], duCoordinateur: [accesAuxDroitsBis] },
        detenus: [
          {
            mediateurId: ada,
            tags: [{ id: tagDAda, nom: NomDuTag('accès aux droits') }],
          },
        ],
        mediateurId: null,
      }),
    ).toEqual({
      success: true,
      data: {
        supprimeLe: maintenant,
        supprimes: [accesAuxDroitsBis.id],
        copies: [],
        reprises: [
          { depuis: accesAuxDroitsBis.id, mediateurId: ada, vers: tagDAda },
        ],
      },
    })
  })

  it('verse dans une même copie deux tags du coordinateur qui portent le même nom', async () => {
    expect(
      await retirer({
        tags: {
          duMediateur: [],
          duCoordinateur: [
            { ...accesAuxDroits, utilisateurs: [ada] },
            accesAuxDroitsBis,
          ],
        },
        detenus: [{ mediateurId: ada, tags: [] }],
        mediateurId: null,
      }),
    ).toEqual({
      success: true,
      data: {
        supprimeLe: maintenant,
        supprimes: [accesAuxDroits.id, accesAuxDroitsBis.id],
        copies: [
          {
            mediateurId: ada,
            nom: 'Accès aux droits',
            description: 'Démarches sociales',
            departement: '69',
            depuis: [accesAuxDroits.id, accesAuxDroitsBis.id],
          },
        ],
        reprises: [],
      },
    })
  })

  it('ne complète que la copie du médiateur concerné', async () => {
    expect(
      await retirer({
        tags: {
          duMediateur: [],
          duCoordinateur: [
            { ...accesAuxDroits, utilisateurs: [grace, ada] },
            accesAuxDroitsBis,
          ],
        },
        detenus: [],
        mediateurId: null,
      }),
    ).toEqual({
      success: true,
      data: {
        supprimeLe: maintenant,
        supprimes: [accesAuxDroits.id, accesAuxDroitsBis.id],
        copies: [
          {
            mediateurId: grace,
            nom: 'Accès aux droits',
            description: 'Démarches sociales',
            departement: '69',
            depuis: [accesAuxDroits.id],
          },
          {
            mediateurId: ada,
            nom: 'Accès aux droits',
            description: 'Démarches sociales',
            departement: '69',
            depuis: [accesAuxDroits.id, accesAuxDroitsBis.id],
          },
        ],
        reprises: [],
      },
    })
  })

  it('copie le tag du coordinateur chez le médiateur partant plutôt que dans ses tags qui disparaissent', async () => {
    expect(
      await retirer({
        tags: {
          duMediateur: [tagDuPartant],
          duCoordinateur: [{ ...accesAuxDroitsBis, utilisateurs: [partant] }],
        },
        detenus: [
          {
            mediateurId: partant,
            tags: [{ id: tagDuPartant, nom: NomDuTag('Accès aux droits') }],
          },
        ],
        mediateurId: partant,
      }),
    ).toEqual({
      success: true,
      data: {
        supprimeLe: maintenant,
        supprimes: [tagDuPartant, accesAuxDroitsBis.id],
        copies: [
          {
            mediateurId: partant,
            nom: 'ACCÈS AUX DROITS',
            description: null,
            departement: null,
            depuis: [accesAuxDroitsBis.id],
          },
        ],
        reprises: [],
      },
    })
  })
})

describe('bilan du retrait des tags', () => {
  const retrait: RetraitDesTags = {
    supprimeLe: maintenant,
    supprimes: [tagDuPartant, accesAuxDroits.id],
    copies: [
      {
        mediateurId: ada,
        nom: NomDuTag('Accès aux droits'),
        description: null,
        departement: null,
        depuis: [accesAuxDroits.id, accesAuxDroitsBis.id],
      },
    ],
    reprises: [
      { depuis: accesAuxDroits.id, mediateurId: grace, vers: tagDAda },
    ],
  }

  it('compte chaque tag transféré et chaque tag supprimé', () => {
    expect(bilanDuRetrait(retrait)).toEqual({ transferes: 3, supprimes: 2 })
  })
})
