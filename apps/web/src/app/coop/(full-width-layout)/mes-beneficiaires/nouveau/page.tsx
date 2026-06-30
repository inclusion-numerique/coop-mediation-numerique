import { creerBeneficiaireAction } from '@app/web/app/_actions/beneficiaire/creer-beneficiaire.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import type { CraIndividuelData } from '@app/web/features/activites/use-cases/cra/individuel/validation/CraIndividuelValidation'
import { CreerBeneficiairePage } from '@app/web/features/beneficiaire/abilities/creer-beneficiaire/ui/pages/CreerBeneficiairePage'
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'
import type { DefaultValues } from 'react-hook-form'

// Route = orchestration : authentifie, décode le CRA en cours, lie l'action de
// création, puis délègue le rendu au composant de page de la feature.
const PageCreerBeneficiaire = async ({
  searchParams,
}: {
  searchParams: Promise<{
    cra?: EncodedState<DefaultValues<CraIndividuelData>>
    retour?: string
  }>
}) => {
  const { retour, cra } = await searchParams
  const user = await authenticateMediateur()

  const parsedCra = cra ? decodeSerializableState(cra, {}) : undefined

  return (
    <CreerBeneficiairePage
      mediateurId={user.mediateur.id}
      save={creerBeneficiaireAction}
      retour={retour}
      cra={parsedCra}
    />
  )
}

export default PageCreerBeneficiaire
