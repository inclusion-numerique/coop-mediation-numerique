import { notFound, redirect } from 'next/navigation'
import {
  cheminDeDuplicationDeCoordination,
  saisieDePartenariat,
} from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/implementations/page-de-saisie'
import { authenticateCoordinateur } from '@/features/authentification/implementations/session/authenticate-user'

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

  const chemin = await cheminDeDuplicationDeCoordination(saisieDePartenariat)({
    id,
    coordinateurId,
    retour,
  })

  return chemin === null ? notFound() : redirect(chemin)
}

export default DupliquerCraPartenariatPage
