# Fonctionnalité: Consulter le mode maintenance

> La Coop affiche une bannière tant qu'une maintenance est en cours, et
> l'administration retrouve les dernières maintenances dans un historique.

## Règle: Sans période en cours, la Coop n'est pas en maintenance

### Scénario: Une maintenance close ne met pas la Coop en maintenance

* Étant donné une maintenance close avec le message "Migration des lieux"
* Alors la maintenance est inactive

## Règle: L'historique présente les maintenances de la plus récente à la plus ancienne

### Scénario: La maintenance en cours ouvre l'historique

* Étant donné une maintenance close avec le message "Migration des lieux"
* Et une maintenance en cours avec le message "Bascule de la base"
* Quand on consulte l'historique des maintenances
* Alors l'historique liste "Bascule de la base" en cours, puis "Migration des lieux" close
