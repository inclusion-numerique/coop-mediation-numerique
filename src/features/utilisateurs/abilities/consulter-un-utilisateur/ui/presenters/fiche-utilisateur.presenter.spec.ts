import { describe, expect, it } from 'vitest'
import {
  AdresseCourriel,
  CoordinateurId,
  Dispositif,
  MediateurId,
  NomAffiche,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { Telephone } from '@/libraries/telephone'
import type {
  CoordinateurDeLaFiche,
  FicheUtilisateur,
  MediateurDeLaFiche,
} from '../../domain'
import {
  compteSupprime,
  dateDInscription,
  etatDeLInscription,
  etiquettesDuCompte,
  renseigne,
  rolesModifiables,
  telephoneAffiche,
} from './fiche-utilisateur.presenter'

const mediateur: MediateurDeLaFiche = {
  id: MediateurId('8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'),
  creeLe: new Date('2026-01-01'),
  modifieLe: new Date('2026-01-01'),
  beneficiaires: 0,
  activites: 0,
  lieuxActivite: 0,
  visible: false,
  retirable: true,
  coordinations: [],
}

const coordinateur: CoordinateurDeLaFiche = {
  id: CoordinateurId('9b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e'),
  creeLe: new Date('2026-01-01'),
  modifieLe: new Date('2026-01-01'),
  mediateursCoordonnes: 0,
  retirable: true,
}

const fiche = (surcharge: Partial<FicheUtilisateur>): FicheUtilisateur => ({
  id: UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'),
  nomAffiche: NomAffiche('Jeanne Martin'),
  prenom: null,
  nom: null,
  courriel: AdresseCourriel('jeanne@example.com'),
  telephone: null,
  role: RoleUtilisateur('User'),
  dispositif: Dispositif('HorsDispositif'),
  siret: null,
  creeLe: new Date('2026-01-01'),
  cycle: { _tag: 'InscriptionEnCours', creeLe: new Date('2026-01-01') },
  derniereConnexion: { _tag: 'Jamais' },
  derniereVisite: { _tag: 'Jamais' },
  statut: { _tag: 'Actif' },
  rattachements: { _tag: 'aucun' },
  liaisons: [],
  sessions: [],
  mutations: [],
  ...surcharge,
})

describe('présentation de la fiche utilisateur', () => {
  it('étiquette un conseiller numérique médiateur et coordinateur', () => {
    expect(
      etiquettesDuCompte(
        fiche({
          dispositif: Dispositif('ConseillerNumerique'),
          rattachements: rattachements(mediateur, coordinateur),
        }),
      ),
    ).toEqual(['Médiateur', 'Conseiller numérique', 'Coordinateur'])
  })

  it('étiquette un administrateur sans rôle métier', () => {
    expect(
      etiquettesDuCompte(fiche({ role: RoleUtilisateur('Admin') })),
    ).toEqual(['Administrateur'])
  })

  it('signale une valeur absente ou vide', () => {
    expect(renseigne(null)).toBe('Non renseigné')
    expect(renseigne('')).toBe('Non renseigné')
    expect(renseigne('Martin')).toBe('Martin')
  })

  it('affiche le téléphone au format national', () => {
    expect(telephoneAffiche(fiche({}))).toBe('Non renseigné')
    expect(
      telephoneAffiche(fiche({ telephone: Telephone('+33612345678') })),
    ).toBe('06 12 34 56 78')
  })

  it('date l’inscription d’un compte inscrit', () => {
    expect(
      dateDInscription(
        fiche({
          cycle: { _tag: 'Inscrit', inscritLe: new Date('2026-02-01') },
        }),
      ),
    ).toEqual(new Date('2026-02-01'))
  })

  it('n’a pas de date d’inscription tant que l’inscription est en cours', () => {
    expect(dateDInscription(fiche({}))).toBeNull()
  })

  it('décrit l’état d’inscription d’un médiateur inscrit', () => {
    expect(
      etatDeLInscription(
        fiche({
          cycle: { _tag: 'Inscrit', inscritLe: new Date('2026-02-01') },
          rattachements: rattachements<
            MediateurDeLaFiche,
            CoordinateurDeLaFiche
          >(mediateur, null),
        }),
      ),
    ).toEqual({
      role: 'User',
      inscriptionValidee: new Date('2026-02-01'),
      mediateur: { id: mediateur.id },
      coordinateur: null,
    })
  })

  it('propose d’ajouter les rôles absents', () => {
    expect(rolesModifiables(fiche({}))).toEqual({
      mediateur: { actuel: false, retirable: true },
      coordinateur: { actuel: false, retirable: true },
    })
  })

  it('reprend la possibilité de retirer les rôles actuels', () => {
    expect(
      rolesModifiables(
        fiche({
          rattachements: rattachements(
            { ...mediateur, retirable: false },
            coordinateur,
          ),
        }),
      ),
    ).toEqual({
      mediateur: { actuel: true, retirable: false },
      coordinateur: { actuel: true, retirable: true },
    })
  })

  it('reconnaît un compte supprimé', () => {
    expect(
      compteSupprime(
        fiche({
          cycle: {
            _tag: 'Supprime',
            depuis: new Date('2026-03-01'),
            avant: {
              _tag: 'InscriptionEnCours',
              creeLe: new Date('2026-01-01'),
            },
          },
        }),
      ),
    ).toBe(true)
  })

  it('ne tient pas un compte actif pour supprimé', () => {
    expect(compteSupprime(fiche({}))).toBe(false)
  })
})
