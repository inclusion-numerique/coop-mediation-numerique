import type { Prisma } from '@app/web/generated/prisma/client'
import type { Result } from '@app/web/libraries/result'
import {
  type AccompagnementIndividuel,
  type ActiviteDeMediation,
  ActiviteId,
  type AtelierCollectif,
  Autonomie,
  type BeneficiaireAccompagne,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  Effectif,
  EmployeuseId,
  type Equipement,
  equipementDe,
  Genre,
  IdentifiantCraV1,
  type Lieu,
  LieuActiviteId,
  Materiel,
  MediateurId,
  NiveauDAtelier,
  notesDe,
  type Orientation,
  type Origine,
  type ParticipantsAnonymes,
  PrecisionDeDemarche,
  participantsAnonymesDe,
  participantsDeLAtelier,
  RdvId,
  StatutSocial,
  StructureDeRedirection,
  TagId,
  type Thematiques,
  TitreDAtelier,
  TrancheDAge,
  thematiquesAdministratives,
  thematiquesDe,
  thematiquesDeMediation,
} from '../domain'

export const activiteDeMediationSelect = {
  id: true,
  type: true,
  mediateurId: true,
  date: true,
  duree: true,
  notes: true,
  rdvId: true,
  v1CraId: true,
  structureEmployeuseMainId: true,
  typeLieu: true,
  structureId: true,
  lieuCommune: true,
  lieuCodePostal: true,
  lieuCodeInsee: true,
  thematiques: true,
  precisionsDemarche: true,
  materiel: true,
  autonomie: true,
  orienteVersStructure: true,
  structureDeRedirection: true,
  titreAtelier: true,
  niveau: true,
  creation: true,
  modification: true,
  tags: { select: { tagId: true } },
  accompagnements: {
    select: {
      premierAccompagnement: true,
      beneficiaire: {
        select: {
          id: true,
          anonyme: true,
          genre: true,
          trancheAge: true,
          statutSocial: true,
          commune: true,
          communeCodePostal: true,
          communeCodeInsee: true,
        },
      },
    },
  },
} satisfies Prisma.ActiviteSelect

export type ActiviteDeMediationRow = Prisma.ActiviteGetPayload<{
  select: typeof activiteDeMediationSelect
}>

type AccompagnementRow = ActiviteDeMediationRow['accompagnements'][number]

type BeneficiaireRow = AccompagnementRow['beneficiaire']

type ColonnesDeCommune = {
  readonly nom: string | null
  readonly codePostal: string | null
  readonly codeInsee: string | null
}

export class ActiviteIllisible extends Error {
  constructor(id: string, raison: string) {
    super(`Activité ${id} illisible : ${raison}`)
    this.name = 'ActiviteIllisible'
  }
}

const valide =
  (id: string) =>
  <T, E extends { readonly _tag: string }>(resultat: Result<T, E>): T => {
    if (!resultat.success) {
      throw new ActiviteIllisible(id, resultat.error._tag)
    }
    return resultat.data
  }

const renseigne = (valeur: string | null): string | null =>
  valeur === null || valeur.trim() === '' ? null : valeur

const communeDe = (id: string, colonnes: ColonnesDeCommune): Commune | null => {
  const nom = renseigne(colonnes.nom)
  const codePostal = renseigne(colonnes.codePostal)
  const codeInsee = renseigne(colonnes.codeInsee)
  if (nom === null && codePostal === null && codeInsee === null) {
    return null
  }
  if (nom === null || codePostal === null || codeInsee === null) {
    throw new ActiviteIllisible(id, 'commune incomplète')
  }
  return Commune({ nom, codePostal, codeInsee })
}

const communeObligatoire = (
  id: string,
  colonnes: ColonnesDeCommune,
): Commune => {
  const commune = communeDe(id, colonnes)
  if (commune === null) {
    throw new ActiviteIllisible(id, 'commune absente')
  }
  return commune
}

const colonnesDuLieu = (row: ActiviteDeMediationRow): ColonnesDeCommune => ({
  nom: row.lieuCommune,
  codePostal: row.lieuCodePostal,
  codeInsee: row.lieuCodeInsee,
})

