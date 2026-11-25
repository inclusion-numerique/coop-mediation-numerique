import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { ID_DE_LA_MODALE_DE_SAISIE } from '../presenters/modale-de-saisie.presenter'

export const ModaleDeSaisie = createModal({
  id: ID_DE_LA_MODALE_DE_SAISIE,
  isOpenedByDefault: false,
})
