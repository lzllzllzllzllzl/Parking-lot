import React, { useState, useEffect } from 'react';
import { WeatherCondition, DayType, PredictionResult } from '../types';
import { CloudRain, Sun, Cloud, CloudLightning, Calendar, Clock, Sparkles } from 'lucide-react';
import { getParkingAdvice } from '../services/gemini';

interface Props {
  onPredict: (time: string, weather: WeatherCondition, dayType: DayType) => PredictionResult;
}

const PredictionPanel: React.FC<Props> = ({ onPredict }) => {
  const [time, setTime] = useState("09:00");
  const [weather, setWeather] = useState<WeatherCondition>(WeatherCondition.Sunny);
  const [dayType, setDayType] = useState<DayType>(DayType.Weekday);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [advice, setAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const handlePredict = () => {
    const res = onPredict(time, weather, dayType);
    setResult(res);
    setAdvice(""); // Clear old advice
  };

  const fetchAdvice = async () => {
    if (!result) return;
    setLoadingAdvice(true);
    const txt = await getParkingAdvice(result, time, weather, dayType);
    setAdvice(txt);
    setLoadingAdvice(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        Smart Predict
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Time Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Target Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
            />
          </div>
        </div>

        {/* Weather Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Weather</label>
          <div className="flex gap-2">
            {[
              { type: WeatherCondition.Sunny, icon: Sun },
              { type: WeatherCondition.Rainy, icon: CloudRain },
            ].map((w) => (
              <button
                key={w.type}
                onClick={() => setWeather(w.type)}
                className={`flex-1 py-2 rounded-lg flex justify-center items-center transition-colors border ${
                  weather === w.type 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                    : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                }`}
              >
                <w.icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Day Type Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Day Type</label>
          <div className="flex gap-2">
            {[DayType.Weekday, DayType.Weekend].map((d) => (
              <button
                key={d}
                onClick={() => setDayType(d)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  dayType === d 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={handlePredict}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-200"
      >
        Predict Availability
      </button>

      {result && (
        <div className="mt-6 animate-fade-in">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex justify-between items-end mb-2">
              <span className="text-slate-500 text-sm font-medium">Predicted Spots</span>
              <span className="text-3xl font-bold text-slate-800">{result.predictedAvailability} <span className="text-sm text-slate-400 font-normal">/ 200</span></span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  result.predictedAvailability > 50 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${(result.predictedAvailability / 200) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-200 pt-3">
              <span>Model R²: 0.813</span>
              <span className="flex items-center gap-1">Q-Value: {result.qValue.toFixed(2)}</span>
            </div>
          </div>

          {/* AI Assistant Section */}
          <div className="mt-4">
             {!advice ? (
               <button 
                 onClick={fetchAdvice}
                 disabled={loadingAdvice}
                 className="flex items-center justify-center gap-2 w-full py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-medium disabled:opacity-50"
               >
                 {loadingAdvice ? (
                   <>Processing...</>
                 ) : (
                   <>
                     <Sparkles className="w-4 h-4" /> Ask AI Assistant
                   </>
                 )}
               </button>
             ) : (
               <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 text-sm text-slate-700 leading-relaxed">
                 <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold">
                    <Sparkles className="w-4 h-4" /> AI Advice
                 </div>
                 {advice}
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionPanel;