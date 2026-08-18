import { useState } from 'react';
import { Play, Store, Arrow } from '../../components/Icons.jsx';

/**
 * Step three for every search type — optional. Connect the subject's TikTok
 * handle and/or website so results match more tightly.
 *
 * Both are skippable: "Skip" and "Run the search" both start the scrape; the
 * handle/website ride along in the payload for the backend to use.
 */
export default function SourcesScreen({ noun = 'brand', onBack, onSkip, onRun, submitting = false }) {
  const [handle, setHandle] = useState('');
  const [website, setWebsite] = useState('');

  const sources = () => ({
    tiktokHandle: handle.trim().replace(/^@/, ''),
    website: website.trim(),
  });

  return (
    <div className="sect">
      <div className="sect__h">
        <div>
          <p className="sect__n">Optional</p>
          <h2>Add the {noun}&rsquo;s handle or website</h2>
          <p className="faint" style={{ fontSize: '.88rem', marginTop: 8, maxWidth: '60ch' }}>
            Helps us match videos more accurately and unlock better insights.
          </p>
        </div>
      </div>

      <div className="srcs">
        <div className={`src${handle.trim() ? ' is-on' : ''}`}>
          <div className="src__h">
            <span className="src__i">
              <Play className="h-[15px] w-[15px]" />
            </span>
            <div style={{ minWidth: 0 }}>
              <p className="src__t">TikTok handle</p>
            </div>
          </div>
          <div className="src__f">
            <span className="src__pre">@</span>
            <input
              value={handle.replace(/^@/, '')}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="rhode"
              aria-label="TikTok handle"
            />
          </div>
          <p className="src__m faint">Optional, but it sharpens every number on the report.</p>
        </div>

        <div className={`src${website.trim() ? ' is-on' : ''}`}>
          <div className="src__h">
            <span className="src__i">
              <Store className="h-[15px] w-[15px]" />
            </span>
            <div style={{ minWidth: 0 }}>
              <p className="src__t">Website</p>
            </div>
          </div>
          <div className="src__f">
            <span className="src__pre">https://</span>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="rhodeskin.com"
              aria-label="Website"
            />
          </div>
          <p className="src__m faint">Optional</p>
        </div>
      </div>

      <div className="actrow" style={{ marginTop: 24 }}>
        <button type="button" className="btn btn--g" onClick={onBack} disabled={submitting}>
          Back
        </button>
        <span className="actrow__r">
          <button type="button" className="btn btn--g" onClick={onSkip} disabled={submitting}>
            Skip
          </button>
          <button type="button" className="btn btn--y" onClick={() => onRun(sources())} disabled={submitting}>
            {submitting ? 'Starting…' : 'Run the search'} <Arrow />
          </button>
        </span>
      </div>
    </div>
  );
}
