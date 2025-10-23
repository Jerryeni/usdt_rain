import { ICOPhase } from '@/lib/types';
import { ICO_CONFIG } from '@/lib/config/ico';

export function getCurrentPhase(): ICOPhase {
  const now = new Date();
  return ICO_CONFIG.phases.find(phase => {
    const startDate = new Date(phase.startDate);
    const endDate = new Date(phase.endDate);
    return now >= startDate && now <= endDate;
  }) || ICO_CONFIG.phases[0];
}

export function calculateTokenAmount(amount: number, phase: ICOPhase): number {
  return amount / phase.price;
}

export function validatePurchaseAmount(amount: number, phase: ICOPhase): boolean {
  return amount >= phase.minPurchase && amount <= phase.maxPurchase;
}

export function calculateReferralBonus(amount: number): number {
  return (amount * ICO_CONFIG.referralBonus) / 100;
}

export function formatTokenAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: ICO_CONFIG.decimals,
    minimumFractionDigits: 0
  }).format(amount);
}

export function getVestingInfo(category: keyof typeof ICO_CONFIG.vestingSchedule) {
  const schedule = ICO_CONFIG.vestingSchedule[category];
  return {
    tgeAmount: (schedule.tge / 100),
    monthlyVesting: schedule.duration > 0 ? ((100 - schedule.tge) / schedule.duration) : 0,
    cliffEnd: new Date(Date.now() + schedule.cliff * 30 * 24 * 60 * 60 * 1000)
  };
}