export interface CheckinRequest {
  date: string; // ISO format "YYYY-MM-DD"
  sleepHours?: number; // 0-24, decimal allowed
  sleepQuality?: number; // 1-10
  sleepNotes?: string; // max 500 chars
  energyMorning?: number; // 1-10
  energyAfternoon?: number; // 1-10
  energyEvening?: number; // 1-10
  mood?: string; // free text or predefined values
  stressLevel?: number; // 1-10
  exerciseType?: string; // "running" | "cycling" | "strength" | "yoga" | etc
  exerciseDuration?: number; // minutes
  exerciseIntensity?: number; // 1-10
  caffeineMg?: number; // 0+
  waterGlasses?: number; // 0+
  ateBreakfast?: boolean;
  screenTimeBeforeBed?: number; // minutes
  deepWorkHours?: number; // 0-24, decimal
  productivityRating?: number; // 1-10
  notes?: string; // max 1000 chars
}

export interface CheckinResponse extends CheckinRequest {
  id: number;
  userId: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Predefined options for UI
export const MOOD_OPTIONS = [
  { value: 'excellent', label: 'Excellent 🌟', color: 'text-teal-500' },
  { value: 'great', label: 'Great 😊', color: 'text-green-500' },
  { value: 'good', label: 'Good 👍', color: 'text-green-400' },
  { value: 'okay', label: 'Okay 😐', color: 'text-yellow-500' },
  { value: 'tired', label: 'Tired 😴', color: 'text-orange-500' },
  { value: 'stressed', label: 'Stressed 😰', color: 'text-red-400' },
  { value: 'low', label: 'Low 😔', color: 'text-red-500' },
] as const;

export const EXERCISE_TYPES = [
  'Running',
  'Cycling', 
  'Strength Training',
  'Yoga',
  'Swimming',
  'Walking',
  'Hiking',
  'Sports',
  'Dance',
  'Martial Arts',
  'Rock Climbing',
  'Other'
] as const;

// Helper functions for rating displays
export const getRatingEmoji = (rating: number): string => {
  if (rating <= 2) return '😴';
  if (rating <= 4) return '😐';
  if (rating <= 6) return '🙂';
  if (rating <= 8) return '😊';
  return '🌟';
};

export const getRatingColor = (rating: number): string => {
  if (rating <= 2) return 'text-red-500';
  if (rating <= 4) return 'text-orange-500';
  if (rating <= 6) return 'text-yellow-500';
  if (rating <= 8) return 'text-green-500';
  return 'text-teal-500';
};

export const getStressEmoji = (stress: number): string => {
  if (stress <= 2) return '😌';
  if (stress <= 4) return '🙂';
  if (stress <= 6) return '😐';
  if (stress <= 8) return '😰';
  return '🤯';
};

// Validation helpers (can be used with react-hook-form)
export const VALIDATION_RULES = {
  date: { required: 'Date is required' },
  sleepHours: { 
    min: { value: 0, message: 'Sleep hours must be positive' },
    max: { value: 24, message: 'Sleep hours cannot exceed 24' }
  },
  rating: {
    min: { value: 1, message: 'Rating must be at least 1' },
    max: { value: 10, message: 'Rating cannot exceed 10' }
  },
  sleepNotes: {
    maxLength: { value: 500, message: 'Sleep notes cannot exceed 500 characters' }
  },
  notes: {
    maxLength: { value: 1000, message: 'Notes cannot exceed 1000 characters' }
  },
  exerciseDuration: {
    min: { value: 0, message: 'Exercise duration must be positive' }
  },
  caffeine: {
    min: { value: 0, message: 'Caffeine amount must be positive' }
  },
  water: {
    min: { value: 0, message: 'Water glasses must be positive' }
  },
  deepWorkHours: {
    min: { value: 0, message: 'Deep work hours must be positive' },
    max: { value: 24, message: 'Deep work hours cannot exceed 24' }
  },
  screenTime: {
    min: { value: 0, message: 'Screen time must be positive' }
  }
} as const;