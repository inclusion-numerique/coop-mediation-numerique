# Feature: Supprimer un ancien membre

## Rule: Seul un ancien membre peut être supprimé des archives de l'équipe

> La suppression est définitive : le médiateur sort aussi du périmètre des
> statistiques passées de l'équipe.

### Scenario: Le coordinateur supprime un ancien membre de ses archives

* Given un coordinateur et un ancien membre de son équipe
* When le coordinateur supprime cet ancien membre des archives
* Then la suppression réussit
* And cet ancien membre n'apparaît plus dans l'équipe

### Scenario: Un membre actif ne peut pas être supprimé des archives

* Given un coordinateur et un membre revenu dans son équipe
* When le coordinateur supprime cet ancien membre des archives
* Then la suppression est refusée
* And ce membre est toujours actif dans l'équipe
