import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Heart, Zap, Shield, Flame, AlertCircle, Play, RotateCcw, BadgeCheck } from 'lucide-react';
import { cn } from "@/lib/utils";
import DashboardLayout from "@/Layouts/DashboardLayout";
import axios from "axios";

interface GameObject {
  id: number;
  type: 'hazard' | 'safety';
  icon: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
}

const HAZARDS = [
  { icon: '🔌', label: 'Overloaded Plug' },
  { icon: '🚬', label: 'Lit Cigarette' },
  { icon: '🕯️', label: 'Burning Candle' },
  { icon: '🍳', label: 'Grease Fire' },
  { icon: '🧨', label: 'Firecracker' },
];

const SAFETY = [
  { icon: '🚨', label: 'Smoke Alarm' },
  { icon: '🧯', label: 'Extinguisher' },
  { icon: '🪣', label: 'Water Bucket' },
  { icon: '🛡️', label: 'Safety Shield' },
  { icon: '🧤', label: 'Safety Gloves' },
];

const HazardBlitz = () => {
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [items, setItems] = useState<GameObject[]>([]);
  const [smokeOpacity, setSmokeOpacity] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const itemCounterRef = useRef<number>(0);
  
  // Audio setup
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({
    click: null,
    wrong: null,
    win: null,
    failed: null,
    combo: null
  });

  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      audioRefs.current = {
        click: new Audio('/sounds/click.mp3'),
        wrong: new Audio('/sounds/wrong.mp3'),
        win: new Audio('/sounds/win.mp3'),
        failed: new Audio('/sounds/failed.mp3'),
        combo: new Audio('/sounds/combo.mp3')
      };
    }
  }, []);

  const playSound = useCallback((type: 'click' | 'wrong' | 'win' | 'failed' | 'combo') => {
    const s = audioRefs.current[type];
    if (s) {
      s.currentTime = 0;
      s.volume = 0.4;
      s.play().catch(err => console.warn(`Audio play failed for ${type}:`, err));
    }
  }, []);

  // Difficulty parameters
  const baseSpawnInterval = 3000; // Even slower spawn
  const minSpawnInterval = 1000;
  const baseSpeed = 0.5; // Very slow fixed base speed
  const maxSpeed = 1;

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setLives(3);
    setLevel(1);
    setItems([]);
    setSmokeOpacity(0);
    setCombo(0);
    lastSpawnTimeRef.current = performance.now();
  };

  const gameOver = useCallback(() => {
    setGameState('GAMEOVER');
    playSound('failed');
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (score > highScore) setHighScore(score);
  }, [score, highScore, playSound]);

  const victory = useCallback(() => {
    setGameState('VICTORY');
    playSound('win');
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (score > highScore) setHighScore(score);

    // Award Hazard Hero Badge
    axios.post('/api/badges/award', {
      badge_id: 'hazard_hero',
      badge_name: 'Hazard Hero',
      badge_icon: '/hazard_hall.png'
    }).catch(err => console.error("Failed to award badge:", err.response?.data || err.message));
  }, [score, highScore, playSound]);

  const spawnItem = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const isHazard = Math.random() > 0.3; // 70% hazards, 30% safety
    const source = isHazard ? HAZARDS : SAFETY;
    const template = source[Math.floor(Math.random() * source.length)];
    
    // Random entry from bottom or sides
    const side = Math.floor(Math.random() * 3); // 0: Bottom, 1: Left, 2: Right
    let x = 0, y = 0, vx = 0, vy = 0;

    const speedMultiplier = 1 + (level - 1) * 0.1;

    if (side === 0) { // Bottom
      x = Math.random() * (rect.width - 100) + 50;
      y = rect.height + 60;
      vx = (Math.random() - 0.5) * 1.5;
      vy = -(baseSpeed + 3.5) * speedMultiplier; // Fixed vertical speed
    } else if (side === 1) { // Left
      x = -60;
      y = Math.random() * (rect.height * 0.7) + rect.height * 0.2;
      vx = (baseSpeed + 1.2) * speedMultiplier; // Fixed horizontal speed
      vy = -(baseSpeed * 0.5);
    } else { // Right
      x = rect.width + 60;
      y = Math.random() * (rect.height * 0.7) + rect.height * 0.2;
      vx = -(baseSpeed + 1.2) * speedMultiplier; // Fixed horizontal speed
      vy = -(baseSpeed * 0.5);
    }

    const newItem: GameObject = {
      id: itemCounterRef.current++,
      type: isHazard ? 'hazard' : 'safety',
      icon: template.icon,
      label: template.label,
      x,
      y,
      vx,
      vy,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      scale: 1.5 + Math.random() * 0.3, // Significantly larger items
    };

    setItems(prev => [...prev, newItem]);
  }, [level]);

  const updateItems = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    setItems(prev => {
      const next: GameObject[] = [];
      prev.forEach(item => {
        const nextItem = {
          ...item,
          x: item.x + item.vx,
          y: item.y + item.vy,
          vy: item.vy + 0.012, // Ultra-soft Gravity for slow arcs
          rotation: item.rotation + item.rotationSpeed
        };

        // Check if item left the screen
        const isOffScreen = 
          nextItem.y < -100 || 
          nextItem.y > rect.height + 100 || 
          nextItem.x < -100 || 
          nextItem.x > rect.width + 100;

        if (!isOffScreen) {
          next.push(nextItem);
        } else if (item.type === 'hazard' && item.y < rect.height) {
          // Missed hazard!
          setLives(l => {
            const nextL = l - 1;
            if (nextL <= 0) gameOver();
            return nextL;
          });
          setCombo(0);
        }
      });
      return next;
    });
  }, [gameOver]);

  const handleItemClick = (id: number, type: 'hazard' | 'safety') => {
    if (gameState !== 'PLAYING') return;

    if (type === 'hazard') {
      playSound('click');
      // More aggressive multiplier: base 10 + (combo * 5)
      const points = 10 + (combo * 5);
      const nextScore = score + points;
      setScore(nextScore);
      setCombo(c => {
        const nextC = Math.min(c + 1, 10);
        if (nextC > 1) playSound('combo');
        return nextC;
      });
      
      if (nextScore >= 500) {
        victory();
      }
    } else {
      playSound('wrong');
      setLives(l => {
        const nextL = l - 1;
        if (nextL <= 0) gameOver();
        return nextL;
      });
      setCombo(0);
    }

    setItems(prev => prev.filter(item => item.id !== id));
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const gameLoop = (time: number) => {
      const spawnInterval = Math.max(minSpawnInterval, baseSpawnInterval - (level - 1) * 100);
      
      if (time - lastSpawnTimeRef.current > spawnInterval) {
        spawnItem();
        lastSpawnTimeRef.current = time;
      }

      updateItems();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, level, spawnItem, updateItems]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const timer = setInterval(() => {
      setLevel(l => Math.min(l + 1, 10));
      setSmokeOpacity(prev => Math.min(prev + 0.05, 0.6));
    }, 10000);

    return () => clearInterval(timer);
  }, [gameState]);

  return (
    <div className="relative w-full flex-1 flex flex-col py-4 pb-28 sm:pb-4">
      {/* Standardized Back Button - Upper Left */}
      <div className="absolute top-2 left-4 z-[60] flex gap-2">
        <Link 
          href="/kids/challenges" 
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold hover:text-orange-600 dark:hover:text-orange-400 transition-all text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-white/60 dark:border-slate-700/60 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Activities
        </Link>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 pt-12 sm:pt-4 flex-1 flex flex-col">
        <div className="w-full bg-slate-900 rounded-[2.5rem] border-4 border-slate-800 overflow-hidden shadow-2xl relative select-none">
        <Head title="Hazard Blitz - Fire Safety Game" />
        
        {/* ── Game UI Header ── */}
        <div className="absolute top-2 sm:top-0 left-0 right-0 z-50 p-6 flex items-center justify-between pointer-events-none">
          <div className="w-16 sm:w-32 hidden sm:block"></div> {/* Left spacer */}

          {/* Centered Score & Lives */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-8 pointer-events-auto">
             <div className="bg-black/40 backdrop-blur-md px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2 sm:gap-3">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                <div className="flex flex-col">
                   <span className="text-[8px] sm:text-[10px] font-black text-white/50 uppercase leading-none">Score</span>
                   <span className="text-base sm:text-2xl font-black text-yellow-400 leading-none">{score}</span>
                </div>
             </div>

             <div className="bg-black/40 backdrop-blur-md px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2 sm:gap-3">
                <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5 transition-colors", lives <= 1 ? "text-red-500 animate-pulse" : "text-red-400")} fill="currentColor" />
                <div className="flex flex-col">
                   <span className="text-[8px] sm:text-[10px] font-black text-white/50 uppercase leading-none">Lives</span>
                   <span className="text-base sm:text-2xl font-black text-red-400 leading-none">{lives}</span>
                </div>
             </div>
          </div>

          {/* Right Stats */}
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-md px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center">
               <span className="text-[8px] sm:text-[10px] font-black text-white/50 uppercase leading-none">Goal</span>
               <span className="text-sm sm:text-2xl font-black text-emerald-400 leading-none">500</span>
            </div>

            <div className="hidden sm:flex bg-black/40 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 flex-col items-center">
               <span className="text-[10px] font-black text-white/50 uppercase leading-none">Level</span>
               <span className="text-2xl font-black text-blue-400 leading-none">{level}</span>
            </div>
          </div>
        </div>

        {/* ── Game Area ── */}
        <div 
          ref={containerRef}
          className="relative w-full h-[550px] sm:h-[700px] cursor-crosshair overflow-hidden touch-none"
        >
          {/* Smoke Overlay */}
          <motion.div 
            animate={{ opacity: smokeOpacity }}
            className="absolute inset-0 bg-slate-800 pointer-events-none z-40 mix-blend-multiply"
          />
          
          <AnimatePresence>
            {gameState === 'IDLE' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm"
              >
                 <div className="max-w-md w-full max-h-[90%] overflow-y-auto bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-primary p-5 sm:p-8 text-center shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                                      <div className="h-14 w-14 sm:h-20 sm:w-20 bg-primary/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                       <Zap className="h-7 w-7 sm:h-10 sm:w-10 text-primary" fill="currentColor" />
                    </div>
                                      <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-2 sm:mb-4 italic">Hazard <span className="text-primary">Blitz</span></h2>
                    <p className="text-xs sm:text-base text-slate-400 font-bold mb-6 sm:mb-8 leading-tight">
                      Neutralize the fire hazards! Tap the hazards to clear them, but avoid the safety equipment!
                    </p>
                   
                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-900/50 p-4 rounded-2xl border-2 border-primary/20">
                         <span className="text-[10px] font-black text-primary uppercase block mb-2">Neutralize</span>
                         <div className="flex justify-center gap-2 text-2xl">
                            {HAZARDS.slice(0, 3).map(h => h.icon)}
                         </div>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-2xl border-2 border-white/10">
                         <span className="text-[10px] font-black text-white/50 uppercase block mb-2">Avoid</span>
                         <div className="flex justify-center gap-2 text-2xl opacity-50">
                            {SAFETY.slice(0, 3).map(s => s.icon)}
                         </div>
                      </div>
                   </div>

                   <button 
                    onClick={startGame}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-2xl shadow-[0_6px_0_#991b1b] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                   >
                     <Play className="h-6 w-6 fill-current" />
                     Start Blitz
                   </button>
                </div>
              </motion.div>
            )}

            {gameState === 'GAMEOVER' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-red-950/90 backdrop-blur-md"
              >
                <div className="max-w-md w-full bg-slate-900 rounded-[2.5rem] border-4 border-red-500 p-8 text-center shadow-2xl">
                   <div className="h-20 w-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="h-10 w-10 text-red-500" />
                   </div>
                   
                   <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Game Over</h2>
                   <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">Great Training Hero!</p>
                   
                   <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-800 p-4 rounded-2xl border-2 border-white/5">
                         <span className="text-[10px] font-black text-white/30 uppercase block mb-1">Final Score</span>
                         <span className="text-3xl font-black text-yellow-400">{score}</span>
                      </div>
                      <div className="bg-slate-800 p-4 rounded-2xl border-2 border-white/5">
                         <span className="text-[10px] font-black text-white/30 uppercase block mb-1">High Score</span>
                         <span className="text-3xl font-black text-white">{highScore}</span>
                      </div>
                   </div>

                   <button 
                    onClick={startGame}
                    className="w-full bg-white hover:bg-slate-100 text-red-600 font-black py-5 rounded-2xl shadow-[0_6px_0_#cbd5e1] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                   >
                     <RotateCcw className="h-6 w-6" />
                     Try Again
                   </button>
                </div>
              </motion.div>
            )}

            {gameState === 'VICTORY' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-blue-950/90 backdrop-blur-md"
              >
                <div className="max-w-md w-full bg-slate-900 rounded-[2.5rem] border-4 border-blue-500 p-8 text-center shadow-2xl">
                   <div className="h-20 w-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Trophy className="h-10 w-10 text-blue-400" />
                   </div>
                   
                   <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Victory!</h2>
                   <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm text-blue-400">Mission Accomplished!</p>
                   
                   <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800 p-4 rounded-2xl border-2 border-white/5">
                       <span className="text-[10px] font-black text-white/30 uppercase block mb-1">Final Score</span>
                       <span className="text-3xl font-black text-yellow-400">{score}</span>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-2xl border-2 border-white/5">
                       <span className="text-[10px] font-black text-white/30 uppercase block mb-1">Status</span>
                       <span className="text-2xl font-black text-white uppercase italic">Elite</span>
                    </div>
                 </div>

                 {/* Badge Earned Alert */}
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ delay: 0.5 }}
                   className="bg-emerald-500/10 border-2 border-emerald-500/20 p-4 rounded-2xl mb-8 flex items-center gap-4 text-left"
                 >
                    <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
                      <img src="/hazard_hall.png" alt="Hazard Hero Badge" className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                       <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs uppercase tracking-widest">
                          <BadgeCheck className="h-3 w-3" />
                          Badge Obtained
                       </div>
                       <div className="text-white font-black text-lg leading-tight">Hazard Hero</div>
                    </div>
                 </motion.div>

                   <div className="flex flex-col gap-3">
                     <button 
                      onClick={startGame}
                      className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-5 rounded-2xl shadow-[0_6px_0_#1e40af] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                     >
                       <RotateCcw className="h-6 w-6" />
                       Play Again
                     </button>
                     <Link 
                      href="/kids/challenges"
                      className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-sm"
                     >
                       Back to Activities
                     </Link>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Combo Multiplier UI */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div 
                key={combo}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
              >
                 <div className="bg-yellow-400 text-red-700 font-black px-6 py-2 rounded-full shadow-2xl text-2xl uppercase italic tracking-tighter">
                    {combo}X COMBO!
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Level Up UI */}
          <AnimatePresence>
            {gameState === 'PLAYING' && (
              <motion.div 
                key={level}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
              >
                <div className="bg-blue-600/90 text-white font-black px-4 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-2xl text-[10px] sm:text-sm uppercase tracking-widest border-2 border-white/20">
                    Difficulty Level {level}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Objects */}
          {items.map(item => (
            <div 
              key={item.id}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                cursor: 'pointer',
                zIndex: 30,
                // Larger Hitbox for Mobile
                padding: '1.5rem', 
              }}
              onClick={() => handleItemClick(item.id, item.type)}
              className="transition-transform duration-75 active:scale-95 group"
            >
              <div className="relative">
                <span className="text-5xl sm:text-7xl filter drop-shadow-lg block pointer-events-none">
                  {item.icon}
                </span>
                
                {/* Target Indicator */}
                <div className="absolute inset-0 rounded-full border-4 border-white/0 group-hover:border-white/20 transition-all scale-150" />
              </div>
            </div>
          ))}

          {/* Background Visuals */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#0f172a_100%)] opacity-50" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)] z-20" />
        </div>
      </div>
    </div>
  </div>
  );
};

HazardBlitz.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;

export default HazardBlitz;
