# Table 1837 Bar Management System - Deployment Guide

## Overview

This guide covers the deployment of the refactored Table 1837 Bar Management System with proper CI/CD pipeline, OCR functionality, and modular architecture.

## Architecture

The application has been refactored from a single HTML file into a modular structure:

```
Tavern/
├── src/
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   ├── app.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── ocrService.js
│   │   ├── modules/
│   │   │   ├── admin.js
│   │   │   ├── dashboard.js
│   │   │   ├── inventory.js
│   │   │   ├── staff.js
│   │   │   └── wine.js
│   │   └── tests/
│   │       ├── setup.js
│   │       └── authService.test.js
├── dist/
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── bundle.js
├── .github/
│   └── workflows/
│       └── deploy.yml
├── index.html
├── package.json
├── webpack.config.js
├── postcss.config.js
├── jest.config.js
├── .eslintrc.js
└── netlify.toml
```

## Key Features

### 1. Real OCR Functionality
- Uses Tesseract.js for image text recognition
- Processes menu images to extract wine and food information
- Automatically updates dashboard with extracted data
- Supports various image formats (JPEG, PNG, etc.)

### 2. Modular Architecture
- Separated concerns into modules (Dashboard, Staff, Admin, Wine, Inventory)
- Service layer for authentication and OCR
- Clean separation of CSS and JavaScript
- Maintainable and testable code structure

### 3. CI/CD Pipeline
- GitHub Actions workflow for automated testing and deployment
- Runs tests, linting, and builds before deployment
- Automatic deployment to Netlify on successful builds
- Code quality checks and coverage reporting

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Development

```bash
# Start development server
npm run dev

# Build for development
npm run build:dev

# Build for production
npm run build
```

### 3. Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## Deployment Configuration

### Netlify Configuration

The `netlify.toml` file configures:
- Build settings and publish directory
- SPA routing with redirects
- Security headers
- Cache control
- Environment variables

### GitHub Actions

The CI/CD pipeline includes:
- Node.js setup with caching
- Dependency installation
- Test execution
- Code linting
- Build verification
- Automatic deployment to Netlify

### Environment Variables

Set these in your Netlify dashboard:
- `NETLIFY_AUTH_TOKEN`: Your Netlify authentication token
- `NETLIFY_SITE_ID`: Your Netlify site ID

## OCR Functionality

### How to Use OCR

1. Navigate to the Admin tab
2. Click "Upload image or take photo"
3. Select an image of a menu or wine list
4. Click "Process Image"
5. Review the extracted information
6. Click "Apply Changes" to update the dashboard

### Supported Formats

The OCR can extract:
- Wine names, regions, years, and prices
- Food items (starters, entrees)
- Cocktail information
- Special offers and promotions

### OCR Processing

The OCR service:
- Uses Tesseract.js for text recognition
- Parses structured menu data
- Identifies wine categories and pricing
- Extracts food items and descriptions
- Provides real-time feedback during processing

## Security Features

- Content Security Policy headers
- XSS protection
- Secure authentication flow
- Input validation and sanitization
- HTTPS enforcement

## Performance Optimizations

- Modular JavaScript bundling
- CSS optimization with PostCSS
- Image optimization for OCR uploads
- Lazy loading of modules
- Efficient state management

## Troubleshooting

### Build Issues
- Ensure Node.js 18+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### OCR Issues
- Ensure image is clear and well-lit
- Check image format (JPEG, PNG supported)
- Verify image size (max 10MB recommended)
- Try different image angles if text isn't recognized

### Deployment Issues
- Check GitHub Actions logs for build errors
- Verify Netlify environment variables
- Ensure all required files are committed
- Check Netlify build logs for deployment issues

## Customization

### Adding New Features
1. Create new module in `src/js/modules/`
2. Add service if needed in `src/js/services/`
3. Update `app.js` to include new module
4. Add corresponding HTML structure
5. Update tests and documentation

### Styling Changes
1. Modify `src/css/main.css`
2. Run `npm run build:css` to compile
3. Test changes in development

### Configuration Changes
1. Update `netlify.toml` for deployment settings
2. Modify `webpack.config.js` for build settings
3. Update `package.json` for dependencies

## Support

For issues or questions:
- Check the GitHub repository issues
- Review the test suite for examples
- Consult the modular architecture documentation
- Contact the development team

## License

This software is proprietary and confidential. Unauthorized use, copying, or distribution is strictly prohibited. 