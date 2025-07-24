interface SecurityBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'device' | 'transfer' | 'verification' | 'time' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  trustPoints: number;
  requirements: {
    type: string;
    condition: string;
    value: number;
  }[];
}

interface UserSecurityProfile {
  userId: string;
  trustLevel: number;
  totalTrustPoints: number;
  badges: string[];
  achievements: {
    badgeId: string;
    earnedAt: Date;
    category: string;
  }[];
  statistics: {
    trustedDevicesRegistered: number;
    secureTransfersCompleted: number;
    verificationsPassed: number;
    consecutiveDaysActive: number;
    highRiskBlocksPrevented: number;
    simSwapAlertsHandled: number;
  };
  streaks: {
    currentSecureStreak: number;
    longestSecureStreak: number;
    lastSecureTransfer: Date;
  };
}

export class SecurityAchievementService {
  private userProfiles: Map<string, UserSecurityProfile> = new Map();
  private securityBadges: SecurityBadge[] = [
    // Device Security Badges
    {
      id: 'first-device',
      name: 'Device Guardian',
      description: 'Register your first trusted device',
      icon: '🛡️',
      category: 'device',
      rarity: 'common',
      trustPoints: 10,
      requirements: [{ type: 'device_registration', condition: 'count', value: 1 }]
    },
    {
      id: 'multi-device',
      name: 'Multi-Device Master',
      description: 'Register 3 trusted devices',
      icon: '📱',
      category: 'device',
      rarity: 'rare',
      trustPoints: 25,
      requirements: [{ type: 'device_registration', condition: 'count', value: 3 }]
    },
    {
      id: 'device-veteran',
      name: 'Device Veteran',
      description: 'Maintain trusted devices for 30 days',
      icon: '⚡',
      category: 'device',
      rarity: 'epic',
      trustPoints: 50,
      requirements: [{ type: 'device_age', condition: 'days', value: 30 }]
    },

    // Transfer Security Badges
    {
      id: 'first-secure-transfer',
      name: 'Security Rookie',
      description: 'Complete your first secure transfer',
      icon: '🔒',
      category: 'transfer',
      rarity: 'common',
      trustPoints: 15,
      requirements: [{ type: 'secure_transfers', condition: 'count', value: 1 }]
    },
    {
      id: 'transfer-expert',
      name: 'Transfer Expert',
      description: 'Complete 50 secure transfers',
      icon: '💰',
      category: 'transfer',
      rarity: 'rare',
      trustPoints: 40,
      requirements: [{ type: 'secure_transfers', condition: 'count', value: 50 }]
    },
    {
      id: 'high-value-guardian',
      name: 'High-Value Guardian',
      description: 'Complete transfer over $100,000',
      icon: '💎',
      category: 'transfer',
      rarity: 'epic',
      trustPoints: 75,
      requirements: [{ type: 'transfer_amount', condition: 'single_over', value: 100000 }]
    },
    {
      id: 'million-mover',
      name: 'Million Mover',
      description: 'Complete cumulative transfers over $1,000,000',
      icon: '🏆',
      category: 'transfer',
      rarity: 'legendary',
      trustPoints: 150,
      requirements: [{ type: 'transfer_total', condition: 'cumulative', value: 1000000 }]
    },

    // Verification Badges
    {
      id: 'verification-ace',
      name: 'Verification Ace',
      description: 'Pass 100 SMS verifications',
      icon: '✅',
      category: 'verification',
      rarity: 'rare',
      trustPoints: 35,
      requirements: [{ type: 'verifications_passed', condition: 'count', value: 100 }]
    },
    {
      id: 'enhanced-security',
      name: 'Enhanced Security Pro',
      description: 'Complete 10 enhanced verifications',
      icon: '🔐',
      category: 'verification',
      rarity: 'epic',
      trustPoints: 60,
      requirements: [{ type: 'enhanced_verifications', condition: 'count', value: 10 }]
    },

    // Time-based Badges
    {
      id: 'security-streak-7',
      name: 'Weekly Warrior',
      description: '7-day security streak',
      icon: '🔥',
      category: 'time',
      rarity: 'rare',
      trustPoints: 30,
      requirements: [{ type: 'security_streak', condition: 'days', value: 7 }]
    },
    {
      id: 'security-streak-30',
      name: 'Monthly Master',
      description: '30-day security streak',
      icon: '🌟',
      category: 'time',
      rarity: 'epic',
      trustPoints: 80,
      requirements: [{ type: 'security_streak', condition: 'days', value: 30 }]
    },
    {
      id: 'security-streak-365',
      name: 'Annual Guardian',
      description: '365-day security streak',
      icon: '👑',
      category: 'time',
      rarity: 'legendary',
      trustPoints: 200,
      requirements: [{ type: 'security_streak', condition: 'days', value: 365 }]
    },

    // Special Security Badges
    {
      id: 'threat-detector',
      name: 'Threat Detector',
      description: 'Block 5 high-risk activities',
      icon: '🚨',
      category: 'special',
      rarity: 'epic',
      trustPoints: 100,
      requirements: [{ type: 'threats_blocked', condition: 'count', value: 5 }]
    },
    {
      id: 'sim-swap-survivor',
      name: 'SIM Swap Survivor',
      description: 'Successfully handle SIM swap alert',
      icon: '🛡️',
      category: 'special',
      rarity: 'legendary',
      trustPoints: 120,
      requirements: [{ type: 'sim_swap_handled', condition: 'count', value: 1 }]
    },
    {
      id: 'security-perfectionist',
      name: 'Security Perfectionist',
      description: 'Zero security incidents for 90 days',
      icon: '🎯',
      category: 'special',
      rarity: 'legendary',
      trustPoints: 180,
      requirements: [{ type: 'incident_free_days', condition: 'days', value: 90 }]
    }
  ];

