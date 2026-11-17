import InfoLabelValue from '@app/web/components/InfoLabelValue'
import { genreLabels } from '@app/web/features/beneficiaire/domain/genre'
import { statutSocialLabels } from '@app/web/features/beneficiaire/domain/statut-social'
import {
  effectiveTrancheAge,
  trancheAgeLabels,
} from '@app/web/features/beneficiaire/domain/tranche-age'
import type { BeneficiaireInformations } from '../../domain/consulter-beneficiaire'

const BeneficiaireInformationsComplementaires = ({
  beneficiaire: {
    commune,
    communeCodeInsee,
    communeCodePostal,
    genre,
    statutSocial,
    trancheAge,
    anneeNaissance,
  },
}: {
  beneficiaire: Pick<
    BeneficiaireInformations,
    | 'commune'
    | 'communeCodeInsee'
    | 'communeCodePostal'
    | 'genre'
    | 'statutSocial'
    | 'trancheAge'
    | 'anneeNaissance'
  >
}) => {
  const displayedTrancheAge = effectiveTrancheAge(anneeNaissance, trancheAge)

  return (
    <div className="fr-border--bottom fr-pt-6v fr-px-6v fr-pb-8v">
      <h4 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-4v">
        Informations complémentaires
      </h4>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-6">
          <InfoLabelValue
            label="Commune de résidence"
            value={
              commune && communeCodeInsee && communeCodePostal
                ? `${communeCodePostal} ${commune}`
                : '-'
            }
          />
        </div>
        <div className="fr-col-6">
          <InfoLabelValue
            label="Genre"
            value={genre ? genreLabels[genre] : '-'}
          />
        </div>
        <div className="fr-col-6">
          <InfoLabelValue
            label="Tranche d’âge"
            value={
              displayedTrancheAge ? trancheAgeLabels[displayedTrancheAge] : '-'
            }
          />
        </div>
        <div className="fr-col-6">
          <InfoLabelValue
            label="Statut social"
            value={statutSocial ? statutSocialLabels[statutSocial] : '-'}
          />
        </div>
      </div>
    </div>
  )
}

export default BeneficiaireInformationsComplementaires
