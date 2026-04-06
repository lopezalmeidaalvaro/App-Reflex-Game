import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Crosshair, Grid3x3, Flame, Brain, AudioLines, Move } from 'lucide-react';
import { useRecords } from './hooks/useRecords';
import { useStreak } from './hooks/useStreak';
import ReactionGame from './components/ReactionGame';
import AimGame from './components/AimGame';
import SequenceGame from './components/SequenceGame';
import StatsModal from './components/StatsModal';
// Placeholders for Pro Modes (to be implemented next)
import ChimpTest from './components/ChimpTest';
import AudioReaction from './components/AudioReaction';
import TrackingAim from './components/TrackingAim';

// Umbrales de medallas (Oro, Plata, Bronce) en ms
const MEDAL_THRESHOLDS = {
  reaction: { g: 200, s: 250, b: 300 },
  aim: { g: 4500, s: 5500, b: 6500 }, // best time (10 clicks)
  sequence: { g: 3000, s: 4000, b: 6000 },
  chimp: { g: 4000, s: 6000, b: 8000 },
  audio: { g: 150, s: 200, b: 250 },
  tracking: { g: 5000, s: 6000, b: 7500 }
};

const GAME_MODES = [
  { id: 'reaction', type: 'classic', title: 'Visual Reaction', description: 'Wait for green. Click.', icon: <Zap size={36} />, colorClass: 'text-emerald-400', bgGlow: 'bg-emerald-400', component: ReactionGame },
  { id: 'aim', type: 'classic', title: 'Aim Trainer', description: 'Eliminate 10 random targets.', icon: <Crosshair size={36} />, colorClass: 'text-cyan-400', bgGlow: 'bg-cyan-400', component: AimGame },
  { id: 'sequence', type: 'classic', title: 'Sequence Memory', description: 'Click 1-9 in exact order.', icon: <Grid3x3 size={36} />, colorClass: 'text-fuchsia-400', bgGlow: 'bg-fuchsia-400', component: SequenceGame },

  { id: 'chimp', type: 'pro', title: 'Chimp Test', description: 'Memorize locations and click them.', icon: <Brain size={36} />, colorClass: 'text-orange-400', bgGlow: 'bg-orange-400', component: ChimpTest },
  { id: 'audio', type: 'pro', title: 'Audio Reaction', description: 'React to the sound.', icon: <AudioLines size={36} />, colorClass: 'text-indigo-400', bgGlow: 'bg-indigo-400', component: AudioReaction },
  { id: 'tracking', type: 'pro', title: 'Tracking', description: 'Track moving targets.', icon: <Move size={36} />, colorClass: 'text-rose-400', bgGlow: 'bg-rose-400', component: TrackingAim }
];

export default function App() {
  const [activeGameId, setActiveGameId] = useState(null);
  const [statsView, setStatsView] = useState(null); // stores gameId if modal is open
  const { records, saveRecord } = useRecords();
  const streak = useStreak();

  const handleSaveRecord = (gameId, score) => {
    saveRecord(gameId, score);
  };

  const getMedal = (gameId, score) => {
    if (!score) return null;
    const t = MEDAL_THRESHOLDS[gameId];
    if (score <= t.g) return '🥇';
    if (score <= t.s) return '🥈';
    if (score <= t.b) return '🥉';
    return null;
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center bg-slate-900 text-white overflow-hidden relative touch-none select-none">
      <AnimatePresence mode="wait">
        {!activeGameId ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col pt-8 pb-12 max-w-6xl px-4 z-10 overflow-y-auto"
          >
            {/* Header & Streak */}
            <div className="flex justify-between items-center w-full mb-8 pointer-events-none">
              <div className="text-xl font-black italic tracking-tighter text-slate-500">v2.0</div>
              <div className="flex items-center gap-2 bg-slate-800/80 border border-orange-500/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.15)] pointer-events-auto">
                <Flame size={20} className="text-orange-500 fill-orange-500" />
                <span className="font-bold text-orange-400">{streak} Day{streak > 1 ? 's' : ''} Streak</span>
              </div>
            </div>

            <div className="text-center mb-12 relative animate-pulse-slow">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2">
                REFLEX<span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">ARENA</span>
              </h1>
              <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-xs md:text-sm">
                Neuro-Training & Analytics
              </p>
            </div>

            {/* Core Games Section */}
            <h3 className="text-slate-500 uppercase tracking-widest font-black text-sm mb-4 px-2">Classic Modes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
              {GAME_MODES.filter(g => g.type === 'classic').map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  record={records[game.id]?.best}
                  medal={getMedal(game.id, records[game.id]?.best)}
                  onPlay={() => setActiveGameId(game.id)}
                  onStats={() => setStatsView(game.id)}
                />
              ))}
            </div>

            {/* Pro Games Section */}
            <h3 className="text-slate-500 uppercase tracking-widest font-black text-sm mb-4 px-2">Pro Training</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {GAME_MODES.filter(g => g.type === 'pro').map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  record={records[game.id]?.best}
                  medal={getMedal(game.id, records[game.id]?.best)}
                  onPlay={() => setActiveGameId(game.id)}
                  onStats={() => setStatsView(game.id)}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <div key="game-view" className="absolute inset-0 w-full h-full z-20">
            {GAME_MODES.map(mode => {
              if (mode.id === activeGameId) {
                const GameComponent = mode.component;
                return (
                  <GameComponent
                    key={mode.id}
                    onBack={() => setActiveGameId(null)}
                    onSaveRecord={(score) => handleSaveRecord(mode.id, score)}
                  />
                );
              }
              return null;
            })}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statsView && (
          <StatsModal
            gameId={statsView}
            gameTitle={GAME_MODES.find(g => g.id === statsView).title}
            history={records[statsView]?.history || []}
            onClose={() => setStatsView(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GameCard({ game, record, medal, onPlay, onStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-slate-800/80 p-6 rounded-[2rem] border border-slate-700 hover:border-slate-500 flex flex-col relative group shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all"
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${game.bgGlow} opacity-20 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`${game.colorClass} p-3 rounded-2xl bg-slate-900 shadow-inner group-hover:scale-110 transition-transform`}>
          {game.icon}
        </div>
        {medal && <div className="text-3xl drop-shadow-md">{medal}</div>}
      </div>

      <h2 className="text-xl font-black mb-2 tracking-wide text-left">{game.title}</h2>
      <p className="text-slate-400 text-xs mb-6 font-medium text-left leading-relaxed flex-grow">
        {game.description}
      </p>

      <div className="border-t border-slate-700/50 w-full pt-4 flex flex-col mb-4">
        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1 text-left">Best Record</span>
        <span className="font-mono text-xl font-bold text-white text-left tracking-wider">
          {record ? `${Math.round(record)} ms` : '---'}
        </span>
      </div>

      <div className="flex gap-2 w-full mt-auto">
        <button
          onClick={onPlay}
          className={`${game.bgGlow} flex-grow py-3 rounded-xl font-black text-slate-900 uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_15px_currentColor] border-2 border-transparent`}
        >
          Play
        </button>
        <button
          onClick={onStats}
          className={`flex-grow-0 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all text-slate-400 hover:${game.colorClass}`}
          title="View Stats"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
        </button>
      </div>
    </motion.div>
  );
}
