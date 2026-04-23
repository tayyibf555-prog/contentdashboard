"use client";

import { createContext, useContext, useState, useEffect, ReactNode, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { AccountType } from "@/types";

type AccountContextType = {
  account: AccountType;
  setAccount: (account: AccountType) => void;
};

const AccountContext = createContext<AccountContextType>({
  account: "business",
  setAccount: () => {},
});

function AccountProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paramAccount = searchParams.get("account") as AccountType | null;
  const [account, setAccountState] = useState<AccountType>(
    paramAccount === "personal" ? "personal" : "business"
  );

  useEffect(() => {
    if (paramAccount === "personal" || paramAccount === "business") {
      setAccountState(paramAccount);
    }
  }, [paramAccount]);

  // Reflect the active account on <html data-account="..."> so CSS can theme
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-account", account);
    }
  }, [account]);

  const setAccount = (newAccount: AccountType) => {
    setAccountState(newAccount);
    const params = new URLSearchParams(searchParams.toString());
    params.set("account", newAccount);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function AccountProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <AccountProviderInner>{children}</AccountProviderInner>
    </Suspense>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
