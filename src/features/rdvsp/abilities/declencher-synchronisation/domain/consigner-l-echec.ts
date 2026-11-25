import type {
  DeclencherSynchronisation,
  MarquerEchecDeSynchronisation,
} from './declencher-synchronisation'

export const consignerLEchec =
  (
    declencher: DeclencherSynchronisation,
    marquerEchec: MarquerEchecDeSynchronisation,
  ): DeclencherSynchronisation =>
  async (demande) => {
    const resultat = await declencher(demande)

    if (
      !resultat.success &&
      resultat.error._tag === 'SynchronisationEchouee' &&
      resultat.error.marquage !== null
    ) {
      await marquerEchec(resultat.error.marquage)
    }

    return resultat
  }
