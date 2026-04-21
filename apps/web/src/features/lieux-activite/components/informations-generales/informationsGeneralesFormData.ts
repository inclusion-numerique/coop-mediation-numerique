import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import type { StructureSearchResult } from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/searchStructureEmployeuseCombined'
import type { Typologie } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'

export type InformationsGeneralesFormData = {
  id: string
  nom: string
  adresseBan: AdresseBanData | null
  lieuItinerant: boolean | null
  complementAdresse: string | null
  siretSearch: StructureSearchResult | null
  rna: string | null
  nomUsage: string | null
  noSiret: boolean | null
  typologies: Typologie[]
}

export const informationsGeneralesFormOptions = formOptions({
  defaultValues: {} as InformationsGeneralesFormData,
})
