import * as React from 'react';

import { IDiscount } from '../Discount/IDiscount';
import { ISubscriptionItem } from './ISubscriptionItem';
import { SubscriptionTypes } from './SubscriptionTypes';

import { sp } from '@pnp/sp';

import SubscriptionUpdateForm from '../SubscriptionUpdateForm/SubscriptionUpdateForm';


interface IState {
    type: string;
    discount: IDiscount;
}

interface IProps {
    item: ISubscriptionItem;
}

/** Get price coefficient of the Subscription Type*/
function getTypeCoef(type: string) : number {
    switch(type) {
        case 'Single':
            return SubscriptionTypes.Single;
        case 'Couple':
            return SubscriptionTypes.Couple;
        case 'Family':
            return SubscriptionTypes.Family;
        default:
            return SubscriptionTypes.Single;
    }
}


/** Contents of Subscription Pivot Item
 * @component 
 */
export default class Subscription extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            discount: this.props.item.discount,
            type: this.props.item.subscriptionType
        };
    }

    /** Updates Subscription Item in List 
     * @param updatedItem object, containing Subscription Id and one updated field
    */
    protected async updateItem(updatedItem) {
        if ('subscriptionType' in updatedItem) {
            this.setState({
               type: updatedItem.subscriptionType 
            });
            try {
                const upd = await sp.web.lists.getByTitle("Subscriptions").items
                .getById(updatedItem.Id).update(updatedItem);
            }
            catch (err) {
                console.error(err);
            }
        } 
        else {
            this.setState({
                discount: updatedItem.discount
            });
            try {
                const upd = await sp.web.lists.getByTitle("Subscriptions").items
                    .getById(updatedItem.Id).update({discountId: updatedItem.discount.Id});
            }
            catch (err) {
                console.error(err);
            }
        }
    }

    public render() {
        const price = this.props.item.subscriptionPrice;
        /** Subscription price after multiplying by type coefficient and using discount */
        const totalPrice = this.state.discount && this.state.discount.Id !== -1 ? 
            (price * getTypeCoef(this.state.type) - price * this.state.discount.discountNum).toFixed(2)
                :
            (price * getTypeCoef(this.state.type)).toFixed(2);

        return <div className="subscription ms-Grid" style={{marginTop: '1.5rem'}}>
            <div className="unchangeableContent ms-Grid-col" style={{marginRight: '3rem'}}>
                <div className="description" dangerouslySetInnerHTML={{__html: this.props.item.subscriptionDescription}}></div>
                <h3 className="price" style={{fontSize: '2rem', margin: '1rem auto auto'}}>
                    {totalPrice}$
                </h3>
                <div className="responsible"><i>Responsible</i>: {this.props.item.responsible.Title}</div>
            </div>
            <SubscriptionUpdateForm 
                onChange={this.updateItem.bind(this)}
                selectedType={this.state.type}
                selectedDiscount={this.state.discount}
                id={this.props.item.Id}
            />
        </div>;
    }
}

