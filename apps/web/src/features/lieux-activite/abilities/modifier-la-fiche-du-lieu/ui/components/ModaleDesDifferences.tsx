'use client'

import { createToast } from '@app/ui/toast/createToast'
import { appliquerLesDifferencesAction } from '@app/web/app/_actions/lieux-activite/appliquer-les-differences.action'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import type { OrigineDuChoix } from '../../domain'
import type { DifferenceAffichee } from '../fiche-affichee/reprise-externe'
import type { ValeurAffichee } from '../fiche-affichee/valeur-affichee'
import { HorairesDOuverture } from './vues/HorairesDOuverture'

const modale = createModal({
  id: 'differences-avec-la-cartographie',
  isOpenedByDefault: false,
})

const CHAMP_EN_COLONNES = 'typologies'

const Valeur = ({
  valeur,
  enColonnes,
}: {
  valeur: ValeurAffichee
  enColonnes: boolean
}) => {
  if (valeur._tag === 'Absente')
    return <i className="fr-text-mention--grey">Non renseigné</i>

  if (valeur._tag === 'Texte') return valeur.texte

  if (valeur._tag === 'Horaires')
    return <HorairesDOuverture horaires={valeur.osm} />

  return (
    <ul
      className={classNames('fr-mb-0', {
        'fr-display-grid fr-grid-cols-3 fr-grid-column-gap-2v fr-list-style-inside':
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

const Ecart = ({
  difference,
  choisi,
  choisir,
}: {
  difference: DifferenceAffichee
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
            <Valeur
              valeur={valeur}
              enColonnes={difference.champ === CHAMP_EN_COLONNES}
            />
          </div>
        </div>
      ))}
    </div>
  </fieldset>
)

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

export const ModaleDesDifferences = ({
  lieuId,
  differences,
}: {
  lieuId: string
  differences: readonly DifferenceAffichee[]
}) => {
  const router = useRouter()
  const [choix, setChoix] = useState<Record<string, OrigineDuChoix>>({})
  const [enCours, setEnCours] = useState(false)

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
