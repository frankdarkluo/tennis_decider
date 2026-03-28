import "@/app/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { EventLoggerProvider } from "@/components/research/EventLoggerProvider";
import { StudyProvider } from "@/components/study/StudyProvider";
import { I18nProvider } from "@/lib/i18n/config";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <StudyProvider>
            <I18nProvider>
              <EventLoggerProvider>
                <AuthModalProvider>
                  <Header />
                  <main>{children}</main>
                  <Footer />
                </AuthModalProvider>
              </EventLoggerProvider>
            </I18nProvider>
          </StudyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
