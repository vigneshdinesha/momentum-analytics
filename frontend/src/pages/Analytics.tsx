import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import CheckinService from '../services/checkinService';
import type { CheckinResponse } from '../types/checkin';
import { tokenStorage } from '../utils/tokenStorage';

interface AnalyticsData {
  date: string;
  sleepHours: number;
  sleepQuality: number;
  avgEnergy: number;
  mood: string;
  moodScore: number;
  stressLevel: number;
  exerciseDuration: number;
  productivityRating: number;
  waterGlasses: number;
  caffeine: number;
}

interface TrendData {
  period: string;
  sleep: number;
  energy: number;
  productivity: number;
  mood: number;
}

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [insights, setInsights] = useState({
    avgSleep: 0,
    avgEnergy: 0,
    avgProductivity: 0,
    avgMood: 0,
    totalCheckins: 0,
    bestDay: '',
    improvementArea: ''
  });

  const user = tokenStorage.getUser();
  const displayName = user?.firstName || 'User';

  // Mood scoring mapping
  const moodScores: { [key: string]: number } = {
    'terrible': 1,
    'bad': 2,
    'okay': 3,
    'good': 4,
    'great': 5,
    'amazing': 6
  };

  const COLORS = {
    sleep: '#3b82f6',      // Blue
    energy: '#f59e0b',     // Amber  
    productivity: '#10b981', // Emerald
    mood: '#8b5cf6',       // Violet
    stress: '#ef4444',     // Red
    exercise: '#06b6d4'    // Cyan
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const checkins = await CheckinService.getRecentCheckins(days);

      if (checkins.length === 0) {
        setAnalyticsData([]);
        setTrendData([]);
        return;
      }

      // Process data for charts
      const processedData = processCheckinData(checkins);
      setAnalyticsData(processedData);

      // Generate trend data (weekly averages)
      const trends = generateTrendData(processedData);
      setTrendData(trends);

      // Calculate insights
      const calculatedInsights = calculateInsights(processedData);
      setInsights(calculatedInsights);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processCheckinData = (checkins: CheckinResponse[]): AnalyticsData[] => {
    return checkins.map(checkin => {
      const avgEnergy = ((checkin.energyMorning || 0) + 
                       (checkin.energyAfternoon || 0) + 
                       (checkin.energyEvening || 0)) / 3;

      return {
        date: new Date(checkin.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sleepHours: checkin.sleepHours || 0,
        sleepQuality: checkin.sleepQuality || 0,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        mood: checkin.mood || 'okay',
        moodScore: moodScores[checkin.mood || 'okay'] || 3,
        stressLevel: checkin.stressLevel || 0,
        exerciseDuration: checkin.exerciseDuration || 0,
        productivityRating: checkin.productivityRating || 0,
        waterGlasses: checkin.waterGlasses || 0,
        caffeine: checkin.caffeineMg || 0
      };
    }).reverse(); // Reverse to show chronological order
  };

  const generateTrendData = (data: AnalyticsData[]): TrendData[] => {
    const weekSize = 7;
    const trends: TrendData[] = [];

    for (let i = 0; i < data.length; i += weekSize) {
      const weekData = data.slice(i, i + weekSize);
      if (weekData.length === 0) continue;

      const avgSleep = weekData.reduce((sum, d) => sum + d.sleepHours, 0) / weekData.length;
      const avgEnergy = weekData.reduce((sum, d) => sum + d.avgEnergy, 0) / weekData.length;
      const avgProductivity = weekData.reduce((sum, d) => sum + d.productivityRating, 0) / weekData.length;
      const avgMood = weekData.reduce((sum, d) => sum + d.moodScore, 0) / weekData.length;

      trends.push({
        period: `Week ${Math.floor(i / weekSize) + 1}`,
        sleep: Math.round(avgSleep * 10) / 10,
        energy: Math.round(avgEnergy * 10) / 10,
        productivity: Math.round(avgProductivity * 10) / 10,
        mood: Math.round(avgMood * 10) / 10
      });
    }

    return trends;
  };

  const calculateInsights = (data: AnalyticsData[]) => {
    if (data.length === 0) return insights;

    const avgSleep = data.reduce((sum, d) => sum + d.sleepHours, 0) / data.length;
    const avgEnergy = data.reduce((sum, d) => sum + d.avgEnergy, 0) / data.length;
    const avgProductivity = data.reduce((sum, d) => sum + d.productivityRating, 0) / data.length;
    const avgMood = data.reduce((sum, d) => sum + d.moodScore, 0) / data.length;

    // Find best performing day
    let bestDay = '';
    let bestScore = 0;
    data.forEach(d => {
      const score = (d.sleepQuality + d.avgEnergy + d.productivityRating + d.moodScore) / 4;
      if (score > bestScore) {
        bestScore = score;
        bestDay = d.date;
      }
    });

    // Determine improvement area
    const metrics = {
      sleep: avgSleep < 7 ? 'Sleep' : null,
      energy: avgEnergy < 6 ? 'Energy' : null,
      productivity: avgProductivity < 6 ? 'Productivity' : null,
      mood: avgMood < 4 ? 'Mood' : null
    };
    const improvementArea = Object.values(metrics).find(m => m !== null) || 'All metrics look good!';

    return {
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      avgProductivity: Math.round(avgProductivity * 10) / 10,
      avgMood: Math.round(avgMood * 10) / 10,
      totalCheckins: data.length,
      bestDay,
      improvementArea
    };
  };

  const handleLogout = () => {
    tokenStorage.removeToken();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-white mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">
              Insights and trends for {displayName}'s health data
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="border border-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {analyticsData.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
            <p className="text-gray-400 mb-6">
              Start tracking your health metrics to see analytics and insights.
            </p>
            <button
              onClick={() => navigate('/checkin')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create Your First Check-in
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Insights Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-blue-400">{insights.avgSleep}h</div>
                <div className="text-gray-300 text-sm">Avg Sleep</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-amber-400">{insights.avgEnergy}/10</div>
                <div className="text-gray-300 text-sm">Avg Energy</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-emerald-400">{insights.avgProductivity}/10</div>
                <div className="text-gray-300 text-sm">Avg Productivity</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-violet-400">{insights.avgMood}/6</div>
                <div className="text-gray-300 text-sm">Avg Mood</div>
              </div>
            </div>

            {/* Main Trends Chart */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Daily Trends</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sleepHours" 
                    stroke={COLORS.sleep} 
                    strokeWidth={2}
                    name="Sleep (hours)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgEnergy" 
                    stroke={COLORS.energy} 
                    strokeWidth={2}
                    name="Energy Level"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="productivityRating" 
                    stroke={COLORS.productivity} 
                    strokeWidth={2}
                    name="Productivity"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moodScore" 
                    stroke={COLORS.mood} 
                    strokeWidth={2}
                    name="Mood Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sleep Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Sleep Analysis</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sleepHours" 
                      stackId="1"
                      stroke={COLORS.sleep} 
                      fill={`${COLORS.sleep}40`}
                      name="Sleep Hours"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sleepQuality" 
                      stackId="2"
                      stroke="#60a5fa" 
                      fill="#60a5fa40"
                      name="Sleep Quality"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Exercise Impact</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                    <Bar dataKey="exerciseDuration" fill={COLORS.exercise} name="Exercise (min)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Trends */}
            {trendData.length > 1 && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Weekly Progress</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="period" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sleep" fill={COLORS.sleep} name="Sleep" />
                    <Bar dataKey="energy" fill={COLORS.energy} name="Energy" />
                    <Bar dataKey="productivity" fill={COLORS.productivity} name="Productivity" />
                    <Bar dataKey="mood" fill={COLORS.mood} name="Mood" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Insights Panel */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Insights & Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-cyan-400 font-medium mb-2">📊 Summary</h3>
                    <p className="text-gray-300 text-sm">
                      You've completed <strong>{insights.totalCheckins}</strong> check-ins in the selected period.
                      {insights.bestDay && (
                        <span> Your best day was <strong>{insights.bestDay}</strong>.</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-amber-400 font-medium mb-2">🎯 Focus Area</h3>
                    <p className="text-gray-300 text-sm">
                      Consider focusing on: <strong>{insights.improvementArea}</strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-emerald-400 font-medium mb-2">💡 Recommendations</h3>
                    <ul className="text-gray-300 text-sm space-y-2">
                      {insights.avgSleep < 7 && (
                        <li>• Try to get 7-9 hours of sleep for optimal performance</li>
                      )}
                      {insights.avgEnergy < 6 && (
                        <li>• Consider adjusting your sleep schedule or exercise routine</li>
                      )}
                      {insights.avgProductivity < 6 && (
                        <li>• Experiment with different work environments or techniques</li>
                      )}
                      {insights.avgMood < 4 && (
                        <li>• Practice stress management techniques like meditation</li>
                      )}
                      <li>• Keep tracking consistently for better insights!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;