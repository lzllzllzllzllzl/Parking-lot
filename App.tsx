import React, { useState, useEffect, useMemo } from 'react';
import { generateHistoricalData, MOCK_PARKING_LOTS } from './services/mockData';
import { QLearningAgent } from './services/qLearning';
import { ParkingLot, WeatherCondition, DayType } from './types';
import ParkingMap from './components/ParkingMap';
import PredictionPanel from './components/PredictionPanel';
import AdminDashboard from './components/AdminDashboard';
import { Map, BarChart2, User, Search, Navigation2 } from 'lucide-react';

// Tab Enum
enum Tab {
  Home = 'Home',
  Predict = 'Predict',
  Admin = 'Admin'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [qAgent] = useState(() => new QLearningAgent());
  const [dataReady, setDataReady] = useState(false);
  
  // Memoize data generation so it doesn't run on every render
  const historicalData = useMemo(() => generateHistoricalData(), []);

  // Train Model on Mount
  useEffect(() => {
    // Simulate async loading/training
    const timer = setTimeout(() => {
      qAgent.initialize(historicalData);
      qAgent.train(historicalData);
      setDataReady(true);
      // Default select first lot
      setSelectedLot(MOCK_PARKING_LOTS[0]);
    }, 1000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePredict = (time: string, weather: WeatherCondition, dayType: DayType) => {
    return qAgent.getPrediction(time, weather, dayType);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 px-6 py-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Navigation2 className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">SmartPark <span className="text-indigo-600">Q-AI</span></h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
           <img src="https://picsum.photos/100/100" alt="User" className="w-full h-full object-cover" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl p-4 md:p-6">
        
        {/* Loading State */}
        {!dataReady && (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium animate-pulse">Training Q-Learning Model...</p>
                <p className="text-xs text-slate-400 mt-2">Processing {historicalData.length} historical records</p>
            </div>
        )}

        {/* Tab Content */}
        {dataReady && (
            <>
                {activeTab === Tab.Home && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Status Card */}
                        {selectedLot && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedLot.name}</h2>
                                    <p className="text-slate-500 text-sm flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Open 24/7 • ${selectedLot.baseRate}/hr
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-indigo-600">{selectedLot.currentAvailable}</div>
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Spots Left</div>
                                </div>
                            </div>
                        )}

                        <ParkingMap 
                            lots={MOCK_PARKING_LOTS} 
                            selectedLot={selectedLot} 
                            onSelect={setSelectedLot} 
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                                Navigate Now
                            </button>
                            <button className="bg-white text-indigo-600 border border-indigo-100 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors">
                                Reserve Spot
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === Tab.Predict && (
                    <div className="animate-fade-in">
                        <div className="mb-4">
                             <h2 className="text-xl font-bold text-slate-800">Future Availability</h2>
                             <p className="text-slate-500 text-sm">Use our Q-Learning model to plan ahead.</p>
                        </div>
                        <PredictionPanel onPredict={handlePredict} />
                    </div>
                )}

                {activeTab === Tab.Admin && (
                    <div className="animate-fade-in">
                         <div className="mb-4">
                             <h2 className="text-xl font-bold text-slate-800">Management Dashboard</h2>
                             <p className="text-slate-500 text-sm">Analyze patterns and optimize pricing.</p>
                        </div>
                        <AdminDashboard historicalData={historicalData} />
                    </div>
                )}
            </>
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 shadow-lg z-50">
        <div className="flex justify-around items-center max-w-md mx-auto md:max-w-2xl lg:max-w-4xl pb-4">
            <button 
                onClick={() => setActiveTab(Tab.Home)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${activeTab === Tab.Home ? 'text-indigo-600 bg-indigo-50 w-20' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Map className="w-6 h-6" />
                <span className="text-[10px] font-bold">Map</span>
            </button>
            
            <button 
                onClick={() => setActiveTab(Tab.Predict)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${activeTab === Tab.Predict ? 'text-indigo-600 bg-indigo-50 w-20' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Search className="w-6 h-6" />
                <span className="text-[10px] font-bold">Predict</span>
            </button>
            
            <button 
                onClick={() => setActiveTab(Tab.Admin)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${activeTab === Tab.Admin ? 'text-indigo-600 bg-indigo-50 w-20' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <BarChart2 className="w-6 h-6" />
                <span className="text-[10px] font-bold">Manage</span>
            </button>
        </div>
      </nav>
      
      {/* Styles for animation */}
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
        }
        .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 20px);
        }
      `}</style>
    </div>
  );
};

export default App;