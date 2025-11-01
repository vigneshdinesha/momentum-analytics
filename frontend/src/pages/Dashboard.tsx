import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { tokenStorage } from "../utils/tokenStorage";
import CheckinService from "../services/checkinService";
import type { CheckinResponse } from "../types/checkin";

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
    <div className="min-h-screen bg-[#0f172a] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {displayName}!
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your Momentum dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="border border-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06b6d4]"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Track your daily health metrics and optimize your performance.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => navigate('/checkin')}
                    className="bg-[#06b6d4] text-white px-6 py-3 rounded-md font-medium hover:bg-[#0891b2] transition-colors"
                  >
                    Add New Check-in
                  </button>
                  {hasCheckedInToday && (
                    <div className="flex items-center text-green-700 bg-green-50 px-4 py-3 rounded-md">
                      <span className="text-lg mr-2">✅</span>
                      <span className="text-sm font-medium">Checked in today</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              {recentCheckins.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">This Week</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{recentCheckins.length}</div>
                      <div className="text-blue-800 text-sm">Check-ins</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(recentCheckins.reduce((sum, c) => sum + (c.productivityRating || 0), 0) / recentCheckins.length) || 0}
                      </div>
                      <div className="text-green-800 text-sm">Avg Productivity</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(recentCheckins.reduce((sum, c) => sum + (c.sleepHours || 0), 0) / recentCheckins.length * 10) / 10 || 0}h
                      </div>
                      <div className="text-purple-800 text-sm">Avg Sleep</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent Check-ins Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Check-ins</h2>
          
          {loading ? (
            <div className="bg-white/10 border border-gray-700 rounded-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="ml-2 text-gray-300">Loading check-ins...</span>
              </div>
            </div>
          ) : recentCheckins.length === 0 ? (
            <div className="bg-white/10 border border-gray-700 rounded-lg p-8">
              <p className="text-gray-400 text-center">
                No check-ins yet. Add your first one!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCheckins.map((checkin) => {
                const formatted = CheckinService.formatCheckinForDisplay(checkin);
                return (
                  <div key={checkin.id} className="bg-white/10 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-medium">{formatted.date}</h3>
                        <p className="text-gray-300 text-sm">{formatted.summary}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {new Date(checkin.createdAt).toLocaleTimeString()}
                        </span>
                        <button
                          onClick={() => navigate(`/checkin/${checkin.id}`)}
                          className="text-[#06b6d4] text-sm hover:text-[#0891b2] font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    
                    {/* Key metrics grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {Object.entries(formatted.details).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-gray-400">{key}</div>
                          <div className="text-white font-medium">{value}</div>
                        </div>
                      ))}
                    </div>
                    
                    {checkin.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-600">
                        <p className="text-gray-300 text-sm italic">"{checkin.notes}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {recentCheckins.length >= 7 && (
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Showing last 7 check-ins. More analytics coming soon!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}