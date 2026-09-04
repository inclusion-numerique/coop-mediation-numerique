'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { ajouterDesLieuxActiviteAction } from '@app/web/app/_actions/lieux-activite/ajouter-des-lieux-activite.action'
import { creerUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/creer-lieu-activite.action'
import { rechercherDesLieuxAAjouterAction } from '@app/web/app/_actions/lieux-activite/rechercher-des-lieux-a-ajouter.action'
import CreerLieuActiviteForm from '@app/web/features/lieux-activite/components/creer/CreerLieuActiviteForm'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from '@app/web/features/lieux-activite/components/creer/creerLieuActiviteFormData'
import type { LieuActiviteSearchResult } from '@app/web/structure/searchLieuActiviteCombined'
import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import {
  nombreDeResultats,
  type OptionDeRecherche,
  optionDeStructure,
  piedDeListe,
  rechercheTropCourte,
} from './components/options-de-recherche'
import { PanierDeLieux } from './components/PanierDeLieux'
import { RechercheDeLieu } from './components/RechercheDeLieu'
import { auPanier, type LieuAuPanier, memeLieu } from './panier'

const RECHERCHE_MINIMALE = 3

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

  const chargerLesOptions = async (
    recherche: string,
  ): Promise<OptionDeRecherche[]> => {
    if (recherche.length < RECHERCHE_MINIMALE) return [...rechercheTropCourte()]

    const resultat = await rechercherDesLieuxAAjouterAction({
      recherche,
      exclus: panier
        .map(
          ({ structureCartographieNationaleId }) =>
            structureCartographieNationaleId,
        )
        .filter(onlyDefinedAndNotNull),
    })

    if (!resultat.success) return []

    const { structures, matchesCount } = resultat.data

    for (const structure of structures)
      resultats.current.set(structure.id, structure)

    return [
      ...nombreDeResultats(matchesCount),
      ...structures.map(optionDeStructure),
      ...piedDeListe(matchesCount - structures.length, () =>
        setEnCreation(true),
      ),
    ]
  }

  const selectionner = (identifiant: string | null) => {
    const trouve = identifiant ? resultats.current.get(identifiant) : undefined

    if (trouve) ajouterAuPanier(auPanier(trouve))
  }

  const retirer = (lieu: LieuAuPanier) =>
    setPanier((actuel) => actuel.filter((present) => present !== lieu))

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

  /**
   * Un panier d'un seul lieu mène à sa fiche : c'est ce qu'on est venu chercher.
   * Au-delà, aucune fiche ne résume l'ajout, on revient à la liste.
   */
  const destination = (lieux: readonly string[]) => {
    const premier = panier.at(0)

    return panier.length === 1 && lieux.length === 1 && premier != null
      ? `/coop/mon-reseau/${getDepartementCodeFromCodeInsee(
          premier.codeInsee ?? '',
        )}/lieux/${lieux[0]}`
      : retourHref
  }

  const valider = async () => {
    setEnCours(true)
    const resultat = await ajouterDesLieuxActiviteAction({ lieux: [...panier] })

    if (!resultat.success) {
      setEnCours(false)
      erreur(resultat.error)
      return
    }

    router.push(destination(resultat.data.lieux))
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
      <RechercheDeLieu
        cle={panier.length}
        chargerLesOptions={chargerLesOptions}
        onSelection={selectionner}
      />
      <PanierDeLieux lieux={panier} onRetirer={retirer} />
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
