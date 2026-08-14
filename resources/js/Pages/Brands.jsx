import { Head } from '@inertiajs/react';

import SearchListScreen from './components/SearchListScreen.jsx';

export default function Brands({ searches = [], moving = [] }) {
  return (
    <>
      <Head title="Brand searches · Brand Beacon" />
      <SearchListScreen kind="brand" searches={searches} moving={moving} />
    </>
  );
}
