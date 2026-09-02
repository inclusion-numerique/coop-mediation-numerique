import type { MediateurEnActivite } from '@prisma/client'
import { LieuId } from '../domain/lieu-id'
import { MediateurId } from '../domain/mediateur-id'
import type { Rattachement } from '../domain/rattachement'
import { RattachementId } from '../domain/rattachement-id'
import {
  ModificationInconnue,
  ModifieParUtilisateur,
} from '../domain/tracabilite'
import { UserId } from '../domain/user-id'
import {
  rattachementFromDomain,
  rattachementToDomain,
} from './rattachement.transfer'

const creation = new Date('2026-01-15T09:00:00Z')
const modification = new Date('2026-08-20T14:30:00Z')
const debut = new Date('2026-02-01T00:00:00Z')
const fin = new Date('2026-07-01T00:00:00Z')

const auteur = UserId('550e8400-e29b-41d4-a716-446655440001')

const ligne = (rattachement: Rattachement): MediateurEnActivite =>
  rattachementFromDomain(rattachement)

/** Le cas minimal : personne n'est à l'origine de l'écriture. */
const minimal: Rattachement = {
  _tag: 'EnCours',
  id: RattachementId('550e8400-e29b-41d4-a716-446655440010'),
  lieuId: LieuId('550e8400-e29b-41d4-a716-446655440011'),
  mediateurId: MediateurId('550e8400-e29b-41d4-a716-446655440012'),
  debut,
  tracabilite: {
    creation: { date: creation, par: null },
    derniereModification: ModificationInconnue(modification),
  },
}

const parUnAuteur: Rattachement = {
  ...minimal,
  tracabilite: {
    creation: { date: creation, par: auteur },
    derniereModification: ModifieParUtilisateur(modification, auteur),
  },
}

describe('transfer du rattachement', () => {
  it('conserve un rattachement en cours sans auteur', () => {
    expect(rattachementToDomain(ligne(minimal))).toEqual(minimal)
  })

  it('conserve les auteurs de création et de modification', () => {
    expect(rattachementToDomain(ligne(parUnAuteur))).toEqual(parUnAuteur)
  })

  it('conserve un rattachement terminé', () => {
    const termine: Rattachement = { ...parUnAuteur, _tag: 'Termine', fin }

    expect(rattachementToDomain(ligne(termine))).toEqual(termine)
  })

  it('conserve un rattachement supprimé', () => {
    const supprime: Rattachement = {
      ...parUnAuteur,
      _tag: 'Supprime',
      suppression: modification,
      supprimePar: auteur,
      fin,
    }

    expect(rattachementToDomain(ligne(supprime))).toEqual(supprime)
  })

  it('ne rend pas « en cours » une ligne supprimée sans date de fin', () => {
    const incoherent: MediateurEnActivite = {
      ...ligne(minimal),
      fin: null,
      suppression: modification,
      suppressionParId: null,
    }

    expect(rattachementToDomain(incoherent)._tag).toBe('Supprime')
  })
})
