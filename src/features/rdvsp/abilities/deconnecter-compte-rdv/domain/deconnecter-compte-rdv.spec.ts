import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type {
  CompteRdv,
  CompteRdvDeconnecte,
} from '../../../domain/compte/compte-rdv'
import { MessageErreurCompte } from '../../../domain/compte/compte-rdv'
import {
  JetonAcces,
  type JetonsOAuth,
} from '../../../domain/compte/jetons-oauth'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { deconnecterCompteRdv } from './deconnecter-compte-rdv'

const maintenant = new Date('2026-08-17T16:00:00.000Z')
const premiereDeconnexion = new Date('2026-07-08T12:00:00.000Z')
const utilisateurId = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const base = {
  agentId: RdvAgentId(4242),
  utilisateurId,
  organisationIds: [OrganisationId(10), OrganisationId(20)],
  organisationIdsSansWebhook: [OrganisationId(20)],
  synchroniserDepuis: new Date('2026-01-15T00:00:00.000Z'),
  derniereSynchro: new Date('2026-08-16T06:00:00.000Z'),
  inclureRdvsDansActivites: false,
}

const deconnecteMaintenant: CompteRdvDeconnecte = {
  ...base,
  _tag: 'deconnecte',
  deconnexion: maintenant,
}

const deconnecter = (compte: CompteRdv | null) =>
  deconnecterCompteRdv({
    compteDeLUtilisateur: async () => compte,
    enregistrer: async () => undefined,
  })({ utilisateurId, maintenant })

describe('déconnecter un compte RDV', () => {
  it.each<{ cas: string; compte: CompteRdv }>([
    {
      cas: 'délie un compte lié à l’instant demandé, sans rien perdre de ce qui permettra de reprendre',
      compte: { ...base, _tag: 'lie', jetons },
    },
    {
      cas: 'délie aussi un compte en erreur',
      compte: {
        ...base,
        _tag: 'enErreur',
        jetons,
        erreur: MessageErreurCompte('invalid_grant'),
      },
    },
    {
      cas: 'délie un compte jamais lié, sans rien exiger de plus',
      compte: { ...base, _tag: 'nonLie' },
    },
  ])('$cas', async ({ compte }) => {
    expect(await deconnecter(compte)).toEqual(success(deconnecteMaintenant))
  })

  it('ne réécrit pas la date d’une déconnexion déjà actée', async () => {
    expect(
      await deconnecter({
        ...base,
        _tag: 'deconnecte',
        deconnexion: premiereDeconnexion,
      }),
    ).toEqual(
      success({
        ...base,
        _tag: 'deconnecte',
        deconnexion: premiereDeconnexion,
      }),
    )
  })

  it('refuse un médiateur qui n’a aucun compte à délier', async () => {
    expect(await deconnecter(null)).toEqual(
      failure({ _tag: 'CompteRdvIntrouvable', utilisateurId }),
    )
  })
})
