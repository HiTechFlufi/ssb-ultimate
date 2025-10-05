import { ssbSets } from "./random-teams";
import { changeSet, getName, enemyStaff } from './scripts';
import type { ModdedConditionData } from "../../../sim/dex-conditions";

export const Conditions: { [id: IDEntry]: ModdedConditionData & { innateName?: string } } = {
	forcefield: {
		onStart(pokemon) {
			this.add('-anim', pokemon, 'Aqua Ring', pokemon);
			this.add('-message', `${pokemon.name} is protected by a forcefield!`);
			this.effectState.hp = pokemon.maxhp / 3;
		},
		onDamage(damage, target, source, effect) {
			if (effect?.effectType !== 'Move' || source === target) return;
			if (this.effectState.hp > 0) {
				this.add('-anim', target, 'Aqua Ring', target);
				if (this.effectState.hp >= damage) {
					this.effectState.hp -= damage;
					if (this.effectState.hp <= 0) {
						this.effectState.hp = 0;
						this.add('-anim', target, 'Cosmic Power', target);
						this.add('-message', `${target.name}'s forcefield shattered!`);
					}
					return 0;
				} else {
					let bleed = damage - this.effectState.hp;
					this.effectState.hp = 0;
					this.add('-anim', target, 'Cosmic Power', target);
					this.add('-message', `${target.name}'s forcefield shattered!`);
					return bleed;
				}
			}
			if (this.effectState.hp <= 0) target.removeVolatile('forcefield');
		},
	},
};
