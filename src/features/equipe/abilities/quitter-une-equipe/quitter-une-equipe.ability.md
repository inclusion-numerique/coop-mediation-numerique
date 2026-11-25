# Fonctionnalité: Quitter une équipe

## Règle: Un médiateur quitte l'équipe dont il est membre, et son passage reste archivé

### Scénario: Un membre quitte son équipe

* Étant donné un médiateur membre d'une équipe
* Quand ce médiateur quitte l'équipe
* Alors le départ réussit
* Et son adhésion est archivée

### Scénario: Un ancien membre revenu quitte de nouveau l'équipe

> Seule l'adhésion en cours est archivée : une ancienne adhésion garde la date
> de son propre départ.

* Étant donné un médiateur revenu dans une équipe qu'il avait déjà quittée
* Quand ce médiateur quitte l'équipe
* Alors le départ réussit
* Et il n'a plus aucune adhésion active à cette équipe
* Et son ancienne adhésion garde sa date de départ

### Scénario: Un médiateur qui n'est pas membre ne peut pas quitter l'équipe

* Étant donné un médiateur qui a déjà quitté une équipe
* Quand ce médiateur quitte l'équipe
* Alors le départ est refusé
