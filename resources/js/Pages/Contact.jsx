import { Head } from '@inertiajs/react';

import ContactFormCard from '../components/ContactFormCard.jsx';
import AppLayout from './components/AppLayout.jsx';

export default function Contact({ categories = [], defaults = {} }) {
    return (
        <>
            <Head title="Contact Us - Outlier Vault" />

            <AppLayout width="max-w-5xl">
                <ContactFormCard categories={categories} defaults={defaults} />
            </AppLayout>
        </>
    );
}
