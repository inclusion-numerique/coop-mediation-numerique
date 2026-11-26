import { describe, expect, it } from 'vitest'
import type { ActiviteCoordinateur, ActiviteMediateur } from './activite'
import { rattachements } from './rattachements'
import { cycleDeVie } from './relances/cycle-de-vie'
import { JAMAIS, type Jalon, jalon } from './relances/jalon'
import { RoleUtilisateur } from './role-utilisateur'
import {
  type SituationDuCompte,
  type StatutCompte,
  statutDe,
} from './statut-compte'

const MAINTENANT = new Date('2026-10-21T12:00:00.000Z')

const ilYA = (jours: number): Date =>
  new Date(MAINTENANT.getTime() - jours * 24 * 60 * 60 * 1000)

const mediateur = (
  derniereActivite: Jalon,
  dernierBeneficiaire: Jalon = JAMAIS,
): ActiviteMediateur => ({ derniereActivite, dernierBeneficiaire })

const ilYALe = (jours: number): Jalon => jalon(ilYA(jours))

const coordinateur = (
  aUneEquipe: boolean,
  aCoordonne = false,
): ActiviteCoordinateur => ({ aUneEquipe, aCoordonne })

const inscrit = ({
  depuis = 200,
  role = 'User',
  med = null,
  coord = null,
  visite = JAMAIS,
}: {
  depuis?: number
  role?: 'User' | 'Admin'
  med?: ActiviteMediateur | null
  coord?: ActiviteCoordinateur | null
  visite?: Jalon
}): SituationDuCompte => ({
  role: RoleUtilisateur(role),
  cycle: cycleDeVie({
    creeLe: ilYA(depuis + 1),
    inscritLe: ilYA(depuis),
    supprimeLe: null,
  }),
  activite: {
    rattachements: rattachements(med, coord),
    derniereVisite: visite,
  },
})

const enInscription = (depuis: number): SituationDuCompte => ({
  role: RoleUtilisateur('User'),
  cycle: cycleDeVie({
    creeLe: ilYA(depuis),
    inscritLe: null,
    supprimeLe: null,
  }),
  activite: {
    rattachements: { _tag: 'aucun' },
    derniereVisite: JAMAIS,
  },
})

describe('statut d’un compte', () => {
  it('est supprimé avant tout le reste', () => {
    expect(
      statutDe(
        {
          ...inscrit({ role: 'Admin' }),
          cycle: cycleDeVie({
            creeLe: ilYA(10),
            inscritLe: ilYA(9),
            supprimeLe: ilYA(1),
          }),
        },
        MAINTENANT,
      ),
    ).toEqual({ _tag: 'Supprime' })
  })

  it('ne range pas un administrateur dans le cycle de vie', () => {
    expect(statutDe(inscrit({ role: 'Admin' }), MAINTENANT)).toEqual({
      _tag: 'Administrateur',
    })
  })

  it.each<[number, number]>([
    [0, 0],
    [8, 7],
    [31, 30],
    [61, 60],
    [91, 90],
  ])('inscription commencée il y a %i jours : palier J+%i', (jours, palier) => {
    expect(statutDe(enInscription(jours), MAINTENANT)).toEqual({
      _tag: 'InscriptionEnCours',
      palier,
    })
  })

  it.each<[number, number]>([
    [3, 0],
    [8, 7],
    [31, 30],
    [61, 60],
    [91, 90],
  ])(
    'inscrit depuis %i jours sans rien produire : nouveau J+%i',
    (jours, palier) => {
      expect(
        statutDe(
          inscrit({ depuis: jours, med: mediateur(JAMAIS) }),
          MAINTENANT,
        ),
      ).toEqual({ _tag: 'Nouveau', palier })
    },
  )

  it.each<[number, StatutCompte]>([
    [10, { _tag: 'Actif' }],
    [31, { _tag: 'Inactif', palier: 30 }],
    [91, { _tag: 'Inactif', palier: 90 }],
    [181, { _tag: 'Inactif', palier: 180 }],
  ])(
    'médiateur dont la dernière activité date de %i jours',
    (jours, attendu) => {
      expect(
        statutDe(inscrit({ med: mediateur(ilYALe(jours)) }), MAINTENANT),
      ).toEqual(attendu)
    },
  )

  it('compte la création d’un bénéficiaire comme une activité', () => {
    expect(
      statutDe(inscrit({ med: mediateur(JAMAIS, ilYALe(5)) }), MAINTENANT),
    ).toEqual({
      _tag: 'Actif',
    })
  })

  it('juge un coordinateur qui a une équipe sur sa dernière visite', () => {
    expect(
      statutDe(
        inscrit({ coord: coordinateur(true), visite: ilYALe(2) }),
        MAINTENANT,
      ),
    ).toEqual({ _tag: 'Actif' })
  })

  it('juge un coordinateur qui a coordonné sur sa dernière visite', () => {
    expect(
      statutDe(
        inscrit({ coord: coordinateur(false, true), visite: ilYALe(40) }),
        MAINTENANT,
      ),
    ).toEqual({ _tag: 'Inactif', palier: 30 })
  })

  it('ne retient pas la visite d’un coordinateur sans équipe ni coordination', () => {
    expect(
      statutDe(
        inscrit({ depuis: 10, coord: coordinateur(false), visite: ilYALe(1) }),
        MAINTENANT,
      ),
    ).toEqual({ _tag: 'Nouveau', palier: 7 })
  })

  it('retient l’activité de médiateur d’un double rôle sans équipe', () => {
    expect(
      statutDe(
        inscrit({
          med: mediateur(ilYALe(3)),
          coord: coordinateur(false),
          visite: ilYALe(1),
        }),
        MAINTENANT,
      ),
    ).toEqual({ _tag: 'Actif' })
  })

  it('retient la plus récente des deux activités d’un double rôle', () => {
    expect(
      statutDe(
        inscrit({
          med: mediateur(ilYALe(100)),
          coord: coordinateur(true),
          visite: ilYALe(2),
        }),
        MAINTENANT,
      ),
    ).toEqual({ _tag: 'Actif' })
  })
})
