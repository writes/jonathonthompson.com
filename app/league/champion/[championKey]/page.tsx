'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChampionViewer from '@/components/champion-viewer';
import ChampionAbilities from '@/components/champion-abilities';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ChampionDetailsProps {
  params: {
    championKey: string;
  };
}

// Mock champion data - in production, fetch from API
const getChampionData = (championKey: string) => {
  return {
    id: championKey,
    key: championKey,
    name: championKey.charAt(0).toUpperCase() + championKey.slice(1),
    title: "The Champion",
    lore: "A powerful champion with unique abilities...",
    info: {
      attack: 8,
      defense: 4,
      magic: 6,
      difficulty: 7
    },
    stats: {
      hp: 580,
      hpperlevel: 95,
      mp: 350,
      mpperlevel: 60,
      movespeed: 340,
      armor: 35,
      armorperlevel: 3.5,
      spellblock: 32,
      spellblockperlevel: 1.25,
      attackrange: 550,
      hpregen: 8,
      hpregenperlevel: 0.8,
      mpregen: 8,
      mpregenperlevel: 0.8,
      crit: 0,
      critperlevel: 0,
      attackdamage: 60,
      attackdamageperlevel: 3,
      attackspeedperlevel: 2.5,
      attackspeed: 0.625
    },
    abilities: {
      passive: {
        id: "passive",
        name: "Illumination",
        description: "Lux's damaging spells charge the target with energy for 6 seconds. Lux's next attack ignites the energy, dealing bonus magic damage.",
        image: `${championKey}P.png`,
        cooldown: [],
        cost: []
      },
      Q: {
        id: "Q",
        name: "Light Binding",
        description: "Lux releases a sphere of light that binds and deals damage to up to two enemy units.",
        image: `${championKey}Q.png`,
        cooldown: [11, 10.5, 10, 9.5, 9],
        cost: [50, 55, 60, 65, 70],
        range: 1175
      },
      W: {
        id: "W",
        name: "Prismatic Barrier",
        description: "Lux throws her wand and bends the light around any friendly target it touches, protecting them from enemy damage.",
        image: `${championKey}W.png`,
        cooldown: [14, 13, 12, 11, 10],
        cost: [60, 65, 70, 75, 80],
        range: 1075
      },
      E: {
        id: "E",
        name: "Lucent Singularity",
        description: "Fires an anomaly of twisted light to an area, slowing nearby enemies. Lux can detonate it to damage enemies in the area of effect.",
        image: `${championKey}E.png`,
        cooldown: [10, 9.5, 9, 8.5, 8],
        cost: [70, 85, 100, 115, 130],
        range: 1100
      },
      R: {
        id: "R",
        name: "Final Spark",
        description: "After gathering energy, Lux fires a beam of light that deals damage to all targets in the area.",
        image: `${championKey}R.png`,
        cooldown: [80, 60, 40],
        cost: [100, 100, 100],
        range: 3400
      }
    },
    skins: [
      { id: 0, name: "Classic" },
      { id: 1, name: "Spellthief" },
      { id: 2, name: "Commando" },
      { id: 3, name: "Imperial" },
      { id: 4, name: "Steel Legion" },
      { id: 7, name: "Star Guardian" },
      { id: 8, name: "Pajama Guardian" },
      { id: 9, name: "Battle Academia" },
      { id: 14, name: "Dark Cosmic" },
      { id: 15, name: "Cosmic" },
      { id: 16, name: "Prestige Battle Academia" },
      { id: 17, name: "Space Groove" },
      { id: 18, name: "Prestige Porcelain" }
    ],
    tips: {
      ally: [
        "Shield allies with Prismatic Barrier as they engage enemies.",
        "Use Lucent Singularity to scout brush and prevent enemies from escaping.",
        "Final Spark is a great deterrent and can be used to secure objectives from a distance."
      ],
      enemy: [
        "Lux has strong zone control abilities. Try to spread out to minimize her effectiveness.",
        "Her shield only protects against a limited amount of damage, so burst damage is effective.",
        "When Lux uses Final Spark, she's locked in place. Use this opportunity to reposition."
      ]
    }
  };
};

export default function ChampionDetailsPage({ params }: ChampionDetailsProps) {
  const [selectedSkin, setSelectedSkin] = useState(0);
  const [champion, setChampion] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Simulate API call
    const data = getChampionData(params.championKey);
    setChampion(data);
  }, [params.championKey]);

  if (!champion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading champion data...</p>
        </div>
      </div>
    );
  }

  const getStatBarWidth = (value: number, max: number) => {
    return (value / max) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.id}_${selectedSkin}.jpg`}
            alt={champion.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <button
              onClick={() => router.back()}
              className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-5xl font-bold text-white mb-2">{champion.name}</h1>
            <p className="text-xl text-gray-300">{champion.title}</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - 3D Viewer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ChampionViewer
              championKey={champion.key}
              championName={champion.name}
              skinId={selectedSkin}
              onSkinChange={setSelectedSkin}
            />
          </motion.div>

          {/* Right Column - Stats & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Champion Info */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Champion Info</h3>
              <p className="text-gray-300 mb-6">{champion.lore}</p>
              
              {/* Role Stats */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(champion.info).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-400 capitalize">{key}</span>
                      <span className="text-sm text-white">{value}/10</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getStatBarWidth(value as number, 10)}%` }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Base Stats */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Base Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">Health</span>
                  <span className="text-sm font-medium text-white">{champion.stats.hp} (+{champion.stats.hpperlevel})</span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">Mana</span>
                  <span className="text-sm font-medium text-blue-400">{champion.stats.mp} (+{champion.stats.mpperlevel})</span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">Attack Damage</span>
                  <span className="text-sm font-medium text-orange-400">{champion.stats.attackdamage} (+{champion.stats.attackdamageperlevel})</span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">Attack Speed</span>
                  <span className="text-sm font-medium text-white">{champion.stats.attackspeed}</span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">Armor</span>
                  <span className="text-sm font-medium text-yellow-400">{champion.stats.armor} (+{champion.stats.armorperlevel})</span>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <span className="text-xs text-gray-400 block mb-1">Magic Resist</span>
                  <span className="text-sm font-medium text-purple-400">{champion.stats.spellblock} (+{champion.stats.spellblockperlevel})</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Abilities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <ChampionAbilities
            championKey={champion.key}
            abilities={champion.abilities}
          />
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-green-500/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
            <h3 className="text-xl font-bold text-green-400 mb-4">Playing as {champion.name}</h3>
            <ul className="space-y-2">
              {champion.tips.ally.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-gray-300 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
            <h3 className="text-xl font-bold text-red-400 mb-4">Playing against {champion.name}</h3>
            <ul className="space-y-2">
              {champion.tips.enemy.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-gray-300 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}