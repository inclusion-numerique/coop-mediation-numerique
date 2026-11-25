import {
  type LieuSaisi,
  SaisieDuLieuCard,
} from '../components/SaisieDuLieuCard'

export const CarteDuLieuSaisi = ({ lieu }: { lieu: LieuSaisi }) => (
  <SaisieDuLieuCard lieu={lieu} className="fr-mt-4v" />
)
