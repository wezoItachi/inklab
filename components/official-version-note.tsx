import { ExternalLink } from 'lucide-react';

export function OfficialVersionNote({
  gameVersion,
  statusLabel,
  summary,
  modelNote,
}: {
  gameVersion: string;
  statusLabel: string;
  summary: string;
  modelNote: string;
}) {
  return (
    <aside className="special-version-note">
      <div>
        <small>OFFICIAL PATCH / VER. {gameVersion}</small>
        <strong>{statusLabel}</strong>
      </div>
      <p>{summary}</p>
      <span>{modelNote}</span>
      <a
        href="https://support.nintendo.com/jp/switch/software_support/av5ja/1200.html"
        target="_blank"
        rel="noreferrer"
      >
        查看官方更新说明 <ExternalLink size={12} />
      </a>
    </aside>
  );
}
