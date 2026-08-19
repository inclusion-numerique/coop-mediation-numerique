import axios from 'axios'
import type { CompteRdvLie } from '../../domain/compte-rdv'
import {
  JetonAcces,
  JetonRafraichissement,
  type JetonsOAuth,
} from '../../domain/jetons-oauth'
import { RdvAgentId } from '../../domain/rdv-agent-id'
import { RdvId } from '../../domain/rdv-id'
import { StatutPresenceModifiable } from '../../domain/statut-presence'
import { UtilisateurCoopId } from '../../domain/utilisateur-coop-id'
import { rdvServicePublicApi } from './rdv-service-public.api'

/**
 * Le renouvellement des jetons, vu depuis la passe qui en enchaîne les appels.
 *
 * RDV Service Public fait tourner le jeton de rafraîchissement : celui qui vient
 * de servir est mort. Un adaptateur qui repart des jetons figés dans le compte
 * rejoue donc l'échange avec un jeton consommé, se le fait refuser, et fait
 * tomber la passe entière au deuxième appel — alors qu'un nouvel essai, parti
 * d'un compte relu, passait sans rien changer.
 *
 * C'est ce qui s'est produit en production le 19/08/2026. Ces tests tiennent la
 * règle : la base fait foi, l'instantané ne sert que de repli.
 */

jest.mock('axios', () => {
  const appel = jest.fn()
  return {
    __esModule: true,
    default: Object.assign(appel, {
      post: jest.fn(),
      isAxiosError: (erreur: unknown) =>
        typeof erreur === 'object' && erreur !== null && 'response' in erreur,
    }),
  }
})

const axiosMock = axios as unknown as jest.Mock & {
  post: jest.Mock
}

const AGENT = RdvAgentId(7786)

const jetons = (suffixe: string, expirationMs: number): JetonsOAuth => ({
  acces: JetonAcces(`acces-${suffixe}`),
  rafraichissement: JetonRafraichissement(`refresh-${suffixe}`),
  expiration: new Date(expirationMs),
  portee: null,
})

const MAINTENANT = new Date('2026-08-19T19:19:00.000Z')

/** Expire dans dix secondes : sous la marge d'anticipation d'une minute. */
const expirant = jetons('1', MAINTENANT.getTime() + 10_000)
/** Expire dans deux heures : aucun renouvellement à tenter. */
const frais = jetons('2', MAINTENANT.getTime() + 7_200_000)

const compte: CompteRdvLie = {
  _tag: 'lie',
  agentId: AGENT,
  utilisateurId: UtilisateurCoopId('11111111-1111-4111-8111-111111111111'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
  jetons: expirant,
}

const reponseJetonsFrais = {
  data: {
    access_token: frais.acces,
    refresh_token: frais.rafraichissement,
    expires_in: 7200,
    scope: null,
  },
}

const refusDuJetonConsomme = {
  response: { status: 400 },
  message: 'invalid_grant',
}

const changerLeStatut = (api: ReturnType<typeof rdvServicePublicApi>) =>
  api.changerStatutRdv(compte, RdvId(1), StatutPresenceModifiable('seen'))

beforeEach(() => {
  jest.clearAllMocks()
  axiosMock.mockResolvedValue({ data: { status: 'seen' } })
})

describe('renouvellement des jetons', () => {
  it('n’échange qu’une fois quand deux appels se suivent', async () => {
    // La base : ce que `onJetonsRenouveles` écrit, `jetonsCourants` le relit.
    const enBase: JetonsOAuth[] = [expirant]
    const api = rdvServicePublicApi({
      hostname: 'rdv.test',
      clientId: 'client',
      clientSecret: 'secret',
      webhookUrl: 'https://coop.test/webhook',
      webhookSecret: 'secret-webhook',
      maintenant: () => MAINTENANT,
      onJetonsRenouveles: async (_agentId, renouveles) => {
        enBase.push(renouveles)
      },
      jetonsCourants: async () => enBase[enBase.length - 1] ?? null,
    })

    axiosMock.post
      .mockResolvedValueOnce(reponseJetonsFrais)
      .mockRejectedValue(refusDuJetonConsomme)

    const premier = await changerLeStatut(api)
    const second = await changerLeStatut(api)

    expect(premier.success).toBe(true)
    // Sans relecture, ce deuxième appel repartait du jeton déjà consommé.
    expect(second.success).toBe(true)
    expect(axiosMock.post).toHaveBeenCalledTimes(1)
  })

  it('adopte les jetons qu’un autre appel vient d’obtenir plutôt que d’échouer', async () => {
    // Le perdant de la course : son échange est refusé parce qu'un autre appel a
    // consommé le jeton entre-temps — et la base porte déjà le résultat.
    const lectures = [expirant, frais]
    const api = rdvServicePublicApi({
      hostname: 'rdv.test',
      clientId: 'client',
      clientSecret: 'secret',
      webhookUrl: 'https://coop.test/webhook',
      webhookSecret: 'secret-webhook',
      maintenant: () => MAINTENANT,
      jetonsCourants: async () => lectures.shift() ?? frais,
    })

    axiosMock.post.mockRejectedValue(refusDuJetonConsomme)

    const resultat = await changerLeStatut(api)

    expect(resultat.success).toBe(true)
    expect(axiosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: `Bearer ${frais.acces}` },
      }),
    )
  })

  it('conclut à la révocation quand la base ne porte rien de neuf', async () => {
    const api = rdvServicePublicApi({
      hostname: 'rdv.test',
      clientId: 'client',
      clientSecret: 'secret',
      webhookUrl: 'https://coop.test/webhook',
      webhookSecret: 'secret-webhook',
      maintenant: () => MAINTENANT,
      jetonsCourants: async () => expirant,
    })

    axiosMock.post.mockRejectedValue(refusDuJetonConsomme)

    const resultat = await changerLeStatut(api)

    expect(resultat.success).toBe(false)
    expect(resultat.success ? null : resultat.error._tag).toBe('JetonRevoque')
  })
})
