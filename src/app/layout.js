import { DM_Sans } from 'next/font/google'
import { GlobalStateProvider } from '@/context/GolobalStateProvider';
import { ThemeProvider } from '@/layout/theme-provider/theme-provider';
import AuthProvider from '@/components/AuthProvider';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '@/styles/scss/style.scss';

// Font Family
const dm_sans = DM_Sans({
  weight: ["400", "500", "700"],
  display: "swap",
  subsets: ["latin"],
  variable: '--font-jampack'
})

// metadata
export const metadata = {
  title: 'SantriGresik CRM | Admin Dashboard',
  description: 'Internal CRM System for SantriGresik.id',
}

export default function RootLayout({ children }) {

  return (
    <html lang="en" className={`${dm_sans.variable}`} data-bs-theme="dark">
      <body>
        <AuthProvider>
            <ThemeProvider>
            <GlobalStateProvider>
                {children}
            </GlobalStateProvider>
            </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}