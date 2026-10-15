const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

// Exercise the actual page controller and generated classic scripts in one
// persistent global context, as a browser does. Babel/React/DOM are narrow
// doubles: input below is already valid JavaScript, so no JSX transform is needed.
const html = fs.readFileSync(process.env.PLAYGROUND_HTML || path.join(__dirname, '../index.html'), 'utf8');
const controller = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];

function playground(code) {
    const renders = [];
    const scriptErrors = [];
    const radios = ['code', 'preview'].map(value => ({
        value,
        addEventListener(name, callback) { this[name] = callback; }
    }));
    const elements = new Map();
    for (const id of ['preview', 'code-container', 'error', 'code', 'root']) {
        elements.set(id, { textContent: '', classList: { remove() {}, add() {}, toggle() {} } });
    }
    const editor = { getValue: () => code };
    let context;
    const document = {
        getElementById: id => elements.get(id),
        querySelectorAll: () => radios,
        createElement: () => ({ remove() {} }),
        body: {
            appendChild(script) {
                // Browser script exceptions are reported globally, not thrown
                // back into the appendChild caller's try/catch.
                try { vm.runInContext(script.textContent, context); }
                catch (error) { scriptErrors.push(error); }
            }
        }
    };
    context = vm.createContext({
        document,
        CodeMirror: { fromTextArea: () => editor },
        Babel: { transform: source => ({ code: source }) },
        React: { createElement: App => App() },
        ReactDOM: { createRoot: () => ({ render: value => renders.push(value) }) },
        setTimeout: callback => callback()
    });
    vm.runInContext(controller, context);
    return {
        run: () => vm.runInContext('runCode()', context),
        showPreview: () => radios[1].change(),
        setCode: source => { code = source; },
        evaluate: source => vm.runInContext(source, context),
        renders,
        scriptErrors
    };
}

test('Run, Preview, and subsequent edits can redeclare component bindings', () => {
    const page = playground('const message = "first"; let count = 1; class Label {} function App() { return message + count; }');
    page.run();
    page.showPreview();
    page.setCode('const message = "edited"; let count = 2; class Label {} function App() { return message + count; }');
    page.run();
    assert.deepEqual(page.scriptErrors.map(error => error.message), []);
    assert.deepEqual(page.renders, ['first1', 'first1', 'edited2']);
});

test('preview declarations do not leak or collide with controller bindings', () => {
    const page = playground('const preview = "component"; const editor = "local"; function App() { return preview + editor; }');
    page.run();
    page.run();
    assert.deepEqual(page.scriptErrors.map(error => error.message), []);
    assert.deepEqual(page.renders, ['componentlocal', 'componentlocal']);
    assert.equal(page.evaluate('typeof App'), 'undefined');
    assert.equal(page.evaluate('typeof root'), 'undefined');
});

test('generated React root binding can be recreated on every Run', () => {
    const page = playground('function App() { return "hello"; }');
    page.run();
    page.run();
    assert.deepEqual(page.scriptErrors.map(error => error.message), []);
    assert.deepEqual(page.renders, ['hello', 'hello']);
});
