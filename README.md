# Five Star Exotic Cars

A modern, fully responsive website for the **Five Star Exotic Cars** club — a luxury & exotic car community that runs rallies, events, and sells branded merch.

Built from scratch with vanilla **HTML, CSS, and JavaScript** (no frameworks, no build step). Black & gold premium theme with smooth, performant animations.

## ✨ Features

- **Hero** with a fixed, seamlessly looping background video (crossfade), mouse parallax and a cursor-follow light.
- **Event section** with a clickable flyer (full-screen modal).
- **Waiver & Rules** page — full waiver + 5SEC rules with drawable signature pads and a sign-off form.
- **Join** page — membership application form over the original club photo.
- **Shop** (`products.html`) — e-commerce style product grid.
- **Product pages** — Five Star Hats (in stock, variant selector, add to cart / buy it now) and Five Star T-Shirt (sold out), with store pickup info.
- **Event Calendar** — interactive month calendar; click a highlighted date to see event times.
- Sticky navbar with an animated gold underline and a hover dropdown for products.
- Fully responsive (desktop / tablet / mobile) and respects `prefers-reduced-motion`.

## 📁 Structure

```
.
├── index.html              # Home (hero, event, contact)
├── waiver-and-rules.html   # Waiver + rules + signature form
├── join.html               # Membership application
├── products.html           # Shop / collection grid
├── five-star-hats.html     # Product page (in stock)
├── five-star-tshirt.html   # Product page (sold out)
├── event-calendar.html     # Interactive event calendar
├── css/style.css           # All styles
├── js/main.js              # All interactions
├── server.js               # Tiny zero-dependency static server (with video range support)
└── assets (video1.mp4, banner.jpg, logo.svg, product images, …)
```

## 🚀 Run locally

Requires [Node.js](https://nodejs.org) (only for the dev server).

```bash
node server.js
```

Then open **http://localhost:8080**

On Windows you can also double-click `start-sunucu.bat`, or simply open `index.html` directly in a browser.

## 📬 Contact

info@fivestarexoticcars.org · [Instagram](https://www.instagram.com/five_star_exotic_cars/) · [Facebook](https://www.facebook.com/groups/739974193975762)

---

> Note: forms are front-end only (no backend) — submissions show a confirmation but are not sent. Wire to a service like Formspree to make them live.
