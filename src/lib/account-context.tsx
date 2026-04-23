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
    // Reflect in the DOM immediately so theme variables flip before React finishes
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-account", newAccount);
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("account", newAccount);
    // replace (not push) avoids history entries; scroll:false avoids a jump
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
