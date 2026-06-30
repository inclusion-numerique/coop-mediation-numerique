import IconInSquare from '@app/web/components/IconInSquare'
import InscriptionCard from '@app/web/features/inscription/components/InscriptionCard'
import RenseignerStructureEmployeuseForm, {
  type EnregistrerStructureEmployeuse,
} from '../components/RenseignerStructureEmployeuseForm'

/**
 * Page de l'étape « structure employeuse » : chrome d'inscription + formulaire.
 * La route lie la server action `save` ; le formulaire (client) reste découplé.
 */
const RenseignerStructureEmployeusePage = ({
  save,
  nextStepPath,
}: {
  save: EnregistrerStructureEmployeuse
  nextStepPath: string
}) => (
  <InscriptionCard
    title="Renseignez votre structure employeuse"
    backHref="/inscription/verifier-informations"
    stepNumber={2}
    totalSteps={3}
    nextStepTitle="Renseignez vos lieux d'activité"
  >
    <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-mb-6v">
      <IconInSquare iconId="fr-icon-building-line" size="small" />
      <h2 className="fr-h6 fr-mb-0 fr-text-title--blue-france">
        Ma structure employeuse
      </h2>
    </div>
    <p className="fr-text--sm fr-text-mention--grey fr-mb-6v">
      Votre structure employeuse est l’organisation qui vous emploie en tant que
      médiateur numérique. Recherchez-la par son nom, son SIRET ou son adresse.
    </p>
    <RenseignerStructureEmployeuseForm
      save={save}
      nextStepPath={nextStepPath}
    />
  </InscriptionCard>
)

export default RenseignerStructureEmployeusePage