const lieuDe = (row: ActiviteDeMediationRow): Lieu => {
  if (row.typeLieu === 'LieuActivite') {
    if (row.structureId === null) {
      throw new ActiviteIllisible(row.id, 'lieu d’activité absent')
    }
    if (communeDe(row.id, colonnesDuLieu(row)) !== null) {
      throw new ActiviteIllisible(row.id, 'commune sur un lieu d’activité')
    }
    return {
      _tag: 'LieuActivite',
      lieuActiviteId: LieuActiviteId(row.structureId),
    }
  }
  if (row.structureId !== null) {
    throw new ActiviteIllisible(row.id, 'lieu d’activité hors lieu d’activité')
  }
  return row.typeLieu === 'ADistance'
    ? {
        _tag: 'ADistance',
        communeDeRattachement: communeDe(row.id, colonnesDuLieu(row)),
      }
    : {
        _tag: row.typeLieu,
        commune: communeObligatoire(row.id, colonnesDuLieu(row)),
      }
}

const thematiquesDeLaLigne = (row: ActiviteDeMediationRow): Thematiques => {
  const aideAuxDemarches = row.thematiques.includes(
    'AideAuxDemarchesAdministratives',
  )
  const administratives = row.thematiques.flatMap((thematique) =>
    thematiquesAdministratives.filter(
      (administrative) => administrative === thematique,
    ),
  )
  const precision = renseigne(row.precisionsDemarche)
  if (!aideAuxDemarches && (administratives.length > 0 || precision !== null)) {
    throw new ActiviteIllisible(row.id, 'démarche sans aide aux démarches')
  }
  return valide(row.id)(
    thematiquesDe({
      mediation: row.thematiques.flatMap((thematique) =>
        thematiquesDeMediation.filter((mediation) => mediation === thematique),
      ),
      demarche: aideAuxDemarches
        ? {
            thematiques: administratives,
            precision:
              precision === null ? null : PrecisionDeDemarche(precision),
          }
        : null,
    }),
  )
}

const equipementDeLaLigne = (row: ActiviteDeMediationRow): Equipement =>
  valide(row.id)(
    equipementDe({
      aucunMateriel: row.materiel.includes('Aucun'),
      materiels: row.materiel
        .filter((materiel) => materiel !== 'Aucun')
        .map(Materiel),
    }),
  )

const origineDe = (row: ActiviteDeMediationRow): Origine => {
  if (row.rdvId !== null && row.v1CraId !== null) {
    throw new ActiviteIllisible(row.id, 'origine double')
  }
  if (row.rdvId !== null) {
    return { _tag: 'RendezVous', rdvId: RdvId(row.rdvId) }
  }
  return row.v1CraId === null
    ? { _tag: 'Saisie' }
    : { _tag: 'ImportV1', identifiant: IdentifiantCraV1(row.v1CraId) }
}

const orientationDe = (row: ActiviteDeMediationRow): Orientation => {
  if (row.orienteVersStructure === true) {
    return {
      _tag: 'Oriente',
      vers:
        row.structureDeRedirection === null
          ? null
          : StructureDeRedirection(row.structureDeRedirection),
    }
  }
  if (row.structureDeRedirection !== null) {
    throw new ActiviteIllisible(row.id, 'redirection sans orientation')
  }
  return row.orienteVersStructure === false
    ? { _tag: 'NonOriente' }
    : { _tag: 'NonRenseignee' }
}

const beneficiaireAccompagneDe = (
  id: string,
  accompagnement: AccompagnementRow,
): BeneficiaireAccompagne => {
  const { beneficiaire } = accompagnement
  return beneficiaire.anonyme
    ? {
        _tag: 'Anonyme',
        dejaAccompagne: !accompagnement.premierAccompagnement,
        profil: {
          genre: Genre(beneficiaire.genre ?? 'NonCommunique'),
          trancheDAge: TrancheDAge(beneficiaire.trancheAge ?? 'NonCommunique'),
          statutSocial: StatutSocial(
            beneficiaire.statutSocial ?? 'NonCommunique',
          ),
          residence: communeDe(id, {
            nom: beneficiaire.commune,
            codePostal: beneficiaire.communeCodePostal,
            codeInsee: beneficiaire.communeCodeInsee,
          }),
        },
      }
    : { _tag: 'Suivi', id: BeneficiaireId(beneficiaire.id) }
}

const compte = (
  anonymes: readonly BeneficiaireRow[],
  estDuGroupe: (beneficiaire: BeneficiaireRow) => boolean,
): Effectif => Effectif(anonymes.filter(estDuGroupe).length)

