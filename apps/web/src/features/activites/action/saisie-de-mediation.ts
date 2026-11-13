import { z } from 'zod'
import {
  ActiviteId,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  type Equipement,
  equipementDe,
  LieuActiviteId,
  type LieuSaisi,
  Materiel,
  notesDe,
  PrecisionDeDemarche,
  RdvId,
  TagId,
  type Thematiques,
  TypeDeLieu,
  thematiquesAdministratives,
  thematiquesDe,
  thematiquesDeMediation,
} from '../domain'

export const AIDE_AUX_DEMARCHES = 'AideAuxDemarchesAdministratives'

export const CommuneSaisie = z.object({
  nom: z.string(),
  codePostal: z.string(),
  codeInsee: z.string(),
})

export const saisieDeMediation = {
  id: z.guid().nullish(),
  date: DateDActivite.schema,
  duree: DureeEnMinutes.schema,
  typeLieu: TypeDeLieu.schema,
  lieuActiviteId: z.guid().nullish(),
  lieuCommune: CommuneSaisie.nullish(),
  thematiques: z.array(z.string()),
  precisionsDemarche: z.string().nullish(),
  materiel: z.array(z.union([Materiel.schema, z.literal('Aucun')])).default([]),
  tags: z.array(z.guid()).default([]),
  notes: z.string().nullish(),
  rdvId: z.number().int().positive().nullish(),
}

type Saisie = z.output<z.ZodObject<typeof saisieDeMediation>>

type Contexte = z.core.$RefinementCtx

const signaler = (
  contexte: Contexte,
  chemin: readonly string[],
  message: string,
): null => {
  contexte.addIssue({ code: 'custom', path: [...chemin], message })
  return null
}

export const communeSaisie = (
  commune: z.output<typeof CommuneSaisie> | null | undefined,
): Commune | null => (commune == null ? null : Commune.safe(commune))

const lieuSaisi = (saisie: Saisie, contexte: Contexte): LieuSaisi | null => {
  if (saisie.typeLieu === 'ADistance') return { _tag: 'ADistance' }
  if (saisie.typeLieu === 'LieuActivite') {
    return saisie.lieuActiviteId == null
      ? signaler(
          contexte,
          ['structure'],
          'Veuillez renseigner le lieu d’activité',
        )
      : {
          _tag: 'LieuActivite',
          lieuActiviteId: LieuActiviteId(saisie.lieuActiviteId),
        }
  }
  const commune = communeSaisie(saisie.lieuCommune)
  return commune === null
    ? signaler(contexte, ['lieuCommuneData'], 'Veuillez renseigner la commune')
    : { _tag: saisie.typeLieu, commune }
}

const thematiquesSaisies = (
  saisie: Saisie,
  contexte: Contexte,
): Thematiques | null => {
  const aide = saisie.thematiques.includes(AIDE_AUX_DEMARCHES)
  const administratives = saisie.thematiques.flatMap((thematique) =>
    thematiquesAdministratives.filter((valeur) => valeur === thematique),
  )
  const precision = PrecisionDeDemarche.safe(saisie.precisionsDemarche ?? '')
  if (!aide && administratives.length > 0) {
    return signaler(
      contexte,
      ['thematiques'],
      'Les thématiques administratives demandent l’aide aux démarches administratives',
    )
  }
  if (!aide && precision !== null) {
    return signaler(
      contexte,
      ['precisionsDemarche'],
      'La précision demande l’aide aux démarches administratives',
    )
  }
  const thematiques = thematiquesDe({
    mediation: saisie.thematiques.flatMap((thematique) =>
      thematiquesDeMediation.filter((valeur) => valeur === thematique),
    ),
    demarche: aide ? { thematiques: administratives, precision } : null,
  })
  return thematiques.success
    ? thematiques.data
    : signaler(
        contexte,
        ['thematiques'],
        'Veuillez renseigner au moins une thématique',
      )
}

const equipementSaisi = (
  saisie: Saisie,
  contexte: Contexte,
): Equipement | null => {
  const equipement = equipementDe({
    aucunMateriel: saisie.materiel.includes('Aucun'),
    materiels: saisie.materiel.filter(
      (materiel): materiel is Materiel => materiel !== 'Aucun',
    ),
  })
  return equipement.success
    ? equipement.data
    : signaler(
        contexte,
        ['materiel'],
        '« Pas de matériel » ne se combine pas avec un matériel',
      )
}

export const communDeLaSaisie = (saisie: Saisie, contexte: Contexte) => {
  const lieu = lieuSaisi(saisie, contexte)
  const thematiques = thematiquesSaisies(saisie, contexte)
  const equipement = equipementSaisi(saisie, contexte)
  return lieu === null || thematiques === null || equipement === null
    ? null
    : {
        id: saisie.id == null ? null : ActiviteId(saisie.id),
        date: saisie.date,
        duree: saisie.duree,
        lieu,
        thematiques,
        equipement,
        tags: saisie.tags.map(TagId),
        notes: notesDe(saisie.notes),
        rdvId: saisie.rdvId == null ? null : RdvId(saisie.rdvId),
      }
}
