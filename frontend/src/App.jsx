import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:8080/api/tasks";

const WEEKDAYS = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
const MONTHS   = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

function formatDate() {
  const d = new Date();
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

/* ── API helpers ─────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

/* ── TaskItem ────────────────────────────────────────── */
function TaskItem({
  task,
  onToggle,
  onRemove,
  isEditing,
  editingText,
  onStartEdit,
  onEditChange,
  onCancelEdit,
  onSaveEdit,
}) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
  };

  return (
    <li
      className={`task-item${task.done ? " done" : ""}${removing ? " removing" : ""}`}
      onAnimationEnd={() => removing && onRemove(task.id)}
    >
      <label className="check-wrap" onClick={() => onToggle(task.id)}>
        <span className={`check-box${task.done ? " checked" : ""}`} />
      </label>
      {isEditing ? (
        <div className="edit-wrap">
          <input
            className="edit-input"
            type="text"
            maxLength={120}
            value={editingText}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit(task.id);
              if (e.key === "Escape") onCancelEdit();
            }}
            autoFocus
          />
          <button className="action-btn save-btn" onClick={() => onSaveEdit(task.id)}>
            salvar
          </button>
          <button className="action-btn" onClick={onCancelEdit}>
            cancelar
          </button>
        </div>
      ) : (
        <>
          <span className="task-text" onClick={() => onToggle(task.id)}>
            {task.text}
          </span>
          <button className="action-btn" onClick={() => onStartEdit(task)}>
            editar
          </button>
        </>
      )}
      <button className="del-btn" title="Remover" onClick={handleRemove}>×</button>
    </li>
  );
}

/* ── App ─────────────────────────────────────────────── */
export default function App() {
  const [tasks, setTasks]   = useState([]);
  const [filter, setFilter] = useState("all");
  const [input, setInput]   = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  /* Buscar tarefas */
  const fetchTasks = async (f) => {
    setLoading(true);
    setError(null);
    try {
      const param = f !== "all" ? `?filter=${f}` : "";
      const data = await apiFetch(param);
      setTasks(data);
    } catch {
      setError("Erro ao carregar tarefas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTasks(filter);
  }, [filter]);

  /* Adicionar */
  const addTask = async () => {
    const text = input.trim();
    if (!text) return;
    try {
      const created = await apiFetch("", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setInput("");
      if (filter === "done") return; // não exibe na aba errada
      setTasks(prev => [created, ...prev]);
    } catch {
      setError("Erro ao adicionar tarefa.");
    }
  };

  /* Toggle */
  const toggleTask = async (id) => {
    try {
      const updated = await apiFetch(`/${id}/toggle`, { method: "PATCH" });
      if (filter === "all") {
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
      } else {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch {
      setError("Erro ao atualizar tarefa.");
    }
  };

  /* Remover (chamado após animação) */
  const removeTask = async (id) => {
    try {
      await apiFetch(`/${id}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      setError("Erro ao remover tarefa.");
    }
  };

  /* Limpar concluídas */
  const clearDone = async () => {
    try {
      await apiFetch("/done", { method: "DELETE" });
      setTasks(prev => prev.filter(t => !t.done));
    } catch {
      setError("Erro ao limpar tarefas.");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") addTask();
  };

  const startEditTask = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
    setError(null);
  };

  const cancelEditTask = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEditTask = async (id) => {
    const text = editingText.trim();
    if (!text) {
      setError("O texto da tarefa não pode ser vazio.");
      return;
    }

    try {
      const updated = await apiFetch(`/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ text }),
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      cancelEditTask();
    } catch {
      setError("Erro ao editar tarefa.");
    }
  };

  const pending = tasks.filter(t => !t.done).length;
  const total   = tasks.length;

  /* Furos da espiral */
  const holes = Array.from({ length: 9 });

  return (
    <div className="notebook">
      {/* Espiral */}
      <div className="holes">
        {holes.map((_, i) => <div key={i} className="hole" />)}
      </div>

      <div className="content">
        <div className="tape" />

        {/* Cabeçalho */}
        <div className="header">
          <h1 className="title">Minhas Tarefas</h1>
          <p className="subtitle">{formatDate()}</p>
        </div>

        {/* Input */}
        <div className="input-row">
          <input
            className="task-input"
            type="text"
            placeholder="Adicionar nova tarefa…"
            maxLength={120}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="add-btn" title="Adicionar" onClick={addTask}>+</button>
        </div>

        {/* Erro */}
        {error && <p className="error-msg">{error}</p>}

        {/* Filtros */}
        <div className="filters">
          {["all", "active", "done"].map(f => (
            <button
              key={f}
              className={`filter-btn${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todas" : f === "active" ? "Pendentes" : "Concluídas"}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="loading">Carregando…</div>
        ) : (
          <>
            <ul className="task-list">
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onRemove={removeTask}
                  isEditing={editingId === task.id}
                  editingText={editingId === task.id ? editingText : task.text}
                  onStartEdit={startEditTask}
                  onEditChange={setEditingText}
                  onCancelEdit={cancelEditTask}
                  onSaveEdit={saveEditTask}
                />
              ))}
            </ul>

            {tasks.length === 0 && (
              <div className="empty">
                <span className="empty-icon">📝</span>
                Nenhuma tarefa por aqui…
              </div>
            )}
          </>
        )}

        {/* Rodapé */}
        <div className="footer">
          <span>
            {pending} pendente{pending !== 1 ? "s" : ""} · {total} total
          </span>
          <button className="clear-btn" onClick={clearDone}>
            limpar concluídas
          </button>
        </div>
      </div>
    </div>
  );
}