'use client'

import { Options } from '@app/ui/components/Primitives/Options'
import { createToast } from '@app/ui/toast/createToast'
import { renseignerLieuxActiviteAction } from '@app/web/app/_actions/inscription/renseigner-lieux-activite.action'
import {
  adresseNonVerifiableMessage,
  geocodeStructureAdresse,
} from '@app/web/external-apis/ban/geocodeStructureAdresse'
import type { LieuActiviteInput } from '@app/web/features/inscription/abilities/renseigner-lieux-activite'
import type { LieuActiviteSearchResult } from '@app/web/features/lieux-activite/abilities/ajouter-des-lieux-activite/implementation/searchLieuActiviteCombined'
import LieuActiviteCard from '@app/web/features/lieux-activite/ui/LieuActiviteCard'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import {
  LieuActiviteComboBox,
  LieuActiviteOptions,
  type RechercheLieuActivite,
  rechercheMinimum,
} from './lieu-activite-combo-box'

type FormValues = {
  lieux: LieuActiviteInput[]
  recherche: LieuActiviteSearchResult | null
}

/** Au moins un lieu ajouté ; le champ de recherche est transitoire. */
const lieuxActiviteFormShape = z
  .custom<FormValues>()
  .refine((value) => value.lieux.length > 0, {
    message: 'Veuillez renseigner au moins un lieu d’activité',
    path: ['lieux'],
  })

/**
 * Le même lieu, déjà dans la liste ?
 *
 * On compare ce que l'utilisateur a sous les yeux : l'entrée qu'il vient de
 * choisir contre celles qu'il a déjà retenues. L'identifiant tranche quand il y
 * en a un — celui de la coop, ou celui de la cartographie ; à défaut la
 * dénomination et l'adresse, qui sont ce que la liste affiche.
 *
 * Le SIRET n'entre pas dans cette comparaison : il désigne une entité juridique,
 * pas un endroit, et deux antennes d'un même réseau le partagent légitimement —
 * les confondre interdirait d'ajouter la seconde.
 */
const dejaAjoute = (
  lieux: readonly LieuActiviteInput[],
  candidat: LieuActiviteInput,
): boolean =>
  lieux.some((lieu) => {
    if (lieu.id != null && candidat.id != null) return lieu.id === candidat.id

    if (
      lieu.structureCartographieNationaleId != null &&
      candidat.structureCartographieNationaleId != null
    )
      return (
        lieu.structureCartographieNationaleId ===
        candidat.structureCartographieNationaleId
      )

    return (
      lieu.nom === candidat.nom &&
      lieu.adresse === candidat.adresse &&
      lieu.codePostal === candidat.codePostal
    )
  })

/**
 * Traduit un résultat de recherche en lieu à rattacher, selon sa provenance :
 * - coop : le lieu existe déjà, on le rattache par son id (aucun doublon créé),
 *   et son adresse ne sera pas réécrite ;
 * - cartographie ou annuaire des entreprises : la coop ne le connaît pas, il
 *   sera donc CRÉÉ — et l'on ne crée plus de lieu dont l'adresse n'a pas été
 *   reconnue par la Base Adresse Nationale. La cartographie ne porte pas
 *   d'identifiant BAN et l'annuaire pas de coordonnées : les deux passent par le
 *   géocodage, faute de quoi le lieu n'est pas exploitable (`null`) et l'écran
 *   renvoie l'utilisateur vers la saisie manuelle.
 *
 * Le SIRET de l'annuaire voyage avec le lieu — c'est la corrélation la plus
 * sûre côté persistance, et il n'est renseigné que là : le `pivot` de la carto
 * peut être un RNA.
 */
