'use client';

import { Lightbulb, TrendingUp, Target, AlertTriangle } from 'lucide-react';

interface PitchImprovementTipsProps {
  views: number;
  calls: number;
  emails: number;
  avgTimeToFirstContact?: number;
}

export default function PitchImprovementTips({ views, calls, emails, avgTimeToFirstContact }: PitchImprovementTipsProps) {
  const conversionRate = views > 0 ? (calls + emails) / views : 0;
  const callConversionRate = views > 0 ? calls / views : 0;
  const emailConversionRate = views > 0 ? emails / views : 0;
  
  // Determine if tips should be shown
  const shouldShowTips = views > 30 && callConversionRate < 0.1;
  const shouldShowEmailTips = calls > 0 && emailConversionRate < 0.05;
  
  if (!shouldShowTips && !shouldShowEmailTips) {
    return null;
  }
  
  const getTips = () => {
    const tips = [];
    
    if (shouldShowTips) {
      tips.push(
        "Tighten your pitch title - make it more specific and compelling",
        "Add concrete metrics and achievements to build credibility",
        "Reorder your top 3 skills to match what recruiters are looking for"
      );
    }
    
    if (shouldShowEmailTips) {
      tips.push(
        "Add a clearer call-to-action in your pitch description",
        "Include your preferred contact method and availability"
      );
    }
    
    return tips;
  };
  
  const tips = getTips();
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">
            Improve Your Pitch
          </h3>
          
          <div className="space-y-2 mb-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2">
                <Target className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-amber-800">{tip}</span>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-amber-700">
            <strong>Current stats:</strong> {views} views → {calls} calls ({callConversionRate.toFixed(1)}% conversion)
            {avgTimeToFirstContact && avgTimeToFirstContact > 72 && (
              <span className="block mt-1">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Response time: {avgTimeToFirstContact}h (consider improving availability)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
