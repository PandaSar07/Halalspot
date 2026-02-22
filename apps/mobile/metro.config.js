const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve symlinks
config.resolver.unstable_enableSymlinks = true;
// 4. Enable package exports support (critical for many modern libraries)
config.resolver.unstable_enablePackageExports = true;

// 5. Force resolution of specific modules that Metro might miss in pnpm structure
config.resolver.extraNodeModules = {
    '@supabase/functions-js': path.resolve(workspaceRoot, 'node_modules/@supabase/functions-js'),
    '@supabase/postgrest-js': path.resolve(workspaceRoot, 'node_modules/@supabase/postgrest-js'),
    '@supabase/realtime-js': path.resolve(workspaceRoot, 'node_modules/@supabase/realtime-js'),
    '@supabase/storage-js': path.resolve(workspaceRoot, 'node_modules/@supabase/storage-js'),
    '@supabase/supabase-js': path.resolve(workspaceRoot, 'node_modules/@supabase/supabase-js'),
};

module.exports = config;
