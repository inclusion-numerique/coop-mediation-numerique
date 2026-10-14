# Feature: Exporter les membres d'une équipe

## Rule: L'export reprend les membres filtrés, avec leur statut

### Scenario: Le coordinateur exporte les archives de son équipe

* Given un coordinateur dont l'équipe compte un membre actif et un ancien membre
* When le coordinateur exporte les archives de son équipe
* Then l'export compte 1 membre
* And ce membre exporté est un ancien membre

## Rule: Seuls les membres actifs, le coordinateur et les administrateurs exportent une équipe

### Scenario: Le coordinateur d'une autre équipe ne peut pas l'exporter

* Given un coordinateur dont l'équipe compte un membre actif et un ancien membre
* When le coordinateur d'une autre équipe exporte cette équipe
* Then l'export est refusé
