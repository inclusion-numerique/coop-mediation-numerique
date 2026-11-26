import { Sort } from '@arckit/resultset'
import { composerLEtat, pagination, triParmi } from '@/libraries/etat-d-url'
import type { ColonneTriable } from '../../domain'

const colonnesTriables: readonly ColonneTriable[] = [
  'creation',
  'derniereConnexion',
  'derniereVisite',
  'nom',
  'courriel',
  'accompagnements',
  'lieuxActivite',
  'beneficiaires',
]

export const paginationDesUtilisateurs = pagination({
  lignes: [10, 20, 50, 100, 250, 500, 1000],
  parDefaut: 100,
})

export const listeDesUtilisateurs = composerLEtat(
  triParmi({
    colonnes: colonnesTriables,
    parDefaut: Sort('creation', 'desc'),
  }),
  paginationDesUtilisateurs,
)

export const CHEMIN_DES_UTILISATEURS = '/administration/utilisateurs'
