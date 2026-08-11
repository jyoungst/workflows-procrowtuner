export interface LogEntry {
  timestamp: number;
  type: 'tx' | 'rx' | 'info' | 'error' | 'can' | 'speeduino' | 'dump' | 'bdm' | 'bcm' | 'emulation' | 'watchdog' | 'pcode';
  data: string;
  source?: string;
}

export interface ObdData {
  rpm: number;
  speed: number;
  coolantTemp: number;
  manifoldPressure: number; // MAP (kPa)
  afrTarget: number;
  afrActual: number;
  tps: number; // Throttle position %
  sparkAdvance: number; // deg BTDC
  dwell: number; // ms
  batteryVolts: number;
}

export type TabType = 'dashboard' | 'ecus' | 'flasher' | 'standalone' | 'copycat' | 'bdmjtag' | 'canbus' | 'bcm' | 'emulator' | 'dumps' | 'terminal' | 'ai' | 'settings';

export interface DiagnosticPCode {
  code: string; // e.g., "P0300", "29F2", "2A82"
  hexCode: string;
  subsystem: 'DME_ENGINE' | 'EGS_TCU_TRANSMISSION' | 'CAS_EWS_IMMOBILIZER' | 'CCC_IDRIVE' | 'FRM_LIGHTING';
  description: string;
  aiDiagnosticFix: string;
  canPatchAvailable: boolean;
}

export interface EcuDefinition {
  id: string;
  brand: string;
  family: string;
  architecture: '8-bit' | '16-bit' | '32-bit' | '64-bit ARM';
  busType: 'CAN 500k' | 'CAN 250k' | 'K-Line (ISO9141)' | 'KW2000' | 'J1939';
  maxDumpSizeMb: number;
  compatibilityNote: string;
  supportedByArduinoQ: boolean;
}

export interface CanFrame {
  id: string;
  dlc: number;
  data: string[];
  timestamp: number;
  count: number;
  deltaMs: number;
  isExt: boolean;
  notes?: string;
}

export interface CasEwsState {
  status: 'IDLE' | 'SNIFFING' | 'KEY_EXCHANGED' | 'SYNC_FAILED' | 'EMULATING';
  capturedSecretKey: string | null;
  isnCode: string | null;
  rollingCode: string | null;
  esp32EmulatorConnected: boolean;
  esp32Ip: string;
}

export interface StandaloneTune {
  fileName: string;
  lastSaved: string;
  veTable: number[][];
  ignitionTable: number[][];
  afrTable: number[][];
  rpmBins: number[];
  loadBins: number[];
  burnStatus: 'clean' | 'modified' | 'burning' | 'synced';
}

export interface AiWatchdogSuggestion {
  id: string;
  timestamp: string;
  severity: 'WARNING' | 'OPTIMIZATION' | 'CRITICAL';
  component: 'VE_TABLE' | 'SPARK_ADVANCE' | 'AFR_TARGET' | 'KNOCK_DETECTED';
  title: string;
  reasoning: string;
  proposedFix: string;
  applied: boolean;
}

export type CopycatTableKey = 'partThrottleFuel' | 'fullThrottleFuel' | 'vanosIntakeCamAdvance' | 'vanosExhaustCamAdvance' | 'ignitionBase' | 'dwellControl';

export interface CopycatMapProfile {
  id: string;
  stockDmeName: string;
  ecuFamily: string;
  extractedMaps: {
    partThrottleFuel: number[][];
    fullThrottleFuel: number[][];
    vanosIntakeCamAdvance: number[][];
    vanosExhaustCamAdvance: number[][];
    ignitionBase: number[][];
    dwellControl: number[][];
  };
  rpmBins: number[];
  loadBins: number[];
  targetStandaloneEcu: 'Speeduino Teensy 4.1' | 'Arduino Uno Q' | 'Custom Megasquirt';
  transferredAt: string;
  compatibilityMatchPercent: number;
}

export interface ClientNode {
  id: string;
  name: string;
  type: 'HERMES_LLM' | 'SPEEDUINO_TEENSY' | 'ARDUINO_UNO_Q' | 'ESP32_EMULATOR' | 'REMOTE_TUNER' | 'OBD_DONGLE';
  ipAddress: string;
  connectedAt: number;
  bytesTransferred: number;
  status: 'ACTIVE' | 'STANDBY' | 'ERROR';
}

export interface FirmwareDump {
  id: string;
  fileName: string;
  moduleType: 'DME_ECU' | 'CAS_IMMOBILIZER' | 'EWS_MODULE' | 'SPEEDUINO_EEPROM' | 'TCU_TRANSMISSION';
  fileSizeMb: number;
  sha256Checksum: string;
  extractedAt: string;
  targetHardware: string;
  retrofitStatus: 'CATALOGED' | 'ANALYZED' | 'RETROFIT_READY' | 'MAPPED';
  driveSynced: boolean;
  notes: string;
}

export interface BdmJtagPinout {
  protocol: 'BDM-100 (MPC5xx)' | 'JTAG TriCore (TC17xx)' | 'Nexus (MPC55xx)' | 'K-Tag BDM Bench' | 'C167 Bootmode';
  vccVolts: string;
  resetPin: string;
  tckSckPin: string;
  tdiRxPin: string;
  tdoTxPin: string;
  bootModePin: string;
  description: string;
}

export interface EcuCloneJob {
  id: string;
  sourceModule: string;
  targetModule: string;
  isnSyncStatus: 'EXTRACTED' | 'TRANSFERRED' | 'EMULATED' | 'PENDING';
  flashSizeKb: number;
  eepromSizeKb: number;
  otpSectorLocked: boolean;
  checksumValid: boolean;
  cloneMode: 'FULL_CLONE' | 'ISN_TRANSFER_ONLY' | 'EMULATED_EWS_BYPASS';
}

export interface BcmDiscoveredModule {
  id: string;
  name: string;
  bus: 'K-CAN 100k' | 'PT-CAN 500k' | 'LIN Bus';
  verifiedCommand: string;
  functionType: 'DOOR_LOCK' | 'WINDOW_ROLL' | 'LIGHT_STROBE' | 'MIRROR_FOLD' | 'SUNROOF';
  confidenceScore: number;
  status: 'IDENTIFIED' | 'SNIFFING' | 'MAPPED';
}

export interface PhoneSecurityToken {
  deviceId: string;
  deviceName: string;
  pairedAt: string;
  tokenHash: string;
  isAuthorized: boolean;
  lastChallengeResponseMs: number;
}

export interface TuneFileMap {
  id: string;
  fileName: string;
  fileType: 'BIN' | 'XDF' | 'OLS' | 'MSQ';
  sizeKb: number;
  source: 'GOOGLE_DRIVE_AI' | 'USER_UPLOAD' | 'EXTRACTED_DME';
  uploadedAt: string;
  tableCount: number;
  description: string;
}

export interface MissingSignalAnomaly {
  id: string;
  signalName: string;
  expectedHz: number;
  lastSeenMsAgo: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  suggestedEmulationLogic: string;
  approvalStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE_EMULATION' | 'REJECTED';
}

export interface Esp32RomJob {
  id: string;
  targetDevice: 'ESP32-D Wi-Fi/Bluetooth Node';
  generatedCppCode: string;
  romVersion: string;
  compiledAt: string;
  flashedToEsp32: boolean;
}