const lieuDepuisResultat = async (
  item: LieuActiviteSearchResult,
): Promise<LieuActiviteInput | null> => {
  const lieuCoop = item.structures.at(0)

  if (lieuCoop)
    return {
      id: lieuCoop.id,
      nom: item.nom,
      adresse: item.adresse,
      commune: item.commune,
      codePostal: item.codePostal,
      codeInsee: item.codeInsee,
    }

  const adresseBan = await geocodeStructureAdresse(item)

  if (!adresseBan) return null

  const adresseValidee = {
    adresse: adresseBan.nom,
    commune: adresseBan.commune,
    codePostal: adresseBan.codePostal,
    codeInsee: adresseBan.codeInsee,
    banId: adresseBan.id,
    latitude: adresseBan.latitude,
    longitude: adresseBan.longitude,
  }

  return item.source === 'cartographie_nationale'
    ? {
        nom: item.nom,
        structureCartographieNationaleId: item.id,
        ...adresseValidee,
      }
    : { nom: item.nom, siret: item.pivot ?? null, ...adresseValidee }
}

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

/**
 * Renseignement des lieux d'activité. La recherche privilégie les lieux déjà
 * connus de la coop, puis la cartographie nationale, et ne tombe sur l'annuaire
 * des entreprises qu'en dernier repli — de quoi éviter de recréer un lieu
 * existant. La création d'un lieu n'est proposée qu'une fois la recherche restée
 * sans résultat : elle n'est pas une alternative offerte d'emblée, sans quoi on
 * créerait des doublons de lieux qu'on n'a jamais cherchés.
 */
