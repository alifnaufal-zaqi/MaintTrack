export function calculateNextMaintenanceDate(interval: number) {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + interval);

  return currentDate.toISOString().split("T")[0];
}
