import { describe, expect, it } from 'vitest'
import { ApiIndisponible } from '../../../domain/errors'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import {
  type BilanDeLEffacement,
  bilanDeLEffacement,
} from './bilan-de-l-effacement'
import type { EmpreinteRdvEffacee } from './effacer-empreinte-rdv'

const effacee = {
  agentId: RdvAgentId(4242),
  rdvIds: [RdvId(1), RdvId(2)],
  usagersSupprimes: [UsagerId(20)],
}

describe('bilan de l’effacement de l’empreinte RDV', () => {
  it.each<{
    cas: string
    empreinte: EmpreinteRdvEffacee
    bilan: BilanDeLEffacement
  }>([
    {
      cas: 'ne délie rien pour un utilisateur sans compte RDV',
      empreinte: { _tag: 'aucunCompte' },
      bilan: {
        compteDelie: false,
        jetonsRevoques: false,
        rdvsExpurges: 0,
        usagersSupprimes: 0,
      },
    },
    {
      cas: 'compte les rendez-vous expurgés et les usagers supprimés d’un compte révoqué',
      empreinte: {
        _tag: 'effacee',
        ...effacee,
        revocation: { _tag: 'revoques' },
      },
      bilan: {
        compteDelie: true,
        jetonsRevoques: true,
        rdvsExpurges: 2,
        usagersSupprimes: 1,
      },
    },
    {
      cas: 'ne compte pas comme révoqués les jetons dont la révocation a échoué',
      empreinte: {
        _tag: 'effacee',
        ...effacee,
        revocation: {
          _tag: 'echouee',
          erreur: ApiIndisponible(503, 'Service indisponible'),
        },
      },
      bilan: {
        compteDelie: true,
        jetonsRevoques: false,
        rdvsExpurges: 2,
        usagersSupprimes: 1,
      },
    },
  ])('$cas', ({ empreinte, bilan }) => {
    expect(bilanDeLEffacement(empreinte)).toEqual(bilan)
  })
})
