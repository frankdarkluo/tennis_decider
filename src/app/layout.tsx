import "@/app/globals.css";
import { AppShellProvider } from "@/components/app/AppShellProvider";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { EventLoggerProvider } from "@/components/research/EventLoggerProvider";
import { I18nProvider } from "@/lib/i18n/config";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <AppShellProvider>
            <I18nProvider>
              <AuthModalProvider>
                <Header />
                <EventLoggerProvider>
                  <main className="pb-24 md:pb-0">{children}</main>
                </EventLoggerProvider>
                <BottomNav />
                <Footer />
              </AuthModalProvider>
            </I18nProvider>
          </AppShellProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
