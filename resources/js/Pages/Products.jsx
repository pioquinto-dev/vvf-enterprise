import { Head } from '@inertiajs/react';

import SearchListScreen from './components/SearchListScreen.jsx';

export default function Products({ searches = [], moving = [] }) {
  return (
    <>
      <Head title="Product searches · Brand Beacon" />
      <SearchListScreen kind="product" searches={searches} moving={moving} />
    </>
  );
}