const participantsAnonymesDeLaLigne = (
  row: ActiviteDeMediationRow,
): ParticipantsAnonymes => {
  const accompagnementsAnonymes = row.accompagnements.filter(
    ({ beneficiaire }) => beneficiaire.anonyme,
  )
  const anonymes = accompagnementsAnonymes.map(
    ({ beneficiaire }) => beneficiaire,
  )
  if (
    anonymes.some(
      (anonyme) =>
        communeDe(row.id, {
          nom: anonyme.commune,
          codePostal: anonyme.communeCodePostal,
          codeInsee: anonyme.communeCodeInsee,
        }) !== null,
    )
  ) {
    throw new ActiviteIllisible(row.id, 'résidence d’un participant anonyme')
  }
  return valide(row.id)(
    participantsAnonymesDe({
      total: Effectif(anonymes.length),
      dejaAccompagnes: Effectif(
        accompagnementsAnonymes.filter(
          ({ premierAccompagnement }) => !premierAccompagnement,
        ).length,
      ),
      genres: {
        masculin: compte(anonymes, ({ genre }) => genre === 'Masculin'),
        feminin: compte(anonymes, ({ genre }) => genre === 'Feminin'),
      },
      tranchesDAge: {
        moinsDeDouze: compte(
          anonymes,
          ({ trancheAge }) => trancheAge === 'MoinsDeDouze',
        ),
        douzeDixHuit: compte(
          anonymes,
          ({ trancheAge }) => trancheAge === 'DouzeDixHuit',
        ),
        dixHuitVingtQuatre: compte(
          anonymes,
          ({ trancheAge }) => trancheAge === 'DixHuitVingtQuatre',
        ),
        vingtCinqTrenteNeuf: compte(
          anonymes,
          ({ trancheAge }) => trancheAge === 'VingtCinqTrenteNeuf',
        ),
        quaranteCinquanteNeuf: compte(
          anonymes,
          ({ trancheAge }) => trancheAge === 'QuaranteCinquanteNeuf',
        ),
        soixanteSoixanteNeuf: compte(
          anonymes,
          ({ trancheAge }) => trancheAge === 'SoixanteSoixanteNeuf',
        ),
        soixanteDixPlus: compte(
          anonymes,
          ({ trancheAge }) => trancheAge === 'SoixanteDixPlus',
        ),
      },
      statutsSociaux: {
        scolarise: compte(
          anonymes,
          ({ statutSocial }) => statutSocial === 'Scolarise',
        ),
        sansEmploi: compte(
          anonymes,
          ({ statutSocial }) => statutSocial === 'SansEmploi',
        ),
        enEmploi: compte(
          anonymes,
          ({ statutSocial }) => statutSocial === 'EnEmploi',
        ),
        retraite: compte(
          anonymes,
          ({ statutSocial }) => statutSocial === 'Retraite',
        ),
      },
    }),
  )
}

const individuelDe = (
  row: ActiviteDeMediationRow,
): Omit<AccompagnementIndividuel, keyof Commun> => {
  const [accompagnement, ...autres] = row.accompagnements
  if (accompagnement === undefined || autres.length > 0) {
    throw new ActiviteIllisible(row.id, 'un seul bénéficiaire attendu')
  }
  if (row.titreAtelier !== null || row.niveau !== null) {
    throw new ActiviteIllisible(row.id, 'champ d’atelier sur un individuel')
  }
  return {
    _tag: 'Individuel',
    beneficiaire: beneficiaireAccompagneDe(row.id, accompagnement),
    autonomie: row.autonomie === null ? null : Autonomie(row.autonomie),
    orientation: orientationDe(row),
  }
}

const collectifDe = (
  row: ActiviteDeMediationRow,
): Omit<AtelierCollectif, keyof Commun> => {
  if (
    row.autonomie !== null ||
    row.orienteVersStructure !== null ||
    row.structureDeRedirection !== null
  ) {
    throw new ActiviteIllisible(row.id, 'champ individuel sur un atelier')
  }
  const titre = renseigne(row.titreAtelier)
  return {
    _tag: 'Collectif',
    titre: titre === null ? null : TitreDAtelier(titre),
    niveau: row.niveau === null ? null : NiveauDAtelier(row.niveau),
    participants: valide(row.id)(
      participantsDeLAtelier({
        suivis: row.accompagnements
          .filter(({ beneficiaire }) => !beneficiaire.anonyme)
          .map(({ beneficiaire }) => BeneficiaireId(beneficiaire.id)),
        anonymes: participantsAnonymesDeLaLigne(row),
      }),
    ),
  }
}

type Commun = Omit<
  AccompagnementIndividuel,
  '_tag' | 'beneficiaire' | 'autonomie' | 'orientation'
>

const dateDe = (date: Date): DateDActivite =>
  DateDActivite(date.toISOString().slice(0, 10))

