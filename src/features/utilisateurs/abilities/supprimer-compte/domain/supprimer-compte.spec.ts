import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  AuteurId,
  type CompteASupprimer,
  CoordinateurId,
  CourrielHash,
  Dispositif,
  identiteAnonyme,
  MediateurId,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { EchecTechnique, failure, success } from '@/libraries/result'
import type { AuteurSuppression } from './auteur-suppression'
import type { SupprimerComptePorts } from './ports'
import { RetentionPolicy } from './retention-policy'
import { supprimerCompte } from './supprimer-compte'

const maintenant = new Date('2026-11-26T08:00:00.000Z')

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const mediateurId = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const coordinateurId = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

const titulaire: AuteurSuppression = { _tag: 'titulaire' }

const administrateur: AuteurSuppression = {
  _tag: 'administrateur',
  administrateurId: AuteurId('3c4d5e6f-7081-4920-a3b4-c5d6e7f8091a'),
}

const systeme: AuteurSuppression = {
  _tag: 'systeme',
  policy: RetentionPolicy('InscritJamaisActif'),
}

const compteOrdinaire: CompteASupprimer = {
  id: utilisateurId,
  courriel: AdresseCourriel('jean.dupont@example.com'),
  role: RoleUtilisateur('User'),
  etat: { _tag: 'actif' },
  rattachements: rattachements<MediateurId, CoordinateurId>(null, null),
  dispositif: Dispositif('HorsDispositif'),
}

const mediateurEtCoordinateur: CompteASupprimer = {
  ...compteOrdinaire,
  rattachements: rattachements<MediateurId, CoordinateurId>(
    mediateurId,
    coordinateurId,
  ),
}

const coordinateurSeul: CompteASupprimer = {
  ...compteOrdinaire,
  rattachements: rattachements<MediateurId, CoordinateurId>(
    null,
    coordinateurId,
  ),
}

const conseillerNumerique: CompteASupprimer = {
  ...compteOrdinaire,
  dispositif: Dispositif('ConseillerNumerique'),
}

const dejaSupprime: CompteASupprimer = {
  ...compteOrdinaire,
  etat: { _tag: 'supprime', depuis: new Date('2026-01-01T00:00:00.000Z') },
}

const administrateurDeLaCoop: CompteASupprimer = {
  ...compteOrdinaire,
  role: RoleUtilisateur('Admin'),
}

const identite = identiteAnonyme(CourrielHash('abcdefghijkl'))

const dependances = (
  compte: CompteASupprimer | null,
): SupprimerComptePorts => ({
  lireLeCompteASupprimer: async () => compte,
  couperLAcces: async () => success(undefined),
  journaliserLEffacement: () => undefined,
  hash: () => CourrielHash('abcdefghijkl'),
  anonymiserPortefeuille: async () => success({ anonymises: 4 }),
  effacerEmpreinteRdv: async () =>
    success({ compteDelie: true, rdvsExpurges: 2, usagersSupprimes: 1 }),
  effacerNotes: async () => success({ effacees: 5 }),
  retirerLesTagsDUnCompte: async () => success({ transferes: 1, supprimes: 1 }),
  detacherDesEquipes: async () =>
    success({ invitationsSupprimees: 1, appartenancesRetirees: 1 }),
  retirerDesLieux: async () => success({ rattachementsSupprimes: 2 }),
  revoquerPartageStatistiques: async () => success({ partagesRevoques: 1 }),
  retirerLeContactDeLaListe: async () => success({ _tag: 'Retire' }),
  lireLaPresenceDuContact: async () => success({ _tag: 'Present', listes: 1 }),
  supprimerLeContact: async () => success(undefined),
})

const supprimer = (deps: SupprimerComptePorts, auteur: AuteurSuppression) =>
  supprimerCompte(deps)({ cible: utilisateurId, auteur, maintenant })

