// Resolve a player token without changing their actual card level or branch.
export function resolveEvoIcon(catalog, progression, studio, level, branch) {
  if (!Number.isInteger(level) || level < 1 || level > 10) throw new Error('Evo level must be 1–10');
  if (!progression.studios[studio]) throw new Error('Unknown Evo studio');
  if (!progression.branchesByLevel[String(level)].includes(branch)) throw new Error('Branch unavailable at this level');
  const card = catalog.cards.find(c => c.studio === studio && c.levels.includes(level));
  if (!card) throw new Error('Missing Evo icon');
  const badge = branch === 'BASE' ? null : progression.studios[studio][branch];
  return {level, branch, studio, tier: card.tier, icon: card.files['128'], badge: badge ? `assets/evo-icons/${badge.badge}` : null, branchName: badge ? badge.name : 'Base'};
}
