import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { consignerLEchec } from './consigner-l-echec'
import {
  type DeclencherSynchronisation,
  MESSAGE_ECHEC,
} from './declencher-synchronisation'

type ResultatDeclenchement = Awaited<ReturnType<DeclencherSynchronisation>>

const utilisateurId = UtilisateurCoopId('11111111-1111-4111-8111-111111111111')

const demande: Parameters<DeclencherSynchronisation>[0] = {
  demandeur: { id: utilisateurId, role: 'User' },
  utilisateurId,
  seulementSansWebhook: false,
}

describe('consignerLEchec', () => {
  it.each<[string, ResultatDeclenchement]>([
    [
      'une synchronisation réussie',
      success({
        derive: 2,
        synchroniseeLe: new Date('2026-11-26T08:00:00.000Z'),
      }),
    ],
    [
      'un échec définitif, marqué sur le compte',
      failure({
        _tag: 'SynchronisationEchouee',
        marquage: { agentId: RdvAgentId(5166), message: MESSAGE_ECHEC },
      }),
    ],
    [
      'un échec passager, laissé sans marque',
      failure({ _tag: 'SynchronisationEchouee', marquage: null }),
    ],
    ['un refus d’accès', failure({ _tag: 'NonAutorise' })],
  ])('rend tel quel le résultat d’%s', async (_, resultat) => {
    const consigne = await consignerLEchec(
      async () => resultat,
      async () => undefined,
    )(demande)

    expect(consigne).toEqual(resultat)
  })
})
