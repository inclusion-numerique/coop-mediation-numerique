import type { OptionsData } from '@app/ui/components/Primitives/Options'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { inject } from '@app/web/libs/injection/client'
import { RECHERCHER_DES_MEDIATEURS_A_INVITER_ACTION_KEY } from '../action/rechercher-des-mediateurs-a-inviter.key'
import {
  type EtatDeLaRecherche,
  rechercheTropCourte,
  suggestionsDe,
} from './mediateurs-a-inviter.presenter'
import { cleDe, libelleDe, type PersonneAInviter } from './personne-a-inviter'
import { UserRole } from './UserRole'

const chargerLesSuggestions =
  (dejaChoisis: () => readonly PersonneAInviter[]) =>
  async (recherche: string) => {
    if (rechercheTropCourte(recherche))
      return suggestionsDe({
        recherche,
        trouves: null,
        dejaChoisis: dejaChoisis(),
      })

    const resultat = await inject(
      RECHERCHER_DES_MEDIATEURS_A_INVITER_ACTION_KEY,
    )({ recherche })

    return suggestionsDe({
      recherche,
      trouves: resultat.success ? resultat.data : null,
      dejaChoisis: dejaChoisis(),
    })
  }

export const personneAInviterComboBox = (
  dejaChoisis: () => readonly PersonneAInviter[],
): ComboBoxData<PersonneAInviter, EtatDeLaRecherche> => ({
  itemToString: (personne) => (personne ? libelleDe(personne) : ''),
  itemToKey: cleDe,
  beforeLoadSuggestions: (recherche) => ({ recherche, enCours: true }),
  loadSuggestions: chargerLesSuggestions(dejaChoisis),
})

const renderItem = ({ item }: { item: PersonneAInviter }) =>
  item._tag === 'Mediateur' ? (
    <span className="fr-flex fr-direction-column">
      <span>{item.nom}</span>
      <span className="fr-flex fr-direction-row fr-flex-wrap fr-flex-gap-2v fr-text-mention--grey fr-text--sm fr-mb-0">
        <UserRole isConseillerNumerique={item.role === 'ConseillerNumerique'} />
        <span className="fr-hidden fr-unhidden-md" aria-hidden>
          ·
        </span>
        <span>
          <span className="ri-mail-line fr-mr-2v" aria-hidden />
          {item.email}
        </span>
      </span>
    </span>
  ) : (
    <span>{item.email}</span>
  )

export const PersonneAInviterOptions: OptionsData<PersonneAInviter> = {
  itemToKey: cleDe,
  renderItem,
}
