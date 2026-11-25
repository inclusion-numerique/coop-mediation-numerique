import { encodeSerializableState } from '@/libraries/etat-encode'

export const hrefDeLActivite = (segmentDeType: string, id: string) =>
  `/coop/mes-activites/cra/${segmentDeType}/${id}` as const

export const hrefDuBeneficiaire = (id: string, retour: string) =>
  `/coop/mes-beneficiaires/${id}?retour=${encodeURIComponent(retour)}` as const

export const hrefDesAccompagnementsDuBeneficiaire = (id: string) =>
  `/coop/mes-beneficiaires/${id}/accompagnements` as const

export const hrefDeCreationDuBeneficiaire = <T>(retour: string, saisie: T) =>
  `/coop/mes-beneficiaires/nouveau?retour=${encodeURIComponent(retour)}&cra=${encodeSerializableState(saisie)}` as const
