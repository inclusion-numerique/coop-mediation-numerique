import type {
  ColonneDeListe,
  DeposerLeReleve,
  Journal,
  LieuAReprendre,
  LireLesLieux,
  RangerLesListes,
  Releve,
} from '../domain'
import { colonnesARanger, relever } from '../domain'

const PAS_DU_JOURNAL = 500

export type PortsDeReprise = {
  readonly lireLesLieux: LireLesLieux
  readonly rangerLesListes: RangerLesListes
  readonly deposerLeReleve: DeposerLeReleve
  readonly journal: Journal
}

export type Reprise = {
  readonly releve: Releve
  readonly listesRangees: number
  readonly fichiers: readonly string[]
}

type ListesDUnLieu = {
  readonly lieuId: string
  readonly colonnes: readonly ColonneDeListe[]
}

const listesDesordonnees = (
  lieux: readonly LieuAReprendre[],
): readonly ListesDUnLieu[] =>
  lieux
    .map((lieu) => ({ lieuId: lieu.id, colonnes: colonnesARanger(lieu) }))
    .filter(({ colonnes }) => colonnes.length > 0)

const avancement =
  (journal: Journal, total: number) =>
  (rang: number): void => {
    if (rang > 0 && rang % PAS_DU_JOURNAL === 0)
      journal(`${rang}/${total} lieux repris`)
  }

const rangerChaqueListe = async (
  { rangerLesListes, journal }: PortsDeReprise,
  aRanger: readonly ListesDUnLieu[],
): Promise<number> => {
  const signaler = avancement(journal, aRanger.length)

  return aRanger.reduce<Promise<number>>(
    async (rangees, { lieuId, colonnes }, rang) => {
      const acquises = await rangees

      signaler(rang)
      await rangerLesListes(lieuId, colonnes)

      return acquises + 1
    },
    Promise.resolve(0),
  )
}

export const reprendreLesDonnees = async ({
  ports,
}: {
  readonly ports: PortsDeReprise
}): Promise<Reprise> => {
  const lieux = await ports.lireLesLieux()
  const releve = relever(lieux)

  return {
    releve,
    listesRangees: await rangerChaqueListe(ports, listesDesordonnees(lieux)),
    fichiers: await ports.deposerLeReleve(releve),
  }
}
