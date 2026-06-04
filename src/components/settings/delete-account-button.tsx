"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirm !== "DELETE") {
      setError('Type DELETE in the box to confirm.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not delete account");
        setLoading(false);
        return;
      }

      await signOut({ redirect: false });
      router.push("/auth/login");
      router.refresh();
    } catch {
      setError("Could not delete account");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="danger"
        size="md"
        onClick={() => setOpen(true)}
      >
        Delete account
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        This permanently removes your operative node, watchlist, and sign-in data.
        Type <span className="font-mono text-danger">DELETE</span> to confirm.
      </p>

      <input
        type="text"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="DELETE"
        autoComplete="off"
        className="w-full rounded-lg border border-danger/40 bg-bg-deep px-4 py-3 font-mono text-sm text-foreground placeholder:text-dim focus:border-danger/60 focus:outline-none focus:ring-1 focus:ring-danger/30"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="danger"
          size="md"
          disabled={loading || confirm !== "DELETE"}
          onClick={handleDelete}
        >
          {loading ? "Deleting…" : "Permanently delete"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={loading}
          onClick={() => {
            setOpen(false);
            setConfirm("");
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