const LieuxActiviteForm = ({
  lieuxExistants,
  nextHref,
  retourHref,
}: {
  lieuxExistants: LieuActiviteInput[]
  nextHref: string
  retourHref: string
}) => {
  const router = useRouter()
  const [rechercheError, setRechercheError] = useState<string | null>(null)

  const enregistrerLieux = async (lieux: LieuActiviteInput[]) =>
    renseignerLieuxActiviteAction({ lieuxActivite: lieux })

  const form = useAppForm({
    validators: { onSubmit: lieuxActiviteFormShape },
    defaultValues: { lieux: lieuxExistants, recherche: null } as FormValues,
    onSubmit: async ({ value }) => {
      try {
        const result = await enregistrerLieux(value.lieux)

        if (!result.success) {
          erreurEnregistrement()
          return
        }

        router.push(nextHref)
        router.refresh()
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting)
  const isHydrated = useHydrated()
  const isPending = isSubmitting || !isHydrated

  /**
   * La création se fait sur une autre page : les lieux déjà ajoutés y seraient
   * perdus, on les enregistre donc avant de partir. Ils seront relus au retour.
   */
  const creerUnLieu = async (recherche: string) => {
    const lieux = form.state.values.lieux
    const creerHref = `/inscription/creer-un-lieu-d-activite?nom=${encodeURIComponent(recherche)}&retour=${encodeURIComponent(retourHref)}`

    if (lieux.length === 0) {
      router.push(creerHref)
      return
    }

    try {
      const result = await enregistrerLieux(lieux)
      if (!result.success) {
        erreurEnregistrement()
        return
      }
      router.push(creerHref)
    } catch {
      erreurEnregistrement()
    }
  }

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <form.Field name="lieux" mode="array">
          {(field) => (
            <>
              {(field.state.value ?? []).toReversed().map((lieu, reversed) => {
                const index = (field.state.value ?? []).length - 1 - reversed
                return (
                  <LieuActiviteCard
                    key={`${lieu.nom}-${index}`}
                    className="fr-mb-4v"
                    lieu={{
                      nom: lieu.nom,
                      adresse: lieu.adresse,
                      commune: lieu.commune,
                      codePostal: lieu.codePostal,
                      siret: null,
                      typologies: null,
                      rna: null,
                    }}
                    topRight={
                      <Button
                        type="button"
                        priority="tertiary no outline"
                        size="small"
                        iconPosition="right"
                        iconId="fr-icon-close-line"
                        onClick={() => field.removeValue(index)}
                      >
                        Retirer
                      </Button>
                    }
                  />
                )
              })}
            </>
          )}
        </form.Field>

        <hr className="fr-separator-6v" />

        <form.AppField name="recherche">
          {(field) => (
            <field.ComboBox
              isPending={isPending}
              onSelect={async (item) => {
                setRechercheError(null)
                const lieu = await lieuDepuisResultat(item)

                if (!lieu) {
                  setRechercheError(adresseNonVerifiableMessage(item))
                  form.setFieldValue('recherche', null)
                  return
                }

                if (dejaAjoute(form.state.values.lieux, lieu)) {
                  setRechercheError(
                    `${lieu.nom} fait déjà partie de vos lieux d’activité.`,
                  )
                  form.setFieldValue('recherche', null)
                  return
                }

                form.pushFieldValue('lieux', lieu)
                form.setFieldValue('recherche', null)
              }}
              {...LieuActiviteComboBox}
            >
              {({
                getLabelProps,
                getInputProps,
                getToggleButtonProps,
                payload,
                ...optionsProps
              }) => {
                const { recherche, enCours, enEchec } =
                  payload as RechercheLieuActivite
                const rechercheFaite =
                  !enCours &&
                  (recherche?.trim().length ?? 0) >= rechercheMinimum
                const rechercheAboutie =
                  rechercheFaite && optionsProps.items.length === 0
                const sansResultat = rechercheAboutie && !enEchec
                const rechercheEnEchec = rechercheAboutie && enEchec

                const boutonCreer = (
                  <Button
                    type="button"
                    priority="secondary"
                    className="fr-width-full fr-justify-content-center fr-mb-0"
                    disabled={isPending}
                    onClick={() => creerUnLieu(recherche)}
                  >
                    Créer un lieu d’activité
                  </Button>
                )

                /**
                 * Trouver des résultats n'est pas trouver le bon : une recherche
                 * qui propose dix lieux sans proposer CELUI qu'on a en tête
                 * enfermerait autant qu'une recherche vide. La création reste
                 * donc offerte sous la liste, tant qu'il y a une liste — le cas
                 * sans résultat porte déjà le sien, avec son explication.
                 */
                const issue =
                  rechercheFaite && optionsProps.items.length > 0
                    ? boutonCreer
                    : null

                // Un seul enfant, `null` quand il n'y a rien à dire : `Options`
                // teste `children &&` pour ouvrir son élément de liste, et une
                // paire de conditions serait un tableau toujours truthy — le
                // menu s'ouvrirait vide dès le premier clic dans le champ.
                const proposition = sansResultat ? (
                  <div>
                    <p className="fr-text--sm fr-text-mention--grey fr-mb-2v">
                      Aucun lieu ne correspond à votre recherche.
                    </p>
                    {boutonCreer}
                  </div>
                ) : rechercheEnEchec ? (
                  <p className="fr-text--sm fr-text-default--error fr-mb-0">
                    La recherche n’a pas abouti, veuillez réessayer.
                  </p>
                ) : null

                return (
                  <>
                    <field.Input
                      addonEnd={
                        <Button
                          title="Rechercher"
                          className="fr-border-left-0"
                          iconId="fr-icon-search-line"
                          {...getToggleButtonProps({ type: 'button' })}
                        />
                      }
                      isConnected={false}
                      isPending={isPending}
                      nativeLabelProps={getLabelProps()}
                      nativeInputProps={getInputProps()}
                      label="Rechercher un lieu d’activité par nom, adresse ou SIRET"
                    />
                    <Options
                      {...optionsProps}
                      {...LieuActiviteOptions}
                      showEmpty={proposition != null}
                      footer={issue}
                    >
                      {proposition}
                    </Options>
                  </>
                )
              }}
            </field.ComboBox>
          )}
        </form.AppField>

        {rechercheError && (
          <p className="fr-text-default--error fr-text--sm">{rechercheError}</p>
        )}

        <hr className="fr-separator-12v" />

        <div className="fr-btns-group fr-btns-group--lg">
          <form.Submit isPending={isPending}>Suivant</form.Submit>
        </div>
      </form>
    </form.AppForm>
  )
}

export default LieuxActiviteForm
