import Button from '@codegouvfr/react-dsfr/Button'
import { PeriodeEnPopover } from '@/libraries/etat-d-url/filtres'
import {
  AdministrationInfoCard,
  AdministrationInlineLabelsValues,
} from '@/libraries/ui/components'
import {
  adresseDExport,
  adressesDesExports,
  debutDuFiltreDePeriode,
  groupesDesStatistiques,
  type PeriodeChoisie,
  periodeDActivite,
  type StatistiquesBrutes,
  titreDesStatistiques,
} from '../presenters/statistiques-en-administration.presenter'

export const StatistiquesEnAdministration = ({
  utilisateurId,
  coordinateur,
  premiere,
  derniere,
  periode,
  statistiques,
  maintenant,
}: {
  utilisateurId: string
  coordinateur: boolean
  premiere: string | null
  derniere: string | null
  periode: PeriodeChoisie
  statistiques: StatistiquesBrutes
  maintenant: Date
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
      <AdministrationInlineLabelsValues
        className="fr-mb-4v"
        items={[
          {
            label: 'Période d’activité',
            value: periodeDActivite(premiere, derniere),
          },
        ]}
      />
      <div className="fr-mb-8v">
        <PeriodeEnPopover
          debut={debutDuFiltreDePeriode(premiere)}
          fin={maintenant}
        />
      </div>
      <div className="fr-grid-row fr-grid-row--gutters">
        {groupesDesStatistiques({ ...statistiques, periode }).map(
          ({ titre, lignes }) => (
            <section key={titre} className="fr-col-12 fr-col-lg-6">
              <h5 className="fr-mb-3v">{titre}</h5>
              <AdministrationInlineLabelsValues
                items={lignes.map(({ libelle, valeur }) => ({
                  label: libelle,
                  value: <span className="fr-whitespace-nowrap">{valeur}</span>,
                }))}
              />
            </section>
          ),
        )}
      </div>
    </AdministrationInfoCard>
  )
}
