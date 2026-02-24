export default function Footer() {
  const links = [
    "Legal",
    "Terms",
    "Privacy",
    "DMCA",
    "2257 Statement",
    "About",
    "Adult Content Disclaimer",
  ];

  return (
    <footer className="py-3 px-4 border-t border-white/[0.06] bg-[#13111a]">
      <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-center gap-1 text-xs text-white/50">
        {links.map((label, i) => (
          <span key={label}>
            {i > 0 && <span className="opacity-40 mx-0.5">·</span>}
            <a href="#" className="hover:text-white transition-colors">
              {label}
            </a>
          </span>
        ))}
      </div>
    </footer>
  );
}
