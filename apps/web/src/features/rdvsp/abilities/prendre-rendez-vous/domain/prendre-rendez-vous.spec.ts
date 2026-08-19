import type { CompteRdv } from '../../../domain/compte-rdv'
import { UrlRetour } from '../../../domain/demande-rdv'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../../domain/identite'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UsagerId } from '../../../domain/usager-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import {
  type BeneficiaireCible,
  BeneficiaireCibleId,
  MediateurProprietaireId,
} from './beneficiaire-cible'
import {
  demandePourBeneficiaire,
  verifierBeneficiaire,
  verifierCompte,
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

describe('verifierBeneficiaire', () => {
  it('accepte un bénéficiaire suivi par ce médiateur', () => {
    const verifie = verifierBeneficiaire({
      beneficiaire,
      mediateurId,
      beneficiaireId,
    })

    expect(verifie.success).toBe(true)
  })

  it('refuse un bénéficiaire suivi par un autre médiateur', () => {
    const verifie = verifierBeneficiaire({
      beneficiaire: {
        ...beneficiaire,
        mediateurId: MediateurProprietaireId(
          '9c858901-8a57-4791-81fe-4c455b099bc9',
        ),
      },
      mediateurId,
      beneficiaireId,
    })

    expect(verifie.success === false && verifie.error._tag).toBe(
      'BeneficiaireIntrouvable',
    )
  })

  it('rend la même erreur pour un bénéficiaire absent que pour celui d’autrui', () => {
    const absent = verifierBeneficiaire({
      beneficiaire: null,
      mediateurId,
      beneficiaireId,
    })

    expect(absent.success === false && absent.error._tag).toBe(
      'BeneficiaireIntrouvable',
    )
  })
})

describe('verifierCompte', () => {
  it('accepte un compte lié', () => {
    const compte: CompteRdv = { ...compteBase, _tag: 'lie', jetons }

    expect(verifierCompte(compte).success).toBe(true)
  })

  it('refuse un compte délié', () => {
    const compte: CompteRdv = {
      ...compteBase,
      _tag: 'deconnecte',
      deconnexion: new Date('2026-07-08T00:00:00.000Z'),
    }

    const verifie = verifierCompte(compte)

    expect(verifie.success === false && verifie.error._tag).toBe('CompteNonLie')
  })

  it('refuse un médiateur sans compte', () => {
    expect(verifierCompte(null).success).toBe(false)
  })
})
