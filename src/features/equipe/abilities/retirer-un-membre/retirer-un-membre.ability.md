# Fonctionnalité: Retirer un membre

## Règle: Le coordinateur retire un membre, qui devient ancien membre

### Scénario: Le coordinateur retire un membre de son équipe

* Étant donné un coordinateur et un membre de son équipe
* Quand le coordinateur retire ce membre
* Alors le retrait du membre réussit
* Et ce membre devient ancien membre

## Règle: Seul le coordinateur de l'équipe ou un administrateur retire un membre

### Scénario: Le coordinateur d'une autre équipe ne peut pas retirer ce membre

* Étant donné un coordinateur et un membre de son équipe
* Quand le coordinateur d'une autre équipe retire ce membre
* Alors le retrait du membre est refusé
* Et ce membre fait toujours partie de l'équipe
