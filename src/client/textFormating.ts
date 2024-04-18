"use client";

export function findDate(text: string | null): string[] | null {
  if (text === null) {
    return null;
  }
  const regex = /\b\d{2}\.\d{2}\.\d{4}\b/g;

  const match = text.match(regex);
  return match?.length === 0 ? null : match;
}

export function findDataInRawText(
  text: string | null,
  label: string
): string | null {
  if (text === null) {
    return null;
  }
  const lines = text.split("\n");
  let surnameLine = "";
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(label)) {
      surnameLine = lines[i + 1].trim();
      break;
    }
  }
  return surnameLine === "" ? null : surnameLine;
}

export function stringNormalization(text: string | null): string | null {
  if (text === null) {
    return null;
  }

  const regex = /(?:^|\s)[A-ZĄĆĘŁŃÓŚŹŻ-]{3,}(?=\s|$|[.,;])/gu;
  let longest = "";
  let match;

  while ((match = regex.exec(text))) {
    if (match[0].length > longest.length) {
      longest = match[0];
    }
  }

  return longest === "" ? null : longest;
}

export function stringNormalizationParentsNames(
  text: string | null
): string | null {
  if (text === null) {
    return null;
  }

  let parentNames = "";
  const regex = /\b\w{3,}\b/g;
  let matches = [];
  let match;

  while ((match = regex.exec(text))) {
    matches.push(match[0]);
  }

  parentNames += matches[0];
  parentNames += " ";
  parentNames += matches[1];
  return parentNames === "" ? null : parentNames;
}

export function getPersonalNumber(text: string | null): string | null {
  if (text === null) {
    return null;
  }

  const regex = /\b\d{11}\b/g;
  const match = regex.exec(text);
  return match ? match[0] : null;
}

export function getIdentityCardNumber(text: string | null): string | null {
  if (text === null) {
    return null;
  }

  const lines = text.trim().split("\n");
  const regex = /I<([A-Z0-9]+)/;
  const match = regex.exec(lines[lines.length - 3]);

  if (match) {
    const replaced = match[1].replace("POL", "").slice(0, -1);
    return replaced;
  } else {
    return null;
  }
}

function parseDateFromDigits(digits: string): string {
  const yearDigits = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const day = digits.slice(4, 6);
  let yearPrefix = "19";

  if (parseInt(yearDigits, 10) < 50) {
    yearPrefix = "20";
  }

  const year = yearPrefix + yearDigits;

  return `${day}.${month}.${year}`;
}

export function getBirthsdayNumnerAndPersonalNumber(
  text: string | null
): [string, string] | null {
  if (text === null) {
    return null;
  }
  const lines = text.trim().split("\n");
  const line = lines[lines.length - 2];
  if (line) {
    const dateOfBirth = line.slice(0, 6);
    const personalNumber = line.slice(-12).slice(0, -1);
    return [parseDateFromDigits(dateOfBirth), personalNumber];
  } else {
    return null;
  }
}

export function getNameAndSurname(text: string | null): string[] | null {
  if (text === null) {
    return null;
  }
  const lines = text.trim().split("\n");

  const line = lines[lines.length - 1];
  if (line) {
    const cleanedLine = line.replace(/<+/g, " ");
    const trimmedLine = cleanedLine.trim();
    const splitedLine = trimmedLine.split(" ");
    return splitedLine;
  } else {
    return null;
  }
}

export function dateFormat(text: string | null): Number | null {
  if (text === null) {
    return null;
  }
  const splited = text.split(".");
  const day = parseInt(splited[0], 10);
  const month = parseInt(splited[1], 10) - 1;
  const year = parseInt(splited[2], 10);

  return parseInt((new Date(year, month, day).getTime() / 1000).toFixed(0));
}
