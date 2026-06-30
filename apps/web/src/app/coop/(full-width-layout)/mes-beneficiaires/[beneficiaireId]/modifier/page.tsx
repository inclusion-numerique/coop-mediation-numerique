import { modifierBeneficiaireAction } from '@app/web/app/_actions/beneficiaire/modifier-beneficiaire.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { beneficiaireAEditer } from '@app/web/features/beneficiaire/abilities/modifier-beneficiaire/implementation'
import { presentBeneficiaireAModifier } from '@app/web/features/beneficiaire/abilities/modifier-beneficiaire/ui/components/modifier-beneficiaire.presenter'
import { ModifierBeneficiairePage } from '@app/web/features/beneficiaire/abilities/modifier-beneficiaire/ui/pages/ModifierBeneficiairePage'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { notFound } from 'next/navigation'

const PageModifierBeneficiaire = async (props: {
  searchParams: Promise<{ retour?: string }>
  params: Promise<{ beneficiaireId: string }>
}) => {
  // 1. Contrôle d'accès
  const user = await authenticateMediateur()

  // 2. Préparation des entrées : le param de route est parsé par son value
  // object (schéma) et sert d'input à la récupération.
  const { beneficiaireId } = await props.params
  const { retour } = await props.searchParams

  // 3. Récupération via l'ability ; l'absence (inexistant ou non possédé)
  // déclenche un not-found.
  const beneficiaire = await beneficiaireAEditer({
    beneficiaireId: BeneficiaireId(beneficiaireId),
    mediateurId: MediateurId(user.mediateur.id),
  })

  if (!beneficiaire) {
    notFound()
  }

  // 4. Rendu de la vue avec toutes ses données.
  return (
    <ModifierBeneficiairePage
      view={presentBeneficiaireAModifier(beneficiaire)}
      save={modifierBeneficiaireAction}
      retour={retour}
    />
  )
}

export default PageModifierBeneficiaire
