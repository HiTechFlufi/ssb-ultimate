// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts
/*
If you want to add custom formats, create a file in this folder named: "custom-formats.ts"

Paste the following code into the file and add your desired formats and their sections between the brackets:
--------------------------------------------------------------------------------
// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts

export const Formats: FormatList = [
];
--------------------------------------------------------------------------------

If you specify a section that already exists, your format will be added to the bottom of that section.
New sections will be added to the bottom of the specified column.
The column value will be ignored for repeat sections.
*/

export const Formats: import('../sim/dex-formats').FormatList = [

	{
		section: "SSB Ultimate",
	},
	{
		name: "[Gen 9] SSB Ultimate",
		desc: "SSB Ultimate is the fifth release of a personalized metagame that is a glorified version of Super Staff Brothers with many unique characters created by a team of creators.",
		mod: 'gen9ssb',
		debug: true,
		team: 'randomStaffBros',
		bestOfDefault: true,
		ruleset: ['HP Percentage Mod', 'Cancel Mod', 'Sleep Clause Mod', 'Terastal Clause'],
		onBegin() {
			// TODO look into making an event to put this right after turn|1
			// https://discordapp.com/channels/630837856075513856/630845310033330206/716126469528485909
			// Requires client change
			this.add(`raw|<div class='broadcast-green'><b>Wondering what all these custom moves, abilities, and items do?<br />Check out the <a href="https://www.smogon.com/articles/super-staff-bros-ultimate" target="_blank">Super Staff Bros: Ultimate Guide</a> or use /ssb to find out!</b></div>`);
			if (this.ruleTable.has('dynamaxclause')) {
				// Old joke format we're bringing back
				this.add('message', 'Fox only');
				this.add('message', 'No items');
				this.add('message', 'Final Destination');
				return;
			} else if (this.ruleTable.has('zmoveclause')) {
				// Old joke format we're bringing back
				this.add('message', 'April Fool\'s Day');
				return;
			}

			this.add('message', 'EVERYONE IS HERE!');
			this.add('message', 'FIGHT!');
		},
		onSwitchInPriority: 100,
		onSwitchIn(pokemon) {
			let name: string = this.toID(pokemon.illusion ? pokemon.illusion.name : pokemon.name);
			if (this.dex.species.get(name).exists || this.dex.moves.get(name).exists ||
				this.dex.abilities.get(name).exists || name === 'blitz') {
				// Certain pokemon have volatiles named after their id
				// To prevent overwriting those, and to prevent accidentally leaking
				// that a pokemon is on a team through the onStart even triggering
				// at the start of a match, users with pokemon names will need their
				// statuses to end in "user".
				name = `${name}user`;
			}
			// Add the mon's status effect to it as a volatile.
			const status = this.dex.conditions.get(name);
			if (status?.exists) {
				pokemon.addVolatile(name, pokemon);
			}
			if ((pokemon.illusion || pokemon).getTypes(true, true).join('/') !==
				this.dex.forGen(9).species.get((pokemon.illusion || pokemon).species.name).types.join('/') &&
				!pokemon.terastallized) {
				this.add('-start', pokemon, 'typechange', (pokemon.illusion || pokemon).getTypes(true).join('/'), '[silent]');
			}
		},
		onResidual() {
			for (const pokemon of this.getAllPokemon()) {
				if (pokemon.hp <= 0 && !pokemon.fainted) pokemon.hp = 0;
				if (pokemon.getAbility().id === 'autorepair') {
					if (pokemon.abilityState.disabled || pokemon.fainted || pokemon.isActive) continue;
					if (pokemon.hp > pokemon.maxhp) pokemon.hp = pokemon.maxhp;
					const health = pokemon.maxhp * 0.15;
					pokemon.hp += health;
					this.add('-heal', pokemon, pokemon.getHealth);
				}
			}
		},
		onUpdate() {
			for (const pokemon of this.getAllPokemon()) {
				const ability = pokemon.getAbility().id;
				if (ability === 'autorepair' && !pokemon.hp && !pokemon.abilityState.reviveInit && !pokemon.abilityState.disabled) {
					pokemon.abilityState.reviveInit = true;
					pokemon.abilityState.fntTurn = this.turn;
				}
				if (ability === 'autorepair' && !pokemon.hp && pokemon.abilityState.reviveInit) {
					let turnCount = this.turn - pokemon.abilityState.fntTurn;
					if (turnCount >= 6) {
						pokemon.fainted = false;
						pokemon.faintQueued = false;
						pokemon.subFainted = false;
						pokemon.status = '';
						pokemon.hp = 1;
						pokemon.sethp(1);
						pokemon.side.pokemonLeft++;
						pokemon.abilityState.reviveInit = false;
						pokemon.abilityState.disabled = true;
						this.add('-message', `${pokemon.name}'s ${pokemon.getAbility().name} activated!`);
						this.add('-message', `${pokemon.name} is back in the fight!`);
					}
				}
			}
		},
	},
];
