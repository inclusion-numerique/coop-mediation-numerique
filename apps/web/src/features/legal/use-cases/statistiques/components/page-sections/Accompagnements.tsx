import React from 'react'
import { ChartCard, ChartCardDataProps } from '../ChartCard'

export const Accompagnements = ({
  accompagnements,
}: {
  accompagnements: ChartCardDataProps
}) => (
  <ChartCard
    color="blue-france"
    title="Accompagnements enregistrés"
    chartTitle="Nombre d'accompagnements réalisés"
    titleAs="h2"
    icon="ri-service-line"
    {...accompagnements}
  />
)
