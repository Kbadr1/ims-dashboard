import { getDictionary } from "@/dictionaries";
import { Locale } from "../../../i18n-config";
import LoginForm from "./LoginForm";

interface LoginPageProps {
  params: {
    lang: Locale;
  };
}

export default async function LoginPage({ params: { lang } }: LoginPageProps) {
  const dict = await getDictionary(lang);

  return <LoginForm dict={dict} lang={lang} />;
}
