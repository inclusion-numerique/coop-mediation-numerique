import AdministrationInfoCard from '@app/web/libs/ui/administration/AdministrationInfoCard'
import AdministrationInlineLabelsValues from '@app/web/libs/ui/administration/AdministrationInlineLabelsValues'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
import type { MonLieuActivite } from '../../implementation'

export const LieuxDActiviteEnAdministration = ({
  lieux,
}: {
  lieux: readonly MonLieuActivite[]
}) =>
  lieux.length === 0 ? (
    <Notice
      className="fr-notice--alert fr-mb-6v"
      title={<>Aucun lieu d’activité</>}
    />
  ) : (
    <AdministrationInfoCard title="Lieux d’activité">
      {lieux.map(({ id, debut, lieuInclusion }) => (
        <div key={id}>
          <p className="fr-text--lg fr-text--medium fr-mb-4v fr-mt-8v">
            {lieuInclusion.nom}
          </p>
          <AdministrationInlineLabelsValues
            items={[
              { label: 'Nom', value: lieuInclusion.nom },
              {
                label: 'Id',
                value: (
                  <Link
                    href={`/administration/lieux-activite/${lieuInclusion.id}/modifier`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lieuInclusion.id}
                  </Link>
                ),
              },
              {
                label: 'Adresse',
                value: lieuInclusion.adresse || 'Non renseignée',
              },
              {
                label: 'Commune',
                value: lieuInclusion.commune || 'Non renseignée',
              },
              {
                label: 'Code Insee',
                value: lieuInclusion.codeInsee || 'Non renseigné',
              },
              {
                label: 'Code postal',
                value: lieuInclusion.codePostal || 'Non renseigné',
              },
              {
                label: 'Lien d’activité créé le',
                value: debut ? dateAsDay(debut) : '-',
              },
            ]}
          />
        </div>
      ))}
    </AdministrationInfoCard>
  )
