# import/ — mise à jour des grilles tarifaires depuis les PDFs fournisseurs

Outil local (jamais en CI) qui, pour chaque `price_url` des `defineTarif` du repo :

1. télécharge la grille (requête conditionnelle + comparaison SHA-256 avec `manifest.json`),
2. si elle a changé, extrait le texte du PDF (pdfjs-dist) et parse les prix,
3. patche les fichiers `scripts/tarifs/**` (uniquement les nombres et `lastUpdate`, jamais la structure),
4. met à jour `manifest.json` et la section « Derniers tarifs » du README racine.

**La revue humaine reste obligatoire** : relire `git diff scripts/tarifs`, régénérer les goldens, puis commit.

## Installation

```powershell
cd import
npm ci        # unique dépendance : pdfjs-dist (extraction de texte PDF)
```

Node ≥ 22 requis (comme les tests du repo).

## Usage

```powershell
node update.mjs                     # run complet : check + download + parse + patch
node update.mjs --check-only        # détection réseau seule, ne touche à rien
node update.mjs --dry-run           # tout le pipeline sauf l'écriture
node update.mjs --force             # re-parse même si le SHA-256 n'a pas changé
node update.mjs --offline           # réutilise les PDFs du cache/ (dev, sans réseau)
node update.mjs --provider edf      # limite à un fournisseur
node update.mjs --tarif "EDF - Tempo"
npm test                            # tests unitaires + snapshots des parsers (sans réseau)
```

Workflow après un run qui a modifié des fichiers :

```powershell
git diff scripts/tarifs             # revue des valeurs
$env:UPDATE_GOLDEN='1'; node --test "tests/**/*.test.mjs"; $env:UPDATE_GOLDEN=$null   # depuis la racine
git diff tests/golden               # revue des snapshots de simulation
```

## Statuts du rapport

| Statut | Sens |
|---|---|
| `A JOUR` | 304 ou SHA-256 identique au dernier PDF réconcilié |
| `MODIFIE` | valeurs mises à jour dans les fichiers tarifs (détail affiché) |
| `GRILLE CHANGEE, VALEURS IDENTIQUES` | PDF ré-édité sans changement de prix (réconcilié) |
| `INTERVENTION MANUELLE REQUISE` | divergence **structurelle** : kVA ou type de jour ajouté/supprimé, `priceOverrides` présents d'un seul côté. L'outil ne patche jamais la structure : éditer le fichier tarif à la main, puis relancer |
| `NON GERE (HTML)` | `price_url` non-PDF (Alterna, Gaz de Bordeaux, Enercoop) : vérification manuelle |
| `PARSER MANQUANT` | PDF téléchargé et changement détecté, mais pas de parser (Engie, voir plus bas) |
| `VALEUR INTROUVABLE (patch refuse)` | le littéral attendu n'est plus dans le fichier : rien n'est écrit |
| `ERREUR RESEAU` / `ERREUR PARSING` | à investiguer (URL morte ? mise en page changée ?) |

Le SHA-256 du manifest n'est mis à jour **que** lorsqu'une grille est réconciliée (patch appliqué ou valeurs identiques) : une grille en intervention manuelle re-signale à chaque run tant que le fichier tarif n'a pas été adapté.

## Garde-fous

- Remplacement textuel ancré : un nombre n'est remplacé que si sa valeur actuelle est celle attendue ; tout-ou-rien par fichier.
- Revalidation VM : chaque fichier patché est rechargé avec la vraie factory `defineTarif` (zéro erreur exigée) et chaque valeur est relue avant écriture.
- `lastUpdate` prend la date lue dans le PDF (« Applicable au … ») quand elle existe, sinon la date du jour.
- Les puissances kVA listées par le PDF mais absentes du repo sont ignorées (TotalEnergies liste 3 à 36 kVA, le repo n'en modélise qu'un sous-ensemble). L'inverse (kVA du repo absent du PDF) bloque en manuel.

## Architecture

