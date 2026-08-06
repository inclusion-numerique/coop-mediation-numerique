import { metadataTitle } from '@app/web/app/metadataTitle'
import MonEquipeListePage from '@app/web/equipe/EquipeListePage/EquipeListePage'
import { getEquipePageData } from '@app/web/equipe/EquipeListePage/getEquipePageData'
import type { EquipeSearchParams } from '@app/web/equipe/EquipeListePage/searchMediateursCoordonneBy'
import {
  employeuseSessionEmplois,
  personneEmployeuseSelect,
  personneToEmployeuseActuelle,
} from '@app/web/features/employeuse/server'
import { getDepartementCodeForActeur } from '@app/web/features/mon-reseau/getDepartementCodeForActeur'
import { prismaClient } from '@app/web/prismaClient'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Mon équipe'),
}

const Page = async (props: {
  params: Promise<{ coordinateurId: string }>
  searchParams: Promise<EquipeSearchParams>
}) => {
  const searchParams = await props.searchParams
  const params = await props.params

  const { coordinateurId } = params

  const coordinateur = await prismaClient.coordinateur.findUnique({
    where: { id: coordinateurId },
    select: {
      id: true,
      mediateursCoordonnes: { select: { mediateurId: true } },
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          personneMain: { select: personneEmployeuseSelect },
        },
      },
    },
  })

  if (coordinateur == null) redirect('/')

  const monEquipePageData = await getEquipePageData({
    searchParams,
    coordinateur,
  })

  const departementCode = getDepartementCodeForActeur({
    // Employeuse courante en pur main : `personneToSessionEmplois` fournit la forme
    // { structure: { codeInsee } } attendue (0 ou 1 élément).
    emplois: employeuseSessionEmplois(
      personneToEmployeuseActuelle(coordinateur?.user.personneMain ?? null),
    ),
  })

  return (
    <MonEquipeListePage
      {...monEquipePageData}
      searchParams={searchParams}
      coordinateurView={false}
      baseHref={`/coop/mes-equipes/${coordinateurId}`}
      baseHrefSearch={`/coop/mes-equipes/${coordinateurId}`}
      coordinateur={coordinateur}
      departementCode={departementCode}
    />
  )
}

export default Page
