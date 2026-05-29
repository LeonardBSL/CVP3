import { describe, expect, it } from 'vitest';
import { healthScore, milestones, newsItems, benchmarking, diagnostic, signalsForModule } from '../data/intelligenceData';

describe('intelligenceData', () => {
  it('exposes a health score in the 0-100 range with sub-scores and signals', () => {
    expect(healthScore.score).toBe(74);
    expect(healthScore.band).toBe('low');
    expect(healthScore.subScores).toEqual({ engagement: 21, transaction: 28, loyalty: 25 });
    expect(healthScore.signals.length).toBe(5);
    expect(healthScore.intelligenceSignals.length).toBeGreaterThanOrEqual(2);
    expect(typeof healthScore.synthesis).toBe('string');
  });

  it('exposes four lifecycle milestones with urgency and RM context', () => {
    expect(milestones).toHaveLength(4);
    const yearEnd = milestones.find(m => m.id === 'year-end');
    expect(yearEnd.urgency).toBe('urgent');
    expect(yearEnd.rmContext).toMatch(/year-end/i);
    milestones.forEach(m => {
      expect(m.whatItIs).toBeTruthy();
      expect(m.whyItMatters).toBeTruthy();
      expect(m.rmContext).toBeTruthy();
    });
  });

  it('exposes news items with urgency tiers and module links', () => {
    expect(newsItems.length).toBe(5);
    const actNow = newsItems.filter(n => n.urgency === 'act');
    expect(actNow.length).toBe(2);
    newsItems.forEach(n => {
      expect(['act', 'monitor', 'context']).toContain(n.urgency);
      expect(n.relevanceAssessment).toBeTruthy();
      expect(Array.isArray(n.affectedModules)).toBe(true);
    });
  });

  it('exposes benchmarking with four categories and a peer group', () => {
    expect(benchmarking.peerGroup.n).toBe(34);
    expect(benchmarking.categories.map(c => c.id)).toEqual([
      'financial-health', 'liquidity', 'banking-behaviour', 'growth',
    ]);
    benchmarking.categories.forEach(cat => {
      expect(cat.metrics.length).toBeGreaterThan(0);
      cat.metrics.forEach(m => {
        expect(m.quartile).toMatch(/top|2nd|3rd|bottom/i);
      });
    });
  });

  it('exposes a diagnostic with four metrics each carrying a 4-quarter trend', () => {
    expect(diagnostic.quarter).toBe('Q1 2026');
    expect(diagnostic.overallRating).toBe('healthy');
    expect(diagnostic.metrics).toHaveLength(4);
    diagnostic.metrics.forEach(m => {
      expect(m.trend).toHaveLength(4);
      expect(m.interpretation).toBeTruthy();
      expect(m.formula).toBeTruthy();
    });
  });

  it('signalsForModule filters newsItems by module and maps to the shared signal shape', () => {
    const benchSignals = signalsForModule('benchmarking');
    expect(benchSignals.map(s => s.id).sort()).toEqual(['fmcg-price-hike', 'loadshedding-margin', 'shoprite-sens']);

    const actSignal = benchSignals.find(s => s.id === 'fmcg-price-hike');
    expect(actSignal.impactDirection).toBe('watch');
    expect(actSignal.impactLabel).toBe('Act now');
    expect(actSignal.connectionText).toBe(actSignal.connectionText); // present
    expect(actSignal.connectionText).toBeTruthy();

    const monitorSignal = benchSignals.find(s => s.id === 'shoprite-sens');
    expect(monitorSignal.impactDirection).toBe('up');
    expect(monitorSignal.impactLabel).toBe('Monitor');

    expect(signalsForModule('nonexistent-module')).toHaveLength(0);
  });
});
