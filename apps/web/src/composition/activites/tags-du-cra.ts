import type { SessionUser } from '@app/web/auth/sessionUser'
import type {
  RechercherDesTagsInitiaux,
  VisibiliteDuTagDuCra,
} from '@app/web/features/activites/use-cases/cra/tags/tag-du-cra'
import { visibilitesProposees } from '@app/web/features/tags/abilities/creer-un-tag/ui'
import { rechercherDesTags } from '@app/web/features/tags/abilities/rechercher-des-tags'
import { TagId } from '@app/web/features/tags/domain'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import { tagAffiche } from '@app/web/features/tags/ui/tag-affiche.presenter'

export const tagsInitiauxDuCra =
  (user: SessionUser): RechercherDesTagsInitiaux =>
  async (exclus) => {
    const acteur = acteurDe(user)
    const tags = await rechercherDesTags({
      acteur,
      recherche: '',
      exclus: exclus.map(TagId),
      limite: 10,
    })

    return tags.map(tagAffiche(acteur))
  }

export const visibilitesDeTagDuCra = (
  user: SessionUser,
  { departemental }: { readonly departemental: boolean },
): readonly VisibiliteDuTagDuCra[] =>
  visibilitesProposees(acteurDe(user)).filter(
    ({ _tag }) => departemental || _tag !== 'Departemental',
  )
