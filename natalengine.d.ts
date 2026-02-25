declare module 'natalengine' {
  /**
   * Calculates a Western natal chart.
   * 
   * @param birthDate - YYYY-MM-DD (local calendar date of birth)
   * @param birthHour - Decimal hours in local time (e.g. 14.5 = 2:30 PM)
   * @param timezone - UTC offset (e.g. -5 for EST)
   * @param latitude - Optional latitude in decimal degrees
   * @param longitude - Optional longitude in decimal degrees
   */
  export function calculateAstrology(
    birthDate: string,
    birthHour: number,
    timezone: number,
    latitude?: number,
    longitude?: number
  ): any;

  /**
   * Calculates a Human Design chart.
   */
  export function calculateHumanDesign(
    birthDate: string,
    birthHour: number,
    timezone: number
  ): any;

  /**
   * Calculates a Gene Keys profile from Human Design data.
   */
  export function calculateGeneKeys(humanDesignData: any): any;
}

