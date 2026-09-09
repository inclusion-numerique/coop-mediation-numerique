'use client'

import { createToast } from '@app/ui/toast/createToast'
import { appliquerLesDifferencesAction } from '@app/web/app/_actions/lieux-activite/appliquer-les-differences.action'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { OrigineDuChoix } from '../../domain'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'

type Reprise = NonNullable<FicheAffichee['repriseExterne']>
type Differences = Reprise['differences']

const modale = createModal({
  id: 'differences-avec-la-cartographie',
  isOpenedByDefault: false,
})

/**
 * Un écart, et le choix qu'il appelle.
 *
 * Les deux valeurs sont montrées côte à côte plutôt qu'en surbrillance dans un
 * texte : ce ne sont pas des variantes d'une même phrase mais deux réponses à
 * une même question, et le médiateur choisit une réponse.
 */
const Ecart = ({
  difference,
  choisi,
  choisir,
}: {
  difference: Differences[number]
  choisi: OrigineDuChoix
  choisir: (origine: OrigineDuChoix) => void
}) => (
  <fieldset className="fr-fieldset fr-mb-4v">
    <legend className="fr-fieldset__legend fr-text--bold fr-pb-1v">
      {difference.libelle}
    </legend>
    <div className="fr-fieldset__content">
      {(
        [
          { origine: 'registre', valeur: difference.registre, aide: 'Proposé' },
          { origine: 'coop', valeur: difference.coop, aide: 'Votre saisie' },
        ] as const
      ).map(({ origine, valeur, aide }) => (
        <div className="fr-radio-group" key={origine}>
          <input
            type="radio"
            id={`${difference.champ}-${origine}`}
            name={difference.champ}
            checked={choisi === origine}
            onChange={() => choisir(origine)}
          />
          <label
            className="fr-label"
            htmlFor={`${difference.champ}-${origine}`}
          >
            {valeur}
            <span className="fr-hint-text">{aide}</span>
          </label>
        </div>
      ))}
    </div>
  </fieldset>
)

/**
 * Le choix, champ par champ, entre la fiche du médiateur et celle que la
 * cartographie propose.
 *
 * Ce que la modale enregistre passe par le même chemin que le formulaire : c'en
 * est un raccourci, pas une écriture parallèle. Les champs conservés depuis la
 * cartographie sont réécrits eux aussi — sans quoi la fiche coop garderait son
 * ancienne valeur et la modale se rouvrirait sur le même écart.
 */
export const ModaleDesDifferences = ({
  lieuId,
  differences,
}: {
  lieuId: string
  differences: Differences
}) => {
  const router = useRouter()
  const [choix, setChoix] = useState<Record<string, OrigineDuChoix>>({})
  const [enCours, setEnCours] = useState(false)

  // Par défaut on garde ce qui est affiché : la modale ne modifie rien tant que
  // le médiateur n'a rien touché.
  const origineDe = (champ: string): OrigineDuChoix =>
    choix[champ] ?? 'registre'

  const appliquer = async () => {
    setEnCours(true)

    try {
      const resultat = await appliquerLesDifferencesAction({
        id: lieuId,
        choix: Object.fromEntries(
          differences.map(({ champ }) => [champ, origineDe(champ)]),
        ),
      })

      if (!resultat.success) {
        createToast({
          priority: 'error',
          message:
            'Une erreur est survenue lors de l’enregistrement. Veuillez réessayer.',
        })
        return
      }

      createToast({
        priority: 'success',
        message: 'La fiche a été mise à jour',
      })
      router.refresh()
    } finally {
      setEnCours(false)
      modale.close()
    }
  }

  return (
    <>
      <Button
        size="small"
        priority="secondary"
        nativeButtonProps={modale.buttonProps}
      >
        Voir les différences
      </Button>
      <modale.Component
        title="Différences avec la cartographie nationale"
        buttons={[
          {
            children: 'Annuler',
            priority: 'secondary',
            onClick: modale.close,
            disabled: enCours,
          },
          {
            children: 'Enregistrer',
            onClick: appliquer,
            disabled: enCours,
          },
        ]}
      >
        <p className="fr-text--sm fr-mb-4v">
          Pour chaque information, choisissez la version à conserver. Ce que
          vous enregistrez ici remplace la fiche, comme si vous l’aviez saisi
          dans le formulaire.
        </p>
        {differences.map((difference) => (
          <Ecart
            key={difference.champ}
            difference={difference}
            choisi={origineDe(difference.champ)}
            choisir={(origine) =>
              setChoix((precedents) => ({
                ...precedents,
                [difference.champ]: origine,
              }))
            }
          />
        ))}
      </modale.Component>
    </>
  )
}
