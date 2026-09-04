import { dispositifProgrammeNationalKeys } from '@app/web/features/structures/dispositifProgrammesNationaux'
import { formationLabelValues } from '@app/web/features/structures/formationLabel'
import { fraisAChargeValues } from '@app/web/features/structures/fraisACharge'
import { itineranceKeys } from '@app/web/features/structures/itinerance'
import { modaliteAccompagnementValues } from '@app/web/features/structures/modaliteAccompagnement'
import { modaliteAccesKeys } from '@app/web/features/structures/modalitesAcces'
import { priseEnChargeSpecifiqueValues } from '@app/web/features/structures/priseEnChargeSpecifique'
import { publicSpecifiquementAdresseValues } from '@app/web/features/structures/publicSpecifiquementAdresse'
import { serviceValues } from '@app/web/features/structures/service'
import { typologieStructureValue } from '@app/web/features/structures/typologieStructure'
import {
  DispositifProgrammeNational,
  FormationLabel,
  Frais,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'

type Enumeration<Valeur extends string> = Partial<Record<string, Valeur>>

const nomParValeur = <Valeur extends string>(
  enumeration: Enumeration<Valeur>,
): Map<Valeur, string> =>
  new Map(
    Object.entries(enumeration).flatMap(([nom, valeur]) =>
      valeur == null ? [] : [[valeur, nom] as const],
    ),
  )

const exceptions = <Cle extends string, Valeur extends string>(
  paires: readonly (readonly [Cle, Valeur])[],
): Partial<Record<Cle, Valeur>> =>
  paires.reduce<Partial<Record<Cle, Valeur>>>(
    (table, [cle, valeur]) => ({ ...table, [cle]: valeur }),
    {},
  )

const parNom = <Coop extends string>(
  noms: readonly Coop[],
): Partial<Record<string, Coop>> =>
  noms.reduce<Partial<Record<string, Coop>>>(
    (table, nom) => ({ ...table, [nom]: nom }),
    {},
  )

const traduire = <Coop extends string, Standard extends string>(
  standard: Enumeration<Standard>,
  nomsCoop: readonly Coop[],
  divergences: readonly (readonly [Coop, Standard])[],
) => {
  const versStandardExceptionnel = exceptions(divergences)
  const versCoopExceptionnel = exceptions(
    divergences.map(([depuis, vers]) => [vers, depuis] as const),
  )
  const nomStandard = nomParValeur(standard)
  const nomsConnus = parNom(nomsCoop)

  return {
    versStandard: (valeur: Coop): Standard | null =>
      versStandardExceptionnel[valeur] ?? standard[valeur] ?? null,
    versCoop: (valeur: Standard): Coop | null => {
      const exceptionnel = versCoopExceptionnel[valeur]
      if (exceptionnel != null) return exceptionnel

      const nom = nomStandard.get(valeur)

      return nom == null ? null : (nomsConnus[nom] ?? null)
    },
  }
}

export const service = traduire(Service, serviceValues, [
  [
    'AcquisitionDeMaterielInformatiqueAPrixSolidaire',
    Service.MaterielInformatiqueAPrixSolidaire,
  ],
])

export const modaliteAcces = traduire(
  ModaliteAcces,
  Object.values(modaliteAccesKeys),
  [['FicheDePrescription', ModaliteAcces.PrescriptionParMail]],
)

export const modaliteAccompagnement = traduire(
  ModaliteAccompagnement,
  modaliteAccompagnementValues,
  [['DansUnAtelierCollectif', ModaliteAccompagnement.DansUnAtelier]],
)

export const dispositifProgrammeNational = traduire(
  DispositifProgrammeNational,
  Object.values(dispositifProgrammeNationalKeys),
  [
    ['CertificationPix', DispositifProgrammeNational.CertificationPIX],
    ['PointAccesNumeriqueCaf', DispositifProgrammeNational.PointNumeriqueCAF],
  ],
)

export const typologie = traduire(Typologie, typologieStructureValue, [
  ['Autre', Typologie.AUTRE],
])

export const fraisACharge = traduire(Frais, fraisAChargeValues, [])

export const publicSpecifiquementAdresse = traduire(
  PublicSpecifiquementAdresse,
  publicSpecifiquementAdresseValues,
  [],
)

export const priseEnChargeSpecifique = traduire(
  PriseEnChargeSpecifique,
  priseEnChargeSpecifiqueValues,
  [],
)

export const formationLabel = traduire(FormationLabel, formationLabelValues, [])

export const itinerance = traduire(
  Itinerance,
  Object.values(itineranceKeys),
  [],
)

/**
 * Une valeur que le pont ne sait pas traduire est écartée plutôt que portée
 * telle quelle : le domaine ne doit contenir que du vocabulaire du standard.
 */
export const traduites = <Depuis, Vers>(
  valeurs: readonly Depuis[],
  traduction: (valeur: Depuis) => Vers | null,
): readonly Vers[] =>
  valeurs
    .map(traduction)
    .filter((valeur): valeur is NonNullable<Vers> => valeur != null)

/**
 * Les valeurs d'une énumération du schéma national reconnues parmi des libellés
 * bruts.
 *
 * Une source externe rend des chaînes ; les traiter d'emblée comme des valeurs
 * du standard demanderait un `as`, c'est-à-dire une affirmation qu'on ne vérifie
 * pas. Ce qu'on ne reconnaît pas est écarté, comme le fait `traduites` de ce
 * qu'elle ne sait pas traduire.
 */
export const reconnues = <Valeur extends string>(
  enumeration: Record<string, Valeur>,
  libelles: readonly string[],
): readonly Valeur[] => {
  const connues = new Set<string>(Object.values(enumeration))

  return libelles.filter((libelle): libelle is Valeur => connues.has(libelle))
}
