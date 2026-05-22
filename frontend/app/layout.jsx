import "./globals.css";
import { Dancing_Script } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export const metadata = {
  title: "HelloMamaBetter",
  description: "Reproductive health for university students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={dancingScript.variable}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
