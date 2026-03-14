import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sunrise, Sun, Coffee, Moon, X } from 'lucide-react';
import { useTripStore } from '../store/tripStore';
import { useActivities } from '../hooks/useCatalog';
import { activeNiche } from '../config/niche';
import { tc } from '../config/themeClasses';
import { FloatingContinueButton } from '../components/FloatingContinueButton';
import type { Activity } from '../lib/types';

interface RetreatProgramProps { onNext: () => void; onBack: () => void; }

// Time blocks for daily wellness program
const TIME_BLOCKS = [
  { id: 'early-morning', label: 'Early Morning', time: '6:00 \u2013 8:00', icon: Sunrise, tags: ['yoga', 'meditation', 'morning'], color: 'from-amber-100 to-orange-50' },
  { id: 'morning', label: 'Morning Session', time: '9:00 \u2013 12:00', icon: Sun, tags: ['hiking', 'surf', 'outdoor', 'active', 'cycling'], color: 'from-sky-100 to-blue-50' },
  { id: 'afternoon', label: 'Afternoon Session', time: '14:00 \u2013 17:00', icon: Coffee, tags: ['spa', 'hammam', 'massage', 'relaxing', 'wellness', 'beauty'], color: 'from-teal-100 to-emerald-50' },
  { id: 'evening', label: 'Evening Wind-Down', time: '18:00 \u2013 20:00', icon: Moon, tags: ['meditation', 'workshop', 'creative', 'sound', 'evening'], color: 'from-violet-100 to-indigo-50' },
];

function matchesBlock(activity: Activity, blockTags: string[]): boolean {
  const actTags = (activity.tags ?? []).map(t => t.toLowerCase());
  return blockTags.some(bt => actTags.includes(bt));
}

