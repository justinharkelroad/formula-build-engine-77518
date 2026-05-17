import { createContext, useContext, useState, ReactNode } from "react";
import type { PricingTier } from "@/config/pricing";

interface PassDialogState {
  isOpen: boolean;
  tier: PricingTier;
  open: (tier?: PricingTier) => void;
  close: () => void;
}

const PassDialogContext = createContext<PassDialogState | null>(null);

export const PassDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tier, setTier] = useState<PricingTier>("earlyBird");

  const open = (t: PricingTier = "earlyBird") => {
    setTier(t);
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);

  return (
    <PassDialogContext.Provider value={{ isOpen, tier, open, close }}>
      {children}
    </PassDialogContext.Provider>
  );
};

export const usePassDialog = () => {
  const ctx = useContext(PassDialogContext);
  if (!ctx) throw new Error("usePassDialog must be used inside <PassDialogProvider>");
  return ctx;
};
