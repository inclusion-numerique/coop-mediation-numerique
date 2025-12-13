import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import BackButton from '@app/web/components/BackButton'
import InscriptionRecapitulatif from '@app/web/app/inscription/InscriptionRecapitulatif'
import { getLieuxActiviteForInscription } from '@app/web/app/inscription/getLieuxActiviteForInscription'
import { getStructureEmployeuseForInscription } from '@app/web/app/inscription/getStructureEmployeuseForInscription'
import { getMediateursCoordonnesForInscription } from '@app/web/app/inscription/getMediateursCoordonnesForInscription'
import { redirect } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Récapitulatif de votre inscription'),
}

const RecapitulatifPage = async () => {
  const user = await authenticateUser()

  // If inscription is already validated, redirect to coop
  if (user.inscriptionValidee) {
    redirect('/coop')
    return null
  }

  // If role not chosen, redirect back
  if (!user.profilInscription || !user.acceptationCgu) {
    redirect('/inscription/choisir-role')
    return null
  }

  // Get structure employeuse
  const structureEmployeuse = await getStructureEmployeuseForInscription({
    userId: user.id,
  })

  if (!structureEmployeuse) {
    // No structure employeuse found, redirect to structure selection
    // For now, we'll show an error message
    return (
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8">
            <div className="fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey">
              <h2 className="fr-h3">Structure employeuse manquante</h2>
              <p className="fr-text--lg">
                Vous devez renseigner votre structure employeuse avant de
                pouvoir finaliser votre inscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get lieux activite if mediateur
  const lieuxActivite =
    user.mediateur && user.profilInscription !== 'Coordinateur'
      ? await getLieuxActiviteForInscription({ mediateurId: user.mediateur.id })
      : []

  // Get mediateurs coordonnes count if coordinateur
  const mediateursCoordonnesCount = user.coordinateur
    ? await getMediateursCoordonnesForInscription({
        coordinateurId: user.coordinateur.id,
      })
    : undefined

  // Determine back link based on role
  const backHref =
    user.profilInscription === 'Mediateur' ||
    user.profilInscription === 'ConseillerNumerique'
      ? '/inscription/lieux-activite'
      : '/inscription/verifier-informations'

  return (
    <div className="fr-container">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-10">
          <div className="fr-mb-6v fr-mt-10v">
            <BackButton href={backHref}>Précédent</BackButton>
          </div>
          <div className="fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey">
            <h1 className="fr-h3 fr-mb-2v">Étape 3 sur 3</h1>
            <h2 className="fr-h2 fr-mb-4v">Récapitulatif de vos informations</h2>
            <p className="fr-text--lg fr-mb-6v">
              Vérifiez que les informations sont exactes avant de valider votre
              inscription.
            </p>

            <InscriptionRecapitulatif
              user={user}
              structureEmployeuse={structureEmployeuse}
              lieuxActivite={lieuxActivite}
              mediateursCoordonnesCount={mediateursCoordonnesCount}
              editLieuxActiviteHref="/inscription/lieux-activite"
              editStructureEmployeuseHref="/inscription/verifier-informations"
              contactSupportLink
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecapitulatifPage


