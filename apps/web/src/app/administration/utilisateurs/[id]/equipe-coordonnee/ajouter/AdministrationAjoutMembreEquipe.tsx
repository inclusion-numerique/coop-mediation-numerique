'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
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
  const mutation = trpc.mediateur.addToTeam.useMutation()
  const router = useRouter()

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const handleSearchUserSelect = ({ value: userId }: { value: string }) => {
    setSelectedUserId(userId)
  }

  const onAdd = async () => {
    if (!selectedUserId) return
    try {
      await mutation.mutateAsync({
        userId: selectedUserId,
        coordinateurId: data.coordinateurUser.coordinateur.id,
      })
      createToast({
        priority: 'success',
        message: `L'utilisateur a été ajouté à l'équipe`,
      })
      router.push(
        `/administration/utilisateurs/${data.coordinateurUser.id}#coordinateur`,
      )
      router.refresh()
    } catch {
      createToast({
        priority: 'error',
        message: `Une erreur est survenue lors de l'ajout de l'utilisateur à l'équipe`,
      })
    }
  }

  const isLoading = mutation.isPending || mutation.isSuccess

  return (
    <div className="fr-border-radius--8 fr-border fr-p-8v fr-mb-6v">
      <h2 className="fr-h6">Rechercher l’utilisateur à ajouter à l’équipe</h2>
      <AdministrationSearchSingleUtilisateur
        onSelect={handleSearchUserSelect}
        excludeUserIds={data.userIdsInEquipe}
        includeDeleted
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
