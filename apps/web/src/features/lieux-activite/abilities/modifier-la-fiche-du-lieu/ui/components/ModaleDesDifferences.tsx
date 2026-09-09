'use client'

import { createToast } from '@app/ui/toast/createToast'
import { appliquerLesDifferencesAction } from '@app/web/app/_actions/lieux-activite/appliquer-les-differences.action'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import type { OrigineDuChoix } from '../../domain'
import type { FicheAffichee, ValeurAffichee } from '../fiche-du-lieu.presenter'
import { HorairesDOuverture } from './vues/HorairesDOuverture'

type Reprise = NonNullable<FicheAffichee['repriseExterne']>
type Differences = Reprise['differences']

const modale = createModal({
  id: 'differences-avec-la-cartographie',
  isOpenedByDefault: false,
})

/**
 * Au-delà de quoi une liste passe sur trois colonnes.
 *
 * Une nomenclature en compte parfois 92 : sur une seule colonne, la modale
 * défile sans fin et les deux versions ne se voient plus ensemble.
 */
const LISTE_LONGUE = 6

/**
 * Une valeur, dans la forme que sa nature appelle.
 *
 * Une liste d'un seul élément reste une ligne de texte — la puce n'apprendrait
 * rien — mais dès qu'il y en a plusieurs elles s'empilent, et sur trois colonnes
 * quand elles sont nombreuses.
 */
const Valeur = ({ valeur }: { valeur: ValeurAffichee }) => {
  if (valeur._tag === 'Absente')
    return <i className="fr-text-mention--grey">Non renseigné</i>

  if (valeur._tag === 'Texte') return valeur.texte

  if (valeur._tag === 'Horaires')
    return <HorairesDOuverture horaires={valeur.osm} />

  const enColonnes = valeur.valeurs.length > LISTE_LONGUE

  return (
    <ul
      className={classNames('fr-mb-0', {
        // `fr-list-style-inside` ramène la puce DANS la cellule : posée dehors,
        // elle empiète sur la colonne voisine et un libellé long passe
        // par-dessus les puces de la suivante.
        'fr-display-grid fr-grid-cols-3 fr-grid-gap-2v fr-list-style-inside':
          enColonnes,
        'fr-pl-3w': !enColonnes,
      })}
    >
      {valeur.valeurs.map((une) => (
        <li key={une}>{une}</li>
      ))}
    </ul>
  )
}

/**
 * Un écart, et le choix qu'il appelle.
 *
 * Les deux valeurs sont montrées l'une sous l'autre plutôt qu'en surbrillance
 * dans un texte : ce ne sont pas des variantes d'une même phrase mais deux
 * réponses à une même question, et le médiateur choisit une réponse.
 *
 * La valeur est rendue HORS du `<label>`, qui n'accepte que du contenu de
 * phrase : une liste ou un tableau d'horaires y seraient du HTML invalide, que
 * le navigateur remonterait ailleurs. Le libellé garde donc la seule mention de
 * provenance, et c'est lui qui reste cliquable.
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
            {aide}
          </label>
          <div className="fr-ml-8v fr-mb-2v fr-text--sm">
            <Valeur valeur={valeur} />
          </div>
        </div>
      ))}
    </div>
  </fieldset>
)

/**
 * Le bouton qui ouvre la modale, séparé d'elle.
 *
 * Il vit dans le corps de l'alerte, que le DSFR rend dans un `<p>` : un
 * `<dialog>` n'y a pas sa place — le navigateur le remonterait hors du
 * paragraphe et la mise en page casserait. Les deux partagent la même modale,
 * déclarée au niveau du module.
 */
export const BoutonDesDifferences = () => (
  <Button
    size="small"
    priority="secondary"
    className="fr-flex-shrink-0"
    nativeButtonProps={modale.buttonProps}
  >
    Voir les différences
  </Button>
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
        Pour chaque information, choisissez la version à conserver. Ce que vous
        enregistrez ici remplace la fiche, comme si vous l’aviez saisi dans le
        formulaire.
      </p>
      {differences.map((difference, rang) => (
        <Fragment key={difference.champ}>
          {rang > 0 && <hr className="fr-separator-1px fr-mb-4v" />}
          <Ecart
            difference={difference}
            choisi={origineDe(difference.champ)}
            choisir={(origine) =>
              setChoix((precedents) => ({
                ...precedents,
                [difference.champ]: origine,
              }))
            }
          />
        </Fragment>
      ))}
    </modale.Component>
  )
}
