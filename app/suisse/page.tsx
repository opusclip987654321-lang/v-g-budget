import { CountryPage, countryMetadata } from '@/components/country-page';
export const metadata = countryMetadata('CH');
export default function Page() { return <CountryPage code="CH" />; }
