# Feature: Retirer un membre

## Rule: Le coordinateur retire un membre, qui devient ancien membre

### Scenario: Le coordinateur retire un membre de son équipe

* Given un coordinateur et un membre de son équipe
* When le coordinateur retire ce membre
* Then le retrait du membre réussit
* And ce membre devient ancien membre

## Rule: Seul le coordinateur de l'équipe ou un administrateur retire un membre

### Scenario: Le coordinateur d'une autre équipe ne peut pas retirer ce membre

* Given un coordinateur et un membre de son équipe
* When le coordinateur d'une autre équipe retire ce membre
* Then le retrait du membre est refusé
* And ce membre fait toujours partie de l'équipe
