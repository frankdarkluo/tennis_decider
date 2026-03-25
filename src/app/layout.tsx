import "@/app/globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import { EventLoggerProvider } from "@/components/research/EventLoggerProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <EventLoggerProvider>
            <AuthModalProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </AuthModalProvider>
          </EventLoggerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
