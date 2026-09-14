import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type LedgerOwnerAggregate = 'INCOME_SOURCE' | 'FEE_RECEIPT';
export type LedgerOwnerFlowMode = 'CREATE' | 'EDIT';

export type LedgerOwnerFlowIntent = {
  ownerAggregate: LedgerOwnerAggregate;
  mode: LedgerOwnerFlowMode;
  ownerRecordId?: string;
};

type LedgerOwnerFlowContextValue = {
  intent: LedgerOwnerFlowIntent | null;
  opened: boolean;
  markOpened: () => void;
  complete: () => void;
};

const LedgerOwnerFlowContext = createContext<LedgerOwnerFlowContextValue>({
  intent: null,
  opened: false,
  markOpened: () => undefined,
  complete: () => undefined
});

export function LedgerOwnerFlowProvider({
  intent,
  onComplete,
  children
}: {
  intent: LedgerOwnerFlowIntent | null;
  onComplete: () => void;
  children: ReactNode;
}) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setOpened(false);
  }, [intent?.ownerAggregate, intent?.mode, intent?.ownerRecordId]);

  const value = useMemo<LedgerOwnerFlowContextValue>(() => ({
    intent,
    opened,
    markOpened: () => setOpened(true),
    complete: onComplete
  }), [intent, opened, onComplete]);

  return <LedgerOwnerFlowContext.Provider value={value}>{children}</LedgerOwnerFlowContext.Provider>;
}

export function useLedgerOwnerFlow() {
  return useContext(LedgerOwnerFlowContext);
}
