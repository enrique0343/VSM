import { useVSMStore } from '../../store/vsmStore';
import type {
  ProcessData, InventoryData, CustomerData,
  SupplierData, KaizenData, OperatorData,
} from '../../types/vsm';

export default function PropertiesPanel() {
  const { nodes, selectedNodeId, updateNodeData, removeNode, settings, updateSettings } =
    useVSMStore();

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNodeId || !node) {
    return (
      <aside className="w-[220px] flex-shrink-0 bg-panel border-l border-border-dark flex flex-col p-4 gap-4">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Configuración</p>
        <SettingsFields settings={settings} onChange={updateSettings} />
        <div className="border-t border-border-dark pt-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Selecciona un elemento del canvas para editar sus propiedades.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-panel border-l border-border-dark flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-2 border-b border-border-dark flex items-center justify-between">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">
          Propiedades
        </p>
        <button
          onClick={() => removeNode(selectedNodeId)}
          className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
          title="Eliminar elemento"
        >
          ✕ Eliminar
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {node.type === 'supplier' && (
          <SupplierFields
            data={node.data as SupplierData}
            onChange={(d) => updateNodeData(node.id, d)}
          />
        )}
        {node.type === 'customer' && (
          <CustomerFields
            data={node.data as CustomerData}
            onChange={(d) => updateNodeData(node.id, d)}
          />
        )}
        {node.type === 'process' && (
          <ProcessFields
            data={node.data as ProcessData}
            onChange={(d) => updateNodeData(node.id, d)}
          />
        )}
        {node.type === 'inventory' && (
          <InventoryFields
            data={node.data as InventoryData}
            onChange={(d) => updateNodeData(node.id, d)}
          />
        )}
        {node.type === 'kaizen' && (
          <KaizenFields
            data={node.data as KaizenData}
            onChange={(d) => updateNodeData(node.id, d)}
          />
        )}
        {node.type === 'operator' && (
          <OperatorFields
            data={node.data as OperatorData}
            onChange={(d) => updateNodeData(node.id, d)}
          />
        )}
      </div>
    </aside>
  );
}

// ── Field primitives ─────────────────────────────────────────────────────────

function Field({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-panel-light border border-border-dark rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-accent transition-colors';

// ── Per-type forms ───────────────────────────────────────────────────────────

function SupplierFields({ data, onChange }: { data: SupplierData; onChange: (d: Partial<SupplierData>) => void }) {
  return (
    <Field label="Nombre">
      <input className={inputCls} value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
    </Field>
  );
}

function CustomerFields({ data, onChange }: { data: CustomerData; onChange: (d: Partial<CustomerData>) => void }) {
  return (
    <>
      <Field label="Nombre">
        <input className={inputCls} value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="Demanda diaria">
        <input type="number" min="0" className={inputCls} value={data.demandPerDay}
          onChange={(e) => onChange({ demandPerDay: Number(e.target.value) })} />
      </Field>
      <Field label="Unidad">
        <input className={inputCls} value={data.demandUnit} onChange={(e) => onChange({ demandUnit: e.target.value })} />
      </Field>
    </>
  );
}

function ProcessFields({ data, onChange }: { data: ProcessData; onChange: (d: Partial<ProcessData>) => void }) {
  return (
    <>
      <Field label="Nombre del proceso">
        <input className={inputCls} value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="Tiempo de ciclo (s)">
        <input type="number" min="0" className={inputCls} value={data.cycleTime}
          onChange={(e) => onChange({ cycleTime: Number(e.target.value) })} />
      </Field>
      <Field label="Tiempo cambio (s)">
        <input type="number" min="0" className={inputCls} value={data.changeoverTime}
          onChange={(e) => onChange({ changeoverTime: Number(e.target.value) })} />
      </Field>
      <Field label="Disponibilidad (%)">
        <input type="number" min="0" max="100" className={inputCls} value={data.uptime}
          onChange={(e) => onChange({ uptime: Number(e.target.value) })} />
      </Field>
      <Field label="Operarios">
        <input type="number" min="0" className={inputCls} value={data.operators}
          onChange={(e) => onChange({ operators: Number(e.target.value) })} />
      </Field>
      <Field label="Tipo">
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ isValueAdded: true })}
            className={`flex-1 text-[10px] py-1 rounded transition-colors ${data.isValueAdded ? 'bg-green-600 text-white' : 'bg-panel-light text-slate-400 hover:text-slate-200'}`}
          >
            Valor Añadido
          </button>
          <button
            onClick={() => onChange({ isValueAdded: false })}
            className={`flex-1 text-[10px] py-1 rounded transition-colors ${!data.isValueAdded ? 'bg-red-600 text-white' : 'bg-panel-light text-slate-400 hover:text-slate-200'}`}
          >
            Sin Valor
          </button>
        </div>
      </Field>
    </>
  );
}

function InventoryFields({ data, onChange }: { data: InventoryData; onChange: (d: Partial<InventoryData>) => void }) {
  return (
    <>
      <Field label="Nombre">
        <input className={inputCls} value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="Unidades">
        <input type="number" min="0" className={inputCls} value={data.units}
          onChange={(e) => onChange({ units: Number(e.target.value) })} />
      </Field>
      <Field label="Días de espera">
        <input type="number" min="0" step="0.5" className={inputCls} value={data.waitDays}
          onChange={(e) => onChange({ waitDays: Number(e.target.value) })} />
      </Field>
    </>
  );
}

function KaizenFields({ data, onChange }: { data: KaizenData; onChange: (d: Partial<KaizenData>) => void }) {
  return (
    <>
      <Field label="Título">
        <input className={inputCls} value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="Descripción">
        <textarea
          rows={3}
          className={`${inputCls} resize-none`}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
    </>
  );
}

function OperatorFields({ data, onChange }: { data: OperatorData; onChange: (d: Partial<OperatorData>) => void }) {
  return (
    <>
      <Field label="Nombre">
        <input className={inputCls} value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <Field label="Cantidad">
        <input type="number" min="1" max="20" className={inputCls} value={data.count}
          onChange={(e) => onChange({ count: Number(e.target.value) })} />
      </Field>
    </>
  );
}

function SettingsFields({
  settings, onChange,
}: {
  settings: { availableTimePerDay: number; demandPerDay: number };
  onChange: (s: Partial<{ availableTimePerDay: number; demandPerDay: number }>) => void;
}) {
  return (
    <>
      <Field label="Tiempo disponible (s/día)">
        <input type="number" min="1" className={inputCls} value={settings.availableTimePerDay}
          onChange={(e) => onChange({ availableTimePerDay: Number(e.target.value) })} />
      </Field>
      <Field label="Demanda (uds/día)">
        <input type="number" min="1" className={inputCls} value={settings.demandPerDay}
          onChange={(e) => onChange({ demandPerDay: Number(e.target.value) })} />
      </Field>
    </>
  );
}
