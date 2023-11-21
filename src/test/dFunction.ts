import { createOneParamFunction } from "../util/function";

const m = {
    aaa(num1: number, num2: number) {
        return num1 + num2;
    },
};

const fn = createOneParamFunction("return $m.aaa(num1, num2)", [
    "num1",
    "num2",
    "$m",
])({
    num1: 10,
    num2: 20,
    $m: m,
});

console.log(fn.toString());