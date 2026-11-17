import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { lireUneActiviteDeCoordination } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination'
import { formulaireDuPartenariat } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/formulaire-de-la-coordination.presenter'
import {
  ActiviteDeCoordinationId,
  CoordinateurId,
} from '@app/web/features/activites/domain'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { notFound, redirect } from 'next/navigation'

const DupliquerCraPartenariatPage = async ({
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

  if (activite?._tag !== 'Partenariat') return notFound()

  const defaultValues = formulaireDuPartenariat(activite)

  const defaultValuesWithoutId = {
    ...defaultValues,
    id: undefined,
  }

  return redirect(
    `/coop/mes-activites/cra/partenariat?${
      retour ? `retour=${retour}&` : ''
    }v=${encodeSerializableState(defaultValuesWithoutId)}`,
  )
}

export default DupliquerCraPartenariatPage
