import * as React from 'react';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/fields/list";

import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { IDiscount } from '../Discount/IDiscount';

const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 300 },
};

interface IState {
    isLoading: Boolean;
    typeOptions: IDropdownOption[];
    discountOptions: IDropdownOption[];
    types: string[];
    discounts: Array<IDiscount>;
}

interface IProps {
    selectedType: string;
    selectedDiscount: IDiscount;
    onChange: Function;
    id: number;
}

export default class SubscriptionUpdateForm extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            typeOptions: [],
            discountOptions: [],
            types: [],
            discounts: []
        };
    }

    public async componentDidMount() {
        try {

            /** subscriptionType Column Availiable Values */
            const subscriptionTypeCol: any = await sp.web.fields.getByTitle("subscriptionType").get();
            /** Discounts List Items */
            const discountsList = await sp.web.lists.getByTitle("Discounts").items
                .select('Title', 'discountNum', 'Id').get();

            const discountOptions : IDropdownOption[] = discountsList.map((item: IDiscount) => {
                return {
                    key: item.Title, 
                    text: item.Title
                };
            });
            discountOptions.push({key: 'None', text: 'None'});
            
            this.setState({
                isLoading: false,
                discountOptions: discountOptions,
                typeOptions: subscriptionTypeCol.Choices.map((item: string) => {
                    return {
                        key: item,
                        text: item
                    };
                }),
                discounts: discountsList,
                types: subscriptionTypeCol.Choices
            });
        }
        catch (err) {
            console.error(err);
        }
    }

    /** Calls Parent Component's function when subscription type has been changed*/
    protected onTypeChange = (event: React.FormEvent<HTMLDivElement>, type: IDropdownOption) => {
        this.props.onChange({
            Id: this.props.id,
            subscriptionType: type.key
        });
    }

    /** Calls Parent Component's function when discount has been changed*/
    protected onDiscountChange = (event: React.FormEvent<HTMLDivElement>, discount: IDropdownOption) => {
        if (discount.key == 'None') 
            this.props.onChange({
                Id: this.props.id,
                discount: null
            });
        let discountObject = { Id: -1 };
        for (const discObj of this.state.discounts) {
            if (discObj.Title == discount.key) discountObject = discObj;
        }
        this.props.onChange({
            Id: this.props.id,
            discount: discountObject
        });
    }

    public render() {
        return <>
            {this.state.isLoading ?
                <Spinner/>
                :
                <form className="changeableContent ms-Grid-col">
                    <Dropdown
                        placeholder="Select the type"
                        defaultSelectedKey={this.props.selectedType}
                        label="Type of subscription"
                        options={this.state.typeOptions}
                        styles={dropdownStyles}
                        onChange={this.onTypeChange}
                    />
                    <Dropdown
                        placeholder="Choose a discount"
                        label="Discount"
                        defaultSelectedKey={this.props.selectedDiscount ? this.props.selectedDiscount.Title : 'Choose a discount'}
                        options={this.state.discountOptions}
                        styles={dropdownStyles}
                        onChange={this.onDiscountChange}
                    /> 
                </form>
            }
        </>;
    }
}