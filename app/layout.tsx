import Nav from "../component/Nav";
import "./globals.css";
import ToastProvider from "../component/ToastProvider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='  md:flex'>
        <Nav />

        <main className='flex-1 h-screen overflow-y-auto'>
          {children}
          <ToastProvider />
        </main>
      </body>
    </html>
  );
}
