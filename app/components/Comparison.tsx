import { isCompared, money, parkingCost, totalMonthly } from "../lib/apartment";
import type { Apartment } from "../lib/apartment";
import { useDragReorder } from "../lib/useDragReorder";

const yesNo = (b: boolean) => (b ? "Yes" : "No");

type Row = {
  label: string;
  value: (a: Apartment) => string;
  // numeric value used to find the best option; omit for text rows
  score?: (a: Apartment) => number;
  best?: "min" | "max";
};

const rows: Row[] = [
  {
    label: "Total / month (rent + parking)",
    value: (a) => money(totalMonthly(a)),
    score: totalMonthly,
    best: "min",
  },
  { label: "Rent / month", value: (a) => money(a.rent), score: (a) => a.rent, best: "min" },
  {
    label: "Rent per sq ft",
    value: (a) => (a.sqft ? `$${(a.rent / a.sqft).toFixed(2)}` : "—"),
    score: (a) => (a.sqft ? a.rent / a.sqft : Infinity),
    best: "min",
  },
  { label: "Bedrooms", value: (a) => String(a.beds) },
  { label: "Bathrooms", value: (a) => String(a.baths) },
  {
    label: "Square feet",
    value: (a) => (a.sqft ? a.sqft.toLocaleString() : "—"),
    score: (a) => a.sqft,
    best: "max",
  },
  {
    label: "Commute",
    value: (a) => (a.commute ? `${a.commute} min` : "—"),
    score: (a) => (a.commute ? a.commute : Infinity),
    best: "min",
  },
  {
    label: "Parking",
    value: (a) =>
      a.parking
        ? parkingCost(a) > 0
          ? `Yes · ${money(parkingCost(a))}/mo`
          : "Yes · included"
        : "No",
  },
  { label: "Pets allowed", value: (a) => yesNo(a.pets) },
  { label: "In-unit laundry", value: (a) => yesNo(a.laundry) },
  { label: "Notes", value: (a) => a.notes || "—" },
];

function bestIds(row: Row, apartments: Apartment[]): Set<string> {
  if (!row.score || !row.best || apartments.length < 2) return new Set();
  const scores = apartments.map((a) => row.score!(a));
  const target = row.best === "min" ? Math.min(...scores) : Math.max(...scores);
  if (!Number.isFinite(target)) return new Set();
  // no highlight if every apartment ties
  if (scores.every((s) => s === target)) return new Set();
  return new Set(apartments.filter((a) => row.score!(a) === target).map((a) => a.id));
}

type ComparisonProps = {
  apartments: Apartment[];
  onRemove: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
};

export default function Comparison({ apartments, onRemove, onReorder }: ComparisonProps) {
  const { dragId, overId, getItemProps } = useDragReorder(onReorder);
  const compared = apartments.filter(isCompared);

  return (
    <main className="min-w-0 flex-1 p-5 md:h-screen md:overflow-auto">
      <h2 className="text-lg font-semibold">Comparison</h2>

      {compared.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-stone-300 p-10 text-center text-stone-600 dark:border-stone-700 dark:text-stone-400">
          {apartments.length === 0 ? (
            <>
              No apartments yet. Select
              <span className="font-medium"> Add apartment</span> in the sidebar to start comparing.
            </>
          ) : (
            "Check one or more apartments in the sidebar to compare them."
          )}
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            The best value in each numeric row is highlighted.
          </p>
          <div className="mt-4 w-fit max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            <table className="w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-100 text-left dark:border-stone-800 dark:bg-stone-800">
                  <th className="sticky left-0 bg-stone-100 px-4 py-3 font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                    &nbsp;
                  </th>
                  {compared.map((a) => (
                    <th
                      key={a.id}
                      {...getItemProps(a.id)}
                      className={`min-w-48 cursor-grab px-4 py-3 text-left align-top font-semibold ${
                        dragId === a.id ? "opacity-40" : ""
                      } ${overId === a.id && dragId !== a.id ? "bg-teal-100 dark:bg-teal-950" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div>{a.name}</div>
                          {a.address && (
                            <div className="mt-0.5 text-xs font-normal text-stone-500 dark:text-stone-400">
                              {a.address}
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={() => onRemove(a.id)}
                          aria-label={`Remove ${a.name}`}
                          className="rounded px-1.5 text-stone-400 hover:text-red-700 dark:hover:text-red-400">
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const winners = bestIds(row, compared);
                  return (
                    <tr key={row.label} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                      <th scope="row"
                        className="sticky left-0 bg-white px-4 py-2.5 text-left font-medium text-stone-600 dark:bg-stone-900 dark:text-stone-400">
                        {row.label}
                      </th>
                      {compared.map((a) => (
                        <td key={a.id}
                          className={`px-4 py-2.5 ${
                            winners.has(a.id)
                              ? "bg-teal-50 font-semibold text-teal-900 dark:bg-teal-950 dark:text-teal-200"
                              : ""
                          }`}>
                          {row.value(a)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}