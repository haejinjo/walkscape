export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-4 pb-8 pt-4 text-sm text-slate-400 md:px-6">
      <div className="glass rounded-[24px] px-5 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p>Built on the EPA National Walkability Index.</p>
          <a
            href="https://www.buymeacoffee.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm text-slate-200"
          >
            Support on Buy Me a Coffee
          </a>
        </div>
      </div>
    </footer>
  );
}
