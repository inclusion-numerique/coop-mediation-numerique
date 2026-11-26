import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type { CompteRdvLie } from '../../../domain/compte/compte-rdv'
import { JetonAcces } from '../../../domain/compte/jetons-oauth'
import { ApiIndisponible, ErreurTechnique } from '../../../domain/errors'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { EmailExterne, TelephoneExterne } from '../../../domain/identite'
import { NomOrganisation } from '../../../domain/libelle'
import type { Organisation } from '../../../domain/organisation'
import type { PlanSynchronisation } from './plan-synchronisation'
import type { SynchroniserOrganisationsPorts } from './ports'
import { synchroniserOrganisations } from './synchroniser-organisations'

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
  surcharge: Partial<Organisation>,
): Organisation => ({
  id: OrganisationId(id),
  nom: NomOrganisation('Médiathèque'),
  email: null,
  telephone: null,
  verticale: null,
  ...surcharge,
})

const premiere = organisation(1, {})
const seconde = organisation(2, {})

const ports = ({
  recues,
  connues,
  rattachements,
}: {
  readonly recues: readonly Organisation[]
  readonly connues: readonly Organisation[]
  readonly rattachements: readonly OrganisationId[]
}): SynchroniserOrganisationsPorts => ({
  listerOrganisations: async () => success(recues),
  etatOrganisations: async () => success({ connues, rattachements }),
  appliquerPlan: async () => success(undefined),
})

const planVide: PlanSynchronisation = {
  aCreer: [],
  aMettreAJour: [],
  inchangees: [],
  aRattacher: [],
  aDetacher: [],
}

const bilanVide = { noop: 0, created: 0, updated: 0, deleted: 0, count: 0 }

describe('synchroniser les organisations d’un compte', () => {
  it('laisse la base intacte quand l’API échoue', async () => {
    const resultat = await synchroniserOrganisations({
      ...ports({ recues: [], connues: [], rattachements: [] }),
      listerOrganisations: async () =>
        failure(ApiIndisponible(503, 'maintenance')),
    })({ compte })

    expect(resultat).toEqual(
      failure({
        _tag: 'ApiIndisponible',
        statusCode: 503,
        message: 'maintenance',
      }),
    )
  })

  it('renonce quand l’état connu de La Coop ne peut être lu', async () => {
    const panne = new Error('connexion perdue')

    const resultat = await synchroniserOrganisations({
      ...ports({ recues: [premiere], connues: [], rattachements: [] }),
      etatOrganisations: async () => failure(ErreurTechnique(panne)),
    })({ compte })

    expect(resultat).toEqual(
      failure({ _tag: 'ErreurTechnique', erreur: panne }),
    )
  })

  it('rend l’échec de l’écriture du plan', async () => {
    const panne = new Error('transaction annulée')

    const resultat = await synchroniserOrganisations({
      ...ports({ recues: [premiere], connues: [], rattachements: [] }),
      appliquerPlan: async () => failure(ErreurTechnique(panne)),
    })({ compte })

    expect(resultat).toEqual(
      failure({ _tag: 'ErreurTechnique', erreur: panne }),
    )
  })

  it('rend les organisations reçues, pour que la passe parcoure les mêmes', async () => {
    const resultat = await synchroniserOrganisations(
      ports({
        recues: [premiere, seconde],
        connues: [premiere, seconde],
        rattachements: [OrganisationId(1), OrganisationId(2)],
      }),
    )({ compte })

    expect(resultat).toEqual(
      success({
        plan: { ...planVide, inchangees: [premiere, seconde] },
        bilan: { ...bilanVide, noop: 2, count: 2 },
        organisationIdsRecues: [1, 2],
      }),
    )
  })

  it('crée les organisations inconnues et y rattache le compte', async () => {
    const resultat = await synchroniserOrganisations(
      ports({ recues: [premiere], connues: [], rattachements: [] }),
    )({ compte })

    expect(resultat).toEqual(
      success({
        plan: {
          ...planVide,
          aCreer: [premiere],
          aRattacher: [OrganisationId(1)],
        },
        bilan: { ...bilanVide, created: 1, updated: 1, count: 1 },
        organisationIdsRecues: [1],
      }),
    )
  })

  it.each<[string, Organisation]>([
    ['le nom', organisation(1, { nom: NomOrganisation('Autre nom') })],
    [
      'l’e-mail',
      organisation(1, { email: EmailExterne('contact@example.com') }),
    ],
    [
      'le téléphone',
      organisation(1, { telephone: TelephoneExterne('+33100000000') }),
    ],
    ['la verticale', organisation(1, { verticale: 'rdv-aide-numerique' })],
  ])('met à jour celles dont %s a changé', async (_, modifiee) => {
    const resultat = await synchroniserOrganisations(
      ports({
        recues: [modifiee],
        connues: [premiere],
        rattachements: [OrganisationId(1)],
      }),
    )({ compte })

    expect(resultat).toEqual(
      success({
        plan: { ...planVide, aMettreAJour: [modifiee] },
        bilan: { ...bilanVide, updated: 1, count: 1 },
        organisationIdsRecues: [1],
      }),
    )
  })

  it('rattache le compte aux organisations qu’il n’avait pas encore', async () => {
    const resultat = await synchroniserOrganisations(
      ports({
        recues: [premiere, seconde],
        connues: [premiere, seconde],
        rattachements: [OrganisationId(1)],
      }),
    )({ compte })

    expect(resultat).toEqual(
      success({
        plan: {
          ...planVide,
          inchangees: [premiere, seconde],
          aRattacher: [OrganisationId(2)],
        },
        bilan: { ...bilanVide, noop: 2, updated: 1, count: 2 },
        organisationIdsRecues: [1, 2],
      }),
    )
  })

  it('détache le compte d’une organisation que l’API ne renvoie plus', async () => {
    const resultat = await synchroniserOrganisations(
      ports({
        recues: [premiere],
        connues: [premiere, seconde],
        rattachements: [OrganisationId(1), OrganisationId(2)],
      }),
    )({ compte })

    expect(resultat).toEqual(
      success({
        plan: {
          ...planVide,
          inchangees: [premiere],
          aDetacher: [OrganisationId(2)],
        },
        bilan: { ...bilanVide, noop: 1, deleted: 1, count: 1 },
        organisationIdsRecues: [1],
      }),
    )
  })

  it('ne détache rien quand la réponse ne confirme plus aucun rattachement', async () => {
    const resultat = await synchroniserOrganisations(
      ports({ recues: [], connues: [], rattachements: [OrganisationId(9)] }),
    )({ compte })

    expect(resultat).toEqual(
      success({ plan: planVide, bilan: bilanVide, organisationIdsRecues: [] }),
    )
  })

  it('détache tous les rattachements non confirmés dès qu’un seul l’est', async () => {
    const resultat = await synchroniserOrganisations(
      ports({
        recues: [premiere],
        connues: [premiere],
        rattachements: [
          OrganisationId(1),
          OrganisationId(2),
          OrganisationId(3),
        ],
      }),
    )({ compte })

    expect(resultat).toEqual(
      success({
        plan: {
          ...planVide,
          inchangees: [premiere],
          aDetacher: [OrganisationId(2), OrganisationId(3)],
        },
        bilan: { ...bilanVide, noop: 1, deleted: 2, count: 1 },
        organisationIdsRecues: [1],
      }),
    )
  })
})
