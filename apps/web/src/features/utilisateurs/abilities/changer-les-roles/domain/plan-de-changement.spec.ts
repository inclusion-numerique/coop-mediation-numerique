import {
  Dispositif,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import {
  type CompteAReaffecter,
  type CoordinateurAReaffecter,
  type MediateurAReaffecter,
  planDeChangement,
} from './plan-de-changement'
import { rolesDemandes } from './roles-demandes'

const mediateurVierge: MediateurAReaffecter = {
  id: 'med',
  activites: false,
  beneficiaires: false,
}
const coordinateurVierge: CoordinateurAReaffecter = {
  id: 'coord',
  equipe: false,
  activitesCoordination: false,
  invitationsEnAttente: false,
}

const compte = (
  mediateur: MediateurAReaffecter | null,
  coordinateur: CoordinateurAReaffecter | null,
  surcharge: Partial<CompteAReaffecter> = {},
): CompteAReaffecter => ({
  id: UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'),
  role: RoleUtilisateur('User'),
  supprime: false,
  dispositif: Dispositif('HorsDispositif'),
  rattachements: rattachements(mediateur, coordinateur),
  ...surcharge,
})

const demande = (mediateur: boolean, coordinateur: boolean) => {
  const resultat = rolesDemandes({ mediateur, coordinateur })
  if (!resultat.success) throw new Error('demande invalide')
  return resultat.data
}

describe('rôles demandés', () => {
  it('exige au moins un rôle', () => {
    expect(rolesDemandes({ mediateur: false, coordinateur: false })).toEqual({
      success: false,
      error: { _tag: 'AucunRoleDemande' },
    })
  })
})

describe('plan de changement des rôles', () => {
  it('ajoute le rôle coordinateur à un médiateur', () => {
    const plan = planDeChangement(
      compte(mediateurVierge, null),
      demande(true, true),
    )
    expect(plan.success && plan.data.operations).toEqual([
      { _tag: 'AjouterCoordinateur' },
    ])
  })

  it('crée le nouveau rôle avant de retirer l’ancien', () => {
    const plan = planDeChangement(
      compte(mediateurVierge, null),
      demande(false, true),
    )
    expect(plan.success && plan.data.operations).toEqual([
      { _tag: 'AjouterCoordinateur' },
      { _tag: 'RetirerMediateur', mediateurId: 'med' },
    ])
  })

  it.each([
    ['des activités', { activites: true }],
    ['des bénéficiaires', { beneficiaires: true }],
  ])('refuse de retirer un rôle médiateur qui a %s', (_, production) => {
    const plan = planDeChangement(
      compte({ ...mediateurVierge, ...production }, coordinateurVierge),
      demande(false, true),
    )
    expect(plan.success === false && plan.error).toEqual({
      _tag: 'RoleNonVierge',
      role: 'Mediateur',
    })
  })

  it.each([
    ['une équipe', { equipe: true }],
    ['des activités de coordination', { activitesCoordination: true }],
    ['des invitations en attente', { invitationsEnAttente: true }],
  ])('refuse de retirer un rôle coordinateur qui a %s', (_, production) => {
    const plan = planDeChangement(
      compte(mediateurVierge, { ...coordinateurVierge, ...production }),
      demande(true, false),
    )
    expect(plan.success === false && plan.error).toEqual({
      _tag: 'RoleNonVierge',
      role: 'Coordinateur',
    })
  })

  it.each(['Admin', 'Support'] as const)(
    'ne touche pas à un compte %s',
    (role) => {
      const plan = planDeChangement(
        compte(null, null, { role: RoleUtilisateur(role) }),
        demande(true, false),
      )
      expect(plan.success === false && plan.error._tag).toBe('RoleProtege')
    },
  )

  it('ne touche pas à un compte supprimé', () => {
    const plan = planDeChangement(
      compte(mediateurVierge, null, { supprime: true }),
      demande(true, true),
    )
    expect(plan.success === false && plan.error._tag).toBe('CompteSupprime')
  })

  it.each([
    [true, true, 'HorsDispositif', 'Mediateur'],
    [true, false, 'ConseillerNumerique', 'ConseillerNumerique'],
    [false, true, 'HorsDispositif', 'Coordinateur'],
    [false, true, 'ConseillerNumerique', 'CoordinateurConseillerNumerique'],
  ] as const)(
    'médiateur %s, coordinateur %s, %s : profil %s',
    (mediateur, coordinateur, dispositif, profil) => {
      const plan = planDeChangement(
        compte(mediateurVierge, coordinateurVierge, {
          dispositif: Dispositif(dispositif),
        }),
        demande(mediateur, coordinateur),
      )
      expect(plan.success && plan.data.profil).toBe(profil)
    },
  )
})
