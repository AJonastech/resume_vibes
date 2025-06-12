import './globals.css'
import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import GridBackground from '../components/GridBackground'
import Script from 'next/script'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
})

export const metadata = {
  title: 'Resume Vibes Check',
  description: 'Get a fun, quirky analysis of your resume vibes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Load PDF.js worker from CDN */}
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js" 
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
        <GridBackground />
        {children}
      </body>
    </html>
  )
}
