# Fonctionnalité: Ajouter un membre

## Règle: Un administrateur rattache directement un médiateur à une équipe

### Scénario: Un médiateur invité est ajouté à l'équipe sans attendre sa réponse

* Étant donné un médiateur invité dans deux équipes
* Quand un administrateur ajoute ce médiateur à la première équipe
* Alors l'ajout du membre réussit
* Et ce médiateur fait partie de la première équipe
* Et son invitation dans la première équipe est retirée
* Et son invitation dans la seconde équipe attend toujours sa réponse

## Règle: Un membre n'est pas ajouté deux fois

### Scénario: Un médiateur déjà membre n'est pas ajouté de nouveau

* Étant donné un médiateur déjà membre d'une équipe
* Quand un administrateur ajoute ce médiateur à cette équipe
* Alors l'ajout du membre est refusé

## Règle: La recherche ne propose que des médiateurs vivants, hors de l'équipe

### Scénario: Un médiateur hors de l'équipe est proposé

* Étant donné une équipe à compléter, avec un membre, un médiateur extérieur et un médiateur supprimé
* Quand un administrateur cherche le médiateur extérieur
* Alors ce médiateur est proposé à l'ajout

### Scénario: Un membre de l'équipe n'est pas proposé

* Étant donné une équipe à compléter, avec un membre, un médiateur extérieur et un médiateur supprimé
* Quand un administrateur cherche le membre de l'équipe
* Alors aucun médiateur n'est proposé à l'ajout

### Scénario: Un médiateur supprimé n'est pas proposé

* Étant donné une équipe à compléter, avec un membre, un médiateur extérieur et un médiateur supprimé
* Quand un administrateur cherche le médiateur supprimé
* Alors aucun médiateur n'est proposé à l'ajout
