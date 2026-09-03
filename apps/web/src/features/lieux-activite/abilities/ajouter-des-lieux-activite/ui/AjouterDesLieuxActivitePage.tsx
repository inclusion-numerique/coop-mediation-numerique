'use client'

import CustomSelect from '@app/ui/components/CustomSelect/CustomSelect'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { ajouterDesLieuxActiviteAction } from '@app/web/app/_actions/lieux-activite/ajouter-des-lieux-activite.action'
import { creerUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/creer-lieu-activite.action'
import { rechercherDesLieuxAAjouterAction } from '@app/web/app/_actions/lieux-activite/rechercher-des-lieux-a-ajouter.action'
import StructureCard from '@app/web/components/structure/StructureCard'
import CreerLieuActiviteForm from '@app/web/features/lieux-activite/components/creer/CreerLieuActiviteForm'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from '@app/web/features/lieux-activite/components/creer/creerLieuActiviteFormData'
import { pluriel } from '@app/web/libraries/pluriel'
import type { LieuActiviteSearchResult } from '@app/web/structure/searchLieuActiviteCombined'
import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import Button from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ReactNode, useRef, useState } from 'react'
import { auPanier, type LieuAuPanier, memeLieu } from './panier'

const erreur = (message: string) => createToast({ priority: 'error', message })

/**
 * Ajout de lieux d'activité : on constitue un panier, on le valide d'un coup.
 *
 * La création d'un lieu se déroule DANS cet écran plutôt qu'en le quittant :
 * naviguer viderait le panier, et l'on ne s'aperçoit qu'un lieu manque
 * qu'après en avoir sélectionné d'autres. Le lieu créé rejoint donc la
 * sélection au retour.
 */
