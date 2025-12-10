import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import BackButton from '@app/web/components/BackButton'
import LieuxActiviteForm from '@app/web/app/inscription/LieuxActiviteForm'
import { getLieuxActiviteForInscription } from '@app/web/app/inscription/getLieuxActiviteForInscription'
import { redirect } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Renseigner vos lieux d’activité'),
}

const LieuxActivitePage = async () => {
  const user = await authenticateUser()

  // If inscription is already validated, redirect to coop
  if (user.inscriptionValidee) {
    redirect('/coop')
    return null
  }

  // If role not chosen or not mediateur, redirect
  if (
    !user.profilInscription ||
    !user.acceptationCgu ||
    (user.profilInscription !== 'Mediateur' &&
      user.profilInscription !== 'ConseillerNumerique')
  ) {
    redirect('/inscription/choisir-role')
    return null
  }

  // Get existing lieux if any
  const lieuxActivite = user.mediateur
    ? await getLieuxActiviteForInscription({ mediateurId: user.mediateur.id })
    : []

  return (
    <div className="fr-container">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-md-10">
          <div className="fr-mb-6v fr-mt-10v">
            <BackButton href="/inscription/verifier-informations">
              Précédent
            </BackButton>
          </div>
          <div className="fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey">
            <h1 className="fr-h3 fr-mb-2v">Étape 2 sur 3</h1>
            <h2 className="fr-h2 fr-mb-4v">Renseignez vos lieux d'activité</h2>
            <p className="fr-text--lg fr-mb-6v">
              Étape suivante : Récapitulatif de vos informations
            </p>

            <div className="fr-callout fr-callout--blue-ecume fr-mb-6v">
              <h3 className="fr-callout__title">
                Est-ce que votre structure employeuse est également un de vos
                lieux d'activité ?
              </h3>
              <p className="fr-text--sm">
                Vos lieux d'activité sont les lieux où vous accueillez et
                accompagnez des bénéficiaires (ex : lieu de permanence...)
              </p>
            </div>

            <LieuxActiviteForm
              userId={user.id}
              existingLieuxActivite={lieuxActivite}
              nextUrl="/inscription/recapitulatif"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LieuxActivitePage
