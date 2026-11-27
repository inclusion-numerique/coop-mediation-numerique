import { notFound } from 'next/navigation'
import { modifierBeneficiaireAction } from '@/app/_actions/beneficiaire/modifier-beneficiaire.action'
import { authenticateMediateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { beneficiaireAEditer } from '@/features/beneficiaire/abilities/modifier-beneficiaire/implementations/prisma/beneficiaire-a-editer.query'
import { ModifierBeneficiairePage } from '@/features/beneficiaire/abilities/modifier-beneficiaire/ui/pages/ModifierBeneficiairePage'
import { presentBeneficiaireAModifier } from '@/features/beneficiaire/abilities/modifier-beneficiaire/ui/presenters/modifier-beneficiaire.presenter'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'

const PageModifierBeneficiaire = async (props: {
  searchParams: Promise<{ retour?: string }>
  params: Promise<{ beneficiaireId: string }>
}) => {
  const user = await authenticateMediateur()

  const { beneficiaireId } = await props.params
  const { retour } = await props.searchParams

  const beneficiaire = await beneficiaireAEditer({
    beneficiaireId: BeneficiaireId(beneficiaireId),
    mediateurId: MediateurId(user.mediateur.id),
    maintenant: new Date(),
  })

  if (!beneficiaire) {
    notFound()
  }

  return (
    <ModifierBeneficiairePage
      view={presentBeneficiaireAModifier(beneficiaire)}
      save={modifierBeneficiaireAction}
      retour={retour}
    />
  )
}

export default PageModifierBeneficiaire
