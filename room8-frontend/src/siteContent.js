// src/siteContent.js
// Real-world content for the public site. Anything empty here renders nothing,
// so the site never shows placeholder or made-up content. Fill these in and redeploy.

export const SITE_URL = "https://swiperoom8.com";

// Footer operator line. Put the registered business name here once it exists
// (for example "Room8 LLC"). Until then the founders are named as the operators.
export const LEGAL_ENTITY = "";

// Founder block (audit D3.3). photo: path in /public, e.g. "/founders/alexia.jpg".
// story: two lines, first person, in your own words. links: only real profiles.
export const FOUNDERS = [
  {
    name: "Alexia Fabian",
    role: "Co-founder",
    school: "The Evergreen State College",
    photo: "",
    story: "",
    links: [
      { label: "GitHub", href: "https://github.com/fabianalexia" },
      // { label: "LinkedIn", href: "" },
    ],
  },
  {
    name: "Lilla Tillo",
    role: "Co-founder",
    school: "Whitman College",
    photo: "",
    story: "",
    links: [],
  },
];

// Testimonial wall (audit D3.2). Only real beta testers who said yes to being shown.
// { quote, name, school, year, photo }  photo is optional, path in /public.
// The section stays hidden until at least 3 are added.
export const TESTIMONIALS = [];
export const TESTIMONIALS_MIN_TO_SHOW = 3;

// Signup counter (audit D3.1). Hidden until the real verified count reaches this.
export const COUNTER_MIN_TO_SHOW = 25;
