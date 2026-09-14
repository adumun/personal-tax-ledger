import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type LedgerOwnerAggregate = 'INCOME_SOURCE' | 'FEE_RECEIPT' | 'FOREIGN_SERVICE_INCOME';
export type LedgerOwnerFlowMode = 'CREATE' | 'EDIT';

export type LedgerOwnerFlowIntent = {
  ownerAggregate: LedgerOwnerAggregate;
  mode: LedgerOwnerFlowMode;
  ownerRecordId?: string;
};

type LedgerOwnerFlowContextValue = {
  intent: LedgerOwnerFlowIntent | null;
  opened: boolean;
  begin: (intent: LedgerOwnerFlowIntent) => void;
  markOpened: () => void;
  complete: () => void;
};

const LedgerOwnerFlowContext = createContext<LedgerOwnerFlowContextValue>({
  intent: null,
  opened: false,
  begin: () => undefined,
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
  const [activeIntent, setActiveIntent] = useState<LedgerOwnerFlowIntent | null>(intent);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    setActiveIntent(intent);
    setOpened(false);
  }, [intent?.ownerAggregate, intent?.mode, intent?.ownerRecordId]);

  const value = useMemo<LedgerOwnerFlowContextValue>(() => ({
    intent: activeIntent,
    opened,
    begin: nextIntent => {
      setActiveIntent(nextIntent);
      setOpened(false);
    },
    markOpened: () => setOpened(true),
    complete: () => {
      setActiveIntent(null);
      setOpened(false);
      onComplete();
    }
  }), [activeIntent, opened, onComplete]);

  return <LedgerOwnerFlowContext.Provider value={value}>{children}</LedgerOwnerFlowContext.Provider>;
}

export function useLedgerOwnerFlow() {
  return useContext(LedgerOwnerFlowContext);
}
