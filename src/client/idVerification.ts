import { FrontID } from "./frontID";
import { BackID } from "./backID";

function calculateAge(dateOfBirth: number): boolean {
  const currentDate = new Date();
  const birthDate = new Date(dateOfBirth * 1000);
  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDiffrence = currentDate.getMonth() - birthDate.getMonth();
  const dayDiffrence = currentDate.getDate() - birthDate.getDate();
  if (monthDiffrence < 0 || (monthDiffrence === 0 && dayDiffrence < 0)) {
    age -= 1;
  }
  return age >= 18;
}
function tenYearsDifference(dateOfIssue: number, expiryDate: number): boolean {
  const _dateOfIssue = new Date(dateOfIssue * 1000);
  const _expiryDate = new Date(expiryDate * 1000);
  if (
    _dateOfIssue.getDay() === _expiryDate.getDay() &&
    _dateOfIssue.getMonth() === _expiryDate.getMonth() &&
    _expiryDate.getFullYear() - _dateOfIssue.getFullYear() === 10
  ) {
    return true;
  }
  return false;
}
function isExpired(expiryDate: number): boolean {
  const currentDate = new Date();
  const _expiryDate = new Date(expiryDate * 1000);
  return _expiryDate > currentDate;
}
export function verifyFrontIdAndBackId(
  frontId: FrontID,
  backId: BackID
): boolean {
  if (frontId.getGivenNames() !== backId.getGivenNames()) {
    return false;
  }
  if (frontId.getSurname() !== backId.getSurname()) {
    return false;
  }
  if (frontId.getDateOfBirth() !== backId.getDateOfBirth()) {
    return false;
  }
  if (
    !calculateAge(frontId.getDateOfBirth() as number) ||
    !calculateAge(backId.getDateOfBirth() as number)
  ) {
    return false;
  }
  if (isExpired(backId.getExpiryDate() as number)) {
    return false;
  }
  if (
    !tenYearsDifference(
      backId.getDateOfIssue() as number,
      backId.getExpiryDate() as number
    )
  ) {
    return false;
  }
  return true;
}
