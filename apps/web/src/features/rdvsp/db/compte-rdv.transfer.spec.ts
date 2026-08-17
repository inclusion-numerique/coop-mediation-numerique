import type { CompteRdv } from '../domain/compte-rdv'
import { MessageErreurCompte } from '../domain/compte-rdv'
import {
  JetonAcces,
  JetonRafraichissement,
  PorteeOAuth,
} from '../domain/jetons-oauth'
import { OrganisationId } from '../domain/organisation-id'
import { RdvAgentId } from '../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../domain/utilisateur-coop-id'
import {
  type CompteRdvRow,
  compteRdvFromDomain,
  compteRdvToDomain,
} from './compte-rdv.transfer'

const minimal = {
  agentId: RdvAgentId(1),
  utilisateurId: UtilisateurCoopId('3f2504e0-4f89-41d3-9a0c-0305e82c3301'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
} as const

const complet = {
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('9c858901-8a57-4791-81fe-4c455b099bc9'),
  organisationIds: [OrganisationId(10), OrganisationId(20)],
  organisationIdsSansWebhook: [OrganisationId(20)],
  synchroniserDepuis: new Date('2026-01-01T00:00:00.000Z'),
  derniereSynchro: new Date('2026-08-17T06:00:00.000Z'),
  inclureRdvsDansActivites: true,
} as const

const jetonsComplets = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: JetonRafraichissement('jeton-rafraichissement'),
  expiration: new Date('2026-08-17T18:00:00.000Z'),
  portee: PorteeOAuth('write'),
}

const jetonsMinimaux = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

/**
 * Reconstitue la ligne complète à partir des scalaires : les organisations sont
 * une relation, `metadata` et les horodatages système ne traversent pas le
 * domaine.
 */
const toRow = (compte: CompteRdv): CompteRdvRow => ({
  ...compteRdvFromDomain(compte),
  organisations: compte.organisationIds.map((organisationId) => ({
    organisationId,
  })),
  metadata: null,
  created: new Date('2025-01-01T00:00:00.000Z'),
  updated: new Date('2026-08-17T06:00:00.000Z'),
})

describe('transfer compte RDV', () => {
  describe('aller-retour domaine → Prisma → domaine', () => {
    const comptes: [string, CompteRdv][] = [
      ['non lié, minimal', { ...minimal, _tag: 'nonLie' }],
      [
        'lié, jetons minimaux',
        { ...minimal, _tag: 'lie', jetons: jetonsMinimaux },
      ],
      [
        'lié, tout renseigné',
        { ...complet, _tag: 'lie', jetons: jetonsComplets },
      ],
      [
        'en erreur',
        {
          ...complet,
          _tag: 'enErreur',
          jetons: jetonsComplets,
          erreur: MessageErreurCompte('invalid_grant'),
        },
      ],
      [
        'déconnecté',
        {
          ...complet,
          _tag: 'deconnecte',
          deconnexion: new Date('2026-07-08T12:00:00.000Z'),
        },
      ],
    ]

    it.each(comptes)('conserve un compte %s', (_, compte) => {
      expect(compteRdvToDomain(toRow(compte))).toEqual(compte)
    })
  })

  describe('lecture de lignes existantes', () => {
    const ligne = (surcharge: Partial<CompteRdvRow>): CompteRdvRow => ({
      ...toRow({ ...minimal, _tag: 'lie', jetons: jetonsMinimaux }),
      ...surcharge,
    })

    it('traite un jeton vide comme un compte jamais lié', () => {
      expect(compteRdvToDomain(ligne({ accessToken: '' }))._tag).toBe('nonLie')
    })

    it('traite une erreur vide comme un compte sain', () => {
      expect(compteRdvToDomain(ligne({ error: '' }))._tag).toBe('lie')
    })

    it('fait primer la déconnexion sur une erreur antérieure', () => {
      const compte = compteRdvToDomain(
        ligne({
          deleted: new Date('2026-07-08T12:00:00.000Z'),
          error: 'invalid_grant',
        }),
      )

      expect(compte._tag).toBe('deconnecte')
    })
  })
})
