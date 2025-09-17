# Sitecore Controlled Microsite

This portfolio site now includes a Sitecore controlled microsite implementation based on the KinderCare Marketing Site guidelines.

## Overview

The microsite is built using Sitecore JSS (Headless React) with Next.js, TypeScript, and Tailwind CSS. It demonstrates a headless architecture where content is managed by Sitecore, and the frontend is a React app.

## Components

- **Hero**: Displays title, body, image, and CTA.
- **ProgramsGrid**: Shows a grid of programs with name, age range, and summary.
- **CenterFinder**: Interactive component to search for centers by ZIP code, using SWR for data fetching.
- **AnnouncementBar**: Displays announcements with severity levels.
- **LeadForm**: Contact form with validation.
- **CalendarList**: Lists events and dates.
- **ConsentBanner**: Cookie consent banner with analytics integration.
- **PageShell**: Layout with header, navigation, and footer.

## Features

- **Headless Architecture**: Content managed in Sitecore, frontend in React.
- **SSR/SSG**: Supports static generation for performance.
- **Interactive Components**: CenterFinder with lazy loading and API integration, LeadForm with submission.
- **Accessibility**: ARIA labels, keyboard navigation, skip links in PageShell.
- **SEO**: Structured data (JSON-LD) for Organization and ChildCare schemas.
- **Analytics & Consent**: Event bus for tracking, consent banner for GDPR compliance.
- **Navigation**: Basic header nav and footer in PageShell.
- **Center Details**: Dynamic pages for individual centers with structured data.

## Setup

### 1. Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

This will install Sitecore JSS, SWR for data fetching, Zod for validation, and other dependencies.

### 2. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# For local development (sample data)
SITECORE_API_KEY=sample-api-key
SITECORE_API_HOST=http://localhost:3000

# For production Sitecore instance
# SITECORE_API_KEY=your-actual-api-key-here
# SITECORE_API_HOST=https://your-sitecore-instance.com
```

### 3. Sitecore Instance Setup (Optional for Production)

If you have a Sitecore instance, follow these steps:

#### a. Install Sitecore JSS

Ensure your Sitecore instance has JSS installed. Follow the [official JSS installation guide](https://doc.sitecore.com/xp/en/developers/hd/21/sitecore-headless-development/install-the-sitecore-headless-services-module.html).

#### b. Create JSS App

In Sitecore, create a new JSS application:

1. Open Sitecore Content Editor
2. Navigate to `/sitecore/content`
3. Right-click and select `Insert > JSS Tenant`
4. Name it (e.g., "jonathonthompson-microsite")
5. Create a JSS App under the tenant

#### c. Configure API Key

1. In Sitecore, go to `/sitecore/system/Settings/Services/API Keys`
2. Create a new API Key item
3. Set the CORS origins to allow your domain
4. Copy the API Key value to your `.env.local`

#### d. Create Content Templates

Create the following templates in Sitecore for each component:

- **Page Template**: Base template with title, metaDescription, canonicalUrl, ogImage, sections (multilist of components)

- **Hero Template**: title (Single-Line Text), body (Rich Text), image (Image), ctaText (Single-Line Text), ctaUrl (General Link)

- **ProgramsGrid Template**: title (Single-Line Text), programs (Treelist of Program items)

- **Program Template**: name (Single-Line Text), ageRange (Single-Line Text), summary (Rich Text)

- **CenterFinder Template**: defaultZip (Single-Line Text)

- **AnnouncementBar Template**: title (Single-Line Text), body (Rich Text), severity (Droplist: info, warning, error)

- **LeadForm Template**: title (Single-Line Text), submitText (Single-Line Text)

- **CalendarList Template**: title (Single-Line Text), events (Treelist of Event items)

- **Event Template**: title (Single-Line Text), date (Date), summary (Rich Text)

- **ConsentBanner Template**: (No fields needed, or add custom text fields)

#### e. Create Rendering Items

For each component, create a rendering item in `/sitecore/layout/Renderings`:

1. Create a folder for your app (e.g., "jonathonthompson-microsite")
2. For each component, create a View Rendering item
3. Set the Component Name field to match the component factory (e.g., "Hero", "ProgramsGrid")

#### f. Create Placeholder Settings

Create placeholder settings in `/sitecore/layout/Placeholder Settings` to define where components can be placed.

### 4. Local Development Setup

For development without a full Sitecore instance:

1. The app uses sample data in `app/api/centers/route.ts`
2. Disconnected Sitecore data lives in `sitecore/data/routes/microsite/en.yml` and related content folders for Programs and Events
3. Components render with sample data defined in `app/microsite/page.tsx`
4. Analytics events are logged to console (no external tracking)

### 5. Build and Test

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

## Running the Microsite

### Local Development

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000/microsite`

