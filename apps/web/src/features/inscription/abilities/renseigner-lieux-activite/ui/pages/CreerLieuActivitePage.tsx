'use client'

import { createToast } from '@app/ui/toast/createToast'
import { creerLieuActiviteAction } from '@app/web/app/_actions/inscription/creer-lieu-activite.action'
import {
  type CreerLieuActiviteFormData,
  CreerLieuActivitePageContent,
  toCreerLieuData,
} from '@app/web/features/lieux-activite/ui'
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
 *
 * L'ability se réserve le droit de ne rien créer : si la coop connaît déjà cet
 * établissement sous une autre dénomination, elle rattache l'existant. L'écran
 * n'a pas à le savoir — dans les deux cas le lieu est acquis.
 */
const CreerLieuActivitePage = ({
  nom,
  retourHref,
}: {
  nom?: string
  retourHref: string
}) => {
  const router = useRouter()

  const onCreer = async (value: CreerLieuActiviteFormData) => {
    const { adresseBan, ...data } = toCreerLieuData(value)
    if (adresseBan == null) return

    try {
      const result = await creerLieuActiviteAction({ ...data, adresseBan })

      if (!result.success) {
        erreurEnregistrement()
        return
      }

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

export default CreerLieuActivitePage
