import { DEPARTEMENT_PAR_DEFAUT } from '@/libraries/departement'
import {
  type CodeDepartement,
  CodeInsee,
  codeDepartementDuCodeInsee,
} from '@/libraries/insee'
import type { LieuEnListe } from '../../domain/lieu-en-liste'

const departementDuLieu = (codeInsee: string | null): CodeDepartement => {
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
}) => `/coop/mon-reseau/${departementDuLieu(codeInsee)}/lieux/${id}` as const

export const hrefDuLieuEnListe = ({
  id,
  adresse,
}: Pick<LieuEnListe, 'id' | 'adresse'>) =>
  hrefDuLieu({ id, codeInsee: adresse?.code_insee ?? null })

export const hrefDeModificationDuLieu = (id: string) =>
  `/administration/lieux-activite/${id}/modifier` as const

export const hrefDeFusionDuLieu = (id: string) =>
  `/administration/lieux-activite/${id}/merge` as const

export const hrefDuLieuAFusionner = (cibleId: string, id: string) =>
  `${hrefDeFusionDuLieu(cibleId)}/${id}` as const
