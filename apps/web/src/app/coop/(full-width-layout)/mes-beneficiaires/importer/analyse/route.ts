import {
  type Analysis,
  analyseImportBeneficiairesExcel,
} from '@app/web/beneficiaire/import/analyseImportBeneficiairesExcel'
import { getBeneficiaireImportSheet } from '@app/web/beneficiaire/import/getBeneficiaireImportSheet'
import * as Sentry from '@sentry/nextjs'
import type { NextRequest } from 'next/server'
import { v4 } from 'uuid'

export type AnalyseResponse = {
  analysis: Analysis
  id: string
}

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return new Response(null, {
        status: 400,
        statusText: 'Veuillez sélectionner un fichier valide',
      })
    }

    const arrayBuffer = await file.arrayBuffer()

    const sheet = getBeneficiaireImportSheet(arrayBuffer)

    const analysis = await analyseImportBeneficiairesExcel(sheet)

    if (
      analysis.rows.length === 0 ||
      (analysis.status === 'error' && analysis.rows.length === 0)
    ) {
      return new Response(null, {
        status: 400,
        statusText: 'Fichier invalide ou vide',
      })
    }

    const responseData: AnalyseResponse = {
      analysis,
      id: v4(),
    }

    return new Response(JSON.stringify(responseData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: need to log this output for debug in container logs
    console.error(error)
    Sentry.captureException(error)

    return new Response(null, {
      status: 400,
      statusText: 'Impossible de traiter le fichier',
    })
  }
}
