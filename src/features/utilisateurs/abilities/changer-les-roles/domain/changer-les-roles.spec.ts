import { describe, expect, it } from 'vitest'
import {
  AuteurId,
  CoordinateurId,
  MediateurId,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { AuteurDuChangement } from './auteur-du-changement'
import { changerLesRoles } from './changer-les-roles'
import type {
  CompteAReaffecter,
  CoordinateurAReaffecter,
  MediateurAReaffecter,
  OperationRole,
} from './plan-de-changement'

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')

const mediateurVierge: MediateurAReaffecter = {
  id: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
  activites: false,
  beneficiaires: false,
}

const coordinateurVierge: CoordinateurAReaffecter = {
  id: CoordinateurId('9b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e'),
  equipe: false,
  activitesCoordination: false,
  invitationsEnAttente: false,
}

const administrateurId = AuteurId('7c6b5a4d-3e2f-4a1b-9c8d-7e6f5a4b3c2d')

const administrateur: AuteurDuChangement = {
  _tag: 'administrateur',
  administrateurId,
}

const compte = (
  mediateur: MediateurAReaffecter | null,
  coordinateur: CoordinateurAReaffecter | null,
): CompteAReaffecter => ({
  id: utilisateurId,
  role: RoleUtilisateur('User'),
  supprime: false,
  rattachements: rattachements(mediateur, coordinateur),
})

const changerLesRolesDe = (compteLu: CompteAReaffecter | null) =>
  changerLesRoles({
    lireLeCompteAReaffecter: async () => compteLu,
    appliquerLePlan: async () => undefined,
    journaliserLeChangement: () => undefined,
  })

const demande = (mediateur: boolean, coordinateur: boolean) => ({
  utilisateurId,
  mediateur,
  coordinateur,
  auteur: administrateur,
})

describe('changer les rôles', () => {
  it('exige au moins un rôle', async () => {
    expect(
      await changerLesRolesDe(compte(mediateurVierge, null))(
        demande(false, false),
      ),
    ).toEqual({ success: false, error: { _tag: 'AucunRoleDemande' } })
  })

  it('signale un utilisateur introuvable', async () => {
    expect(await changerLesRolesDe(null)(demande(true, false))).toEqual({
      success: false,
      error: { _tag: 'UtilisateurIntrouvable' },
    })
  })

  it.each<{
    cas: string
    compteLu: CompteAReaffecter
    mediateur: boolean
    coordinateur: boolean
    operations: OperationRole[]
  }>([
    {
      cas: 'ajoute le rôle coordinateur à un médiateur',
      compteLu: compte(mediateurVierge, null),
      mediateur: true,
      coordinateur: true,
      operations: [{ _tag: 'AjouterCoordinateur' }],
    },
    {
      cas: 'crée le rôle coordinateur avant de retirer le rôle médiateur',
      compteLu: compte(mediateurVierge, null),
      mediateur: false,
      coordinateur: true,
      operations: [
        { _tag: 'AjouterCoordinateur' },
        { _tag: 'RetirerMediateur', mediateurId: mediateurVierge.id },
      ],
    },
    {
      cas: 'crée le rôle médiateur avant de retirer le rôle coordinateur',
      compteLu: compte(null, coordinateurVierge),
      mediateur: true,
      coordinateur: false,
      operations: [
        { _tag: 'AjouterMediateur' },
        {
          _tag: 'RetirerCoordinateur',
          coordinateurId: coordinateurVierge.id,
        },
      ],
    },
    {
      cas: 'ajoute les deux rôles à un compte sans rôle',
      compteLu: compte(null, null),
      mediateur: true,
      coordinateur: true,
      operations: [
        { _tag: 'AjouterMediateur' },
        { _tag: 'AjouterCoordinateur' },
      ],
    },
    {
      cas: 'ne change rien à un compte qui a déjà les deux rôles demandés',
      compteLu: compte(mediateurVierge, coordinateurVierge),
      mediateur: true,
      coordinateur: true,
      operations: [],
    },
    {
      cas: 'ne change rien à un coordinateur qui reste seulement coordinateur',
      compteLu: compte(null, coordinateurVierge),
      mediateur: false,
      coordinateur: true,
      operations: [],
    },
    {
      cas: 'ne change rien à un médiateur qui reste seulement médiateur',
      compteLu: compte(mediateurVierge, null),
      mediateur: true,
      coordinateur: false,
      operations: [],
    },
  ])('$cas', async ({ compteLu, mediateur, coordinateur, operations }) => {
    expect(
      await changerLesRolesDe(compteLu)(demande(mediateur, coordinateur)),
    ).toEqual({
      success: true,
      data: {
        utilisateurId,
        auteurId: administrateurId,
        plan: { operations },
      },
    })
  })

  it('applique les mêmes règles sans auteur quand le système décide du changement', async () => {
    expect(
      await changerLesRolesDe(compte(mediateurVierge, null))({
        utilisateurId,
        mediateur: true,
        coordinateur: true,
        auteur: { _tag: 'systeme' },
      }),
    ).toEqual({
      success: true,
      data: {
        utilisateurId,
        auteurId: null,
        plan: { operations: [{ _tag: 'AjouterCoordinateur' }] },
      },
    })
  })

  it.each<[string, MediateurAReaffecter]>([
    ['des activités', { ...mediateurVierge, activites: true }],
    ['des bénéficiaires', { ...mediateurVierge, beneficiaires: true }],
  ])('refuse de retirer un rôle médiateur qui a %s', async (_, mediateur) => {
    expect(
      await changerLesRolesDe(compte(mediateur, coordinateurVierge))(
        demande(false, true),
      ),
    ).toEqual({
      success: false,
      error: { _tag: 'RoleNonVierge', role: 'Mediateur' },
    })
  })

  it.each<[string, CoordinateurAReaffecter]>([
    ['une équipe', { ...coordinateurVierge, equipe: true }],
    [
      'des activités de coordination',
      { ...coordinateurVierge, activitesCoordination: true },
    ],
    [
      'des invitations en attente',
      { ...coordinateurVierge, invitationsEnAttente: true },
    ],
  ])(
    'refuse de retirer un rôle coordinateur qui a %s',
    async (_, coordinateur) => {
      expect(
        await changerLesRolesDe(compte(mediateurVierge, coordinateur))(
          demande(true, false),
        ),
      ).toEqual({
        success: false,
        error: { _tag: 'RoleNonVierge', role: 'Coordinateur' },
      })
    },
  )

  it('ne touche pas à un compte administrateur', async () => {
    expect(
      await changerLesRolesDe({
        ...compte(null, null),
        role: RoleUtilisateur('Admin'),
      })(demande(true, false)),
    ).toEqual({
      success: false,
      error: {
        _tag: 'RoleProtege',
        utilisateurId,
        role: RoleUtilisateur('Admin'),
      },
    })
  })

  it('ne touche pas à un compte supprimé', async () => {
    expect(
      await changerLesRolesDe({
        ...compte(mediateurVierge, null),
        supprime: true,
      })(demande(true, true)),
    ).toEqual({
      success: false,
      error: { _tag: 'CompteSupprime', utilisateurId },
    })
  })
})
