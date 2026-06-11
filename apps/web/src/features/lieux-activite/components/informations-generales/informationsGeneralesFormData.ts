import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import type { StructureSearchResult } from '@app/web/features/inscription/use-cases/renseigner-structure-employeuse/searchStructureEmployeuseCombined'
import type { Typologie } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'
import z from 'zod'

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

export const InformationsGeneralesFormValidation = z
  .custom<InformationsGeneralesFormData>()
  .superRefine((data, ctx) => {
    if (!data.noSiret && !data.siretSearch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['siretSearch'],
        message: 'Veuillez rechercher et sélectionner une structure',
      })
    }
    if (!data.noSiret && data.siretSearch && !data.adresseBan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['siretSearch'],
        message:
          'L’adresse de la structure n’a pas pu être déterminée, veuillez sélectionner à nouveau la structure',
      })
    }
    if (data.noSiret && !data.nom?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nom'],
        message: "Veuillez renseigner le nom du lieu d'activité",
      })
    }
    if (data.noSiret && !data.adresseBan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['adresseBan'],
        message: 'Veuillez renseigner une adresse',
      })
    }
    if (data.typologies?.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['typologies'],
        message: 'Sélectionnez au moins une typologie de structure',
      })
    }
  })

export const informationsGeneralesFormOptions = formOptions({
  defaultValues: {} as InformationsGeneralesFormData,
})
