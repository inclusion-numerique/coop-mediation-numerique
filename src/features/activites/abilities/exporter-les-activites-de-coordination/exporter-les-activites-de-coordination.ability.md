# Fonctionnalité: Exporter ses activités de coordination

## Règle: L'export reprend toutes les activités qui répondent aux critères, sans pagination

### Scénario: Export sans critère

* Étant donné des activités de coordination enregistrées
* Quand j'exporte mes activités de coordination
* Alors 3 activités de coordination sont exportées

### Scénario: Export filtré par tag

* Étant donné des activités de coordination enregistrées
* Quand j'exporte mes activités de coordination taguées « Réseau »
* Alors 1 activités de coordination sont exportées
* Et le tag « Réseau » est rappelé dans les filtres de l'export
