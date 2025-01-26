export const generateSlug = (name: string) => {
  return name.toLowerCase().split(" ").join("-");
};
