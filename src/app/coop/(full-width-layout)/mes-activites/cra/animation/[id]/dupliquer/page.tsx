import { notFound, redirect } from 'next/navigation'
import { authenticateCoordinateur } from '@/auth/authenticateUser'
import { lireUneActiviteDeCoordination } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination'
import { formulaireDeLAnimation } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/formulaire-de-la-coordination.presenter'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '@/features/activites/domain'
import { encodeSerializableState } from '@/utils/encodeSerializableState'

const DupliquerCraAnimationPage = async ({
  searchParams,
  params,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams

  const {
    coordinateur: { id: coordinateurId },
  } = await authenticateCoordinateur()

  const activiteId = ActiviteDeCoordinationId.safe(id)
  const activite =
    activiteId === null
      ? null
      : await lireUneActiviteDeCoordination({
          id: activiteId,
          coordinateurId: CoordinateurId(coordinateurId),
        })

  if (activite?._tag !== 'Animation') return notFound()

  const defaultValues = formulaireDeLAnimation(activite)

  const defaultValuesWithoutId = {
    ...defaultValues,
    id: undefined,
  }

  return redirect(
    `/coop/mes-activites/cra/animation?${
      retour ? `retour=${retour}&` : ''
    }v=${encodeSerializableState(defaultValuesWithoutId)}`,
  )
}

export default DupliquerCraAnimationPage
