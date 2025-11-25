document.addEventListener("DOMContentLoaded", () => {
    pageLoaded();
});

let txt1;
let txt2;
let btn;
let lblRes;
let opSelect;

function pageLoaded() {
    txt1 = document.getElementById("txt1");
    txt2 = document.getElementById("txt2");
    btn = document.getElementById("btnCalc");
    lblRes = document.getElementById("lblRes");
    opSelect = document.getElementById("opSelect");

    btn.addEventListener("click", () => {
        calculate();
    });

    const btn2 = document.getElementById("btn2");
    btn2.addEventListener("click", () => {
        print("btn2 clicked: " + btn2.id + " | " + btn2.innerText, true);
    });
}

// Calculator function: uses selected operator and logs the operation
function calculate() {
    const num1 = parseFloat(txt1.value);
    const num2 = parseFloat(txt2.value);
    const op = opSelect.value;

    if (isNaN(num1) || isNaN(num2)) {
        lblRes.innerText = "Please enter valid numbers";
        print("Error: invalid numeric input", true);
        return;
    }

    let res;

    switch (op) {
        case "+":
            res = num1 + num2;
            break;
        case "-":
            res = num1 - num2;
            break;
        case "*":
            res = num1 * num2;
            break;
        case "/":
            if (num2 === 0) {
                lblRes.innerText = "Cannot divide by zero";
                print(`Error: division by zero (input: ${num1} / ${num2})`, true);
                return;
            }
            res = num1 / num2;
            break;
        default:
            res = "Error";
    }

    lblRes.innerText = res;

    // log operation to the textarea
    const logLine = `${num1} ${op} ${num2} = ${res}`;
    print(logLine, true);
}

// Print function with append mode
// append = false → replace content
// append = true  → append new line to existing content
function print(msg, append = false) {
    const ta = document.getElementById("output");

    if (!ta) {
        console.log(msg);
        return;
    }

    if (append) {
        if (ta.value.length > 0 && !ta.value.endsWith("\n")) {
            ta.value += "\n";
        }
        ta.value += msg + "\n";
    } else {
        ta.value = msg + "\n";
    }
}

// =============================================
// STEP 1: JS NATIVE TYPES, USEFUL TYPES & OPERATIONS
// =============================================
function demoNative() {
    let out = "=== STEP 1: NATIVE TYPES ===\n";

    // String
    const s = "Hello World";
    out += "\n[String] s = " + s;
    out += "\nLength: " + s.length;
    out += "\nUpper: " + s.toUpperCase();

    // Number
    const n = 42;
    out += "\n\n[Number] n = " + n;

    // Boolean
    const b = true;
    out += "\n\n[Boolean] b = " + b;

    // Date
    const d = new Date();
    out += "\n\n[Date] now = " + d.toISOString();

    // Array
    const arr = [1, 2, 3, 4];
    out += "\n\n[Array] arr = [" + arr.join(", ") + "]";
    arr.push(5);
    out += "\nPush 5 → " + arr.join(", ");
    out += "\nMap x2 → " + arr.map(x => x * 2).join(", ");

    // Functions as variables
    const add = function (a, b) {
        return a + b;
    };
    out += "\n\n[Function as variable] add(3,4) = " + add(3, 4);

    // Callback
    function calc(a, b, fn) {
        return fn(a, b);
    }
    const result = calc(10, 20, (x, y) => x + y);
    out += "\n[Callback] calc(10,20, x+y ) = " + result;

    print(out, false);
}
