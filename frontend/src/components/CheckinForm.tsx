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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Check-in' : 'New Check-in'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 
              'Update your health and productivity metrics' : 
              'Track your daily metrics to optimize your health and productivity'
            }
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Date: {new Date(formData.date).toLocaleDateString()}</span>
            <span>•</span>
            <span>Time: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Show today's existing check-ins if creating new */}
        {!isEditing && existingCheckins.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Today's Check-ins ({existingCheckins.length})
            </h3>
            <div className="space-y-2">
              {existingCheckins.map((checkin, index) => (
                <div key={checkin.id} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <span className="text-sm font-medium">Check-in #{index + 1}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(checkin.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/checkin/${checkin.id}`);
                    }}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sleep Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🛏️ Sleep
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.sleepHours || ''}
                  onChange={handleInputChange('sleepHours')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="8.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Quality (1-10): {formData.sleepQuality || 'Not set'}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.sleepQuality || 1}
                  onChange={handleSliderChange('sleepQuality')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Notes
                </label>
                <textarea
                  value={formData.sleepNotes || ''}
                  onChange={handleInputChange('sleepNotes')}
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Any sleep-related observations..."
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          {/* Energy Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              ⚡ Energy Levels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Morning Energy (1-10): {formData.energyMorning || 'Not set'}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energyMorning || 5}
                  onChange={handleSliderChange('energyMorning')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Afternoon Energy (1-10): {formData.energyAfternoon || 'Not set'}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energyAfternoon || 5}
                  onChange={handleSliderChange('energyAfternoon')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evening Energy (1-10): {formData.energyEvening || 'Not set'}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energyEvening || 5}
                  onChange={handleSliderChange('energyEvening')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Mood & Stress Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              😊 Mood & Stress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood
                </label>
                <select
                  value={formData.mood || ''}
                  onChange={handleInputChange('mood')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select mood...</option>
                  {MOOD_OPTIONS.map(mood => (
                    <option key={mood.value} value={mood.value}>
                      {mood.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level (1-10): {formData.stressLevel || 'Not set'}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.stressLevel || 5}
                  onChange={handleSliderChange('stressLevel')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🏃‍♂️ Exercise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Type
                </label>
                <select
                  value={formData.exerciseType || ''}
                  onChange={handleInputChange('exerciseType')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No exercise</option>
                  {EXERCISE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.exerciseDuration || ''}
                  onChange={handleInputChange('exerciseDuration')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity (1-10): {formData.exerciseIntensity || 'Not set'}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.exerciseIntensity || 5}
                  onChange={handleSliderChange('exerciseIntensity')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Nutrition & Habits Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              🥗 Nutrition & Habits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Water Glasses
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.waterGlasses || ''}
                  onChange={handleInputChange('waterGlasses')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caffeine (mg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.caffeineMg || ''}
                  onChange={handleInputChange('caffeineMg')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="95"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.ateBreakfast || false}
                  onChange={handleInputChange('ateBreakfast')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm font-medium text-gray-700">
                  Ate Breakfast
                </label>
              </div>
            </div>
          </div>

          {/* Productivity Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              📊 Productivity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deep Work Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={formData.deepWorkHours || ''}
                  onChange={handleInputChange('deepWorkHours')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="4.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Productivity Rating (1-10): {formData.productivityRating || 'Not set'}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.productivityRating || 5}
                  onChange={handleSliderChange('productivityRating')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screen Time Before Bed (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.screenTimeBeforeBed || ''}
                  onChange={handleInputChange('screenTimeBeforeBed')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="30"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              📝 Additional Notes
            </h2>
            <textarea
              value={formData.notes || ''}
              onChange={handleInputChange('notes')}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any additional observations, thoughts, or notes about your day..."
              maxLength={1000}
            />
            <p className="mt-1 text-sm text-gray-500">
              {(formData.notes?.length || 0)}/1000 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 
                (isEditing ? 'Updating...' : 'Submitting...') : 
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