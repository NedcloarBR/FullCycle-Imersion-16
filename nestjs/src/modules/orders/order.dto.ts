import { OrderType } from '@prisma/client';

export class InitTransactionDTO {
  public asset_id: string;
  public wallet_id: string;
  public shares: number;
  public price: number;
  public type: OrderType;
}

export class ExecuteTransactionDTO {
  public order_id: string;
  public status: 'OPEN' | 'CLOSED';
  public related_investor_id: string;
  public broker_transaction_id: string;
  public negotiated_shares: number;
  public price: number;
}
