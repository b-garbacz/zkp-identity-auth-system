import * as textFormating from "./textFormating";
export class FrontID {
  private surname: string | null;
  private givenNames: string | null;
  private familyName: string | null;
  private parentsName: string | null;
  private dateOfBirth: Number | null;

  constructor(textORC: string) {
    if (textORC === null || textORC === undefined) {
      throw new Error("No text provided. Cannot create FrontID object.");
    }
    this.surname = textFormating.stringNormalization(
      textFormating.findDataInRawText(textORC, "NAZWISKO")
    );
    if (this.surname === null) {
      throw new Error(
        "Surname not found in the text. Cannot create FrontID object."
      );
    }
    this.givenNames = textFormating.stringNormalization(
      textFormating.findDataInRawText(textORC, "IMIONA")
    );
    if (this.givenNames === null) {
      throw new Error(
        "Names not found in the text. Cannot create FrontID object."
      );
    }
    this.familyName = textFormating.stringNormalization(
      textFormating.findDataInRawText(textORC, "RODOWE")
    );
    if (this.familyName === null) {
      throw new Error(
        "Family Name not found in the text. Cannot create FrontID object."
      );
    }
    this.parentsName = textFormating.stringNormalizationParentsNames(
      textFormating.findDataInRawText(textORC, "IMIONA RODZICÓW")
    );
    if (this.parentsName === null) {
      throw new Error(
        "Parents names not found in the text. Cannot create FrontID object."
      );
    }
    const _dateOfBirth = textFormating.findDate(textORC);
    if (_dateOfBirth === null) {
      throw new Error(
        "Parents names not found in the text. Cannot create FrontID object."
      );
    }
    this.dateOfBirth = textFormating.dateFormat(_dateOfBirth[0]);
  }
  public getSurname(): string | null {
    return this.surname;
  }

  public getGivenNames(): string | null {
    return this.givenNames;
  }

  public getFamilyName(): string | null {
    return this.familyName;
  }

  public getParentsName(): string | null {
    return this.parentsName;
  }

  public getDateOfBirth(): Number | null {
    return this.dateOfBirth;
  }
  public serialization(): string {
    return JSON.stringify(this);
  }
}
