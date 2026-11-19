import { notFound, redirect } from 'next/navigation'
import {
  cheminDeDuplicationDeCoordination,
  saisieDEvenement,
} from '@/features/activites/abilities/enregistrer-une-activite-de-coordination'
import { authenticateCoordinateur } from '@/features/authentification/implementation/session/authenticateUser'

const DupliquerCraEvenementPage = async ({
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

  const chemin = await cheminDeDuplicationDeCoordination(saisieDEvenement)({
    id,
    coordinateurId,
    retour,
  })

  return chemin === null ? notFound() : redirect(chemin)
}

export default DupliquerCraEvenementPage
