import { genreLabels } from '@/features/beneficiaire/domain/genre'
import { statutSocialLabels } from '@/features/beneficiaire/domain/statut-social'
import { InfoLabelValue } from '@/libraries/ui/components'
import type { BeneficiaireInformations } from '../../domain/beneficiaire-informations'

const BeneficiaireInformationsComplementaires = ({
  beneficiaire: { communeResidence, genre, statutSocial },
  trancheAgeAffichee,
}: {
  beneficiaire: Pick<
    BeneficiaireInformations,
    'communeResidence' | 'genre' | 'statutSocial'
  >
  trancheAgeAffichee: string
}) => {
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
              communeResidence === null
                ? '-'
                : `${communeResidence.codePostal} ${communeResidence.commune}`
            }
          />
        </div>
        <div className="fr-col-6">
          <InfoLabelValue label="Genre" value={genreLabels[genre]} />
        </div>
        <div className="fr-col-6">
          <InfoLabelValue label="Tranche d’âge" value={trancheAgeAffichee} />
        </div>
        <div className="fr-col-6">
          <InfoLabelValue
            label="Statut social"
            value={statutSocialLabels[statutSocial]}
          />
        </div>
      </div>
    </div>
  )
}

export default BeneficiaireInformationsComplementaires
