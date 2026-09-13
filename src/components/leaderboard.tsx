import type { TeamRecord } from '@/lib/firebase';

type LeaderboardProps = {
  teams: TeamRecord[];
  resultsReady?: boolean;
};

function ranked(teams: TeamRecord[]) {
  return teams
    .filter((team) => team.status === 'submitted')
    .sort(
      (a, b) =>
        (b.integrity ?? 0) - (a.integrity ?? 0) ||
        (a.totalTimeSeconds ?? Infinity) - (b.totalTimeSeconds ?? Infinity),
    );
}

export function Leaderboard({ teams, resultsReady = false }: LeaderboardProps) {
  const ranking = ranked(teams);

  return (
    <div className="mt-5 space-y-1 font-mono text-[10px]">
      {ranking.map((team, index) => {
        const isKillLine = index === 25;
        const purged = resultsReady && index >= 25;

        return (
          <div key={team.teamCode}>
            {isKillLine && (
              <div className="my-2 border-y border-[#a34b48] py-2 text-center text-[#c66b65]">
                — KILL LINE —
              </div>
            )}
            <div
              className={`flex items-center justify-between gap-4 border-b border-[hsl(var(--border))] py-3 ${
                purged ? 'opacity-45 line-through' : ''
              }`}
            >
              <span className="min-w-0 truncate">
                <span className="mr-3 text-dim">{String(index + 1).padStart(2, '0')}</span>
                {team.name}
                {purged && <span className="ml-3 text-[#c66b65] no-underline">PURGED</span>}
              </span>
              <span className="shrink-0 text-secure">
                {team.integrity ?? 0}%{' '}
                <span className="text-dim">
                  {team.recovery ?? 0}/{(team.recovery ?? 0) + (team.corruption ?? 0)} • {team.totalTimeSeconds ?? 0}s
                </span>
              </span>
            </div>
          </div>
        );
      })}
      {ranking.length === 0 && <p className="text-dim">No submitted teams yet.</p>}
    </div>
  );
}
