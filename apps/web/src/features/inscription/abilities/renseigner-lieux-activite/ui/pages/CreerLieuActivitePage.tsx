'use client'

import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { CreerLieuActivitePageContent } from '@app/web/features/lieux-activite/components/creer/CreerLieuActivitePageContent'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from '@app/web/features/lieux-activite/components/creer/creerLieuActiviteFormData'
import { trpc } from '@app/web/trpc'
import { useRouter } from 'next/navigation'

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

/**
 * Création d'un lieu d'activité pendant l'inscription : on n'y arrive que
 * lorsque la recherche de l'étape « lieux d'activité » n'a rien rendu. Le lieu
 * est rattaché au médiateur dès sa création, puis on revient à l'étape.
 */
const CreerLieuActivitePage = ({
  mediateurId,
  nom,
  retourHref,
}: {
  mediateurId: string
  nom?: string
  retourHref: string
}) => {
  const router = useRouter()
  const mutation = trpc.structures.createLieu.useMutation()

  const onCreer = async (value: CreerLieuActiviteFormData) => {
    const { adresseBan, ...data } = toCreerLieuData(value)
    if (adresseBan == null) return

    try {
      await mutation.mutateAsync({
        ...data,
        adresseBan,
        lieuActiviteMediateurId: mediateurId,
      })

      createToast({
        priority: 'success',
        message: 'Le lieu d’activité a bien été créé.',
      })

      router.push(retourHref)
      router.refresh()
    } catch {
      erreurEnregistrement()
    }
  }

  return (
    <CreerLieuActivitePageContent
      retourHref={retourHref}
      nom={nom}
      onCreer={onCreer}
    />
  )
}

export default withTrpc(CreerLieuActivitePage)
