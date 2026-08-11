import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, Loader2, FileText, Sparkles, Cpu } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { LogEntry, EcuDefinition } from '../types.ts';

interface AiAnalyzerProps {
  logs: LogEntry[];
  initialSelectedEcu?: EcuDefinition | null;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const AiAnalyzer: React.FC<AiAnalyzerProps> = ({ logs, initialSelectedEcu }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: initialSelectedEcu 
        ? `Loaded profile for ${initialSelectedEcu.brand} ${initialSelectedEcu.family} (${initialSelectedEcu.architecture}, ${initialSelectedEcu.busType}). I am ready to disassemble its binary dump or assist with Speeduino / Arduino Uno Q translation. What is your objective?`
        : 'Greetings. I am the Ai Procrowtuning Assistant linked with Hermes and the Arduino Uno Q legacy gateway. I can dissemble DME/CAS binary dumps (<20MB), map discontinued automotive ECU signals onto newer hardware, analyze Speeduino Teensy 4.1 maps, or debug CAN bus handshakes. How can I assist your retrofit today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
      
      const recentLogs = logs.slice(-60).map(l => `[${l.type.toUpperCase()}] ${l.data}`).join('\n');
      
      const prompt = `
        You are an advanced automotive tuning, reverse engineering, and ECU disassembly AI assistant for "Ai Procrowtuning".
        The user is running this app on an Xtrons Android 12 Head Unit connected via USB serial to a Speeduino Teensy 4.1 ECU, an Arduino Uno Q legacy hardware node, and a CAN Bus interface linked to a local Hermes LLM.
        
        Selected Target ECU Profile:
        ${initialSelectedEcu ? `${initialSelectedEcu.brand} ${initialSelectedEcu.family} (${initialSelectedEcu.architecture}, Bus: ${initialSelectedEcu.busType})` : 'General Auto ECU'}

        Recent Serial / CAN Log Snippet:
        \`\`\`
        ${recentLogs || 'No active serial logs recorded.'}
        \`\`\`

        User Query: ${userText}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          role: 'user',
          parts: [{ text: prompt }]
        },
        config: {
          systemInstruction: 'You are a master engine tuner, ECU binary analyst, and CAN bus security specialist. Provide concise, high-value technical advice on Speeduino VE/spark map tuning, Arduino Uno Q legacy translation, DME binary dump mapping, and retrofitting discontinued components.'
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (error: any) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Error generating AI tuning analysis: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const attachLogs = () => {
    setInput(prev => prev + " Please perform an overall diagnostic and VE map check based on my latest logs.");
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-4 pb-20">
      <div className="flex items-center space-x-3 bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
          <BrainCircuit className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Ai Procrow Intelligent Tuning Assistant</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h2>
            {initialSelectedEcu && (
              <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                Active ECU: {initialSelectedEcu.family}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Gemini 2.5 Engine Analysis, Arduino Q Gateway & Disassembly Specialist</p>
        </div>
      </div>

      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-sm font-medium text-sm' 
                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-sm text-sm'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center space-x-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Analyzing Speeduino tables, Arduino Q signals & DME dumps...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex space-x-2">
        <button
          type="button"
          onClick={attachLogs}
          title="Attach Serial Logs"
          className="p-3 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-xl transition-colors border border-gray-800"
        >
          <FileText className="w-5 h-5 text-cyan-400" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about DME dumps, Arduino Q legacy translation, or CAS codes..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
