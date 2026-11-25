import type { NextRequest } from 'next/server'
import { v4 } from 'uuid'
import { signaler } from '@/configuration/telemetry/serveur'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import type { AnalyseResponse } from '@/features/beneficiaire/abilities/importer-beneficiaires/domain/analyse-de-l-import'
import { analyseImportBeneficiairesExcel } from '@/features/beneficiaire/abilities/importer-beneficiaires/implementations/analyse-de-l-import.binding'
import { getBeneficiaireImportSheet } from '@/features/beneficiaire/abilities/importer-beneficiaires/implementations/excel/feuille-d-import.classeur'

const tailleMaximaleDuFichier = 5 * 1024 * 1024

export const POST = async (request: NextRequest) => {
  const user = await utilisateurDuJetonDeSession(
    jetonDeSessionDesCookies(request.cookies),
  )
  if (!user) return new Response(null, { status: 401 })
  if (!user.mediateur) return new Response(null, { status: 403 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return new Response(null, {
        status: 400,
        statusText: 'Veuillez sélectionner un fichier valide',
      })
    }

    if (file.size > tailleMaximaleDuFichier) {
      return new Response(null, {
        status: 413,
        statusText: 'Le fichier dépasse 5 Mo',
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
