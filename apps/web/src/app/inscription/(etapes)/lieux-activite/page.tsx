import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import type { LieuActiviteConnu } from '@app/web/features/inscription/abilities/renseigner-lieux-activite'
import LieuxActivitePage from '@app/web/features/inscription/abilities/renseigner-lieux-activite/ui/pages/LieuxActivitePage'
import { lieuxActiviteDuMediateur } from '@app/web/features/inscription/implementation/prisma/lieux-activite-du-mediateur.query'
import { hasInscriptionComplete } from '@app/web/security/getHomepage'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Renseigner vos lieux d’activité'),
}

const LieuxActivitePageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  if (!user.mediateur) {
    redirect('/inscription/initialiser')
  }

  // Les lieux déjà rattachés, projetés vers l'input du formulaire. Ils portent
  // tous un id — c'est lui qui porte la réconciliation, et c'est lui qui les
  // dispense d'une adresse validée : rien ne sera réécrit de la leur.
  const lieuxActivite = await lieuxActiviteDuMediateur({
    mediateurId: user.mediateur.id,
  })

  const lieuxExistants: LieuActiviteConnu[] = lieuxActivite.map((lieu) => ({
    id: lieu.id ?? '',
    structureCartographieNationaleId:
      lieu.structureCartographieNationaleId ?? null,
    nom: lieu.nom,
    adresse: lieu.adresse ?? '',
    commune: lieu.commune ?? '',
    codePostal: lieu.codePostal ?? '',
    codeInsee: lieu.codeInsee ?? null,
  }))

  return <LieuxActivitePage lieuxActivite={lieuxExistants} />
}

export default LieuxActivitePageRoute
