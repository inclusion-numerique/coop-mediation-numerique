import type { SessionUser } from '@app/web/auth/sessionUser'
import IconInSquare from '@app/web/components/IconInSquare'
import InscriptionCard from '@app/web/features/inscription/components/InscriptionCard'
import RenseignerStructureEmployeuseForm from './RenseignerStructureEmployeuseForm'

const RenseignerStructureEmployeusePage = ({
  user,
  nextStepPath,
}: {
  user: SessionUser
  nextStepPath: string
}) => {
  return (
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
        Votre structure employeuse est l'organisation qui vous emploie en tant
        que médiateur numérique. Recherchez-la par son nom, son SIRET ou son
        adresse.
      </p>
      <RenseignerStructureEmployeuseForm
        user={user}
        nextStepPath={nextStepPath}
      />
    </InscriptionCard>
  )
}

export default RenseignerStructureEmployeusePage
