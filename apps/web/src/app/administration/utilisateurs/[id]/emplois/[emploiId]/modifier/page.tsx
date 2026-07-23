import ModifierEmployeStructureForm from '@app/web/app/administration/utilisateurs/[id]/emplois/[emploiId]/modifier/ModifierEmployeStructureForm'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { StructureCardStructure } from '@app/web/components/structure/StructureCard'
import {
  employeuseMainSelect,
  employeuseMainToLieuData,
} from '@app/web/features/structures/main/employeuseLieuData'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { contentId } from '@app/web/utils/skipLinks'
import { getUserDisplayName } from '@app/web/utils/user'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Utilisateurs - Modifier une structure employeuse'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  params: Promise<{ id: string; emploiId: string }>
}) => {
  const params = await props.params

  const { id, emploiId } = params

  const user = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      mediateur: true,
    },
  })

  if (!user) {
    notFound()
    return null
  }

  const emploi = await prismaClient.employeStructure.findUnique({
    where: {
      id: emploiId,
      userId: user.id,
    },
    include: {
      structureMain: {
        select: employeuseMainSelect,
      },
    },
  })

  if (!emploi) {
    notFound()
    return null
  }

  const name = getUserDisplayName(user)

  // Employeuse affichée depuis `main` (source de vérité, ADR-002 étape 6).
  const employeuse = emploi.structureMain
    ? employeuseMainToLieuData(emploi.structureMain)
    : null

  const structure: StructureCardStructure = {
    nom: employeuse?.nom ?? '',
    adresse: employeuse?.adresse ?? '',
    siret: employeuse?.siret ?? null,
    codePostal: employeuse?.codePostal ?? '',
    commune: employeuse?.commune ?? '',
    // L'identité employeuse (structure_administrative) ne porte pas de typologies (concept lieu)
    typologies: [],
    rna: employeuse?.rna ?? null,
  }

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs
        currentPage="Modifier"
        parents={[
          {
            label: 'Utilisateurs',
            linkProps: { href: '/administration/utilisateurs' },
          },
          {
            label: name,
            linkProps: { href: `/administration/utilisateurs/${id}` },
          },
          {
            label: 'Structure employeuse',
            linkProps: { href: `/administration/utilisateurs/${id}/emplois` },
          },
        ]}
      />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-user-line">
          {name} - Modifier un contrat - Structure employeuse{' '}
          <span className="fr-mx-1v" />{' '}
        </AdministrationTitle>
        <ModifierEmployeStructureForm
          user={user}
          structure={structure}
          defaultValues={{
            id: emploi.id,
            debut: emploi.debut ? dateAsIsoDay(emploi.debut) : undefined,
            fin: emploi.fin ? dateAsIsoDay(emploi.fin) : undefined,
          }}
        />
      </main>
    </CoopPageContainer>
  )
}

export default Page
