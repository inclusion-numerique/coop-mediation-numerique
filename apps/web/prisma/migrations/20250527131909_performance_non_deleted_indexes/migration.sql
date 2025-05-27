-- Create partial indexes for soft-deletable models
CREATE INDEX idx_activites_not_deleted ON activites (id) WHERE suppression IS NULL;
CREATE INDEX idx_mediateurs_coordonnes_not_deleted ON mediateurs_coordonnes (id) WHERE suppression IS NULL;
CREATE INDEX idx_structures_not_deleted ON structures (id) WHERE suppression IS NULL;
CREATE INDEX idx_employes_structures_not_deleted ON employes_structures (id) WHERE suppression IS NULL;
CREATE INDEX idx_mediateurs_en_activite_not_deleted ON mediateurs_en_activite (id) WHERE suppression IS NULL;
CREATE INDEX idx_beneficiaires_not_deleted ON beneficiaires (id) WHERE suppression IS NULL;
CREATE INDEX idx_assistant_chat_threads_not_deleted ON assistant_chat_threads (id) WHERE deleted IS NULL;