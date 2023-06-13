import { Station } from "./types";

export const edrMap = new Map<string, string>([
  ["B", "T1_BZ"],     // Będzin
  ["Gr", "GRO_MAZ"],  // Grodzisk Mazowiecki
  ["Id", "IDZ"],      // Idzikowice
  ["Op", "OP_PO"],    // Opoczno Południe
  ["Zw", "ZA"],       // Zawiercie
  ["Dra", "DOR"],     // Dorota
  ["DW", "DG_WZ"],    // Dąbrowa Górnicza Wschodnia
  ["Kr", "KOR"],      // Korytów
  ["ŁC", "LZ_LC"],    // Łazy Łc
  ["Ol", "OZ"],       // Olszamowice
  ["Se", "SZE"],      // Szeligi
  ["Spł1", "SG_PO"],  // Sosnowiec Południowy
]);

export function getStationEDRLink(station: Station, serverCode: string) {
  return `https://edr.simrail.app/${serverCode}/station/${edrMap.get(station.Prefix) || station.Prefix.toUpperCase()}`;
}
