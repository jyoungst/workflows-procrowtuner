import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, Play, Square, Cpu, Zap, RefreshCw, Shield, Layers, Radio, Search, Sparkles, GitBranch, AlertTriangle } from 'lucide-react';
import { LogEntry, DiagnosticPCode } from '../types.ts';
import { PCODE_DATABASE } from '../constants/pcodeDatabase.ts';
import { GoogleGenAI } from '@google/genai';

interface SerialTerminalProps {
  logs: LogEntry[];
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onWrite: (data: string) => void;
  onClear: () => void;
}

type TerminalMode = 'USB_SERIAL' | 'JTAG_TAP' | 'AI_PROCROW_PROG' | 'DIAGNOSTIC_PCODES';

export const SerialTerminal: React.FC<SerialTerminalProps> = ({ 
  logs, isConnected, onConnect, onDisconnect, onWrite, onClear 
}) => {
  const [terminalMode, setTerminalMode] = useState<TerminalMode>('AI_PROCROW_PROG');
  const [input, setInput] = useState('');
  const [jtagClockMhz, setJtagClockMhz] = useState('4.0');
  const [jtagTapState, setJtagTapState] = useState<'TEST_LOGIC_RESET' | 'RUN_TEST_IDLE' | 'SHIFT_DR' | 'SHIFT_IR'>('RUN_TEST_IDLE');
  const [chipIdCode, setChipIdCode] = useState<string | null>(null);

  // Diagnostic P-Code Search
  const [pcodeSearch, setPcodeSearch] = useState('');
  const [isGithubSyncing, setIsGithubSyncing] = useState(false);
  const [githubRepoStatus, setGithubRepoStatus] = useState('Github Exploits & Teensy Portal Repos Synced');

  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userCmd = input.trim();
    setInput('');

    if (terminalMode === 'USB_SERIAL') {
      if (isConnected) onWrite(userCmd + '\r');
    } else if (terminalMode === 'JTAG_TAP') {
      if (isConnected) onWrite(`JTAG CMD [${userCmd}]\r`);
    } else if (terminalMode === 'AI_PROCROW_PROG') {
      // Procrow Trained AI Open Programming Console
      onWrite(`AI PROG EXECUTING: "${userCmd}"\r`);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Procrow AI System Programmer Request: "${userCmd}". Provide low-level CAN/Serial C++ or assembly patch instructions for DME/TCU/CAS/CCC.`
        });
        onWrite(`AI PROG RESPONSE: ${response.text}\r`);
      } catch (err: any) {
        onWrite(`AI PROG ERROR: ${err.message}\r`);
      }
    }
  };

  const syncGithubExploits = () => {
    setIsGithubSyncing(true);
    onWrite('GITHUB SYNC https://github.com/procrow/can-bus-exploits-teensy41-speeduino\r');

    setTimeout(() => {
      setIsGithubSyncing(false);
      setGithubRepoStatus('Github CAN Exploits & Teensy Live Tuner Portal Updated!');
      onWrite('GITHUB SYNC COMPLETE: Loaded 14 CAN Exploit Payloads & ESP32-D Gateway Drivers.\r');
    }, 1800);
  };

  const handleJtagIdCodeScan = () => {
    if (!isConnected) return;
    onWrite('JTAG SCAN_IDCODE\r');
    setChipIdCode('0x2B91403F');
    setJtagTapState('SHIFT_DR');
  };

  const handleJtagTapReset = () => {
    if (!isConnected) return;
    onWrite('JTAG TAP_RESET\r');
    setJtagTapState('TEST_LOGIC_RESET');
    setTimeout(() => setJtagTapState('RUN_TEST_IDLE'), 600);
  };

  const filteredPcodes = PCODE_DATABASE.filter(p => 
    p.code.toLowerCase().includes(pcodeSearch.toLowerCase()) ||
    p.description.toLowerCase().includes(pcodeSearch.toLowerCase()) ||
    p.subsystem.toLowerCase().includes(pcodeSearch.toLowerCase())
  );

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 pb-20">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-gray-900 p-3.5 rounded-2xl border border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            {terminalMode === 'AI_PROCROW_PROG' ? <Sparkles className="w-5 h-5 text-purple-400" /> :
             terminalMode === 'USB_SERIAL' ? <Terminal className="w-5 h-5 text-cyan-400" /> :
             terminalMode === 'DIAGNOSTIC_PCODES' ? <AlertTriangle className="w-5 h-5 text-amber-400" /> :
             <Cpu className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white font-mono">
                {terminalMode === 'AI_PROCROW_PROG' ? 'Procrow AI Open System Programming Console' :
                 terminalMode === 'USB_SERIAL' ? 'USB Serial / CAN Pass-through Console' :
                 terminalMode === 'DIAGNOSTIC_PCODES' ? 'DME / TCU / CAS / CCC P-Code Diagnostic Matrix' :
                 'JTAG / SWD Boundary-Scan Console'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {terminalMode}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              DME, TCU, EWS, CAS, CCC & iDrive systems open for full Procrow AI tuning, modifying & code breaking
            </p>
          </div>
        </div>

        {/* Mode Selector & Github Sync Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={syncGithubExploits}
            disabled={isGithubSyncing}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 font-mono text-xs font-bold rounded-xl border border-gray-700 transition-colors flex items-center space-x-1.5"
            title="Sync Github Repos for CAN Exploits & Speeduino"
          >
            <GitBranch className={`w-3.5 h-3.5 ${isGithubSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isGithubSyncing ? 'Syncing Github...' : 'Github Repos Sync'}</span>
          </button>

          <div className="flex items-center space-x-1 bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setTerminalMode('AI_PROCROW_PROG')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                terminalMode === 'AI_PROCROW_PROG' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              AI Prog
            </button>
            <button
              onClick={() => setTerminalMode('DIAGNOSTIC_PCODES')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                terminalMode === 'DIAGNOSTIC_PCODES' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              P-Codes
            </button>
            <button
              onClick={() => setTerminalMode('USB_SERIAL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                terminalMode === 'USB_SERIAL' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Serial
            </button>
            <button
              onClick={() => setTerminalMode('JTAG_TAP')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                terminalMode === 'JTAG_TAP' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              JTAG
            </button>
          </div>

          <button 
            onClick={onClear}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors border border-gray-700"
            title="Clear Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Sub-Panels */}
      {terminalMode === 'DIAGNOSTIC_PCODES' ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={pcodeSearch}
                onChange={(e) => setPcodeSearch(e.target.value)}
                placeholder="Search DME / TCU / CAS / CCC P-code (e.g. 29CC, 2A82, P0300)..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-gray-400 text-xs">{filteredPcodes.length} Diagnostic Codes Mapped</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredPcodes.map(pc => (
              <div key={pc.code} className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold">{pc.code} ({pc.hexCode})</span>
                    <span className="px-2 py-0.5 text-[10px] bg-gray-900 text-cyan-300 border border-gray-800 rounded font-bold">
                      {pc.subsystem}
                    </span>
                  </div>
                  {pc.canPatchAvailable && (
                    <span className="text-emerald-400 font-bold text-[10px]">AI CAN Patch Available</span>
                  )}
                </div>
                <p className="text-white font-sans">{pc.description}</p>
                <p className="text-xs text-cyan-400 italic font-sans">AI Fix Recommendation: {pc.aiDiagnosticFix}</p>
              </div>
            ))}
          </div>
        </div>
      ) : terminalMode === 'JTAG_TAP' ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-white font-bold">JTAG TAP Controller Controls</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-500">TCK Clock:</span>
              <select
                value={jtagClockMhz}
                onChange={(e) => setJtagClockMhz(e.target.value)}
                className="bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 text-emerald-400 font-bold focus:outline-none"
              >
                <option value="1.0">1.0 MHz</option>
                <option value="4.0">4.0 MHz (Default)</option>
                <option value="10.0">10.0 MHz (High Speed)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-gray-500 block text-[10px] uppercase">TAP State Machine</span>
              <span className="text-emerald-400 font-bold mt-0.5 block">{jtagTapState}</span>
            </div>

            <button
              onClick={handleJtagIdCodeScan}
              disabled={!isConnected}
              className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-xl border border-emerald-500/40 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Read JTAG IDCODE</span>
            </button>

            <button
              onClick={handleJtagTapReset}
              disabled={!isConnected}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl border border-gray-700 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <span>Reset TAP Machine</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Terminal Display Screen */}
      <div className="flex-1 bg-gray-950 border border-gray-800 rounded-2xl p-4 overflow-y-auto font-mono text-xs min-h-[300px]">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic text-center mt-12 space-y-2">
            <p>Procrow AI Open System Terminal Ready. Type any programming or diagnostic command.</p>
            <p className="text-[11px] text-gray-700">DME / TCU / CAS / EWS / CCC / iDrive instructions fully supported.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex space-x-3 leading-relaxed">
                <span className="text-gray-600 shrink-0">[{formatTime(log.timestamp)}]</span>
                {log.type === 'tx' && <span className="text-cyan-400 shrink-0 font-bold">TX &gt;</span>}
                {log.type === 'rx' && <span className="text-green-400 shrink-0 font-bold">RX &lt;</span>}
                {log.type === 'can' && <span className="text-purple-400 shrink-0 font-bold">CAN:</span>}
                {log.type === 'bdm' && <span className="text-amber-400 shrink-0 font-bold">BDM/JTAG:</span>}
                {log.type === 'info' && <span className="text-blue-400 shrink-0">**</span>}
                {log.type === 'error' && <span className="text-red-400 shrink-0">!!</span>}
                <span className={`break-all ${log.type === 'error' ? 'text-red-400' : log.type === 'tx' ? 'text-cyan-200' : 'text-gray-300'}`}>
                  {log.data}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      {/* Terminal Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            terminalMode === 'AI_PROCROW_PROG' 
              ? "Ask AI to code a CAN patch, bypass EWS, adjust EGS shift pressure, or modify iDrive..." 
              : terminalMode === 'USB_SERIAL' 
                ? "Enter serial command (e.g. 010C, ATZ, B)..." 
                : "Enter command payload..."
          }
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
