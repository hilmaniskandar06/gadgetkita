import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { CategoriesProvider } from './context/CategoriesContext.jsx'
import { SiteContentProvider } from './context/SiteContentContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { VoucherProvider } from './context/VoucherContext.jsx'
import { PaymentProvider } from './context/PaymentContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <CategoriesProvider>
          <SiteContentProvider>
            <ProductsProvider>
              <VoucherProvider>
                <PaymentProvider>
                  <CartProvider>
                    <WishlistProvider>
                      <NotificationProvider>
                        <ChatProvider>
                          <App />
                        </ChatProvider>
                      </NotificationProvider>
                    </WishlistProvider>
                  </CartProvider>
                </PaymentProvider>
              </VoucherProvider>
            </ProductsProvider>
          </SiteContentProvider>
        </CategoriesProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
)
