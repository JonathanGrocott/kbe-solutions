# KBE Solutions Website

A modern, static website for KBE Solutions - transforming engineering knowledge into decision-making graphs for AI agents.

## Features

- 🎨 Modern, responsive design
- ✨ Animated context graph visualization
- 📱 Mobile-friendly
- 📧 Contact form with email integration
- ⚡ Fast, static site (no backend required)

## Quick Start

1. **Update Email Configuration**
   
   Open `script.js` and replace `your-email@example.com` with your actual email address:
   ```javascript
   const YOUR_EMAIL = 'your-email@example.com'; // UPDATE THIS!
   ```

2. **Preview Locally**
   
   Simply open `index.html` in your web browser, or use a local server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   ```
   
   Then visit `http://localhost:8000`

## Email Service Setup

The contact form uses **FormSubmit.co** (free, no signup required):

### Option 1: FormSubmit.co (Default - Simplest)

1. Update the email in `script.js` (line 22)
2. Submit a test form on your live site
3. Check your email and click the confirmation link
4. Done! Future submissions will arrive automatically

**Optional FormSubmit Features:**
- Add `?_captcha=false` to disable captcha
- Add `?_template=table` for formatted emails
- Add `?_subject=New Contact from KBE Solutions` for custom subject

Example in script.js:
```javascript
const response = await fetch(`https://formsubmit.co/${YOUR_EMAIL}?_captcha=false&_subject=New KBE Solutions Contact`, {
```

### Option 2: Web3Forms (Alternative)

1. Get free API key at [web3forms.com](https://web3forms.com/)
2. In `script.js`, comment out FormSubmit code and uncomment Web3Forms section
3. Add your access key

### Option 3: Formspree (Alternative)

1. Sign up at [formspree.io](https://formspree.io/)
2. Create a form and get your form ID
3. In `script.js`, comment out FormSubmit code and uncomment Formspree section
4. Add your form ID

## Deployment Options

### GitHub Pages (Free, Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial website"
   git push origin main
   ```

2. Go to your repository settings
3. Navigate to "Pages" section
4. Select "main" branch as source
5. Your site will be live at `https://yourusername.github.io/kbe-solutions/`

### Custom Domain (kbe-solutions.com)

1. In your GitHub repo settings, under Pages, add your custom domain: `kbe-solutions.com`
2. In your domain registrar (GoDaddy, Namecheap, etc.), add these DNS records:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   
   Type: A
   Name: @
   Value: 185.199.109.153
   
   Type: A
   Name: @
   Value: 185.199.110.153
   
   Type: A
   Name: @
   Value: 185.199.111.153
   
   Type: CNAME
   Name: www
   Value: yourusername.github.io
   ```
3. Wait for DNS propagation (can take up to 24 hours)
4. Enable HTTPS in GitHub Pages settings

### Netlify (Free, Very Easy)

1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Your site is live! Netlify provides a free subdomain
4. For custom domain: Add `kbe-solutions.com` in domain settings

### Vercel (Free)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Your site is live!

## Customization

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary: #6366f1;      /* Main brand color */
    --secondary: #8b5cf6;    /* Secondary color */
    --accent: #ec4899;       /* Accent color */
    /* ... */
}
```

### Updating Content

- **Hero Section**: Edit the text in `index.html` around line 25-35
- **Features**: Modify the feature cards starting at line 70
- **About Section**: Update the value proposition at line 95

### Adding Analytics (Optional)

Add Google Analytics by inserting this before `</head>` in `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## File Structure

```
kbe-solutions/
├── index.html          # Main HTML file
├── styles.css          # All styles and animations
├── script.js          # Form handling and interactions
└── README.md          # This file
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Troubleshooting

**Form not sending emails?**
- Ensure you've updated the email address in `script.js`
- Check browser console for errors
- Verify the site is deployed (FormSubmit requires a live URL for first-time setup)

**Animations not working?**
- Check if JavaScript is enabled
- Try clearing browser cache

**Custom domain not working?**
- Verify DNS records are correct
- Wait for DNS propagation (up to 24 hours)
- Check GitHub Pages settings

## Support

For issues or questions about the website, contact: your-email@example.com

## License

© 2025 KBE Solutions. All rights reserved.
