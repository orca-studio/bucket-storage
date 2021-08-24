export function logError(errorType: string,  err:unknown){
  console.error(`bucket-storage ${errorType} error: ` + err);
}