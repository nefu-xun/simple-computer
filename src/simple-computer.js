export default class Computer {
  // 运算符的优先级
  operatorMap = {
    "+": 0,
    "-": 0,
    "*": 1,
    "/": 1
  };

  // 当前操作的栈的类型
  computerType = {
    // 操作数栈
    operand: "operand",

    // 运算符栈
    operator: "operator"
  };

  constructor() {
    this.error = null; // 存储错误
    this.result = null; // 存储计算结果
  }

  /**
   * @param {待计算的表达式字符串} str
   * @param {计算结果精度(默认保留到小数点后14位)} digits
   */
  compute(str, digits = 14) {
    this.digits = digits;
    this.str = str;

    try {
      this.doParse();
      this.doCompute();
    } catch ({ message }) {
      // 提示用户的错误输入
      this.error = { message };
    }

    return this;
  }

  doCompute() {
    const operandArr = this.operandArr; // 操作数数组
    const operatorArr = this.operatorArr; // 运算符数组

    const operandStack = []; // 操作数栈
    const operatorStack = []; // 运算符栈
    let curType = this.computerType.operand;

    // 操作数和运算符的入栈
    while (operandArr.length) {
      // 操作数入栈
      if (curType == this.computerType.operand) {
        operandStack.push(operandArr.shift());
        // 让出操作权：下一轮操作运算符栈
        curType = this.computerType.operator;
        continue;
      }

      // 运算符入栈
      if (curType == this.computerType.operator) {
        // 若运算符栈为空，直接入栈
        // 或者当前运算符的优先及比运算符栈栈顶的运算符的优先及高
        if (
          !operatorStack.length ||
          this.operatorMap[operatorArr[0]] >
            this.operatorMap[operatorStack[operatorStack.length - 1]]
        ) {
          operatorStack.push(operatorArr.shift());
          curType = this.computerType.operand; // 运算符入栈，让出操作权
          continue;
        } else {
          // 运算符栈非空 && 当前运算符的优先及小于运算符栈顶的运算符的优先级
          const n1 = operandStack.pop();
          const n2 = operandStack.pop(); // 弹出2个操作数
          const op = operatorStack.pop(); // 弹出1个运算符
          const res = this.basicComputer(op, n2, n1);
          operandStack.push(res); // 结果入栈
          continue; // 当前操作符并未入栈，暂不交出操作权，保留操作权到下一轮
        }
      }
    }

    // 正确的表达式operatorArr和operandArr中的元素应当已经全部入栈
    if (operatorArr.length || operandArr.length) {
      throw new Error("表达式错误");
    }

    while (operatorStack.length) {
      const n1 = operandStack.pop();
      const n2 = operandStack.pop();
      const op = operatorStack.pop();
      const res = this.basicComputer(op, n2, n1);
      operandStack.push(res);
    }

    if (operandStack.length > 1 || operatorStack.length) {
      throw new Error("表达式错误");
    }

    const data = operandStack.pop();
    this.result = parseFloat(data.toFixed(this.digits));
  }

  // 获取操作数数组和运算符数组
  doParse() {
    // debugger;
    const str = this.str;
    const operatorArr = [];
    const regex = new RegExp(/[+\-*/]/g);

    // 替换四则运算符
    let operandArr = str
      .replace(regex, (matched) => {
        // 收集运算符
        operatorArr.push(matched);
        return "#";
      })
      .split("#")
      .filter((item) => item !== "");

    // 获取操作数数组
    operandArr = this.parseOperandArr(operandArr);

    this.operandArr = operandArr;
    this.operatorArr = operatorArr;
  }

  // 处理操作数
  parseOperandArr(operandArr) {
    // debugger;
    const regex = new RegExp(/[%]/g);

    const res = operandArr.map((operand) => {
      // 非法表达式
      if (operand.replace(/[%.]/g, "") === "") {
        throw new Error("不能只包含. 或 %");
      }
      if (operand[0] === "%") {
        throw new Error("不能以%开始");
      }

      // 处理包含的%，且%可能有多个
      if (operand.indexOf("%") !== -1) {
        let count = 0;
        operand.replace(regex, (matched) => {
          // 统计%个数
          count++;
        });
        let theFloat = parseFloat(operand);
        while (count) {
          theFloat /= 100;
          count--;
        }
        return theFloat;
      }
      return parseFloat(operand);
    });

    // 经过解析的操作数数组
    return res;
  }

  basicComputer(op, n2, n1) {
    switch (op) {
      case "+":
        return n2 + n1;
      case "-":
        return n2 - n1;
      case "*":
        return n2 * n1;
      case "/":
        if (n1 === 0) throw new Error("不能除以0");

        return n2 / n1;
      default:
        throw new Error(`Unsupported operator: ${op}`);
    }
  }
}
