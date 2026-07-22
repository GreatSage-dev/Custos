import { ApproveInput, ApproveOutput } from '../types/custos';

export interface GuardOptions {
  custosApiUrl?: string;
  allowCautionEscrow?: boolean;
}

export class CustosGuard {
  private apiUrl: string;

  constructor(apiUrl: string = 'http://localhost:3000') {
    this.apiUrl = apiUrl;
  }

  async guard<T>(
    params: ApproveInput,
    paymentExecutor: (decision: ApproveOutput) => Promise<T>,
    options?: GuardOptions
  ): Promise<{ decision: ApproveOutput; paymentResult?: T }> {
    const endpoint = `${options?.custosApiUrl || this.apiUrl}/approve`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Custos pre-transaction check failed with HTTP ${response.status}`);
    }

    const decision = (await response.json()) as ApproveOutput;

    if (decision.verdict === 'CAUTION' && decision.recommended_payment === 'escrow' && !options?.allowCautionEscrow) {
      console.warn(`[Custos Guard] Payment intercepted & blocked by Custos decision engine.`);
      return { decision };
    }

    const paymentResult = await paymentExecutor(decision);
    return { decision, paymentResult };
  }
}

export const custos = new CustosGuard();
