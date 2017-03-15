var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

import { setType } from "fable-core/Symbol";
import _Symbol from "fable-core/Symbol";
import { initState } from "./State";
import { split, match } from "fable-core/RegExp";
import { checkAL, checkLE, checkGT, checkLT, checkGE, checkHI, checkVC, checkVS, checkPL, checkMI, checkCC, checkCS, checkNE, checkEQ } from "./Conditions";
import { filter, map } from "fable-core/List";
import { toList } from "fable-core/Seq";
export var Token = function () {
  function Token(caseName, fields) {
    _classCallCheck(this, Token);

    this.Case = caseName;
    this.Fields = fields;
  }

  _createClass(Token, [{
    key: _Symbol.reflection,
    value: function () {
      return {
        type: "Parse.Tokeniser.Token",
        interfaces: ["FSharpUnion"],
        cases: {
          T_ADC: ["function", "boolean"],
          T_ADD: ["function", "boolean"],
          T_ADR: ["function"],
          T_AND: ["function", "boolean"],
          T_B: ["function"],
          T_BIC: ["function", "boolean"],
          T_BL: ["function"],
          T_BX: ["function"],
          T_CMN: ["function"],
          T_CMP: ["function"],
          T_COMMA: [],
          T_EOR: ["function", "boolean"],
          T_ERROR: [],
          T_EXCL: [],
          T_INT: ["number"],
          T_LABEL: ["string"],
          T_LDM: ["function"],
          T_LDR: ["function"],
          T_L_BRAC: [],
          T_MLA: ["function", "boolean"],
          T_MOV: ["function", "boolean"],
          T_MRS: ["function"],
          T_MSR: ["function"],
          T_MUL: ["function", "boolean"],
          T_MVN: ["function", "boolean"],
          T_NOP: ["function"],
          T_ORR: ["function", "boolean"],
          T_REG: ["number"],
          T_RSB: ["function", "boolean"],
          T_RSC: ["function", "boolean"],
          T_R_BRAC: [],
          T_SBC: ["function", "boolean"],
          T_SMLAL: ["function", "boolean"],
          T_SMULL: ["function", "boolean"],
          T_STM: ["function"],
          T_STR: ["function"],
          T_SUB: ["function", "boolean"],
          T_SWI: ["function"],
          T_SWP: ["function"],
          T_TEQ: ["function"],
          T_TST: ["function"],
          T_UMLAL: ["function", "boolean"],
          T_UMULL: ["function", "boolean"]
        }
      };
    }
  }, {
    key: "Equals",
    value: function (yobj) {
      var state = initState;

      if (yobj instanceof Token) {
        var matchValue = [this, yobj];
        var $var155 = matchValue[0].Case === "T_REG" ? matchValue[1].Case === "T_REG" ? [0, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_INT" ? matchValue[1].Case === "T_INT" ? [1, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_COMMA" ? matchValue[1].Case === "T_COMMA" ? [2] : [8] : matchValue[0].Case === "T_ERROR" ? matchValue[1].Case === "T_ERROR" ? [3] : [8] : matchValue[0].Case === "T_MOV" ? matchValue[1].Case === "T_MOV" ? [4, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [8] : matchValue[0].Case === "T_MVN" ? matchValue[1].Case === "T_MVN" ? [5, matchValue[0].Fields[0], matchValue[1].Fields[0], matchValue[0].Fields[1], matchValue[1].Fields[1]] : [8] : matchValue[0].Case === "T_MRS" ? matchValue[1].Case === "T_MRS" ? [6, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : matchValue[0].Case === "T_MSR" ? matchValue[1].Case === "T_MSR" ? [7, matchValue[0].Fields[0], matchValue[1].Fields[0]] : [8] : [8];

        switch ($var155[0]) {
          case 0:
            return $var155[1] === $var155[2];

          case 1:
            return $var155[1] === $var155[2];

          case 2:
            return true;

          case 3:
            return true;

          case 4:
            if ($var155[1](state) === $var155[2](state)) {
              return $var155[3] === $var155[4];
            } else {
              return false;
            }

          case 5:
            if ($var155[1](state) === $var155[2](state)) {
              return $var155[3] === $var155[4];
            } else {
              return false;
            }

          case 6:
            return $var155[1](state) === $var155[2](state);

          case 7:
            return $var155[1](state) === $var155[2](state);

          case 8:
            return false;
        }
      } else {
        return false;
      }
    }
  }]);

  return Token;
}();
setType("Parse.Tokeniser.Token", Token);
export var cond = "(|EQ|NE|CS|HS|CC|LO|MI|PL|VS|VC|HI|LS|GE|LT|GT|LE|AL)";
export var setFlags = "(|S)";

function _TOKEN_MATCH___(pattern, str) {
  var m = match(str, pattern, 1);

  if (m != null) {
    return {};
  } else {
    return null;
  }
}

export { _TOKEN_MATCH___ as $7C$TOKEN_MATCH$7C$_$7C$ };
export function matchCond(_arg1) {
  var activePatternResult324 = _TOKEN_MATCH___("EQ", _arg1);

  if (activePatternResult324 != null) {
    return function (state) {
      return checkEQ(state);
    };
  } else {
    var activePatternResult322 = _TOKEN_MATCH___("NE", _arg1);

    if (activePatternResult322 != null) {
      return function (state_1) {
        return checkNE(state_1);
      };
    } else {
      var activePatternResult320 = _TOKEN_MATCH___("CS", _arg1);

      if (activePatternResult320 != null) {
        return function (state_2) {
          return checkCS(state_2);
        };
      } else {
        var activePatternResult318 = _TOKEN_MATCH___("HS", _arg1);

        if (activePatternResult318 != null) {
          return function (state_3) {
            return checkCS(state_3);
          };
        } else {
          var activePatternResult316 = _TOKEN_MATCH___("CC", _arg1);

          if (activePatternResult316 != null) {
            return function (state_4) {
              return checkCC(state_4);
            };
          } else {
            var activePatternResult314 = _TOKEN_MATCH___("LO", _arg1);

            if (activePatternResult314 != null) {
              return function (state_5) {
                return checkCC(state_5);
              };
            } else {
              var activePatternResult312 = _TOKEN_MATCH___("MI", _arg1);

              if (activePatternResult312 != null) {
                return function (state_6) {
                  return checkMI(state_6);
                };
              } else {
                var activePatternResult310 = _TOKEN_MATCH___("PL", _arg1);

                if (activePatternResult310 != null) {
                  return function (state_7) {
                    return checkPL(state_7);
                  };
                } else {
                  var activePatternResult308 = _TOKEN_MATCH___("VS", _arg1);

                  if (activePatternResult308 != null) {
                    return function (state_8) {
                      return checkVS(state_8);
                    };
                  } else {
                    var activePatternResult306 = _TOKEN_MATCH___("VC", _arg1);

                    if (activePatternResult306 != null) {
                      return function (state_9) {
                        return checkVC(state_9);
                      };
                    } else {
                      var activePatternResult304 = _TOKEN_MATCH___("HI", _arg1);

                      if (activePatternResult304 != null) {
                        return function (state_10) {
                          return checkHI(state_10);
                        };
                      } else {
                        var activePatternResult302 = _TOKEN_MATCH___("GE", _arg1);

                        if (activePatternResult302 != null) {
                          return function (state_11) {
                            return checkGE(state_11);
                          };
                        } else {
                          var activePatternResult300 = _TOKEN_MATCH___("LT", _arg1);

                          if (activePatternResult300 != null) {
                            return function (state_12) {
                              return checkLT(state_12);
                            };
                          } else {
                            var activePatternResult298 = _TOKEN_MATCH___("GT", _arg1);

                            if (activePatternResult298 != null) {
                              return function (state_13) {
                                return checkGT(state_13);
                              };
                            } else {
                              var activePatternResult296 = _TOKEN_MATCH___("LE", _arg1);

                              if (activePatternResult296 != null) {
                                return function (state_14) {
                                  return checkLE(state_14);
                                };
                              } else {
                                var activePatternResult294 = _TOKEN_MATCH___("AL", _arg1);

                                if (activePatternResult294 != null) {
                                  return function (state_15) {
                                    return checkAL(state_15);
                                  };
                                } else {
                                  return function (state_16) {
                                    return checkAL(state_16);
                                  };
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
export function matchS(_arg1) {
  var activePatternResult327 = _TOKEN_MATCH___("S", _arg1);

  if (activePatternResult327 != null) {
    return true;
  } else {
    return false;
  }
}

function _INSTR_MATCH___(pattern, str) {
  var m = match(str, pattern + cond + "$", 1);

  if (m != null) {
    return matchCond(m[1]);
  } else {
    return null;
  }
}

export { _INSTR_MATCH___ as $7C$INSTR_MATCH$7C$_$7C$ };

function _INSTR_S_MATCH___(pattern, str) {
  var m = match(str, pattern + cond + setFlags + "$", 1);

  if (m != null) {
    return [matchCond(m[1]), matchS(m[2])];
  } else {
    return null;
  }
}

export { _INSTR_S_MATCH___ as $7C$INSTR_S_MATCH$7C$_$7C$ };

function _REG_MATCH___(str) {
  var m = match(str, "^R([0-9]|1[0-5])$", 1);

  if (m != null) {
    return Number.parseInt(m[1]);
  } else {
    return null;
  }
}

export { _REG_MATCH___ as $7C$REG_MATCH$7C$_$7C$ };

function _LABEL_MATCH___(str) {
  var m = match(str, "^([a-zA-Z]+)$");

  if (m != null) {
    return m[1];
  } else {
    return null;
  }
}

export { _LABEL_MATCH___ as $7C$LABEL_MATCH$7C$_$7C$ };

function _DEC_LIT_MATCH___(str) {
  var m = match(str, "^#?([0-9]+)$");

  if (m != null) {
    return Number.parseInt(m[1]);
  } else {
    return null;
  }
}

export { _DEC_LIT_MATCH___ as $7C$DEC_LIT_MATCH$7C$_$7C$ };

function _HEX_LIT_MATCH___(str) {
  var m = match(str, "^#?(0x[0-9a-fA-F]+)$");

  if (m != null) {
    return Number.parseInt(m[1], 16);
  } else {
    return null;
  }
}

export { _HEX_LIT_MATCH___ as $7C$HEX_LIT_MATCH$7C$_$7C$ };
export function stringToToken(_arg1) {
  var activePatternResult406 = _REG_MATCH___(_arg1);

  if (activePatternResult406 != null) {
    return new Token("T_REG", [activePatternResult406]);
  } else {
    var activePatternResult405 = _TOKEN_MATCH___("^a1$", _arg1);

    if (activePatternResult405 != null) {
      return new Token("T_REG", [0]);
    } else {
      var activePatternResult403 = _TOKEN_MATCH___("^a2$", _arg1);

      if (activePatternResult403 != null) {
        return new Token("T_REG", [1]);
      } else {
        var activePatternResult401 = _TOKEN_MATCH___("^a3$", _arg1);

        if (activePatternResult401 != null) {
          return new Token("T_REG", [2]);
        } else {
          var activePatternResult399 = _TOKEN_MATCH___("^a4$", _arg1);

          if (activePatternResult399 != null) {
            return new Token("T_REG", [3]);
          } else {
            var activePatternResult397 = _TOKEN_MATCH___("^v1$", _arg1);

            if (activePatternResult397 != null) {
              return new Token("T_REG", [4]);
            } else {
              var activePatternResult395 = _TOKEN_MATCH___("^v2$", _arg1);

              if (activePatternResult395 != null) {
                return new Token("T_REG", [5]);
              } else {
                var activePatternResult393 = _TOKEN_MATCH___("^v3$", _arg1);

                if (activePatternResult393 != null) {
                  return new Token("T_REG", [6]);
                } else {
                  var activePatternResult391 = _TOKEN_MATCH___("^v4$", _arg1);

                  if (activePatternResult391 != null) {
                    return new Token("T_REG", [7]);
                  } else {
                    var activePatternResult389 = _TOKEN_MATCH___("^v5$", _arg1);

                    if (activePatternResult389 != null) {
                      return new Token("T_REG", [8]);
                    } else {
                      var activePatternResult387 = _TOKEN_MATCH___("^v6$", _arg1);

                      if (activePatternResult387 != null) {
                        return new Token("T_REG", [9]);
                      } else {
                        var activePatternResult385 = _TOKEN_MATCH___("^v7$", _arg1);

                        if (activePatternResult385 != null) {
                          return new Token("T_REG", [10]);
                        } else {
                          var activePatternResult383 = _TOKEN_MATCH___("^v8$", _arg1);

                          if (activePatternResult383 != null) {
                            return new Token("T_REG", [11]);
                          } else {
                            var activePatternResult381 = _TOKEN_MATCH___("^sb$", _arg1);

                            if (activePatternResult381 != null) {
                              return new Token("T_REG", [9]);
                            } else {
                              var activePatternResult379 = _TOKEN_MATCH___("^sl$", _arg1);

                              if (activePatternResult379 != null) {
                                return new Token("T_REG", [10]);
                              } else {
                                var activePatternResult377 = _TOKEN_MATCH___("^fp$", _arg1);

                                if (activePatternResult377 != null) {
                                  return new Token("T_REG", [11]);
                                } else {
                                  var activePatternResult375 = _TOKEN_MATCH___("^ip$", _arg1);

                                  if (activePatternResult375 != null) {
                                    return new Token("T_REG", [12]);
                                  } else {
                                    var activePatternResult373 = _TOKEN_MATCH___("^sp$", _arg1);

                                    if (activePatternResult373 != null) {
                                      return new Token("T_REG", [13]);
                                    } else {
                                      var activePatternResult371 = _TOKEN_MATCH___("^lr$", _arg1);

                                      if (activePatternResult371 != null) {
                                        return new Token("T_REG", [14]);
                                      } else {
                                        var activePatternResult369 = _TOKEN_MATCH___("^pc$", _arg1);

                                        if (activePatternResult369 != null) {
                                          return new Token("T_REG", [15]);
                                        } else if (_arg1 === ",") {
                                          return new Token("T_COMMA", []);
                                        } else if (_arg1 === "[") {
                                          return new Token("T_L_BRAC", []);
                                        } else if (_arg1 === "]") {
                                          return new Token("T_R_BRAC", []);
                                        } else if (_arg1 === "!") {
                                          return new Token("T_EXCL", []);
                                        } else {
                                          var activePatternResult367 = _DEC_LIT_MATCH___(_arg1);

                                          if (activePatternResult367 != null) {
                                            return new Token("T_INT", [activePatternResult367]);
                                          } else {
                                            var activePatternResult366 = _HEX_LIT_MATCH___(_arg1);

                                            if (activePatternResult366 != null) {
                                              return new Token("T_INT", [activePatternResult366]);
                                            } else {
                                              var activePatternResult365 = _INSTR_S_MATCH___("^MOV", _arg1);

                                              if (activePatternResult365 != null) {
                                                return function (tupledArg) {
                                                  return new Token("T_MOV", [tupledArg[0], tupledArg[1]]);
                                                }(activePatternResult365);
                                              } else {
                                                var activePatternResult363 = _INSTR_S_MATCH___("^MVN", _arg1);

                                                if (activePatternResult363 != null) {
                                                  return function (tupledArg_1) {
                                                    return new Token("T_MVN", [tupledArg_1[0], tupledArg_1[1]]);
                                                  }(activePatternResult363);
                                                } else {
                                                  var activePatternResult361 = _INSTR_MATCH___("^MRS", _arg1);

                                                  if (activePatternResult361 != null) {
                                                    return new Token("T_MRS", [activePatternResult361]);
                                                  } else {
                                                    var activePatternResult359 = _INSTR_MATCH___("^MSR", _arg1);

                                                    if (activePatternResult359 != null) {
                                                      return new Token("T_MSR", [activePatternResult359]);
                                                    } else {
                                                      var activePatternResult357 = _INSTR_S_MATCH___("^ADD", _arg1);

                                                      if (activePatternResult357 != null) {
                                                        return function (tupledArg_2) {
                                                          return new Token("T_ADD", [tupledArg_2[0], tupledArg_2[1]]);
                                                        }(activePatternResult357);
                                                      } else {
                                                        var activePatternResult355 = _INSTR_S_MATCH___("^ADC", _arg1);

                                                        if (activePatternResult355 != null) {
                                                          return function (tupledArg_3) {
                                                            return new Token("T_ADC", [tupledArg_3[0], tupledArg_3[1]]);
                                                          }(activePatternResult355);
                                                        } else {
                                                          var activePatternResult353 = _INSTR_S_MATCH___("^SUB", _arg1);

                                                          if (activePatternResult353 != null) {
                                                            return function (tupledArg_4) {
                                                              return new Token("T_SUB", [tupledArg_4[0], tupledArg_4[1]]);
                                                            }(activePatternResult353);
                                                          } else {
                                                            var activePatternResult351 = _INSTR_S_MATCH___("^SBC", _arg1);

                                                            if (activePatternResult351 != null) {
                                                              return function (tupledArg_5) {
                                                                return new Token("T_SBC", [tupledArg_5[0], tupledArg_5[1]]);
                                                              }(activePatternResult351);
                                                            } else {
                                                              var activePatternResult349 = _INSTR_S_MATCH___("^RSB", _arg1);

                                                              if (activePatternResult349 != null) {
                                                                return function (tupledArg_6) {
                                                                  return new Token("T_RSB", [tupledArg_6[0], tupledArg_6[1]]);
                                                                }(activePatternResult349);
                                                              } else {
                                                                var activePatternResult347 = _INSTR_S_MATCH___("^RSC", _arg1);

                                                                if (activePatternResult347 != null) {
                                                                  return function (tupledArg_7) {
                                                                    return new Token("T_RSC", [tupledArg_7[0], tupledArg_7[1]]);
                                                                  }(activePatternResult347);
                                                                } else {
                                                                  var activePatternResult345 = _LABEL_MATCH___(_arg1);

                                                                  if (activePatternResult345 != null) {
                                                                    return new Token("T_LABEL", [activePatternResult345]);
                                                                  } else {
                                                                    return new Token("T_ERROR", []);
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
export function tokenise(source) {
  return function (list) {
    return map(function (_arg1) {
      return stringToToken(_arg1);
    }, list);
  }(filter(function (s) {
    return s !== "";
  }, toList(split(source, "([,\\[\\]!])|[ \\t\\n\\r\\f]"))));
}