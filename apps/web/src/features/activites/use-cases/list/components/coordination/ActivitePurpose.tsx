import { Fragment, ReactNode } from 'react'
import { TYPE_ANIMATION_OPTIONS } from '../../../cra/animation/labels'
import { TYPE_EVENEMENT_OPTIONS } from '../../../cra/evenement/labels'
import { NATURE_OPTIONS } from '../../../cra/partenariat/labels'
import { ActivitesByDate } from '../../db/getCoordinationsListPageData'
import { CustomLabel } from './CustomLabel'

export const ActivitePurpose = ({
  activite,
}: {
  activite: ActivitesByDate['activites'][number]
}) => (
  <>
    <CustomLabel
      value={
        TYPE_ANIMATION_OPTIONS.find(
          ({ value }) => value === activite?.typeAnimation,
        )?.label
      }
      customizableValue="Autre"
      customValue={activite.typeAnimationAutre}
    />
    <CustomLabel
      value={
        TYPE_EVENEMENT_OPTIONS.find(
          ({ value }) => value === activite?.typeEvenement,
        )?.label
      }
      customizableValue="Autre"
      customValue={activite.typeEvenementAutre}
    />
    <>
      {activite.naturePartenariat?.reduce<ReactNode[]>(
        (partenariats, value, i) => {
          if (i > 0)
            partenariats.push(
              <Fragment key={`separator-${value}`}>&nbsp;·&nbsp;</Fragment>,
            )
          partenariats.push(
            <CustomLabel
              key={value}
              value={
                NATURE_OPTIONS.find(
                  (partenariat) => partenariat.value === value,
                )?.label
              }
              customizableValue="Autre"
              customValue={activite.naturePartenariatAutre}
            />,
          )
          return partenariats
        },
        [],
      )}
    </>
  </>
)