```
update.mjs            point d'entrée CLI (voir --help ci-dessus)
spot-update.mjs       mise à jour des prix spot EPEX FR (voir « Prix spot » ci-dessous)
tempo-update.mjs      mise à jour des calendriers Tempo/EJP (voir « Calendriers Tempo / EJP » ci-dessous)
zenflex-update.mjs    mise à jour du calendrier des jours de sobriété Zenflex (voir « Calendrier Zenflex » ci-dessous)
manifest.json         état persistant par URL { sha256, etag, lastChecked, lastApplied } — committé
lib/
  tarif-defs.mjs      énumère les defineTarif via node:vm (comme tests/helpers/legacyLoader.mjs)
  registry.mjs        URL -> fournisseur/parser ; URLs HTML non gérées
  download.mjs        fetch conditionnel + SHA-256 + cache/ (gitignoré)
  pdf-text.mjs        extraction pdfjs-dist -> items positionnés + reconstruction de lignes/cellules
  table.mjs           détection des tableaux kVA, cellules fusionnées (partition contiguë), buildOffer
  fr-numbers.mjs      nombres français ("19,27", chiffres éclatés "2 1 , 80"), €/kWh -> centimes
  dates.mjs           dates françaises ("1er février 2026", "1 juil. 2026", "12/06/2026", mots éclatés)
  reconcile.mjs       diff parser <-> repo : changements de valeurs vs divergences structurelles
  spot-data.mjs       logique pure des prix spot : jours locaux Paris, normalisation DST, sérialisation
  tempo-data.mjs      logique pure des calendriers Tempo/EJP : mapping statuts API, fusion, sérialisation
  zenflex-data.mjs    logique pure du calendrier Zenflex : config + parsing de l'API OPM (le reste vient de tempo-data.mjs)
  patch-tarif.mjs     remplacement ciblé dans les littéraux defineTarif (multi-blocs par fichier)
  revalidate.mjs      rechargement VM avec la vraie lib tarifs avant écriture
  readme.mjs          section « Derniers tarifs » du README racine
parsers/<fournisseur>.mjs   un module par fournisseur : parse(doc, url) -> { gridDate, offers }
fixtures/<fournisseur>/     <slug>.json (items extraits), .txt (lisible), .expected.json (snapshot)
tools/
  dump-text.mjs       télécharge les PDFs et régénère les fixtures json+txt
  try-parser.mjs      exécute un parser sur ses fixtures et affiche la réconciliation avec le repo
  gen-expected.mjs    régénère les snapshots .expected.json
tests/                node --test : fr-numbers, patch-tarif, parsers (hermétiques, sans réseau)
```

Contrat parser : les clés de `offers` sont exactement les `name` des `defineTarif` ; prix kWh en **centimes TTC**, abonnements en **€ TTC/mois** ; `priceOverrides` émis quand le PDF différencie certaines puissances (la valeur de référence est celle de la plus grande puissance).

## Prix spot (spot-update.mjs)

Les tarifs spot (Sobry) consomment les prix EPEX FR Day-Ahead committés dans
`scripts/tarifs-lib/spot/epex-fr-<année>.js`. Mise à jour manuelle depuis
l'API [energy-charts.info](https://api.energy-charts.info) (données
Bundesnetzagentur | SMARD.de, CC BY 4.0) :

```powershell
node spot-update.mjs                # incrémental : reprend après la dernière date connue
node spot-update.mjs --dry-run      # sans écriture
node spot-update.mjs --full         # ré-importe tout depuis 2023-01-01
node spot-update.mjs --from 2026-01-01 --to 2026-01-31   # fenêtre explicite
```

Particularités : prix en EUR/MWh bruts (le moteur convertit), jours locaux
Europe/Paris normalisés à 24 valeurs (pas horaire) ou 96 (quart-horaire,
depuis le 2025-10-01), jours DST comblés/moyennés sur l'heure 02, jours
incomplets côté API **omis** (le simulateur les marque en erreur pour les
tarifs spot uniquement — c'est le cas du 2025-09-30, jour de la bascule de
granularité, publié tout à `null` par SMARD). À la bascule d'année, ajouter
la balise `<script>` du nouveau fichier dans `index.html` (le script le
signale). Logique pure testée dans `tests/spot-data.test.mjs`.

## Calendriers Tempo / EJP (tempo-update.mjs)

Les jours rouges/blancs Tempo (`scripts/tarifs-lib/calendars/tempo-edf.js`) et
les jours de pointe EJP (`ejp-edf.js`) sont mis à jour depuis l'API officielle
EDF `api-commerce.edf.fr` (celle du site particulier.edf.fr) :

```powershell
node tempo-update.mjs                # incrémental : reprend après la dernière date spéciale connue
node tempo-update.mjs --dry-run      # sans écriture (rapport +ajoutés/-retirés)
node tempo-update.mjs --full         # ré-importe tout l'historique depuis 2020-11-01
node tempo-update.mjs --option TEMPO # un seul calendrier (TEMPO ou EJP)
node tempo-update.mjs --from 2026-01-01 --to 2026-01-31   # fenêtre explicite
```

