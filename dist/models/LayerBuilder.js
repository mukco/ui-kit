import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Interactive NN layer configuration: add/remove layers, set neuron count,
    with a live architecture diagram. Input/output layers are implied. */
export function LayerBuilder({ layers, onChange }) {
    function update(index, neurons) {
        onChange(layers.map((l, i) => (i === index ? { neurons: Math.max(1, Number(neurons)) } : l)));
    }
    return (_jsxs("div", { className: "ui-layers", children: [_jsxs("label", { className: "ui-sb-label", children: ["Hidden layers ", _jsx("span", { className: "ui-layers-note", children: "(input + output added automatically)" })] }), layers.length === 0 && _jsx("p", { className: "ui-sb-note ui-layers-empty", children: "No hidden layers \u2014 model is linear." }), layers.map((layer, i) => (_jsxs("div", { className: "ui-layer-row", children: [_jsxs("span", { className: "ui-layer-name", children: ["Layer ", i + 1] }), _jsx("input", { type: "number", min: 1, max: 2048, value: layer.neurons, onChange: (e) => update(i, e.target.value), className: "ui-field ui-layer-input" }), _jsx("span", { className: "ui-sb-note", children: "neurons" }), _jsx("button", { type: "button", onClick: () => onChange(layers.filter((_, j) => j !== i)), className: "ui-iconbtn ui-iconbtn--danger", title: "Remove layer", children: "\u2715" })] }, i))), _jsx("button", { type: "button", onClick: () => onChange([...layers, { neurons: 32 }]), className: "ui-layer-add", children: "\uFF0B Add layer" }), layers.length > 0 && (_jsxs("div", { className: "ui-arch", children: [_jsx(ArchNode, { label: "In", sub: "features", tone: "dim" }), _jsx(Arrow, {}), layers.map((l, i) => (_jsxs("span", { className: "ui-arch-step", children: [_jsx(ArchNode, { label: l.neurons, sub: "ReLU", tone: "brand" }), _jsx(Arrow, {})] }, i))), _jsx(ArchNode, { label: "Out", sub: "target", tone: "warn" })] }))] }));
}
function ArchNode({ label, sub, tone }) {
    return (_jsxs("div", { className: `ui-archnode ui-archnode--${tone}`, children: [_jsx("span", { className: "ui-mono", children: label }), _jsx("small", { children: sub })] }));
}
function Arrow() {
    return _jsx("span", { className: "ui-archarrow", children: "\u2192" });
}
