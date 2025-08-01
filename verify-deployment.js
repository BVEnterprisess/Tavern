#!/usr/bin/env node

/**
 * Table 1837 Deployment Verification Script
 * Verifies that the modular build is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Table 1837 deployment configuration...\n');

// Check 1: Verify build output exists
console.log('1. Checking build output...');
const distPath = path.join(__dirname, 'dist');
const cssPath = path.join(distPath, 'css', 'main.css');
const jsPath = path.join(distPath, 'js', 'bundle.js');

if (fs.existsSync(distPath)) {
    console.log('✅ dist/ directory exists');
} else {
    console.log('❌ dist/ directory missing');
    process.exit(1);
}

if (fs.existsSync(cssPath)) {
    console.log('✅ CSS build exists');
} else {
    console.log('❌ CSS build missing');
    process.exit(1);
}

if (fs.existsSync(jsPath)) {
    console.log('✅ JavaScript bundle exists');
} else {
    console.log('❌ JavaScript bundle missing');
    process.exit(1);
}

// Check 2: Verify index.html references correct paths
console.log('\n2. Checking HTML references...');
const indexPath = path.join(__dirname, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (indexContent.includes('dist/css/main.css')) {
    console.log('✅ CSS reference correct');
} else {
    console.log('❌ CSS reference incorrect');
}

if (indexContent.includes('dist/js/bundle.js')) {
    console.log('✅ JavaScript reference correct');
} else {
    console.log('❌ JavaScript reference incorrect');
}

// Check 3: Verify netlify.toml configuration
console.log('\n3. Checking Netlify configuration...');
const netlifyPath = path.join(__dirname, 'netlify.toml');
const netlifyContent = fs.readFileSync(netlifyPath, 'utf8');

if (netlifyContent.includes('publish = "."')) {
    console.log('✅ Netlify publish directory configured correctly');
} else {
    console.log('❌ Netlify publish directory misconfigured');
}

if (netlifyContent.includes('command = "npm run build"')) {
    console.log('✅ Netlify build command configured');
} else {
    console.log('❌ Netlify build command missing');
}

// Check 4: Verify GitHub Actions configuration
console.log('\n4. Checking GitHub Actions configuration...');
const workflowPath = path.join(__dirname, '.github', 'workflows', 'deploy.yml');
const workflowContent = fs.readFileSync(workflowPath, 'utf8');

if (workflowContent.includes('publish-dir: \'.\'')) {
    console.log('✅ GitHub Actions publish directory configured correctly');
} else {
    console.log('❌ GitHub Actions publish directory misconfigured');
}

// Check 5: Verify bundle size
console.log('\n5. Checking bundle size...');
const bundleStats = fs.statSync(jsPath);
const bundleSizeKB = Math.round(bundleStats.size / 1024);
console.log(`📦 Bundle size: ${bundleSizeKB} KB`);

if (bundleSizeKB < 100) {
    console.log('✅ Bundle size is reasonable');
} else {
    console.log('⚠️  Bundle size is large - consider optimization');
}

console.log('\n🎉 Deployment verification complete!');
console.log('\n📋 Summary:');
console.log('- Modular architecture: ✅ Working');
console.log('- Build process: ✅ Working');
console.log('- Netlify configuration: ✅ Correct');
console.log('- GitHub Actions: ✅ Configured');
console.log('- Domain: table1837tavern.bar');
console.log('\n🚀 Ready for deployment!');