export function RetreatProgram({ onNext, onBack }: RetreatProgramProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedDestination, selectedActivities, addActivity, removeActivity, vibePreferences, travelers, startDate, endDate } = useTripStore();
  const { activities, loading } = useActivities(selectedDestination?.id);
  const [swapBlock, setSwapBlock] = useState<string | null>(null);

  // Guard
  useEffect(() => {
    if (!selectedDestination) navigate('/preferences');
  }, [selectedDestination, navigate]);

  // Calculate retreat days
  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return 3;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
  }, [startDate, endDate]);

  // Group activities by time block
  const blockActivities = useMemo(() => {
    const map: Record<string, Activity[]> = {};
    for (const block of TIME_BLOCKS) {
      map[block.id] = activities.filter(a => matchesBlock(a, block.tags));
    }
    return map;
  }, [activities]);

  // Auto-select best activity per block on first load
  useEffect(() => {
    if (loading || activities.length === 0 || selectedActivities.length > 0) return;
    const autoSelected: Activity[] = [];
    for (const block of TIME_BLOCKS) {
      const candidates = blockActivities[block.id] ?? [];
      // Prefer activities matching vibePreferences
      const preferred = candidates.find(a =>
        vibePreferences.some(v => a.category?.toLowerCase().includes(v.toLowerCase()))
      );
      const pick = preferred || candidates[0];
      if (pick && !autoSelected.some(s => s.id === pick.id)) {
        autoSelected.push({ ...pick, scheduled: { day: 1, slot: block.id as any }, participants: travelers });
      }
    }
    if (autoSelected.length > 0) {
      for (const a of autoSelected) addActivity(a);
    }
  }, [loading, activities.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get selected activity for a block
  const getBlockActivity = (blockId: string): Activity | null => {
    return selectedActivities.find(a => {
      const block = TIME_BLOCKS.find(b => b.id === blockId);
      return block && matchesBlock(a, block.tags);
    }) ?? null;
  };

  // Swap alternatives for a block
  const getAlternatives = (blockId: string): Activity[] => {
    const current = getBlockActivity(blockId);
    const candidates = blockActivities[blockId] ?? [];
    return candidates.filter(a => a.id !== current?.id).slice(0, 4);
  };

  const handleSwap = (blockId: string, activity: Activity) => {
    const current = getBlockActivity(blockId);
    if (current) removeActivity(current.id);
    addActivity({ ...activity, participants: travelers });
    setSwapBlock(null);
  };

  const totalPerDay = selectedActivities.reduce((sum, a) => sum + a.price * (a.participants ?? travelers), 0);
  const totalCost = totalPerDay * dayCount;

  if (!selectedDestination) return null;

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <section className={`rounded-2xl bg-gradient-to-br ${activeNiche.theme.heroGradient} p-6 text-white shadow-md sm:p-8`}>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('wellness.programTitle')}</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70 sm:text-base">{t('wellness.programSubtitle')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            {selectedDestination.name}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            {dayCount} {t('common.days')}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            {travelers} {t('common.travelers')}
          </span>
        </div>
      </section>

      {/* Repeating note */}
      <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
        {t('wellness.repeatsFor', { count: dayCount })}
      </div>

      {/* Daily template */}
      <section className="space-y-4">
        {TIME_BLOCKS.map((block) => {
          const Icon = block.icon;
          const activity = getBlockActivity(block.id);
          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Block header */}
              <div className={`flex items-center gap-3 bg-gradient-to-r ${block.color} px-5 py-3`}>
                <Icon size={18} className="text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-900">{t(`wellness.${block.id === 'early-morning' ? 'earlyMorning' : block.id}`)}</p>
                  <p className="text-xs text-slate-500">{block.time}</p>
                </div>
              </div>

              {/* Activity or empty */}
              {activity ? (
                <div className="flex items-center gap-4 p-4">
                  {activity.mainImageUrl && (
                    <img src={activity.mainImageUrl} alt={activity.title} className="h-16 w-16 rounded-xl object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.duration}h · \u20AC{activity.price}/{t('common.perPerson')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSwapBlock(block.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {t('wellness.swapSession')}
                    </button>
                    <button
                      onClick={() => removeActivity(activity.id)}
                      className="rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-6">
                  <button
                    onClick={() => setSwapBlock(block.id)}
                    className="rounded-xl border-2 border-dashed border-slate-200 px-6 py-3 text-sm text-slate-400 hover:border-slate-300 hover:text-slate-500"
                  >
                    + {t('activities.addToTrip')}
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </section>

      {/* Cost summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">\u20AC{totalPerDay.toFixed(0)}/{t('common.day')} \u00D7 {dayCount} {t('common.days')}</p>
            <p className="text-2xl font-bold text-slate-900">\u20AC{totalCost.toFixed(0)}</p>
          </div>
          <p className="text-sm text-slate-500">\u20AC{(totalCost / Math.max(travelers, 1)).toFixed(0)}/{t('common.perPerson')}</p>
        </div>
      </section>

      {/* Swap drawer */}
      {swapBlock && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setSwapBlock(null)}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{t('wellness.swapSession')}</h3>
              <button onClick={() => setSwapBlock(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="mt-4 space-y-3 max-h-[50vh] overflow-y-auto">
              {getAlternatives(swapBlock).length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-400">{t('wellness.noAlternatives')}</p>
              ) : (
                getAlternatives(swapBlock).map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => handleSwap(swapBlock, alt)}
                    className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:bg-slate-50"
                  >
                    {alt.mainImageUrl && <img src={alt.mainImageUrl} alt={alt.title} className="h-12 w-12 rounded-lg object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{alt.title}</p>
                      <p className="text-xs text-slate-500">{alt.duration}h · \u20AC{alt.price}/{t('common.perPerson')}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      <FloatingContinueButton onContinue={onNext} onBack={onBack} isValid={selectedActivities.length > 0} currentStep={2} totalSteps={3} validationMessages={selectedActivities.length ? [] : [t('activities.validationMin')]} nextText={t('wellness.continueToBook')} />
    </div>
  );
}
