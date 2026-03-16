const TERMCRAFT_ART = `█████████╗███████╗██████╗ ███╗   ███╗ ██████╗██████╗  █████╗ ███████╗████████╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
   ██║   █████╗  ██████╔╝██╔████╔██║██║     ██████╔╝███████║█████╗     ██║
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║     ██╔══██╗██╔══██║██╔══╝     ██║
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║╚██████╗██║  ██║██║  ██║███████╗   ██║
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝`

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer-inner">
        <pre className="app-footer-art" aria-hidden>{TERMCRAFT_ART}</pre>
        <p className="app-footer-tagline">
          <a
            href="https://x.com/NousResearch/status/2032548770148196855"
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer-link"
          >
            Made during the hackathon
          </a>
          {' — '}
          <a href="https://nousresearch.com" target="_blank" rel="noopener noreferrer" className="app-footer-link">Nous Research</a>
          {', '}
          <a href="https://github.com/NousResearch/Hermes" target="_blank" rel="noopener noreferrer" className="app-footer-link">Hermes Agent</a>
        </p>
      </div>
    </footer>
  )
}
