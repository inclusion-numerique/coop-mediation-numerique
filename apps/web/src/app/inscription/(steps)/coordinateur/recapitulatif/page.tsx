import { redirect } from 'next/navigation'
import React from 'react'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { getAuthenticatedSessionUser } from '@app/web/auth/getSessionUser'
import InscriptionCard from '@app/web/app/inscription/(steps)/InscriptionCard'
import { getStructureEmployeuseForInscription } from '@app/web/app/inscription/getStructureEmployeuseForInscription'
import RoleInscriptionNotice from '@app/web/app/inscription/RoleInscriptionNotice'
import { getLieuxActiviteForInscription } from '@app/web/app/inscription/getLieuxActiviteForInscription'
import { findConseillersCoordonnesByEmail } from '@app/web/external-apis/conseiller-numerique/findConseillerNumeriqueByEmail'
import InscriptionRecapitulatif from '@app/web/app/inscription/InscriptionRecapitulatif'
import { profileInscriptionLabels } from '@app/web/inscription/profilInscription'
import { coordinateurInscriptionSteps } from '../coordinateurInscriptionSteps'

export const metadata = {
  title: metadataTitle('Finaliser mon inscription'),
}

const Page = async () => {
  const user = await getAuthenticatedSessionUser()

  if (!user.coordinateur) {
    redirect('/')
    return null
  }

  const emploi = await getStructureEmployeuseForInscription({
    userId: user.id,
  })

  if (!emploi) {
    throw new Error('No emploi found for conseiller numérique')
  }

  const lieuxActivite = user.mediateur?.id
    ? await getLieuxActiviteForInscription({
        mediateurId: user.mediateur.id,
      })
    : undefined

  const mediateursCoordonnes = await findConseillersCoordonnesByEmail(
    user.email,
  )

  return (
    <InscriptionCard
      title="Récapitulatif de vos informations"
      backHref={coordinateurInscriptionSteps.accompagnement}
      subtitle="Vérifiez que ces informations sont exactes avant de valider votre inscription."
    >
      <RoleInscriptionNotice
        roleInscription={profileInscriptionLabels.Coordinateur.toLocaleLowerCase()}
        className="fr-mt-12v"
      />
      <InscriptionRecapitulatif
        editLieuxActiviteHref={coordinateurInscriptionSteps.lieuxActivite}
        user={user}
        structureEmployeuse={emploi.structure}
        mediateursCoordonnesCount={Math.max(
          mediateursCoordonnes.length,
          user.coordinateur.mediateursCoordonnes.length,
        )}
        lieuxActivite={lieuxActivite}
        contactSupportLink
      />
    </InscriptionCard>
  )
}

export default Page
