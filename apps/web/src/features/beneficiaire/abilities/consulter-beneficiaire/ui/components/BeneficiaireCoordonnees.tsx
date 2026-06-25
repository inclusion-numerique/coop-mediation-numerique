import InfoLabelValue from '@app/web/components/InfoLabelValue'
import type { BeneficiaireInformations } from '../../domain/consulter-beneficiaire'

const BeneficiaireCoordonnees = ({
  beneficiaire: { telephone, pasDeTelephone, email },
}: {
  beneficiaire: Pick<
    BeneficiaireInformations,
    'telephone' | 'pasDeTelephone' | 'email'
  >
}) => (
  <div className="fr-border--bottom fr-pt-6v fr-px-6v fr-pb-8v">
    <h4 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-4v">
      Coordonnées
    </h4>
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-6">
        <InfoLabelValue
          label="Numéro de téléphone"
          value={pasDeTelephone ? 'Pas de téléphone' : telephone || '-'}
        />
      </div>
      <div className="fr-col-6">
        <InfoLabelValue label="E-mail" value={email || '-'} />
      </div>
    </div>
  </div>
)

export default BeneficiaireCoordonnees
