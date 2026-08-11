import React, { useState, useEffect } from 'react';
import { Activity, Wifi, HardDrive, Cpu, Zap, Gauge, Server, ShieldCheck, RefreshCw, Radio, Smartphone, Database } from 'lucide-react';
import { ObdData, ClientNode } from '../types.ts';

interface DashboardProps {
  isConnected: boolean;
  isWifiShared: boolean;
  toggleWifiShare: () => void;
  clients: ClientNode[];
}

export const Dashboard: React.FC<DashboardProps> = ({ isConnected, isWifiShared, toggleWifiShare, clients }) => {
  const [telemetry, setTelemetry] = useState<ObdData>({
    rpm: 0,
    speed: 0,
    coolantTemp: 0,
    manifoldPressure: 0,
    afrTarget: 14.7,
    afrActual: 14.7,
    tps: 0,
    sparkAdvance: 10,
    dwell: 3.1,
    batteryVolts: 12.6
  });

  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [lastDriveSync, setLastDriveSync] = useState<string | null>('Today, 14:22 PM');

  // Live simulation feed when active
  useEffect(() => {
    let interval: number;
    if (isConnected) {
      interval = window.setInterval(() => {
        setTelemetry(prev => {
          const baseRpm = 850 + Math.sin(Date.now() / 1000) * 120 + Math.random() * 40;
          const map = 32 + Math.random() * 4;
          const afr = 14.7 + (Math.random() - 0.5) * 0.4;
          return {
            ...prev,
            rpm: Math.round(baseRpm),
            speed: 0,
            coolantTemp: 88,
            manifoldPressure: parseFloat(map.toFixed(1)),
            afrActual: parseFloat(afr.toFixed(2)),
            tps: Math.round(Math.random() * 3),
            sparkAdvance: parseFloat((14 + Math.random() * 2).toFixed(1)),
            batteryVolts: parseFloat((13.8 + Math.random() * 0.2).toFixed(1))
          };
        });
      }, 500);
    } else {
      setTelemetry({
        rpm: 0,
        speed: 0,
        coolantTemp: 0,
        manifoldPressure: 0,
        afrTarget: 14.7,
        afrActual: 0,
        tps: 0,
        sparkAdvance: 0,
        dwell: 0,
        batteryVolts: 0
      });
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleDriveSync = () => {
    setIsSyncingDrive(true);
    setTimeout(() => {
      setIsSyncingDrive(false);
      setLastDriveSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1800);
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto pb-20">
      {/* Top Bar Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl">
            <Smartphone className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Xtrons Head Unit (Android 12 Host)</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">Ai Procrow Master</span>
            </div>
            <p className="text-xs text-gray-400">USB OBD2/CAN Serial TCP Bridge Server for Local Hermes LLM, Teensy 4.1 & Arduino Uno Q</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-2 border ${isConnected ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span>{isConnected ? 'Serial Online (Teensy / Arduino Q)' : 'Serial Cable Disconnected'}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-2 border ${isWifiShared ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
            <Radio className="w-3.5 h-3.5" />
            <span>{isWifiShared ? 'TCP Host Port 35000 Active' : 'Wi-Fi Server Offline'}</span>
          </div>
        </div>
      </div>

      {/* Primary Engine Gauges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <GaugeWidget icon={<Activity className="w-5 h-5 text-cyan-400" />} label="RPM" value={telemetry.rpm} unit="RPM" highlight={telemetry.rpm > 6500} />
        <GaugeWidget icon={<Gauge className="w-5 h-5 text-purple-400" />} label="MAP Pressure" value={telemetry.manifoldPressure} unit="kPa" />
        <GaugeWidget icon={<Zap className="w-5 h-5 text-amber-400" />} label="Wideband AFR" value={telemetry.afrActual || '--'} unit={`Target ${telemetry.afrTarget}`} />
        <GaugeWidget icon={<Cpu className="w-5 h-5 text-red-400" />} label="Coolant Temp" value={telemetry.coolantTemp} unit="°C" />
        <GaugeWidget icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} label="Spark Advance" value={telemetry.sparkAdvance} unit="° BTDC" />
      </div>

      {/* Network Server & Hermes LLM Topology Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Server className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Local Wi-Fi Host Socket Server</h3>
                <p className="text-xs text-gray-400">Exposes CAN Bus / Speeduino raw streams to Hermes LLM & local devices</p>
              </div>
            </div>

            <button 
              onClick={toggleWifiShare}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isWifiShared ? 'bg-cyan-500' : 'bg-gray-800 border border-gray-700'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isWifiShared ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800/80">
              <span className="text-xs font-mono text-gray-400 uppercase">Host Binding IP</span>
              <p className="font-mono text-white text-base font-semibold mt-1">192.168.43.1:35000</p>
            </div>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800/80">
              <span className="text-xs font-mono text-gray-400 uppercase">Protocol Pass-through</span>
              <p className="font-mono text-cyan-400 text-base font-semibold mt-1">TCP Raw Socket / Speeduino A-Cmd</p>
            </div>
          </div>

          {/* Connected Network Clients Table */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Active Network Clients ({clients.length})</h4>
            <div className="space-y-2">
              {clients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-950 rounded-xl border border-gray-800/60 font-mono text-xs">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${client.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <div>
                      <span className="font-bold text-white block">{client.name}</span>
                      <span className="text-gray-500">{client.ipAddress} • {client.type}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-400 font-semibold block">{client.status}</span>
                    <span className="text-gray-500">{(client.bytesTransferred / 1024).toFixed(1)} KB transferred</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Remote Tuning Cloud / Google Drive Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <HardDrive className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Google Drive Cloud Storage</h3>
                <p className="text-xs text-gray-400">Remote Tune & Datalog Repositories</p>
              </div>
            </div>

            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-2 mb-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Folder Path:</span>
                <span className="text-cyan-400 font-mono">/Ai_Procrowtuning/Logs/</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Last Sync:</span>
                <span className="text-white font-mono">{lastDriveSync || 'Never'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Sync Status:</span>
                <span className="text-emerald-400 font-mono">Connected (OAuth2)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleDriveSync}
              disabled={isSyncingDrive}
              className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingDrive ? 'animate-spin' : ''}`} />
              <span>{isSyncingDrive ? 'Syncing with Drive...' : 'Sync Logs & Tunes to Cloud'}</span>
            </button>
            <p className="text-[11px] text-gray-500 text-center">
              Hermes LLM can automatically fetch downloaded .msq tune files and DME dumps (&lt;20MB) for retroactive deep cataloging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GaugeWidget = ({ icon, label, value, unit, highlight = false }: { icon: React.ReactNode, label: string, value: string | number, unit: string, highlight?: boolean }) => (
  <div className={`bg-gray-900 border ${highlight ? 'border-red-500/50 bg-red-950/10' : 'border-gray-800'} rounded-2xl p-4 flex flex-col justify-between`}>
    <div className="flex items-center space-x-2 mb-2">
      {icon}
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="mt-3">
      <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{unit}</div>
    </div>
  </div>
);
