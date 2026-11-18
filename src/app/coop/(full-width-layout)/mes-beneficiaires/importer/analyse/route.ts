import type { NextRequest } from 'next/server'
import { v4 } from 'uuid'
import { signaler } from '@/configuration/telemetry/error-reporter/server/signaler'
import { analyseImportBeneficiairesExcel } from '@/features/beneficiaire/abilities/importer-beneficiaires/analyse/analyseImportBeneficiairesExcel'
import { getBeneficiaireImportSheet } from '@/features/beneficiaire/abilities/importer-beneficiaires/analyse/getBeneficiaireImportSheet'
import type { AnalyseResponse } from '@/features/beneficiaire/abilities/importer-beneficiaires/ui/import-analysis-storage'

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

    const sheet = await getBeneficiaireImportSheet(Buffer.from(arrayBuffer))

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
    signaler(error)

    return new Response(null, {
      status: 400,
      statusText: 'Impossible de traiter le fichier',
    })
  }
}