  async getUserProfile(userId: string): Promise<UserSecurityProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        trustLevel: 1,
        totalTrustPoints: 0,
        badges: [],
        achievements: [],
        statistics: {
          trustedDevicesRegistered: 0,
          secureTransfersCompleted: 0,
          verificationsPassed: 0,
          consecutiveDaysActive: 0,
          highRiskBlocksPrevented: 0,
          simSwapAlertsHandled: 0
        },
        streaks: {
          currentSecureStreak: 0,
          longestSecureStreak: 0,
          lastSecureTransfer: new Date()
        }
      };
      this.userProfiles.set(userId, profile);
    }
    
    return profile;
  }

  async recordSecurityAction(
    userId: string, 
    action: 'device_registered' | 'transfer_completed' | 'verification_passed' | 'threat_blocked' | 'sim_swap_handled',
    metadata?: any
  ): Promise<{ newBadges: SecurityBadge[]; trustPointsEarned: number }> {
    const profile = await this.getUserProfile(userId);
    const newBadges: SecurityBadge[] = [];
    let trustPointsEarned = 0;

    // Update statistics based on action
    switch (action) {
      case 'device_registered':
        profile.statistics.trustedDevicesRegistered++;
        break;
      case 'transfer_completed':
        profile.statistics.secureTransfersCompleted++;
        this.updateTransferStreak(profile);
        break;
      case 'verification_passed':
        profile.statistics.verificationsPassed++;
        break;
      case 'threat_blocked':
        profile.statistics.highRiskBlocksPrevented++;
        break;
      case 'sim_swap_handled':
        profile.statistics.simSwapAlertsHandled++;
        break;
    }

    // Check for new badge achievements
    for (const badge of this.securityBadges) {
      if (profile.badges.includes(badge.id)) continue;

      if (this.checkBadgeRequirements(profile, badge, metadata)) {
        profile.badges.push(badge.id);
        profile.achievements.push({
          badgeId: badge.id,
          earnedAt: new Date(),
          category: badge.category
        });
        newBadges.push(badge);
        trustPointsEarned += badge.trustPoints;
        profile.totalTrustPoints += badge.trustPoints;

        console.log(`🏆 Badge earned: ${badge.name} by user ${userId}`);
      }
    }

    // Update trust level based on total points
    const newTrustLevel = this.calculateTrustLevel(profile.totalTrustPoints);
    if (newTrustLevel > profile.trustLevel) {
      console.log(`📈 Trust level increased: ${profile.trustLevel} → ${newTrustLevel} for user ${userId}`);
      profile.trustLevel = newTrustLevel;
    }

    this.userProfiles.set(userId, profile);

    return { newBadges, trustPointsEarned };
  }

  private checkBadgeRequirements(profile: UserSecurityProfile, badge: SecurityBadge, metadata?: any): boolean {
    return badge.requirements.every(req => {
      switch (req.type) {
        case 'device_registration':
          return profile.statistics.trustedDevicesRegistered >= req.value;
        case 'secure_transfers':
          return profile.statistics.secureTransfersCompleted >= req.value;
        case 'verifications_passed':
          return profile.statistics.verificationsPassed >= req.value;
        case 'threats_blocked':
          return profile.statistics.highRiskBlocksPrevented >= req.value;
        case 'sim_swap_handled':
          return profile.statistics.simSwapAlertsHandled >= req.value;
        case 'security_streak':
          return profile.streaks.currentSecureStreak >= req.value;
        case 'transfer_amount':
          return metadata?.transferAmount >= req.value;
        case 'transfer_total':
          return metadata?.cumulativeTransfers >= req.value;
        case 'device_age':
          return metadata?.deviceAgeDays >= req.value;
        case 'incident_free_days':
          return profile.statistics.consecutiveDaysActive >= req.value;
        default:
          return false;
      }
    });
  }

  private updateTransferStreak(profile: UserSecurityProfile): void {
    const now = new Date();
    const lastTransfer = new Date(profile.streaks.lastSecureTransfer);
    const daysDifference = Math.floor((now.getTime() - lastTransfer.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference <= 1) {
      profile.streaks.currentSecureStreak++;
    } else {
      profile.streaks.currentSecureStreak = 1;
    }

    if (profile.streaks.currentSecureStreak > profile.streaks.longestSecureStreak) {
      profile.streaks.longestSecureStreak = profile.streaks.currentSecureStreak;
    }

    profile.streaks.lastSecureTransfer = now;
  }

  private calculateTrustLevel(totalPoints: number): number {
    if (totalPoints >= 1000) return 10; // Trust Master
    if (totalPoints >= 750) return 9;   // Elite Guardian
    if (totalPoints >= 500) return 8;   // Security Expert
    if (totalPoints >= 350) return 7;   // Advanced User
    if (totalPoints >= 250) return 6;   // Trusted Member
    if (totalPoints >= 150) return 5;   // Verified User
    if (totalPoints >= 100) return 4;   // Active Member
    if (totalPoints >= 50) return 3;    // Engaged User
    if (totalPoints >= 25) return 2;    // New Member
    return 1; // Beginner
  }

  getTrustLevelName(level: number): string {
    const levels = {
      1: 'Beginner',
      2: 'New Member',
      3: 'Engaged User',
      4: 'Active Member',
      5: 'Verified User',
      6: 'Trusted Member',
      7: 'Advanced User',
      8: 'Security Expert',
      9: 'Elite Guardian',
      10: 'Trust Master'
    };
    return levels[level as keyof typeof levels] || 'Unknown';
  }

  async getLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    trustLevel: number;
    totalTrustPoints: number;
    badgeCount: number;
    rank: number;
  }>> {
    const allProfiles = Array.from(this.userProfiles.values());
    
    return allProfiles
      .sort((a, b) => b.totalTrustPoints - a.totalTrustPoints)
      .slice(0, limit)
      .map((profile, index) => ({
        userId: profile.userId,
        trustLevel: profile.trustLevel,
        totalTrustPoints: profile.totalTrustPoints,
        badgeCount: profile.badges.length,
        rank: index + 1
      }));
  }

  async getBadgeProgress(userId: string): Promise<Array<{
    badge: SecurityBadge;
    earned: boolean;
    progress: number;
    progressText: string;
  }>> {
    const profile = await this.getUserProfile(userId);
    
    return this.securityBadges.map(badge => {
      const earned = profile.badges.includes(badge.id);
      let progress = 0;
      let progressText = '';

      if (!earned && badge.requirements.length > 0) {
        const req = badge.requirements[0]; // Simplified for main requirement
        let current = 0;
        
        switch (req.type) {
          case 'device_registration':
            current = profile.statistics.trustedDevicesRegistered;
            break;
          case 'secure_transfers':
            current = profile.statistics.secureTransfersCompleted;
            break;
          case 'verifications_passed':
            current = profile.statistics.verificationsPassed;
            break;
          case 'threats_blocked':
            current = profile.statistics.highRiskBlocksPrevented;
            break;
          case 'security_streak':
            current = profile.streaks.currentSecureStreak;
            break;
        }
        
        progress = Math.min(100, (current / req.value) * 100);
        progressText = `${current}/${req.value}`;
      }

      return {
        badge,
        earned,
        progress: earned ? 100 : progress,
        progressText: earned ? 'Earned!' : progressText
      };
    });
  }

  async getSecurityInsights(userId: string): Promise<{
    trustLevel: number;
    trustLevelName: string;
    nextLevelPoints: number;
    recentAchievements: any[];
    securityScore: number;
    recommendations: string[];
  }> {
    const profile = await this.getUserProfile(userId);
    const nextLevelPoints = this.getPointsForNextLevel(profile.totalTrustPoints);
    const securityScore = this.calculateSecurityScore(profile);
    
    return {
      trustLevel: profile.trustLevel,
      trustLevelName: this.getTrustLevelName(profile.trustLevel),
      nextLevelPoints,
      recentAchievements: profile.achievements.slice(-5),
      securityScore,
      recommendations: this.generateRecommendations(profile)
    };
  }

  private getPointsForNextLevel(currentPoints: number): number {
    const thresholds = [25, 50, 100, 150, 250, 350, 500, 750, 1000];
    for (const threshold of thresholds) {
      if (currentPoints < threshold) {
        return threshold - currentPoints;
      }
    }
    return 0; // Already at max level
  }

  private calculateSecurityScore(profile: UserSecurityProfile): number {
    let score = 0;
    
    // Base score from trust level
    score += profile.trustLevel * 10;
    
    // Bonus for active security practices
    score += Math.min(20, profile.statistics.trustedDevicesRegistered * 5);
    score += Math.min(30, profile.streaks.currentSecureStreak * 2);
    score += Math.min(25, profile.statistics.verificationsPassed * 0.5);
    score += profile.statistics.highRiskBlocksPrevented * 10;
    
    return Math.min(100, score);
  }

  private generateRecommendations(profile: UserSecurityProfile): string[] {
    const recommendations = [];
    
    if (profile.statistics.trustedDevicesRegistered < 2) {
      recommendations.push('Register additional trusted devices for better security');
    }
    
    if (profile.streaks.currentSecureStreak < 7) {
      recommendations.push('Maintain consistent secure transfer activity to build your streak');
    }
    
    if (profile.statistics.verificationsPassed < 50) {
      recommendations.push('Continue using SMS verification to earn the Verification Ace badge');
    }
    
    if (profile.badges.length < 5) {
      recommendations.push('Complete more security actions to earn badges and increase trust level');
    }
    
    return recommendations;
  }
}

export const securityAchievementService = new SecurityAchievementService();