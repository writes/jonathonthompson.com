'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Ability {
  id: string;
  name: string;
  description: string;
  image: string;
  cooldown: number[];
  cost: number[];
  range?: number;
  video?: string;
}

interface ChampionAbilitiesProps {
  championKey: string;
  abilities: {
    passive: Ability;
    Q: Ability;
    W: Ability;
    E: Ability;
    R: Ability;
  };
}

export default function ChampionAbilities({ championKey, abilities }: ChampionAbilitiesProps) {
  const [selectedAbility, setSelectedAbility] = useState<'passive' | 'Q' | 'W' | 'E' | 'R'>('passive');
  
  const abilityKeys = ['passive', 'Q', 'W', 'E', 'R'] as const;
  const abilityLabels = {
    passive: 'P',
    Q: 'Q',
    W: 'W',
    E: 'E',
    R: 'R'
  };

  const currentAbility = abilities[selectedAbility];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-2xl font-bold text-white mb-6">Abilities</h3>
      
      {/* Ability Selector */}
      <div className="flex gap-3 mb-6">
        {abilityKeys.map((key) => (
          <motion.button
            key={key}
            onClick={() => setSelectedAbility(key)}
            className={`
              relative w-16 h-16 rounded-lg overflow-hidden transition-all
              ${selectedAbility === key 
                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' 
                : 'opacity-60 hover:opacity-100'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/spell/${abilities[key].image}`}
              alt={abilities[key].name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-1 right-1 text-xs font-bold text-white">
              {abilityLabels[key]}
            </span>
            {selectedAbility === key && (
              <motion.div
                layoutId="abilitySelector"
                className="absolute inset-0 border-2 border-blue-500"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Ability Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedAbility}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Ability Name and Type */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-xl font-bold text-white">{currentAbility.name}</h4>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                {selectedAbility === 'passive' ? 'Passive' : 
                 selectedAbility === 'R' ? 'Ultimate' : 'Basic Ability'}
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed">{currentAbility.description}</p>
          </div>

          {/* Ability Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentAbility.cooldown.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <span className="text-xs text-gray-400 block mb-1">Cooldown</span>
                <span className="text-sm font-medium text-white">
                  {currentAbility.cooldown.join(' / ')}s
                </span>
              </div>
            )}
            
            {currentAbility.cost.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <span className="text-xs text-gray-400 block mb-1">Cost</span>
                <span className="text-sm font-medium text-blue-400">
                  {currentAbility.cost.join(' / ')} Mana
                </span>
              </div>
            )}
            
            {currentAbility.range && (
              <div className="bg-gray-800/50 rounded-lg p-3">
                <span className="text-xs text-gray-400 block mb-1">Range</span>
                <span className="text-sm font-medium text-white">
                  {currentAbility.range}
                </span>
              </div>
            )}
          </div>

          {/* Video Preview (if available) */}
          {currentAbility.video && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <video
                src={currentAbility.video}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Ability Combo Tips */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
            <h5 className="text-sm font-medium text-blue-400 mb-2">Pro Tip</h5>
            <p className="text-sm text-gray-300">
              {selectedAbility === 'passive' && "Maximize your passive's effectiveness by timing your abilities correctly."}
              {selectedAbility === 'Q' && "Use Q to poke enemies and farm minions from a safe distance."}
              {selectedAbility === 'W' && "W can be used both offensively and defensively. Time it wisely!"}
              {selectedAbility === 'E' && "E is great for engaging or escaping. Save it for crucial moments."}
              {selectedAbility === 'R' && "Your ultimate can turn team fights. Coordinate with your team for maximum impact."}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Ability Level Progression */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <h5 className="text-sm font-medium text-gray-400 mb-3">Recommended Skill Order</h5>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((level) => {
            const skill = getSkillAtLevel(level);
            return (
              <div
                key={level}
                className="flex flex-col items-center"
              >
                <span className="text-xs text-gray-500 mb-1">{level}</span>
                <div className={`
                  w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                  ${skill === 'R' ? 'bg-yellow-500/20 text-yellow-400' :
                    skill === selectedAbility ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-800 text-gray-400'}
                `}>
                  {skill}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function to determine skill order (example pattern)
function getSkillAtLevel(level: number): 'Q' | 'W' | 'E' | 'R' {
  const skillOrder = {
    1: 'Q', 2: 'W', 3: 'E', 4: 'Q', 5: 'Q',
    6: 'R', 7: 'Q', 8: 'W', 9: 'Q', 10: 'W',
    11: 'R', 12: 'W', 13: 'W', 14: 'E', 15: 'E',
    16: 'R', 17: 'E', 18: 'E'
  };
  return skillOrder[level as keyof typeof skillOrder] as 'Q' | 'W' | 'E' | 'R';
}