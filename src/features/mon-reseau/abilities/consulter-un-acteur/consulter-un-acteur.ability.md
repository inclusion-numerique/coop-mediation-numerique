# Fonctionnalité: Consulter un acteur

> La fiche d'un acteur de l'annuaire : qui il est, comment le joindre, s'il est
> actif, et, pour le coordinateur qui la consulte, où il en est avec son équipe.

## Règle: Seule la fiche d'un acteur actif et inscrit se consulte

### Scénario: Un médiateur consulte la fiche d'un autre médiateur

* Étant donné un médiateur Alex Martin
* Et un médiateur qui consulte l’annuaire
* Quand il consulte la fiche d’Alex Martin
* Alors la fiche présente Alex Martin
* Et la fiche ne dit rien de l’équipe

### Scénario: La fiche d'un compte supprimé est introuvable

* Étant donné un médiateur supprimé Alex Martin
* Et un médiateur qui consulte l’annuaire
* Quand il consulte la fiche d’Alex Martin
* Alors la fiche est introuvable

### Scénario: La fiche d'un compte dont l'inscription n'est pas validée est introuvable

* Étant donné un médiateur non inscrit Alex Martin
* Et un médiateur qui consulte l’annuaire
* Quand il consulte la fiche d’Alex Martin
* Alors la fiche est introuvable

### Scénario: La fiche d'un identifiant qui n'en est pas un est introuvable

* Étant donné un médiateur qui consulte l’annuaire
* Quand il consulte la fiche « pas-un-identifiant »
* Alors la fiche est introuvable

### Scénario: Un coordinateur introuvable n'apparaît pas parmi les coordinateurs de l'acteur

> Chaque coordinateur nommé mène à sa fiche : un coordinateur dont la fiche est
> introuvable n'est pas nommé.

* Étant donné un médiateur Alex Martin
* Et Alex Martin est coordonné par un coordinateur non inscrit
* Et un médiateur qui consulte l’annuaire
* Quand il consulte la fiche d’Alex Martin
* Alors Alex Martin n’est coordonné par personne

## Règle: Le statut public suit la règle d'activité des utilisateurs

> Un médiateur est actif s'il a créé une activité ou un bénéficiaire dans les
> 30 derniers jours.

### Scénario: Un médiateur qui a saisi une activité il y a 10 jours est actif

* Étant donné un médiateur Alex Martin dont la dernière activité date de 10 jours
* Et un médiateur qui consulte l’annuaire
* Quand il consulte la fiche d’Alex Martin
* Alors Alex Martin est actif

### Scénario: Un médiateur qui n'a jamais rien saisi n'a jamais été actif

* Étant donné un médiateur Alex Martin
* Et un médiateur qui consulte l’annuaire
* Quand il consulte la fiche d’Alex Martin
* Alors Alex Martin n’a jamais été actif

## Règle: Le coordinateur voit où en est l'acteur avec son équipe

### Scénario: Un médiateur sans lien avec l'équipe peut y être invité

* Étant donné un médiateur Alex Martin
* Et un coordinateur qui consulte l’annuaire
* Quand il consulte la fiche d’Alex Martin
* Alors Alex Martin est hors de son équipe

### Scénario: Un membre de l'équipe montre ses statistiques des 30 derniers jours

* Étant donné un médiateur Alex Martin
* Et un coordinateur qui consulte l’annuaire
* Et Alex Martin est membre de son équipe
* Quand il consulte la fiche d’Alex Martin
* Alors Alex Martin est membre de son équipe, sans activité ces 30 derniers jours

### Scénario: Un médiateur invité attend sa réponse

* Étant donné un médiateur Alex Martin
* Et un coordinateur qui consulte l’annuaire
* Et il a invité Alex Martin dans son équipe
* Quand il consulte la fiche d’Alex Martin
* Alors Alex Martin est invité dans son équipe

### Scénario: Un ancien membre reste dans les archives de l'équipe

* Étant donné un médiateur Alex Martin
* Et un coordinateur qui consulte l’annuaire
* Et Alex Martin a quitté son équipe
* Quand il consulte la fiche d’Alex Martin
* Alors Alex Martin est un ancien membre de son équipe

### Scénario: Un coordinateur ne se coordonne pas lui-même

* Étant donné un coordinateur qui consulte l’annuaire
* Quand il consulte sa propre fiche
* Alors l’acteur ne peut pas rejoindre son équipe

### Scénario: Un coordinateur qui ne fait pas de médiation ne rejoint pas d'équipe

* Étant donné un coordinateur Alex Martin qui ne fait pas de médiation
* Et un coordinateur qui consulte l’annuaire
* Quand il consulte la fiche d’Alex Martin
* Alors l’acteur ne peut pas rejoindre son équipe
