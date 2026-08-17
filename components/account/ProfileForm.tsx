"use client";

import { useState, type FormEvent } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserAvatar } from "@/components/account/UserAvatar";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { fetchWithAuth } from "@/lib/client/fetch-with-auth";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

interface ProfileFormProps {
  labels: Dictionary["account"]["profile"];
}

export function ProfileForm({ labels }: ProfileFormProps) {
  const { user, updateDisplayName } = useAuth();
  if (!user) return null;

  // Keying on uid (instead of syncing displayName via an effect) remounts
  // this with a fresh useState initializer whenever the signed-in user
  // changes, so there's no cascading-render sync needed.
  return (
    <ProfileFormFields
      key={user.uid}
      user={user}
      labels={labels}
      updateDisplayName={updateDisplayName}
    />
  );
}

interface ProfileFormFieldsProps {
  user: User;
  labels: Dictionary["account"]["profile"];
  updateDisplayName: (displayName: string) => Promise<void>;
}

function ProfileFormFields({
  user,
  labels,
  updateDisplayName,
}: ProfileFormFieldsProps) {
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextName = displayName.trim();
    if (!nextName) {
      setError(labels.nameRequired);
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateDisplayName(nextName);
      // Keep D1 app profile in sync for library/admin queries.
      const response = await fetchWithAuth(user, "/api/v1/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName: nextName }),
      });
      if (!response.ok) {
        throw new Error(`me patch ${response.status}`);
      }
      setMessage(labels.saved);
    } catch {
      setError(labels.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <UserAvatar
          name={user.displayName || labels.title}
          photoURL={user.photoURL}
          className="h-16 w-16 text-lg"
        />
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-black text-white">
            {user.displayName || labels.title}
          </h2>
          <p className="mt-1 truncate text-sm text-frame-silver">
            {user.email || user.phoneNumber || labels.noContact}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="displayName" className="text-sm font-medium text-white">
            {labels.displayName}
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="rounded-xl border border-frame-border bg-frame-bg px-4 py-3 text-sm text-white placeholder:text-frame-muted focus:border-frame-cyan focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-white">
            {labels.email}
          </label>
          <input
            id="email"
            type="email"
            value={user.email ?? ""}
            readOnly
            className="rounded-xl border border-frame-border bg-frame-bg/60 px-4 py-3 text-sm text-frame-silver"
          />
          <p className="text-xs text-frame-muted">{labels.emailHint}</p>
        </div>

        {user.phoneNumber ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-medium text-white">
              {labels.phone}
            </label>
            <input
              id="phone"
              type="tel"
              dir="ltr"
              value={user.phoneNumber}
              readOnly
              className="rounded-xl border border-frame-border bg-frame-bg/60 px-4 py-3 text-sm text-frame-silver"
            />
          </div>
        ) : null}

        <Button type="submit" disabled={isSaving}>
          {isSaving ? labels.saving : labels.save}
        </Button>

        {message ? (
          <p className="text-sm font-medium text-frame-cyan">{message}</p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm font-medium text-frame-magenta">
            {error}
          </p>
        ) : null}
      </form>
    </Panel>
  );
}
