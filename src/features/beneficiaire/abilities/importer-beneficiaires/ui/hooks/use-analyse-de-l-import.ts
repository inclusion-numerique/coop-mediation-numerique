'use client'

import { useCallback, useMemo } from 'react'
import {
  type AnalyseResponse,
  AnalysisSchema,
} from '../../domain/analyse-de-l-import'

const cleDeStockage = (id: string) => `beneficiaire-import-analysis-${id}`

export const useAnalyseDeLImport = (id: string): AnalyseResponse | null =>
  useMemo(() => {
    const stockee = sessionStorage.getItem(cleDeStockage(id))
    if (stockee === null) return null
    const analysis = AnalysisSchema.safeParse(JSON.parse(stockee))
    return analysis.success ? { analysis: analysis.data, id } : null
  }, [id])

export const useEnregistrementDeLAnalyse = () =>
  useCallback(({ id, analysis }: AnalyseResponse) => {
    sessionStorage.setItem(cleDeStockage(id), JSON.stringify(analysis))
  }, [])
