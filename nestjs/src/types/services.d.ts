import { Asset, Wallet, WalletAsset } from '@prisma/client';
import { InitTransactionDTO } from 'src/modules/orders/order.dto';

export interface IAssetsService {
  create(data: { id: string; symbol: string; price: number }): Promise<Asset>;
  findAll(): Promise<Array<Asset>>;
}

export interface IWalletsService {
  create(data: { id: string }): Promise<Wallet>;
  findAll(): Promise<Array<Wallet>>;
}

export interface IWalletsAssetsService {
  create(data: {
    wallet_id: string;
    asset_id: string;
    shares: number;
  }): Promise<WalletAsset>;
  findAll(data: { id: string }): Promise<Array<WalletAsset>>;
}

export interface IOrdersService {
  initTransaction(data: InitTransactionDTO): Promise<Order>;
  executeTransaction(data: ExecuteTransactionDTO): Promise<void>;
}
