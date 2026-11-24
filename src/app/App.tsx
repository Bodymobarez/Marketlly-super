import { BrowserRouter, useLocation } from "react-router";
import { Toaster } from "sonner";
import "./i18n";
import { AppProvider, useApp } from "./AppContext";
import { ElementsProvider } from "./ElementsContext";
import { AuctionProvider } from "./AuctionContext";
import { CatalogProvider } from "./PostAdCatalogContext";
import { AuthProvider } from "./AuthContext";
import { AppRoutes } from "./router";
import { LiveEditIndicator } from "./components/LiveEditIndicator";
import {
  MobileBottomNav,
  MOBILE_TAB_PAD,
  shouldShowMobileTabs,
} from "./components/MobileBottomNav";

function Shell() {
  const { theme } = useApp();
  const { pathname } = useLocation();
  const showTabs = shouldShowMobileTabs(pathname);
  return (
    <>
      <Toaster theme={theme} position="top-center" richColors />
      <LiveEditIndicator />
      <div
        className={`font-sans-app min-h-dvh ${showTabs ? MOBILE_TAB_PAD : ""}`}
      >
        <AppRoutes />
      </div>
      <MobileBottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <CatalogProvider>
            <ElementsProvider>
              <AuctionProvider>
                <Shell />
              </AuctionProvider>
            </ElementsProvider>
          </CatalogProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
