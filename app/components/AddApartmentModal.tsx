import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Apartment } from "../lib/apartment";

type FormState = {
  name: string;
  address: string;
  rent: string;
  beds: string;
  baths: string;
  sqft: string;
  commute: string;
  parking: boolean;
  parkingPrice: string;
  pets: boolean;
  laundry: boolean;
  notes: string;
};

const emptyForm: FormState = {
  name: "",
  address: "",
  rent: "",
  beds: "1",
  baths: "1",
  sqft: "",
  commute: "",
  parking: false,
  parkingPrice: "",
  pets: false,
  laundry: false,
  notes: "",
};

// Turn a saved apartment back into editable form values (0 shows as blank)
function toForm(a: Apartment): FormState {
  return {
    name: a.name,
    address: a.address,
    rent: String(a.rent),
    beds: String(a.beds),
    baths: String(a.baths),
    sqft: a.sqft ? String(a.sqft) : "",
    commute: a.commute ? String(a.commute) : "",
    parking: a.parking,
    parkingPrice: a.parkingPrice ? String(a.parkingPrice) : "",
    pets: a.pets,
    laundry: a.laundry,
    notes: a.notes,
  };
}

const input =
  "w-full rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/30 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-teal-500 dark:focus:ring-teal-500/30";
const label = "mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400";

type AddApartmentModalProps = {
  open: boolean;
  apartment: Apartment | null; // the apartment being edited, or null to add a new one
  onClose: () => void;
  onSave: (apartment: Apartment) => void;
};

export default function AddApartmentModal({ open, apartment, onClose, onSave }: AddApartmentModalProps) {
  const editing = apartment !== null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  // The native <dialog> handles focus trapping, Esc to close, and the backdrop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Fill the form when the modal opens: current values when editing, blank when adding
  useEffect(() => {
    if (open) setForm(apartment ? toForm(apartment) : emptyForm);
  }, [open, apartment]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.rent) return;
    onSave({
      id: apartment?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      address: form.address.trim(),
      rent: Number(form.rent) || 0,
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
      sqft: Number(form.sqft) || 0,
      commute: Number(form.commute) || 0,
      parking: form.parking,
      parkingPrice: form.parking ? Number(form.parkingPrice) || 0 : 0,
      pets: form.pets,
      laundry: form.laundry,
      notes: form.notes.trim(),
      selected: apartment ? apartment.selected : true,
    });
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // clicking the dim area outside the panel closes the modal
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="add-apartment-title"
      className="m-auto w-full max-w-md rounded-lg bg-white p-0 text-stone-900 shadow-xl backdrop:bg-stone-900/40 dark:border dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:backdrop:bg-black/60"
    >
      <div className="max-h-[90vh] overflow-y-auto p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 id="add-apartment-title" className="text-lg font-semibold">
            {editing ? "Edit apartment" : "Add apartment"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="rounded px-2 text-xl leading-none text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className={label} htmlFor="name">Name</label>
            <input id="name" className={input} value={form.name} required
              onChange={(e) => update("name", e.target.value)} placeholder="Maple Court #4B" />
          </div>
          <div>
            <label className={label} htmlFor="address">Address</label>
            <input id="address" className={input} value={form.address}
              onChange={(e) => update("address", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={label} htmlFor="rent">Rent ($/mo)</label>
              <input id="rent" type="number" min="0" className={input} value={form.rent} required
                onChange={(e) => update("rent", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="beds">Beds</label>
              <input id="beds" type="number" min="0" step="1" className={input} value={form.beds}
                onChange={(e) => update("beds", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="baths">Baths</label>
              <input id="baths" type="number" min="0" step="0.5" className={input} value={form.baths}
                onChange={(e) => update("baths", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="sqft">Sq ft</label>
              <input id="sqft" type="number" min="0" className={input} value={form.sqft}
                onChange={(e) => update("sqft", e.target.value)} />
            </div>
            <div>
              <label className={label} htmlFor="commute">Commute (min)</label>
              <input id="commute" type="number" min="0" className={input} value={form.commute}
                onChange={(e) => update("commute", e.target.value)} />
            </div>
          </div>

          <fieldset className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <legend className="sr-only">Amenities</legend>
            {(["parking", "pets", "laundry"] as const).map((key) => (
              <label key={key} className="flex items-center gap-1.5">
                <input type="checkbox" checked={form[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  className="accent-teal-700" />
                {key === "parking" ? "Parking" : key === "pets" ? "Pets allowed" : "In-unit laundry"}
              </label>
            ))}
          </fieldset>

          {form.parking && (
            <div>
              <label className={label} htmlFor="parkingPrice">
                Parking ($/mo, leave blank if included)
              </label>
              <input id="parkingPrice" type="number" min="0" className={input}
                value={form.parkingPrice}
                onChange={(e) => update("parkingPrice", e.target.value)} />
            </div>
          )}

          <div>
            <label className={label} htmlFor="notes">Notes</label>
            <textarea id="notes" rows={2} className={input} value={form.notes}
              onChange={(e) => update("notes", e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800">
              Cancel
            </button>
            <button type="submit"
              className="rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700/40">
              {editing ? "Save changes" : "Add apartment"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}