import { readPC, writePC, readCFlag, readReg, writeReg, writeZFlag, writeNFlag } from "./State";
export function movI(c, s, r, i, state) {
  var matchValue = [c(state), s];

  if (matchValue[0]) {
    if (matchValue[1]) {
      return (r < 0 ? function () {
        var n = true;
        return function (arg10_) {
          return writeNFlag(n, arg10_);
        };
      }() : function () {
        var n_1 = false;
        return function (arg10__1) {
          return writeNFlag(n_1, arg10__1);
        };
      }())((r === 0 ? function () {
        var z = true;
        return function (arg10__2) {
          return writeZFlag(z, arg10__2);
        };
      }() : function () {
        var z_1 = false;
        return function (arg10__3) {
          return writeZFlag(z_1, arg10__3);
        };
      }())(function (arg20_) {
        return writeReg(r, i, arg20_);
      }(state)));
    } else {
      return writeReg(r, i, state);
    }
  } else {
    return state;
  }
}
export function movR(c, r1, r2, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state), state);
  } else {
    return state;
  }
}
export function mvnI(c, r, i, state) {
  if (c(state)) {
    return writeReg(r, ~i, state);
  } else {
    return state;
  }
}
export function mvnR(c, r1, r2, state) {
  if (c(state)) {
    return writeReg(r1, ~readReg(r2, state), state);
  } else {
    return state;
  }
}
export function addI(c, r1, r2, i, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) + i, state);
  } else {
    return state;
  }
}
export function addR(c, r1, r2, r3, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) + readReg(r3, state), state);
  } else {
    return state;
  }
}
export function adcI(c, r1, r2, i, state) {
  if (c(state)) {
    if (readCFlag(state)) {
      return writeReg(r1, readReg(r2, state) + i + 1, state);
    } else {
      return writeReg(r1, readReg(r2, state) + i, state);
    }
  } else {
    return state;
  }
}
export function adcR(c, r1, r2, r3, state, insr, l) {
  if (c(state)) {
    if (readCFlag(state)) {
      return writeReg(r1, readReg(r2, state) + readReg(r3, state) + 1, state);
    } else {
      return writeReg(r1, readReg(r2, state) + readReg(r3, state), state);
    }
  } else {
    return state;
  }
}
export function subI(c, r1, r2, i, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) - i, state);
  } else {
    return state;
  }
}
export function subR(c, r1, r2, r3, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) - readReg(r3, state), state);
  } else {
    return state;
  }
}
export function sbcI(c, r1, r2, i, state) {
  if (c(state)) {
    if (readCFlag(state)) {
      return writeReg(r1, readReg(r2, state) - i, state);
    } else {
      return writeReg(r1, readReg(r2, state) - i - 1, state);
    }
  } else {
    return state;
  }
}
export function sbcR(c, r1, r2, r3, state) {
  if (c(state)) {
    if (readCFlag(state)) {
      return writeReg(r1, readReg(r2, state) - readReg(r3, state), state);
    } else {
      return writeReg(r1, readReg(r2, state) - readReg(r3, state) - 1, state);
    }
  } else {
    return state;
  }
}
export function rsbI(c, r1, r2, i, state) {
  if (c(state)) {
    return writeReg(r1, i - readReg(r2, state), state);
  } else {
    return state;
  }
}
export function rsbR(c, r1, r2, r3, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r3, state) - readReg(r2, state), state);
  } else {
    return state;
  }
}
export function rscI(c, r1, r2, i, state) {
  if (c(state)) {
    if (readCFlag(state)) {
      return writeReg(r1, i - readReg(r2, state), state);
    } else {
      return writeReg(r1, i - readReg(r2, state) - 1, state);
    }
  } else {
    return state;
  }
}
export function rscR(c, r1, r2, r3, state) {
  if (c(state)) {
    if (readCFlag(state)) {
      return writeReg(r1, readReg(r3, state) - readReg(r2, state), state);
    } else {
      return writeReg(r1, readReg(r3, state) - readReg(r2, state) - 1, state);
    }
  } else {
    return state;
  }
}
export function mulR(c, r1, r2, r3, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) * readReg(r3, state), state);
  } else {
    return state;
  }
}
export function mulRA(c, r1, r2, r3, r4, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) * readReg(r3, state) + readReg(r4, state), state);
  } else {
    return state;
  }
}
export function andI(c, r1, r2, i, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) & i, state);
  } else {
    return state;
  }
}
export function andR(c, r1, r2, r3, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) & readReg(r3, state), state);
  } else {
    return state;
  }
}
export function orrI(c, r1, r2, i, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) | i, state);
  } else {
    return state;
  }
}
export function orrR(c, r1, r2, r3, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) | readReg(r3, state), state);
  } else {
    return state;
  }
}
export function eorI(c, r1, r2, i, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) ^ i, state);
  } else {
    return state;
  }
}
export function eorR(c, r1, r2, r3, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) ^ readReg(r3, state), state);
  } else {
    return state;
  }
}
export function bicI(c, r1, r2, i, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) & ~i, state);
  } else {
    return state;
  }
}
export function bicR(c, r1, r2, r3, state) {
  if (c(state)) {
    return writeReg(r1, readReg(r2, state) & ~readReg(r3, state), state);
  } else {
    return state;
  }
}
export function b(c, label, state) {
  if (c(state)) {
    return writePC(label, state);
  } else {
    return state;
  }
}
export function bl(c, label, state) {
  if (c(state)) {
    return function (arg10_) {
      return writePC(label, arg10_);
    }(writeReg(14, readPC(state) + 4, state));
  } else {
    return state;
  }
}
export function bx(c, r, state) {
  if (c(state)) {
    return writePC(readReg(r, state), state);
  } else {
    return state;
  }
}
export function blxR(c, r, state) {
  if (c(state)) {
    return writePC(readReg(r, state), writeReg(14, readPC(state) + 4, state));
  } else {
    return state;
  }
}
export function blxL(c, label, state) {
  if (c(state)) {
    return function (arg10_) {
      return writePC(label, arg10_);
    }(writeReg(14, readPC(state) + 4, state));
  } else {
    return state;
  }
}
export function cmpI(c, r, i, state) {
  if (c(state)) {
    return state;
  } else {
    return state;
  }
}
export function cmpR(c, r1, r2, state) {
  if (c(state)) {
    return state;
  } else {
    return state;
  }
}