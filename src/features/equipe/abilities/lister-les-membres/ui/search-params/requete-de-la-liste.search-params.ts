import type { CriteresEquipe } from '@/features/equipe/domain'
import { criteresDeLEquipe } from '@/features/equipe/ui/filtres/equipe.filtre'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/libraries/data-table/pagination/page-size-options'
import { entierPositifLu } from '@/libraries/parametres-d-url'
import type { ParametresDeLaListe } from './parametres-de-la-liste.search-params'

export type RequeteDeLaListe = {
  readonly criteres: CriteresEquipe
  readonly page: number
  readonly lignesParPage: number
}

export const requeteDeLaListe = (
  parametres: ParametresDeLaListe,
): RequeteDeLaListe => ({
  criteres: criteresDeLEquipe(parametres),
  page: entierPositifLu(parametres.page, DEFAULT_PAGE),
  lignesParPage: entierPositifLu(parametres.lignes, DEFAULT_PAGE_SIZE),
})
