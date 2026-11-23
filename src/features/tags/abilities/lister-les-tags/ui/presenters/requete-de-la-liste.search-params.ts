import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/libraries/data-table/pagination/page-size-options'
import { entierPositifLu } from '@/libraries/parametres-d-url'
import { type TriDesTags, triDemande } from '../../domain'
import type { ParametresDeLaListe } from '../pages/ListeDesTagsPage'

export type RequeteDeLaListe = {
  readonly tri: TriDesTags
  readonly page: number
  readonly lignesParPage: number
}

export const requeteDeLaListe = (
  parametres: ParametresDeLaListe,
): RequeteDeLaListe => ({
  tri: triDemande(parametres.tri),
  page: entierPositifLu(parametres.page, DEFAULT_PAGE),
  lignesParPage: entierPositifLu(parametres.lignes, DEFAULT_PAGE_SIZE),
})
