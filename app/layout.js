import './globals.css'

export const metadata = {
  title: 'ระบบขายหน้าร้าน Mini POS',
  description: 'ระบบ Mini POS สำหรับร้านขนมปัง',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <nav className="bg-amber-800 text-white p-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
              🍞 Bakery Mini POS
            </h1>
            <div className="flex gap-4 font-medium">
              <a href="/sell" className="hover:underline bg-amber-700 px-3 py-1 rounded">🛒 หน้าขายสินค้า</a>
              <a href="/products" className="hover:underline bg-amber-700 px-3 py-1 rounded">📦 จัดการสต๊อก</a>
              <a href="/sales" className="hover:underline bg-amber-700 px-3 py-1 rounded">📊 รายงานยอดขาย</a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-4 my-6">
          {children}
        </main>
      </body>
    </html>
  )
}
