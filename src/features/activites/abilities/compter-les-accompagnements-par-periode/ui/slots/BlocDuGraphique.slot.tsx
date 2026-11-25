import { Suspense } from 'react'
import { GraphiqueDesAccompagnements } from '../components/GraphiqueDesAccompagnements'
import { GraphiqueEnAttente } from '../components/GraphiqueEnAttente'
import type { parPeriodePresentes } from '../presenters/par-periode.presenter'

type Periode = ReturnType<typeof parPeriodePresentes>

const GraphiqueAttendu = async ({ periode }: { periode: Promise<Periode> }) => {
  const { accompagnementsParJour, accompagnementsParMois } = await periode
  return (
    <GraphiqueDesAccompagnements
      accompagnementsParJour={accompagnementsParJour}
      accompagnementsParMois={accompagnementsParMois}
    />
  )
}

export const BlocDuGraphique = ({
  periode,
}: {
  periode: Periode | Promise<Periode>
}) => (
  <Suspense fallback={<GraphiqueEnAttente />}>
    <GraphiqueAttendu periode={Promise.resolve(periode)} />
  </Suspense>
)
