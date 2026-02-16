#!/usr/bin/env node

/**
 * Generate TypeScript types from Supabase schema
 * 
 * Prerequisites:
 * 1. Supabase CLI installed: npm install -g supabase
 * 2. Supabase project linked: supabase link --project-ref your-project-ref
 * 3. Environment variables set in .env
 * 
 * Usage: pnpm db:generate-types
 */

const { execSync } = require('child_process');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'src', 'database.types.ts');

try {
    console.log('🔄 Generating types from Supabase schema...');

    execSync(
        `supabase gen types typescript --local > ${outputPath}`,
        { stdio: 'inherit', cwd: path.join(__dirname, '..', '..', '..') }
    );

    console.log('✅ Types generated successfully at:', outputPath);
} catch (error) {
    console.error('❌ Failed to generate types:', error.message);
    console.error('\nMake sure:');
    console.error('1. Supabase CLI is installed: npm install -g supabase');
    console.error('2. You have run: supabase start (for local dev)');
    console.error('3. Or linked to remote: supabase link --project-ref YOUR_PROJECT_REF');
    process.exit(1);
}
