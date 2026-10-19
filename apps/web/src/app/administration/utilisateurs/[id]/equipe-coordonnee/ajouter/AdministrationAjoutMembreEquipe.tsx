'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { AJOUTER_UN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/ajouter-un-membre/action/ajouter-un-membre.key'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import AdministrationSearchSingleUtilisateur from '../../../AdministrationSearchSingleUtilisateur'
import { AdministrationAjouterMembreEquipePageData } from './getAdministrationAjouterMembreEquipePageData'

export const AdministrationAjoutMembreEquipe = ({
  data,
}: {
  data: AdministrationAjouterMembreEquipePageData
}) => {
  const [etat, setEtat] = useState<'aucun' | 'en-cours' | 'fait'>('aucun')
  const router = useRouter()

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const handleSearchUserSelect = ({ value: userId }: { value: string }) => {
    setSelectedUserId(userId)
  }

  const onAdd = async () => {
    if (!selectedUserId) return
    setEtat('en-cours')
    const resultat = await inject(AJOUTER_UN_MEMBRE_ACTION_KEY)({
      utilisateurId: selectedUserId,
      coordinateurId: data.coordinateurUser.coordinateur.id,
    })

    if (!resultat.success) {
      setEtat('aucun')
      createToast({ priority: 'error', message: resultat.error })
      return
    }

    setEtat('fait')
    createToast({
      priority: 'success',
      message: `L'utilisateur a été ajouté à l'équipe`,
    })
    router.push(
      `/administration/utilisateurs/${data.coordinateurUser.id}#coordinateur`,
    )
    router.refresh()
  }

  const isLoading = etat !== 'aucun'

  return (
    <div className="fr-border-radius--8 fr-border fr-p-8v fr-mb-6v">
      <h2 className="fr-h6">Rechercher l’utilisateur à ajouter à l’équipe</h2>
      <AdministrationSearchSingleUtilisateur
        onSelect={handleSearchUserSelect}
        excludeUserIds={data.userIdsInEquipe}
        includeDeleted
        onlyMediateurs
      />
      <Button
        type="button"
        onClick={onAdd}
        iconId="fr-icon-user-add-line"
        disabled={!selectedUserId}
        {...buttonLoadingClassname(isLoading)}
      >
        Ajouter
      </Button>
    </div>
  )
}

export default withTrpc(AdministrationAjoutMembreEquipe)
