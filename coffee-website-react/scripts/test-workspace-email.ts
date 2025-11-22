#!/usr/bin/env tsx
/**
 * Test Google Workspace Email Sending
 *
 * Simple script to test if Gmail API credentials are working
 *
 * Usage:
 *   npm run test:email
 */

import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testEmail() {
  console.log('📧 Testing Google Workspace Email...');
  console.log('='.repeat(50));

  // Check environment variables
  const requiredVars = [
    'GOOGLE_WORKSPACE_USER',
    'GOOGLE_WORKSPACE_CLIENT_ID',
    'GOOGLE_WORKSPACE_CLIENT_SECRET',
    'GOOGLE_WORKSPACE_REFRESH_TOKEN',
  ];

  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('');
    console.error('Please run: npm run workspace:auth');
    process.exit(1);
  }

  try {
    console.log('✅ Environment variables found');
    console.log(`   User: ${process.env.GOOGLE_WORKSPACE_USER}`);
    console.log('');

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_WORKSPACE_CLIENT_ID,
      process.env.GOOGLE_WORKSPACE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_WORKSPACE_REFRESH_TOKEN,
    });

    console.log('🔑 Refreshing access token...');
    const accessToken = await oauth2Client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to get access token');
    }

    console.log('✅ Access token refreshed');
    console.log('');

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_WORKSPACE_USER,
        clientId: process.env.GOOGLE_WORKSPACE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_WORKSPACE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_WORKSPACE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    console.log('📨 Sending test email...');

    const testEmail = {
      from: `"Stockbridge Coffee" <${process.env.GOOGLE_WORKSPACE_USER}>`,
      to: process.env.GOOGLE_WORKSPACE_USER, // Send to self for testing
      subject: 'Test Email - Google Workspace Integration',
      text: 'This is a test email from the Stockbridge Coffee Google Workspace integration.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #2C5F5D;">✅ Email Integration Test</h2>
          <p>This is a test email from the Stockbridge Coffee Google Workspace integration.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
            Sent at: ${new Date().toLocaleString()}<br>
            From: ${process.env.GOOGLE_WORKSPACE_USER}
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(testEmail);

    console.log('✅ Test email sent successfully!');
    console.log('');
    console.log('Message details:');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   From: ${testEmail.from}`);
    console.log(`   To: ${testEmail.to}`);
    console.log('');
    console.log('🎉 Google Workspace email integration is working!');
    console.log('');
    console.log('Check your inbox at:', process.env.GOOGLE_WORKSPACE_USER);

  } catch (error) {
    console.error('❌ Error testing email:', error);
    console.error('');

    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        console.error('The refresh token may have expired or been revoked.');
        console.error('Please run: npm run workspace:auth');
      } else if (error.message.includes('access_denied')) {
        console.error('Access denied. Check your OAuth scopes in Google Cloud Console.');
      }
    }

    process.exit(1);
  }
}

testEmail();
