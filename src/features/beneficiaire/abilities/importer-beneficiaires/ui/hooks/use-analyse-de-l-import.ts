'use client'

import { useCallback, useMemo } from 'react'
import type { AnalyseResponse } from '../../domain/analyse-de-l-import'

const cleDeStockage = (id: string) => `beneficiaire-import-analysis-${id}`

export const useAnalyseDeLImport = (id: string): AnalyseResponse | null =>
  useMemo(() => {
    const analysis = sessionStorage.getItem(cleDeStockage(id))
    return analysis
      ? { analysis: JSON.parse(analysis) as AnalyseResponse['analysis'], id }
      : null
  }, [id])

export const useEnregistrementDeLAnalyse = () =>
  useCallback(({ id, analysis }: AnalyseResponse) => {
    sessionStorage.setItem(cleDeStockage(id), JSON.stringify(analysis))
  }, [])