export const AjouterDesLieuxActivitePage = ({
  retourHref,
}: {
  retourHref: string
}) => {
  const router = useRouter()
  const [panier, setPanier] = useState<readonly LieuAuPanier[]>([])
  const [enCreation, setEnCreation] = useState(false)
  const [enCours, setEnCours] = useState(false)
  /**
   * Ce que la recherche a rendu, retenu le temps d'une sélection : l'option ne
   * porte que l'identifiant, et le relire par une seconde requête ne le
   * retrouverait pas — on ne cherche pas un lieu par son id.
   */
  const resultats = useRef(new Map<string, LieuActiviteSearchResult>())

  const ajouterAuPanier = (lieu: LieuAuPanier) =>
    setPanier((actuel) =>
      actuel.some((present) => memeLieu(present, lieu))
        ? actuel
        : [...actuel, lieu],
    )

  const chargerLesOptions = async (recherche: string) => {
    if (recherche.length < 3)
      return [
        {
          label: 'La recherche doit contenir au moins 3 caractères',
          value: '',
        },
      ]

    const resultat = await rechercherDesLieuxAAjouterAction({
      recherche,
      exclus: panier
        .map(
          ({ structureCartographieNationaleId }) =>
            structureCartographieNationaleId,
        )
        .filter((identifiant): identifiant is string => identifiant != null),
    })

    if (!resultat.success) return []

    const { structures, matchesCount } = resultat.data
    const nonAffiches = matchesCount - structures.length

    for (const structure of structures)
      resultats.current.set(structure.id, structure)

    const entetes = [
      {
        label: `${matchesCount} ${pluriel(matchesCount, 'résultat', 'résultats')}`,
        value: '',
      },
    ]

    const options = structures.map((structure) => ({
      label: (
        <>
          <div className="fr-width-full fr-text--sm fr-mb-0">
            {structure.nom}
          </div>
          <div className="fr-width-full fr-text--xs fr-text-mention--grey fr-mb-0">
            {structure.typologie ? `${structure.typologie} · ` : null}
            {structure.adresse}
            {structure.adresse && (structure.codePostal || structure.commune)
              ? ', '
              : null}
            {structure.codePostal}
            {structure.codePostal && structure.commune ? ' ' : null}
            {structure.commune}
          </div>
        </>
      ) as ReactNode,
      value: structure.id,
    }))

    const pied =
      nonAffiches > 0
        ? [
            {
              label: `Veuillez préciser votre recherche - ${nonAffiches} ${pluriel(
                nonAffiches,
                'structure n’est pas affichée',
                'structures ne sont pas affichées',
              )}`,
              value: '',
            },
          ]
        : [
            {
              label: (
                <div style={{ marginBottom: -16 }}>
                  Vous ne trouvez pas votre lieu d’activité ?
                </div>
              ) as ReactNode,
              value: '',
            },
            {
              label: (
                <div className="fr-btns-group">
                  <Button
                    type="button"
                    priority="secondary"
                    className="fr-width-full fr-mb-0"
                    onClick={() => setEnCreation(true)}
                  >
                    Créer un lieu d’activité
                  </Button>
                </div>
              ) as ReactNode,
              value: '',
            },
          ]

    // `react-select` type les libellés en chaînes, mais rend les nœuds React.
    return [...entetes, ...options, ...pied] as {
      label: string
      value: string
    }[]
  }

  const selectionner = (identifiant: string | null) => {
    const trouve = identifiant ? resultats.current.get(identifiant) : undefined

    if (trouve) ajouterAuPanier(auPanier(trouve))
  }

  const creer = async (valeur: CreerLieuActiviteFormData) => {
    const { adresseBan, ...donnees } = toCreerLieuData(valeur)
    if (adresseBan == null) return

    const resultat = await creerUnLieuActiviteAction({ ...donnees, adresseBan })

    if (!resultat.success) {
      erreur(
        'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
      )
      return
    }

    ajouterAuPanier({
      id: resultat.data.id,
      structureCartographieNationaleId: null,
      nom: donnees.nom,
      siret: null,
      adresse: adresseBan.nom,
      commune: adresseBan.commune,
      codePostal: adresseBan.codePostal,
      codeInsee: adresseBan.codeInsee,
      banId: adresseBan.id,
      latitude: adresseBan.latitude,
      longitude: adresseBan.longitude,
    })
    setEnCreation(false)
    createToast({
      priority: 'success',
      message:
        'Le lieu d’activité a bien été créé et ajouté à votre sélection.',
    })
  }

  const valider = async () => {
    setEnCours(true)
    const resultat = await ajouterDesLieuxActiviteAction({ lieux: [...panier] })

    if (!resultat.success) {
      setEnCours(false)
      erreur(resultat.error)
      return
    }

    const premier = panier.at(0)

    router.push(
      panier.length === 1 && resultat.data.lieux.length === 1 && premier != null
        ? `/coop/mon-reseau/${getDepartementCodeFromCodeInsee(
            premier.codeInsee ?? '',
          )}/lieux/${resultat.data.lieux[0]}`
        : retourHref,
    )
    router.refresh()

    createToast({
      priority: 'success',
      message:
        panier.length === 1
          ? 'Le lieu d’activité a bien été ajouté'
          : `Les ${panier.length} lieux d’activité ont bien été ajoutés.`,
    })
  }

  if (enCreation)
    return (
      <CreerLieuActiviteForm
        onAnnuler={() => setEnCreation(false)}
        onCreer={creer}
      />
    )

  return (
    <>
      <div className="fr-input-group fr-mb-1w">
        <label className="fr-label" htmlFor="recherche-lieu-a-ajouter">
          Rechercher par nom du lieu, adresse ou SIRET.
        </label>
        <CustomSelect
          inputId="recherche-lieu-a-ajouter"
          instanceId="recherche-lieu-a-ajouter"
          className="fr-mt-1w"
          // Vider le champ après chaque sélection : le panier est ailleurs.
          key={panier.length}
          placeholder="Rechercher un lieu d’activité"
          loadOptions={chargerLesOptions}
          isOptionDisabled={(option) => option.value === ''}
          onChange={(option) => selectionner(option?.value ?? null)}
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
      {panier.toReversed().map((lieu, rang) => (
        <StructureCard
          key={lieu.id ?? lieu.structureCartographieNationaleId ?? lieu.nom}
          structure={lieu}
          className="fr-mt-4v"
          topRight={
            <Button
              type="button"
              priority="tertiary no outline"
              size="small"
              iconPosition="right"
              iconId="fr-icon-close-line"
              onClick={() =>
                setPanier((actuel) =>
                  actuel.filter(
                    (_, index) => index !== actuel.length - 1 - rang,
                  ),
                )
              }
            >
              Retirer
            </Button>
          }
        />
      ))}
      <hr className="fr-separator-12v" />
      <div className="fr-btns-group">
        <Button
          type="button"
          priority="primary"
          disabled={panier.length === 0}
          onClick={valider}
          {...buttonLoadingClassname(enCours, 'fr-mb-0 ')}
        >
          Ajouter
        </Button>
        <Button
          linkProps={{ href: retourHref }}
          priority="tertiary"
          {...buttonLoadingClassname(enCours, 'fr-mb-0 fr-mt-4v')}
        >
          Annuler
        </Button>
      </div>
    </>
  )
}
