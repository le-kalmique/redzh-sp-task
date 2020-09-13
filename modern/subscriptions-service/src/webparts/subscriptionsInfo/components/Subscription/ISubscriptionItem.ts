import { IDiscount } from '../Discount/IDiscount';
import { IUser } from '../User/IUser';

/** Subscription Item Interface  */
export interface ISubscriptionItem {
    Title: string;
    subscriptionPrice: number;
    subscriptionDescription: string;
    subscriptionType: string;
    discount: IDiscount;
    responsible: IUser;
    Id: number;
}
