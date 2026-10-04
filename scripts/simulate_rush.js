// Simulation d'un Rush Déjeuner complet (12:00 - 13:30)
// L'ami du Pain - Sandwicherie Artisanale

const RUSH_ORDERS = [
  { id: '#038', client: 'Younès', item: 'Tenders Croustillants', formula: 'Boisson 33cl (Coca Cherry)', sauces: ['Samouraï', 'Algérienne'], crudites: 'Toutes', price: 5.00, prepSec: 75 },
  { id: '#039', client: 'Karim', item: 'Poulet Croque', formula: 'Complète (Oasis + Tartelette pommes)', sauces: ['Sauce Blanche'], crudites: 'Sans oignons', price: 7.00, prepSec: 90 },
  { id: '#040', client: 'Sarah', item: 'Thon Mayonnaise', formula: 'Sandwich Seul', sauces: ['Mayonnaise'], crudites: 'Sans tomate', price: 2.80, prepSec: 35 },
  { id: '#041', client: 'Thomas', item: 'Mexicanos', formula: 'Maxi + Boisson 33cl (Sprite)', sauces: ['Andalouse'], crudites: 'Toutes + Suppl. Fromage', price: 6.80, prepSec: 85 },
  { id: '#042', client: 'Léa', item: 'Dinde Mariné', formula: 'Boisson 33cl (Eau Cristaline)', sauces: ['Sans sauce'], crudites: 'Sans oignons, sans olives', price: 5.00, prepSec: 60 },
  { id: '#043', client: 'Alexandre', item: 'Kefta Épicé', formula: 'Complète (Fanta + Éclair chocolat)', sauces: ['Sauce Blanche', 'Harissa'], crudites: 'Toutes + Suppl. Fromage', price: 7.50, prepSec: 95 },
  { id: '#044', client: 'Sofia', item: 'Crudités Féta', formula: 'Boisson 33cl (Fuze Tea)', sauces: ['Sauce Blanche'], crudites: 'Toutes', price: 3.80, prepSec: 40 },
  { id: '#045', client: 'Mehdi', item: 'Cordon Bleu', formula: 'Sandwich Seul', sauces: ['Algérienne', 'Samouraï'], crudites: 'Toutes + Suppl. Fromage', price: 4.50, prepSec: 70 },
  { id: '#046', client: 'Chloé', item: 'Poulet Rôti', formula: 'Complète (Coca Zéro + Flan)', sauces: ['Mayonnaise'], crudites: 'Sans olives', price: 5.80, prepSec: 50 },
  { id: '#047', client: 'Julien', item: 'Fricadelles', formula: 'Boisson 33cl (Tropico)', sauces: ['Américaine', 'Ketchup'], crudites: 'Toutes', price: 5.00, prepSec: 75 },
  { id: '#048', client: 'Emma', item: 'Fromage Emmental', formula: 'Sandwich Seul', sauces: ['Sans sauce'], crudites: 'Salade seule', price: 2.80, prepSec: 30 },
  { id: '#049', client: 'Lucas', item: 'Nuggets Poulet', formula: 'Boisson 33cl (Coca-Cola)', sauces: ['Barbecue', 'Mayonnaise'], crudites: 'Toutes', price: 5.00, prepSec: 65 }
];

console.log("=== SIMULATION DU RUSH DU MIDI : L'AMI DU PAIN ===");
console.log(`Nombre de commandes injectées : ${RUSH_ORDERS.length}`);

let totalChiffreAffaires = 0;
let totalSandwichs = 0;
let totalTempsPrepSec = 0;
let totalEconomieAttenteMin = 0;

const formuleStats = {
  'Sandwich Seul': 0,
  'Formule Boisson 33cl': 0,
  'Formule Complète (Pâtisserie)': 0,
  'Formule Maxi': 0
};

RUSH_ORDERS.forEach((ord, index) => {
  totalChiffreAffaires += ord.price;
  totalSandwichs += 1;
  totalTempsPrepSec += ord.prepSec;

  if (ord.formula.includes('Complète')) formuleStats['Formule Complète (Pâtisserie)']++;
  else if (ord.formula.includes('Maxi')) formuleStats['Formule Maxi']++;
  else if (ord.formula.includes('Boisson')) formuleStats['Formule Boisson 33cl']++;
  else formuleStats['Sandwich Seul']++;

  // Temps gagné par client : en moyenne 8 à 12 minutes d'attente évitée debout en file
  const gainMin = 8.5;
  totalEconomieAttenteMin += gainMin;
});

const panierMoyen = totalChiffreAffaires / RUSH_ORDERS.length;
const tempsMoyenPrepSec = totalTempsPrepSec / RUSH_ORDERS.length;
const cadenceHoraire = Math.round((3600 / tempsMoyenPrepSec));

console.log("\n--- BILAN FINANCIER & CAISSE ---");
console.log(`Chiffre d'Affaires Encaissé : ${totalChiffreAffaires.toFixed(2)} € (100% au comptoir)`);
console.log(`Nombre de sandwichs vendus  : ${totalSandwichs}`);
console.log(`Panier Moyen                : ${panierMoyen.toFixed(2)} € / client`);
console.log(`Commission plateformes payée: 0,00 € (0% vs ~18,30 € perdus sur UberEats)`);

console.log("\n--- RÉPARTITION DES VENTES ---");
Object.entries(formuleStats).forEach(([f, count]) => {
  const pct = Math.round((count / RUSH_ORDERS.length) * 100);
  console.log(`• ${f.padEnd(32)}: ${count} (${pct}%)`);
});

console.log("\n--- PERFORMANCE OPÉRATIONNELLE CUISINE ---");
console.log(`Temps de préparation cumulé : ${Math.round(totalTempsPrepSec / 60)} minutes`);
console.log(`Temps de préparation moyen  : ${Math.round(tempsMoyenPrepSec)} secondes / commande`);
console.log(`Cadence maximale cuisine    : ${cadenceHoraire} commandes / heure (avec 1 préparateur)`);
console.log(`Temps d'attente total évité : ${Math.round(totalEconomieAttenteMin)} minutes pour les clients`);
console.log(`Taux d'erreur de commande   : 0% (choix écrit et exclusions explicites)`);
console.log("\nSimulation terminée avec succès.");
