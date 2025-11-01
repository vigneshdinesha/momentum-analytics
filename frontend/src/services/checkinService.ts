import type { CheckinRequest, CheckinResponse } from '../types/checkin';
import { api } from './api';

export class CheckinService {
  private static readonly BASE_URL = '/api/checkin';

  /**
   * Create a new check-in entry
   */
  static async createCheckin(checkinData: CheckinRequest): Promise<CheckinResponse> {
    try {
      const response = await api.post<CheckinResponse>(this.BASE_URL, checkinData);
      return response.data;
    } catch (error) {
      console.error('Failed to create check-in:', error);
      throw new Error('Failed to create check-in');
    }
  }

  /**
   * Get check-ins for a specific date
   */
  static async getCheckinsByDate(date: string): Promise<CheckinResponse[]> {
    try {
      const response = await api.get<CheckinResponse[]>(`${this.BASE_URL}/date/${date}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return []; // No check-ins found for this date
      }
      console.error(`Failed to get check-ins for date ${date}:`, error);
      throw new Error('Failed to get check-ins');
    }
  }

  /**
   * Get the most recent check-in for today
   */
  static async getTodaysCheckin(): Promise<CheckinResponse | null> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const checkins = await this.getCheckinsByDate(today);
      return checkins.length > 0 ? checkins[0] : null; // Return most recent (first in array)
    } catch (error) {
      console.error('Failed to get today\'s check-in:', error);
      return null;
    }
  }

  /**
   * Get the latest check-in for a specific date
   */
  static async getLatestCheckinByDate(date: string): Promise<CheckinResponse | null> {
    try {
      const response = await api.get<CheckinResponse>(`${this.BASE_URL}/date/${date}/latest`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No check-in found for this date
      }
      console.error(`Failed to get latest check-in for date ${date}:`, error);
      throw new Error('Failed to get latest check-in');
    }
  }

  /**
   * Get recent check-ins (last N entries)
   */
  static async getRecentCheckins(limit: number = 7): Promise<CheckinResponse[]> {
    try {
      const response = await api.get<CheckinResponse[]>(`${this.BASE_URL}/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get recent check-ins:', error);
      throw new Error('Failed to get recent check-ins');
    }
  }

  /**
   * Get check-ins within a date range
   */
  static async getCheckinsByDateRange(
    startDate: string, 
    endDate: string
  ): Promise<CheckinResponse[]> {
    try {
      const response = await api.get<CheckinResponse[]>(
        `${this.BASE_URL}/range?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get check-ins by date range:', error);
      throw new Error('Failed to get check-ins');
    }
  }

  /**
   * Get a specific check-in by ID
   */
  static async getCheckinById(id: number): Promise<CheckinResponse> {
    try {
      const response = await api.get<CheckinResponse>(`${this.BASE_URL}/id/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get check-in with ID ${id}:`, error);
      throw new Error('Check-in not found');
    }
  }

  /**
   * Update an existing check-in
   */
  static async updateCheckin(id: number, checkinData: CheckinRequest): Promise<CheckinResponse> {
    try {
      const response = await api.put<CheckinResponse>(`${this.BASE_URL}/${id}`, checkinData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update check-in with ID ${id}:`, error);
      throw new Error('Failed to update check-in');
    }
  }

  /**
   * Delete a check-in by ID
   */
  static async deleteCheckin(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Failed to delete check-in with ID ${id}:`, error);
      throw new Error('Failed to delete check-in');
    }
  }

  /**
   * Get check-in statistics for analytics
   */
  static async getCheckinStats(days: number = 30): Promise<{
    totalCheckins: number;
    averageMood: number;
    averageEnergy: number;
    averageSleep: number;
    streakDays: number;
  }> {
    try {
      const response = await api.get(`${this.BASE_URL}/stats?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get check-in statistics:', error);
      throw new Error('Failed to get statistics');
    }
  }

  /**
   * Check if user has already checked in today
   */
  static async hasCheckedInToday(): Promise<boolean> {
    try {
      const todaysCheckin = await this.getTodaysCheckin();
      return todaysCheckin !== null;
    } catch (error) {
      console.error('Failed to check if user checked in today:', error);
      return false;
    }
  }

