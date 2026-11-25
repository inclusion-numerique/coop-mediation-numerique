# Fonctionnalité: Exporter les membres d'une équipe

## Règle: L'export reprend les membres filtrés, avec leur statut

### Scénario: Le coordinateur exporte les archives de son équipe

* Étant donné un coordinateur dont l'équipe compte un membre actif et un ancien membre
* Quand le coordinateur exporte les archives de son équipe
* Alors l'export compte 1 membre
* Et ce membre exporté est un ancien membre

## Règle: Seuls les membres actifs, le coordinateur et les administrateurs exportent une équipe

### Scénario: Le coordinateur d'une autre équipe ne peut pas l'exporter

* Étant donné un coordinateur dont l'équipe compte un membre actif et un ancien membre
* Quand le coordinateur d'une autre équipe exporte cette équipe
* Alors l'export est refusé
