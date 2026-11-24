import type { Paginated } from '@arckit/resultset'
import {
  criteresDeLEquipe,
  triDeLEquipe,
} from '@/features/equipe/ui/filtres/equipe.filtre'
import {
  type AdresseCourante,
  composerLEtat,
} from '@/libraries/etat-d-url/definition/composition'
import { pagination } from '@/libraries/etat-d-url/definition/pagination'

export type ParametresDeLaListe = AdresseCourante['parametres']

export const paginationDeLEquipe = pagination({
  lignes: [10, 20, 50, 100],
  parDefaut: 50,
})

const listeDeLEquipe = composerLEtat(triDeLEquipe, paginationDeLEquipe)

export const requeteDeLaListe = (parametres: ParametresDeLaListe) => ({
  criteres: criteresDeLEquipe(parametres),
  ...listeDeLEquipe.charger(parametres).pagination,
})

export const liensDeLaListe = (
  adresse: AdresseCourante,
  resultat: Paginated<unknown>,
) => ({
  colonnes: listeDeLEquipe.tri.liens(
    adresse,
    listeDeLEquipe.charger(adresse.parametres),
  ),
  pages: listeDeLEquipe.pagination.liens(adresse, resultat),
})

export type LiensDeLaListe = ReturnType<typeof liensDeLaListe>
