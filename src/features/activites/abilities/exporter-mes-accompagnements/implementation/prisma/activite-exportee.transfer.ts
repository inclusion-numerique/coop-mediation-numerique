import type { Prisma } from '@app/web/generated/prisma/client'
import { CodeInsee } from '@app/web/libraries/insee'
import {
  ActiviteId,
  AdresseDuLieu,
  Autonomie,
  DateDActivite,
  DureeEnMinutes,
  type Equipement,
  Genre,
  Materiel,
  NiveauDAtelier,
  NomDeCommune,
  NomDeFamille,
  NomDeStructure,
  NomDeTag,
  notesDe,
  type Orientation,
  PrecisionDeDemarche,
  Prenom,
  SourceDeLActivite,
  StatutSocial,
  StructureDeRedirection,
  ThematiqueRecherchee,
  TitreDAtelier,
  TrancheDAge,
  TypeDeLieu,
} from '../../../../domain'
import {
  type AccompagnementExporte,
  type ActiviteExportee,
  CodesPostaux,
  type Identite,
  type LieuExporte,
  type Localisation,
} from '../../domain'

export const activiteExporteeSelect = {
  id: true,
  type: true,
  date: true,
  creation: true,
  modification: true,
  typeLieu: true,
  duree: true,
  materiel: true,
  thematiques: true,
  precisionsDemarche: true,
  notes: true,
  v1CraId: true,
  autonomie: true,
  orienteVersStructure: true,
  structureDeRedirection: true,
  titreAtelier: true,
  niveau: true,
  lieuCommune: true,
  lieuCodePostal: true,
  lieuCodeInsee: true,
  lieuInclusion: {
    select: {
      nom: true,
      adresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
    },
  },
  tags: { select: { tag: { select: { nom: true } } } },
  mediateur: {
    select: { user: { select: { firstName: true, lastName: true } } },
  },
  accompagnements: {
    select: {
      premierAccompagnement: true,
      beneficiaire: {
        select: {
          prenom: true,
          nom: true,
          commune: true,
          communeCodePostal: true,
          communeCodeInsee: true,
          genre: true,
          trancheAge: true,
          statutSocial: true,
        },
      },
    },
  },
} satisfies Prisma.ActiviteSelect

export type ActiviteExporteeRow = Prisma.ActiviteGetPayload<{
  select: typeof activiteExporteeSelect
}>

const lu = <I, T>(
  modele: { readonly safe: (valeur: I) => T | null },
  valeur: I | null,
): T | null => (valeur === null ? null : modele.safe(valeur))

const localisationDe = (colonnes: {
  readonly commune: string | null
  readonly codePostal: string | null
  readonly codeInsee: string | null
}): Localisation => ({
  commune: lu(NomDeCommune, colonnes.commune),
  codesPostaux: lu(CodesPostaux, colonnes.codePostal),
  codeInsee: lu(CodeInsee, colonnes.codeInsee),
})

const identiteDe = (prenom: string | null, nom: string | null): Identite => ({
  prenom: lu(Prenom, prenom),
  nom: lu(NomDeFamille, nom),
})

const lieuDe = (ligne: ActiviteExporteeRow): LieuExporte => {
  const lieu = ligne.lieuInclusion
  return {
    nom: lu(NomDeStructure, lieu?.nom ?? null),
    adresse: lu(AdresseDuLieu, lieu?.adresse ?? null),
    ...localisationDe({
      commune: lieu?.commune ?? ligne.lieuCommune,
      codePostal: lieu?.codePostal ?? ligne.lieuCodePostal,
      codeInsee: lieu?.codeInsee ?? ligne.lieuCodeInsee,
    }),
  }
}

const equipementDe = (
  materiel: ActiviteExporteeRow['materiel'],
): Equipement => {
  const [premier, ...autres] = materiel.flatMap((valeur) =>
    valeur === 'Aucun' ? [] : [Materiel(valeur)],
  )
  if (materiel.includes('Aucun')) return { _tag: 'AucunMateriel' }
  return premier === undefined
    ? { _tag: 'NonRenseigne' }
    : { _tag: 'Materiels', materiels: [premier, ...autres] }
}

const orientationDe = (ligne: ActiviteExporteeRow): Orientation => {
  if (ligne.orienteVersStructure === null) return { _tag: 'NonRenseignee' }
  return ligne.orienteVersStructure
    ? {
        _tag: 'Oriente',
        vers: lu(StructureDeRedirection, ligne.structureDeRedirection),
      }
    : { _tag: 'NonOriente' }
}

const accompagnementDe = ({
  premierAccompagnement,
  beneficiaire,
}: ActiviteExporteeRow['accompagnements'][number]): AccompagnementExporte => ({
  beneficiaire: identiteDe(beneficiaire.prenom, beneficiaire.nom),
  residence: localisationDe({
    commune: beneficiaire.commune,
    codePostal: beneficiaire.communeCodePostal,
    codeInsee: beneficiaire.communeCodeInsee,
  }),
  genre: Genre(beneficiaire.genre ?? 'NonCommunique'),
  trancheDAge: TrancheDAge(beneficiaire.trancheAge ?? 'NonCommunique'),
  statutSocial: StatutSocial(beneficiaire.statutSocial ?? 'NonCommunique'),
  premierAccompagnement,
})

export const activiteExporteeDe = (
  ligne: ActiviteExporteeRow,
  conseillerNumerique: boolean,
): ActiviteExportee => {
  const commun = {
    id: ActiviteId(ligne.id),
    date: DateDActivite(ligne.date.toISOString().slice(0, 10)),
    creation: ligne.creation,
    modification: ligne.modification,
    mediateur: {
      ...identiteDe(
        ligne.mediateur.user.firstName,
        ligne.mediateur.user.lastName,
      ),
      conseillerNumerique,
    },
    typeDeLieu: TypeDeLieu(ligne.typeLieu),
    lieu: lieuDe(ligne),
    duree: DureeEnMinutes(ligne.duree),
    equipement: equipementDe(ligne.materiel),
    thematiques: ligne.thematiques.map((thematique) =>
      ThematiqueRecherchee(thematique),
    ),
    tags: ligne.tags.flatMap(({ tag }) => {
      const nom = NomDeTag.safe(tag.nom)
      return nom === null ? [] : [nom]
    }),
    precisionDeDemarche: lu(PrecisionDeDemarche, ligne.precisionsDemarche),
    notes: notesDe(ligne.notes),
    source: SourceDeLActivite(ligne.v1CraId === null ? 'Coop' : 'ImportV1'),
    accompagnements: ligne.accompagnements.map(accompagnementDe),
  }
  return ligne.type === 'Individuel'
    ? {
        ...commun,
        _tag: 'Individuel',
        autonomie: lu(Autonomie, ligne.autonomie),
        orientation: orientationDe(ligne),
      }
    : {
        ...commun,
        _tag: 'Collectif',
        titre: lu(TitreDAtelier, ligne.titreAtelier),
        niveau: lu(NiveauDAtelier, ligne.niveau),
      }
}