  /**
   * Get weekly summary of check-ins
   */
  static async getWeeklySummary(): Promise<CheckinResponse[]> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      return await this.getCheckinsByDateRange(startDate, endDate);
    } catch (error) {
      console.error('Failed to get weekly summary:', error);
      throw new Error('Failed to get weekly summary');
    }
  }

  /**
   * Get monthly summary of check-ins
   */
  static async getMonthlySummary(): Promise<CheckinResponse[]> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];
      
      return await this.getCheckinsByDateRange(startDate, endDate);
    } catch (error) {
      console.error('Failed to get monthly summary:', error);
      throw new Error('Failed to get monthly summary');
    }
  }

  /**
   * Validate check-in data before submission with context awareness
   */
  static validateCheckinData(data: CheckinRequest, isEditing: boolean = false): string[] {
    const errors: string[] = [];

    // Get current time context
    const now = new Date();
    const currentHour = now.getHours();
    
    // Determine what time periods have actually occurred
    const isMorningOver = currentHour >= 12; // After noon
    const isAfternoonOver = currentHour >= 18; // After 6 PM
    
    // For editing, we don't require future time periods to be filled
    // For new entries, we only validate time periods that have already occurred

    // Sleep validation (always valid since it's about last night)
    if (data.sleepHours !== undefined && (data.sleepHours < 0 || data.sleepHours > 24)) {
      errors.push('Sleep hours must be between 0 and 24');
    }

    if (data.sleepQuality !== undefined && (data.sleepQuality < 1 || data.sleepQuality > 10)) {
      errors.push('Sleep quality must be between 1 and 10');
    }

    // Energy validation - only validate time periods that have occurred or are set
    if (data.energyMorning !== undefined && (data.energyMorning < 1 || data.energyMorning > 10)) {
      errors.push('Morning energy level must be between 1 and 10');
    }

    // Only validate afternoon energy if it's afternoon/evening OR if user provided a value
    if (data.energyAfternoon !== undefined && (data.energyAfternoon < 1 || data.energyAfternoon > 10)) {
      errors.push('Afternoon energy level must be between 1 and 10');
    }

    // Only validate evening energy if it's evening OR if user provided a value  
    if (data.energyEvening !== undefined && (data.energyEvening < 1 || data.energyEvening > 10)) {
      errors.push('Evening energy level must be between 1 and 10');
    }

    // Stress validation
    if (data.stressLevel !== undefined && (data.stressLevel < 1 || data.stressLevel > 10)) {
      errors.push('Stress level must be between 1 and 10');
    }

    // Exercise validation - only validate if values are provided
    if (data.exerciseDuration !== undefined && data.exerciseDuration < 0) {
      errors.push('Exercise duration cannot be negative');
    }

    if (data.exerciseIntensity !== undefined && (data.exerciseIntensity < 1 || data.exerciseIntensity > 10)) {
      errors.push('Exercise intensity must be between 1 and 10');
    }

    // Water validation
    if (data.waterGlasses !== undefined && data.waterGlasses < 0) {
      errors.push('Water glasses cannot be negative');
    }

    // Productivity validation - only validate if value is provided
    if (data.productivityRating !== undefined && (data.productivityRating < 1 || data.productivityRating > 10)) {
      errors.push('Productivity rating must be between 1 and 10');
    }

    // Deep work validation
    if (data.deepWorkHours !== undefined && (data.deepWorkHours < 0 || data.deepWorkHours > 24)) {
      errors.push('Deep work hours must be between 0 and 24');
    }

    // Caffeine validation
    if (data.caffeineMg !== undefined && data.caffeineMg < 0) {
      errors.push('Caffeine amount cannot be negative');
    }

    return errors;
  }

  /**
   * Format check-in data for display
   */
  static formatCheckinForDisplay(checkin: CheckinResponse): {
    date: string;
    summary: string;
    details: Record<string, string>;
  } {
    const date = new Date(checkin.createdAt).toLocaleDateString();
    
    // Calculate average energy if multiple readings
    const avgEnergy = [checkin.energyMorning, checkin.energyAfternoon, checkin.energyEvening]
      .filter((energy): energy is number => energy !== undefined)
      .reduce((sum, energy, _, arr) => sum + energy / arr.length, 0);
    
    const summary = `Energy: ${avgEnergy ? Math.round(avgEnergy) : 'N/A'}/10 • Mood: ${checkin.mood || 'N/A'} • Sleep: ${checkin.sleepHours || 'N/A'}h`;
    
    const details: Record<string, string> = {};

    if (checkin.sleepHours) {
      details['Sleep'] = `${checkin.sleepHours} hours${checkin.sleepQuality ? ` (Quality: ${checkin.sleepQuality}/10)` : ''}`;
    }

    if (checkin.energyMorning || checkin.energyAfternoon || checkin.energyEvening) {
      const energyParts = [];
      if (checkin.energyMorning) energyParts.push(`Morning: ${checkin.energyMorning}`);
      if (checkin.energyAfternoon) energyParts.push(`Afternoon: ${checkin.energyAfternoon}`);
      if (checkin.energyEvening) energyParts.push(`Evening: ${checkin.energyEvening}`);
      details['Energy'] = energyParts.join(' • ');
    }

    if (checkin.mood) {
      details['Mood'] = checkin.mood;
    }

    if (checkin.stressLevel) {
      details['Stress'] = `${checkin.stressLevel}/10`;
    }

    if (checkin.exerciseType || checkin.exerciseDuration) {
      const exerciseParts = [];
      if (checkin.exerciseType) exerciseParts.push(checkin.exerciseType);
      if (checkin.exerciseDuration) exerciseParts.push(`${checkin.exerciseDuration} min`);
      if (checkin.exerciseIntensity) exerciseParts.push(`intensity ${checkin.exerciseIntensity}/10`);
      details['Exercise'] = exerciseParts.join(', ') || 'None';
    }

    if (checkin.waterGlasses) {
      details['Water'] = `${checkin.waterGlasses} glasses`;
    }

    if (checkin.caffeineMg) {
      details['Caffeine'] = `${checkin.caffeineMg}mg`;
    }

    if (checkin.deepWorkHours) {
      details['Deep Work'] = `${checkin.deepWorkHours} hours`;
    }

    if (checkin.productivityRating) {
      details['Productivity'] = `${checkin.productivityRating}/10`;
    }

    if (checkin.notes) {
      details['Notes'] = checkin.notes;
    }

    return { date, summary, details };
  }
}

export default CheckinService;