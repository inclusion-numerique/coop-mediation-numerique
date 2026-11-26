import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import {
  JetonAcces,
  type JetonsOAuth,
} from '../../../domain/compte/jetons-oauth'
import { ApiIndisponible } from '../../../domain/errors'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { effacerEmpreinteRdv } from './effacer-empreinte-rdv'
import type { EffacerEmpreinteRdvPorts } from './ports'

const utilisateurId = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')
const agentId = RdvAgentId(4242)

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const ports: EffacerEmpreinteRdvPorts = {
  compteAEffacer: async () => ({ agentId, jetons }),
  revoquerJetons: async () => success(undefined),
  rendezVousDuCompte: async () => ({
    rdvIds: [RdvId(1), RdvId(2)],
    usagerIds: [UsagerId(10), UsagerId(20)],
  }),
  supprimerLeCompte: async () => undefined,
  usagersOrphelinsParmi: async () => [UsagerId(20)],
  supprimerLesUsagers: async () => undefined,
}

describe('effacer l’empreinte RDV d’un compte', () => {
  it('révoque les jetons, supprime le compte et ses rendez-vous, puis les seuls usagers devenus orphelins', async () => {
    expect(await effacerEmpreinteRdv(ports)({ utilisateurId })).toEqual(
      success({
        _tag: 'effacee',
        agentId,
        revocation: { _tag: 'revoques' },
        rdvIds: [RdvId(1), RdvId(2)],
        usagersSupprimes: [UsagerId(20)],
      }),
    )
  })

  it('n’a rien à effacer pour un utilisateur sans compte RDV', async () => {
    expect(
      await effacerEmpreinteRdv({ ...ports, compteAEffacer: async () => null })(
        { utilisateurId },
      ),
    ).toEqual(success({ _tag: 'aucunCompte' }))
  })

  it('efface un compte sans jetons sans rien révoquer', async () => {
    expect(
      await effacerEmpreinteRdv({
        ...ports,
        compteAEffacer: async () => ({ agentId, jetons: null }),
      })({ utilisateurId }),
    ).toEqual(
      success({
        _tag: 'effacee',
        agentId,
        revocation: { _tag: 'sansJetons' },
        rdvIds: [RdvId(1), RdvId(2)],
        usagersSupprimes: [UsagerId(20)],
      }),
    )
  })

  it('efface malgré une révocation refusée, qu’il rend visible', async () => {
    expect(
      await effacerEmpreinteRdv({
        ...ports,
        revoquerJetons: async () =>
          failure(ApiIndisponible(503, 'Service indisponible')),
      })({ utilisateurId }),
    ).toEqual(
      success({
        _tag: 'effacee',
        agentId,
        revocation: {
          _tag: 'echouee',
          erreur: {
            _tag: 'ApiIndisponible',
            statusCode: 503,
            message: 'Service indisponible',
          },
        },
        rdvIds: [RdvId(1), RdvId(2)],
        usagersSupprimes: [UsagerId(20)],
      }),
    )
  })
})
