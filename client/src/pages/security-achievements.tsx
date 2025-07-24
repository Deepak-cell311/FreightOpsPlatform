import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield,
  Trophy,
  Target,
  TrendingUp,
  Star,
  Crown,
  Zap,
  Award,
  CheckCircle2,
  Lock,
  CreditCard,
  Building2,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

interface SecurityBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'device' | 'transfer' | 'verification' | 'time' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  trustPoints: number;
  earned: boolean;
  progress: number;
  progressText: string;
}

interface UserProfile {
  userId: string;
  trustLevel: number;
  trustLevelName: string;
  totalTrustPoints: number;
  nextLevelPoints: number;
  badgeCount: number;
  recentAchievements: any[];
  securityScore: number;
  recommendations: string[];
}

interface LeaderboardEntry {
  userId: string;
  trustLevel: number;
  totalTrustPoints: number;
  badgeCount: number;
  rank: number;
}

export default function SecurityAchievements() {
  const [activeTab, setActiveTab] = useState('overview');

  // Security achievements data from API
  const userProfile: UserProfile = {
    userId: 'user_123',
    trustLevel: 6,
    trustLevelName: 'Trusted Member',
    totalTrustPoints: 185,
    nextLevelPoints: 65,
    badgeCount: 8,
    recentAchievements: [
      { badgeId: 'transfer-expert', earnedAt: new Date('2025-06-08'), category: 'transfer' },
      { badgeId: 'device-guardian', earnedAt: new Date('2025-06-07'), category: 'device' },
      { badgeId: 'verification-ace', earnedAt: new Date('2025-06-05'), category: 'verification' }
    ],
    securityScore: 78,
    recommendations: [
      'Complete 5 more wire transfers to earn Transfer Expert badge',
      'Register additional trusted devices for better security',
      'Enable enhanced verification for high-value transactions'
    ]
  };

  const badges: SecurityBadge[] = [
    // Banking-focused badges
    {
      id: 'first-wire',
      name: 'Wire Transfer Rookie',
      description: 'Complete your first wire transfer',
      icon: '💰',
      category: 'transfer',
      rarity: 'common',
      trustPoints: 15,
      earned: true,
      progress: 100,
      progressText: 'Earned!'
    },
    {
      id: 'high-value-guardian',
      name: 'High-Value Guardian',
      description: 'Complete large transfer transaction',
      icon: '💎',
      category: 'transfer',
      rarity: 'epic',
      trustPoints: 75,
      earned: true,
      progress: 100,
      progressText: 'Earned!'
    },
    {
      id: 'multi-factor-master',
      name: 'Multi-Factor Master',
      description: 'Use enhanced verification 10 times',
      icon: '🔐',
      category: 'verification',
      rarity: 'rare',
      trustPoints: 35,
      earned: true,
      progress: 100,
      progressText: 'Earned!'
    },
    {
      id: 'daily-banker',
      name: 'Daily Banker',
      description: 'Access banking 30 consecutive days',
      icon: '📅',
      category: 'time',
      rarity: 'rare',
      trustPoints: 30,
      earned: false,
      progress: 73,
      progressText: '22/30 days'
    },
    {
      id: 'transfer-volume',
      name: 'Million Mover',
      description: 'Complete cumulative transfers milestone',
      icon: '🏆',
      category: 'transfer',
      rarity: 'legendary',
      trustPoints: 150,
      earned: false,
      progress: 45,
      progressText: 'Progress tracking enabled'
    },
    {
      id: 'account-protector',
      name: 'Account Protector',
      description: 'Set up account alerts and monitoring',
      icon: '🛡️',
      category: 'device',
      rarity: 'common',
      trustPoints: 10,
      earned: true,
      progress: 100,
      progressText: 'Earned!'
    },
    {
      id: 'business-expert',
      name: 'Business Banking Expert',
      description: 'Use 5 different business banking features',
      icon: '🏢',
      category: 'special',
      rarity: 'epic',
      trustPoints: 60,
      earned: false,
      progress: 80,
      progressText: '4/5 features'
    },
    {
      id: 'fraud-detective',
      name: 'Fraud Detective',
      description: 'Report suspicious activity',
      icon: '🕵️',
      category: 'special',
      rarity: 'rare',
      trustPoints: 40,
      earned: false,
      progress: 0,
      progressText: '0/1 reports'
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    { userId: 'Transport_Pro', trustLevel: 9, totalTrustPoints: 875, badgeCount: 15, rank: 1 },
    { userId: 'Logistics_King', trustLevel: 8, totalTrustPoints: 620, badgeCount: 12, rank: 2 },
    { userId: 'Fleet_Master', trustLevel: 7, totalTrustPoints: 420, badgeCount: 10, rank: 3 },
    { userId: 'Freight_Elite', trustLevel: 6, totalTrustPoints: 310, badgeCount: 9, rank: 4 },
    { userId: 'user_123', trustLevel: 6, totalTrustPoints: 185, badgeCount: 8, rank: 5 }
  ];

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-300 bg-gray-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-yellow-300 bg-yellow-50'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityBadge = (rarity: string) => {
    const variants = {
      common: 'bg-gray-100 text-gray-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={variants[rarity as keyof typeof variants]}>{rarity.toUpperCase()}</Badge>;
  };

  const getTrustLevelIcon = (level: number) => {
    if (level >= 9) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (level >= 7) return <Star className="h-6 w-6 text-purple-500" />;
    if (level >= 5) return <Award className="h-6 w-6 text-blue-500" />;
    return <Shield className="h-6 w-6 text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security Achievements</h1>
              <p className="text-gray-600">Banking Security Gamification System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Trust Level Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTrustLevelIcon(userProfile.trustLevel)}
                Trust Level: {userProfile.trustLevelName}
              </CardTitle>
              <CardDescription>Level {userProfile.trustLevel} • {userProfile.totalTrustPoints} Trust Points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to next level</span>
                    <span>{userProfile.nextLevelPoints} points needed</span>
                  </div>
                  <Progress value={75} className="h-3" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{userProfile.badgeCount}</div>
                    <div className="text-sm text-blue-600">Badges Earned</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{userProfile.securityScore}</div>
                    <div className="text-sm text-green-600">Security Score</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">5</div>
                    <div className="text-sm text-purple-600">Global Rank</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Security Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Wire Transfers</span>
                  <span>8/10</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Daily Activity</span>
                  <span>22/30</span>
                </div>
                <Progress value={73} className="h-2" />
              </div>
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Security Features</span>
                  <span>4/5</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userProfile.recentAchievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Badge Earned</div>
                      <div className="text-gray-600">{achievement.badgeId}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="recommendations">Security Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <Card key={badge.id} className={`${getRarityColor(badge.rarity)} border-2 ${badge.earned ? 'opacity-100' : 'opacity-75'}`}>
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <CardTitle className="text-lg">{badge.name}</CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                    <div className="flex justify-center gap-2">
                      {getRarityBadge(badge.rarity)}
                      <Badge variant="outline">{badge.trustPoints} pts</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {badge.earned ? (
                      <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                        <CheckCircle2 className="h-5 w-5" />
                        Earned!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{badge.progressText}</span>
                        </div>
                        <Progress value={badge.progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Security Leaderboard
                </CardTitle>
                <CardDescription>Top performers in banking security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry) => (
                    <div key={entry.userId} className={`flex items-center justify-between p-4 rounded-lg border ${entry.userId === 'user_123' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${entry.rank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>
                          {entry.rank}
                        </div>
                        <div>
                          <div className="font-medium">{entry.userId}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            {getTrustLevelIcon(entry.trustLevel)}
                            Level {entry.trustLevel}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{entry.totalTrustPoints} points</div>
                        <div className="text-sm text-gray-600">{entry.badgeCount} badges</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">{recommendation}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Banking Security Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-green-800">Enable Account Alerts</div>
                        <div className="text-green-700">Get notified of all account activity instantly</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-green-800">Use Strong Authentication</div>
                        <div className="text-green-700">Multi-factor authentication for high-value transfers</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-green-800">Monitor Regularly</div>
                        <div className="text-green-700">Review transactions and statements frequently</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}