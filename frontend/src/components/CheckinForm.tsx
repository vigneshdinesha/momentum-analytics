import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckinService from '../services/checkinService';
import type { CheckinRequest, CheckinResponse } from '../types/checkin';
import { MOOD_OPTIONS, EXERCISE_TYPES } from '../types/checkin';

interface CheckinFormProps {
  checkinId?: number; // Optional: for editing existing check-ins
  initialData?: CheckinRequest; // Optional: pre-populated data for editing
}

const CheckinForm: React.FC<CheckinFormProps> = ({ checkinId, initialData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingCheckins, setExistingCheckins] = useState<CheckinResponse[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEditing, setIsEditing] = useState(!!checkinId);

  // Form data state
  const [formData, setFormData] = useState<CheckinRequest>(
    initialData || {
      date: new Date().toISOString().split('T')[0], // Today's date
      sleepHours: undefined,
      sleepQuality: undefined,
      sleepNotes: '',
      energyMorning: undefined,
      energyAfternoon: undefined,
      energyEvening: undefined,
      mood: '',
      stressLevel: undefined,
      exerciseType: '',
      exerciseDuration: undefined,
      exerciseIntensity: undefined,
      caffeineMg: undefined,
      waterGlasses: undefined,
      ateBreakfast: undefined,
      screenTimeBeforeBed: undefined,
      deepWorkHours: undefined,
      productivityRating: undefined,
      notes: ''
    }
  );

  // Fetch today's check-ins and existing data for editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (checkinId) {
          // If editing, fetch the specific check-in
          const existingCheckin = await CheckinService.getCheckinById(checkinId);
          setFormData({
            date: existingCheckin.date,
            sleepHours: existingCheckin.sleepHours,
            sleepQuality: existingCheckin.sleepQuality,
            sleepNotes: existingCheckin.sleepNotes,
            energyMorning: existingCheckin.energyMorning,
            energyAfternoon: existingCheckin.energyAfternoon,
            energyEvening: existingCheckin.energyEvening,
            mood: existingCheckin.mood,
            stressLevel: existingCheckin.stressLevel,
            exerciseType: existingCheckin.exerciseType,
            exerciseDuration: existingCheckin.exerciseDuration,
            exerciseIntensity: existingCheckin.exerciseIntensity,
            caffeineMg: existingCheckin.caffeineMg,
            waterGlasses: existingCheckin.waterGlasses,
            ateBreakfast: existingCheckin.ateBreakfast,
            screenTimeBeforeBed: existingCheckin.screenTimeBeforeBed,
            deepWorkHours: existingCheckin.deepWorkHours,
            productivityRating: existingCheckin.productivityRating,
            notes: existingCheckin.notes
          });
        } else {
          // If creating new, fetch today's existing check-ins for context
          const today = new Date().toISOString().split('T')[0];
          const todaysCheckins = await CheckinService.getCheckinsByDate(today);
          setExistingCheckins(todaysCheckins);
        }
      } catch (error) {
        console.error('Error fetching check-in data:', error);
        setError('Failed to load check-in data');
      }
    };

    fetchData();
  }, [checkinId]);

  const handleInputChange = (field: keyof CheckinRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [field]: type === 'number' ? (value ? Number(value) : undefined) :
               type === 'checkbox' ? (e.target as HTMLInputElement).checked :
               value || undefined
    }));
  };

  const handleSliderChange = (field: keyof CheckinRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clean form data - remove undefined/null values and default slider values that weren't set
  const cleanFormData = (data: CheckinRequest): CheckinRequest => {
    const cleaned: any = { date: data.date }; // Always include date
    
    // Only include fields that have meaningful values
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'date') return; // Already handled
      
      if (value !== undefined && value !== null && value !== '') {
        // For numeric fields, don't include if it's a default value that wasn't explicitly set
        if (typeof value === 'number') {
          // Check if this is a slider field that might have a default value
          const sliderFields = ['sleepQuality', 'energyMorning', 'energyAfternoon', 'energyEvening', 'stressLevel', 'exerciseIntensity', 'productivityRating'];
          if (sliderFields.includes(key)) {
            // Only include if the user actually interacted with the slider or it's an edit with existing value
            if (isEditing || value !== 5) { // 5 is the common default value
              cleaned[key] = value;
            }
          } else {
            cleaned[key] = value;
          }
        } else if (typeof value === 'boolean') {
          cleaned[key] = value;
        } else if (typeof value === 'string' && value.trim() !== '') {
          cleaned[key] = value;
        }
      }
    });
    
    return cleaned as CheckinRequest;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Clean the form data to remove default/empty values
      const cleanedData = cleanFormData(formData);
      
      // Validate the cleaned form data with editing context
      const validationErrors = CheckinService.validateCheckinData(cleanedData, isEditing);
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        return;
      }

      // Submit or update the check-in
      if (isEditing && checkinId) {
        await CheckinService.updateCheckin(checkinId, cleanedData);
        setSuccess('Check-in updated successfully!');
      } else {
        await CheckinService.createCheckin(cleanedData);
        setSuccess('Check-in submitted successfully!');
      }
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting check-in:', error);
      setError('Failed to submit check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">
            {isEditing ? 'Edit Check-in' : 'New Check-in'}
          </h1>
          <p className="text-slate-400 text-lg mb-4">
            {isEditing ? 
              'Update your health and productivity metrics' : 
              'Track your daily metrics to optimize your health and productivity'
            }
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-slate-500 bg-slate-800/30 border border-slate-700/30 rounded-lg px-4 py-2 inline-flex">
            <span>Date: {new Date(formData.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>Time: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Show today's existing check-ins if creating new */}
        {!isEditing && existingCheckins.length > 0 && (
          <div className="mb-8 bg-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">
              Today's Check-ins ({existingCheckins.length})
            </h3>
            <div className="space-y-3">
              {existingCheckins.map((checkin, index) => (
                <div key={checkin.id} className="flex items-center justify-between bg-slate-800/40 p-4 rounded-lg border border-slate-700/30">
                  <div>
                    <span className="text-sm font-medium text-white">Check-in #{index + 1}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      {new Date(checkin.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/checkin/${checkin.id}`);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-700 text-red-300 px-6 py-4 rounded-xl">
            <div className="flex items-center">
              <span className="text-red-400 mr-3">⚠</span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-emerald-900/20 border border-emerald-700 text-emerald-300 px-6 py-4 rounded-xl">
            <div className="flex items-center">
              <span className="text-emerald-400 mr-3">✓</span>
              {success}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sleep Section */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">🛏️</span>
              Sleep
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Sleep Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.sleepHours || ''}
                  onChange={handleInputChange('sleepHours')}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="8.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Sleep Quality (1-10): <span className="text-blue-400 font-semibold">{formData.sleepQuality || 'Not set'}</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.sleepQuality || 1}
                    onChange={handleSliderChange('sleepQuality')}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Sleep Notes
                </label>
                <textarea
                  value={formData.sleepNotes || ''}
                  onChange={handleInputChange('sleepNotes')}
                  rows={3}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                  placeholder="Any sleep-related observations..."
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          {/* Energy Section */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">⚡</span>
              Energy Levels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Morning Energy: <span className="text-blue-400 font-semibold">{formData.energyMorning || 'Not set'}</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energyMorning || 5}
                    onChange={handleSliderChange('energyMorning')}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Afternoon Energy: <span className="text-blue-400 font-semibold">{formData.energyAfternoon || 'Not set'}</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energyAfternoon || 5}
                    onChange={handleSliderChange('energyAfternoon')}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Evening Energy: <span className="text-blue-400 font-semibold">{formData.energyEvening || 'Not set'}</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.energyEvening || 5}
                    onChange={handleSliderChange('energyEvening')}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mood & Stress Section */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">😊</span>
              Mood & Stress
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Mood
                </label>
                <select
                  value={formData.mood || ''}
                  onChange={handleInputChange('mood')}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">Select mood...</option>
                  {MOOD_OPTIONS.map(mood => (
                    <option key={mood.value} value={mood.value} className="bg-slate-800">
                      {mood.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Stress Level: <span className="text-blue-400 font-semibold">{formData.stressLevel || 'Not set'}</span>
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.stressLevel || 5}
                    onChange={handleSliderChange('stressLevel')}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Section */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">🏃‍♂️</span>
              Exercise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Exercise Type
                </label>
                <select
                  value={formData.exerciseType || ''}
                  onChange={handleInputChange('exerciseType')}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                >
                  <option value="">No exercise</option>
                  {EXERCISE_TYPES.map(type => (
                    <option key={type} value={type} className="bg-slate-800">{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.exerciseDuration || ''}
                  onChange={handleInputChange('exerciseDuration')}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Intensity: <span className="text-blue-400 font-semibold">{formData.exerciseIntensity || 'Not set'}</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.exerciseIntensity || 5}
                    onChange={handleSliderChange('exerciseIntensity')}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition & Habits Section */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">🥗</span>
              Nutrition & Habits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Water Glasses
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.waterGlasses || ''}
                  onChange={handleInputChange('waterGlasses')}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Caffeine (mg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.caffeineMg || ''}
                  onChange={handleInputChange('caffeineMg')}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="95"
                />
              </div>
              <div className="flex items-center justify-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ateBreakfast || false}
                    onChange={handleInputChange('ateBreakfast')}
                    className="w-5 h-5 text-blue-600 bg-slate-900/50 border border-slate-600/50 rounded focus:ring-blue-500/50 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-slate-300">
                    Ate Breakfast
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Productivity Section */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">📊</span>
              Productivity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Deep Work Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.deepWorkHours || ''}
                  onChange={handleInputChange('deepWorkHours')}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="4.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Productivity Rating: <span className="text-blue-400 font-semibold">{formData.productivityRating || 'Not set'}</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.productivityRating || 5}
                    onChange={handleSliderChange('productivityRating')}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Screen Time Before Bed (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.screenTimeBeforeBed || ''}
                  onChange={handleInputChange('screenTimeBeforeBed')}
                  className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-2xl mr-3">📝</span>
              Additional Notes
            </h2>
            <div className="space-y-3">
              <textarea
                value={formData.notes || ''}
                onChange={handleInputChange('notes')}
                rows={4}
                className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg py-4 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                placeholder="Any additional observations, thoughts, or notes about your day..."
                maxLength={1000}
              />
              <p className="text-sm text-slate-400">
                {(formData.notes?.length || 0)}/1000 characters
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="py-3 px-6 border border-slate-600/50 rounded-lg font-medium text-slate-300 bg-slate-800/40 hover:bg-slate-700/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? 
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </span> : 
                (isEditing ? 'Update Check-in' : 'Submit Check-in')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckinForm;