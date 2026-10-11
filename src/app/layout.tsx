import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09080D",
};

export const metadata: Metadata = {
  title: "Tarot Couple — Bốc Bài Tarot AI Gen Z (Bà Cố Mỏ Hỗn & Tiên Tử Chữa Lành)",
  description:
    "Trải nghiệm bốc bài Tarot AI phản chiếu tâm lý với 22 lá Major Arcana Rider-Waite-Smith 1909. Nhận câu chốt hạ cực gắt và xuất ảnh Story 9:16 chia sẻ ngay.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${cormorant.variable} dark`}
    >
      <body className="min-h-dvh bg-[#09080D] text-[#F8F5F0] antialiased selection:bg-[#D4AF37]/30 selection:text-[#F3E5AB]">
        {children}
      </body>
    </html>
  );
}
