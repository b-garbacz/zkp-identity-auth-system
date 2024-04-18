import * as textFormating from "./textFormating";

export class BackID {
  private dateOfIssue: Number | null;
  private expiryDate: Number | null;
  private personalNumber: string | null;
  private dateOfBirth: Number | null;
  private identityCardNumber: string | null;
  private surname: string | null;
  private givenNames: string | null;

  constructor(textORC?: string) {
    if (textORC === null || textORC === undefined) {
      throw new Error("No text provided. Cannot create BackID object.");
    }

    const extractedDates = textFormating.findDate(textORC);
    if (extractedDates === null) {
      throw new Error("No dates provided. Cannot create BackID object.");
    }
    this.dateOfIssue = textFormating.dateFormat(extractedDates[0]);
    this.expiryDate = textFormating.dateFormat(extractedDates[1]);

    if (this.dateOfIssue === null || this.expiryDate === null) {
      throw new Error("No dates provided. Cannot create BackID object.");
    }

    const birthdayDateAndPersonalNumber =
      textFormating.getBirthsdayNumnerAndPersonalNumber(textORC);
    if (
      !birthdayDateAndPersonalNumber ||
      birthdayDateAndPersonalNumber.length !== 2
    ) {
      throw new Error(
        "Problem with data parsing. Cannot create BackID object."
      );
    }
    this.dateOfBirth = textFormating.dateFormat(
      birthdayDateAndPersonalNumber[0]
    );
    this.personalNumber = birthdayDateAndPersonalNumber[1];

    if (this.dateOfBirth === null || this.personalNumber === null) {
      throw new Error(
        "No dates or personal number provided. Cannot create BackID object."
      );
    }
    this.identityCardNumber = textFormating.getIdentityCardNumber(textORC);
    if (this.identityCardNumber === null) {
      throw new Error(
        "Incorrectly parsed Identity card number. Cannot create BackID object."
      );
    }
    const namesAndSurnames = textFormating.getNameAndSurname(textORC);

    //TODO: current solution delivers data only for only one given name and one surname
    if (!namesAndSurnames || namesAndSurnames.length < 2) {
      throw new Error(
        "Given names or Surnames parsed inncorectly. Cannot create BackID object."
      );
    }
    this.surname = namesAndSurnames[0];
    this.givenNames = namesAndSurnames[1];
    if (this.surname === null || this.givenNames === null) {
      throw new Error(
        "Given name or Surname not found in the text. Cannot create BackID object."
      );
    }
  }
  public getDateOfIssue(): Number | null {
    return this.dateOfIssue;
  }

  public getExpiryDate(): Number | null {
    return this.expiryDate;
  }

  public getPersonalNumber(): string | null {
    return this.personalNumber;
  }

  public getDateOfBirth(): Number | null {
    return this.dateOfBirth;
  }

  public getIdentityCardNumber(): string | null {
    return this.identityCardNumber;
  }

  public getSurname(): string | null {
    return this.surname;
  }

  public getGivenNames(): string | null {
    return this.givenNames;
  }

  public serialization(): string {
    return JSON.stringify(this);
  }
}
