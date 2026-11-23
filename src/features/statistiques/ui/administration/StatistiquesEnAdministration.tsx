import Button from '@codegouvfr/react-dsfr/Button'
import type { ReactNode } from 'react'
import AdministrationInfoCard from '@/libraries/ui/components/administration/AdministrationInfoCard'
import { PeriodeFilter } from '../filtres/PeriodeFilter'
import {
  adresseDExport,
  adressesDesExports,
  bornesDuFiltreDePeriode,
  type PeriodeChoisie,
  periodeDActivite,
  titreDesStatistiques,
} from './statistiques-en-administration.presenter'

export const StatistiquesEnAdministration = ({
  utilisateurId,
  coordinateur,
  premiere,
  derniere,
  periode,
  chiffresCles,
}: {
  utilisateurId: string
  coordinateur: boolean
  premiere: string | null
  derniere: string | null
  periode: PeriodeChoisie
  chiffresCles: ReactNode
}) => {
  const exports = adressesDesExports(utilisateurId)

  return (
    <AdministrationInfoCard
      title={titreDesStatistiques({ coordinateur })}
      id="statistiques"
      actions={
        <div className="fr-flex fr-flex-gap-2v">
          <Button
            iconId="fr-icon-download-line"
            priority="secondary"
            size="small"
            linkProps={{
              href: adresseDExport(exports.statistiques, periode),
              download: true,
            }}
          >
            Exporter les statistiques
          </Button>
          <Button
            iconId="fr-icon-download-line"
            priority="secondary"
            size="small"
            linkProps={{
              href: adresseDExport(exports.accompagnements, periode),
              download: true,
            }}
          >
            Exporter les accompagnements
          </Button>
        </div>
      }
    >
      <p className="fr-mb-4v">
        <span className="fr-text--bold">Période d’activité&nbsp;: </span>
        {periodeDActivite(premiere, derniere)}
      </p>
      <div className="fr-mb-6v">
        <PeriodeFilter
          {...bornesDuFiltreDePeriode(premiere, periode)}
          maxDate={new Date()}
        />
      </div>
      <div className="fr-grid-row">{chiffresCles}</div>
    </AdministrationInfoCard>
  )
}
