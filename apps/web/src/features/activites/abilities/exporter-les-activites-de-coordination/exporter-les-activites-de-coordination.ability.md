# Feature: Exporter ses activités de coordination

## Rule: L'export reprend toutes les activités qui répondent aux critères, sans pagination

### Scenario: Export sans critère

* Given des activités de coordination enregistrées
* When j'exporte mes activités de coordination
* Then 3 activités de coordination sont exportées

### Scenario: Export filtré par tag

* Given des activités de coordination enregistrées
* When j'exporte mes activités de coordination taguées « Réseau »
* Then 1 activités de coordination sont exportées
* And le tag « Réseau » est rappelé dans les filtres de l'export
