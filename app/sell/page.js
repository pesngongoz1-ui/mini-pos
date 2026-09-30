'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SellPage() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (error) console.error(error)
    else setProducts(data || [])
    setLoading(false)
  }

  function addToCart(product) {
    if (product.stock <= 0) {
      alert('สินค้าหมดสต๊อกแล้ว!')
      return
    }

    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      if (existing.qty >= product.stock) {
        alert('จำนวนสินค้าในตะกร้าเกินสต๊อกที่มี!')
        return
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
  }

  function removeFromCart(id) {
    setCart(cart.filter(item => item.id !== id))
  }

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)

  async function handleCheckout() {
    if (cart.length === 0) return

    setLoading(true)
    setMessage('กำลังทำรายการ...')

    try {
      for (const item of cart) {
        // 1. บันทึกประวัติการขาย
        const { error: saleErr } = await supabase.from('sales').insert([
          {
            product_id: item.id,
            product_name: item.name,
            quantity: item.qty,
            total_price: item.price * item.qty
          }
        ])
        if (saleErr) throw saleErr

        // 2. ตัดสต๊อกสินค้า
        const newStock = item.stock - item.qty
        const { error: updateErr } = await supabase.from('products')
          .update({ stock: newStock })
          .eq('id', item.id)
        if (updateErr) throw updateErr
      }

      setMessage('✅ ทำรายการขายและตัดสต๊อกเรียบร้อยแล้ว!')
      setCart([])
      fetchProducts()
    } catch (err) {
      console.error(err)
      setMessage('❌ เกิดข้อผิดพลาดในการขาย')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* ฝั่งซ้าย: รายการสินค้า */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4 text-amber-900">🍞 รายการสินค้า</h2>
        {message && <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded font-medium">{message}</div>}
        
        {loading && products.length === 0 ? (
          <p>กำลังโหลดข้อมูลสินค้า...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-lg shadow border border-amber-100 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-amber-600 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded">{p.sku}</span>
                  <h3 className="font-bold text-lg mt-1 text-slate-800">{p.name}</h3>
                  <p className="text-amber-800 font-bold text-xl my-2">{p.price} บาท / {p.unit}</p>
                  <p className={`text-sm ${p.stock > 0 ? 'text-slate-500' : 'text-red-500 font-bold'}`}>
                    คงเหลือ: {p.stock} {p.unit}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(p)}
                  disabled={p.stock <= 0}
                  className={`mt-4 w-full py-2 px-4 rounded font-bold transition ${
                    p.stock > 0 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {p.stock > 0 ? '+ เพิ่มลงตะกร้า' : 'สินค้าหมด'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ฝั่งขวา: ตะกร้าสินค้า / คิดเงิน */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 h-fit">
        <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">🛒 ตะกร้าสินค้า</h2>
        
        {cart.length === 0 ? (
          <p className="text-slate-400 py-8 text-center">ยังไม่มีสินค้าในตะกร้า</p>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-sm text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.price} x {item.qty} = {item.price * item.qty} บาท</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 bg-red-50 rounded"
                >
                  ลบ
                </button>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>ราคารวมทั้งหมด:</span>
                <span className="text-amber-800">{totalAmount} บาท</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold text-lg shadow transition disabled:opacity-50"
              >
                {loading ? 'กำลังประมวลผล...' : 'ชำระเงิน / ตัดสต๊อก'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
