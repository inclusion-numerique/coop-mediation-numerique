import {
  type CodeDepartement,
  CodeInsee,
  codeDepartementDuCodeInsee,
  DEPARTEMENT_PAR_DEFAUT,
} from '@app/web/libraries/departement'
import type { LieuEnListe } from '../domain/lieu-en-liste'

export const departementDuLieu = (
  codeInsee: string | null,
): CodeDepartement => {
  const code = CodeInsee.safe(codeInsee ?? '')
  return code === null
    ? DEPARTEMENT_PAR_DEFAUT
    : codeDepartementDuCodeInsee(code)
}

export const hrefDuLieu = ({
  id,
  codeInsee,
}: {
  id: string
  codeInsee: string | null
}): string => `/coop/mon-reseau/${departementDuLieu(codeInsee)}/lieux/${id}`

export const hrefDuLieuEnListe = ({
  id,
  adresse,
}: Pick<LieuEnListe, 'id' | 'adresse'>): string =>
  hrefDuLieu({ id, codeInsee: adresse?.code_insee ?? null })
