import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tokenStorage } from "../utils/tokenStorage";
import CheckinService from "../services/checkinService";
import type { CheckinResponse } from "../types/checkin";
import MiniTrendWidget from "../components/MiniTrendWidget";

interface DashboardPageProps {
  userName?: string;
  onLogout?: () => void;
}

export default function Dashboard({ userName, onLogout }: DashboardPageProps) {
  const navigate = useNavigate();
  const [recentCheckins, setRecentCheckins] = useState<CheckinResponse[]>([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Get user info from storage if not provided as prop
  const user = tokenStorage.getUser();
  const displayName = userName || user?.firstName || "User";

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if user has checked in today
        const checkedInToday = await CheckinService.hasCheckedInToday();
        setHasCheckedInToday(checkedInToday);

        // Get recent check-ins (last 7 days)
        const recent = await CheckinService.getRecentCheckins(7);
        setRecentCheckins(recent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior - clear storage and redirect
      tokenStorage.removeToken();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-slate-700/30">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Welcome back, {displayName}!
            </h1>
            <p className="text-slate-400 font-medium">Your Momentum dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white px-4 py-2 rounded-lg border border-slate-600/20 transition-all duration-200 font-medium"
          >
            Logout
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-700 text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm animate-slide-up">
              <div className="flex items-center">
                <span className="text-red-400 mr-3">⚠</span>
                {error}
              </div>
            </div>
          )}

        {/* Main Content */}
        <div className="py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
              </div>
              <span className="ml-4 text-white text-lg font-medium">Loading your dashboard...</span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Action Bar */}
              <div className="text-center py-8">
                <p className="text-slate-400 mb-8 text-lg max-w-2xl mx-auto">
                  Track your daily health metrics and optimize your performance.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => navigate('/checkin')}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                  >
                    <span className="mr-2">📝</span>
                    Add New Check-in
                  </button>
                  <button 
                    onClick={() => navigate('/analytics')}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg"
                  >
                    <span className="mr-2">📊</span>
                    View Analytics
                  </button>
                  {hasCheckedInToday && (
                    <div className="flex items-center text-blue-200 bg-blue-600/20 border border-blue-500/30 px-4 py-3 rounded-lg">
                      <span className="text-lg mr-2">✅</span>
                      <span className="font-medium text-sm">Checked in today</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Dashboard Content */}
              {recentCheckins.length > 0 ? (
                <div className="space-y-10">
                  {/* Quick Stats Cards */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-8">This Week's Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <span className="text-xl">📊</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{recentCheckins.length}</div>
                            <div className="text-slate-400 text-sm font-medium">Check-ins</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {recentCheckins.length >= 5 ? 'Excellent consistency!' : 'Keep it up!'}
                        </div>
                      </div>

                      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <span className="text-xl">🚀</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {Math.round(recentCheckins.reduce((sum, c) => sum + (c.productivityRating || 0), 0) / recentCheckins.length) || 0}/10
                            </div>
                            <div className="text-slate-400 text-sm font-medium">Avg Productivity</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {Math.round(recentCheckins.reduce((sum, c) => sum + (c.productivityRating || 0), 0) / recentCheckins.length) >= 7 ? 'Outstanding!' : 'Room to improve'}
                        </div>
                      </div>

                      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <span className="text-xl">😴</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {Math.round(recentCheckins.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / recentCheckins.length * 10) / 10 || 0}h
                            </div>
                            <div className="text-slate-400 text-sm font-medium">Avg Sleep</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {Math.round(recentCheckins.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / recentCheckins.length * 10) / 10 >= 7 ? 'Well rested!' : 'Need more sleep'}
                        </div>
                      </div>

                      <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <span className="text-xl">⚡</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {Math.round(recentCheckins.reduce((sum, c) => {
                                const avgEnergy = ((c.energyMorning || 0) + (c.energyAfternoon || 0) + (c.energyEvening || 0)) / 3;
                                return sum + avgEnergy;
                              }, 0) / recentCheckins.length * 10) / 10 || 0}/10
                            </div>
                            <div className="text-slate-400 text-sm font-medium">Avg Energy</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {Math.round(recentCheckins.reduce((sum, c) => {
                            const avgEnergy = ((c.energyMorning || 0) + (c.energyAfternoon || 0) + (c.energyEvening || 0)) / 3;
                            return sum + avgEnergy;
                          }, 0) / recentCheckins.length * 10) / 10 >= 7 ? 'High energy!' : 'Boost needed'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Trend Widgets */}
                  {recentCheckins.length >= 3 && (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-8">Recent Trends</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MiniTrendWidget
                          checkins={recentCheckins}
                          metricKey="sleepHours"
                          title="Sleep Hours"
                          color="#3b82f6"
                        />
                        <MiniTrendWidget
                          checkins={recentCheckins}
                          metricKey="energyMorning"
                          title="Energy Level"
                          color="#60a5fa"
                        />
                        <MiniTrendWidget
                          checkins={recentCheckins}
                          metricKey="productivityRating"
                          title="Productivity"
                          color="#2563eb"
                        />
                        <MiniTrendWidget
                          checkins={recentCheckins}
                          metricKey="sleepQuality"
                          title="Sleep Quality"
                          color="#1d4ed8"
                        />
                      </div>
                    </div>
                  )}

                  {/* Smart Insights */}
                  <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <span className="text-xl">💡</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">Personalized Insights</h3>
                        <p className="text-slate-300 leading-relaxed">
                          {recentCheckins.length >= 5 ? (
                            <>
                              <span className="text-blue-400 font-medium">Excellent consistency!</span> You've logged {recentCheckins.length} check-ins this week. 
                              Your dedication to tracking is building valuable insights.
                            </>
                          ) : recentCheckins.length >= 3 ? (
                            <>
                              <span className="text-blue-400 font-medium">Good progress!</span> You've completed {recentCheckins.length} check-ins. 
                              Try to maintain daily tracking for more powerful insights.
                            </>
                          ) : (
                            <>
                              <span className="text-blue-400 font-medium">Just getting started!</span> You have {recentCheckins.length} check-in{recentCheckins.length !== 1 ? 's' : ''}. 
                              Daily tracking will unlock powerful pattern recognition.
                            </>
                          )}
                        </p>
                        <button 
                          className="mt-3 text-blue-400 hover:text-blue-300 font-medium flex items-center group transition-colors"
                          onClick={() => navigate('/analytics')}
                        >
                          Explore detailed analytics 
                          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-16">
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8 max-w-lg mx-auto">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold text-white mb-3">Start Your Journey</h3>
                    <p className="text-slate-400 mb-6">
                      Welcome to Momentum! Track your daily health metrics to unlock personalized insights 
                      and optimize your performance.
                    </p>
                    <button
                      onClick={() => navigate('/checkin')}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg"
                    >
                      <span className="mr-2">📝</span>
                      Create Your First Check-in
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Check-ins Section */}
        {recentCheckins.length > 0 && (
          <div className="border-t border-slate-700/30 pt-8 mt-8">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Check-ins</h3>
            
            <div className="space-y-3">
              {recentCheckins.slice(0, 5).map((checkin) => {
                const formatted = CheckinService.formatCheckinForDisplay(checkin);
                return (
                  <div key={checkin.id} className="bg-slate-800/20 border border-slate-700/20 rounded-lg p-4 hover:bg-slate-800/30 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium text-sm">{formatted.date}</h4>
                        <p className="text-slate-400 text-xs">{formatted.summary}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-500">
                          {new Date(checkin.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <button
                          onClick={() => navigate(`/checkin/${checkin.id}`)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    
                    {/* Compact metrics */}
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      {Object.entries(formatted.details).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-slate-500">{key}</div>
                          <div className="text-slate-300 font-medium">{value}</div>
                        </div>
                      ))}
                    </div>
                    
                    {checkin.notes && (
                      <div className="mt-3 pt-3 border-t border-slate-700/20">
                        <p className="text-slate-400 text-xs italic">"{checkin.notes}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {recentCheckins.length > 5 && (
                <div className="text-center pt-2">
                  <button 
                    onClick={() => navigate('/analytics')}
                    className="text-slate-500 hover:text-slate-400 text-xs font-medium transition-colors"
                  >
                    View all check-ins in analytics →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}