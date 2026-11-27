import { describe, expect, it } from 'vitest'
import { ProfilInscription, UtilisateurId } from '@/features/inscription/domain'
import { success } from '@/libraries/result'
import { consulterLeRecapitulatif } from './consulter-le-recapitulatif'
import { MediateurId } from './mediateur-id'
import type { InscritARecapituler, Recapitulatif } from './recapitulatif'

const utilisateurId = UtilisateurId('11111111-1111-1111-1111-111111111111')

const mediateurId = MediateurId('22222222-2222-2222-2222-222222222222')

const lieuxImportesLe = new Date('2026-07-16T10:00:00.000Z')

const consulterPour = (inscrit: InscritARecapituler) =>
  consulterLeRecapitulatif({
    lireLInscritARecapituler: async () => inscrit,
    listerLesLieux: async () => ['Médiathèque de Villeurbanne'],
    compterLesMediateursCoordonnes: async () => 3,
  })({ utilisateurId })

describe('consulter le récapitulatif de l’inscription', () => {
  it.each<{
    cas: string
    inscrit: InscritARecapituler
    attendu: Recapitulatif<string>
  }>([
    {
      cas: 'liste les lieux d’un médiateur, sans compter de médiateurs coordonnés',
      inscrit: {
        profil: ProfilInscription('Mediateur'),
        mediateurId,
        aUnCompteCoordinateur: false,
        lieuxImportesLe: null,
      },
      attendu: {
        lieuxActivite: ['Médiathèque de Villeurbanne'],
        nombreDeMediateursCoordonnes: null,
        lieuxImportesLe: null,
      },
    },
    {
      cas: 'liste les lieux d’un conseiller numérique et rapporte leur import depuis le Dataspace',
      inscrit: {
        profil: ProfilInscription('ConseillerNumerique'),
        mediateurId,
        aUnCompteCoordinateur: false,
        lieuxImportesLe,
      },
      attendu: {
        lieuxActivite: ['Médiathèque de Villeurbanne'],
        nombreDeMediateursCoordonnes: null,
        lieuxImportesLe,
      },
    },
    {
      cas: 'liste les lieux d’un compte médiateur dont le profil n’est pas encore choisi',
      inscrit: {
        profil: null,
        mediateurId,
        aUnCompteCoordinateur: false,
        lieuxImportesLe: null,
      },
      attendu: {
        lieuxActivite: ['Médiathèque de Villeurbanne'],
        nombreDeMediateursCoordonnes: null,
        lieuxImportesLe: null,
      },
    },
    {
      cas: 'ne liste aucun lieu sans compte médiateur',
      inscrit: {
        profil: ProfilInscription('Mediateur'),
        mediateurId: null,
        aUnCompteCoordinateur: false,
        lieuxImportesLe: null,
      },
      attendu: {
        lieuxActivite: [],
        nombreDeMediateursCoordonnes: null,
        lieuxImportesLe: null,
      },
    },
    {
      cas: 'compte les médiateurs d’un coordinateur, sans lister de lieux',
      inscrit: {
        profil: ProfilInscription('Coordinateur'),
        mediateurId,
        aUnCompteCoordinateur: true,
        lieuxImportesLe: null,
      },
      attendu: {
        lieuxActivite: [],
        nombreDeMediateursCoordonnes: 3,
        lieuxImportesLe: null,
      },
    },
    {
      cas: 'compte les médiateurs d’un coordinateur de conseillers numériques, sans lister de lieux',
      inscrit: {
        profil: ProfilInscription('CoordinateurConseillerNumerique'),
        mediateurId,
        aUnCompteCoordinateur: true,
        lieuxImportesLe: null,
      },
      attendu: {
        lieuxActivite: [],
        nombreDeMediateursCoordonnes: 3,
        lieuxImportesLe: null,
      },
    },
  ])('$cas', async ({ inscrit, attendu }) => {
    expect(await consulterPour(inscrit)).toStrictEqual(success(attendu))
  })
})
