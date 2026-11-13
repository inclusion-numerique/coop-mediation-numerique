import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { dateAsDayConventional } from '@app/web/utils/dateAsDay'
import { numberToString } from '@app/web/utils/formatNumber'
import Button from '@codegouvfr/react-dsfr/Button'
import type { TotauxPresentes } from '../totaux.presenter'

export const ChiffresClesDesAccompagnements = ({
  totalCounts,
  debut,
  fin,
}: {
  totalCounts: TotauxPresentes
  debut?: string
  fin?: string
}) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-6v fr-col-xl-4 fr-col-12">
    <div className="fr-px-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel fr-width-full">
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
        <span className="fr-h2 fr-mb-0">
          {numberToString(totalCounts.accompagnements.total)}
        </span>
        <span
          className="ri-service-line ri-2x"
          style={{
            color: 'var(--brown-caramel-sun-425-moon-901-hover)',
          }}
          aria-hidden
        />
      </div>
      <div className="fr-text--bold fr-text--sm fr-mb-0 fr-mt-1v">
        Accompagnement{sPluriel(totalCounts.accompagnements.total)}{' '}
        <Button
          className="fr-px-2v fr-no-print"
          title="Plus d’information à propos des accompagnements"
          priority="tertiary no outline"
          size="small"
          type="button"
          aria-describedby="tooltip-accompagnements"
        >
          <span className="ri-information-line fr-text--lg" aria-hidden />
        </Button>
        <span
          className="fr-tooltip fr-placement fr-text--regular"
          id="tooltip-accompagnements"
          role="tooltip"
          aria-hidden
        >
          {numberToString(totalCounts.accompagnements.total)} accompagnements au
          total dont&nbsp;:
          <ul>
            <li>
              {numberToString(totalCounts.accompagnements.individuels.total)}{' '}
              accompagnement
              {sPluriel(totalCounts.accompagnements.individuels.total)}{' '}
              individuel
              {sPluriel(totalCounts.accompagnements.individuels.total)}
            </li>
            <li>
              {numberToString(totalCounts.activites.collectifs.participants)}{' '}
              participation
              {sPluriel(totalCounts.activites.collectifs.participants)} lors de{' '}
              {numberToString(totalCounts.activites.collectifs.total)} ateliers*
            </li>
          </ul>
          *Les ateliers collectifs comptent pour 1 accompagnement par
          participant. Ex&nbsp;: Un atelier collectif avec 10 participants
          compte pour 10 accompagnements.
        </span>
      </div>
    </div>
    <div className="fr-px-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel fr-flex-grow-1">
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
        <span className="fr-h2 fr-mb-0 fr-text--nowrap">
          {numberToString(totalCounts.beneficiaires.total)}
        </span>
        <span
          className="ri-user-heart-line ri-2x"
          style={{
            color: 'var(--brown-caramel-sun-425-moon-901-hover)',
          }}
          aria-hidden
        />
      </div>
      <div className="fr-mt-2v">
        <div className="fr-text--sm fr-text--bold fr-mb-0">
          Bénéficiaire{sPluriel(totalCounts.beneficiaires.total)} accompagné
          {sPluriel(totalCounts.beneficiaires.total)}
        </div>
        {totalCounts.beneficiaires.nouveaux !== 0 && (
          <div className="fr-text--medium fr-text-label--blue-france">
            dont{' '}
            <span className="fr-text--bold">
              {totalCounts.beneficiaires.nouveaux}
            </span>{' '}
            {totalCounts.beneficiaires.nouveaux === 1 ? 'nouveau' : 'nouveaux'}
            <Button
              className="fr-px-1v fr-ml-1v fr-no-print"
              title="Plus d’information à propos du nombre de nouveaux bénéficiaires accompagnés"
              priority="tertiary no outline"
              size="small"
              type="button"
              aria-describedby="tooltip-nombre-nouveaux-beneficiaires"
            >
              <span className="ri-information-line fr-text--lg" aria-hidden />
            </Button>
            {debut && fin && (
              <span
                className="fr-tooltip fr-placement"
                id="tooltip-nombre-nouveaux-beneficiaires"
                role="tooltip"
                aria-hidden
              >
                Nombre de nouveaux bénéficiaires entre le{' '}
                {dateAsDayConventional(new Date(debut))} et le{' '}
                {dateAsDayConventional(new Date(fin))}.
              </span>
            )}
          </div>
        )}
      </div>
      <div className="fr-text-mention--grey fr-text--sm fr-mb-0 fr-mt-4v">
        <div>
          <strong>{numberToString(totalCounts.beneficiaires.suivis)}</strong>{' '}
          bénéficiaire
          {sPluriel(totalCounts.beneficiaires.suivis)} suivi
          {sPluriel(totalCounts.beneficiaires.suivis)}
        </div>
        <div className="fr-whitespace-nowrap">
          <strong>{numberToString(totalCounts.beneficiaires.anonymes)}</strong>{' '}
          bénéficiaire
          {sPluriel(totalCounts.beneficiaires.anonymes)} anonyme
          {sPluriel(totalCounts.beneficiaires.anonymes)}
          <Button
            className="fr-px-1v fr-ml-1v fr-no-print"
            title="Plus d’information à propos des bénéficiaires anonymes"
            priority="tertiary no outline"
            size="small"
            type="button"
            aria-describedby="tooltip-nombre-beneficiaires-anonymes"
          >
            <span className="ri-information-line fr-text--lg" aria-hidden />
          </Button>
          <span
            className="fr-tooltip fr-placement"
            id="tooltip-nombre-beneficiaires-anonymes"
            role="tooltip"
            aria-hidden
          >
            Les bénéficiaires anonymes sont comptabilisés comme 1 nouveau
            bénéficiaire à chaque accompagnement.
          </span>
        </div>
      </div>
    </div>
  </div>
)
