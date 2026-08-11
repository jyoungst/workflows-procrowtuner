import { EcuDefinition } from '../types.ts';

export const ECU_DATABASE: EcuDefinition[] = [
  // Bosch Series
  { id: 'b-edc15v', brand: 'Bosch', family: 'EDC15V', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 0.5, compatibilityNote: 'VP37 Pump TDI. Supported via Arduino Uno Q K-Line bridge.', supportedByArduinoQ: true },
  { id: 'b-edc15p', brand: 'Bosch', family: 'EDC15P / EDC15P+', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 0.5, compatibilityNote: 'Pumpe Duse PD TDI. Direct OBD flash read.', supportedByArduinoQ: true },
  { id: 'b-edc16c31', brand: 'Bosch', family: 'EDC16C31', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'BMW M47 / M57 E60 diesel engines. Full BDM/OBD cataloging.', supportedByArduinoQ: true },
  { id: 'b-edc16c35', brand: 'Bosch', family: 'EDC16C35', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'BMW E60/E90 M57N2 engine. DDE625 full dump support.', supportedByArduinoQ: true },
  { id: 'b-edc16cp35', brand: 'Bosch', family: 'EDC16CP35', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'BMW N57 / M57 LCI. MPC563 flash & EEPROM dump.', supportedByArduinoQ: true },
  { id: 'b-edc17cp02', brand: 'Bosch', family: 'EDC17CP02', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 4.0, compatibilityNote: 'BMW N47/N57 Tricore TC1766/TC1796 password bypass required.', supportedByArduinoQ: false },
  { id: 'b-edc17cp09', brand: 'Bosch', family: 'EDC17CP09', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 4.0, compatibilityNote: 'BMW Advanced Diesel Tricore. Fast AI mapping.', supportedByArduinoQ: false },
  { id: 'b-m52', brand: 'Bosch', family: 'M5.2 / M5.2.1', architecture: '8-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 0.25, compatibilityNote: 'BMW M44 / M62 early. Read via K-Line adapter.', supportedByArduinoQ: true },
  { id: 'b-me71', brand: 'Bosch', family: 'ME7.1 / ME7.1.1', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 1.0, compatibilityNote: 'VAG 2.7T / 4.2V8. C167 processor, bootmode EEPROM read.', supportedByArduinoQ: true },
  { id: 'b-me75', brand: 'Bosch', family: 'ME7.5', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 1.0, compatibilityNote: 'VAG 1.8T 20V. Complete map offset definition ready.', supportedByArduinoQ: true },
  { id: 'b-me92', brand: 'Bosch', family: 'ME9.2', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'BMW N62 / N42 V8/I4. MPC555 processor dump.', supportedByArduinoQ: true },
  { id: 'b-med175', brand: 'Bosch', family: 'MED17.5 / MED17.5.5', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 4.0, compatibilityNote: 'VAG 2.0TSI / 1.4TSI Tricore TC1766.', supportedByArduinoQ: false },
  { id: 'b-mevd172', brand: 'Bosch', family: 'MEVD17.2 / MEVD17.2.2', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 4.0, compatibilityNote: 'BMW N20 / N55 Turbo. Tricore boot/bench AI disassembler.', supportedByArduinoQ: false },

  // Siemens Series
  { id: 's-ms41', brand: 'Siemens', family: 'MS41', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 0.25, compatibilityNote: 'BMW E36/E39 M52 engine. Siemens 80C166 processor.', supportedByArduinoQ: true },
  { id: 's-ms42', brand: 'Siemens', family: 'MS42', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 0.5, compatibilityNote: 'BMW E46/E39 M52TU engine. Dual VANOS 512KB flash.', supportedByArduinoQ: true },
  { id: 's-ms43', brand: 'Siemens', family: 'MS43', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 0.5, compatibilityNote: 'BMW E46 M54 engine. Siemens C167, full map definitions ready.', supportedByArduinoQ: true },
  { id: 's-ms45', brand: 'Siemens', family: 'MS45 / MS45.1', architecture: '16-bit', busType: 'CAN 500k', maxDumpSizeMb: 1.0, compatibilityNote: 'BMW E60/E83 M54 US spec. K+DCAN flash extraction.', supportedByArduinoQ: true },
  { id: 's-msd80', brand: 'Siemens', family: 'MSD80 / MSD81', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'BMW E60/E90 N54 Twin Turbo. TriCore/TC1796, MOSFET diagnostic mode.', supportedByArduinoQ: false },
  { id: 's-mss50', brand: 'Siemens', family: 'MSS50 / MSS52 / MSS54', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 1.0, compatibilityNote: 'BMW M3 E46 / M5 E39. Dual C167 CPUs, alpha-N tuning mode.', supportedByArduinoQ: true },
  { id: 's-mss60', brand: 'Siemens', family: 'MSS60 / MSS65', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'BMW E92 M3 S65 / E60 M5 S85 V10. MPC563 dual core.', supportedByArduinoQ: false },
  { id: 's-msv70', brand: 'Siemens', family: 'MSV70 / MSV80', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'BMW E60/E90 N52 Magnesium engine. Tricore/MPC563.', supportedByArduinoQ: true },
  { id: 's-ppd1', brand: 'Siemens', family: 'PPD1.1 / PPD1.2 / PPD1.5', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'VAG 2.0 TDI Piezo. MPC563 processor.', supportedByArduinoQ: true },
  { id: 's-simos7', brand: 'Siemens', family: 'Simos 3 / 7.1 / 6.2', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 0.5, compatibilityNote: 'VAG 1.6 / 2.0 MPI. Full map offset database.', supportedByArduinoQ: true },

  // Saab Trionic Series
  { id: 't-t5', brand: 'Saab', family: 'Trionic T5', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 0.25, compatibilityNote: 'Motorola 68332 CPU. Famous 16-bit DIY standalone candidate.', supportedByArduinoQ: true },
  { id: 't-t7', brand: 'Saab', family: 'Trionic T7', architecture: '16-bit', busType: 'CAN 500k', maxDumpSizeMb: 0.5, compatibilityNote: 'Motorola 68332. Mass air flow based torque tuning.', supportedByArduinoQ: true },
  { id: 't-t8', brand: 'Saab', family: 'Trionic T8', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 1.0, compatibilityNote: 'Motorola MPC555. Full CAN flasher & real-time log support.', supportedByArduinoQ: true },

  // Magneti Marelli
  { id: 'm-iaw4af', brand: 'Marelli', family: 'IAW4AF / IAW4AV / IAW5SF', architecture: '16-bit', busType: 'K-Line (ISO9141)', maxDumpSizeMb: 0.5, compatibilityNote: 'Fiat / Alfa Romeo ST10F269 processor.', supportedByArduinoQ: true },
  { id: 'm-mjd', brand: 'Marelli', family: 'MJD 6JF / 6F3 / 8F2', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'Multijet Diesel MPC555 / MPC563.', supportedByArduinoQ: true },

  // Delphi & Delco
  { id: 'd-dcm12', brand: 'Delphi', family: 'DCM1.2 / DCM3.2 / DCM3.4', architecture: '32-bit', busType: 'CAN 500k', maxDumpSizeMb: 2.0, compatibilityNote: 'Renault / Mercedes / VAG diesel.', supportedByArduinoQ: true },

  // Caterpillar & Industrial
  { id: 'c-adem3', brand: 'Caterpillar', family: 'ADEM3 / ADEM4', architecture: '32-bit', busType: 'J1939', maxDumpSizeMb: 4.0, compatibilityNote: 'Heavy duty diesel C7/C9/C13 engines.', supportedByArduinoQ: false },

  // Sagem & Phoenix
  { id: 's-s3000', brand: 'Sagem', family: 'S2000 / S3000', architecture: '16-bit', busType: 'CAN 250k', maxDumpSizeMb: 0.5, compatibilityNote: 'Renault Megane / Clio RS tuning.', supportedByArduinoQ: true },
  { id: 'p-l14', brand: 'Phoenix', family: 'L14 IV / L15 / L16', architecture: '32-bit', busType: 'J1939', maxDumpSizeMb: 2.0, compatibilityNote: 'John Deere industrial power systems.', supportedByArduinoQ: false },

  // SISU Diesel
  { id: 's-eem2', brand: 'SISU', family: 'EEM2r03 / EEM2r07', architecture: '32-bit', busType: 'CAN 250k', maxDumpSizeMb: 2.0, compatibilityNote: 'AGCO / SISU Tractor powertrain engines.', supportedByArduinoQ: false }
];
