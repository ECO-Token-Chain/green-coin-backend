function calculateReward(weight) {
  // Input 'weight' is expected to be in GRAMS (since we've already converted KG to Grams in the controller call)
  if (weight >= 1 && weight < 10) return 2;
  if (weight >= 10 && weight < 20) return 10;
  if (weight >= 20 && weight < 50) return 20;
  if (weight >= 50 && weight < 100) return 40;
  if (weight >= 100 && weight < 200) return 80;
  if (weight >= 200 && weight <= 300) return 120;

  return 0;
}

module.exports = calculateReward;
