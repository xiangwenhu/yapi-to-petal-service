function innerCreateFunction(params: string[], code: string): Function {
    const paramsStr = params.map((c) => `'${c}'`).join(',');

    const funStr = `return new Function(${paramsStr}, \`${code}\`) `;
    const fn = new Function(funStr)();
    console.log("fn", fn.toString());
    return fn;
}

export function createFunction(code: string, ...args: string[]) {
    if (arguments.length < 0) {
        return () => {};
    }
    return innerCreateFunction(args, `${code}`);
}
export function createAsyncFunction(code: string, ...args: string[]) {
    if (arguments.length < 0) {
        return () => {};
    }
    return innerCreateFunction(
        args,
        `return Promise.resolve().then(()=> {${code}})`
    );
}

export function createOneParamFunction(code: string, paramKeys: string[]) {
    const paramsStr = `{${paramKeys.join(",")}}`;
    return createFunction(code, paramsStr);
}

export function createOneParamAsyncFunction(code: string, paramKeys: string[]) {
    const paramsStr = `{${paramKeys.join(",")}}`;
    return createAsyncFunction(code, paramsStr);
}

