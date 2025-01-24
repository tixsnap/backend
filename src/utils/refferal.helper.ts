export const generateRefferaCodeUser = (): string => {
  const char: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  const length: number = 8;

  let result: string = "";
  for (let i = 0; i <= length; i++) {
    const randomIndex: number = Math.floor(Math.random() * char.length);
    result += char.charAt(randomIndex);
  }

  return result;
};
