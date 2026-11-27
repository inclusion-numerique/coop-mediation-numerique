import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import {
  type CompteRdv,
  MessageErreurCompte,
} from '../../../domain/compte/compte-rdv'
import {
  JetonAcces,
  type JetonsOAuth,
} from '../../../domain/compte/jetons-oauth'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { consulterRdvsAccueil } from './consulter-rdvs-accueil'
import type { DonneesAccueilRdv } from './donnees-accueil-rdv'

const utilisateurId = UtilisateurCoopId('8a0f6f2e-6d1c-4d1b-9a43-0d7e2f0c1b2a')
const maintenant = new Date('2026-11-25T10:00:00Z')

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const base = {
  agentId: RdvAgentId(4242),
  utilisateurId,
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
}

const donnees: DonneesAccueilRdv = {
  aVenir: 3,
  prochain: null,
  passes: 2,
  honores: 5,
  dernier: null,
  organisationPrincipale: null,
}

const blocPour = (compte: CompteRdv | null) =>
  consulterRdvsAccueil({
    compteDuMediateur: async () => compte,
    lireDonnees: async () => donnees,
  })({ utilisateurId, maintenant })

describe('consulter les rendez-vous de l’accueil', () => {
  it('affiche les données d’un compte lié', async () => {
    expect(await blocPour({ ...base, _tag: 'lie', jetons })).toEqual(
      success({
        widget: { _tag: 'donnees', donnees },
        synchroniserAuChargement: false,
      }),
    )
  })

  it('masque la section pour un médiateur sans compte', async () => {
    expect(await blocPour(null)).toEqual(
      success({
        widget: { _tag: 'masque' },
        synchroniserAuChargement: false,
      }),
    )
  })

  it('masque la section pour un compte délié, sans crier à l’erreur', async () => {
    const bloc = await blocPour({
      ...base,
      _tag: 'deconnecte',
      deconnexion: new Date('2026-07-08T00:00:00.000Z'),
    })

    expect(bloc).toEqual(
      success({
        widget: { _tag: 'masque' },
        synchroniserAuChargement: false,
      }),
    )
  })

  it('alerte sur un compte en erreur', async () => {
    const bloc = await blocPour({
      ...base,
      _tag: 'enErreur',
      jetons,
      erreur: MessageErreurCompte('invalid_grant'),
    })

    expect(bloc).toEqual(
      success({
        widget: { _tag: 'alerte' },
        synchroniserAuChargement: false,
      }),
    )
  })

  it('alerte sur un compte resté non lié', async () => {
    expect(await blocPour({ ...base, _tag: 'nonLie' })).toEqual(
      success({
        widget: { _tag: 'alerte' },
        synchroniserAuChargement: false,
      }),
    )
  })

  it('rattrape au chargement les rendez-vous d’une organisation sans webhook', async () => {
    const bloc = await blocPour({
      ...base,
      _tag: 'lie',
      jetons,
      organisationIdsSansWebhook: [OrganisationId(10)],
    })

    expect(bloc).toEqual(
      success({
        widget: { _tag: 'donnees', donnees },
        synchroniserAuChargement: true,
      }),
    )
  })
})
