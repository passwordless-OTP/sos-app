// AbuseIPDB service implementation
export class AbuseIPDBService {
  constructor(private apiKey: string) {}
  
  async checkIP(ip: string) {
    // TODO: Implement API call
    return { score: 0, suspicious: false };
  }
}
