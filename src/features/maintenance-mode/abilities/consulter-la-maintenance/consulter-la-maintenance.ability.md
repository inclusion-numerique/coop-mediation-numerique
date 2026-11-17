# Feature: Consulter le mode maintenance

> La Coop affiche une bannière tant qu'une maintenance est en cours, et
> l'administration retrouve les dernières maintenances dans un historique.

## Rule: Sans période en cours, la Coop n'est pas en maintenance

### Scenario: Une maintenance close ne met pas la Coop en maintenance

* Given une maintenance close avec le message "Migration des lieux"
* Then la maintenance est inactive

## Rule: L'historique présente les maintenances de la plus récente à la plus ancienne

### Scenario: La maintenance en cours ouvre l'historique

* Given une maintenance close avec le message "Migration des lieux"
* And une maintenance en cours avec le message "Bascule de la base"
* When on consulte l'historique des maintenances
* Then l'historique liste "Bascule de la base" en cours, puis "Migration des lieux" close