describe('supprimer un compte', () => {
  it('efface tout ce que portent un médiateur et un coordinateur, portefeuille avant RDV Service Public et listes de diffusion en dernier', async () => {
    expect(
      await supprimer(dependances(mediateurEtCoordinateur), administrateur),
    ).toEqual({
      success: true,
      data: {
        id: utilisateurId,
        motif: 'DecisionAdministrateur',
        supprimeLe: maintenant,
        identite,
        dejaAnonymise: false,
        report: {
          _tag: 'complete',
          results: [
            { _tag: 'erased', step: 'PortefeuilleBeneficiaires', count: 4 },
            { _tag: 'erased', step: 'EmpreinteRdv', count: 3 },
            { _tag: 'erased', step: 'NotesAccompagnements', count: 5 },
            { _tag: 'erased', step: 'AppartenancesEquipe', count: 4 },
            { _tag: 'erased', step: 'LieuxActivite', count: 2 },
            { _tag: 'erased', step: 'PartageStatistiques', count: 1 },
            { _tag: 'erased', step: 'ListesDeDiffusion', count: 1 },
          ],
        },
      },
    })
  })

  it('n’efface ni portefeuille ni lieux pour un coordinateur seul', async () => {
    expect(
      await supprimer(dependances(coordinateurSeul), administrateur),
    ).toMatchObject({
      success: true,
      data: {
        report: {
          _tag: 'complete',
          results: [
            { step: 'EmpreinteRdv' },
            { step: 'NotesAccompagnements' },
            { step: 'AppartenancesEquipe' },
            { step: 'PartageStatistiques' },
            { step: 'ListesDeDiffusion' },
          ],
        },
      },
    })
  })

  it('ne retient pour un compte sans rattachement que ce qui pend à l’utilisateur', async () => {
    expect(await supprimer(dependances(compteOrdinaire), titulaire)).toEqual({
      success: true,
      data: {
        id: utilisateurId,
        motif: 'DemandeDuTitulaire',
        supprimeLe: maintenant,
        identite,
        dejaAnonymise: false,
        report: {
          _tag: 'complete',
          results: [
            { _tag: 'erased', step: 'EmpreinteRdv', count: 3 },
            { _tag: 'erased', step: 'ListesDeDiffusion', count: 1 },
          ],
        },
      },
    })
  })

  it('marque sans objet une étape qui n’a rien effacé, sans rendre le constat partiel', async () => {
    expect(
      await supprimer(
        {
          ...dependances(compteOrdinaire),
          retirerLeContactDeLaListe: async () =>
            success({ _tag: 'DejaAbsent' }),
        },
        titulaire,
      ),
    ).toMatchObject({
      success: true,
      data: {
        report: {
          _tag: 'complete',
          results: [
            { _tag: 'erased', step: 'EmpreinteRdv', count: 3 },
            { _tag: 'skipped', step: 'ListesDeDiffusion' },
          ],
        },
      },
    })
  })

  it.each<{ cas: string; echec: string; cause: string }>([
    {
      cas: 'le message de l’échec',
      echec: 'API injoignable',
      cause: 'API injoignable',
    },
    {
      cas: 'un message tronqué à la longueur du modèle',
      echec: 'x'.repeat(600),
      cause: 'x'.repeat(500),
    },
    {
      cas: 'un texte de repli quand l’échec n’en porte aucun',
      echec: '',
      cause: 'Erreur sans message',
    },
    {
      cas: 'un texte de repli quand l’échec ne porte que des blancs',
      echec: '   ',
      cause: 'Erreur sans message',
    },
  ])(
    'poursuit après l’échec d’une étape et en retient pour cause $cas',
    async ({ echec, cause }) => {
      expect(
        await supprimer(
          {
            ...dependances(compteOrdinaire),
            effacerEmpreinteRdv: async () => failure(EchecTechnique(echec)),
          },
          titulaire,
        ),
      ).toMatchObject({
        success: true,
        data: {
          report: {
            _tag: 'partial',
            results: [
              { _tag: 'failed', step: 'EmpreinteRdv', cause },
              { _tag: 'erased', step: 'ListesDeDiffusion', count: 1 },
            ],
            failed: ['EmpreinteRdv'],
          },
        },
      })
    },
  )

  it('compte le retrait de la liste et la suppression du contact qui n’est plus dans aucune liste', async () => {
    expect(
      await supprimer(
        {
          ...dependances(compteOrdinaire),
          lireLaPresenceDuContact: async () =>
            success({ _tag: 'Present', listes: 0 }),
        },
        titulaire,
      ),
    ).toMatchObject({
      success: true,
      data: {
        report: {
          _tag: 'complete',
          results: [
            { _tag: 'erased', step: 'EmpreinteRdv', count: 3 },
            { _tag: 'erased', step: 'ListesDeDiffusion', count: 2 },
          ],
        },
      },
    })
  })

  it.each<{ cas: string; defaillant: Partial<SupprimerComptePorts> }>([
    {
      cas: 'le retrait de la liste',
      defaillant: {
        retirerLeContactDeLaListe: async () =>
          failure(EchecTechnique('Brevo indisponible')),
      },
    },
    {
      cas: 'la lecture des listes du contact',
      defaillant: {
        lireLaPresenceDuContact: async () =>
          failure(EchecTechnique('Brevo indisponible')),
      },
    },
    {
      cas: 'la suppression du contact',
      defaillant: {
        lireLaPresenceDuContact: async () =>
          success({ _tag: 'Present', listes: 0 }),
        supprimerLeContact: async () =>
          failure(EchecTechnique('Brevo indisponible')),
      },
    },
  ])(
    'retient l’échec des listes de diffusion quand échoue $cas',
    async ({ defaillant }) => {
      expect(
        await supprimer(
          { ...dependances(compteOrdinaire), ...defaillant },
          titulaire,
        ),
      ).toMatchObject({
        success: true,
        data: { report: { _tag: 'partial', failed: ['ListesDeDiffusion'] } },
      })
    },
  )

  it('retient l’échec du détachement des équipes quand le retrait des tags échoue', async () => {
    expect(
      await supprimer(
        {
          ...dependances(coordinateurSeul),
          retirerLesTagsDUnCompte: async () =>
            failure(EchecTechnique('tags verrouillés')),
        },
        administrateur,
      ),
    ).toMatchObject({
      success: true,
      data: {
        report: {
          _tag: 'partial',
          failed: ['AppartenancesEquipe'],
        },
      },
    })
  })

  it.each<{ cas: string; auteur: AuteurSuppression; motif: string }>([
    { cas: 'au titulaire', auteur: titulaire, motif: 'DemandeDuTitulaire' },
    {
      cas: 'à l’administrateur',
      auteur: administrateur,
      motif: 'DecisionAdministrateur',
    },
    {
      cas: 'au système pour un inscrit jamais actif',
      auteur: systeme,
      motif: 'InactiviteApresInscription',
    },
    {
      cas: 'au système pour un compte inactif depuis deux ans',
      auteur: {
        _tag: 'systeme',
        policy: RetentionPolicy('InactifDepuisDeuxAns'),
      },
      motif: 'InactiviteProlongee',
    },
  ])('attribue la suppression $cas', async ({ auteur, motif }) => {
    expect(await supprimer(dependances(compteOrdinaire), auteur)).toMatchObject(
      { success: true, data: { motif } },
    )
  })

  it.each<{ cas: string; compte: CompteASupprimer; auteur: AuteurSuppression }>(
    [
      {
        cas: 'un administrateur supprimer le compte d’un conseiller numérique',
        compte: conseillerNumerique,
        auteur: administrateur,
      },
      {
        cas: 'la politique de rétention supprimer le compte d’un conseiller numérique',
        compte: conseillerNumerique,
        auteur: systeme,
      },
      {
        cas: 'un administrateur rejouer un effacement',
        compte: dejaSupprime,
        auteur: administrateur,
      },
      {
        cas: 'la politique de rétention rejouer un effacement',
        compte: dejaSupprime,
        auteur: systeme,
      },
    ],
  )('laisse $cas', async ({ compte, auteur }) => {
    expect(await supprimer(dependances(compte), auteur)).toMatchObject({
      success: true,
    })
  })

  it('signale un compte introuvable', async () => {
    expect(await supprimer(dependances(null), administrateur)).toEqual({
      success: false,
      error: { _tag: 'CompteIntrouvable', utilisateurId },
    })
  })

  it.each<[string, AuteurSuppression]>([
    ['un administrateur', administrateur],
    ['son titulaire', titulaire],
  ])('refuse à %s de supprimer un compte administrateur', async (_, auteur) => {
    expect(
      await supprimer(dependances(administrateurDeLaCoop), auteur),
    ).toEqual({
      success: false,
      error: {
        _tag: 'RoleProtege',
        utilisateurId,
        role: RoleUtilisateur('Admin'),
      },
    })
  })

  it('refuse au titulaire de supprimer un compte déjà supprimé', async () => {
    expect(await supprimer(dependances(dejaSupprime), titulaire)).toEqual({
      success: false,
      error: {
        _tag: 'CompteDejaSupprime',
        utilisateurId,
        depuis: new Date('2026-01-01T00:00:00.000Z'),
      },
    })
  })

  it('refuse à un conseiller numérique sous contrat de supprimer son compte', async () => {
    expect(
      await supprimer(dependances(conseillerNumerique), titulaire),
    ).toEqual({
      success: false,
      error: { _tag: 'SuppressionReserveeAuDispositif', utilisateurId },
    })
  })

  it('n’efface rien quand l’accès n’a pas pu être coupé', async () => {
    expect(
      await supprimer(
        {
          ...dependances(compteOrdinaire),
          couperLAcces: async () => failure(EchecTechnique('base verrouillée')),
        },
        titulaire,
      ),
    ).toEqual({
      success: false,
      error: {
        _tag: 'AccesNonCoupe',
        utilisateurId,
        cause: 'base verrouillée',
      },
    })
  })
})
