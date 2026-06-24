import { GitCommitHorizontal } from 'lucide-react';
import { changelogReleases, siteVersion } from '../data/changelog';

export function ChangelogPage() {
  document.title = `MOSS · Changelog ${siteVersion}`;

  return (
    <div className="page-stack changelog-page">
      <div className="changelog-timeline">
        {changelogReleases.map((release) => {
          const releaseTitleId = `release-${release.version.replaceAll('.', '-')}`;

          return (
            <article className="changelog-entry" key={release.version}>
              <div className="changelog-rail" aria-hidden="true">
                <span className="changelog-node">
                  <GitCommitHorizontal size={18} strokeWidth={1.9} />
                </span>
              </div>

              <section className="panel changelog-release" aria-labelledby={releaseTitleId}>
                <header className="changelog-release-head">
                  <div>
                    <span className="changelog-date">{release.date}</span>
                    <h3 id={releaseTitleId}>{release.title}</h3>
                    <p>{release.description}</p>
                  </div>
                  <code className="changelog-tag">v{release.version}</code>
                </header>

                <div className="changelog-release-body">
                  {release.sections.map((section) => (
                    <section className="changelog-section" key={section.title}>
                      <h4>{section.title}</h4>
                      {section.groups.map((group) => (
                        <div className="changelog-group" key={group.hash}>
                          <div className="changelog-group-head">
                            <div>
                              <strong>{group.title}</strong>
                              <div className="change-row-head">
                                <span className={`change-type change-type-${group.type}`}>{group.type}</span>
                                <span className="change-scope">{group.scope}</span>
                                <code>{group.hash}</code>
                              </div>
                            </div>
                          </div>
                          <ul>
                            {group.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </section>
                  ))}
                </div>
              </section>
            </article>
          );
        })}
      </div>
    </div>
  );
}
