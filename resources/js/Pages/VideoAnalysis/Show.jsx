import { Head } from '@inertiajs/react';

import AppLayout from '../components/AppLayout.jsx';
import AnalysisModal from './AnalysisModal.jsx';

function closeModal() {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.assign('/library');
}

export default function Show({ video, analysis: initialAnalysis, tabs }) {
  return (
    <>
      <Head title={`Video Analysis · ${video.handle ?? video.creator_name ?? 'TikTok'}`} />

      <AppLayout width="max-w-[1400px]">
        <AnalysisModal
          video={video}
          initialAnalysis={initialAnalysis}
          tabs={tabs}
          onClose={closeModal}
        />
      </AppLayout>
    </>
  );
}
