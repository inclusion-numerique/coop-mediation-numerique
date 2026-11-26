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
import type { PrendreRendezVousPorts } from './ports'
import { prendreRendezVous } from './prendre-rendez-vous'

const mediateurId = MediateurProprietaireId(
  'c513c349-46dc-461a-a3dc-a81d53c459b6',
)
const beneficiaireId = BeneficiaireCibleId(
  '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
)
const utilisateurId = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')
const agentId = RdvAgentId(4242)

const urlDossier = UrlRetour(
  'https://coop.fr/coop/mes-beneficiaires/3f2504e0-4f89-41d3-9a0c-0305e82c3301/accompagnements',
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

const beneficiaireRattache: BeneficiaireCible = {
  ...beneficiaire,
  usagerId: UsagerId(9001),
}

const beneficiaireSansIdentite: BeneficiaireCible = {
  ...beneficiaire,
  prenom: null,
  nom: null,
  email: null,
  telephone: null,
  adresse: null,
}

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const compteBase = {
  agentId,
  utilisateurId,
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
}

const compteLie: CompteRdv = { ...compteBase, _tag: 'lie', jetons }

const creee: DemandeRdvCreee = {
  id: DemandeRdvId(31),
  usagerId: UsagerId(9001),
  url: UrlPriseRdv('https://rdv.anct.gouv.fr/prendre_rdv?invitation=31'),
  rdvId: null,
}

const ports: PrendreRendezVousPorts = {
  beneficiaireADemander: async () => beneficiaire,
  compteDuMediateur: async () => compteLie,
  creerDemandeRdv: async () => success(creee),
  lierUsager: async () => undefined,
  urlDossierBeneficiaire: () => urlDossier,
}

const demande = { utilisateurId, mediateurId, beneficiaireId }

describe('prendre rendez-vous pour un bénéficiaire', () => {
  it('demande un rendez-vous pré-rempli qui revient au dossier d’accompagnement, puis rattache l’usager créé', async () => {
    expect(await prendreRendezVous(ports)(demande)).toEqual(
      success({
        demande: {
          usager: {
            _tag: 'aCreer',
            prenom: 'Jean',
            nom: 'Dupont',
            email: 'jean.dupont@example.com',
            telephone: '+33600000000',
            adresse: '12 rue de la Paix, 75002 Paris',
            dateNaissance: null,
          },
          urlRetour: urlDossier,
          urlDossier,
        },
        creee,
        liaison: { beneficiaire, usagerId: UsagerId(9001) },
      }),
    )
  })

  it('désigne l’usager déjà rattaché par son seul identifiant, sans identité qui ferait arbitrer RDV Service Public', async () => {
    expect(
      await prendreRendezVous({
        ...ports,
        beneficiaireADemander: async () => beneficiaireRattache,
      })(demande),
    ).toStrictEqual(
      success({
        demande: {
          usager: { _tag: 'existant', id: UsagerId(9001) },
          urlRetour: urlDossier,
          urlDossier,
        },
        creee,
        liaison: {
          beneficiaire: beneficiaireRattache,
          usagerId: UsagerId(9001),
        },
      }),
    )
  })

  it('accepte un bénéficiaire sans identité — RDV Service Public la complétera', async () => {
    expect(
      await prendreRendezVous({
        ...ports,
        beneficiaireADemander: async () => beneficiaireSansIdentite,
      })(demande),
    ).toEqual(
      success({
        demande: {
          usager: {
            _tag: 'aCreer',
            prenom: null,
            nom: null,
            email: null,
            telephone: null,
            adresse: null,
            dateNaissance: null,
          },
          urlRetour: urlDossier,
          urlDossier,
        },
        creee,
        liaison: {
          beneficiaire: beneficiaireSansIdentite,
          usagerId: UsagerId(9001),
        },
      }),
    )
  })

  it('refuse un bénéficiaire suivi par un autre médiateur', async () => {
    const resultat = await prendreRendezVous({
      ...ports,
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
      ...ports,
      beneficiaireADemander: async () => null,
    })(demande)

    expect(resultat).toEqual(
      failure({ _tag: 'BeneficiaireIntrouvable', id: beneficiaireId }),
    )
  })

  it('refuse un médiateur sans compte', async () => {
    const resultat = await prendreRendezVous({
      ...ports,
      compteDuMediateur: async () => null,
    })(demande)

    expect(resultat).toEqual(failure({ _tag: 'CompteNonLie', agentId: null }))
  })

  it('refuse un compte délié', async () => {
    const resultat = await prendreRendezVous({
      ...ports,
      compteDuMediateur: async () => ({
        ...compteBase,
        _tag: 'deconnecte',
        deconnexion: new Date('2026-07-08T00:00:00.000Z'),
      }),
    })(demande)

    expect(resultat).toEqual(failure({ _tag: 'CompteNonLie', agentId }))
  })

  it('remonte l’échec de RDV Service Public', async () => {
    const resultat = await prendreRendezVous({
      ...ports,
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
