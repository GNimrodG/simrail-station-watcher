import { Station } from "./types";

export const edrMap = new Map<string, string>([
  ["B", "T1_BZ"],     // Będzin
  ["Dra", "DOR"],     // Dorota
  ["DW", "DG_WZ"],    // Dąbrowa Górnicza Wschodnia
  ["DZ", "DG_ZA"],    // Dąbrowa Górnicza Ząbkowice
  ["Gr", "GRO_MAZ"],  // Grodzisk Mazowiecki
  ["Id", "IDZ"],      // Idzikowice
  ["Kr", "KOR"],      // Korytów
  ["ŁA", "LZ_LA"],    // Łazy Ła
  ["ŁC", "LZ_LC"],    // Łazy Łc
  ["Ol", "OZ"],       // Olszamowice
  ["Op", "OP_PO"],    // Opoczno Południe
  ["Se", "SZE"],      // Szeligi
  ["Sl", "SLK"],      // Sławków
  ["Spł1", "SG_PO"],  // Sosnowiec Południowy
  ["Zw", "ZA"],       // Zawiercie,
]);

export function getStationEDRLink(station: Station, serverCode: string) {
  return `https://edr.simrail.app/${serverCode}/station/${edrMap.get(station.Prefix) ?? station.Prefix.toUpperCase()}`;
}
