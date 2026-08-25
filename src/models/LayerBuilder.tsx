export interface NnLayer {
  neurons: number
}

interface Props {
  layers: NnLayer[]
  onChange: (layers: NnLayer[]) => void
}

/** Interactive NN layer configuration: add/remove layers, set neuron count,
    with a live architecture diagram. Input/output layers are implied. */
export function LayerBuilder({ layers, onChange }: Props) {
  function update(index: number, neurons: string) {
    onChange(layers.map((l, i) => (i === index ? { neurons: Math.max(1, Number(neurons)) } : l)))
  }

  return (
    <div className="ui-layers">
      <label className="ui-sb-label">
        Hidden layers <span className="ui-layers-note">(input + output added automatically)</span>
      </label>

      {layers.length === 0 && <p className="ui-sb-note ui-layers-empty">No hidden layers — model is linear.</p>}

      {layers.map((layer, i) => (
        <div key={i} className="ui-layer-row">
          <span className="ui-layer-name">Layer {i + 1}</span>
          <input
            type="number"
            min={1}
            max={2048}
            value={layer.neurons}
            onChange={(e) => update(i, e.target.value)}
            className="ui-field ui-layer-input"
          />
          <span className="ui-sb-note">neurons</span>
          <button type="button" onClick={() => onChange(layers.filter((_, j) => j !== i))} className="ui-iconbtn ui-iconbtn--danger" title="Remove layer">
            ✕
          </button>
        </div>
      ))}

      <button type="button" onClick={() => onChange([...layers, { neurons: 32 }])} className="ui-layer-add">
        ＋ Add layer
      </button>

      {layers.length > 0 && (
        <div className="ui-arch">
          <ArchNode label="In" sub="features" tone="dim" />
          <Arrow />
          {layers.map((l, i) => (
            <span key={i} className="ui-arch-step">
              <ArchNode label={l.neurons} sub="ReLU" tone="brand" />
              <Arrow />
            </span>
          ))}
          <ArchNode label="Out" sub="target" tone="warn" />
        </div>
      )}
    </div>
  )
}

function ArchNode({ label, sub, tone }: { label: React.ReactNode; sub: string; tone: "dim" | "brand" | "warn" }) {
  return (
    <div className={`ui-archnode ui-archnode--${tone}`}>
      <span className="ui-mono">{label}</span>
      <small>{sub}</small>
    </div>
  )
}

function Arrow() {
  return <span className="ui-archarrow">→</span>
}
