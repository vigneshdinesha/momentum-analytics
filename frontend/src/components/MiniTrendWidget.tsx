import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { CheckinResponse } from '../types/checkin';

interface MiniTrendWidgetProps {
  checkins: CheckinResponse[];
  metricKey: keyof CheckinResponse;
  title: string;
  color: string;
}

const MiniTrendWidget: React.FC<MiniTrendWidgetProps> = ({ 
  checkins, 
  metricKey, 
  title, 
  color 
}) => {
  // Process last 7 checkins for mini chart
  const chartData = checkins
    .slice(-7)
    .map((checkin, index) => {
      let value: number = 0;
      
      // Handle different metric types
      if (metricKey === 'sleepHours' || metricKey === 'sleepQuality' || 
          metricKey === 'productivityRating' || metricKey === 'stressLevel') {
        value = (checkin[metricKey] as number) || 0;
      } else if (metricKey === 'energyMorning') {
        // For energy, calculate average of all energy levels
        value = ((checkin.energyMorning || 0) + 
                (checkin.energyAfternoon || 0) + 
                (checkin.energyEvening || 0)) / 3;
      }

      return {
        day: index + 1,
        value: Math.round(value * 10) / 10
      };
    });

  const currentValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const previousValue = chartData.length > 1 ? chartData[chartData.length - 2].value : currentValue;
  const trend = currentValue > previousValue ? 'up' : currentValue < previousValue ? 'down' : 'stable';

  return (
    <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <div className="flex items-center space-x-1">
          {trend === 'up' && <span className="text-blue-400 text-sm">↗</span>}
          {trend === 'down' && <span className="text-blue-300 text-sm">↘</span>}
          {trend === 'stable' && <span className="text-slate-400 text-sm">→</span>}
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-blue-400' : 
            trend === 'down' ? 'text-blue-300' : 
            'text-slate-400'
          }`}>
            {trend === 'up' ? '+' : trend === 'down' ? '' : ''}
            {Math.round((currentValue - previousValue) * 10) / 10}
          </span>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xl font-bold text-white mb-1">
            {currentValue}
            {metricKey === 'sleepHours' && 'h'}
            {(metricKey === 'sleepQuality' || metricKey === 'productivityRating' || 
              metricKey === 'stressLevel' || metricKey === 'energyMorning') && '/10'}
          </div>
          <div className="text-xs text-slate-500 font-medium">Latest</div>
        </div>
        
        <div className="w-20 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MiniTrendWidget;