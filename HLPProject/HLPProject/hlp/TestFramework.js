import { forAll } from "fable-core/Seq";
import { equals } from "fable-core/Util";
import List from "fable-core/List";
import { fsFormat } from "fable-core/String";
export function compareList(lst) {
  return forAll(function (tupledArg) {
    return equals(tupledArg[0], tupledArg[1]);
  }, lst);
}
export function compareListVerbose(lst) {
  var checkElement = function checkElement(lst_1) {
    return function (testNum) {
      checkElement: while (true) {
        var $var1 = lst_1.tail != null ? function () {
          var b_1 = lst_1.head[1];
          var a_1 = lst_1.head[0];
          return equals(a_1, b_1);
        }() ? [0, lst_1.head[0], lst_1.head[1], lst_1.tail] : [1] : [1];

        switch ($var1[0]) {
          case 0:
            lst_1 = $var1[3];
            testNum = testNum + 1;
            continue checkElement;

          case 1:
            if (lst_1.tail == null) {
              return new List();
            } else {
              var b = lst_1.head[1];
              var a = lst_1.head[0];
              return new List(fsFormat("%d: Got %A; Expected %A")(function (x) {
                return x;
              })(testNum)(a)(b), checkElement(lst_1.tail)(testNum + 1));
            }

        }
      }
    };
  };

  return checkElement(lst)(0);
}
export function testList(lst) {
  var matchValue = compareListVerbose(lst);

  if (matchValue.tail == null) {
    return "passed.";
  } else {
    return fsFormat("failed: %A")(function (x) {
      return x;
    })(matchValue);
  }
}