const display = document.getElementById('display');
const keys = document.querySelector('.calc__keys');

let expr = '';   // expression string shown in display
let justEvaluated = false;

const update = () => display.value = expr || '0';

const append = (ch) => {
  if (justEvaluated && /[0-9.]/.test(ch)) {
    // start a new number after equals if user types a digit
    expr = '';
  }
  justEvaluated = false;

  // prevent multiple decimals in a single number chunk
  if (ch === '.') {
    const lastChunk = expr.split(/[\+\-\×\÷]/).pop();
    if (lastChunk.includes('.')) return;
  }

  expr += ch;
  update();
};

const appendOp = (op) => {
  justEvaluated = false;
  if (!expr) return; // no leading operator
  // replace trailing operator with the new one
  if (/[+\-\×\÷]$/.test(expr)) {
    expr = expr.slice(0, -1) + op;
  } else {
    expr += op;
  }
  update();
};

const clearAll = () => {
  expr = '';
  update();
};

const backspace = () => {
  if (!expr) return;
  expr = expr.slice(0, -1);
  update();
};

const evaluate = () => {
  if (!expr) return;
  // avoid trailing operator
  if (/[+\-\×\÷]$/.test(expr)) expr = expr.slice(0, -1);

  // convert to JS-safe operators
  const safe = expr.replace(/×/g, '*').replace(/÷/g, '/');

  // allow only digits, operators, dot, spaces
  if (!/^[0-9+\-*/.\s]+$/.test(safe)) return;

  try {
    const result = Number.isFinite(Function(`"use strict"; return (${safe})`)())
      ? Function(`"use strict"; return (${safe})`)()
      : NaN;

    if (!isFinite(result)) {
      display.value = 'Cannot divide by 0';
      justEvaluated = true;
      return;
    }

    // Trim long floats
    const pretty = Number(result.toFixed(10)) + '';
    expr = pretty;
    update();
    justEvaluated = true;
  } catch {
    display.value = 'Error';
    justEvaluated = true;
  }
};

// Click handling
keys.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.dataset.num) return append(btn.dataset.num);
  if (btn.dataset.op) return appendOp(btn.dataset.op);

  const key = btn.dataset.key;
  if (key === 'Escape') return clearAll();
  if (key === 'Backspace') return backspace();
  if (key === 'Enter') return evaluate();
});

// Keyboard support
window.addEventListener('keydown', (e) => {
  const { key } = e;

  if (/[0-9]/.test(key)) return append(key);
  if (key === '.') return append('.');
  if (key === '+' || key === '-') return appendOp(key);
  if (key === '*') return appendOp('×');
  if (key === '/') return appendOp('÷');
  if (key === 'Enter' || key === '=') return evaluate();
  if (key === 'Backspace') return backspace();
  if (key === 'Escape') return clearAll();
});

// init
update();
