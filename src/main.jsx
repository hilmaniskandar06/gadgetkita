﻿﻿import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx'
import { HealthCheckProvider, HealthWarningBanner } from './components/HealthCheck.jsx'
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

console.log('%c🚀 GadgetKita App booting...', 'color: #84cc16; font-weight: bold; font-size: 12px;')
console.log(`  Build: ${typeof __APP_VERSION__ !== 'undefined' ? 'v' + __APP_VERSION__ : 'unknown'}`)
console.log(`  Env URL:  ${import.meta.env.VITE_SUPABASE_URL ? import.meta.env.VITE_SUPABASE_URL.slice(0, 35) + '...' : '⚠️  NOT SET'}`)
console.log(`  Env Key:  ${import.meta.env.VITE_SUPABASE_ANON_KEY ? (import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0, 8) + '...' + import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-6) + ` (len:${import.meta.env.VITE_SUPABASE_ANON_KEY.length})`) : '⚠️  NOT SET'}`)

ReactDOM.createRoot(document.getElementById('root')).render(
  <GlobalErrorBoundary>
    <HealthCheckProvider>
      <HealthWarningBanner />
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
    </HealthCheckProvider>
  </GlobalErrorBoundary>
)
