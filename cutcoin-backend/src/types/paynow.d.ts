// src/types/paynow.d.ts

declare module 'paynow' {
    export class Paynow {
      constructor(integrationId: string, integrationKey: string, resultUrl?: string, returnUrl?: string);
      
      resultUrl: string;
      returnUrl: string;
      
      createPayment(reference: string, authEmail: string): Payment;
      send(payment: Payment): Promise<InitResponse>;
      pollTransaction(pollUrl: string): Promise<StatusResponse>;
      processStatusUpdate(payload: any): StatusResponse;
    }
    
    export class Payment {
      constructor(reference: string, authEmail: string);
      
      add(title: string, amount: number): Payment;
      setPhone(phone: string): Payment;
      setMethod(method: string): Payment;
      info(): {
        reference: string;
        authEmail: string;
        items: Array<{title: string, amount: number}>;
        amount: number;
        phone?: string;
        method?: string;
      };
    }
    
    export interface InitResponse {
      success: boolean;
      hasRedirect: boolean;
      redirectUrl?: string;
      pollUrl?: string;
      instructions?: string;
      error?: string;
      status?: string;
    }
    
    export interface StatusResponse {
      reference: string;
      paynowReference: string;
      amount: number;
      status: string;
      paid: boolean;
    }
  }


  