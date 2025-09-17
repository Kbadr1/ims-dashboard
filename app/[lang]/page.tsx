import { getDictionary } from "../../dictionaries";
import { Locale } from "../../i18n-config";
import { Home } from "./components/home/Home";

interface PageProps {
  params: {
    lang: Locale;
  };
}

export default async function HomePage({ params: { lang } }: PageProps) {
  const dict = await getDictionary(lang as Locale);

  return <Home dict={dict} params={{ lang }} />;
}
