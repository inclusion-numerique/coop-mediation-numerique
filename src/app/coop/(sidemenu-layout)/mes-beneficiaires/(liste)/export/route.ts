import type { NextRequest } from 'next/server'
import { estMediateur } from '@/features/authentification/domain/profils-d-utilisateur'
import { utilisateurDuJetonDeSession } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.query'
import { jetonDeSessionDesCookies } from '@/features/authentification/implementations/session/session-token-from-cookies.query'
import { ExportBeneficiairesFilterValidations } from '@/features/beneficiaire/abilities/exporter-beneficiaires/action/filtres-de-l-export.validation'
import { exporterBeneficiaires } from '@/features/beneficiaire/abilities/exporter-beneficiaires/domain/exporter-beneficiaires'
import type { ListerLesBeneficiairesAExporter } from '@/features/beneficiaire/abilities/exporter-beneficiaires/domain/ports'
import { classeurDesBeneficiaires } from '@/features/beneficiaire/abilities/exporter-beneficiaires/implementations/excel/classeur-des-beneficiaires.classeur'
import { nomDuFichierDesBeneficiaires } from '@/features/beneficiaire/abilities/exporter-beneficiaires/ui/presenters/nom-du-fichier.presenter'
import { listerBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/implementations/prisma/lister-beneficiaires.query'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { auteurDeLExport } from '@/features/utilisateurs/ui/presenters/auteur-de-l-export.presenter'

const exporterBeneficiairesAvec = (
  listerBeneficiaires: ListerLesBeneficiairesAExporter,
) =>
  exporterBeneficiaires({
    listerBeneficiaires,
    construireLeClasseur: classeurDesBeneficiaires,
  })

export const GET = async (request: NextRequest) => {
  const sessionToken = jetonDeSessionDesCookies(request.cookies)
  const user = await utilisateurDuJetonDeSession(sessionToken)

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (!estMediateur(user)) {
    return new Response('Forbidden', { status: 403 })
  }

  const parsedQueryParams = ExportBeneficiairesFilterValidations.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  )

  if (parsedQueryParams.error) {
    return new Response('Invalid query params', { status: 400 })
  }

  const exportation = await exporterBeneficiairesAvec(listerBeneficiaires)({
    mediateurId: MediateurId(user.mediateur.id),
    filters:
      parsedQueryParams.data.recherche === undefined
        ? {}
        : { recherche: parsedQueryParams.data.recherche },
    auteur: auteurDeLExport(user),
    maintenant: new Date(),
  })

  if (!exportation.success) {
    return new Response('Export impossible', { status: 500 })
  }

  const data = await exportation.data.xlsx.writeBuffer()
  const filename = nomDuFichierDesBeneficiaires(new Date())

  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
