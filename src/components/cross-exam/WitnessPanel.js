"use client";

import { useState } from "react";
import toast from "react-hot-toast";

// --- Add Witness Form --------
function AddWitnessForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    witnessName: "",
    witnessType: "prosecution",
    role: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.witnessName.trim()) {
      toast.error("Witness name is required.");
      return;
    }
    setSaving(true);
    try {
      await onAdd(form);
      setForm({ witnessName: "", witnessType: "prosecution", role: "" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3"
    >
      <p className="text-sm font-semibold text-indigo-800">Add Witness</p>
      <div className="grid grid-cols-2 gap-3">
        <input
          name="witnessName"
          value={form.witnessName}
          onChange={handleChange}
          placeholder="Witness name *"
          className="col-span-2 border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <select
          name="witnessType"
          value={form.witnessType}
          onChange={handleChange}
          className="border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="prosecution">Prosecution</option>
          <option value="defense">Defense</option>
          <option value="expert">Expert</option>
          <option value="character">Character</option>
        </select>
        <input
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Role / description"
          className="border border-indigo-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add Witness"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white border border-gray-300 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// --- Add QA Pair Form ----
function AddQAForm({ witnessId, onAdd, onCancel }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!q.trim()) {
      toast.error("Question is required.");
      return;
    }
    setSaving(true);
    try {
      await onAdd(witnessId, {
        originalQuestion: q.trim(),
        originalAnswer: a.trim(),
      });
      setQ("");
      setA("");
    } catch (_) {
      // error already toasted upstream
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 mt-2"
    >
      <textarea
        rows={2}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Question *"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        required
      />
      <textarea
        rows={2}
        value={a}
        onChange={(e) => setA(e.target.value)}
        placeholder="Expected answer (optional)"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium py-1.5 rounded-lg disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add Q&A"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-700 px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// --- Single QA Pair (junior editable) ------
function QAPairRow({ pair, witnessId, isEditable, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [q, setQ] = useState(pair.originalQuestion || "");
  const [a, setA] = useState(pair.originalAnswer || "");
  const [strategyNote, setStrategyNote] = useState(pair.strategyNote || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(witnessId, pair._id, {
        originalQuestion: q,
        originalAnswer: a,
        strategyNote,
      });
      setEditMode(false);
    } catch (_) {
      // error toasted upstream
    } finally {
      setSaving(false);
    }
  };

  const statusClass = pair.isApproved
    ? "border-green-200 bg-green-50"
    : pair.isFlagged
      ? "border-red-200 bg-red-50"
      : "border-gray-200 bg-white";

  return (
    <div className={`rounded-xl border p-4 ${statusClass}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-gray-400">
          Q{pair.sequence}
        </span>
        <div className="flex gap-1 flex-wrap justify-end">
          {pair.isFlagged && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              ⚑ Flagged
            </span>
          )}
          {pair.isApproved && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              ✓ Approved
            </span>
          )}
          {pair.useEditedVersion && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Reviewer edited
            </span>
          )}
        </div>
      </div>

      {editMode && isEditable ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Question"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <textarea
            rows={2}
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="Expected answer"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <input
            value={strategyNote}
            onChange={(e) => setStrategyNote(e.target.value)}
            placeholder="Strategy note (optional)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-800">
            {pair.originalQuestion || (
              <em className="text-gray-400">No question yet</em>
            )}
          </p>
          {pair.originalAnswer && (
            <p className="text-sm text-gray-500 mt-1">{pair.originalAnswer}</p>
          )}
          {pair.strategyNote && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
              💡 {pair.strategyNote}
            </p>
          )}
          {/* Show reviewer's edit */}
          {pair.editedQuestion && (
            <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs font-semibold text-blue-600 mb-1">
                Reviewer's edit
              </p>
              <p className="text-xs text-blue-800">{pair.editedQuestion}</p>
            </div>
          )}
          {/* Comment count */}
          {pair.comments?.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              💬 {pair.comments.length} comment
              {pair.comments.length !== 1 ? "s" : ""}
            </p>
          )}
          {isEditable && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </button>
          )}
        </>
      )}
    </div>
  );
}

// --- Main Witness Panel ------
export default function WitnessPanel({
  witnesses = [],
  isEditable,
  onAddWitness,
  onDeleteWitness,
  onAddQA,
  onUpdateQA,
}) {
  const [openWitness, setOpenWitness] = useState(witnesses[0]?._id || null);
  const [showAddWitness, setShowAddWitness] = useState(false);
  const [addingQAFor, setAddingQAFor] = useState(null);

  return (
    <div className="space-y-3">
      {/* Witness list */}
      {witnesses.length === 0 && !showAddWitness && (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-sm mb-2">No witnesses added yet.</p>
          {isEditable && (
            <button
              onClick={() => setShowAddWitness(true)}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
            >
              + Add first witness
            </button>
          )}
        </div>
      )}

      {witnesses.map((witness) => (
        <div
          key={witness._id}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {/* Witness header */}
          <button
            onClick={() =>
              setOpenWitness(openWitness === witness._id ? null : witness._id)
            }
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-800">
                {witness.witnessName}
              </span>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full capitalize">
                {witness.witnessType}
              </span>
              <span className="text-xs text-gray-400">
                {witness.qaPairs.length} Q&amp;A
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isEditable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteWitness(witness._id);
                  }}
                  className="text-xs text-red-400 hover:text-red-600 px-2"
                >
                  Remove
                </button>
              )}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${openWitness === witness._id ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {/* QA pairs */}
          {openWitness === witness._id && (
            <div className="p-4 space-y-3">
              {witness.role && (
                <p className="text-xs text-gray-500 italic mb-3">
                  {witness.role}
                </p>
              )}
              {witness.qaPairs
                .sort((a, b) => a.sequence - b.sequence)
                .map((pair) => (
                  <QAPairRow
                    key={pair._id}
                    pair={pair}
                    witnessId={witness._id}
                    isEditable={isEditable}
                    onUpdate={onUpdateQA}
                  />
                ))}

              {isEditable &&
                (addingQAFor === witness._id ? (
                  <AddQAForm
                    witnessId={witness._id}
                    onAdd={onAddQA}
                    onCancel={() => setAddingQAFor(null)}
                  />
                ) : (
                  <button
                    onClick={() => setAddingQAFor(witness._id)}
                    className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                  >
                    + Add Q&amp;A Pair
                  </button>
                ))}
            </div>
          )}
        </div>
      ))}

      {/* Add witness */}
      {isEditable &&
        (showAddWitness ? (
          <AddWitnessForm
            onAdd={async (data) => {
              await onAddWitness(data);
              setShowAddWitness(false);
            }}
            onCancel={() => setShowAddWitness(false)}
          />
        ) : (
          witnesses.length > 0 && (
            <button
              onClick={() => setShowAddWitness(true)}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
            >
              + Add Witness
            </button>
          )
        ))}
    </div>
  );
}
