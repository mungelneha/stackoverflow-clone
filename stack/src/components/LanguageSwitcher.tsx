import React from "react";
import { useRouter } from "next/router";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "hi", name: "Hindi" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese" },
  { code: "fr", name: "French" },
];

const LanguageSwitcher = () => {
  const router = useRouter();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLanguage = event.target.value;

    router.push(router.asPath, router.asPath, {
      locale: selectedLanguage,
    });
  };

  return (
    <select
      value={router.locale || "en"}
      onChange={handleLanguageChange}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
    >
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSwitcher;