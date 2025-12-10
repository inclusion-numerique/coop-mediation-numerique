import { getLieuxActiviteForInscription } from '@app/web/app/inscription/getLieuxActiviteForInscription'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import BackButton from '@app/web/components/BackButton'
import {
  getMediateurFromDataspaceApi,
  isDataspaceApiError,
} from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { initializeAndImportUserDataFromDataspace } from '@app/web/features/dataspace/initializeAndImportUserDataFromDataspace'
import { updateUserInscriptionProfileFromDataspace } from '@app/web/features/dataspace/updateUserInscriptionProfileFromDataspace'
import { profileInscriptionSlugs } from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import { getProconnectIdToken } from '@app/web/security/getProconnectIdToken'
import { redirect } from 'next/navigation'
import React from 'react'
import { FinaliserInscriptionConseillerNumerique } from './_components/FinaliserInscriptionConseillerNumerique/FinaliserInscriptionConseillerNumerique'
import { FinaliserInscriptionCoordinateurConseillerNumerique } from './_components/FinaliserInscriptionCoordinateurConseillerNumerique/FinaliserInscriptionCoordinateurConseillerNumerique'
import { FinaliserInscriptionHorsDispositif } from './_components/FinaliserInscriptionHorsDispositif/FinaliserInscriptionHorsDispositif'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Finaliser mon inscription'),
}

/**
 * Cette page :
 *  - vérifie si l'utilisateur a des données dans l'API Dataspace
 *  - affiche un message d'erreur si le role ne correspond pas
 *  - importe les données de l'API Dataspace si le role correspond
 *  - créé l'objet "mediateur" si le role correspond
 */
const IdentificationPage = async () => {
  const user = await authenticateUser()

  const intendedProfileInscription = user.profilInscription

  if (!intendedProfileInscription) {
    redirect('/inscription')
    return null
  }

  // Fetch from Dataspace API instead of MongoDB
  const dataspaceResult = await getMediateurFromDataspaceApi({
    email: user.email,
  })

  // Handle API errors
  if (isDataspaceApiError(dataspaceResult)) {
    throw new Error(
      `Dataspace API error: ${dataspaceResult.error.message}`,
    )
  }

  // dataspaceResult is either DataspaceMediateur or null (not found)
  const dataspaceData = dataspaceResult

  const profilCheckedUser = await updateUserInscriptionProfileFromDataspace({
    user,
    dataspaceData,
  })

  const { checkedProfilInscription } = profilCheckedUser

  const userWithImportedData = await initializeAndImportUserDataFromDataspace({
    user: {
      ...profilCheckedUser,
      profilInscription: intendedProfileInscription,
    },
    dataspaceData,
  })

  const lieuxActivite = user.mediateur?.conseillerNumerique
    ? await getLieuxActiviteForInscription({ mediateurId: user.mediateur.id })
    : []

  const proConnectIdTokenHint = await getProconnectIdToken(user)
  const checkedProfilInscriptionSlug =
    profileInscriptionSlugs[checkedProfilInscription]
  const intendedProfileInscriptionSlug =
    profileInscriptionSlugs[intendedProfileInscription]

  return (
    <div className="fr-mb-32v">
      <div className="fr-mb-6v fr-mt-10v">
        <BackButton href="/inscription">Précédent</BackButton>
      </div>
      <div className="fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey">
        {intendedProfileInscription === 'ConseillerNumerique' && (
          <FinaliserInscriptionConseillerNumerique
            checkedProfilInscription={checkedProfilInscriptionSlug}
            user={userWithImportedData}
            lieuActiviteCount={lieuxActivite.length}
            proConnectIdTokenHint={proConnectIdTokenHint}
          />
        )}
        {intendedProfileInscription === 'CoordinateurConseillerNumerique' && (
          <FinaliserInscriptionCoordinateurConseillerNumerique
            checkedProfilInscription={checkedProfilInscriptionSlug}
            user={userWithImportedData}
            lieuActiviteCount={lieuxActivite.length}
            proConnectIdTokenHint={proConnectIdTokenHint}
          />
        )}
        {(intendedProfileInscription === 'Mediateur' ||
          intendedProfileInscription === 'Coordinateur') && (
          <FinaliserInscriptionHorsDispositif
            checkedProfilInscription={checkedProfilInscriptionSlug}
            intendedProfilInscription={intendedProfileInscriptionSlug}
            lieuActiviteCount={lieuxActivite.length}
          />
        )}
      </div>
    </div>
  )
}

export default IdentificationPage