export const activiteDeMediationToDomain = (
  row: ActiviteDeMediationRow,
): ActiviteDeMediation => {
  const commun: Commun = {
    id: ActiviteId(row.id),
    mediateurId: MediateurId(row.mediateurId),
    date: dateDe(row.date),
    duree: DureeEnMinutes(row.duree),
    lieu: lieuDe(row),
    thematiques: thematiquesDeLaLigne(row),
    equipement: equipementDeLaLigne(row),
    tags: row.tags.map(({ tagId }) => TagId(tagId)),
    notes: notesDe(row.notes),
    origine: origineDe(row),
    employeuse:
      row.structureEmployeuseMainId === null
        ? null
        : EmployeuseId(row.structureEmployeuseMainId),
    creation: row.creation,
    modification: row.modification,
  }
  return row.type === 'Individuel'
    ? { ...commun, ...individuelDe(row) }
    : { ...commun, ...collectifDe(row) }
}

const AUCUNE_COMMUNE: ColonnesDeCommune = {
  nom: null,
  codePostal: null,
  codeInsee: null,
}

const colonnesDe = (commune: Commune | null): ColonnesDeCommune =>
  commune === null
    ? AUCUNE_COMMUNE
    : {
        nom: commune.nom,
        codePostal: commune.codePostal,
        codeInsee: commune.codeInsee,
      }

const communeDuLieu = (lieu: Lieu): Commune | null => {
  if (lieu._tag === 'LieuActivite') {
    return null
  }
  return lieu._tag === 'ADistance' ? lieu.communeDeRattachement : lieu.commune
}

const thematiquesVersLaBase = (
  thematiques: Thematiques,
): ActiviteDeMediationRow['thematiques'] => [
  ...thematiques.mediation,
  ...(thematiques.demarche === null
    ? []
    : [
        'AideAuxDemarchesAdministratives' as const,
        ...thematiques.demarche.thematiques,
      ]),
]

const materielVersLaBase = (
  equipement: Equipement,
): ActiviteDeMediationRow['materiel'] => {
  if (equipement._tag === 'NonRenseigne') {
    return []
  }
  return equipement._tag === 'AucunMateriel'
    ? ['Aucun']
    : [...equipement.materiels]
}

const ANONYME_SANS_PROFIL: Omit<BeneficiaireRow, 'id'> = {
  anonyme: true,
  genre: null,
  trancheAge: null,
  statutSocial: null,
  commune: null,
  communeCodePostal: null,
  communeCodeInsee: null,
}

const nonCommunique = <V extends string>(valeur: V): V | null =>
  valeur === 'NonCommunique' ? null : valeur

const repete = <V>(
  repartition: readonly (readonly [V, number])[],
): readonly V[] =>
  repartition.flatMap(([valeur, effectif]) =>
    Array.from({ length: effectif }, () => valeur),
  )

const accompagnementsAnonymesVersLaBase = (
  anonymes: ParticipantsAnonymes,
  nouvelId: () => string,
): readonly AccompagnementRow[] => {
  const genres = repete<Genre | null>([
    [Genre('Masculin'), anonymes.genres.masculin],
    [Genre('Feminin'), anonymes.genres.feminin],
    [null, anonymes.genres.nonCommunique],
  ])
  const tranchesDAge = repete<TrancheDAge | null>([
    [TrancheDAge('MoinsDeDouze'), anonymes.tranchesDAge.moinsDeDouze],
    [TrancheDAge('DouzeDixHuit'), anonymes.tranchesDAge.douzeDixHuit],
    [
      TrancheDAge('DixHuitVingtQuatre'),
      anonymes.tranchesDAge.dixHuitVingtQuatre,
    ],
    [
      TrancheDAge('VingtCinqTrenteNeuf'),
      anonymes.tranchesDAge.vingtCinqTrenteNeuf,
    ],
    [
      TrancheDAge('QuaranteCinquanteNeuf'),
      anonymes.tranchesDAge.quaranteCinquanteNeuf,
    ],
    [
      TrancheDAge('SoixanteSoixanteNeuf'),
      anonymes.tranchesDAge.soixanteSoixanteNeuf,
    ],
    [TrancheDAge('SoixanteDixPlus'), anonymes.tranchesDAge.soixanteDixPlus],
    [null, anonymes.tranchesDAge.nonCommunique],
  ])
  const statutsSociaux = repete<StatutSocial | null>([
    [StatutSocial('Scolarise'), anonymes.statutsSociaux.scolarise],
    [StatutSocial('SansEmploi'), anonymes.statutsSociaux.sansEmploi],
    [StatutSocial('EnEmploi'), anonymes.statutsSociaux.enEmploi],
    [StatutSocial('Retraite'), anonymes.statutsSociaux.retraite],
    [null, anonymes.statutsSociaux.nonCommunique],
  ])
  return Array.from({ length: anonymes.total }, (_, rang) => ({
    premierAccompagnement: rang >= anonymes.dejaAccompagnes,
    beneficiaire: {
      ...ANONYME_SANS_PROFIL,
      id: nouvelId(),
      genre: genres[rang] ?? null,
      trancheAge: tranchesDAge[rang] ?? null,
      statutSocial: statutsSociaux[rang] ?? null,
    },
  }))
}

