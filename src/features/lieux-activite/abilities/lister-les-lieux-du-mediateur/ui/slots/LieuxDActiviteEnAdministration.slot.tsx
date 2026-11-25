import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
import { hrefDeModificationDuLieu } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import {
  AdministrationInfoCard,
  AdministrationInlineLabelsValues,
} from '@/libraries/ui/components'
import type { LieuDuMediateurEnListe } from '../../domain'
import { lieuEnAdministration } from '../presenters/lieu-en-administration.presenter'

export const LieuxDActiviteEnAdministration = ({
  lieux,
}: {
  lieux: readonly LieuDuMediateurEnListe[]
}) =>
  lieux.length === 0 ? (
    <Notice
      className="fr-notice--alert fr-mb-6v"
      title={<>Aucun lieu d’activité</>}
    />
  ) : (
    <AdministrationInfoCard title="Lieux d’activité">
      {lieux.map(lieuEnAdministration).map((lieu) => (
        <div key={lieu.rattachement}>
          <p className="fr-text--lg fr-text--medium fr-mb-4v fr-mt-8v">
            {lieu.nom}
          </p>
          <AdministrationInlineLabelsValues
            items={[
              { label: 'Nom', value: lieu.nom },
              {
                label: 'Id',
                value: (
                  <Link
                    href={hrefDeModificationDuLieu(lieu.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lieu.id}
                  </Link>
                ),
              },
              { label: 'Adresse', value: lieu.adresse },
              { label: 'Commune', value: lieu.commune },
              { label: 'Code Insee', value: lieu.codeInsee },
              { label: 'Code postal', value: lieu.codePostal },
              { label: 'Lien d’activité créé le', value: lieu.rattacheLe },
            ]}
          />
        </div>
      ))}
    </AdministrationInfoCard>
  )
