import { getAccompagnementsByDepartment } from '@app/web/app/api/ppg/getAccompagnementsByDepartment'
import { getSessionTokenFromNextRequestCookies } from '@app/web/auth/getSessionTokenFromCookies'
import { getSessionUserFromSessionToken } from '@app/web/auth/getSessionUserFromSessionToken'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { stringify } from 'csv-stringify/sync'
import { NextRequest } from 'next/server'

/**
 * Cette API permet de télécharger les accompagnements réalisés sur la Coop par les Conums et les médiateurs à une date donnée
 * Cette API est accessible uniquement par un administrateur
 */
export const GET = async (request: NextRequest) => {
  const sessionToken = getSessionTokenFromNextRequestCookies(request.cookies)
  const user = await getSessionUserFromSessionToken(sessionToken)

  if (user?.role !== 'Admin') {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const searchParams = await request.nextUrl.searchParams
  const dateParam = searchParams.get('date')
  const until = dateParam ? new Date(dateParam) : undefined

  const dataConum = await getAccompagnementsByDepartment({
    until,
    isConseillerNumerique: true,
  })
  await new Promise((resolve) => setTimeout(resolve, 100))
  const dataMediateur = await getAccompagnementsByDepartment({
    until,
    isConseillerNumerique: false,
  })

  if (!dataConum || !dataMediateur) {
    return new Response('No data available', {
      status: 500,
    })
  }

  const header = [
    'Département',
    'Code',
    'Accompagnements conum',
    'Accompagnements médiateur',
  ]
  //add in rows the data from the fetchAccompagnement conseiller-numerique and mediateur on the same row
  const rows = dataConum.map(({ departement, count }) => {
    const mediateur = dataMediateur.find(
      (d) => d.departement.code === departement.code,
    )
    return [departement.code, departement.nom, count, mediateur?.count ?? 0]
  })

  const csvData = stringify([header, ...rows])

  const filename = until
    ? `accompagnements_${dateAsIsoDay(until)}.csv`
    : 'accompagnements.csv'

  return new Response(csvData, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
