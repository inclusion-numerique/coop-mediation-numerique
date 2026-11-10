import { failure, success } from '@app/web/libraries/result'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
  DateDActivite,
  DateTropLointaine,
  Effectif,
  NomDeTag,
  Organisateur,
  TagId,
  TagInutilisable,
  TypeDEvenement,
  tagsDeLaSaisie,
} from '../../../domain'
import {
  activiteDeLaSaisie,
  type SaisieDeCoordination,
} from './saisie-de-coordination'

const reseau = {
  id: TagId('f0000000-0000-4000-8000-000000000001'),
  nom: NomDeTag('Réseau'),
}

const saisie: SaisieDeCoordination = {
  _tag: 'Evenement',
  id: null,
  date: DateDActivite('2027-03-01'),
  tags: [reseau.id],
  notes: null,
  nom: null,
  typeDEvenement: { _tag: 'Liste', valeur: TypeDEvenement('NecLocal') },
  organisateurs: { valeurs: [Organisateur('Commune')], autre: null },
  echelon: null,
  participants: Effectif(40),
}

const enregistrement = {
  saisie,
  id: ActiviteDeCoordinationId('b0000000-0000-4000-8000-000000000001'),
  coordinateurId: CoordinateurId('c0000000-0000-4000-8000-000000000001'),
  tags: [reseau],
  creation: new Date('2026-11-01T08:00:00Z'),
  maintenant: new Date('2026-11-10T08:00:00Z'),
}

describe('saisie d’une activité de coordination', () => {
  it('garde la création et date la modification', () => {
    const activite = activiteDeLaSaisie(enregistrement)
    expect(activite.success && activite.data).toMatchObject({
      id: enregistrement.id,
      coordinateurId: enregistrement.coordinateurId,
      tags: [reseau],
      creation: enregistrement.creation,
      modification: enregistrement.maintenant,
    })
  })

  it('refuse une date au-delà de deux ans', () => {
    expect(
      activiteDeLaSaisie({
        ...enregistrement,
        saisie: { ...saisie, date: DateDActivite('2028-11-11') },
      }),
    ).toEqual(failure(DateTropLointaine(DateDActivite('2028-11-10'))))
  })

  it('reprend les tags choisis parmi les tags utilisables', () => {
    expect(tagsDeLaSaisie([reseau.id], [reseau])).toEqual(success([reseau]))
  })

  it('refuse un tag qui n’est pas utilisable', () => {
    expect(tagsDeLaSaisie([reseau.id], [])).toEqual(failure(TagInutilisable()))
  })
})
