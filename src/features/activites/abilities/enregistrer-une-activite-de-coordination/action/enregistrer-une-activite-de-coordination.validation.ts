import { z } from 'zod'
import {
  ActiviteDeCoordinationId,
  type Choix,
  type ChoixMultiples,
  choixMultiplesDe,
  DateDActivite,
  DureeEnMinutes,
  EchelonTerritorial,
  Effectif,
  Initiative,
  intervenantsDe,
  NatureDePartenariat,
  NomDeLActivite,
  NomDeStructure,
  notesDe,
  Organisateur,
  Precision,
  structuresPartenairesDe,
  TagId,
  ThematiqueDAnimation,
  TypeDAnimation,
  TypeDEvenement,
  TypeDeStructurePartenaire,
} from '../../../domain'
import type { SaisieDeCoordination } from '../domain'

const AUTRE = z.literal('Autre')

const avecAutre = <S extends z.ZodType>(valeur: S) => z.union([valeur, AUTRE])

const texte = z.string().nullish()

const commun = {
  id: z.guid().nullish(),
  date: DateDActivite.schema,
  tags: z.array(z.guid()).default([]),
  notes: texte,
}

const effectif = z.coerce
  .number<number>()
  .int('Veuillez renseigner un nombre entier')
  .min(0, 'Le nombre doit être positif')

const AnimationSaisie = z.object({
  ...commun,
  type: z.literal('Animation'),
  duree: DureeEnMinutes.schema,
  typeAnimation: avecAutre(TypeDAnimation.schema),
  typeAnimationAutre: texte,
  thematiquesAnimation: z.array(avecAutre(ThematiqueDAnimation.schema)),
  thematiqueAnimationAutre: texte,
  initiative: Initiative.schema.nullish(),
  mediateurs: effectif.nullish(),
  structures: effectif.nullish(),
  autresActeurs: effectif.nullish(),
})

const EvenementSaisi = z.object({
  ...commun,
  type: z.literal('Evenement'),
  nom: texte,
  participants: effectif,
  typeEvenement: avecAutre(TypeDEvenement.schema),
  typeEvenementAutre: texte,
  organisateurs: z.array(avecAutre(Organisateur.schema)),
  organisateurAutre: texte,
  echelonTerritorial: EchelonTerritorial.schema.nullish(),
})

const PartenariatSaisi = z.object({
  ...commun,
  type: z.literal('Partenariat'),
  nom: texte,
  naturePartenariat: z.array(avecAutre(NatureDePartenariat.schema)),
  naturePartenariatAutre: texte,
  echelonTerritorial: EchelonTerritorial.schema.nullish(),
  structuresPartenaires: z.array(
    z.object({
      nom: z.string(),
      type: avecAutre(TypeDeStructurePartenaire.schema),
      typeAutre: texte,
    }),
  ),
})

type Contexte = z.core.$RefinementCtx

const signaler = (
  contexte: Contexte,
  chemin: readonly (string | number)[],
  message: string,
): null => {
  contexte.addIssue({ code: 'custom', path: [...chemin], message })
  return null
}

const precisionSaisie = (autre: string | null | undefined): Precision | null =>
  Precision.safe(autre ?? '')

const choixSaisi = <V>(
  contexte: Contexte,
  chemin: readonly (string | number)[],
  message: string,
  valeur: V | 'Autre',
  autre: string | null | undefined,
): Choix<V> | null => {
  if (valeur !== 'Autre') return { _tag: 'Liste', valeur }
  const precision = precisionSaisie(autre)
  return precision === null
    ? signaler(contexte, chemin, message)
    : { _tag: 'Autre', precision }
}

const choixMultiplesSaisis = <V>(
  contexte: Contexte,
  champ: string,
  messages: { readonly aucun: string; readonly autre: string },
  valeurs: readonly (V | 'Autre')[],
  autre: string | null | undefined,
): ChoixMultiples<V> | null => {
  const avecAutre = valeurs.includes('Autre')
  const precision = avecAutre ? precisionSaisie(autre) : null
  if (avecAutre && precision === null) {
    return signaler(contexte, [`${champ}Autre`], messages.autre)
  }
  const choix = choixMultiplesDe({
    valeurs: valeurs.filter((valeur): valeur is V => valeur !== 'Autre'),
    autre: precision,
  })
  return choix.success
    ? choix.data
    : signaler(contexte, [champ], messages.aucun)
}

const nomSaisi = (nom: string | null | undefined): NomDeLActivite | null =>
  NomDeLActivite.safe(nom ?? '')

const communSaisi = (saisie: {
  readonly id?: string | null
  readonly date: DateDActivite
  readonly tags: readonly string[]
  readonly notes?: string | null
}) => ({
  id: saisie.id == null ? null : ActiviteDeCoordinationId(saisie.id),
  date: saisie.date,
  tags: saisie.tags.map(TagId),
  notes: notesDe(saisie.notes),
})

