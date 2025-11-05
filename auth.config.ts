// NextAuth configuration (scaffolded, disabled for now)
// To enable: uncomment and configure providers, then enable middleware

/*
import type { NextAuthConfig } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

export const authConfig = {
  providers: [
    // Email provider (to be configured with SMTP)
    // EmailProvider({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    // }),
    
    // Microsoft Entra (Azure AD)
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      // For now, allow all routes (authentication disabled)
      return true
    },
  },
} satisfies NextAuthConfig
*/

export {}

