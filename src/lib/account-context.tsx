"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { AccountType } from "@/types";

type AccountContextType = {
  account: AccountType;
  setAccount: (account: AccountType) => void;
};

const AccountContext = createContext<AccountContextType>({
  account: "business",
  setAccount: () => {},
});

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountType>("business");
  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
