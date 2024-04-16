"use client";

function findDate(text: string | null): string[] | null {
  if (text === null) {
    console.error("No text provided");
    return null;
  }
  const regex = /\b\d{2}\.\d{2}\.\d{4}\b/g;

  const dates = text.match(regex);
  return dates?.length === 0 ? null : dates;
}

function findDataInRawText(text: string | null, label: string): string | null {
  if (text === null) {
    console.error("No text provided");
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

function stringNormalization(text: string | null): string | null {
  if (text === null) {
    console.error("No text provided");
    return null;
  }

  const regex = /\b(?:[A-Z]{3,}-)*[A-Z]{3,}\b/g;
  let longest = "";
  let match;

  while ((match = regex.exec(text))) {
    if (match[0].length > longest.length) {
      longest = match[0];
    }
  }

  return longest === "" ? null : longest;
}

function stringNormalizationParentsNames(text: string | null): string | null {
  if (text === null) {
    console.error("No text provided");
    return null;
  }

  let parentNames = "";

  let matches = [];
  let match;
  const regex = /\b\w{3,}\b/g;

  while ((match = regex.exec(text))) {
    matches.push(match[0]);
  }
  parentNames += matches[0];
  parentNames += " ";
  parentNames += matches[1];

  console.log(matches);
  return parentNames === "" ? null : parentNames;
}
