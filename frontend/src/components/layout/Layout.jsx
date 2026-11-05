import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useReferenceStore } from "../../store/referenceStore";

export default function Layout() {
  const loadReferenceData = useReferenceStore((state) => state.loadReferenceData);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