3. Test interactive features:
   - CenterFinder: Enter a ZIP code starting with "981" to see sample results
   - LeadForm: Fill and submit the form (shows alert)
   - ConsentBanner: Accept/decline cookies

### Production Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Deploy to your hosting platform (Vercel, Netlify, etc.)

3. Ensure environment variables are set in your deployment environment

4. Update the Sitecore API host to point to your production Sitecore instance

## Viewing from Portfolio Site

The microsite is integrated as a sub-route. To link from your main portfolio:

1. Add a navigation link in your header/footer
2. Create a project card that links to `/microsite`
3. Update your main page content to reference the microsite

Example navigation addition:

```tsx
// In your header component
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/microsite">KinderCare Microsite</a>
</nav>
```

## Connecting to Sitecore

### Complete Integration Steps

1. **Deploy JSS App**:

   ```bash
   # If using JSS CLI
   jss deploy app --includeContent --includeDictionary
   ```

2. **Create Content Items**:

   - Create page items under your JSS app's home item
   - Add components to the page's sections field
   - Populate component fields with content

3. **Configure Layout**:

   - Set the layout for your pages to use the JSS layout
   - Ensure placeholders are defined in the layout

4. **Test Content Delivery**:

   - Visit your Sitecore instance's Layout Service endpoint
   - Verify JSON structure matches component expectations

5. **Update Environment**:
   - Change `.env.local` to use production Sitecore URLs
   - Restart the application

### Component Mapping

Each Sitecore rendering should map to the corresponding React component:

| Sitecore Rendering | React Component | Required Fields                     |
| ------------------ | --------------- | ----------------------------------- |
| Hero               | Hero            | title, body, image, ctaText, ctaUrl |
| ProgramsGrid       | ProgramsGrid    | title, programs[]                   |
| CenterFinder       | CenterFinder    | defaultZip                          |
| AnnouncementBar    | AnnouncementBar | title, body, severity               |
| LeadForm           | LeadForm        | title, submitText                   |
| CalendarList       | CalendarList    | title, events[]                     |
| ConsentBanner      | ConsentBanner   | (none)                              |

## Troubleshooting

### Common Issues

1. **Component not rendering**:

   - Check component factory registration
   - Verify Sitecore rendering name matches factory key
   - Ensure required fields are populated

2. **API calls failing**:

   - Check CORS settings in Sitecore API key
   - Verify API host URL in environment variables
   - Check network tab for 401/403 errors

3. **Build errors**:

   - Ensure all dependencies are installed
   - Check TypeScript errors in components
   - Verify Next.js version compatibility

4. **Analytics not working**:
   - Check browser console for errors
   - Ensure consent is granted
   - Verify event names match expectations

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=sitecore-jss:*
```

## Development

### File Structure

- `components/organisms/`: React components for Sitecore renderings
- `components/layouts/`: Page layout components
- `src/lib/sitecore/`: Sitecore integration utilities
- `src/lib/analytics/`: Analytics and consent management
- `app/api/`: API routes for sample data
- `app/microsite/`: Main microsite page
- `app/centers/[id]/`: Dynamic center detail pages

### Adding New Components

1. Create component in `components/organisms/`
2. Add to component factory in `src/lib/sitecore/componentFactory.ts`
3. Create Sitecore template and rendering
4. Update README documentation

### Testing

- Components include sample data for development
- API routes provide sample responses
- Build process validates TypeScript and accessibility

For full production setup, refer to the [Sitecore JSS documentation](https://doc.sitecore.com/xp/en/developers/hd/21/sitecore-headless-development/walkthrough--setting-up-a-development-environment.html).
