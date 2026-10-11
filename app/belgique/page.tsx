import { CountryPage, countryMetadata } from '@/components/country-page';
export const metadata = countryMetadata('BE');
export default function Page() { return <CountryPage code="BE" />; }
