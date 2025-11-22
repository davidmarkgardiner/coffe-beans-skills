#!/usr/bin/env tsx
/**
 * Gmail OAuth Authentication Setup
 *
 * This script helps you authenticate with Gmail API and save the refresh token
 *
 * Usage:
 *   npm run gmail:auth
 */

import { google } from 'googleapis'
import * as http from 'http'
import * as url from 'url'
import * as fs from 'fs/promises'
import * as dotenv from 'dotenv'
import open from 'open'

dotenv.config({ path: '.env.local' })

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
]
const TOKEN_PATH = './gmail-token.json'
const CREDENTIALS_PATH = './scripts/credentials/gmail-credentials.json'
const REDIRECT_URI = 'http://localhost:8888/oauth2callback'
const PORT = 8888

/**
 * Read credentials from file or environment
 */
async function getCredentials() {
  // Try to read from credentials file
  try {
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8')
    const credentials = JSON.parse(content)
    return credentials.installed || credentials.web
  } catch (error) {
    // Fall back to environment variables
    const clientId = process.env.GMAIL_CLIENT_ID
    const clientSecret = process.env.GMAIL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error(
        'Missing Gmail credentials. Please either:\n' +
        '1. Download credentials from Google Cloud Console and save as gmail-credentials.json\n' +
        '2. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env.local'
      )
    }

    return {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [REDIRECT_URI],
    }
  }
}

/**
 * Get authorization URL
 */
function getAuthUrl(oauth2Client: any): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent screen to get refresh token
  })
}

/**
 * Start local server and wait for OAuth callback
 */
function getAuthorizationCode(authUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (req.url?.indexOf('/oauth2callback') > -1) {
          const qs = new url.URL(req.url, `http://localhost:${PORT}`).searchParams
          const code = qs.get('code')

          if (code) {
            res.end('Authentication successful! You can close this window and return to the terminal.')
            server.close()
            resolve(code)
          } else {
            res.end('Authentication failed: No code received')
            server.close()
            reject(new Error('No authorization code received'))
          }
        }
      } catch (e) {
        reject(e)
      }
    }).listen(PORT, () => {
      console.log('')
      console.log('🔐 Gmail OAuth Authorization')
      console.log('='.repeat(50))
      console.log('')
      console.log(`Starting local server on port ${PORT}...`)
      console.log('Opening browser for authentication...')
      console.log('If browser does not open automatically, visit:')
      console.log('')
      console.log(authUrl)
      console.log('')

      // Automatically open browser
      open(authUrl).catch(() => {
        console.log('Could not open browser automatically. Please open the URL manually.')
      })
    })
  })
}

/**
 * Exchange authorization code for tokens
 */
async function getTokens(oauth2Client: any, code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    return tokens
  } catch (error) {
    throw new Error(`Failed to get tokens: ${error}`)
  }
}

/**
 * Save tokens to file and display env vars
 */
async function saveTokens(tokens: any, credentials: any) {
  // Save to file
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2))
  console.log('')
  console.log('✅ Tokens saved to:', TOKEN_PATH)

  // Display environment variables
  console.log('')
  console.log('📝 Add these to your .env.local file:')
  console.log('='.repeat(50))
  console.log('')
  console.log('# For Newsletter (existing):')
  console.log(`GMAIL_USER=your-email@gmail.com`)
  console.log(`GMAIL_CLIENT_ID=${credentials.client_id}`)
  console.log(`GMAIL_CLIENT_SECRET=${credentials.client_secret}`)
  console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`)
  console.log('')
  console.log('# For Google Workspace (order notifications + AI email):')
  console.log(`GOOGLE_WORKSPACE_USER=hello@stockbridgecoffee.co.uk`)
  console.log(`GOOGLE_WORKSPACE_CLIENT_ID=${credentials.client_id}`)
  console.log(`GOOGLE_WORKSPACE_CLIENT_SECRET=${credentials.client_secret}`)
  console.log(`GOOGLE_WORKSPACE_REFRESH_TOKEN=${tokens.refresh_token}`)
  console.log('')

  // For GitHub Actions
  console.log('🔧 For GitHub Actions, add these secrets:')
  console.log('='.repeat(50))
  console.log('')
  console.log('# Gmail (newsletter):')
  console.log('gh secret set GMAIL_USER --body "your-email@gmail.com"')
  console.log(`gh secret set GMAIL_CLIENT_ID --body "${credentials.client_id}"`)
  console.log(`gh secret set GMAIL_CLIENT_SECRET --body "${credentials.client_secret}"`)
  console.log(`gh secret set GMAIL_REFRESH_TOKEN --body "${tokens.refresh_token}"`)
  console.log('')
  console.log('# Google Workspace (order notifications + AI):')
  console.log('gh secret set GOOGLE_WORKSPACE_USER --body "hello@stockbridgecoffee.co.uk"')
  console.log(`gh secret set GOOGLE_WORKSPACE_CLIENT_ID --body "${credentials.client_id}"`)
  console.log(`gh secret set GOOGLE_WORKSPACE_CLIENT_SECRET --body "${credentials.client_secret}"`)
  console.log(`gh secret set GOOGLE_WORKSPACE_REFRESH_TOKEN --body "${tokens.refresh_token}"`)
  console.log('')
}

/**
 * Main execution function
 */
async function main() {
  console.log('☕ Stockbridge Coffee - Gmail Authentication Setup')
  console.log('='.repeat(50))

  try {
    // Get credentials
    console.log('📖 Reading credentials...')
    const credentials = await getCredentials()
    console.log('✅ Credentials loaded')

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    )

    // Get authorization URL
    const authUrl = getAuthUrl(oauth2Client)

    // Prompt user for code
    const code = await getAuthorizationCode(authUrl)

    // Exchange code for tokens
    console.log('')
    console.log('🔄 Exchanging authorization code for tokens...')
    const tokens = await getTokens(oauth2Client, code)

    // Save tokens
    await saveTokens(tokens, credentials)

    console.log('✅ Authentication complete!')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Test email sending: npm run test:email')
    console.log('  2. Send newsletter: npm run send:newsletter --dry-run')

  } catch (error) {
    console.error('❌ Error during authentication:', error)
    console.error('')
    console.error('Please ensure:')
    console.error('  1. Gmail API is enabled in Google Cloud Console')
    console.error('  2. OAuth consent screen is configured')
    console.error('  3. Credentials are correctly set up')
    console.error('')
    console.error('See scripts/gmail-setup.md for detailed instructions')
    process.exit(1)
  }
}

main()