const animationSaisie = (
  saisie: z.output<typeof AnimationSaisie>,
  contexte: Contexte,
): SaisieDeCoordination | null => {
  const typeDAnimation = choixSaisi(
    contexte,
    ['typeAnimationAutre'],
    'Veuillez préciser le type d’animation',
    saisie.typeAnimation,
    saisie.typeAnimationAutre,
  )
  const thematiques = choixMultiplesSaisis(
    contexte,
    'thematiqueAnimation',
    {
      aucun: 'Veuillez renseigner au moins une thématique d’animation',
      autre: 'Veuillez préciser la thématique d’animation',
    },
    saisie.thematiquesAnimation,
    saisie.thematiqueAnimationAutre,
  )
  const intervenants = intervenantsDe({
    mediateurs: Effectif(saisie.mediateurs ?? 0),
    structures: Effectif(saisie.structures ?? 0),
    autresActeurs: Effectif(saisie.autresActeurs ?? 0),
  })
  if (!intervenants.success) {
    signaler(
      contexte,
      ['mediateurs'],
      'Veuillez renseigner au moins un médiateur, une structure ou un autre acteur',
    )
  }
  return typeDAnimation === null ||
    thematiques === null ||
    !intervenants.success
    ? null
    : {
        ...communSaisi(saisie),
        _tag: 'Animation',
        duree: saisie.duree,
        typeDAnimation,
        thematiques,
        initiative: saisie.initiative ?? null,
        intervenants: intervenants.data,
      }
}

const evenementSaisi = (
  saisie: z.output<typeof EvenementSaisi>,
  contexte: Contexte,
): SaisieDeCoordination | null => {
  const typeDEvenement = choixSaisi(
    contexte,
    ['typeEvenementAutre'],
    'Veuillez préciser le type d’événement',
    saisie.typeEvenement,
    saisie.typeEvenementAutre,
  )
  const organisateurs = choixMultiplesSaisis(
    contexte,
    'organisateur',
    {
      aucun: 'Veuillez renseigner au moins un organisateur',
      autre: 'Veuillez préciser l’organisateur',
    },
    saisie.organisateurs,
    saisie.organisateurAutre,
  )
  return typeDEvenement === null || organisateurs === null
    ? null
    : {
        ...communSaisi(saisie),
        _tag: 'Evenement',
        nom: nomSaisi(saisie.nom),
        typeDEvenement,
        organisateurs,
        echelon: saisie.echelonTerritorial ?? null,
        participants: Effectif(saisie.participants),
      }
}

const partenariatSaisi = (
  saisie: z.output<typeof PartenariatSaisi>,
  contexte: Contexte,
): SaisieDeCoordination | null => {
  const natures = choixMultiplesSaisis(
    contexte,
    'naturePartenariat',
    {
      aucun: 'Veuillez renseigner au moins une nature de partenariat',
      autre: 'Veuillez préciser la nature du partenariat',
    },
    saisie.naturePartenariat,
    saisie.naturePartenariatAutre,
  )
  const structures = saisie.structuresPartenaires.map((structure, rang) => {
    const nom = NomDeStructure.safe(structure.nom)
    const type = choixSaisi(
      contexte,
      ['structuresPartenaires', rang, 'typeAutre'],
      'Veuillez préciser le type de structure',
      structure.type,
      structure.typeAutre,
    )
    if (nom === null) {
      signaler(
        contexte,
        ['structuresPartenaires', rang, 'nom'],
        'Veuillez renseigner le nom de la structure partenaire',
      )
    }
    return nom === null || type === null ? null : { nom, type }
  })
  const valides = structures.flatMap((structure) =>
    structure === null ? [] : [structure],
  )
  const structuresPartenaires = structuresPartenairesDe(valides)
  if (!structuresPartenaires.success) {
    signaler(
      contexte,
      ['structuresPartenaires'],
      'Au moins une structure partenaire est requise',
    )
  }
  return natures === null ||
    valides.length !== structures.length ||
    !structuresPartenaires.success
    ? null
    : {
        ...communSaisi(saisie),
        _tag: 'Partenariat',
        nom: nomSaisi(saisie.nom),
        natures,
        structuresPartenaires: structuresPartenaires.data,
        echelon: saisie.echelonTerritorial ?? null,
      }
}

export const EnregistrerUneActiviteDeCoordinationValidation = z
  .discriminatedUnion('type', [
    AnimationSaisie,
    EvenementSaisi,
    PartenariatSaisi,
  ])
  .transform((saisie, contexte): SaisieDeCoordination => {
    const resultat =
      saisie.type === 'Animation'
        ? animationSaisie(saisie, contexte)
        : saisie.type === 'Evenement'
          ? evenementSaisi(saisie, contexte)
          : partenariatSaisi(saisie, contexte)
    return resultat ?? z.NEVER
  })
