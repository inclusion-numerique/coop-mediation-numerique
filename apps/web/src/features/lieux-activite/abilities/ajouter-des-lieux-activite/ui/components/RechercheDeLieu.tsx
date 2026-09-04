import CustomSelect from '@app/ui/components/CustomSelect/CustomSelect'
import Link from 'next/link'
import type { OptionDeRecherche } from './options-de-recherche'

const CHAMP = 'recherche-lieu-a-ajouter'

/**
 * Le champ de recherche d'un lieu à ajouter.
 *
 * `cle` vide le champ après chaque sélection — le lieu choisi est désormais
 * dans le panier, le laisser aussi dans le champ ferait croire à une sélection
 * en attente.
 */
export const RechercheDeLieu = ({
  cle,
  chargerLesOptions,
  onSelection,
}: {
  cle: number
  chargerLesOptions: (recherche: string) => Promise<OptionDeRecherche[]>
  onSelection: (identifiant: string | null) => void
}) => (
  <>
    <div className="fr-input-group fr-mb-1w">
      <label className="fr-label" htmlFor={CHAMP}>
        Rechercher par nom du lieu, adresse ou SIRET.
      </label>
      <CustomSelect
        inputId={CHAMP}
        instanceId={CHAMP}
        className="fr-mt-1w"
        key={cle}
        placeholder="Rechercher un lieu d’activité"
        // `react-select` type ses libellés en chaînes alors qu'il en rend les
        // nœuds. La conversion tient ici, au seul point de contact avec la
        // bibliothèque, plutôt que sur chaque entrée construite en amont.
        loadOptions={
          chargerLesOptions as (
            recherche: string,
          ) => Promise<{ label: string; value: string }[]>
        }
        isOptionDisabled={(option) => option.value === ''}
        onChange={(option) => onSelection(option?.value ?? null)}
        cacheOptions
      />
    </div>
    <div className="fr-mb-12v">
      <Link
        className="fr-link fr-link--sm"
        href="https://annuaire-entreprises.data.gouv.fr/"
        target="_blank"
        rel="noreferrer"
        title="Annuaire des Entreprises - nouvelle fenêtre"
      >
        Retrouvez votre SIRET sur l’Annuaire des Entreprises
      </Link>
    </div>
  </>
)