const suiviVersLaBase = (id: BeneficiaireId): AccompagnementRow => ({
  premierAccompagnement: false,
  beneficiaire: { ...ANONYME_SANS_PROFIL, anonyme: false, id },
})

const accompagnementsVersLaBase = (
  activite: ActiviteDeMediation,
  nouvelId: () => string,
): readonly AccompagnementRow[] => {
  if (activite._tag === 'Collectif') {
    return [
      ...activite.participants.suivis.map(suiviVersLaBase),
      ...accompagnementsAnonymesVersLaBase(
        activite.participants.anonymes,
        nouvelId,
      ),
    ]
  }
  const { beneficiaire } = activite
  return beneficiaire._tag === 'Suivi'
    ? [suiviVersLaBase(beneficiaire.id)]
    : [
        {
          premierAccompagnement: !beneficiaire.dejaAccompagne,
          beneficiaire: {
            ...ANONYME_SANS_PROFIL,
            id: nouvelId(),
            genre: nonCommunique(beneficiaire.profil.genre),
            trancheAge: nonCommunique(beneficiaire.profil.trancheDAge),
            statutSocial: nonCommunique(beneficiaire.profil.statutSocial),
            commune: colonnesDe(beneficiaire.profil.residence).nom,
            communeCodePostal: colonnesDe(beneficiaire.profil.residence)
              .codePostal,
            communeCodeInsee: colonnesDe(beneficiaire.profil.residence)
              .codeInsee,
          },
        },
      ]
}

const orientationVersLaBase = (
  orientation: Orientation,
): Pick<
  ActiviteDeMediationRow,
  'orienteVersStructure' | 'structureDeRedirection'
> => {
  if (orientation._tag === 'Oriente') {
    return {
      orienteVersStructure: true,
      structureDeRedirection: orientation.vers,
    }
  }
  return {
    orienteVersStructure: orientation._tag === 'NonOriente' ? false : null,
    structureDeRedirection: null,
  }
}

export const activiteDeMediationFromDomain = (
  activite: ActiviteDeMediation,
  nouvelId: () => string,
): ActiviteDeMediationRow => {
  const commune = colonnesDe(communeDuLieu(activite.lieu))
  return {
    id: activite.id,
    type: activite._tag,
    mediateurId: activite.mediateurId,
    date: new Date(`${activite.date}T00:00:00.000Z`),
    duree: activite.duree,
    notes: activite.notes,
    rdvId:
      activite.origine._tag === 'RendezVous' ? activite.origine.rdvId : null,
    v1CraId:
      activite.origine._tag === 'ImportV1'
        ? activite.origine.identifiant
        : null,
    structureEmployeuseMainId: activite.employeuse,
    typeLieu: activite.lieu._tag,
    structureId:
      activite.lieu._tag === 'LieuActivite'
        ? activite.lieu.lieuActiviteId
        : null,
    lieuCommune: commune.nom,
    lieuCodePostal: commune.codePostal,
    lieuCodeInsee: commune.codeInsee,
    thematiques: thematiquesVersLaBase(activite.thematiques),
    precisionsDemarche: activite.thematiques.demarche?.precision ?? null,
    materiel: materielVersLaBase(activite.equipement),
    ...(activite._tag === 'Individuel'
      ? {
          autonomie: activite.autonomie,
          ...orientationVersLaBase(activite.orientation),
          titreAtelier: null,
          niveau: null,
        }
      : {
          autonomie: null,
          orienteVersStructure: null,
          structureDeRedirection: null,
          titreAtelier: activite.titre,
          niveau: activite.niveau,
        }),
    creation: activite.creation,
    modification: activite.modification,
    tags: activite.tags.map((tagId) => ({ tagId })),
    accompagnements: [...accompagnementsVersLaBase(activite, nouvelId)],
  }
}