Particularités : l'API exige deux en-têtes (`application-origine-controlee:
site_RC`, `situation-usage: Jours Effacement`), sinon 400 ; plage limitée à
un an par requête (le script tranche par année) ; les statuts par défaut
(`TEMPO_BLEU`, `NON_EJP`, `HORS_PERIODE_EJP`) et `NON_DEFINI` (jours futurs
pas encore annoncés — la couleur du lendemain tombe vers 11h) ne sont pas
stockés : les calendriers ne listent que les jours spéciaux. Tout statut
inconnu fait échouer le run. Le fichier est re-sérialisé entièrement
(revalidation VM avant écriture, comme le reste du dossier). Après mise à
jour : relire `git diff scripts/tarifs-lib/calendars` puis régénérer les
goldens (`UPDATE_GOLDEN=1 node --test "tests/**/*.test.mjs"`). Le premier
import (2026-07) a été fait en `--full` : il a purgé les erreurs des listes
historiques saisies à la main (16 dates Tempo mistypées « 2020 », doublons,
saison EJP 2025-2026 manquante). Logique pure testée dans
`tests/tempo-data.test.mjs`.

## Calendrier Zenflex (zenflex-update.mjs)

Les jours de sobriété Zen Week-End Flex
(`scripts/tarifs-lib/calendars/zenflex-sobriete.js`) sont mis à jour depuis
l'API OPM d'EDF `particulier.edf.fr/services/rest/opm/getOPMStatut` (aucun
en-tête particulier requis) :

```powershell
node zenflex-update.mjs              # incrémental : reprend après la dernière date connue
node zenflex-update.mjs --dry-run    # sans écriture (rapport +ajoutés/-retirés)
node zenflex-update.mjs --full       # ré-importe tout l'historique API depuis 2023-09-01
node zenflex-update.mjs --from 2026-01-01 --to 2026-01-31   # fenêtre explicite
```

Particularités : l'API se requête **une date à la fois**
(`?dateRelevant=AAAA-MM-JJ`) et répond `{ couleurJourJ, couleurJourJ1 }`
(statut du jour demandé et du lendemain — le script ne requête donc qu'une
date sur deux). Seul `ZENF_PM` (sobriété) est stocké ; `RAS`, `NON_DETERMINE`
(futur / hors saison), `ZENF_BONIF` (jours bonifiés d'hiver) et `ZENF_BONUS`
(jours bonus d'été) sont ignorés — ces deux derniers ne sont pas pricés par
le tarif du repo —, tout autre statut fait échouer le run.
**L'historique API commence à la saison 2023-2024** (les jours de sobriété
connus de 2020-2022 répondent `RAS`) : contrairement à Tempo/EJP, `--full` ne
remplace que la fenêtre re-fetchée et préserve toujours les jours antérieurs
au 2023-09-01 (saisie manuelle d'origine, y compris ses dates douteuses
« 2020/01/xx », invérifiables via l'API). Même workflow qu'au-dessus après un
run : `git diff scripts/tarifs-lib/calendars` puis goldens. Logique pure
testée dans `tests/zenflex-data.test.mjs`.

## Quand une grille change de mise en page

Le parser échoue bruyamment (`ERREUR PARSING`, nombre de tableaux/colonnes inattendu) — il ne patche jamais silencieusement faux. Marche à suivre :

```powershell
node tools/dump-text.mjs --provider <fournisseur>   # re-télécharge et régénère les fixtures
# inspecter fixtures/<fournisseur>/<slug>.txt, adapter parsers/<fournisseur>.mjs
node tools/try-parser.mjs <fournisseur>             # itérer jusqu'à cohérence
node tools/gen-expected.mjs                         # re-snapshotter, relire le diff
npm test
```

## Hors périmètre (v1)

- **Alterna, Gaz de Bordeaux, Enercoop** : `price_url` en HTML, vérification manuelle.
- **Engie** : les fiches descriptives décomposent les prix en fourniture + acheminement (TURPE CU/CU4/MUDT/MU4) + obligations, en €/an — la reconstruction du prix TTC mensuel est trop hasardeuse pour un parser fiable. Le changement de grille reste détecté par SHA-256 (`PARSER MANQUANT`). Par ailleurs deux des trois `price_url` Engie du repo renvoient 404 (tranquillité, happy-heures-vertes) : à rafraîchir dans les fichiers tarifs.
- **Sobry** : le PDF de la grille est un export design (texte **vectorisé en tracés**, zéro item texte pour pdfjs) — parser textuel impossible sans OCR. Le changement de grille reste détecté (`PARSER MANQUANT`, mapping par URL exacte dans `registry.mjs`). Mise à jour manuelle depuis le PDF : `subscriptions[kVA] = (Total_CU4_HTVA + 15 % × Acheminement_HTVA) × 1,20` (table « Abonnement mensuel C5 », grille CU4) et `spotFormula` (composantes p. 2-3 et 9, ×100 pour passer en centimes). `reconcile.mjs` sait déjà comparer `spotFormula` si un parser voit le jour.
- Les nouvelles puissances proposées par un fournisseur (ex. un kVA ajouté au PDF) ne sont pas signalées si le repo ne les modélise pas.
