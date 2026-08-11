import { DiagnosticPCode } from '../types.ts';

export const PCODE_DATABASE: DiagnosticPCode[] = [
  {
    code: 'P0300 / 29CC',
    hexCode: '0x29CC',
    subsystem: 'DME_ENGINE',
    description: 'Multiple Cylinder Misfire Detected under High Load',
    aiDiagnosticFix: 'Check ignition dwell timing on Standalone map. Enrich VE cell by +8% in 4000 RPM range.',
    canPatchAvailable: true
  },
  {
    code: '29F2',
    hexCode: '0x29F2',
    subsystem: 'DME_ENGINE',
    description: 'High Pressure Fuel System (HPFP) Pressure Too Low',
    aiDiagnosticFix: 'HPFP solenoid duty cycle error. Verify CAN 0x329 rail pressure feedback signal.',
    canPatchAvailable: true
  },
  {
    code: '2A82',
    hexCode: '0x2A82',
    subsystem: 'DME_ENGINE',
    description: 'VANOS Intake Camshaft Position Control Stiff / Jammed',
    aiDiagnosticFix: 'Recalibrate VANOS PWM duty cycle map in Copycat tuner or flush solenoid valve.',
    canPatchAvailable: true
  },
  {
    code: '4B90 / P1620',
    hexCode: '0x4B90',
    subsystem: 'CAS_EWS_IMMOBILIZER',
    description: 'CAS-DME Rolling Secret Key ISN Mismatch (Start Prevented)',
    aiDiagnosticFix: 'Execute BDM ISN write or enable ESP32-D CAN Emulator fallback node to bypass EWS.',
    canPatchAvailable: true
  },
  {
    code: '580F',
    hexCode: '0x580F',
    subsystem: 'EGS_TCU_TRANSMISSION',
    description: 'EGS Mechatronic Clutch Torque Shift Slip Detected',
    aiDiagnosticFix: 'Increase CAN 0x1D2 requested engine torque reduction flag duration by +15ms.',
    canPatchAvailable: true
  },
  {
    code: 'A46D',
    hexCode: '0xA46D',
    subsystem: 'CCC_IDRIVE',
    description: 'CCC / CIC iDrive Head Unit K-CAN Bus Wakeup Failure',
    aiDiagnosticFix: 'Send K-CAN 0x130 Terminal 15 active pulse to awaken iDrive screen and amplifier.',
    canPatchAvailable: true
  },
  {
    code: 'A3B4',
    hexCode: '0xA3B4',
    subsystem: 'CCC_IDRIVE',
    description: 'Instrument Cluster KOMBI CAN Communication Timeout',
    aiDiagnosticFix: 'Inject simulated cluster heartbeat on CAN 0x316 (Engine Speed & Water Temp).',
    canPatchAvailable: true
  }
];
