import { CountryPage, countryMetadata } from '@/components/country-page';
export const metadata = countryMetadata('QC');
export default function Page() { return <CountryPage code="QC" />; }
