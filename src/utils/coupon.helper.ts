export const couponExpired = () => {
  const expirationDate = new Date();
  expirationDate.setMonth(expirationDate.getMonth() + 3);
  return expirationDate;
};
