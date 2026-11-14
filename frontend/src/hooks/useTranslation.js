import { useLanguage } from '../context/LanguageContext';

export const useTranslation = () => {
  const { t, language, setLanguage, isBangla } = useLanguage();
  return { t, language, setLanguage, isBangla };
};

export default useTranslation;

