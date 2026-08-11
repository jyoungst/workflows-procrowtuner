import { useState, useCallback, useRef, useEffect } from 'react';
import { LogEntry, CanFrame } from '../types.ts';

export const useSerial = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [canFrames, setCanFrames] = useState<Record<string, CanFrame>>({});
  
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const writerRef = useRef<any>(null);
  const keepReadingRef = useRef(true);
  const lastFrameTimestampRef = useRef<Record<string, number>>({});

  const addLog = useCallback((type: LogEntry['type'], data: string, source: string = 'SERIAL') => {
    setLogs(prev => [...prev.slice(-400), { timestamp: Date.now(), type, data, source }]);
  }, []);

  const parseCanLine = useCallback((line: string) => {
    // Format: CAN: 0x316 8 [12, 45, FC, 00, 88, 11, 00, 00]
    const canRegex = /^CAN:\s+(0x[0-9A-Fa-f]+)\s+(\d+)\s+\[([0-9A-Fa-f,\s]+)\]/;
    const match = line.match(canRegex);

    if (match) {
      const id = match[1].toUpperCase();
      const dlc = parseInt(match[2], 10);
      const data = match[3].split(',').map(b => b.trim().toUpperCase());
      const now = Date.now();
      const prevTime = lastFrameTimestampRef.current[id] || now;
      const deltaMs = now - prevTime;
      lastFrameTimestampRef.current[id] = now;

      setCanFrames(prev => {
        const existing = prev[id];
        return {
          ...prev,
          [id]: {
            id,
            dlc,
            data,
            timestamp: now,
            count: (existing?.count || 0) + 1,
            deltaMs,
            isExt: id.length > 5,
            notes: existing?.notes || (id === '0x316' ? 'DME Engine Speed / Temp' : id === '0x329' ? 'DME Coolant / Cruise' : id === '0x130' ? 'CAS Ignition Key Status' : undefined)
          }
        };
      });
    }
  }, []);

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        console.error("Error canceling reader", e);
      }
    }
    
    if (writerRef.current) {
      try {
        writerRef.current.releaseLock();
      } catch (e) {}
    }

    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (e) {
        console.error("Error closing port", e);
      }
    }

    portRef.current = null;
    readerRef.current = null;
    writerRef.current = null;
    setIsConnected(false);
    addLog('info', 'Xtrons USB Serial Host disconnected.');
  }, [addLog]);

  const readLoop = useCallback(async () => {
    if (!portRef.current) return;

    while (portRef.current.readable && keepReadingRef.current) {
      readerRef.current = portRef.current.readable.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { value, done } = await readerRef.current.read();
          if (done) break;
          
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            const lines = buffer.split(/[\r\n]+/);
            if (lines.length > 1) {
              for (let i = 0; i < lines.length - 1; i++) {
                const line = lines[i].trim();
                if (line) {
                  if (line.startsWith('CAN:')) {
                    parseCanLine(line);
                  }
                  addLog('rx', line, 'OBD/CAN');
                }
              }
              buffer = lines[lines.length - 1];
            }
          }
        }
      } catch (error: any) {
        addLog('error', `Serial Read Error: ${error.message}`);
      } finally {
        if (readerRef.current) {
          try {
            readerRef.current.releaseLock();
          } catch (e) {}
        }
      }
    }
  }, [addLog, parseCanLine]);

  const connect = useCallback(async () => {
    if (!('serial' in navigator)) {
      addLog('error', 'Web Serial API is required on Android Xtrons Head Unit Chrome runtime.');
      return;
    }

    try {
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      // Speeduino Teensy 4.1 standard speed is 115200; high speed CAN gateway runs at 230400 or 115200
      await port.open({ baudRate: 115200 });
      
      portRef.current = port;
      keepReadingRef.current = true;
      setIsConnected(true);
      addLog('info', 'Connected to USB OBD2 / Teensy 4.1 Hardware Interface.');
      
      // Auto-init command sequence for ELM327 / Speeduino mode
      setTimeout(() => write('ATZ\r'), 300);
      setTimeout(() => write('ATE0\r'), 600);
      setTimeout(() => write('ATSP0\r'), 900);
      setTimeout(() => write('AT MA\r'), 1200); // Monitor All CAN bus messages

      readLoop();
    } catch (error: any) {
      addLog('error', `Connection refused or failed: ${error.message}`);
      setIsConnected(false);
    }
  }, [addLog, readLoop]);

  const write = useCallback(async (data: string) => {
    if (!portRef.current || !portRef.current.writable) {
      addLog('error', 'Serial port is offline.');
      return;
    }

    const encoder = new TextEncoder();
    writerRef.current = portRef.current.writable.getWriter();
    
    try {
      await writerRef.current.write(encoder.encode(data));
      addLog('tx', data.trim());
    } catch (error: any) {
      addLog('error', `TX write failed: ${error.message}`);
    } finally {
      try {
        writerRef.current.releaseLock();
      } catch (e) {}
    }
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  return {
    isConnected,
    logs,
    canFrames,
    connect,
    disconnect,
    write,
    clearLogs
  };
};
