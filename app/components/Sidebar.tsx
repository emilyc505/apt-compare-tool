import { useState } from "react";
import { isCompared, money } from "../lib/apartment";
import type { Apartment } from "../lib/apartment";
import { useDragReorder } from "../lib/useDragReorder";
import AddApartmentModal from "./AddApartmentModal";

type SidebarProps = {
  apartments: Apartment[];
  onSave: (apartment: Apartment) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
};

export default function Sidebar({ apartments, onSave, onToggle, onRemove, onReorder }: SidebarProps) {
  const { dragId, overId, getItemProps } = useDragReorder(onReorder);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = apartments.find((a) => a.id === editingId) ?? null;

  function openAdd() {
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(id: string) {
    setEditingId(id);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  const comparedCount = apartments.filter(isCompared).length;

  return (
    <aside className="w-full shrink-0 border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 md:h-screen md:w-80 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="p-5">
        <h1 className="text-lg font-semibold">Apartment compare</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Add places you’re considering and compare them side by side.
        </p>

        <button type="button" onClick={openAdd}
          className="mt-5 w-full rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700/40">
          Add apartment
        </button>

        {apartments.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Added ({apartments.length}) · comparing {comparedCount}
            </h2>
            <ul className="mt-2 divide-y divide-stone-200 rounded-md border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
              {apartments.map((a) => (
                <li
                  key={a.id}
                  {...getItemProps(a.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 text-sm ${
                    dragId === a.id ? "opacity-40" : ""
                  } ${overId === a.id && dragId !== a.id ? "bg-teal-50 dark:bg-teal-950" : ""}`}
                >
                  <span aria-hidden="true"
                    className="cursor-grab select-none text-stone-400 dark:text-stone-500">
                    ⋮⋮
                  </span>
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isCompared(a)}
                      onChange={() => onToggle(a.id)}
                      aria-label={`Compare ${a.name}`}
                      className="accent-teal-700"
                    />
                    <span className="min-w-0">
                      <span className={`block truncate font-medium ${isCompared(a) ? "" : "text-stone-400 dark:text-stone-500"}`}>
                        {a.name}
                      </span>
                      <span className="text-stone-500 dark:text-stone-400">{money(a.rent)}/mo</span>
                    </span>
                  </label>
                  <div className="flex shrink-0">
                    <button type="button" onClick={() => openEdit(a.id)}
                      aria-label={`Edit ${a.name}`}
                      className="rounded px-2 py-1 text-stone-500 hover:bg-stone-100 hover:text-teal-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-teal-300">
                      Edit
                    </button>
                    <button type="button" onClick={() => onRemove(a.id)}
                      aria-label={`Remove ${a.name}`}
                      className="rounded px-2 py-1 text-stone-500 hover:bg-stone-100 hover:text-red-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-red-400">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <AddApartmentModal open={formOpen} apartment={editing} onClose={closeForm} onSave={onSave} />
    </aside>
  );
}