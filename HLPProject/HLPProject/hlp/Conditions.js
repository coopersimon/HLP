import { readVFlag, readNFlag, readCFlag, readZFlag } from "./State";
export function checkAL(state) {
  return true;
}
export function checkEQ(state) {
  return readZFlag(state);
}
export function checkNE(state) {
  return !readZFlag(state);
}
export function checkCS(state) {
  return readCFlag(state);
}
export function checkCC(state) {
  return !readCFlag(state);
}
export function checkMI(state) {
  return readNFlag(state);
}
export function checkPL(state) {
  return !readNFlag(state);
}
export function checkVS(state) {
  return readVFlag(state);
}
export function checkVC(state) {
  return !readVFlag(state);
}
export function checkHI(state) {
  if (readCFlag(state)) {
    return !readZFlag(state);
  } else {
    return false;
  }
}
export function checkLS(state) {
  if (!readCFlag(state)) {
    return true;
  } else {
    return readZFlag(state);
  }
}
export function checkGE(state) {
  return readNFlag(state) === readVFlag(state);
}
export function checkLT(state) {
  return readNFlag(state) !== readVFlag(state);
}
export function checkGT(state) {
  if (!readZFlag(state)) {
    return readNFlag(state) === readVFlag(state);
  } else {
    return false;
  }
}
export function checkLE(state) {
  if (readZFlag(state)) {
    return readNFlag(state) !== readVFlag(state);
  } else {
    return false;
  }
}