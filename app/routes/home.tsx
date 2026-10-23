import { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import Comparison from "../components/Comparison";
import Sidebar from "../components/Sidebar";
import type { Apartment } from "../lib/apartment";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Apartment Compare" }];
}

const STORAGE_KEY = "apt-compare-tool:apartments";

export default function Home() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved apartments after mount (safe with server rendering)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setApartments(JSON.parse(saved));
    } catch {
      // ignore corrupt or unavailable storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(apartments));
    } catch {
      // storage may be unavailable
    }
  }, [apartments, loaded]);

  // Adds a new apartment, or replaces an existing one with the same id
  function handleSave(apartment: Apartment) {
    setApartments((list) =>
      list.some((a) => a.id === apartment.id)
        ? list.map((a) => (a.id === apartment.id ? apartment : a))
        : [...list, apartment],
    );
  }

  function handleToggle(id: string) {
    setApartments((list) =>
      list.map((a) => (a.id === id ? { ...a, selected: a.selected === false } : a)),
    );
  }

  // Moves the dragged apartment to the position of the one it was dropped on
  function handleReorder(fromId: string, toId: string) {
    if (fromId === toId) return;
    setApartments((list) => {
      const from = list.findIndex((a) => a.id === fromId);
      const to = list.findIndex((a) => a.id === toId);
      if (from < 0 || to < 0) return list;
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function handleRemove(id: string) {
    setApartments((list) => list.filter((a) => a.id !== id));
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 md:flex-row">
      <Sidebar
        apartments={apartments}
        onSave={handleSave}
        onToggle={handleToggle}
        onRemove={handleRemove}
        onReorder={handleReorder}
      />
      <Comparison apartments={apartments} onRemove={handleRemove} onReorder={handleReorder} />
    </div>
  );
}