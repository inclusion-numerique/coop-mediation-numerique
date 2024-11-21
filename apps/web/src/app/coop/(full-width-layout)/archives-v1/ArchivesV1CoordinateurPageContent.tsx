import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'
import ContactSupportLink from '@app/web/components/ContactSupportLink'
import IconInSquare from '@app/web/components/IconInSquare'
import { dateAsMonthFull } from '@app/web/utils/dateAsMonth'
import ArchivesV1Card from '@app/web/app/coop/(full-width-layout)/archives-v1/ArchivesV1Card'
import ArchivesV1PageContent from '@app/web/app/coop/(full-width-layout)/archives-v1/ArchivesV1PageContent'
import type { ArchivesV1CoordinateurPageData } from '@app/web/app/coop/(full-width-layout)/archives-v1/getArchivesV1CoordinateurPageData'

const ArchivesV1CoordinateurPageContent = ({
  data: { ownData, conseillersData },
}: {
  data: ArchivesV1CoordinateurPageData
}) => {
  if (ownData.empty && conseillersData.length === 0) {
    return (
      <ArchivesV1Card>
        <h2 className="fr-h6 fr-mb-0">
          Vos archives de compte-rendus d’activités
        </h2>
        <p className="fr-mb-0">
          Aucune archive de compte-rendus d’activités n’a été trouvée.
          <br />
          Si vous pensez que c’est une erreur,{' '}
          <ContactSupportLink>veuillez contacter le support</ContactSupportLink>
          .
        </p>
      </ArchivesV1Card>
    )
  }

  const {
    firstDate,
    lastDate,
    input: { conseillerNumeriqueV1Id },
  } = ownData

  return (
    <>
      {ownData ? (
        <ArchivesV1PageContent hideEmptyDisclamer data={ownData} />
      ) : null}
      <div className="fr-border fr-border-radius--8 fr-p-10v fr-mt-6v">
        <IconInSquare iconId="ri-bar-chart-2-line" size="medium" />
        <h2 className="fr-h6 fr-text-title--blue-france fr-mt-6v fr-mb-1v">
          Statistiques mensuelles des conseillers numériques que vous coordonnez
          avant la date du 15.11.2024
        </h2>
        <p className="fr-text--xs fr-text-mention--grey fr-mb-6v">
          Retrouvez l’historique des statistiques mensuelles des conseillers
          numériques que vous coordonnez enregistrées sur la version précédente
          de l’espace Coop. Pour chaque conseiller numérique, retrouvez sur un
          même fichier tableur ses statistiques mensuels. Vous pouvez l’exporter
          au format tableur Excel (.xlsx).
        </p>
        <p className="fr-text--lg fr-text--bold fr-mt-12v fr-mb-4v">
          Statistiques agrégées des {conseillersData.length} conseillers
          numériques que vous coordonnez
        </p>
        <div className="fr-border--top fr-border--bottom fr-py-4v fr-flex fr-justify-content-space-between fr-flex-gap-4v fr-align-items-center">
          <div>
            <span className="fr-text--medium">
              {conseillersData.length} conseillers numériques
            </span>
            <span className="fr-text-mention--grey">
              <span className="fr-text-mention--grey">
                &nbsp;&nbsp;·&nbsp; statistiques de {dateAsMonthFull(firstDate)}{' '}
                à {dateAsMonthFull(lastDate)}
              </span>
            </span>
          </div>
          <Button
            size="small"
            priority="tertiary no outline"
            linkProps={{
              href: `/coop/archives-v1/exporter/statistiques?coordinateurV1Id=${conseillerNumeriqueV1Id}`,
              download: true,
            }}
          >
            Exporter
          </Button>
        </div>
        <p className="fr-text--lg fr-text--bold fr-mt-12v fr-mb-4v">
          Statistiques par conseiller numérique
        </p>
        {conseillersData.map((conseillerData) => (
          <div
            key={conseillerData.conseiller.id}
            className="fr-border--top fr-border--bottom fr-py-4v fr-flex fr-justify-content-space-between fr-flex-gap-4v fr-align-items-center"
          >
            {conseillerData.data.empty ? (
              <div>
                <span className="fr-text--medium">
                  {conseillerData.conseiller.prenom}{' '}
                  {conseillerData.conseiller.nom}
                </span>
                <span className="fr-text-mention--grey">
                  &nbsp;&nbsp;·&nbsp; aucun CRA
                </span>
              </div>
            ) : (
              <>
                <div>
                  <span className="fr-text--medium">
                    {conseillerData.conseiller.prenom}{' '}
                    {conseillerData.conseiller.nom}
                  </span>
                  <span className="fr-text-mention--grey">
                    &nbsp;&nbsp;·&nbsp; statistiques de{' '}
                    {dateAsMonthFull(conseillerData.data.firstDate)} à{' '}
                    {dateAsMonthFull(conseillerData.data.lastDate)}
                  </span>
                </div>
                <Button
                  size="small"
                  priority="tertiary no outline"
                  linkProps={{
                    href: `/coop/archives-v1/exporter/statistiques?conseillerNumeriqueV1Id=${conseillerData.conseiller.id}`,
                    download: true,
                  }}
                >
                  Exporter
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default ArchivesV1CoordinateurPageContent
