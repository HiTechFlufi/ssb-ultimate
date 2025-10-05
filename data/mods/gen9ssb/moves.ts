import { ssbSets } from "./random-teams";
import { PSEUDO_WEATHERS, changeSet, getName } from "./scripts";
import { Teams } from '../../../sim/teams';

export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	// Shifu Robot
	turbocharge: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Protects + HP becomes 1; x1.1 Spe/x1.2 Spa per 10% HP lost.",
		desc: "Protects the user from attacks this turn and the user's HP becomes 1. For each 10% max HP lost, the user has x1.1 Speed and x1.2 Special Attack, and this effect lasts one turn for each 10% max HP lost. Can't be used twice.",
		name: "Turbocharge",
		gen: 9,
		pp: 1,
		priority: 6,
		flags: { metronome: 1, },
		onTryMove() {
			this.attrLastMove('[still]');
		},
		onPrepareHit(target, source) {
			this.add('-anim', source, 'Agility', source);
			this.add('-anim', source, 'Discharge', source);
		},
		onHit(pokemon) {
			pokemon.addVolatile('protect');
		},
		condition: {
			onStart(pokemon) {
				pokemon.abilityState.disabled = true;
				// e.g if used when at 243/301 HP, loss is 242, which when divided by max HP, says
				// 243/301 is 80.3% HP lost. Multiplying by 10 moves back the decimal one place and
				// tells the formula that the user has 8 stacks of turbocharge; one for each 10% out of the 80%
				let loss = pokemon.hp - 1;
				this.damage(loss, pokemon, this.dex.getActiveMove('turbocharge'));
				this.effectState.charges = Math.floor((loss/pokemon.maxhp)*10)
			},
			onModifySpe(spe, pokemon) {
				// Should be +10% (x1.1) for each charge
				return this.chainModify(1+(0.1*this.effectState.charges));
			},
			onModifySpAPriority: 5,
			onModifySpA(spa, pokemon) {
				// Should be +20% (x1.2) for each charge
				return this.chainModify(1+(0.2*this.effectState.charges));
			},
			onTryHeal(damage, target, source, effect) {
				return false;
			},
			onResidual(pokemon) {
				if (this.effectState.charges) {
					this.add('-anim', pokemon, 'Discharge', pokemon);
					this.add('-message', `${pokemon.name} is turbocharged!`);
					this.effectState.charges--;
				} else {
					pokemon.removeVolatile('turbocharged');
				}
			},
			onEnd(pokemon) {
				this.add('-message', `${pokemon.name}'s turbocharge wore off!`);
			},
		},
		secondary: null,
		volatileStatus: 'turbocharge',
		target: "self",
		type: "Electric",
	},
};
