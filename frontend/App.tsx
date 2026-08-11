import React, { useState } from 'react';
import { LayoutDashboard, TerminalSquare, Cpu, Settings, Radio, Flame, Database, Layers, Wrench, Key, Smartphone, Zap, Copy } from 'lucide-react';
import { Dashboard } from './components/Dashboard.tsx';
import { StandalonePortal } from './components/StandalonePortal.tsx';
import { StockCopycatTuner } from './components/StockCopycatTuner.tsx';
import { BdmJtagPortal } from './components/BdmJtagPortal.tsx';
import { CanBusSniffer } from './components/CanBusSniffer.tsx';
import { BcmController } from './components/BcmController.tsx';
import { TuneFlasherPortal } from './components/TuneFlasherPortal.tsx';
import { AiSignalEmulator } from './components/AiSignalEmulator.tsx';
import { FirmwareCatalog } from './components/FirmwareCatalog.tsx';
import { EcuDatabaseView } from './components/EcuDatabaseView.tsx';
import { SerialTerminal } from './components/SerialTerminal.tsx';
import { AiAnalyzer } from './components/AiAnalyzer.tsx';
import { SettingsTab } from './components/Settings.tsx';
import { useSerial } from './hooks/useSerial.ts';
import { TabType, ClientNode, EcuDefinition } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isWifiShared, setIsWifiShared] = useState(true);
  const [selectedEcuForAi, setSelectedEcuForAi] = useState<EcuDefinition | null>(null);

  const { isConnected, logs, canFrames, connect, disconnect, write, clearLogs } = useSerial();

  // Connected Client Nodes
  const [clientNodes] = useState<ClientNode[]>([
    {
      id: 'node-1',
      name: 'Hermes Local LLM Engine',
      type: 'HERMES_LLM',
      ipAddress: '192.168.43.50',
      connectedAt: Date.now() - 3600000,
      bytesTransferred: 482910,
      status: 'ACTIVE'
    },
    {
      id: 'node-2',
      name: 'Speeduino Teensy 4.1 ECU',
      type: 'SPEEDUINO_TEENSY',
      ipAddress: '192.168.43.88',
      connectedAt: Date.now() - 1800000,
      bytesTransferred: 1048576,
      status: 'ACTIVE'
    },
    {
      id: 'node-3',
      name: 'Arduino Uno Q (Legacy Gateway)',
      type: 'ARDUINO_UNO_Q',
      ipAddress: '192.168.43.92',
      connectedAt: Date.now() - 900000,
      bytesTransferred: 312000,
      status: 'ACTIVE'
    },
    {
      id: 'node-4',
      name: 'ESP32-D CAN Emulator',
      type: 'ESP32_EMULATOR',
      ipAddress: '192.168.43.105',
      connectedAt: Date.now() - 600000,
      bytesTransferred: 128400,
      status: 'STANDBY'
    }
  ]);

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'ecus', icon: <Layers className="w-5 h-5" />, label: 'ECU Matrix' },
    { id: 'flasher', icon: <Smartphone className="w-5 h-5" />, label: 'USB-C Flasher' },
    { id: 'standalone', icon: <Flame className="w-5 h-5" />, label: 'Standalone Tuner' },
    { id: 'copycat', icon: <Copy className="w-5 h-5" />, label: 'DME Copycat' },
    { id: 'bdmjtag', icon: <Wrench className="w-5 h-5" />, label: 'BDM / JTAG Bench' },
    { id: 'canbus', icon: <Radio className="w-5 h-5" />, label: 'CAN Sniffer' },
    { id: 'bcm', icon: <Key className="w-5 h-5" />, label: 'BCM & Security' },
    { id: 'emulator', icon: <Zap className="w-5 h-5" />, label: 'AI Signal Emulator' },
    { id: 'dumps', icon: <Database className="w-5 h-5" />, label: 'Firmware Dumps' },
    { id: 'terminal', icon: <TerminalSquare className="w-5 h-5" />, label: 'Terminal' },
    { id: 'ai', icon: <Cpu className="w-5 h-5" />, label: 'AI Assistant' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ] as const;

  const handleSelectEcuForAi = (ecu: EcuDefinition) => {
    setSelectedEcuForAi(ecu);
    setActiveTab('ai');
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 overflow-hidden font-sans text-gray-100">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between py-6 shrink-0">
        <div>
          <div className="mb-8 px-0 md:px-6 flex items-center justify-center md:justify-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-base font-extrabold text-white leading-tight">Ai Procrow</h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-wider">TUNING & CAN HUB</p>
            </div>
          </div>

          <div className="flex flex-col space-y-1 px-3 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex items-center justify-center md:justify-start space-x-3 p-2.5 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold' 
                    : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                }`}
              >
                <div>{item.icon}</div>
                <span className="hidden md:block text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="px-4 hidden md:block">
          <div className="bg-gray-950 rounded-xl p-3 border border-gray-800 text-[11px] font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Host:</span>
              <span className="text-cyan-400 font-bold">Xtrons A12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gateway:</span>
              <span className="text-emerald-400 font-bold">Arduino Q</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Screen Container */}
      <main className="flex-1 relative overflow-hidden bg-gray-950">
        {activeTab === 'dashboard' && (
          <Dashboard 
            isConnected={isConnected} 
            isWifiShared={isWifiShared}
            toggleWifiShare={() => setIsWifiShared(!isWifiShared)}
            clients={clientNodes}
          />
        )}

        {activeTab === 'ecus' && (
          <EcuDatabaseView 
            onSelectEcuForAnalysis={handleSelectEcuForAi}
          />
        )}

        {activeTab === 'flasher' && (
          <TuneFlasherPortal 
            isConnected={isConnected}
            onWriteSerial={write}
          />
        )}

        {activeTab === 'standalone' && (
          <StandalonePortal 
            isConnected={isConnected} 
            onWriteSerial={write} 
          />
        )}

        {activeTab === 'copycat' && (
          <StockCopycatTuner 
            onWriteSerial={write}
          />
        )}

        {activeTab === 'bdmjtag' && (
          <BdmJtagPortal 
            isConnected={isConnected}
            onWriteSerial={write}
          />
        )}

        {activeTab === 'canbus' && (
          <CanBusSniffer 
            canFrames={canFrames}
            isConnected={isConnected}
            onInjectCan={write}
          />
        )}

        {activeTab === 'bcm' && (
          <BcmController 
            isConnected={isConnected}
            onInjectCan={write}
          />
        )}

        {activeTab === 'emulator' && (
          <AiSignalEmulator 
            isConnected={isConnected}
            onWriteSerial={write}
          />
        )}

        {activeTab === 'dumps' && (
          <FirmwareCatalog 
            onWriteSerial={write}
          />
        )}

        {activeTab === 'terminal' && (
          <SerialTerminal 
            logs={logs}
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
            onWrite={write}
            onClear={clearLogs}
          />
        )}

        {activeTab === 'ai' && (
          <AiAnalyzer 
            logs={logs} 
            initialSelectedEcu={selectedEcuForAi}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </main>
    </div>
  );
};

export default App;
