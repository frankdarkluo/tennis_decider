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
      <body className="min-h-screen">
        <AuthProvider>
          <AppShellProvider>
            <I18nProvider>
              <AuthModalProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <EventLoggerProvider>
                    <main className="flex-1 pb-24 md:pb-0">{children}</main>
                  </EventLoggerProvider>
                  <BottomNav />
                  <Footer />
                </div>
              </AuthModalProvider>
            </I18nProvider>
          </AppShellProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
