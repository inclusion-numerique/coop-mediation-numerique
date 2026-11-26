import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type { CompteRdvLie } from '../../../domain/compte/compte-rdv'
import { JetonAcces } from '../../../domain/compte/jetons-oauth'
import { ApiIndisponible } from '../../../domain/errors'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { EmailExterne, TelephoneExterne } from '../../../domain/identite'
import { NomOrganisation } from '../../../domain/libelle'
import type { Organisation } from '../../../domain/organisation'
import {
  type DependancesSynchroniserOrganisations,
  synchroniserOrganisations,
} from './synchroniser-organisations'

const compte: CompteRdvLie = {
  _tag: 'lie',
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
  jetons: {
    acces: JetonAcces('jeton-acces'),
    rafraichissement: null,
    expiration: null,
    portee: null,
  },
}

const organisation = (
  id: number,
  surcharge: Partial<Organisation> = {},
): Organisation => ({
  id: OrganisationId(id),
  nom: NomOrganisation('Médiathèque'),
  email: null,
  telephone: null,
  verticale: null,
  ...surcharge,
})

const synchroniser = ({
  recues,
  connues,
  rattachements,
}: {
  readonly recues: readonly Organisation[]
  readonly connues: readonly Organisation[]
  readonly rattachements: readonly OrganisationId[]
}) => {
  const dependances: DependancesSynchroniserOrganisations = {
    listerOrganisations: async () => success(recues),
    etatOrganisations: async () => ({ connues, rattachements }),
    appliquerPlan: async () => undefined,
  }

  return synchroniserOrganisations(dependances)(compte)
}

const bilan = (
  surcharge: Partial<{
    noop: number
    created: number
    updated: number
    deleted: number
    count: number
  }>,
) => ({ noop: 0, created: 0, updated: 0, deleted: 0, count: 0, ...surcharge })

describe('synchroniserOrganisations', () => {
  it('laisse la base intacte quand l’API échoue', async () => {
    const resultat = await synchroniserOrganisations({
      listerOrganisations: async () =>
        failure(ApiIndisponible(503, 'maintenance')),
      etatOrganisations: async () => ({ connues: [], rattachements: [] }),
      appliquerPlan: async () => undefined,
    })(compte)

    expect(resultat).toEqual(
      failure({
        _tag: 'ApiIndisponible',
        statusCode: 503,
        message: 'maintenance',
      }),
    )
  })

  it('rend les organisations reçues, pour que la passe parcoure les mêmes', async () => {
    const resultat = await synchroniser({
      recues: [organisation(1), organisation(2)],
      connues: [organisation(1), organisation(2)],
      rattachements: [OrganisationId(1), OrganisationId(2)],
    })

    expect(resultat).toEqual(
      success({
        bilan: bilan({ noop: 2, count: 2 }),
        organisationIdsRecues: [1, 2],
      }),
    )
  })

  it('crée les organisations inconnues et y rattache le compte', async () => {
    const resultat = await synchroniser({
      recues: [organisation(1)],
      connues: [],
      rattachements: [],
    })

    expect(resultat).toEqual(
      success({
        bilan: bilan({ created: 1, updated: 1, count: 1 }),
        organisationIdsRecues: [1],
      }),
    )
  })

  it.each<[string, Partial<Organisation>]>([
    ['le nom', { nom: NomOrganisation('Autre nom') }],
    ['l’e-mail', { email: EmailExterne('contact@example.com') }],
    ['le téléphone', { telephone: TelephoneExterne('+33100000000') }],
    ['la verticale', { verticale: 'rdv-aide-numerique' }],
  ])('met à jour celles dont %s a changé', async (_, changement) => {
    const resultat = await synchroniser({
      recues: [organisation(1, changement)],
      connues: [organisation(1)],
      rattachements: [OrganisationId(1)],
    })

    expect(resultat).toEqual(
      success({
        bilan: bilan({ updated: 1, count: 1 }),
        organisationIdsRecues: [1],
      }),
    )
  })

  it('rattache le compte aux organisations qu’il n’avait pas encore', async () => {
    const resultat = await synchroniser({
      recues: [organisation(1), organisation(2)],
      connues: [organisation(1), organisation(2)],
      rattachements: [OrganisationId(1)],
    })

    expect(resultat).toEqual(
      success({
        bilan: bilan({ noop: 2, updated: 1, count: 2 }),
        organisationIdsRecues: [1, 2],
      }),
    )
  })

  it('détache le compte d’une organisation que l’API ne renvoie plus', async () => {
    const resultat = await synchroniser({
      recues: [organisation(1)],
      connues: [organisation(1), organisation(2)],
      rattachements: [OrganisationId(1), OrganisationId(2)],
    })

    expect(resultat).toEqual(
      success({
        bilan: bilan({ noop: 1, deleted: 1, count: 1 }),
        organisationIdsRecues: [1],
      }),
    )
  })

  it('ne détache rien quand la réponse ne confirme plus aucun rattachement', async () => {
    const resultat = await synchroniser({
      recues: [],
      connues: [],
      rattachements: [OrganisationId(9)],
    })

    expect(resultat).toEqual(
      success({ bilan: bilan({}), organisationIdsRecues: [] }),
    )
  })

  it('détache tous les rattachements non confirmés dès qu’un seul l’est', async () => {
    const resultat = await synchroniser({
      recues: [organisation(1)],
      connues: [organisation(1)],
      rattachements: [OrganisationId(1), OrganisationId(2), OrganisationId(3)],
    })

    expect(resultat).toEqual(
      success({
        bilan: bilan({ noop: 1, deleted: 2, count: 1 }),
        organisationIdsRecues: [1],
      }),
    )
  })
})
