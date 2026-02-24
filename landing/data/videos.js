/**
 * SecretlustAI – Video data store
 * 
 * In production, this is replaced by a Supabase query.
 * For now, edit this file directly or use the Admin panel (admin.html)
 * which reads/writes to localStorage and lets you export this file.
 *
 * R2 hosting: replace `src` and `thumb` with your Cloudflare R2 public URLs
 * e.g. "https://pub-xxxxxxx.r2.dev/videos/1.mp4"
 *
 * Local testing: use relative paths like "vids/1.mp4"
 */

var SECRETLUST_VIDEOS = [
  {
    id: 1,
    title: "Template 1",
    src: "vids/1.mp4",
    thumb: "vids/thumbs/1.jpg",
    used: "9.1K",
    featured: true,
    featuredLabel: "HOT"
  },
  { id: 2,  title: "Template 2",  src: "vids/2.mp4",  thumb: "vids/thumbs/2.jpg",  used: "6.3K" },
  { id: 3,  title: "Template 3",  src: "vids/3.mp4",  thumb: "vids/thumbs/3.jpg",  used: "6.7K" },
  { id: 4,  title: "Template 4",  src: "vids/4.mp4",  thumb: "vids/thumbs/4.jpg",  used: "4.7K" },
  { id: 5,  title: "Template 5",  src: "vids/5.mp4",  thumb: "vids/thumbs/5.jpg",  used: "6.4K" },
  { id: 6,  title: "Template 6",  src: "vids/6.mp4",  thumb: "vids/thumbs/6.jpg",  used: "4.4K" },
  { id: 7,  title: "Template 7",  src: "vids/7.mp4",  thumb: "vids/thumbs/7.jpg",  used: "5.3K" },
  { id: 8,  title: "Template 8",  src: "vids/8.mp4",  thumb: "vids/thumbs/8.jpg",  used: "4.5K" },
  { id: 9,  title: "Template 9",  src: "vids/9.mp4",  thumb: "vids/thumbs/9.jpg",  used: "3.5K" },
  { id: 10, title: "Template 10", src: "vids/10.mp4", thumb: "vids/thumbs/10.jpg", used: "3.1K" },
  { id: 11, title: "Template 11", src: "vids/11.mp4", thumb: "vids/thumbs/11.jpg", used: "6.2K" },
  { id: 12, title: "Template 12", src: "vids/12.mp4", thumb: "vids/thumbs/12.jpg", used: "7.8K" },
  { id: 13, title: "Template 13", src: "vids/13.mp4", thumb: "vids/thumbs/13.jpg", used: "2.9K" },
  { id: 14, title: "Template 14", src: "vids/14.mp4", thumb: "vids/thumbs/14.jpg", used: "5.1K" },
  { id: 15, title: "Template 15", src: "vids/15.mp4", thumb: "vids/thumbs/15.jpg", used: "4.0K" },
  { id: 16, title: "Template 16", src: "vids/16.mp4", thumb: "vids/thumbs/16.jpg", used: "3.3K" },
  { id: 17, title: "Template 17", src: "vids/17.mp4", thumb: "vids/thumbs/17.jpg", used: "8.2K" },
  { id: 18, title: "Template 18", src: "vids/18.mp4", thumb: "vids/thumbs/18.jpg", used: "1.7K" },
  { id: 19, title: "Template 19", src: "vids/19.mp4", thumb: "vids/thumbs/19.jpg", used: "6.0K" },
  { id: 20, title: "Template 20", src: "vids/20.mp4", thumb: "vids/thumbs/20.jpg", used: "2.4K" }
];

// How many cards to render in the initial HTML batch (rest load on scroll)
var INITIAL_BATCH = 10;
// How many to load per scroll batch
var SCROLL_BATCH = 10;
