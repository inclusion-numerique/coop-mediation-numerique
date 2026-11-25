import { notFound, redirect } from 'next/navigation'
import { lireUneActiviteDeCoordination } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/implementations/prisma/lire-une-activite-de-coordination.query'
import {
  cheminDeDuplicationDeCoordination,
  saisieDePartenariat,
} from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/presenters/page-de-saisie.presenter'
import { authenticateCoordinateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'

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
    activiteLue: lireUneActiviteDeCoordination,
    retour,
  })

  return chemin === null ? notFound() : redirect(chemin)
}

export default DupliquerCraPartenariatPage
