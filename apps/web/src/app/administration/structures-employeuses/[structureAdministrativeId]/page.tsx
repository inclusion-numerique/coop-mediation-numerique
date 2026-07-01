import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { contentId } from '@app/web/utils/skipLinks'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import Button from '@codegouvfr/react-dsfr/Button'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Structure employeuse'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const getStructureAdministrative = async (id: string) =>
  prismaClient.structureAdministrative.findFirst({
    where: { id, suppression: null },
    select: {
      id: true,
      nom: true,
      siret: true,
      rna: true,
      denomination: true,
      adresse: true,
      complementAdresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
      nomReferent: true,
      courrielReferent: true,
      telephoneReferent: true,
      emplois: {
        where: { suppression: null },
        orderBy: { creation: 'desc' },
        select: {
          id: true,
          debut: true,
          fin: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  })

const userLabel = ({
  firstName,
  lastName,
  name,
  email,
}: {
  firstName: string | null
  lastName: string | null
  name: string | null
  email: string
}) => [firstName, lastName].filter(Boolean).join(' ') || name || email

const DefinitionRow = ({
  label,
  value,
}: {
  label: string
  value: string | null
}) =>
  value ? (
    <div className="fr-mb-3v">
      <p className="fr-text--sm fr-text-mention--grey fr-mb-0">{label}</p>
      <p className="fr-text--md fr-mb-0">{value}</p>
    </div>
  ) : null

const Page = async (props: {
  params: Promise<{ structureAdministrativeId: string }>
}) => {
  const { structureAdministrativeId } = await props.params
  const structure = await getStructureAdministrative(structureAdministrativeId)

  if (!structure) {
    return notFound()
  }

  return (
    <CoopPageContainer size="full">
      <SkipLinksPortal />
      <div className="fr-flex fr-flex-gap-lg-4v fr-direction-column fr-direction-lg-row fr-justify-content-space-between">
        <AdministrationBreadcrumbs
          parents={[
            {
              label: 'Structures employeuses',
              linkProps: { href: '/administration/structures-employeuses' },
            },
          ]}
          currentPage={toTitleCase(structure.nom, { noUpper: true })}
        />
        <div>
          <Button
            iconId="fr-icon-git-merge-line"
            priority="tertiary"
            size="small"
            linkProps={{
              href: `/administration/structures-employeuses/${structure.id}/merge`,
            }}
          >
            Fusionner avec une autre structure employeuse
          </Button>
        </div>
      </div>

      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-building-line">
          {toTitleCase(structure.nom, { noUpper: true })}
        </AdministrationTitle>

        <div className="fr-grid-row fr-grid-row--gutters">
          <section className="fr-col-12 fr-col-lg-6">
            <h2 className="fr-h5">Identité légale</h2>
            <DefinitionRow label="Nom" value={structure.nom} />
            <DefinitionRow
              label="Dénomination"
              value={structure.denomination}
            />
            <DefinitionRow label="SIRET" value={structure.siret} />
            <DefinitionRow label="RNA" value={structure.rna} />
            <DefinitionRow
              label="Adresse"
              value={[
                structure.adresse,
                structure.complementAdresse,
                [structure.codePostal, structure.commune]
                  .filter(Boolean)
                  .join(' '),
              ]
                .filter(Boolean)
                .join(', ')}
            />
            <DefinitionRow label="Code INSEE" value={structure.codeInsee} />
          </section>

          <section className="fr-col-12 fr-col-lg-6">
            <h2 className="fr-h5">Référent</h2>
            <DefinitionRow label="Nom" value={structure.nomReferent} />
            <DefinitionRow
              label="Courriel"
              value={structure.courrielReferent}
            />
            <DefinitionRow
              label="Téléphone"
              value={structure.telephoneReferent}
            />
          </section>
        </div>

        <section className="fr-mt-6v">
          <h2 className="fr-h5">Emplois ({structure.emplois.length})</h2>
          {structure.emplois.length === 0 ? (
            <p className="fr-text--sm fr-text-mention--grey">
              Aucun emploi rattaché à cette structure employeuse.
            </p>
          ) : (
            <ul className="fr-raw-list">
              {structure.emplois.map((emploi) => (
                <li
                  key={emploi.id}
                  className="fr-py-2v fr-border-bottom fr-flex fr-justify-content-space-between fr-align-items-center"
                >
                  <span className="fr-text--md">{userLabel(emploi.user)}</span>
                  <span className="fr-text--xs fr-text-mention--grey">
                    {emploi.user.email}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </CoopPageContainer>
  )
}

export default Page
