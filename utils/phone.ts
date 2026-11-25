import {
  AsYouType,
  formatIncompletePhoneNumber,
  getCountryCallingCode,
  parseIncompletePhoneNumber,
  type E164Number
} from "libphonenumber-js/min";

export type PhoneCountry = "AU" | "NZ";
type PhoneInput = { country: PhoneCountry; text: string; number?: E164Number };

export const readMobilePhone = (text: string, country: PhoneCountry, detectCountry = true): PhoneInput => {
  const dialString = text.normalize("NFKC").replace(/[\s().-]/g, "");
  const digits = parseIncompletePhoneNumber(dialString);
  if (digits.length !== dialString.length) return { country, text };

  const formatter = new AsYouType(country);
  let formatted = formatter.input(digits);
  const phone = formatter.getNumber();

  if (!formatter.isInternational() && /^[1-9]/.test(digits)) {
    const prefix = `+${getCountryCallingCode(country)}`;
    formatted = formatIncompletePhoneNumber(prefix + digits)
      .slice(prefix.length)
      .trimStart();
  }

  if (
    !phone?.isValid() ||
    (phone.country !== "AU" && phone.country !== "NZ") ||
    (!detectCountry && phone.country !== country)
  ) {
    return { country, text: formatted };
  }

  return {
    country: phone.country,
    text: formatter.isInternational() ? phone.formatNational() : formatted,
    number: phone.number
  };
};
