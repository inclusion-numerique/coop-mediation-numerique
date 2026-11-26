import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import {
  JetonAcces,
  type JetonsOAuth,
} from '../../../domain/compte/jetons-oauth'
import { ApiIndisponible } from '../../../domain/errors'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../../domain/identite'
import {
  type DemandeRdvCreee,
  DemandeRdvId,
  UrlPriseRdv,
  UrlRetour,
} from '../../../domain/rdv/demande-rdv'
import {
  type BeneficiaireCible,
  BeneficiaireCibleId,
  MediateurProprietaireId,
} from './beneficiaire-cible'
import {
  type DependancesPrendreRendezVous,
  demandePourBeneficiaire,
  prendreRendezVous,
} from './prendre-rendez-vous'

const mediateurId = MediateurProprietaireId(
  'c513c349-46dc-461a-a3dc-a81d53c459b6',
)
const beneficiaireId = BeneficiaireCibleId(
  '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
)

const beneficiaire: BeneficiaireCible = {
  id: beneficiaireId,
  mediateurId,
  usagerId: null,
  prenom: PrenomExterne('Jean'),
  nom: NomExterne('Dupont'),
  email: EmailExterne('jean.dupont@example.com'),
  telephone: TelephoneExterne('+33600000000'),
  adresse: '12 rue de la Paix, 75002 Paris',
}

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const compteBase = {
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
} as const

describe('demandePourBeneficiaire', () => {
  const urlDossier = UrlRetour(
    'https://coop.fr/coop/mes-beneficiaires/3f2504e0-4f89-41d3-9a0c-0305e82c3301/accompagnements',
  )

  it('pointe le retour et le dossier vers la même page d’accompagnement', () => {
    const demande = demandePourBeneficiaire(beneficiaire, urlDossier)

    expect(demande.urlRetour).toBe(urlDossier)
    expect(demande.urlDossier).toBe(urlDossier)
  })

  it('désigne l’usager déjà rattaché par son seul identifiant', () => {
    const { usager } = demandePourBeneficiaire(
      { ...beneficiaire, usagerId: UsagerId(9001) },
      urlDossier,
    )

    expect(usager).toEqual({ _tag: 'existant', id: 9001 })
  })

  it('n’envoie aucune identité avec un usager existant', () => {
    const { usager } = demandePourBeneficiaire(
      { ...beneficiaire, usagerId: UsagerId(9001) },
      urlDossier,
    )

    // L'exclusivité est ce qui empêche RDV Service Public d'arbitrer entre un
    // identifiant et une identité, et donc de créer un doublon.
    expect(Object.keys(usager)).toEqual(['_tag', 'id'])
  })

  it('transmet le pré-remplissage quand aucun usager n’est rattaché', () => {
    const { usager } = demandePourBeneficiaire(beneficiaire, urlDossier)

    expect(usager).toEqual({
      _tag: 'aCreer',
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@example.com',
      telephone: '+33600000000',
      adresse: '12 rue de la Paix, 75002 Paris',
      dateNaissance: null,
    })
  })

  it('accepte un bénéficiaire sans identité — RDV Service Public la complétera', () => {
    const { usager } = demandePourBeneficiaire(
      {
        ...beneficiaire,
        prenom: null,
        nom: null,
        email: null,
        telephone: null,
        adresse: null,
      },
      urlDossier,
    )

    expect(usager._tag).toBe('aCreer')
  })
})

const demandeCreee: DemandeRdvCreee = {
  id: DemandeRdvId(31),
  usagerId: UsagerId(9001),
  url: UrlPriseRdv('https://rdv.anct.gouv.fr/prendre_rdv?invitation=31'),
  rdvId: null,
}

const compteLie: CompteRdv = { ...compteBase, _tag: 'lie', jetons }

const dependances: DependancesPrendreRendezVous = {
  beneficiaireADemander: async () => beneficiaire,
  compteDuMediateur: async () => compteLie,
  creerDemandeRdv: async () => success(demandeCreee),
  lierUsager: async () => undefined,
  urlDossierBeneficiaire: () =>
    'https://coop.fr/coop/mes-beneficiaires/3f2504e0-4f89-41d3-9a0c-0305e82c3301/accompagnements',
}

const demande = {
  utilisateurId: compteBase.utilisateurId,
  mediateurId,
  beneficiaireId,
}

describe('prendreRendezVous', () => {
  it('rend la demande créée pour un bénéficiaire suivi par ce médiateur', async () => {
    expect(await prendreRendezVous(dependances)(demande)).toEqual(
      success(demandeCreee),
    )
  })

  it('refuse un bénéficiaire suivi par un autre médiateur', async () => {
    const resultat = await prendreRendezVous({
      ...dependances,
      beneficiaireADemander: async () => ({
        ...beneficiaire,
        mediateurId: MediateurProprietaireId(
          '9c858901-8a57-4791-81fe-4c455b099bc9',
        ),
      }),
    })(demande)

    expect(resultat).toEqual(
      failure({ _tag: 'BeneficiaireIntrouvable', id: beneficiaireId }),
    )
  })

  it('rend la même erreur pour un bénéficiaire absent que pour celui d’autrui', async () => {
    const resultat = await prendreRendezVous({
      ...dependances,
      beneficiaireADemander: async () => null,
    })(demande)

    expect(resultat).toEqual(
      failure({ _tag: 'BeneficiaireIntrouvable', id: beneficiaireId }),
    )
  })

  it('refuse un médiateur sans compte', async () => {
    const resultat = await prendreRendezVous({
      ...dependances,
      compteDuMediateur: async () => null,
    })(demande)

    expect(resultat).toEqual(failure({ _tag: 'CompteNonLie', agentId: null }))
  })

  it('refuse un compte délié', async () => {
    const resultat = await prendreRendezVous({
      ...dependances,
      compteDuMediateur: async () => ({
        ...compteBase,
        _tag: 'deconnecte',
        deconnexion: new Date('2026-07-08T00:00:00.000Z'),
      }),
    })(demande)

    expect(resultat).toEqual(
      failure({ _tag: 'CompteNonLie', agentId: compteBase.agentId }),
    )
  })

  it('remonte l’échec de RDV Service Public', async () => {
    const resultat = await prendreRendezVous({
      ...dependances,
      creerDemandeRdv: async () => failure(ApiIndisponible(502, 'Bad Gateway')),
    })(demande)

    expect(resultat).toEqual(
      failure({
        _tag: 'ApiIndisponible',
        statusCode: 502,
        message: 'Bad Gateway',
      }),
    )
  })
})
