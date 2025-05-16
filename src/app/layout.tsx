// app/layout.tsx (Next.js 13 app dir)
import './globals.css';
import Footer from './component/footer';
import CircleBadge from './component/circlebadge';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {/* CircleBadge fixed in top-right corner */}
        <div className="absolute top-4 right-4 z-50">
          <CircleBadge />
        </div>

        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
