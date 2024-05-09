import { FrontID } from "./frontID";
import { BackID } from "./backID";

export interface PersonalData {
  surname: string | null;
  givenNames: string | null;
  familyName: string | null;
  parentsName: string | null;
  dateOfBirth: Number | null;
  dateOfIssue: Number | null;
  expiryDate: Number | null;
  personalNumber: string | null;
  identityCardNumber: string | null;
}

export function mergeIdInformation(
  frontID: FrontID,
  backID: BackID
): PersonalData {
  return {
    surname: frontID.getSurname() ?? backID.getSurname(),
    givenNames: frontID.getGivenNames() ?? backID.getGivenNames(),
    familyName: frontID.getFamilyName(),
    parentsName: frontID.getParentsName(),
    dateOfBirth: frontID.getDateOfBirth(),
    dateOfIssue: backID.getDateOfIssue(),
    expiryDate: backID.getExpiryDate(),
    personalNumber: backID.getPersonalNumber(),
    identityCardNumber: backID.getIdentityCardNumber(),
  };
}
