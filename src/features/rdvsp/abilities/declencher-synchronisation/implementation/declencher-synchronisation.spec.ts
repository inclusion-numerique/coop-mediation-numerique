import { describe, expect, it } from 'vitest'
import { failure } from '@/libraries/result'
import type { CompteRdvLie } from '../../../domain/compte-rdv'
import { JetonAcces } from '../../../domain/jetons-oauth'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import {
  declencherSynchronisation,
  MESSAGE_ECHEC,
} from './declencher-synchronisation'

/**
 * Ce que l'échec d'une passe doit laisser sur le compte.
 *
 * Le drapeau `error` n'est pas une trace de diagnostic — le journal de
 * synchronisation en tient une, quoi qu'il arrive. C'est lui qui affiche au
 * médiateur l'alerte l'invitant à reconnecter son compte. Le poser sur une panne
 * passagère envoie refaire un parcours OAuth pour rien.
 */

const UTILISATEUR = UtilisateurCoopId('11111111-1111-4111-8111-111111111111')

const compte: CompteRdvLie = {
  _tag: 'lie',
  agentId: RdvAgentId(5166),
  utilisateurId: UTILISATEUR,
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
  jetons: {
    acces: JetonAcces('acces'),
    rafraichissement: null,
    expiration: null,
    portee: null,
  },
}

const declencherQuiEchoue = (echecDefinitif: (erreur: unknown) => boolean) =>
  declencherSynchronisation({
    compteACible: async () => compte,
    lancer: async () => {
      throw new Error('API injoignable')
    },
    echecDefinitif,
  })({
    demandeur: { id: UTILISATEUR, role: 'User' },
    utilisateurId: UTILISATEUR,
    seulementSansWebhook: false,
  })

describe('échec d’une synchronisation déclenchée', () => {
  it('ne marque pas le compte quand un nouvel essai peut aboutir', async () => {
    const resultat = await declencherQuiEchoue(() => false)

    expect(resultat).toEqual(
      failure({ _tag: 'SynchronisationEchouee', marquage: null }),
    )
  })

  it('marque le compte quand réessayer ne servirait à rien', async () => {
    const resultat = await declencherQuiEchoue(() => true)

    expect(resultat).toEqual(
      failure({
        _tag: 'SynchronisationEchouee',
        marquage: { agentId: compte.agentId, message: MESSAGE_ECHEC },
      }),
    )
  })
})
