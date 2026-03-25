"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { LoginModal } from "@/components/auth/LoginModal";

type AuthModalContextValue = {
  openLoginModal: (contextMessage?: string) => void;
  closeLoginModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [contextMessage, setContextMessage] = useState<string | undefined>(undefined);

  const value = useMemo<AuthModalContextValue>(
    () => ({
      openLoginModal: (message?: string) => {
        setContextMessage(message);
        setOpen(true);
      },
      closeLoginModal: () => {
        setOpen(false);
        setContextMessage(undefined);
      }
    }),
    []
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <LoginModal open={open} onClose={value.closeLoginModal} contextMessage={contextMessage} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }

  return context;
}
