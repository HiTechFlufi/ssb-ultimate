import RandomTeams from '../../random-battles/gen9/teams';

export interface SSBSet {
	species: string;
	ability: string | string[];
	item: string | string[];
	gender: GenderName | GenderName[];
	moves: (string | string[])[];
	signatureMove: string;
	evs?: { hp?: number, atk?: number, def?: number, spa?: number, spd?: number, spe?: number };
	ivs?: { hp?: number, atk?: number, def?: number, spa?: number, spd?: number, spe?: number };
	nature?: string | string[];
	shiny?: number | boolean;
	level?: number;
	happiness?: number;
	skip?: string;
	teraType?: string | string[];
}
interface SSBSets { [k: string]: SSBSet }

export const ssbSets: SSBSets = {
	'Shifu Robot': {
		species: 'Iron Thorns', ability: 'Auto-Repair', item: 'Absorptive Shell', gender: 'N',
		moves: ['Techno Blast', 'Flash Cannon', 'Explosion'],
		signatureMove: 'Turbocharge',
		evs: {hp: 128, spa: 128, spe: 252}, nature: 'Hasty',
	},
	'Journeyman': {
		species: 'Stonjourner', ability: 'Blistering Endurance', item: 'Explorer\'s Scope', gender: 'M',
		moves: ['Mighty Cleave', 'Earthquake', 'Stealth Rock'],
		signatureMove: 
	},
};

const afdSSBSets: SSBSets = {
	'Fox': {
		species: 'Fennekin', ability: 'No Ability', item: '', gender: '',
		moves: [],
		signatureMove: 'Super Metronome',
	},
};

export class RandomStaffBrosTeams extends RandomTeams {
	randomStaffBrosTeam(options: { inBattle?: boolean } = {}) {
		this.enforceNoDirectCustomBanlistChanges();

		const team: PokemonSet[] = [];
		const debug: string[] = []; // Set this to a list of SSB sets to override the normal pool for debugging.
		const ruleTable = this.dex.formats.getRuleTable(this.format);
		const meme = ruleTable.has('dynamaxclause') && !debug.length;
		const afd = !ruleTable.has('dynamaxclause') && ruleTable.has('zmoveclause') && !debug.length;
		const monotype = this.forceMonotype || (ruleTable.has('sametypeclause') ?
			this.sample(this.dex.types.names().filter(x => x !== 'Stellar')) : false);

		let pool = meme ? Object.keys(afdSSBSets) : Object.keys(ssbSets);
		if (debug.length) {
			while (debug.length < 6) {
				const staff = this.sampleNoReplace(pool);
				if (debug.includes(staff) || ssbSets[staff].skip) continue;
				debug.push(staff);
			}
			pool = debug;
		}
		if (monotype && !debug.length && !afd && !meme) {
			pool = pool.filter(x => this.dex.species.get(ssbSets[x].species).types.includes(monotype));
		}
		if (global.Config?.disabledssbsets?.length) {
			pool = pool.filter(x => !global.Config.disabledssbsets.includes(this.dex.toID(x)));
		}
		const typePool: { [k: string]: number } = {};
		let depth = 0;
		while (pool.length && team.length < this.maxTeamSize) {
			if (depth >= 200) throw new Error(`Infinite loop in Super Staff Bros team generation.`);
			depth++;
			const name = meme ? this.sample(pool) : afd ? 'April' : this.sampleNoReplace(pool);
			const ssbSet: SSBSet = meme ? this.dex.deepClone(afdSSBSets[name]) : this.dex.deepClone(ssbSets[name]);
			if (ssbSet.skip) continue;

			// Enforce typing limits
			if (!(debug.length || monotype || meme || afd)) { // Type limits are ignored for debugging, monotype, or memes.
				const species = this.dex.species.get(ssbSet.species);

				const weaknesses = [];
				for (const type of this.dex.types.names()) {
					const typeMod = this.dex.getEffectiveness(type, species.types);
					if (typeMod > 0) weaknesses.push(type);
				}
				let rejected = false;
				for (const type of weaknesses) {
					if (typePool[type] === undefined) typePool[type] = 0;
					if (typePool[type] >= 3) {
						// Reject
						rejected = true;
						break;
					}
				}
				if (ssbSet.ability === 'Wonder Guard') {
					if (!typePool['wonderguard']) {
						typePool['wonderguard'] = 1;
					} else {
						rejected = true;
					}
				}
				if (rejected) continue;
				// Update type counts
				for (const type of weaknesses) {
					typePool[type]++;
				}
			}

			let teraType: string | undefined;
			if (ssbSet.teraType) {
				teraType = ssbSet.teraType === 'Any' ?
					this.sample(this.dex.types.names()) :
					this.sampleIfArray(ssbSet.teraType);
			}
			const moves: string[] = [];
			while (moves.length < 3 && ssbSet.moves.length > 0) {
				let move = this.sampleNoReplace(ssbSet.moves);
				if (Array.isArray(move)) move = this.sampleNoReplace(move);
				moves.push(this.dex.moves.get(move).name);
			}
			moves.push(this.dex.moves.get(ssbSet.signatureMove).name);
			const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...ssbSet.ivs };
			if (!moves.map(x => this.dex.moves.get(x)).some(x => x.category === 'Physical')) {
				ivs.atk = 0;
			}

			const set: PokemonSet = {
				name,
				species: ssbSet.species,
				item: this.sampleIfArray(ssbSet.item),
				ability: this.sampleIfArray(ssbSet.ability),
				moves,
				nature: ssbSet.nature ? Array.isArray(ssbSet.nature) ? this.sampleNoReplace(ssbSet.nature) : ssbSet.nature : 'Serious',
				gender: ssbSet.gender ? this.sampleIfArray(ssbSet.gender) : this.sample(['M', 'F', 'N']),
				evs: ssbSet.evs ? { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...ssbSet.evs } :
				{ hp: 84, atk: 84, def: 84, spa: 84, spd: 84, spe: 84 },
				ivs,
				level: this.adjustLevel || ssbSet.level || 100,
				happiness: typeof ssbSet.happiness === 'number' ? ssbSet.happiness : 255,
				shiny: typeof ssbSet.shiny === 'number' ? this.randomChance(1, ssbSet.shiny) : !!ssbSet.shiny,
			};

			// Any set specific tweaks occur here.
			if (set.name === "Felucia") {
				const cmIndex = set.moves.indexOf("Calm Mind");
				if (cmIndex >= 0 && set.moves.includes("Night Shade")) {
					set.moves[cmIndex] = this.sample(["Thief", "Toxic"]);
				}
			}
			if (set.name === "Frostyicelad" && set.shiny) {
				const moveIndex = Math.max(set.moves.indexOf('Dire Claw'),
					set.moves.indexOf('Meteor Mash'), set.moves.indexOf('Bitter Malice'));
				if (moveIndex >= 0) {
					set.moves[moveIndex] = 'Fishious Rend';
					teraType = 'Water';
				}
			}

			if (teraType) set.teraType = teraType;

			team.push(set);

			// Team specific tweaks occur here
			// Swap last and second to last sets if last set has Illusion
			if (team.length === this.maxTeamSize && (set.ability === 'Illusion')) {
				team[this.maxTeamSize - 1] = team[this.maxTeamSize - 2];
				team[this.maxTeamSize - 2] = set;
			}
		}
		return team;
	}
}

export default RandomStaffBrosTeams;
