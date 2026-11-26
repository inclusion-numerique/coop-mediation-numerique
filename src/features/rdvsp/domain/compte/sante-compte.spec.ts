import { describe, expect, it } from 'vitest'
import { RdvAgentId } from '../identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../identifiants/utilisateur-coop-id'
import { type CompteRdv, MessageErreurCompte } from './compte-rdv'
import { JetonAcces, type JetonsOAuth } from './jetons-oauth'
import {
  peutEtreSynchronise,
  type SanteCompteRdv,
  type StatutIntegration,
  santeDuCompte,
  statutDuCompteDeLaSession,
  statutIntegration,
} from './sante-compte'

const maintenant = new Date('2026-08-17T12:00:00.000Z')

const jetons = (expiration: Date | null): JetonsOAuth => ({
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration,
  portee: null,
})

const base = {
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
}

describe('santeDuCompte', () => {
  it('tient pour opérationnel un compte lié dont le jeton court encore', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'lie',
      jetons: jetons(new Date('2026-08-17T18:00:00.000Z')),
    }

    expect(santeDuCompte(compte, maintenant)._tag).toBe('operationnel')
  })

  it('tient pour opérationnel un compte sans expiration connue', () => {
    const compte: CompteRdv = { ...base, _tag: 'lie', jetons: jetons(null) }

    expect(santeDuCompte(compte, maintenant)._tag).toBe('operationnel')
  })

  it('signale un jeton expiré à part, sans le confondre avec une panne', () => {
    const expiration = new Date('2026-08-17T06:00:00.000Z')
    const compte: CompteRdv = {
      ...base,
      _tag: 'lie',
      jetons: jetons(expiration),
    }

    expect(santeDuCompte(compte, maintenant)).toEqual({
      _tag: 'jetonExpire',
      depuis: expiration,
    })
  })

  it('remonte le message d’un compte en erreur', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'enErreur',
      jetons: jetons(null),
      erreur: MessageErreurCompte('invalid_grant'),
    }

    expect(santeDuCompte(compte, maintenant)).toEqual({
      _tag: 'enErreur',
      message: 'invalid_grant',
    })
  })

  it('distingue un compte jamais lié', () => {
    expect(santeDuCompte({ ...base, _tag: 'nonLie' }, maintenant)._tag).toBe(
      'jamaisLie',
    )
  })

  it('distingue une déconnexion décidée par l’utilisateur', () => {
    const quand = new Date('2026-07-08T00:00:00.000Z')

    expect(
      santeDuCompte(
        { ...base, _tag: 'deconnecte', deconnexion: quand },
        maintenant,
      ),
    ).toEqual({ _tag: 'deconnecteParUtilisateur', quand })
  })
})

describe('statutIntegration', () => {
  it.each<[SanteCompteRdv, StatutIntegration]>([
    [{ _tag: 'operationnel' }, 'connecte'],
    [{ _tag: 'jetonExpire', depuis: maintenant }, 'connecte'],
    [{ _tag: 'enErreur', message: 'x' }, 'enPanne'],
    [{ _tag: 'jamaisLie' }, 'enPanne'],
    [{ _tag: 'deconnecteParUtilisateur', quand: maintenant }, 'deconnecte'],
  ])('pour un compte %o : %s', (sante, attendu) => {
    expect(statutIntegration(sante)).toBe(attendu)
  })

  it('ne signale pas en panne un compte que l’utilisateur a débranché lui-même', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'deconnecte',
      deconnexion: new Date('2026-08-01T10:00:00.000Z'),
    }

    expect(statutIntegration(santeDuCompte(compte, maintenant))).toBe(
      'deconnecte',
    )
  })

  it('ne confond pas une déconnexion voulue avec une absence d’intégration', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'deconnecte',
      deconnexion: new Date('2026-08-01T10:00:00.000Z'),
    }

    expect(statutIntegration(santeDuCompte(compte, maintenant))).not.toBe(
      'jamaisConnecte',
    )
  })
})

describe('peutEtreSynchronise', () => {
  it.each<[SanteCompteRdv, boolean]>([
    [{ _tag: 'operationnel' }, true],
    [{ _tag: 'jetonExpire', depuis: maintenant }, true],
    [{ _tag: 'enErreur', message: 'x' }, false],
    [{ _tag: 'jamaisLie' }, false],
    [{ _tag: 'deconnecteParUtilisateur', quand: maintenant }, false],
  ])('pour un compte « %o » : %s', (sante, attendu) => {
    expect(peutEtreSynchronise(sante)).toBe(attendu)
  })
})

describe('statutDuCompteDeLaSession', () => {
  const lie = { deconnexion: null, jetonDAcces: true, error: null }

  it('rend « jamaisConnecte » sans compte', () => {
    expect(statutDuCompteDeLaSession(null)).toBe('jamaisConnecte')
  })

  it('rend « deconnecte » pour un compte débranché, même en erreur', () => {
    expect(
      statutDuCompteDeLaSession({
        deconnexion: '2026-08-01T00:00:00.000Z',
        jetonDAcces: false,
        error: 'invalid_grant',
      }),
    ).toBe('deconnecte')
  })

  it("rend « enPanne » pour un compte sans jeton d'accès", () => {
    expect(statutDuCompteDeLaSession({ ...lie, jetonDAcces: false })).toBe(
      'enPanne',
    )
  })

  it('rend « enPanne » pour un compte en erreur', () => {
    expect(statutDuCompteDeLaSession({ ...lie, error: 'invalid_grant' })).toBe(
      'enPanne',
    )
  })

  it('ignore une erreur vide', () => {
    expect(statutDuCompteDeLaSession({ ...lie, error: '  ' })).toBe('connecte')
  })

  it('rend « connecte » pour un compte lié sans erreur', () => {
    expect(statutDuCompteDeLaSession(lie)).toBe('connecte')
  })
})
