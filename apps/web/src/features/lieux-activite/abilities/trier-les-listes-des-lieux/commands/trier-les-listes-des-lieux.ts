import type {
  DeposerLeReleve,
  Journal,
  LireLesLieux,
  Releve,
  TrierLesListes,
} from '../domain'
import { relever } from '../domain'

const PAS_DU_JOURNAL = 500

export type PortsDeTri = {
  readonly lireLesLieux: LireLesLieux
  readonly trierLesListes: TrierLesListes
  readonly deposerLeReleve: DeposerLeReleve
  readonly journal: Journal
}

export type Tri = {
  readonly releve: Releve
  readonly lieuxTries: number
  readonly fichiers: readonly string[]
}

const avancement =
  (journal: Journal, total: number) =>
  (rang: number): void => {
    if (rang > 0 && rang % PAS_DU_JOURNAL === 0)
      journal(`${rang}/${total} lieux triés`)
  }

const trierChaqueLieu = async (
  { trierLesListes, journal }: PortsDeTri,
  releve: Releve,
): Promise<number> => {
  const signaler = avancement(journal, releve.lieux.length)

  return releve.lieux.reduce<Promise<number>>(
    async (tries, { lieuId, colonnes }, rang) => {
      const acquis = await tries

      signaler(rang)
      await trierLesListes(lieuId, colonnes)

      return acquis + 1
    },
    Promise.resolve(0),
  )
}

export const trierLesListesDesLieux = async ({
  ports,
}: {
  readonly ports: PortsDeTri
}): Promise<Tri> => {
  const releve = relever(await ports.lireLesLieux())

  return {
    releve,
    lieuxTries: await trierChaqueLieu(ports, releve),
    fichiers: await ports.deposerLeReleve(releve),
  }
}
