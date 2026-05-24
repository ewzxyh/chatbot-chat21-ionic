import * as moment from 'moment';
import 'moment/locale/pt-br';

export const CHATCASE_TRANSLATION_LANG = 'pt';
export const CHATCASE_MOMENT_LOCALE = 'pt-br';
export const CHATCASE_BROWSER_LOCALE = 'pt-BR';
export const CHATCASE_TIMEZONE = 'America/Sao_Paulo';

export function applyChatcaseMomentLocale(): string {
  moment.locale(CHATCASE_MOMENT_LOCALE);
  return CHATCASE_MOMENT_LOCALE;
}

export function getChatcaseTranslationLang(): string {
  return CHATCASE_TRANSLATION_LANG;
}
